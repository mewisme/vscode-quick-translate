type CommentSyntax =
  | { type: "block"; start: string; end: string }
  | { type: "line"; prefix: string }

const BLOCK_GROUPS: Array<{
  languages: string[]
  start: string
  end: string
}> = [
    {
      languages: [
        "c",
        "cpp",
        "csharp",
        "java",
        "javascript",
        "typescript",
        "go",
        "swift",
        "kotlin",
        "rust",
        "php",
        "css",
        "scss",
        "less",
        "sql",
      ],
      start: "/*",
      end: "*/",
    },
    {
      languages: ["html", "xml", "svg"],
      start: "<!--",
      end: "-->",
    },
    {
      languages: ["python", "scala"],
      start: '"""',
      end: '"""',
    },
    {
      languages: ["ruby"],
      start: "=begin",
      end: "=end",
    },
    {
      languages: ["haskell"],
      start: "{-",
      end: "-}",
    },
    {
      languages: ["lua"],
      start: "--[[",
      end: "]]",
    },
  ];

const LINE_GROUPS: Array<{
  languages: string[]
  prefix: string
}> = [
    {
      languages: [
        "javascript",
        "typescript",
        "c",
        "cpp",
        "csharp",
        "java",
        "go",
        "swift",
        "kotlin",
        "rust",
        "php",
      ],
      prefix: "//",
    },
    {
      languages: ["python", "ruby", "bash", "shell", "yaml", "makefile"],
      prefix: "#",
    },
    {
      languages: ["sql", "haskell"],
      prefix: "--",
    },
  ];

function normalizeLanguage(language: string): string {
  const map: Record<string, string> = {
    ts: "typescript",
    js: "javascript",
    py: "python",
    sh: "bash",
  };

  const normalized = language.toLowerCase().trim();
  return map[normalized] ?? normalized;
}

export function getCommentSyntax(language: string): CommentSyntax | null {
  const lang = normalizeLanguage(language);

  for (const group of BLOCK_GROUPS) {
    if (group.languages.includes(lang)) {
      return { type: "block", start: group.start, end: group.end };
    }
  }

  for (const group of LINE_GROUPS) {
    if (group.languages.includes(lang)) {
      return { type: "line", prefix: group.prefix };
    }
  }

  return null;
}