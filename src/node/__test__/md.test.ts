import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringigy from 'rehype-stringify';
import { describe, expect, test } from 'vitest';
import { rehypePluginPreWrapper } from '../../node/plugin-mdx/rehypePlugins/preWrapper';

describe('Markdown compile cases', () => {
  const processor = unified();
  processor
    .use(remarkParse)
    .use(remarkRehype)
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
    const mdContent = '```javascript\n console.log(123)\n```';
    const result = processor.processSync(mdContent);
    expect(result.value).toMatchInlineSnapshot(`
      "<div class=\\"language-javascript\\"><span class=\\"lang\\">javascript</span><pre><code class=\\"\\"> console.log(123)
      </code></pre></div>"
    `);
  });
});
