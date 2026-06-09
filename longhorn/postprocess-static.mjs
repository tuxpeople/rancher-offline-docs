import { lstat, readdir, readFile, writeFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const buildDir = process.argv[2] || "public";

async function walk(dir) {
  const files = [];
  for (const entry of await readdir(dir)) {
    const path = join(dir, entry);
    const info = await lstat(path);
    if (info.isDirectory()) files.push(...await walk(path));
    else if (info.isFile()) files.push(path);
  }
  return files;
}

function rootPrefix(file) {
  const depth = relative(buildDir, file).split(sep).length - 1;
  return depth <= 0 ? "./" : "../".repeat(depth);
}

const proxyBootstrap = `<script>
(()=>{const m=location.pathname.match(/^(.*\\/proxy\\/)/),b=m?m[1]:"/";
if(b==="/")return;const fix=u=>{if(!u||typeof u!=="string"||!u.startsWith("/")||u.startsWith("//")||u.startsWith(b))return u;return b+u.slice(1)};
const fixElement=n=>{if(n.nodeType!==1)return;for(const a of["href","src"])if(n.hasAttribute(a))n.setAttribute(a,fix(n.getAttribute(a)))};
const rewrite=n=>{fixElement(n);n.querySelectorAll?.("[href],[src]").forEach(fixElement)};
rewrite(document.documentElement);new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(rewrite))).observe(document.documentElement,{childList:true,subtree:true});
addEventListener("click",e=>{const a=e.target.closest?.("a[href]");if(!a||e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;const u=new URL(a.href,location.href);if(u.origin===location.origin&&u.pathname.startsWith(b)){e.preventDefault();e.stopImmediatePropagation();location.assign(u.href)}},true);
})();
</script>`;

for (const file of await walk(buildDir)) {
  if (!file.endsWith(".html")) continue;
  const prefix = rootPrefix(file);
  const content = await readFile(file, "utf8");
  const patched = content
    .replace(/\b(href|src)="https:\/\/longhorn\.io\/(?!\/)/g, `$1="${prefix}`)
    .replace(/\b(href|src)="\/(?!\/)/g, `$1="${prefix}`)
    .replace(/<head([^>]*)>/i, `<head$1>${proxyBootstrap}`);
  await writeFile(file, patched);
}
