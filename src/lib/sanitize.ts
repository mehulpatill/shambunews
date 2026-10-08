import sanitizeHtml from "sanitize-html";

export function sanitizeArticleHtml(value: string) {
  return sanitizeHtml(value, {
    allowedTags: [
      "p", "h2", "h3", "strong", "em", "u", "s",
      "ul", "ol", "li", "blockquote", "a", "img", "br",
      "code", "pre"
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height"]
    },
    allowedSchemes: ["http", "https"],
    allowProtocolRelative: false
  });
}
