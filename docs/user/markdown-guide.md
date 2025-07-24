# 📝 MDSG Markdown Guide

> Complete reference for all markdown features supported by MDSG

## 🎯 Basic Syntax

### Headings

```markdown
# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6
```

### Text Formatting

```markdown
**Bold text** _Italic text_ **_Bold and italic_** ~~Strikethrough~~
`Inline code`
```

### Lists

**Unordered Lists:**

```markdown
- Item 1
- Item 2
  - Nested item
  - Another nested item
- Item 3
```

**Ordered Lists:**

```markdown
1. First item
2. Second item
   1. Nested numbered item
   2. Another nested item
3. Third item
```

**Task Lists:**

```markdown
- [x] Completed task
- [ ] Incomplete task
- [ ] Another task
```

## 🔗 Links and Images

### Links

```markdown
[Link text](https://example.com)
[Link with title](https://example.com 'This is a title')
<https://auto-linked-url.com>
```

### Images

```markdown
![Alt text](image-url.jpg) ![Alt text](image-url.jpg 'Optional title')
```

## 📊 Tables

```markdown
| Header 1 | Header 2 | Header 3 |
| -------- | -------- | -------- |
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

| Left Aligned | Center Aligned | Right Aligned |
| :----------- | :------------: | ------------: |
| Left         |     Center     |         Right |
```

## 💻 Code

### Inline Code

```markdown
Use `const variable = value;` for constants.
```

### Code Blocks

````markdown
```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
}

greet('World');
```
````

**Supported Languages:**

- `javascript` / `js`
- `typescript` / `ts`
- `html`
- `css`
- `json`
- `markdown` / `md`
- `bash` / `shell`
- `python`
- `java`
- `c` / `cpp`
- `go`
- `rust`
- `sql`

## 📝 Blockquotes

```markdown
> This is a blockquote. It can span multiple lines.

> **Tip**: Use blockquotes for important notes or quotes.
```

## 🔧 Advanced Features

### Horizontal Rules

```markdown
---
```

### Line Breaks

```markdown
Line 1  
Line 2 (two spaces after Line 1)

Paragraph 1

Paragraph 2 (blank line between)
```

### Escaping Characters

```markdown
\*This won't be italic\* \`This won't be code\` \[This won't be a link\](url)
```

## 🎨 MDSG-Specific Features

### Auto-Generated Navigation

MDSG automatically creates:

- Table of contents from headers
- Navigation between sections
- Mobile-friendly menu

### Enhanced Code Blocks

- Syntax highlighting for 20+ languages
- Copy-to-clipboard functionality
- Line numbers (for longer blocks)

### Responsive Images

- Automatic lazy loading
- Mobile optimization
- Alt text for accessibility

### Smart Links

- External links open in new tabs
- Automatic security attributes (`rel="noopener noreferrer"`)
- Link validation and safety checks

## 📱 Mobile Optimization

MDSG automatically optimizes your content for mobile:

- Responsive tables (horizontal scroll when needed)
- Touch-friendly navigation
- Optimized font sizes and spacing
- Fast loading on slow connections

## ✨ Best Practices

### Content Structure

```markdown
# Main Title (H1) - Use only once per page

## Section Headers (H2) - Main sections

### Subsection Headers (H3) - Sub-topics

#### Detail Headers (H4) - Specific details
```

### Accessibility

- Use descriptive alt text for images
- Structure content with proper headings
- Provide context for links
- Use tables appropriately (data, not layout)

### Performance

- Optimize image sizes before uploading
- Use external links sparingly
- Keep content focused and scannable
- Break up long paragraphs

## 🚀 Quick Reference

| Element | Syntax        |
| ------- | ------------- |
| Bold    | `**bold**`    |
| Italic  | `*italic*`    |
| Code    | `` `code` ``  |
| Link    | `[text](url)` |
| Image   | `![alt](url)` |
| Header  | `# Header`    |
| List    | `- item`      |
| Quote   | `> quote`     |
| Table   | `\| col \|`   |
| Rule    | `---`         |

## 🔍 Testing Your Markdown

MDSG provides real-time preview, but here are tips for testing:

1. **Use the preview pane** - See changes instantly
2. **Test on mobile** - Use browser dev tools
3. **Check all links** - Ensure they work correctly
4. **Validate tables** - Make sure they're readable
5. **Test code blocks** - Verify syntax highlighting

## 🆘 Common Issues

### Table Not Rendering

```markdown
| ❌  | Header1 | Header2 |
| --- | ------- | ------- |

| ✅  | Header 1 | Header 2 |
| --- | -------- | -------- |
```

### Code Block Not Highlighting

````markdown
❌ ``` code here
````

✅ ```javascript code here

```

```

### Links Not Working

```markdown
❌ [Link](missing-protocol.com) ✅ [Link](https://example.com)
```

## 📚 Further Reading

- 🚀 [Getting Started Guide](getting-started.md) - Your first MDSG site
- 🛠️ [Site Management](site-management.md) - Managing multiple sites
- 🐞 [Troubleshooting](troubleshooting.md) - Common issues and solutions

**Happy writing!** ✍️
