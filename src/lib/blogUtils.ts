// utils/blog-metadata.ts
import { Metadata } from "next";

interface BlogPostMetaProps {
  title: string;
  description: string;
  slug: string;
  publishedAt: string;
  updatedAt?: string;
  tags: string[];
  author: string;
  readTime: number;
  featuredImage?: string | null;
  content?: string;
}

export function generateBlogPostMetadata({
  title,
  description,
  slug,
  publishedAt,
  updatedAt,
  tags,
  author,
  readTime,
  featuredImage,
  content,
}: BlogPostMetaProps): Metadata {
  const baseUrl = "https://bhavishya.dev";
  const postUrl = `${baseUrl}/blog/${slug}`;
  const imageUrl = featuredImage || `${baseUrl}/og-default-blog.jpg`;

  // Auto-generate description from content if not provided
  const metaDescription =
    description ||
    (content
      ? content.replace(/<[^>]*>/g, "").slice(0, 160) + "..."
      : "A technical blog post by Bhavishya Sahdev on full-stack development.");

  return {
    title: `${title} - Bhavishya Sahdev`,
    description: metaDescription,
    keywords: [
      ...tags,
      "full-stack development",
      "web development",
      "programming",
      "software engineering",
      "javascript",
      "typescript",
    ],
    authors: [{ name: author }],
    openGraph: {
      title,
      description: metaDescription,
      url: postUrl,
      siteName: "Bhavishya Sahdev",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type: "article",
      publishedTime: publishedAt,
      modifiedTime: updatedAt || publishedAt,
      authors: [author],
      tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: metaDescription,
      images: [imageUrl],
      creator: "@bhavishyasahdev",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    other: {
      "article:author": author,
      "article:published_time": publishedAt,
      "article:modified_time": updatedAt || publishedAt,
      "article:tag": tags.join(", "),
      "twitter:label1": "Reading time",
      "twitter:data1": `${readTime} min read`,
      "twitter:label2": "Tags",
      "twitter:data2": tags.slice(0, 3).join(", "),
    },
  };
}

// Generate JSON-LD structured data for blog posts
export function generateBlogPostJsonLd({
  title,
  description,
  slug,
  publishedAt,
  updatedAt,
  tags,
  author,
  featuredImage,
  content,
}: BlogPostMetaProps) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    image: featuredImage || `https://bhavishya.dev/og-default-blog.jpg`,
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    author: {
      "@type": "Person",
      name: author,
      url: "https://bhavishya.dev",
      sameAs: [
        "https://linkedin.com/in/bhavishyasahdev", // Update with your actual LinkedIn
        "https://github.com/bhavishyasahdev", // Update with your actual GitHub
      ],
    },
    publisher: {
      "@type": "Person",
      name: "Bhavishya Sahdev",
      url: "https://bhavishya.dev",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://bhavishya.dev/blog/${slug}`,
    },
    keywords: tags.join(", "),
    wordCount: content ? content.split(" ").length : undefined,
    timeRequired: `PT${Math.ceil((content?.split(" ").length || 0) / 200)}M`, // Assuming 200 words per minute reading speed
    inLanguage: "en-US",
    isPartOf: {
      "@type": "Blog",
      "@id": "https://bhavishya.dev/blog",
      name: "Bhavishya Sahdev's Blog",
    },
  };
}

