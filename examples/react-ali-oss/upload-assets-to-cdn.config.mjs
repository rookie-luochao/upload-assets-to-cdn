import OSS from 'ali-oss';
import crypto from 'node:crypto';
import path from 'node:path';
import uploadAssetsToCdn from 'upload-assets-to-cdn';

const client = new OSS({
  region: 'oss-cn-shanghai',
  bucket: 'my-pic-lib',
  accessKeyId: '',
  accessKeySecret: '',
});

uploadAssetsToCdn({
  async upload({ fileSource, fileName }) {
    const fileExtName = path.extname(fileName);
    const basicFileName = path.basename(fileName, fileExtName);
    const fileMD5Name = crypto
      .createHash('md5')
      .update(basicFileName)
      .digest('hex');

    return client.put(`project-xxxx/${fileMD5Name}`, fileSource);
  },
});
