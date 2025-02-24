import { dirname, join, basename } from 'path';
import { getSourceFile } from '../routing/source-file';
import type { NormalizedPluginOptions } from '../types';
import { getExtension, getPathnameFromDirPath, isMarkdownExt, normalizePath } from '../../utils/fs';
import { existsSync } from 'fs';
import { isSameOriginUrl } from '../../utils/pathname';

export function getMarkdownRelativeUrl(
  opts: NormalizedPluginOptions,
  containingFilePath: string,
  url: string,
  checkFileExists?: boolean
) {
  if (typeof url !== 'string' || !isSameOriginUrl(url)) {
    return url;
  }

  const querySplit = url.split('?');
  const hashSplit = url.split('#');
  const strippedUrl = url.split('?')[0].split('#')[0];

  if (isMarkdownExt(getExtension(strippedUrl))) {
    const isAbsolute = strippedUrl.startsWith('/');
    const parts = normalizePath(strippedUrl)
      .split('/')
      .filter((p) => p.length > 0);

    const filePath = isAbsolute
      ? join(opts.routesDir, ...parts)
      : join(dirname(containingFilePath), ...parts);

    if (checkFileExists) {
      if (!existsSync(filePath)) {
        console.warn(
          `\nThe link "${url}", found within "${containingFilePath}" does not have a matching source file.\n`
        );
      }
    }

    const fileName = basename(filePath);
    const sourceFileName = getSourceFile(fileName);
    if (sourceFileName) {
      const mdDirPath = dirname(filePath);
      let pathname = getPathnameFromDirPath(opts, mdDirPath);
      if (querySplit.length > 1) {
        pathname += '?' + querySplit[1];
      } else if (hashSplit.length > 1) {
        pathname += '#' + hashSplit[1];
      }
      return pathname;
    }
  }

  return url;
}
