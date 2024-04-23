import esbuild from 'esbuild';

export function bundleJs(path: string) {
  try {
    // Call esbuild's build function with desired options
    const result = esbuild.buildSync({
      entryPoints: [path],
      platform: 'browser', // Target platform
      format: 'iife', // Output format (Immediately-Invoked Function Expression)
      bundle: true, // Bundle all imports
      write: false, // Do not write to file
      minify: true, // Optional: Minify the code
    });

    const { contents } = result.outputFiles[0];
    const code = new TextDecoder("utf-8").decode(contents);
    return code
  } catch (err) {
    console.error('Error during build:', err);
    throw err;
  }
}
export function bundleFigmaCode(path: string) {
  try {
    // Call esbuild's build function with desired options
    const result = esbuild.buildSync({
      entryPoints: [path],
      outdir:".marko-run/figma-adapter",
      // outfile:"code.js",
      platform: 'node', // Target platform
      format: 'iife', // Output format (Immediately-Invoked Function Expression)
      bundle: true, // Bundle all imports
      minify: true, // Optional: Minify the code
    });

    return result
  } catch (err) {
    console.error('Error during build:', err);
    throw err;
  }
}