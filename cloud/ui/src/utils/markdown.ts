import DOMPurify from "dompurify";
import { marked } from "marked";

const PATH_SEPARATOR = ".";
const MARKDOWN_HEADING_REGEX = /^\s{0,3}#{1,6}\s+\S/m;
const MARKDOWN_LIST_REGEX = /^\s*(?:[-*+]\s+|\d+\.\s+)/m;
const MARKDOWN_BOLD_REGEX = /(\*\*|__)(?=\S)([\s\S]*?\S)\1/;
const MARKDOWN_ITALIC_REGEX = /(\*|_)(?=\S)([\s\S]*?\S)\1/;
const MARKDOWN_LINK_REGEX = /\[[^\]]+\]\([^)]+\)/;
const MARKDOWN_CODE_FENCE_REGEX = /```[\s\S]*?```/m;
const MARKDOWN_INLINE_CODE_REGEX = /`[^`]+`/;
const MARKDOWN_BLOCKQUOTE_REGEX = /^\s{0,3}>\s+/m;
const MARKDOWN_TABLE_SEPARATOR_REGEX = /^\s*\|.*\|\s*$/m;
const MARKDOWN_HORIZONTAL_RULE_REGEX = /^\s*(?:-{3,}|_{3,}|\*{3,})\s*$/m;
const MARKDOWN_REGEXES = [
  MARKDOWN_HEADING_REGEX,
  MARKDOWN_LIST_REGEX,
  MARKDOWN_BOLD_REGEX,
  MARKDOWN_ITALIC_REGEX,
  MARKDOWN_LINK_REGEX,
  MARKDOWN_CODE_FENCE_REGEX,
  MARKDOWN_INLINE_CODE_REGEX,
  MARKDOWN_BLOCKQUOTE_REGEX,
  MARKDOWN_TABLE_SEPARATOR_REGEX,
  MARKDOWN_HORIZONTAL_RULE_REGEX,
];
const ALLOWED_TAGS = [
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "del",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "img",
  "i",
  "li",
  "ol",
  "p",
  "pre",
  "s",
  "strong",
  "sub",
  "sup",
  "table",
  "tbody",
  "td",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
];
const ALLOWED_ATTR = [
  "href",
  "title",
  "target",
  "rel",
  "src",
  "alt",
  "width",
  "height",
  "colspan",
  "rowspan",
];
const TARGET_ATTRIBUTE = "_blank";
const REL_ATTRIBUTE = "noopener noreferrer";

export type MarkdownHtmlMap = Record<string, string>;

export function isLikelyMarkdown(value: string): boolean {
  const trimmedValue = value.trim();
  return MARKDOWN_REGEXES.some((regex) => regex.test(trimmedValue));
}

function enforceLinkAttributes(html: string): string {
  return html.replace(/<a\b([^>]*)>/gi, (_match, attributes) => {
    const hasTarget = /\btarget\s*=/i.test(attributes);
    const hasRel = /\brel\s*=/i.test(attributes);
    const targetAttribute = hasTarget ? "" : ` target="${TARGET_ATTRIBUTE}"`;
    const relAttribute = hasRel ? "" : ` rel="${REL_ATTRIBUTE}"`;

    return `<a${targetAttribute}${relAttribute}${attributes}>`;
  });
}

function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    RETURN_DOM_FRAGMENT: false,
  });
}

export function convertMarkdownToHtml(markdown: string): string {
  const html = marked.parse(markdown, { async: false });
  const sanitizedHtml = sanitizeHtml(html);

  return enforceLinkAttributes(sanitizedHtml);
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function buildPath(parentPath: string, key: string): string {
  return parentPath ? `${parentPath}${PATH_SEPARATOR}${key}` : key;
}

function collectMarkdownFields(
  data: unknown,
  currentPath: string,
  map: MarkdownHtmlMap,
): void {
  if (typeof data === "string") {
    if (currentPath && isLikelyMarkdown(data)) {
      map[currentPath] = convertMarkdownToHtml(data);
    }
    return;
  }

  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      const childPath = buildPath(currentPath, String(index));
      collectMarkdownFields(item, childPath, map);
    });
    return;
  }

  if (isObject(data)) {
    Object.entries(data).forEach(([key, value]) => {
      const childPath = buildPath(currentPath, key);
      collectMarkdownFields(value, childPath, map);
    });
  }
}

export function getMarkdownHtmlMap(data: unknown): MarkdownHtmlMap {
  const map: MarkdownHtmlMap = {};

  if (data === null || data === undefined) {
    return map;
  }

  collectMarkdownFields(data, "", map);
  return map;
}
