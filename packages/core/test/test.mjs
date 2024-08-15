import crypto from 'node:crypto';
import path from 'node:path';

import uploadAssetsToCdn from '../dist/index.js';

export const markUrl =
  'https://search-operate.cdn.bcebos.com/e8cbce1d53432a6950071bf26b640e2b.gif';
export const notNeedUploadMarkUrl =
  'https://md-pic-lib.oss-cn-hangzhou.aliyuncs.com/img/微信图片_20240531212400.png';
export const include = ['../assets/7.webp', '@/assets/7.webp'];
export const exclude = ['../assets/8.png', '@/assets/8.png'];

export async function setup() {
  await uploadAssetsToCdn({
    async upload({ fileName }) {
      const fileExt = path.extname(fileName);
      const basicFileName = path.basename(fileName, fileExt);
      const fileMD5Name = crypto
        .createHash('md5')
        .update(basicFileName)
        .digest('hex');
      console.log('fileMD5Name: ', fileMD5Name);

      return Promise.resolve({ url: markUrl });
    },
    exclude: exclude,
    globbyPatternStr: 'src/test-files-copy/*.{vue,css,less,scss,sass}',
  });
}
