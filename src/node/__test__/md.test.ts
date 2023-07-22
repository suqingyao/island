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
    const mdContent = '```javascript\n console.log("island")\n```';

    const result = processor.processSync(mdContent);
    expect(result.value).toMatchInlineSnapshot(
      '"<p>I am use <code>island.js</code></p>"'
    );
  });

  test('Compile Toc', () => {
    const remarkProcessor = unified()
      .use(remarkParse)
      .use(remarkMdx)
      .use(remarkPluginToc)
      .use(remarkStringify);

    const mdContent = `
      # h1
      ## h2
      ### h3
      #### h4
      ##### h5
    `;
    const result = remarkProcessor.processSync(mdContent);

    expect(result.value.toString().replace(mdContent, ''))
      .toMatchInlineSnapshot(`
      "# h1

      ## h2

      ### h3

      #### h4

      ##### h5

      export const toc = [
        {
          \\"id\\": \\"h2\\",
          \\"text\\": \\"h2\\",
          \\"depth\\": 2
        },
        {
          \\"id\\": \\"h3\\",
          \\"text\\": \\"h3\\",
          \\"depth\\": 3
        },
        {
          \\"id\\": \\"h4\\",
          \\"text\\": \\"h4\\",
          \\"depth\\": 4
        }
      ]

      export const title = 'h1'
      "
    `);
  });
});
