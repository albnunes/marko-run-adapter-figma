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
