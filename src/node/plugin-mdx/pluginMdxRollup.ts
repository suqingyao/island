import pluginMdx from '@mdx-js/rollup';
import remarkGFM from 'remark-gfm';
import rehypeAutolinkHeading from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';

export function pluginMdxRollup() {
  return [
    pluginMdx({
      remarkPlugins: [
        remarkGFM,
        remarkFrontmatter,
        [
          remarkMdxFrontmatter,
          {
            name: 'frontmatter'
          }
        ]
      ],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypeAutolinkHeading,
          {
            properties: {
              class: 'head-anchor'
            },
            content: {
              type: 'text',
              value: '#'
            }
          }
        ]
      ]
    })
  ];
}
