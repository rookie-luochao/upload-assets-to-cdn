import fs from 'node:fs/promises';
import { basename, extname, join, resolve } from 'node:path';
import sharp, { FormatEnum } from 'sharp';

import {
  ICompressInfo,
  IExtNameType,
  IUploadAssetsToCdnOptions,
  IUploadItem,
} from '.';

function isAssetMatch(
  name: string,
  exclude: IUploadAssetsToCdnOptions['exclude']
): boolean {
  if (Object.prototype.toString.call(exclude) === '[object String]') {
    return name === exclude;
  }

  if (Object.prototype.toString.call(exclude) === '[object RegExp]') {
    return (exclude as RegExp).test(name);
  }

  if (Array.isArray(exclude)) {
    return exclude.includes(name);
  }

  return false;
}

export function checkAsset(
  value: string,
  exclude?: IUploadAssetsToCdnOptions['exclude']
) {
  if (exclude && isAssetMatch(value, exclude)) {
    return false;
  }

  return true;
}

export function getCacheKey(absolutePath: string) {
  if (!absolutePath) {
    return '';
  }

  const paths = process.cwd().split('/');
  const projectName = paths[paths.length - 1];
  const index = absolutePath.indexOf(projectName);

  if (~index) {
    return absolutePath.slice(index);
  }

  return '';
}

export async function getCache() {
  const filePath = join(process.cwd(), 'upload-cdn-cache.json');
  let cache = {} as Record<string, string>;

  try {
    await fs.access(filePath, fs.constants.F_OK);
    const data = await fs.readFile(filePath, 'utf8');

    cache = JSON.parse(data || '{}') as Record<string, string>;
  } catch (err: unknown) {
    if ((err as { code: string }).code === 'ENOENT') {
      const dataToWrite = JSON.stringify(cache, null, 2);

      await fs.writeFile(filePath, dataToWrite, 'utf8');
    } else {
      console.error('error: ', err);
    }
  }

  return cache;
}

export async function updateCache(newCache: Record<string, string>) {
  const filePath = join(process.cwd(), 'upload-cdn-cache.json');

  try {
    const updatedJsonData = JSON.stringify(newCache, null, 2);

    await fs.access(filePath, fs.constants.F_OK);
    await fs.writeFile(filePath, updatedJsonData, 'utf8');
  } catch (err: unknown) {
    console.error('error: ', err);
  }
}

function getFileType(filePath: string) {
  return (
    {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      bmp: 'image/bmp',
      webp: 'image/webp',
    }[extname(filePath).slice(1).toLowerCase()] || ''
  );
}

export async function readAssertAsBuffer(filePath: string) {
  if (!filePath) {
    return {
      fileSource: null,
      fileName: '',
      fileType: '',
    };
  }

  try {
    const buffer = await fs.readFile(filePath);
    const fileName = basename(filePath);
    const fileType = getFileType(filePath);

    return {
      fileSource: buffer,
      fileName,
      fileType,
    };
  } catch (err) {
    console.error('Error reading the file:', err);

    return {
      fileSource: null,
      fileName: '',
      fileType: '',
    };
  }
}

export function getAbsolutePathByAlias(props: {
  assetPath: string;
  alias?: Record<string, string>;
}) {
  const {
    assetPath,
    alias = {
      '@': './src',
    },
  } = props;
  const aliasKey = assetPath.split('/')[0];
  const absolutePath = resolve(
    process.cwd(),
    assetPath.replace(aliasKey, alias[aliasKey])
  );

  return absolutePath;
}

export async function compressAsset(
  props: {
    uploadItem: IUploadItem;
    compressInfo: ICompressInfo;
  } & Pick<IUploadAssetsToCdnOptions, 'compressOptions'>
) {
  const { uploadItem, compressInfo, compressOptions } = props;
  const { fileName, fileSource } = uploadItem;
  const extName = extname(fileName).slice(1).toLowerCase();

  if (!fileSource) {
    return;
  }

  const res = await sharp(fileSource)
    .toFormat(
      extName as keyof FormatEnum,
      compressOptions ? compressOptions[extName as IExtNameType] : undefined
    )
    .toBuffer()
    .then((buffer) => {
      const oldSize: number = fileSource.byteLength || 0;
      const newSize: number = buffer.byteLength || 0;

      compressInfo.oldSize = oldSize;
      compressInfo.newSize = newSize;

      if (newSize < oldSize) {
        uploadItem.fileSource = buffer;
      }
    });

  return res;
}

export function getCompressMessage(compressInfo: ICompressInfo) {
  return compressInfo.oldSize > compressInfo.newSize
    ? `, compress: ${compressInfo.oldSize} -> ${compressInfo.newSize}`
    : ', compress: none';
}
