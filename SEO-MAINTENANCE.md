# Static catalog pages

After any catalog, template, image, price, or shared stylesheet/script version change, run `node build-seo.cjs` from this directory. Commit the generated `products/`, `categories/`, root `index.html`, and `sitemap.xml` alongside the source change. Never update only the client catalog: the initial HTML and structured data must agree with the visible shop.

Existing `/#/piece/<slug>` links are redirected in the browser to `/products/<slug>/`. Fragments are not sent to the host, so these cannot be HTTP redirects. Do not delete the legacy compatibility code.

No stock, ratings, workshop dates, or shipping prices are inferred. Search Console submission and indexing checks require the owner's connected account; the presence of a verification tag alone does not establish account access.
