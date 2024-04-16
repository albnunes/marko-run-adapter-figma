<h1 align="center">
  <!-- Logo -->
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://github.com/marko-js/run/raw/main/assets/marko-run-darkmode.png">
    <source media="(prefers-color-scheme: light)" srcset="https://github.com/marko-js/run/raw/main/assets/marko-run.png">
    <img alt="Marko Run Logo" src="https://github.com/marko-js/run/raw/main/assets/marko-run.png" width="400">
  </picture>
  <br/>
  @marko-polo/run-adapter-figma
 <br/>
</h1>

<h3 align="center">Build Figma plugins using <a href="https://github.com/marko-js/run">Marko Run</a></h3>

## How it Works

As you probably know, Figma plugin pages need to embed all assets. You cannot make requests from the UI to the plugin's main thread to get additional assets.

Here's what this adapter does:

1. Builds your plugin using the [static adapter](https://github.com/marko-js/run/blob/main/packages/adapters/static/README.md)
2. Then, for each generated page it:
   1. Parses the pages's HTML to get all the assets (js, images, and css) using [htmlparser2](https://github.com/fb55/htmlparser2)
   2. Uses [esbuild](esbuild.github.io) to bundle all the js into a single [IIFE](https://en.wikipedia.org/wiki/Immediately_invoked_function_expression)
   3. Inlines all assets into the HTML
   4. Updates the plugin's `manifest.json` with the path to each page

> **NOTE:**
> Only `<script>`, `<img>`, and `<link>` tags will be processed
> and they will **only** be inlined if their source is a local file.

## Intallation

```sh
npm install @marko-polo/run-adapter-figma
```

## Usage

In your application's Vite config file (eg. `vite.config.js`), import and register this adapter with the `@marko/run` Vite plugin:

```ts
import { defineConfig } from "vite";
import marko from "@marko/run/vite";
import figmaAdapter from "@marko/run-adapter-figma";

export default defineConfig({
  plugins: [
    marko({
      adapter: figmaAdapter()
    })
  ]
});
```

## Contributing

### Tooling

To improve and automate the developer experience, the following tooling has been automatically
installed and [pre-configured using moonrepo presets](https://github.com/moonrepo/dev).

- [Babel](https://babeljs.io/) for transpiling, configured with
  [babel-preset-moon](https://www.npmjs.com/package/babel-preset-moon).
- [ESLint](https://eslint.org/) for linting, configured with
  [eslint-config-moon](https://www.npmjs.com/package/eslint-config-moon).
- [Prettier](https://prettier.io/) for code formatting, configured with
  [prettier-config-moon](https://www.npmjs.com/package/prettier-config-moon).
- [Rollup](https://rollupjs.org) for bundling and distributing, configured dynamically with
  Packemon.
- [TypeScript](https://www.typescriptlang.org/) for type checking, configured with
  [tsconfig-moon](https://www.npmjs.com/package/tsconfig-moon).

Feel free to use the configuration as-is, or to modify, or to not use moon, the choice is yours!

### Commands

The tooling mentioned above can be ran with the following yarn/npm scripts. For example,
`yarn run build`.

#### Build & deploy

- `build` - Build the package(s) with Packemon. Useful for development, as it will only build
  JavaScript targets. Use `pack` for distribution.
- `clean` - Clean all output targets that were built with Packemon.
- `pack` - Clean, build, and validate the package(s) with Packemon. Designed for production and
  should be ran before a release.
- `release` - Pack the package(s), run test checks, and publish to npm! _(Release script not
  configured by Packemon)_
- `validate` - Validate the package(s), ensuring their `package.json` is defined correctly.
- `watch` - Watch for file changes and rebuild the target package. Useful for development.

#### Development & testing

- `check` - Run the type checker, linter, and testing suite all at once.
- `format` - Run Prettier and format all files in the project.
- `lint` - Run the linter with ESLint.
- `test`, `coverage` - Run the unit testing suite with Vitest, and optionally with code coverage.
- `type` - Run the type checker with TypeScript.
