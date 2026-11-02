/* Keep historical hash links usable while exposing crawlable page URLs. */
(() => {
  const productPath = slug => `/products/${slug}/`;
  const updateLinks = () => {
    document.querySelectorAll('a[href^="#/"]').forEach(a => {
      const href = a.getAttribute('href');
      a.setAttribute('href', href.startsWith('#/piece/') ? productPath(href.slice(8)) : '/');
    });
    document.querySelectorAll('a[href="#about"],a[href="#policy"],a[href="#contact"],a[href="#gallery-anchor"],a[href="#accessibility-statement"]').forEach(a => a.setAttribute('href', '/' + a.getAttribute('href')));
    document.querySelectorAll('.chip').forEach(b => {
      b.onclick = () => location.assign(b.dataset.cat === 'all' ? '/#gallery-anchor' : `/categories/${b.dataset.cat}/`);
    });
  };
  const legacy = location.hash.match(/^#\/piece\/([^/]+)$/);
  if (legacy && TRIKOMIK.products.some(p => p.slug === legacy[1])) {
    location.replace(productPath(legacy[1]));
    return;
  }
  updateLinks();
  new MutationObserver(updateLinks).observe(document.getElementById('app'), {childList: true, subtree: true});
})();
