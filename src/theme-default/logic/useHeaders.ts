import { useEffect, useState } from 'react';
import { Header } from 'shared/types';

export function useHeaders(initHeaders: Header[]) {
  const [headers, setHeaders] = useState(initHeaders);

  useEffect(() => {
    if (import.meta.env.DEV) {
      import.meta.hot.on(
        'mdx-changed',
        ({ filePath }: { filePath: string }) => {
          console.log('更新的文件路径：', filePath);
          import(`/* @vite-ignore */${filePath}?import&${Date.now()}`).then(
            (module) => {
              setHeaders(module.toc);
            }
          );
        }
      );
    }
  });

  return headers;
}