export function sanitizeMDXContent(content: string): string {
  if (!content) return "";

  return (
    content
      // Fix literal \n characters to actual newlines
      .replace(/\\n/g, "\n")
      // Fix literal \t characters to actual tabs
      .replace(/\\t/g, "\t")
      // Fix literal \r characters
      .replace(/\\r/g, "\r")

      // Enhanced table detection - handle various single-line formats
      // Pattern 1: |header|header||-----|-----||value|value|
      .replace(
        /\|([^|]+(?:\|[^|]+)*)\|\|(-+(?:\|-+)*)\|\|([^|]+(?:\|[^|]+)*)\|/g,
        (match, headers, separators, values) => {
          const headerCells = headers
            .split("|")
            .map((h: string) => h.trim())
            .filter((h: string) => h.length > 0);
          const valueCells = values
            .split("|")
            .map((v: string) => v.trim())
            .filter((v: string) => v.length > 0);

          // Create separator row with correct number of columns
          const sepCells = headerCells.map(() => "---");

          const headerRow = `| ${headerCells.join(" | ")} |`;
          const separatorRow = `| ${sepCells.join(" | ")} |`;
          const valueRow = `| ${valueCells.join(" | ")} |`;

          return `\n${headerRow}\n${separatorRow}\n${valueRow}\n`;
        }
      )

      // Pattern 2: Simple single column |header||-----|value|
      .replace(
        /\|([^|]+)\|\|(-+)\|\|([^|]+)\|/g,
        (match, header, separator, value) => {
          return `\n| ${header.trim()} |\n|---|\n| ${value.trim()} |\n`;
        }
      )

      // Pattern 3: Alternative format |header|-----||value|
      .replace(
        /\|([^|]+)\|(-{3,})\|\|([^|]+)\|/g,
        (match, header, separator, value) => {
          return `\n| ${header.trim()} |\n|---|\n| ${value.trim()} |\n`;
        }
      )

      // Pattern 4: Standard single-line without double pipes |header|-----|value|
      .replace(
        /\|([^|]+)\|(-{3,})\|([^|]+)\|(?!\|)/g,
        (match, header, separator, value) => {
          return `\n| ${header.trim()} |\n|---|\n| ${value.trim()} |\n`;
        }
      )

      // Pattern 5: Multi-row single-line tables (detect multiple || separators)
      .replace(
        /(\|[^|]+(?:\|[^|]+)*\|\|[^|]+(?:\|[^|]+)*\|\|[^|]+(?:\|[^|]+)*\|(?:\|\|[^|]+(?:\|[^|]+)*\|)*)/g,
        (match) => {
          // Split by || to get table sections
          const sections = match.split("||");
          if (sections.length < 3) return match; // Not a valid table

          const headers = sections[0]
            .replace(/^\||\|$/g, "")
            .split("|")
            .map((h) => h.trim())
            .filter((h) => h.length > 0);
          const separators = sections[1]
            .replace(/^\||\|$/g, "")
            .split("|")
            .map((s) => s.trim())
            .filter((s) => s.length > 0);

          // Check if second section looks like separators (contains dashes)
          const isSeparatorRow = separators.every((s) => /^-+$/.test(s));

          if (!isSeparatorRow) return match; // Not a table format we recognize

          let result = `\n| ${headers.join(" | ")} |\n| ${headers.map(() => "---").join(" | ")} |\n`;

          // Add data rows
          for (let i = 2; i < sections.length; i++) {
            const rowData = sections[i]
              .replace(/^\||\|$/g, "")
              .split("|")
              .map((d) => d.trim())
              .filter((d) => d.length > 0);
            if (rowData.length > 0) {
              result += `| ${rowData.join(" | ")} |\n`;
            }
          }

          return result;
        }
      )

      // Clean up any malformed table pipes that weren't caught (but preserve code blocks)
      .replace(/\|([^|]+)\|/g, (match, content, offset, string) => {
        // Don't modify if we're inside a code block
        const beforeMatch = string.substring(0, offset);
        const codeBlockCount = (beforeMatch.match(/```/g) || []).length;
        const inlineCodeCount = (beforeMatch.match(/`/g) || []).length;

        // If we're inside a code block (odd number of ``` or `) skip modification
        if (codeBlockCount % 2 === 1 || inlineCodeCount % 2 === 1) {
          return match;
        }

        // Don't modify if this looks like it's already part of a proper table
        const lineStart = string.lastIndexOf("\n", offset) + 1;
        const lineEnd = string.indexOf("\n", offset);
        const currentLine = string.substring(
          lineStart,
          lineEnd === -1 ? string.length : lineEnd
        );

        // If the line starts and ends with |, it's likely already a proper table row
        if (
          currentLine.trim().startsWith("|") &&
          currentLine.trim().endsWith("|")
        ) {
          return match;
        }

        if (content.includes("-") && content.match(/^-+$/)) {
          return `|${content}|`; // Keep separator rows as-is
        }
        return match; // Don't modify single pipes
      })

      // Only escape curly braces that are NOT in code blocks and NOT valid JSX
      .replace(/\{([^}]*)\}/g, (match, inner, offset, string) => {
        // Don't modify if we're inside a code block
        const beforeMatch = string.substring(0, offset);
        const codeBlockCount = (beforeMatch.match(/```/g) || []).length;
        const inlineCodeCount = (beforeMatch.match(/`/g) || []).length;

        // If we're inside a code block, leave as-is
        if (codeBlockCount % 2 === 1 || inlineCodeCount % 2 === 1) {
          return match;
        }

        // If it looks like valid JSX/JS, leave it alone
        if (
          inner.includes("=") ||
          inner.includes(":") ||
          inner.includes('"') ||
          inner.includes("'") ||
          inner.includes("=>") ||
          inner.includes("()") ||
          inner.includes("[]") ||
          inner.includes("?") ||
          inner.includes("&&") ||
          inner.includes("||") ||
          inner.includes("return") ||
          inner.includes("useState") ||
          inner.includes("useEffect") ||
          inner.includes("map") ||
          inner.includes("filter") ||
          inner.includes("item.") ||
          inner.includes("props.") ||
          inner.includes("state.") ||
          /^[a-zA-Z_$][a-zA-Z0-9_$]*(\.[a-zA-Z_$][a-zA-Z0-9_$]*)*$/.test(
            inner.trim()
          )
        ) {
          return match;
        }

        // Otherwise escape it
        return `\\{${inner}\\}`;
      })

      // Only escape < > that are NOT in code blocks and NOT valid HTML/JSX
      .replace(/<(?![a-zA-Z/])/g, (match, offset, string) => {
        const beforeMatch = string.substring(0, offset);
        const codeBlockCount = (beforeMatch.match(/```/g) || []).length;
        const inlineCodeCount = (beforeMatch.match(/`/g) || []).length;

        if (codeBlockCount % 2 === 1 || inlineCodeCount % 2 === 1) {
          return match;
        }
        return "\\<";
      })
      .replace(/(?<![a-zA-Z/])>/g, (match, offset, string) => {
        const beforeMatch = string.substring(0, offset);
        const codeBlockCount = (beforeMatch.match(/```/g) || []).length;
        const inlineCodeCount = (beforeMatch.match(/`/g) || []).length;

        if (codeBlockCount % 2 === 1 || inlineCodeCount % 2 === 1) {
          return match;
        }
        return "\\>";
      })

      // Remove or escape problematic characters
      .replace(/\u2018/g, "'") // Left single quotation mark
      .replace(/\u2019/g, "'") // Right single quotation mark
      .replace(/\u201C/g, '"') // Left double quotation mark
      .replace(/\u201D/g, '"') // Right double quotation mark
      .replace(/\u2013/g, "-") // En dash
      .replace(/\u2014/g, "--") // Em dash

      // Fix broken JSX expressions (but only outside code blocks)
      // @ts-ignore
      .replace(/\{([^}]*)\n([^}]*)\}/gs, (match, p1, p2, offset, string) => {
        const beforeMatch = string.substring(0, offset);
        const codeBlockCount = (beforeMatch.match(/```/g) || []).length;

        if (codeBlockCount % 2 === 1) {
          return match;
        }

        const inner = p1 + "\n" + p2;
        // If JSX expression spans multiple lines without proper syntax, escape it
        if (
          !inner.includes("return") &&
          !inner.includes("=>") &&
          !inner.includes("useState") &&
          !inner.includes("useEffect")
        ) {
          return match.replace(/\{/g, "\\{").replace(/\}/g, "\\}");
        }
        return match;
      })
  );
}
