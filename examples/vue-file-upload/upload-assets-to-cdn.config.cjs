const axios = require("axios");
const FormData = require('form-data');
const crypto = require('node:crypto');
const path = require('node:path');
const uploadAssetsToCdn = require('upload-assets-to-cdn');

// function generateRandomNumber() {
//   return Math.floor(Math.random() * 90000000) + 10000000;
// }

uploadAssetsToCdn({
  async upload({ fileSource, fileName, fileType, filePath }) {
    const fileExt = path.extname(fileName);
    const basicFileName = path.basename(fileName, fileExt);
		const fileMD5Name = crypto.createHash('md5').update(basicFileName).digest('hex');

    const formData = new FormData();
    formData.append('systemCode', 'PHARMACY');
    formData.append('belongCode', 'RP');
    // formData.append('belongID', `210304103256552626${generateRandomNumber()}`)
    // formData.append('belongID', fileMD5Name);
    formData.append('file', fileSource, {
      filename: fileName,
      contentType: fileType,
    });

    try {
      const response = await axios.post('https://file.xxxxxxx.com/api/upload/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response?.data?.data?.remoteAddress) {
        return { url: response?.data?.data?.remoteAddress };
      }

      return { url: '' };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { url: '' };
    }
  },
  exclude: ['@/assets/8.png']
});