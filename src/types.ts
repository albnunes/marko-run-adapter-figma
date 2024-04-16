import {
  type Options as StaticAdapterOptions,
} from "@marko/run-adapter-static";

export interface StartOptions {
  cwd: string;
  args: string[];
  port?: number;
  envFile?: string;
}

export interface StartDevOptions extends StartOptions {}

export interface StartPreviewOptions extends StartOptions {
  dir: string;
  entry?: string;
}

export interface FigmaAdapterOptions extends StaticAdapterOptions {
  // Options to pass to html-minifier-terser for minifying the HTML output.
  htmlMinifierOptions?: {};
}