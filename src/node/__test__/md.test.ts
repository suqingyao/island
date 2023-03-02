import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringigy from 'rehype-stringify';
import { describe, expect, test } from 'vitest';

describe('Markdown compile cases', () => {
  const processor = unified();
  processor.use(remarkParse).use(remarkRehype).use(rehypeStringigy);

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
});
