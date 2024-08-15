# 介绍

[![GitHub Repo stars](https://img.shields.io/github/stars/rookie-luochao/upload-assets-to-cdn?style=social)](https://github.com/rookie-luochao/upload-assets-to-cdn) [![npm (scoped)](https://img.shields.io/npm/v/upload-assets-to-cdn)](https://www.npmjs.com/package/upload-assets-to-cdn) ![GitHub tag](https://img.shields.io/github/v/tag/rookie-luochao/upload-assets-to-cdn?include_prereleases)

一个帮助你上传静态资源到 CDN 的插件，上传成功后用 CDN 地址自动替换掉源代码引用，默认支持静态资源压缩

## 功能

- 支持 阿里云、腾讯云、七牛云等等 oss 客户端，支持普通 http 文件上传接口
- 支持 png | jpg | jpeg | gif | svg | bmp | webp 格式的静态资源，可自定义需要上传的静态资源
- 支持静态资源压缩、压缩日志、自定义压缩配置
- 支持解析通过 alias 引用的静态资源
- 支持任何前端构建工具环境使用
- 支持静态资源上传结果缓存，避免重复上传
- 支持上传成功后，同步删除本地的静态资源

## 使用

```bash
# npm
npm i upload-assets-to-cdn --save-dev

# pnpm
pnpm i upload-assets-to-cdn -D
```

### 通过 oss 客户端进行上传

在`项目根目录`新建 `upload-assets-to-cdn.config.mjs`

```mjs
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
```

在 `package.json` 的 `script` 中添加命令: `"upload-assets-to-cdn": "node ./upload-assets-to-cdn.config.mjs"`

生成结果：

```bash
npm run upload-assets-to-cdn
```

### 通过 http 文件上传接口进行上传

在`项目根目录`新建 `upload-assets-to-cdn.config.cjs`

```js
const axios = require('axios');
const FormData = require('form-data');
const crypto = require('node:crypto');
const path = require('node:path');

uploadAssetsToCdn({
  async upload({ fileSource, fileName, fileType, filePath }) {
    const fileExt = path.extname(fileName);
    const basicFileName = path.basename(fileName, fileExt);
    const fileMD5Name = crypto
      .createHash('md5')
      .update(basicFileName)
      .digest('hex');

    const formData = new FormData();
    formData.append('systemCode', 'PHARMACY');
    formData.append('belongCode', 'RP');
    formData.append('belongID', fileMD5Name);
    formData.append('file', fileSource, {
      filename: fileName,
      contentType: fileType,
    });

    try {
      const response = await axios.post(
        'https://file.xxxxxxx.com/api/upload/file',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response?.data?.data?.remoteAddress) {
        return { url: response?.data?.data?.remoteAddress };
      }

      return { url: '' };
    } catch (error) {
      console.error('Error uploading file:', error);
      return { url: '' };
    }
  },
});
```

在 `package.json` 的 `script` 中添加命令: `"upload-assets-to-cdn": "node ./upload-assets-to-cdn.config.cjs"`

生成结果：

```bash
npm run upload-assets-to-cdn
```

## 参数

| 属性 | 必填 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- | --- |
| upload | 是 | (uploadItem: IUploadItem) => Promise<{ url: string }> | - | 自定义如何上传文件 |
| exclude | 否 | RegExp \| string \| string[] | - | 自定义需要排除的静态资源，例如："@/assets/logo.png" |
| isLog | 否 | boolean | true | 是否启用上传日志 |
| isCache | 否 | boolean | true | 是否缓存已上传的静态资源 |
| isCompress | 否 | boolean | true | 是否启用静态资源压缩功能 |
| isDeleteOriginAsset | 否 | boolean | false | 上传成功后，是否删除原始的静态资源文件 |
| alias | 否 | Record<string, string> | { '@': './src' } | 别名规则 |
| compressOptions | 否 | Record<"png" \| "jpg" \| "jpeg" \| "gif" \| "webp", PngOptions \| JpegOptions \| GifOptions \| WebpOptions> | - | sharp静态资源压缩配置参数 |
| excludeCompressFileType | 否 | string[] | ['svg', 'bmp'] | 自定义不需要压缩的静态资源类型 |
| globbyPatternStr | 否 | string | 'src/\*_/_.{js,jsx,ts,tsx,vue,css,less,scss,sass}' | 待扫描文件的匹配规则 |
| assetPattern | 否 | RegExp | '.{png,jpg,jpeg,gif,svg,bmp,webp}' | 自定义需要上传的静态资源 |
| sourceCodeDirectory | 否 | string | 'src' | 自定义应用源代码目录 |

- sharp 静态资源压缩配置[文档地址](https://sharp.pixelplumbing.com/api-output#jpeg)
- globby 文件匹配规则[文档地址](https://github.com/sindresorhus/globby)

## FAQ

##### 为什么在 jsx 文件中无法正常工作，如何兼容？

由于在 jsx 文件中，不支持 `<img src="../assets/logo.png" />` 这种相对路径引入静态资源的方式，所以通常会使用 `import Logo from '../assets/logo.png'` 这种方式引入静态资源，使用该插件自动上传 CDN 后，代码会变成 `import Logo from 'https://cdn.xxxx.com/logo.png'`，这样就会造成代码错误，所以 React 项目中，要想该插件能正常使用，你需要改变静态资源引入方式为：`<img src="src/assets/logo.png" />`，或者你手动将`import Logo from 'https://cdn.xxxx.com/logo.png'`中的 CDN 地址回填到代码对应的引用中

## 贡献

### 环境要求

- node 18+
- pnpm 9+

### 提交 Pull Request

1. 熟悉 [Pull Request]("https://help.github.com/articles/using-pull-requests") 规范
2. fork 此仓库
3. 开一个新分支修改代码：`git checkout -b my-branch main`
4. 确保你的代码可以通过所有测试用例(新增功能需要添加新的功能测试用例)：`pnpm test`
5. 创建 changeset 文件通过命令：`pnpm changeset`
6. 使用 commit 提交你的修改(需遵循 commitlint 规范)
7. 发起 Pull Request

## License

[MIT](https://github.com/rookie-luochao/upload-assets-to-cdn/blob/main/LICENSE)
