import fs from "node:fs"
import { join, resolve } from "node:path";

export async function listHtmlFiles(dir: string): Promise<string[]> {
  let htmlFiles: string[] = [];

  async function recurse(currentPath: string): Promise<void> {
    //@ts-ignore
    const entries = await fs.readdir(currentPath, { withFileTypes: true });
    
    for (const entry of entries as  unknown as fs.Dirent[]) {
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