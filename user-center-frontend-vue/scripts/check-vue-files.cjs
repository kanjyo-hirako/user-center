const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(process.cwd(), "src");
const targetExt = ".vue";
const invalidFiles = [];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (!entry.isFile() || path.extname(entry.name) !== targetExt) {
      continue;
    }

    const content = fs.readFileSync(fullPath, "utf8");
    const trimmed = content.trim();

    if (!trimmed) {
      invalidFiles.push({
        file: fullPath,
        reason: "file is empty",
      });
      continue;
    }

    const hasTemplateOrScript = /<(template|script)(\s|>)/i.test(trimmed);

    if (!hasTemplateOrScript) {
      invalidFiles.push({
        file: fullPath,
        reason: "missing <template> or <script> block",
      });
    }
  }
}

if (!fs.existsSync(rootDir)) {
  console.error(`Source directory not found: ${rootDir}`);
  process.exit(1);
}

walk(rootDir);

if (invalidFiles.length > 0) {
  console.error("Found invalid Vue SFC files:\n");
  for (const item of invalidFiles) {
    console.error(`- ${item.file}: ${item.reason}`);
  }
  process.exit(1);
}

console.log("Vue SFC validation passed.");
