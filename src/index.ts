import fs from "node:fs";
import path from "node:path";
import createStaticAdapter from "@marko/run-adapter-static";
import type { Adapter, Route } from "@marko/run/vite";
import type { ResolvedConfig } from "vite";

import { listHtmlFiles } from "./steps/listHtmlFiles";
import { inlineAssets } from "./steps/inlineAssets";
import type { FigmaAdapterOptions } from './types';
import { deleteEmptyFolders, deleteNonHtmlFiles, moveHtmlFiles } from "./steps/moveHtmlFiles";

/**
 * Creates a Marko Run adapter for building Figma plugins with configurable options.
 * This function configures the behavior of the adapter and invokes methods for
 * inlining resources and updating the Figma plugin manifest.
 *
 * @param {FigmaAdapterOptions} options - Configuration options for the Figma adapter.
 * @returns The configuration adapter which aligns with the Marko Run adapter interface.
 */
export default function figmaAdapter(
  options: FigmaAdapterOptions = {}
): Adapter {

  const staticAdapter = createStaticAdapter();

  const adapter = {
    ...staticAdapter,

    name: "figma-adapter",

    async buildEnd(
      resolvedConfig: ResolvedConfig,
      routes: Route[],
      builtEntries: string[],
      sourceEntries: string[]
    ): Promise<void> {
      await staticAdapter.buildEnd?.(
        resolvedConfig,
        routes,
        builtEntries,
        sourceEntries
      );
      
      const outputDir = path.resolve(process.cwd(), resolvedConfig.build.outDir);

      // ui folder
      const targetDir = path.resolve(process.cwd(), ".marko-run/figma-adapter");

      await moveHtmlFiles(outputDir, targetDir)

      const files =
        (await listHtmlFiles(targetDir).catch((error) =>
          console.error(error)
        )) || [];

      // Inline CSS, JS, and images in HTML files
      for (const htmlPath of files) {
        if (!fs.existsSync(htmlPath)) continue;

        let htmlContent = await fs.promises.readFile(htmlPath, "utf-8");
        htmlContent = await inlineAssets(htmlContent, outputDir);

        await fs.promises.writeFile(htmlPath, htmlContent);
      }

      // Delete non-.html files
      deleteNonHtmlFiles(outputDir);

      // Delete empty folders
      deleteEmptyFolders(outputDir);
      deleteEmptyFolders(targetDir);

      // Update Figma plugin manifest
      const originalManifestPath = path.resolve(process.cwd(), "manifest.json");
      if (fs.existsSync(originalManifestPath)) {
        // Read original manifest and prepare it for updates
        const manifest = JSON.parse(
          await fs.promises.readFile(originalManifestPath, "utf-8")
        ) as any;

        // Scan for HTML files and construct the ui property of the manifest
        const htmlFiles = files;
        manifest.ui = htmlFiles.reduce(
          (ui, file) => {
            const parts = file.split("/");

            if (parts[parts.length - 2] == "figma-adapter") {
              //take only the index
              const key = parts[parts.length - 1].replace(".html", "");
              ui[key] = `${file}`;
            }
            else {
              // take all the path instead dist and index
              const index = parts.indexOf("figma-adapter");
              const newParts = parts.slice(index + 1, parts.length)

              if (newParts[newParts.length - 1] == "index.html") {
                newParts.pop();
                const key = newParts.length > 1 ? newParts.join("/") : newParts[newParts.length - 1]
                ui[key] = `${file}`;
              }

              else {
                const name = newParts[newParts.length - 1].replace(".html", "")
                newParts.pop();
                const key = (newParts.length > 1 ? newParts.join("/") : newParts[newParts.length - 1]) + name
                ui[key] = `${file}`;
              }
            }

            return ui;
          },
          {} as Record<string, string>
        );

        await fs.promises.writeFile(
          originalManifestPath,
          JSON.stringify(manifest, null, 2)
        );
      }
    },

    // typeInfo() {
    //   return "{}";
    // },
  };

  return adapter;
}
