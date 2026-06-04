import { lstat, readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const buildDir = process.argv[2] || "build";

async function walk(dir) {
  const entries = await readdir(dir);
  const files = [];

  for (const entry of entries) {
    const path = join(dir, entry);
    const info = await lstat(path);
    if (info.isDirectory()) {
      files.push(...await walk(path));
    } else if (info.isFile()) {
      files.push(path);
    }
  }

  return files;
}

function rootPrefix(htmlFile) {
  const rel = relative(buildDir, htmlFile).split(sep);
  const depth = rel.length - 1;
  return depth <= 0 ? "./" : "../".repeat(depth);
}

function relativizeHtml(content, prefix) {
  return content
    .replace(/\b(href|src)="\/(?!\/)/g, `$1="${prefix}`)
    .replace(/\b(content)="\/(?!\/)/g, `$1="${prefix}`)
    .replace(/url\("\/(?!\/)/g, `url("${prefix}`)
    .replace(/url\('\/(?!\/)/g, `url('${prefix}`);
}

function patchWebpackRuntime(content) {
  const dynamicPublicPath =
    't.p=(()=>{try{return new URL("../../",document.currentScript.src).pathname}catch(e){return"/"}})()';

  return content.replace(/t\.p="\/"/g, dynamicPublicPath);
}

const files = await walk(buildDir);

for (const file of files) {
  if (file.endsWith(".html")) {
    const content = await readFile(file, "utf8");
    await writeFile(file, relativizeHtml(content, rootPrefix(file)));
  } else if (/runtime~main\..*\.js$/.test(file)) {
    const content = await readFile(file, "utf8");
    await writeFile(file, patchWebpackRuntime(content));
  }
}
