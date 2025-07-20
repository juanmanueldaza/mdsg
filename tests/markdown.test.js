// Tests for markdown parsing functionality
import { describe, it, expect, beforeEach } from 'vitest';

let MDSG;

describe('Markdown Parsing', () => {
  beforeEach(async () => {
    // Dynamic import to ensure proper setup
    const module = await import('../src/main.js');
    MDSG = module.default || module.MDSG;
  });

  describe('Basic Text Formatting', () => {
    let mdsg;

    beforeEach(() => {
      mdsg = new MDSG();
    });

    it('should parse bold text correctly', () => {
      const markdown = '**bold text**';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<strong>bold text</strong>');
    });

    it('should parse italic text correctly', () => {
      const markdown = '*italic text*';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<em>italic text</em>');
    });

    it('should parse strikethrough text correctly', () => {
      const markdown = '~~strikethrough text~~';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<del>strikethrough text</del>');
    });

    it('should parse inline code correctly', () => {
      const markdown = 'This is `inline code`';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<code>inline code</code>');
    });

    it('should handle mixed formatting', () => {
      const markdown = '**Bold** and *italic* and ~~strikethrough~~ and `code`';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<strong>Bold</strong>');
      expect(html).toContain('<em>italic</em>');
      expect(html).toContain('<del>strikethrough</del>');
      expect(html).toContain('<code>code</code>');
    });
  });

  describe('Headers', () => {
    let mdsg;

    beforeEach(() => {
      mdsg = new MDSG();
    });

    it('should parse H1 headers with IDs', () => {
      const markdown = '# Main Title';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<h1 id="main-title">Main Title</h1>');
    });

    it('should parse H2 headers with IDs', () => {
      const markdown = '## Section Title';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<h2 id="section-title">Section Title</h2>');
    });

    it('should parse H3 headers with IDs', () => {
      const markdown = '### Subsection Title';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<h3 id="subsection-title">Subsection Title</h3>');
    });

    it('should generate valid IDs from complex titles', () => {
      const markdown = '# My Awesome Title with Numbers 123!';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<h1 id="my-awesome-title-with-numbers-123">');
    });

    it('should handle multiple headers', () => {
      const markdown = '# Title 1\n\n## Title 2\n\n### Title 3';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<h1 id="title-1">Title 1</h1>');
      expect(html).toContain('<h2 id="title-2">Title 2</h2>');
      expect(html).toContain('<h3 id="title-3">Title 3</h3>');
    });
  });

  describe('Lists', () => {
    let mdsg;

    beforeEach(() => {
      mdsg = new MDSG();
    });

    it('should parse unordered lists', () => {
      const markdown = '- Item 1\n- Item 2\n- Item 3';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<ul>');
      expect(html).toContain('<li data-level="0">Item 1</li>');
      expect(html).toContain('<li data-level="0">Item 2</li>');
      expect(html).toContain('<li data-level="0">Item 3</li>');
      expect(html).toContain('</ul>');
    });

    it('should parse ordered lists', () => {
      const markdown = '1. First item\n2. Second item\n3. Third item';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<ol>');
      expect(html).toContain('<li data-level="0">First item</li>');
      expect(html).toContain('<li data-level="0">Second item</li>');
      expect(html).toContain('<li data-level="0">Third item</li>');
      expect(html).toContain('</ol>');
    });

    it('should handle nested lists', () => {
      const markdown = '- Item 1\n  - Nested item\n- Item 2';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<li data-level="0">Item 1</li>');
      expect(html).toContain('<li data-level="1">Nested item</li>');
      expect(html).toContain('<li data-level="0">Item 2</li>');
    });
  });

  describe('Code Blocks', () => {
    let mdsg;

    beforeEach(() => {
      mdsg = new MDSG();
    });

    it('should parse code blocks without language', () => {
      const markdown = '```\nconst x = 1;\nconsole.log(x);\n```';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<div class="code-block">');
      expect(html).toContain('<span class="code-language">text</span>');
      expect(html).toContain('const x = 1;');
    });

    it('should parse JavaScript code blocks with highlighting', () => {
      const markdown =
        '```javascript\nfunction hello() {\n  console.log("Hello");\n}\n```';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<div class="code-block">');
      expect(html).toContain('<span class="code-language">javascript</span>');
      expect(html).toContain('<span class="keyword">function</span>');
      expect(html).toContain('<span class="string">"Hello"</span>');
      expect(html).toContain('<button class="copy-code-btn"');
    });

    it('should parse HTML code blocks with highlighting', () => {
      const markdown =
        '```html\n<div class="container">\n  <p>Hello</p>\n</div>\n```';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<span class="code-language">html</span>');
      expect(html).toContain('<span class="tag">');
    });

    it('should parse CSS code blocks with highlighting', () => {
      const markdown = '```css\n.container {\n  color: #ff0000;\n}\n```';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<span class="code-language">css</span>');
      expect(html).toContain('<span class="property">color</span>');
      expect(html).toContain('<span class="color">#ff0000</span>');
    });

    it('should parse JSON code blocks with highlighting', () => {
      const markdown =
        '```json\n{\n  "name": "test",\n  "value": 123,\n  "active": true\n}\n```';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<span class="code-language">json</span>');
      expect(html).toContain('<span class="property">"name"</span>');
      expect(html).toContain('<span class="string">"test"</span>');
      expect(html).toContain('<span class="number">123</span>');
      expect(html).toContain('<span class="keyword">true</span>');
    });

    it('should generate unique IDs for code blocks', () => {
      const markdown = '```javascript\nconsole.log("test");\n```';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toMatch(/id="code-[a-z0-9]+"/);
    });
  });

  describe('Tables', () => {
    let mdsg;

    beforeEach(() => {
      mdsg = new MDSG();
    });

    it('should parse simple tables', () => {
      const markdown =
        '| Name | Age |\n|------|-----|\n| John | 25 |\n| Jane | 30 |';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<table class="markdown-table">');
      expect(html).toContain('<thead>');
      expect(html).toContain('<tbody>');
      expect(html).toContain('<th>Name</th>');
      expect(html).toContain('<th>Age</th>');
      expect(html).toContain('<td>John</td>');
      expect(html).toContain('<td>25</td>');
      expect(html).toContain('<td>Jane</td>');
      expect(html).toContain('<td>30</td>');
    });

    it('should handle tables with multiple columns', () => {
      const markdown =
        '| Col1 | Col2 | Col3 | Col4 |\n|------|------|------|------|\n| A | B | C | D |';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<th>Col1</th>');
      expect(html).toContain('<th>Col2</th>');
      expect(html).toContain('<th>Col3</th>');
      expect(html).toContain('<th>Col4</th>');
      expect(html).toContain('<td>A</td>');
      expect(html).toContain('<td>B</td>');
      expect(html).toContain('<td>C</td>');
      expect(html).toContain('<td>D</td>');
    });

    it('should handle tables with formatted content', () => {
      const markdown =
        '| Name | Description |\n|------|-------------|\n| **Bold** | *Italic* text |\n| `Code` | Normal text |';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<td>**Bold**</td>');
      expect(html).toContain('<td>*Italic* text</td>');
      expect(html).toContain('<td>`Code`</td>');
    });
  });

  describe('Links and Images', () => {
    let mdsg;

    beforeEach(() => {
      mdsg = new MDSG();
    });

    it('should parse links correctly', () => {
      const markdown = '[GitHub](https://github.com)';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain(
        '<a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>',
      );
    });

    it('should parse images correctly', () => {
      const markdown = '![Alt text](https://example.com/image.jpg)';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain(
        '<img src="https://example.com/image.jpg" alt="Alt text" class="markdown-image" loading="lazy" />',
      );
    });

    it('should handle links with complex URLs', () => {
      const markdown =
        '[Complex Link](https://example.com/path?param=value&other=123#anchor)';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain(
        'href="https://example.com/path?param=value&other=123#anchor"',
      );
    });

    it('should handle images with empty alt text', () => {
      const markdown = '![](https://example.com/image.jpg)';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('alt=""');
    });
  });

  describe('Blockquotes', () => {
    let mdsg;

    beforeEach(() => {
      mdsg = new MDSG();
    });

    it('should parse blockquotes', () => {
      const markdown = '> This is a blockquote';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<blockquote>This is a blockquote</blockquote>');
    });

    it('should handle multi-line blockquotes', () => {
      const markdown = '> Line 1\n> Line 2\n> Line 3';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<blockquote>Line 1</blockquote>');
      expect(html).toContain('<blockquote>Line 2</blockquote>');
      expect(html).toContain('<blockquote>Line 3</blockquote>');
    });
  });

  describe('Emojis', () => {
    let mdsg;

    beforeEach(() => {
      mdsg = new MDSG();
    });

    it('should convert emoji shortcuts to emojis', () => {
      const markdown = 'Hello :smile: world :rocket:';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('😊');
      expect(html).toContain('🚀');
    });

    it('should handle multiple emoji types', () => {
      const markdown = ':heart: :thumbsup: :fire: :star: :check: :x:';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('❤️');
      expect(html).toContain('👍');
      expect(html).toContain('🔥');
      expect(html).toContain('⭐');
      expect(html).toContain('✅');
      expect(html).toContain('❌');
    });

    it('should not convert invalid emoji shortcuts', () => {
      const markdown = ':invalid: :notanemoji:';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain(':invalid:');
      expect(html).toContain(':notanemoji:');
    });
  });

  describe('HTML Escaping', () => {
    let mdsg;

    beforeEach(() => {
      mdsg = new MDSG();
    });

    it('should escape HTML in text content', () => {
      const text = '<script>alert("xss")</script>';
      const escaped = mdsg.escapeHtml(text);
      expect(escaped).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;');
    });

    it('should escape special characters', () => {
      const text = '< > & " \'';
      const escaped = mdsg.escapeHtml(text);
      expect(escaped).toBe('&lt; &gt; &amp; " \'');
    });

    it('should handle code block escaping', () => {
      const markdown = '```html\n<script>alert("test")</script>\n```';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('&lt;script&gt;');
      expect(html).not.toContain('<script>');
    });
  });

  describe('Complex Markdown', () => {
    let mdsg;

    beforeEach(() => {
      mdsg = new MDSG();
    });

    it('should parse complex markdown document', () => {
      const markdown = `# Main Title

This is a **bold** statement with *italic* text.

## Features

- Feature 1 with \`inline code\`
- Feature 2 with [link](https://example.com)
- Feature 3 with ~~strikethrough~~

### Code Example

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
\`\`\`

| Feature | Status |
|---------|--------|
| Auth | ✅ Done |
| Editor | 🔄 In Progress |

> This is a blockquote with **bold** text.

![Sample Image](https://example.com/image.jpg)

That's all! :rocket:`;

      const html = mdsg.markdownToHTML(markdown);

      // Check various elements are present
      expect(html).toContain('<h1 id="main-title">Main Title</h1>');
      expect(html).toContain('<strong>bold</strong>');
      expect(html).toContain('<em>italic</em>');
      expect(html).toContain('<h2 id="features">Features</h2>');
      expect(html).toContain('<ul>');
      expect(html).toContain('<code>inline code</code>');
      expect(html).toContain('<a href="https://example.com"');
      expect(html).toContain('<del>strikethrough</del>');
      expect(html).toContain('<h3 id="code-example">Code Example</h3>');
      expect(html).toContain('<div class="code-block">');
      expect(html).toContain('<span class="keyword">function</span>');
      expect(html).toContain('<table class="markdown-table">');
      expect(html).toContain('<blockquote>');
      expect(html).toContain('<img src="https://example.com/image.jpg"');
      expect(html).toContain('🚀');
    });

    it('should handle markdown with mixed line endings', () => {
      const markdown =
        '# Title\r\n\r\nParagraph 1\r\n\r\nParagraph 2\n\nParagraph 3';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain('<h1 id="title">Title</h1>');
      expect(html).toContain('Paragraph 1');
      expect(html).toContain('Paragraph 2');
      expect(html).toContain('Paragraph 3');
    });

    it('should clean up malformed HTML', () => {
      const markdown = '# Title\n\n\n\nParagraph';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).not.toContain('<p></p>');
      expect(html).not.toContain('<p><h1');
    });
  });

  describe('Syntax Highlighting', () => {
    let mdsg;

    beforeEach(() => {
      mdsg = new MDSG();
    });

    it('should highlight JavaScript keywords', () => {
      const code = 'const x = async function() { return await fetch("/api"); }';
      const highlighted = mdsg.highlightJavaScript(code);
      expect(highlighted).toContain('<span class="keyword">const</span>');
      expect(highlighted).toContain('<span class="keyword">async</span>');
      expect(highlighted).toContain('<span class="keyword">function</span>');
      expect(highlighted).toContain('<span class="keyword">return</span>');
      expect(highlighted).toContain('<span class="keyword">await</span>');
    });

    it('should highlight JavaScript strings and numbers', () => {
      const code = 'const message = "Hello World"; const count = 42;';
      const highlighted = mdsg.highlightJavaScript(code);
      expect(highlighted).toContain(
        '<span class="string">"Hello World"</span>',
      );
      expect(highlighted).toContain('<span class="number">42</span>');
    });

    it('should highlight JavaScript comments', () => {
      const code = '// This is a comment\nconst x = 1;';
      const highlighted = mdsg.highlightJavaScript(code);
      expect(highlighted).toContain(
        '<span class="comment">// This is a comment</span>',
      );
    });

    it('should highlight HTML tags', () => {
      const code = '<div class="container"><p>Hello</p></div>';
      const highlighted = mdsg.highlightHTML(code);
      expect(highlighted).toContain('<span class="tag">');
    });

    it('should highlight CSS properties', () => {
      const code = '.class { color: red; background-color: blue; }';
      const highlighted = mdsg.highlightCSS(code);
      expect(highlighted).toContain('<span class="property">color</span>');
      expect(highlighted).toContain(
        '<span class="property">background-color</span>',
      );
    });

    it('should highlight JSON properly', () => {
      const code =
        '{ "name": "test", "count": 123, "active": true, "data": null }';
      const highlighted = mdsg.highlightJSON(code);
      expect(highlighted).toContain('<span class="property">"name"</span>');
      expect(highlighted).toContain('<span class="string">"test"</span>');
      expect(highlighted).toContain('<span class="number">123</span>');
      expect(highlighted).toContain('<span class="keyword">true</span>');
      expect(highlighted).toContain('<span class="keyword">null</span>');
    });
  });

  describe('Edge Cases', () => {
    let mdsg;

    beforeEach(() => {
      mdsg = new MDSG();
    });

    it('should handle empty markdown', () => {
      const html = mdsg.markdownToHTML('');
      expect(html).toBe('');
    });

    it('should handle markdown with only whitespace', () => {
      const html = mdsg.markdownToHTML('   \n\n   \t\t  ');
      expect(html.trim()).toBe('');
    });

    it('should handle markdown with special characters', () => {
      const markdown = '# Title with "quotes" and \'apostrophes\' & ampersands';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain(
        '<h1 id="title-with-quotes-and-apostrophes-ampersands">',
      );
    });

    it('should handle nested formatting edge cases', () => {
      const markdown = '**Bold with *italic* inside**';
      const html = mdsg.markdownToHTML(markdown);
      expect(html).toContain(
        '<strong>Bold with <em>italic</em> inside</strong>',
      );
    });

    it('should handle malformed tables gracefully', () => {
      const markdown = '| Header |\n| Value |'; // Missing separator row
      const html = mdsg.markdownToHTML(markdown);
      // Should not crash, may not render as table but should not break
      expect(html).toBeDefined();
    });

    it('should handle unclosed code blocks', () => {
      const markdown =
        '```javascript\nfunction test() {\n  console.log("test");';
      const html = mdsg.markdownToHTML(markdown);
      // Should handle gracefully
      expect(html).toBeDefined();
    });
  });
});
