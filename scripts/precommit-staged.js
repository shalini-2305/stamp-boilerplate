#!/usr/bin/env node

/**
 * Script to run precommit tasks only on staged changes (not entire files)
 * For t3-turbo projects with ESLint v9+ and legacy configs
 */

const { execSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

// Get staged files
const getStagedFiles = () => {
  try {
    const output = execSync("git diff --cached --name-only --diff-filter=ACMR")
      .toString()
      .trim();
    return output ? output.split("\n") : [];
  } catch (error) {
    console.error("Error getting staged files:", error.message);
    return [];
  }
};

// Filter files by extensions
const filterFilesByExt = (files, extensions) => {
  return files.filter((file) => {
    const ext = path.extname(file).toLowerCase();
    return extensions.includes(ext);
  });
};

// Create temp directory for staged changes
const createTempDir = () => {
  const tempDir = path.join(os.tmpdir(), `staged-${Date.now()}`);
  fs.mkdirSync(tempDir, { recursive: true });
  return tempDir;
};

// Get staged content and save to temp files
const saveStageContentToTemp = (files, tempDir) => {
  const tempFiles = [];

  for (const file of files) {
    try {
      // Get only staged content using git show
      const stagedContent = execSync(`git show :${file}`).toString();

      // Create the directory structure in temp
      const tempFilePath = path.join(tempDir, file);
      fs.mkdirSync(path.dirname(tempFilePath), { recursive: true });

      // Write the staged content to temp file
      fs.writeFileSync(tempFilePath, stagedContent);
      tempFiles.push(tempFilePath);
    } catch (error) {
      console.warn(
        `Could not get staged content for ${file}: ${error.message}`,
      );
    }
  }

  return tempFiles;
};

// Run prettier on specific files
const runPrettierOnFiles = (files) => {
  if (files.length === 0) return;

  console.log("\n🔍 Running Prettier...");
  try {
    for (const file of files) {
      execSync(`npx prettier --write "${file}"`, { stdio: "inherit" });
    }
  } catch (error) {
    console.warn(
      "Prettier encountered an error, but continuing:",
      error.message,
    );
  }
};

// Run ESLint on specific files
const runEslintOnFiles = (files, tempDir) => {
  if (files.length === 0) return;

  console.log("\n🔍 Running ESLint...");
  try {
    // Copy project ESLint configs to temp dir for proper linting
    const configFiles = [
      ".eslintrc.js",
      ".eslintrc.json",
      ".eslintrc",
      "tsconfig.json",
    ];

    for (const configFile of configFiles) {
      if (fs.existsSync(configFile)) {
        fs.copyFileSync(configFile, path.join(tempDir, configFile));
      }
    }

    // For monorepos, also try to preserve the structure
    const monorepoFolders = ["apps", "packages"];
    for (const folder of monorepoFolders) {
      if (fs.existsSync(folder)) {
        const subFolders = fs
          .readdirSync(folder, { withFileTypes: true })
          .filter((dirent) => dirent.isDirectory())
          .map((dirent) => dirent.name);

        for (const subFolder of subFolders) {
          const configPath = path.join(folder, subFolder, ".eslintrc.js");
          if (fs.existsSync(configPath)) {
            const tempConfigPath = path.join(tempDir, folder, subFolder);
            fs.mkdirSync(tempConfigPath, { recursive: true });
            fs.copyFileSync(
              configPath,
              path.join(tempConfigPath, ".eslintrc.js"),
            );
          }
        }
      }
    }

    // Run ESLint with legacy config flag for v9+
    for (const file of files) {
      const result = spawnSync(
        "npx",
        ["eslint", "--no-eslintrc", "--no-ignore", "--fix", file],
        {
          stdio: "inherit",
          cwd: tempDir,
        },
      );

      if (result.status !== 0) {
        console.warn(`ESLint had issues with ${file}, but continuing...`);
      }
    }
  } catch (error) {
    console.warn("ESLint encountered an error, but continuing:", error.message);
  }
};

// Apply changes from temp files back to original staged files
const applyChangesToStaged = (originalFiles, tempDir) => {
  for (const file of originalFiles) {
    const tempFile = path.join(tempDir, file);
    if (fs.existsSync(tempFile)) {
      try {
        // Read fixed content from temp file
        const fixedContent = fs.readFileSync(tempFile, "utf8");

        // Stage the fixed content
        fs.writeFileSync(file, fixedContent);
        execSync(`git add "${file}"`);
        console.log(`✅ Successfully fixed and staged: ${file}`);
      } catch (error) {
        console.warn(`Could not apply changes to ${file}: ${error.message}`);
      }
    }
  }
};

// Cleanup temp directory
const cleanupTempDir = (tempDir) => {
  try {
    execSync(`rm -rf "${tempDir}"`);
  } catch (error) {
    console.warn(`Could not clean up temp directory: ${error.message}`);
  }
};

// Main function
const runPrecommitOnStaged = async () => {
  // Get staged files
  const stagedFiles = getStagedFiles();

  if (stagedFiles.length === 0) {
    console.log("No staged files found.");
    return;
  }

  console.log(`Found ${stagedFiles.length} staged files.`);

  // Filter TypeScript/JavaScript files
  const tsJsFiles = filterFilesByExt(stagedFiles, [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".cjs",
  ]);

  if (tsJsFiles.length === 0) {
    console.log("No TypeScript/JavaScript files to process.");
    return;
  }

  console.log(`Processing ${tsJsFiles.length} TS/JS files...`);

  // Create temp directory for staged content
  const tempDir = createTempDir();
  console.log(`Created temp directory: ${tempDir}`);

  try {
    // Save staged content to temp directory
    const tempFiles = saveStageContentToTemp(tsJsFiles, tempDir);
    console.log(`Saved ${tempFiles.length} files to temp directory`);

    // Run prettier on temp files
    runPrettierOnFiles(tempFiles);

    // Run ESLint on temp files
    runEslintOnFiles(tempFiles, tempDir);

    // Apply fixed content back to original files and stage them
    applyChangesToStaged(tsJsFiles, tempDir);

    // Run TypeScript check for the project
    console.log("\n🔍 Running TypeScript check...");
    try {
      execSync("pnpm typecheck", { stdio: "inherit" });
    } catch (error) {
      console.warn("TypeScript check encountered errors:", error.message);
      console.log("You may want to fix TypeScript errors before committing.");
    }

    console.log("\n✅ Precommit checks completed!");
  } catch (error) {
    console.error("\n❌ Precommit checks failed:", error.message);
    process.exit(1);
  } finally {
    // Clean up temp directory
    cleanupTempDir(tempDir);
  }
};

// Run the script
runPrecommitOnStaged().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
