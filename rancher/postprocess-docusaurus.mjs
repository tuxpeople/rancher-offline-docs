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
    .replace(/<script\b[^>]*cdn\.cookielaw\.org[^>]*><\/script>/gi, "")
    .replace(/<script\b[^>]*\/scripts\/optanonwrapper\.js[^>]*><\/script>/gi, "")
    .replace(/\b(href|src)="\/(?!\/)/g, `$1="${prefix}`)
    .replace(/\b(content)="\/(?!\/)/g, `$1="${prefix}`)
    .replace(/url\("\/(?!\/)/g, `url("${prefix}`)
    .replace(/url\('\/(?!\/)/g, `url('${prefix}`);
}

const proxyBootstrap = `<script>
(()=>{const m=location.pathname.match(/^(.*\\/proxy\\/)/),b=m?m[1]:"/";
if(b==="/")return;const fix=u=>{if(!u||typeof u!=="string"||!u.startsWith("/")||u.startsWith("//")||u.startsWith(b))return u;return b+u.slice(1)};
const fixElement=n=>{if(n.nodeType!==1)return;for(const a of["href","src"])if(n.hasAttribute(a))n.setAttribute(a,fix(n.getAttribute(a)))};
const rewrite=n=>{fixElement(n);n.querySelectorAll?.("[href],[src]").forEach(fixElement)};
rewrite(document.documentElement);new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(rewrite))).observe(document.documentElement,{childList:true,subtree:true});
addEventListener("click",e=>{const a=e.target.closest?.("a[href]");if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const u=new URL(a.href,location.href);if(u.origin===location.origin&&u.pathname.startsWith(b)){e.preventDefault();e.stopImmediatePropagation();location.assign(u.href)}},true);
for(const k of["pushState","replaceState"]){const n=history[k].bind(history);history[k]=(s,t,u)=>{if(typeof u==="string"&&u.startsWith("/")&&!u.startsWith(b)){const target=fix(u);k==="replaceState"?location.replace(target):location.assign(target);return}return n(s,t,u)}}
})();
</script>`;

function redirectPage(target) {
  return `<!doctype html><meta charset="utf-8"><script>location.replace(new URL(${JSON.stringify(target)},location.href.endsWith("/")?location.href:location.href+"/"))</script>`;
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
    const patched = relativizeHtml(content, rootPrefix(file))
      .replace(/<head([^>]*)>/i, `<head$1>${proxyBootstrap}`);
    await writeFile(file, patched);
  } else if (/runtime~main\..*\.js$/.test(file)) {
    const content = await readFile(file, "utf8");
    await writeFile(file, patchWebpackRuntime(content));
  }
}

if (process.env.OFFLINE_DOCS_ROOT_TARGET) {
  await writeFile(join(buildDir, "index.html"), redirectPage(process.env.OFFLINE_DOCS_ROOT_TARGET));
}
