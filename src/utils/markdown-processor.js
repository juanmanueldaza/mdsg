import { MinimalSecurity } from './security-minimal.js';
export class MarkdownProcessor {
  static process(markdown) {
    if (!markdown) return '';
    let html = markdown;
    html = this._processCodeBlocks(html);
    html = this._processHeaders(html);
    html = this._processBlockquotes(html);
    html = this._processLists(html);
    html = this._processTextFormatting(html);
    html = this._processImages(html);
    html = this._processLinks(html);
    html = this._processAutoLinks(html);
    html = this._processEmailLinks(html);
    html = this._wrapParagraphs(html);
    html = this._finalCleanup(html);
    return html;
  }
  static _processCodeBlocks(html) {
    return html.replace(/```([^`]*?)```/gs, '<pre><code>$1</code></pre>');
  }
  static _processHeaders(html) {
    return html
      .replace(/^### (.*$)/gm, (match, text) => {
        const id = this._createHeaderId(text);
        return `<h3 id="${id}">${text}</h3>`;
      })
      .replace(/^## (.*$)/gm, (match, text) => {
        const id = this._createHeaderId(text);
        return `<h2 id="${id}">${text}</h2>`;
      })
      .replace(/^# (.*$)/gm, (match, text) => {
        const id = this._createHeaderId(text);
        return `<h1 id="${id}">${text}</h1>`;
      });
  }
  static _processBlockquotes(html) {
    return html
      .replace(/^---$/gm, '<hr>')
      .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');
  }
  static _processLists(html) {
    return html
      .replace(/^[*\-+] (.+$)/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.+$)/gm, '<oli>$2</oli>')
      .replace(/(<li>.*?<\/li>)(\n<li>.*?<\/li>)*/gs, '<ul>$&</ul>')
      .replace(/(<oli>.*?<\/oli>)(\n<oli>.*?<\/oli>)*/gs, '<ol>$&</ol>')
      .replace(/<oli>/g, '<li>')
      .replace(/<\/oli>/g, '</li>');
  }
  static _processTextFormatting(html) {
    return html
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');
  }
  static _processImages(html) {
    // KISS: Only allow safe URLs, escape alt text, DRY: use MinimalSecurity
    // Use imported MinimalSecurity (ESM)
    return html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
      if (!MinimalSecurity.isValidURL(src)) {
        // Render as broken image with alt text for invalid URLs
        return `<img src="#invalid-url" alt="${MinimalSecurity.escapeText(alt)}" loading="lazy" />`;
      }
      // Only escape alt, not src
      return `<img src="${src}" alt="${MinimalSecurity.escapeText(alt)}" loading="lazy" />`;
    });
  }
  static _processLinks(html) {
    return html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, href) => {
      if (this._isDangerousUrl(href)) {
        return text;
      }
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    });
  }
  static _processAutoLinks(html) {
    const parts = html.split(
      /(\b(?:href|src|action|data-[^=]*|url)=["'][^"']*["'])/, // Split parts for processing
    );
    // ...existing code...
    return parts
      .map((part, index) => {
        // ...existing code...
        if (index % 2 === 0) {
          return part.replace(
            /\b(https?:\/\/[^\s<>"']+)(?![^<]*(?:<\/a>|["'>]))/g,
            '<a href="$1" target="_blank" rel="noopener">$1</a>',
          );
        }
        return part;
      })
      .join('');
  }
  static _processEmailLinks(html) {
    return html.replace(
      /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b(?![^<]*<\/a>)/g,
      '<a href="mailto:$1">$1</a>',
    );
  }
  static _wrapParagraphs(html) {
    return html
      .replace(/\n\s*\n/g, '</p><p>') // Replace multiple newlines with paragraph tags
      .replace(/^(.)/gm, '<p>$1')
      .replace(/(.*)$/gm, '$1</p>');
  }
  static _finalCleanup(html) {
    return html
      .replace(/<p><\/p>/g, '') // Remove empty paragraphs
      .replace(/<p>(<h[1-6][^>]*>.*?<\/h[1-6]>)<\/p>/g, '$1')
      .replace(/<p>(<ul>.*?<\/ul>)<\/p>/gs, '$1')
      .replace(/<p>(<ol>.*?<\/ol>)<\/p>/gs, '$1')
      .replace(/<p>(<blockquote>.*?<\/blockquote>)<\/p>/g, '$1')
      .replace(/<p>(<pre>.*?<\/pre>)<\/p>/gs, '$1')
      .replace(/<p>(<hr>)<\/p>/g, '$1')
      .replace(/(<img[^>]+)(?=\s)/g, match => {
        if (!match.includes('loading=')) {
          return `${match} loading="lazy"`;
        }
        return match;
      });
  }
  static _isDangerousUrl(url) {
    return url.match(/^(javascript:|vbscript:|data:)/i);
  }
  static _createHeaderId(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
// ...existing code...
