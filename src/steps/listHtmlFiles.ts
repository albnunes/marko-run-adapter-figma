import { promises as fs } from "fs";
import { join, resolve } from "path";

export async function listHtmlFiles(dir: string): Promise<string[]> {
  let htmlFiles: string[] = [];

  async function recurse(currentPath: string): Promise<void> {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const path = join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await recurse(path);
      } else if (entry.isFile() && entry.name.endsWith(".html")) {
        htmlFiles.push(resolve(path));
      }
    }
  }

  await recurse(dir);
  return htmlFiles;
}