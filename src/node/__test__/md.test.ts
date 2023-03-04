import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringigy from 'rehype-stringify';
import { describe, expect, test } from 'vitest';
import { rehypePluginPreWrapper } from '../../node/plugin-mdx/rehypePlugins/preWrapper';
import { rehypePluginShiki } from '../../node/plugin-mdx/rehypePlugins/shiki';
import shiki from 'shiki';
import remarkMdx from 'remark-mdx';
import remarkStringify from 'remark-stringify';
import { remarkPluginToc } from '../../node/plugin-mdx/remarkPlugins/toc';

describe('Markdown compile cases', async () => {
  const processor = unified();
  processor
    .use(remarkParse)
    .use(remarkRehype)
    .use(rehypePluginShiki, {
      highlighter: await shiki.getHighlighter({
        theme: 'vitesse-dark'
      })
    })
    .use(rehypeStringigy)
    .use(rehypePluginPreWrapper);

  test('Compile title', () => {
    const mdContent = '# 123';
    const result = processor.processSync(mdContent);
    expect(result.value).toMatchInlineSnapshot('"<h1>123</h1>"');
  });

  test('Compile code', () => {
    const mdContent = 'I am use `island.js`';
    const result = processor.processSync(mdContent);
    expect(result.value).toMatchInlineSnapshot(
      '"<p>I am use <code>island.js</code></p>"'
    );
  });

  test('Compile code block', () => {
    const mdContent = '```js\nconsole.log(123);\n```';
    const result = processor.processSync(mdContent);
    expect(result.value).toMatchInlineSnapshot();
  });

  test('Compile Toc', () => {
    const remarkProcessor = unified()
      .use(remarkParse)
      .use(remarkMdx)
      .use(remarkPluginToc)
      .use(remarkStringify);

    const mdContent = '## title';

    const result = remarkProcessor.processSync(mdContent);

    expect(result.value.toString().replace(mdContent, ''))
      .toMatchInlineSnapshot(`
      "

      export const toc = [
        {
          \\"id\\": \\"title\\",
          \\"text\\": \\"title\\",
          \\"depth\\": 2
        }
      ]
      "
    `);
  });
});
