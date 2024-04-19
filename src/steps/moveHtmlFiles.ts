import fs from 'fs';
import path from 'path';

// Function to delete files with non-.html extension
export function deleteNonHtmlFiles(dir: string) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      deleteNonHtmlFiles(filePath);
    } else {
      if (path.extname(file) !== '.html') {
        fs.unlinkSync(filePath);
      }
    }
  });
}

// Function to delete empty folders
export function deleteEmptyFolders(dir: string) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      deleteEmptyFolders(filePath);
      if (fs.readdirSync(filePath).length === 0) {
        fs.rmdirSync(filePath);
      }
    }
  });
}

// Function to move remaining files and folders to another directory
function moveFilesAndFolders(sourceDir: string, destinationDir: string) {
  if (!fs.existsSync(destinationDir)) {
    fs.mkdirSync(destinationDir, { recursive: true });
  }

  const files = fs.readdirSync(sourceDir);

  files.forEach(file => {
    if (file != ".marko-run") {
      const sourcePath = path.join(sourceDir, file);
      const destPath = path.join(destinationDir, file);

      if (fs.statSync(sourcePath).isDirectory()) {
        // Recursively move directories
        moveFilesAndFolders(sourcePath, destPath);
      } else {
        // Check if the file has .html extension
        if (path.extname(file) === '.html') {
          fs.renameSync(sourcePath, destPath);
        }
      }
    }
  });
}

export async function moveHtmlFiles(sourceDirectory: string, destinationDirectory: string) {
  // Move remaining files and folders to another directory
  moveFilesAndFolders(sourceDirectory, destinationDirectory);

}

