import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, expect, it } from 'vitest';

import {
  exclude,
  include,
  markUrl,
  notNeedUploadMarkUrl,
  setup,
} from './test.mjs';

describe('Check if file contains specific string but excludes others', () => {
  it('should contain the specific URL and not contain excluded strings', async () => {
    await setup();

    const filePath = resolve(__dirname, './src/test-files-copy/app.vue');
    const fileContent = readFileSync(filePath, 'utf8');

    // 断言文件内容包含指定字符串
    expect(fileContent).toContain(markUrl);
    expect(fileContent).toContain(notNeedUploadMarkUrl);
    expect(fileContent).toContain(exclude[0]);
    expect(fileContent).toContain(exclude[1]);

    // 断言文件内容不包含指定字符串
    expect(fileContent).not.toContain(include[0]);
    expect(fileContent).not.toContain(include[1]);
  });
});
