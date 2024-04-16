import * as cheerio from 'cheerio';
import fs from 'node:fs/promises';
import path from 'node:path';
import { bundleJs } from './bundleJs';

const urlRegex = /http?:\/\/[^\s]+/gi;

/**
 * Inline CSS, JS, and images into the HTML content.
 *
 * This function takes HTML content and a path to the public assets directory,
 * then finds all references to external CSS and JS files, as well as image sources,
 * and replaces them with inlined content within the HTML.
 *
 * @param {string} html - The HTML content.
 * @param {string} publicPath - The public path where static assets are served from.
 * @returns {Promise<string>} - The HTML content with resources inlined.
 */
export async function inlineAssets(html: string, publicPath: string): Promise<string> {



  const $ = cheerio.load(html);
  const cssPromise = inlineCss($, publicPath)
  const imgPromise = inlineImg($, publicPath)
  const jsPromise = inlineJs($, publicPath)
  // Inline CSS files
  
  await Promise.allSettled([cssPromise, imgPromise, jsPromise])

  return $.html()
}

async function inlineCss($: cheerio.CheerioAPI, publicPath: string) {
  for (const element of $('link[href$=".css"]')) {
    const link = $(element);
    const href = link.attr('href') || '';
    if (!urlRegex.test(href)) {
      const cssPath = path.join(publicPath, href || '');
      const cssContent = await fs.readFile(cssPath, { encoding: 'utf8' });
      // console.log('Css Content', cssContent);
      link.replaceWith(`<style>${cssContent}</style>`);
    }
  };
}
async function inlineImg($: cheerio.CheerioAPI, publicPath: string) {
  for (const element of $('img')) {
    const img = $(element);
    const src = img.attr('src') || '';
    if (!src.startsWith('data:')) {
      const imgPath = path.join(publicPath, src);
      const imgContent = await fs.readFile(imgPath);
      const mimeType = path.extname(imgPath).slice(1);
      const dataUri = `data:image/${mimeType};base64,${imgContent.toString('base64')}`;
      img.attr('src', dataUri);
    }
  }
}
async function inlineJs($: cheerio.CheerioAPI, publicPath: string) {
  for (const element of $('script[src$=".js"]')) {
    const script = $(element);
    const src = script.attr('src') || '';
    if (!urlRegex.test(src)) {

      const jsPath = path.join(publicPath, src || '');

      const bundledJs = bundleJs(jsPath);

      const jsCode = `<script>${bundledJs}</script>`

      script.replaceWith(jsCode);

    }

  }

  for (const element of $('link[rel="modulepreload"][href$=".js"]')) {
    const link = $(element);
    const href = link.attr('href') || '';
    if (!urlRegex.test(href)) {
      link.replaceWith(` `);
    }
  }

}