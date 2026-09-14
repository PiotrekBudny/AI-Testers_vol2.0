#!/usr/bin/env node

/**
 * Comment Removal Utility
 * Removes single-line and multi-line comments from source files
 * while preserving important markers like // Arrange, // Act, // Assert
 *
 * Usage: node remove-comments.js <file-or-pattern>
 */

const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Important comment markers to preserve
const PRESERVE_MARKERS = [
  "Arrange",
  "Act",
  "Assert",
  "TODO",
  "FIXME",
  "HACK",
  "NOTE",
  "XXX",
  "WARN",
  "DEPRECATED",
];

/**
 * Check if a comment should be preserved
 */
function shouldPreserveComment(comment) {
  return PRESERVE_MARKERS.some(
    (marker) => comment.includes(marker) || comment.match(/^\s*[@\\]/), // JSDoc/TSDoc markers
  );
}

/**
 * Remove comments from TypeScript/JavaScript code
 */
function removeCommentsFromCode(content) {
  let result = "";
  let i = 0;

  while (i < content.length) {
    // Single-line comment
    if (content[i] === "/" && content[i + 1] === "/") {
      const lineStart = i;
      let comment = "";
      i += 2;

      // Collect the comment
      while (i < content.length && content[i] !== "\n") {
        comment += content[i];
        i++;
      }

      // Preserve important markers and JSDoc patterns
      if (shouldPreserveComment(comment)) {
        result += "//" + comment;
      }

      // Preserve newline
      if (i < content.length && content[i] === "\n") {
        result += "\n";
        i++;
      }
      continue;
    }

    // Multi-line comment
    if (content[i] === "/" && content[i + 1] === "*") {
      let comment = "";
      i += 2;

      // Collect the comment
      while (i < content.length - 1) {
        if (content[i] === "*" && content[i + 1] === "/") {
          i += 2;
          break;
        }
        comment += content[i];
        i++;
      }

      // Preserve JSDoc/TSDoc and important markers
      if (shouldPreserveComment(comment)) {
        result += "/*" + comment + "*/";
      }
      continue;
    }

    // String handling (preserve comments inside strings)
    if (content[i] === '"' || content[i] === "'" || content[i] === "`") {
      const quote = content[i];
      result += content[i];
      i++;

      while (i < content.length) {
        if (content[i] === "\\") {
          result += content[i] + content[i + 1];
          i += 2;
          continue;
        }
        if (content[i] === quote) {
          result += content[i];
          i++;
          break;
        }
        result += content[i];
        i++;
      }
      continue;
    }

    // Regex handling (preserve slashes in regex patterns)
    if (content[i] === "/" && i > 0) {
      const prevChar = content[i - 1];
      const isRegex =
        /[=(\[,;:!&|?+\-*/%^~]/.test(prevChar) ||
        content.substring(Math.max(0, i - 6), i).match(/return|new|throw/);

      if (isRegex) {
        result += content[i];
        i++;

        while (i < content.length) {
          if (content[i] === "\\") {
            result += content[i] + content[i + 1];
            i += 2;
            continue;
          }
          if (content[i] === "/") {
            result += content[i];
            i++;
            break;
          }
          result += content[i];
          i++;
        }
        continue;
      }
    }

    result += content[i];
    i++;
  }

  return result;
}

/**
 * Remove extra blank lines (max 2 consecutive)
 */
function removeExtraBlankLines(content) {
  return content.replace(/\n\n\n+/g, "\n\n");
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    // Check if file should be processed
    const ext = path.extname(filePath).toLowerCase();
    if (![".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"].includes(ext)) {
      return false; // Skip non-code files
    }

    console.log(`  Processing: ${filePath}`);

    let content = fs.readFileSync(filePath, "utf-8");
    const originalSize = content.length;

    content = removeCommentsFromCode(content);
    content = removeExtraBlankLines(content);

    fs.writeFileSync(filePath, content, "utf-8");

    const reduction = (
      ((originalSize - content.length) / originalSize) *
      100
    ).toFixed(2);
    console.log(`    ✓ Cleaned (${reduction}% size reduction)`);

    return true;
  } catch (error) {
    console.error(`  ✗ Error processing ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Main entry point
 */
function main() {
  const pattern = process.argv[2];

  if (!pattern) {
    console.error("Usage: node remove-comments.js <file-or-pattern>");
    process.exit(1);
  }

  console.log("🧹 Removing comments...\n");

  try {
    // Handle glob patterns and direct file paths
    let files = [];

    if (pattern.includes("*")) {
      // Glob pattern
      files = glob.sync(pattern, { nodir: true });
    } else if (fs.statSync(pattern).isDirectory()) {
      // Directory - process all code files recursively
      files = glob.sync(path.join(pattern, "**/*.{ts,tsx,js,jsx,mjs,cjs}"), {
        nodir: true,
      });
    } else {
      // Single file
      files = [pattern];
    }

    if (files.length === 0) {
      console.log("No files found matching pattern:", pattern);
      process.exit(0);
    }

    console.log(`Found ${files.length} file(s) to process:\n`);

    let processed = 0;
    let skipped = 0;

    files.forEach((file) => {
      if (processFile(file)) {
        processed++;
      } else {
        skipped++;
      }
    });

    console.log(
      `\n✅ Complete: ${processed} file(s) processed, ${skipped} file(s) skipped`,
    );
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();
