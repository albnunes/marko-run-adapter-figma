import fs from "node:fs";
import path from "node:path";
import createStaticAdapter from "@marko/run-adapter-static";
import type { Adapter, Route } from "@marko/run/vite";
import type { ResolvedConfig } from "vite";

import { listHtmlFiles } from "./lib/listHtmlFiles";
import { inlineAssets } from "./steps/inlineAssets";
import type { FigmaAdapterOptions } from './types';

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
  // const defaultMinifierOptions = {
  //   collapseWhitespace: true,
  //   minifyCSS: true,
  //   minifyJS: true,
  //   removeAttributeQuotes: true,
  //   removeComments: true,
  // };

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
      // console.log({
      //   resolvedConfig,
      //   routes,
      //   builtEntries,
      //   sourceEntries,
      // });

      routes
        .map((r) => ({ key: r.key, importPath: r.page?.importPath }))
        .forEach((r) => console.log(r));

      await staticAdapter.buildEnd?.(
        resolvedConfig,
        routes,
        builtEntries,
        sourceEntries
      );

      const outputDir = path.resolve(process.cwd(), resolvedConfig.build.outDir);

      const files =
        (await listHtmlFiles(outputDir).catch((error) =>
          console.error(error)
        )) || [];

      // console.log(
      //   "Files to process:",
      //   files.map((f) => path.relative(outputDir, f))
      // );

      // Inline CSS, JS, and images in HTML files
      for (const htmlPath of files) {
        // const htmlPath = path.join(outputDir, `${route.entryName}.html`);
        if (!fs.existsSync(htmlPath)) continue;
        // console.log("html file: ", htmlPath);

        let htmlContent = await fs.promises.readFile(htmlPath, "utf-8");
        console.time("inlineAssets");
        htmlContent = await inlineAssets(htmlContent, outputDir);
        console.timeEnd("inlineAssets");

        // htmlContent = await minify(htmlContent, htmlMinifierOptions);
        await fs.promises.writeFile(htmlPath, htmlContent);
      }

      // Update Figma plugin manifest
      // const manifestPath = path.resolve(outputDir, "manifest.json");
      const originalManifestPath = path.resolve(process.cwd(), "manifest.json");
      if (fs.existsSync(originalManifestPath)) {
        // Read original manifest and prepare it for updates
        const manifest = JSON.parse(
          await fs.promises.readFile(originalManifestPath, "utf-8")
        ) as any;

        // Scan for HTML files and construct the ui property of the manifest
        const htmlFiles = files;
        console.log("htmlFiles", htmlFiles);
        manifest.ui = htmlFiles.reduce(
          (ui, file) => {
            // const key = path.basename(file, path.extname(file));
            // console.log("key", key)
            const parts = file.split("/");

            // Locate the "about/index" part by slicing the relevant sections
            const aboutIndex = parts
              .slice(parts.length - 2, parts.length)
              .join("/");

            // Remove the file extension ".html"
            const key = aboutIndex.replace(".html", "");
            ui[key] = `${file}`;
            // console.log("ui", ui);
            return ui;
          },
          {} as Record<string, string>
        );
        console.log("manifest.ui", manifest.ui);
        await fs.promises.writeFile(
          originalManifestPath,
          JSON.stringify(manifest, null, 2)
        );
      }
    },

    typeInfo() {
      return "{}";
    },
  };

  return adapter;
}
