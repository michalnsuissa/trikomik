// Generate static HTML pages from the same catalog used by the interactive shop.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = __dirname;
const context = {};
vm.runInNewContext(fs.readFileSync(path.join(root,'js/data.js'),'utf8') + '\nthis.catalog = TRIKOMIK;', context);
const D = context.catalog, origin = 'https://trikomik.com';
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = p => p.comingSoon ? 'בקרוב' : p.price + ' ₪';
const categoryFallback = {
 bags: 'תיקים סרוגים בעבודת יד, במגוון צבעים ועיצובים. גלו את המידות, החומרים והמחירים ובחרו תיק שמתאים לכם.',
 birth: 'מארזי לידה בעבודת יד עם סלסלאות סרוגות ופריטים לתינוק וליולדת. איסוף עצמי באשדוד ומשלוחים בהתאם לאזור החלוקה.',
 gifts: 'מארזי מתנה בעבודת יד לבית, לחגים ולאנשים שרוצים לשמח. פריטים סרוגים ושילובים אישיים מבית TrikoMik באשדוד.',
 extras: 'פריטים סרוגים בעבודת יד להשלמת המתנה ולעיצוב הבית. פרטים, מידות ומחירים לכל מוצר.',
 workshops: 'סדנאות סריגה למתחילות ולמתחילים וחוגי סריגה שבועיים באשדוד. פרסום המועדים בקרוב.'
};
const categoryCopy = Object.fromEntries(D.categories.filter(c=>c.id!=='all').map(c=>[c.id,c.description||categoryFallback[c.id]]));
let shell = fs.readFileSync(path.join(root,'index.html'),'utf8');
const card = p => `<a class="card ${p.category==='birth'?'card-tall':''}" href="/products/${p.slug}/"><span class="card-media"><img src="/${p.images[0]}" alt="${esc(p.name)}" loading="lazy"><span class="card-price">${money(p)}</span></span><span class="card-body"><span class="card-name">${esc(p.name)}</span><span class="card-more">לפרטים ←</span></span></a>`;
const links = D.categories.filter(c=>c.id!=='all').map(c=>`<a class="chip" href="/categories/${c.id}/">${c.label}</a>`).join(' ');
const organization = {'@type':'Organization',name:'TrikoMik',url:origin,logo:origin+'/'+D.brand.logo,telephone:D.brand.phone,sameAs:[D.brand.instagram,D.brand.facebook,D.brand.tiktok]};
const website = { '@type': 'WebSite', url: origin + '/', name: D.brand.hebrewName, alternateName: D.brand.name };
function page(url,title,description,body,entities=[]) {
 let html = shell.replace(/<main id="app"[\s\S]*?<\/main>/,`<main id="app" tabindex="-1">${body}</main>`);
 html=html.replace(/<title>.*?<\/title>/,`<title>${esc(title)}</title>`)
 .replace(/<meta name="description" content="[^"]*">/,`<meta name="description" content="${esc(description)}">`)
 .replace(/<link rel="canonical" href="[^"]*">/,`<link rel="canonical" href="${url}">`)
 .replace(/<meta property="og:title" content="[^"]*">/,`<meta property="og:title" content="${esc(title)}">`)
 .replace(/<meta property="og:description" content="[^"]*">/,`<meta property="og:description" content="${esc(description)}">`)
 .replace(/<meta property="og:url" content="[^"]*">/,`<meta property="og:url" content="${url}">`)
 .replace(/(href|src)="(img|css|js)\//g,'$1="/$2/')
 .replace(/href="#\//g,'href="/#/').replace(/href="#(about|policy|contact|gallery-anchor|accessibility-statement)"/g,'href="/#$1"');
 html=html.replace(/<script type="application\/ld\+json" id="seo-schema">[\s\S]*?<\/script>/g,'');
 const schema={'@context':'https://schema.org','@graph':[organization,...entities]};
 html=html.replace(/<base href="\/">/g,'');
 return html.replace('</head>',`<base href="/"><script type="application/ld+json" id="seo-schema">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script>\n</head>`);
}
const urls=[origin+'/'];
for(const p of D.products){
 const url=origin+'/products/'+p.slug+'/'; urls.push(url);
 const body=`<nav class="crumbs container"><a href="/">החנות</a> / <a href="/categories/${p.category}/">${D.categories.find(c=>c.id===p.category).label}</a></nav><section class="piece container"><div class="piece-gallery"><figure class="piece-main"><img src="/${p.images[0]}" alt="${esc(p.name)}"></figure></div><div class="piece-info"><h1>${esc(p.name)}</h1><p class="piece-price">${money(p)}</p><a class="btn btn-primary" href="${D.brand.whatsapp}">להזמנה</a>${p.description.map(t=>`<p>${esc(t)}</p>`).join('')}<h2>פרטים</h2><ul>${(p.details||[]).map(t=>`<li>${esc(t)}</li>`).join('')}</ul>${p.note?`<p>${esc(p.note)}</p>`:''}<dl>${(p.specs||[]).map(s=>`<dt>${esc(s.label)}</dt><dd>${esc(s.value)}</dd>`).join('')}</dl><h2>משלוחים</h2><p>${esc(D.delivery)}</p></div></section>`;
 const entities=[];
 if(p.category!=='workshops') entities.push({'@type':'Product',name:p.name,description:p.description.join(' '),image:p.images.map(i=>origin+'/'+i),url,brand:{'@type':'Brand',name:'TrikoMik'},offers:{'@type':'Offer',priceCurrency:'ILS',price:p.price,url}});
 entities.push({'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'החנות',item:origin+'/'},{'@type':'ListItem',position:2,name:D.categories.find(c=>c.id===p.category).label,item:origin+'/categories/'+p.category+'/'},{'@type':'ListItem',position:3,name:p.name,item:url}]});
 const target=path.join(root,'products',p.slug);fs.mkdirSync(target,{recursive:true});
 let html=page(url,p.name+' | TrikoMik',p.description[0],body,entities).replace(/<meta property="og:image" content="[^"]*">/,`<meta property="og:image" content="${origin+'/'+p.images[0]}">`);
 html=html.replace(/\s*<meta property="og:image:(width|height|type)"[^>]*>/g,'');
 fs.writeFileSync(path.join(target,'index.html'),html);
}
for(const c of D.categories.filter(c=>c.id!=='all')){
 const url=origin+'/categories/'+c.id+'/';urls.push(url);
 const products=D.products.filter(p=>p.category===c.id);
 const heading = c.heading || c.label;
 const title = c.heading ? `${c.heading} | ${D.brand.hebrewName}` : c.label + ' בעבודת יד באשדוד | TrikoMik';
 const body=`<section class="gallery container" id="gallery-anchor"><h1>${esc(heading)}</h1><p>${esc(categoryCopy[c.id])}</p><nav aria-label="קטגוריות החנות">${links}</nav><div class="grid" id="grid">${products.map(card).join('')}</div></section>`;
 const target=path.join(root,'categories',c.id);fs.mkdirSync(target,{recursive:true});fs.writeFileSync(path.join(target,'index.html'),page(url,title,categoryCopy[c.id],body));
}
const homeBody=`<section class="about container"><h1>${esc(D.brand.hebrewName)} | ${esc(D.brand.name)} – סריגה בעבודת יד באשדוד</h1><p>${esc(D.brand.description)}</p><nav aria-label="קטגוריות החנות">${links}</nav></section><section class="gallery container" id="gallery-anchor"><details class="shop-catalog-disclosure"><summary class="btn btn-primary">לחנות</summary><h2>החנות</h2><div class="grid" id="grid">${D.products.map(card).join('')}</div></details></section><section class="container"><h2>משלוחים</h2><p>${esc(D.delivery)}</p></section>`;
const homeDescription = `${D.brand.hebrewName} | ${D.brand.name}. מארזי לידה, תיקים סרוגים, סלסלאות ומתנות בעבודת יד באשדוד. בחרו דגם, ראו מחירים ופרטים והזמינו ישירות ממיכל.`;
fs.writeFileSync(path.join(root,'index.html'),page(origin+'/',D.brand.homeTitle,homeDescription,homeBody,[website]));
fs.writeFileSync(path.join(root,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+urls.map(u=>`<url><loc>${u}</loc></url>`).join('\n')+'\n</urlset>\n');
console.log(`Generated ${urls.length} crawlable pages.`);
