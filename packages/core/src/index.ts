import chalk from 'chalk';
import globby from 'globby';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import { dirname, extname, resolve } from 'node:path';
import { GifOptions, JpegOptions, PngOptions, WebpOptions } from 'sharp';

import {
  checkAsset,
  compressAsset,
  getAbsolutePathByAlias,
  getCache,
  getCacheKey,
  getCompressMessage,
  readAssertAsBuffer,
  updateCache,
} from './util';

export interface IUploadItem {
  filePath: string;
  fileSource: Uint8Array | null;
  fileName: string;
  fileType: string;
}

export interface ICompressInfo {
  oldSize: number;
  newSize: number;
}

export type IExtNameType = 'png' | 'jpg' | 'jpeg' | 'gif' | 'webp';

export interface IUploadAssetsToCdnOptions {
  upload: (uploadItem: IUploadItem) => Promise<{ url: string }>;
  exclude?: RegExp | string | string[];
  isLog?: boolean;
  isCache?: boolean;
  isCompress?: boolean;
  isDeleteOriginAsset?: boolean;
  alias?: Record<string, string>;
  compressOptions?: Record<
    IExtNameType,
    PngOptions | JpegOptions | GifOptions | WebpOptions
  >;
  excludeCompressFileType?: string[];
  globbyPatternStr?: string;
  assetPattern?: RegExp;
  sourceCodeDirectory?: string;
}

const defaultGlobbyPatternStr =
  'src/**/*.{js,jsx,ts,tsx,vue,css,less,scss,sass}';
const defaultAssetPattern =
  /['"](?!https?:\/\/)(?!\/)([^'"]+\.(?:png|jpe?g|gif|svg|bmp|webp))['"]/g;

export default async function uploadAssetsToCdn(
  options: IUploadAssetsToCdnOptions
) {
  const {
    upload,
    exclude,
    isLog = true,
    isCache = true,
    isCompress = true,
    isDeleteOriginAsset = false,
    alias,
    compressOptions,
    excludeCompressFileType = ['svg', 'bmp'],
    globbyPatternStr = defaultGlobbyPatternStr,
    assetPattern = defaultAssetPattern,
    sourceCodeDirectory = 'src',
  } = options;
  let imgMap = {} as Record<string, string>;

  async function processFiles() {
    const files = await globby(globbyPatternStr);

    if (isCache) {
      imgMap = await getCache();
    }

    for (const filePath of files) {
      let content = await readFile(filePath, 'utf8');
      let match;
      let isMatched = false;

      while ((match = assetPattern.exec(content)) !== null) {
        const assetPath = match[1];

        if (checkAsset(assetPath, exclude)) {
          isMatched = true;
          let absolutePath = '';

          if (assetPath.startsWith('@')) {
            absolutePath = getAbsolutePathByAlias({ assetPath, alias });
          } else if (assetPath.startsWith(sourceCodeDirectory)) {
            absolutePath = resolve(process.cwd(), assetPath);
          } else {
            absolutePath = resolve(dirname(filePath), assetPath);
          }

          const cacheKey = getCacheKey(absolutePath);
          const uploadedCdnUrl = imgMap[cacheKey];

          try {
            if (uploadedCdnUrl) {
              content = content.replace(assetPath, uploadedCdnUrl);

              console.info(
                chalk.blueBright(
                  `(cache) ${cacheKey} => ${uploadedCdnUrl} in ${filePath}`
                )
              );
            } else {
              const fileInfo = await readAssertAsBuffer(absolutePath);
              const uploadItem = {
                filePath: absolutePath,
                ...(fileInfo || {}),
              };
              const compressInfo = { oldSize: 0, newSize: 0 } as ICompressInfo;

              if (
                isCompress &&
                !excludeCompressFileType.includes(
                  extname(uploadItem.fileName).slice(1)
                )
              ) {
                await compressAsset({
                  uploadItem,
                  compressInfo,
                  compressOptions,
                });
              }

              const res = await upload(uploadItem);

              if (res?.url) {
                content = content.replace(assetPath, res.url);
                imgMap[cacheKey] = res.url;

                if (isLog) {
                  console.info(
                    chalk.greenBright(
                      `(success) ${cacheKey} => ${res?.url} in ${filePath}${isCompress && getCompressMessage(compressInfo)}`
                    )
                  );
                }

                if (isDeleteOriginAsset) {
                  unlink(absolutePath).catch((err) => {
                    console.error('Failed to delete file: ', err);
                  });
                }
              }
            }
          } catch (error) {
            console.error(
              chalk.redBright(`Failed to upload ${cacheKey} to CDN: `, error)
            );
          }
        }
      }

      if (isMatched) {
        writeFile(filePath, content).catch((err) => {
          console.error('Failed to writing file: ', err);
        });
      }
    }

    if (isCache) {
      void updateCache(imgMap);
    }
  }

  await processFiles();
}
