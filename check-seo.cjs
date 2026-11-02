const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=__dirname;
let count=0;
for(const match of fs.readFileSync(path.join(root,'sitemap.xml'),'utf8').matchAll(/<loc>https:\/\/trikomik.com([^<]*)<\/loc>/g)){
 const url=match[1],html=fs.readFileSync(path.join(root,url,'index.html'),'utf8');
 assert(html.includes(`rel="canonical" href="https://trikomik.com${url}"`));
 assert(!html.includes('NaN'));
 assert.equal((html.match(/id="seo-schema"/g)||[]).length,1);
 const schema=JSON.parse(html.match(/id="seo-schema">([\s\S]*?)<\/script>/)[1]);
 for(const entity of schema['@graph']) if(entity['@type']==='Product') assert(Number.isFinite(entity.offers.price));
 for(const asset of html.matchAll(/(?:href|src)="\/(img|css|js)\/([^"?#]+)/g)) assert(fs.existsSync(path.join(root,asset[1],asset[2])),asset[0]);
 assert(html.includes('<h1>'));
 count++;
}
assert(count>30);
console.log(`Validated ${count} static pages, canonical URLs, structured data, headings and local assets.`);
