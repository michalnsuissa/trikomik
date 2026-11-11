/* TrikoMik — hash router, gallery, piece detail, lightbox */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const B = TRIKOMIK.brand;
  const fmt = (n) => new Intl.NumberFormat("he-IL").format(n) + " ₪";
  const waMsg = (p) =>
    `שלום מיכל! אני מתעניינ/ת ב${p.name} מהאתר של TrikoMik 💜`;
  const couponCode = "TRIKO20";
  const couponStarts = Date.parse("2026-11-27T00:00:00+02:00");
  const couponEnds = Date.parse("2026-11-28T00:00:00+02:00");

  /* ---------- router ---------- */
  const routes = {
    "": home,
    home: home,
    piece: piece,
  };

  function parseHash() {
    if (!location.hash.startsWith("#/")) {
      const parts = location.pathname.split("/").filter(Boolean);
      if (parts[0] === "products") return {route: "piece", param: parts[1]};
      if (parts[0] === "categories") return {route: "category", param: parts[1]};
    }
    const h = location.hash.replace(/^#\/?/, "");
    const [route, param] = h.split("/");
    return { route: routes[route] ? route : "", param };
  }

  let stopHeroCarousel = () => {};
  function navigate() {
    const hash = location.hash;
    /* in-page anchors (#about, #policy) — let the browser scroll natively */
    if (hash && hash[1] !== "/") {
      if (!$(".hero", $("#app"))) home(); /* render home before resolving an anchor */
      const target = document.getElementById(hash.slice(1));
      if (hash === "#product-catalog" && target) target.open = true;
      requestAnimationFrame(() => target?.scrollIntoView());
      return;
    }
    stopHeroCarousel();
    const { route, param } = parseHash();
    window.scrollTo(0, 0);
    if (route === "piece") piece(param);
    else {
      home();
      if (route === "category") {
        const category = TRIKOMIK.categories.find(c => c.id === param);
        if (category) {
          renderGrid(param);
          document.querySelectorAll("[data-cat]").forEach(b => { b.setAttribute("aria-pressed", String(b.dataset.cat === param)); b.classList.toggle("active", b.dataset.cat === param); });
          stopHeroCarousel();
          document.querySelector(".hero")?.remove();
          document.querySelector("#about")?.remove();
          const heading = document.querySelector(".gallery-head h2");
          const title = document.createElement("h1");
          title.textContent = category.heading || category.label;
          heading.replaceWith(title);
          document.querySelector(".gallery-head p").textContent = category.description || "כל פריט נסרג ביד, אחד לאחד. לחיצה על פריט תפתח את כל הפרטים והמידות";
          requestAnimationFrame(() => document.getElementById("gallery-anchor").scrollIntoView());
        }
      }
    }
  }
  window.addEventListener("hashchange", navigate);
  $('header a[href="/#product-catalog"]')?.addEventListener("click", () => {
    if (location.pathname === "/" && location.hash === "#product-catalog") navigate();
  });

  /* ---------- shared header/footer bits ---------- */
  function waLink(text) {
    const encoded = encodeURIComponent(text);
    const base =
      B.whatsapp +
      (B.whatsapp.includes("?") ? "&" : "?") +
      "text=" +
      encoded;
    return base;
  }

  /* ---------- product sharing ---------- */
  const shareIcon = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/></svg>';
  function shareButton(p) {
    return `<div class="product-share"><button type="button" class="btn btn-outline product-share-button" data-share-slug="${p.slug}">${shareIcon} שיתוף</button><span class="product-share-status" role="status" aria-live="polite"></span></div>`;
  }
  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-share-slug]");
    if (!button) return;
    const p = TRIKOMIK.products.find(p => p.slug === button.dataset.shareSlug);
    if (!p) return;
    const status = button.parentElement.querySelector(".product-share-status");
    const url = `https://trikomik.com/products/${encodeURIComponent(p.slug)}/`;
    status.textContent = "";
    button.disabled = true;
    try {
      if (navigator.share) {
        try {
          await navigator.share({ title: `${p.name} | TrikoMik`, url });
          return;
        } catch (error) {
          if (error.name === "AbortError") return;
        }
      }
      try {
        await navigator.clipboard.writeText(url);
        status.textContent = "הקישור הועתק";
      } catch {
        window.prompt("העתיקו את הקישור למוצר:", url);
      }
    } finally {
      button.disabled = false;
    }
  });

  /* ---------- home ---------- */
  function home() {
    const aboutIntro = B.description.replace(/^ברוכים הבאים ל-TrikoMik 💜 /, "");
    const introEnd = aboutIntro.indexOf(". ") + 1;
    const currentCategory = location.pathname.match(/^\/categories\/([^/]+)\//)?.[1];
    const category = TRIKOMIK.categories.find(c => c.id === currentCategory);
    document.title = category?.heading
      ? `${category.heading} | ${B.hebrewName}`
      : currentCategory ? `${category?.label || "החנות"} | ${B.name}` : B.homeTitle;
    const app = $("#app");
    const slides = TRIKOMIK.products.flatMap(p => p.images.map(src => ({ src, name: p.name, slug: p.slug })));
    for (let i = slides.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [slides[i], slides[j]] = [slides[j], slides[i]]; }

    app.innerHTML = `
      <section class="hero">
        <div class="container hero-inner">
          <div class="hero-copy">
            <img class="hero-brand-logo" src="img/trikomik-logo-transparent.png" alt="TRIKOMIK">
            <h1 class="hero-title">סרוג באהבה,<br><span class="hero-title-accent">נוצר במיוחד בשבילך</span></h1>
            <p class="hero-text">מארזי לידה • סלסלות מעוצבות • תיקים בהתאמה אישית • סדנאות סריגה<br>הכל 100% עבודת יד</p>
            <div class="hero-actions">
              <a class="btn btn-primary" href="#gallery-anchor">לקטלוג המוצרים <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg></a>
              <a class="btn btn-ghost" href="${waLink("שלום מיכל! הגעתי לאתר של TrikoMik 💜")}">להזמנה והתאמה אישית בוואטסאפ</a>
            </div>
          </div>
          <div class="hero-art hero-carousel" role="region" aria-roledescription="קרוסלה" aria-label="מוצרים מהחנות">
            <a class="hero-slide" href="#/piece/${slides[0].slug}"><img src="${slides[0].src}" alt="${slides[0].name}" loading="eager"><span class="hero-slide-name">${slides[0].name}</span></a>
            <div class="hero-carousel-controls">
              <button type="button" class="hero-pause" aria-pressed="false">השהיית תמונות</button>
              <button type="button" class="hero-prev" aria-label="תמונה קודמת">→</button>
              <span class="hero-slide-count" aria-live="off">1 / ${slides.length}</span>
              <button type="button" class="hero-next" aria-label="תמונה הבאה">←</button>
            </div>
          </div>
        </div>
      </section>

      <section class="about container" id="about">
        <div class="about-card">
          <div>
            <h2 class="about-heading"><span>ברוכים הבאים ל${B.hebrewName}</span><img class="about-heading-logo" src="${B.logo}" alt="${B.name}"></h2>
            <p>${aboutIntro.slice(0, introEnd)}</p>
            <details class="about-more">
              <summary>קרא עוד</summary>
              <p>${aboutIntro.slice(introEnd).trim()}</p>
              <div class="about-personal">
              <h3>למה לבחור בי?</h3>
              <p>מאחורי כל פריט של TrikoMik עומדת אני, מיכל, עם אהבה לסריגה, לצבעים ולפרטים הקטנים שהופכים מתנה לאישית ומרגשת.</p>
              <p>אני בוחרת את שילובי הצבעים, סורגת ביד ומקדישה תשומת לב לכל גימור. חשוב לי שהפריט שתבחרו יהיה יפה, שימושי וכזה שכיף להעניק וגם לקבל.</p>
              <p>מההתלבטות הראשונה ועד לבחירה הסופית, אני כאן כדי להקשיב ולעזור למצוא את מה שמתאים לכם. אפשר להתייעץ איתי על צבעים והתאמות אישיות, בהתאם למוצר ולחומרים הקיימים במלאי.</p>
              <p>כי בשבילי, כל הזמנה היא הזדמנות לשמח מישהו דרך משהו שיצרתי בידיים ועם הלב. 💜</p>
              </div>
            </details>
            <div class="about-social">
              <a href="${B.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ICONS.instagram}<span>Instagram</span></a>
              <a href="${B.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${ICONS.facebook}<span>Facebook</span></a>
              <a href="${B.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">${ICONS.tiktok}<span>TikTok</span></a>
              <a href="tel:${B.phone}" aria-label="טלפון">${ICONS.phone}<span>${B.phoneDisplay}</span></a>
            </div>
          </div>
        </div>
      </section>

      <section class="gallery container" id="gallery-anchor">
        ${currentCategory ? "" : `${shopTiles()}
        <details id="product-catalog" class="shop-catalog-disclosure">
          <summary class="btn btn-primary">לחנות</summary>`}
        <div class="gallery-head">
          <h2>החנות</h2>
          <p>כל פריט נסרג ביד, אחד לאחד. לחיצה על פריט תפתח את כל הפרטים והמידות</p>
          <div class="filter-chips" role="group" aria-label="סינון לפי קטגוריה">
            ${TRIKOMIK.categories
              .map(
                (c, i) =>
                  `<button class="chip ${i === 0 ? "active" : ""}" aria-pressed="${i === 0}" data-cat="${c.id}">${c.label}</button>`
              )
              .join("")}
          </div>
        </div>
        <div class="grid" id="grid"></div>
        <p id="gallery-status" class="sr-only" role="status"></p>
        <div id="grid-empty" class="grid-empty" hidden>אין פריטים בקטגוריה הזו כרגע</div>
        ${currentCategory ? "" : "</details>"}
      </section>

      <section class="policy container" id="policy">
        <div class="policy-grid">
          <div class="policy-block">
            <h3><span class="icon">${ICONS.truck}</span> משלוחים</h3>
            <p>מארזי לידה: איסוף עצמי באשדוד בתיאום מראש, או משלוח ליישובים בעמוד המארז ב־50 ש״ח כולל מע״מ.</p>
            <p>שאר המוצרים: משלוח באשדוד ללא תשלום, או איסוף עצמי ללא תשלום בתיאום מראש. מחוץ לאשדוד, דואר ישראל אקספרס ליישובים שברשימה. עד 1 ק״ג כולל אריזה ב־67 ש״ח, ומעל 1 ק״ג ועד 2 ק״ג ב־73 ש״ח.</p>
            <p>ניסיון מסירה תוך 2–3 ימי עסקים לפי היישוב, ממסירת החבילה לדואר. זמן הכנת ההזמנה מתווסף לזמן המשלוח.</p>
          </div>
          <div class="policy-block"><h3>קנייה בלב שקט</h3><p>${TRIKOMIK.returnPolicyIntro}</p><details class="policy-disclosure">
            <summary>לפירוט תנאי הביטולים וההחזרות</summary>
            <p>${TRIKOMIK.returnPolicyMain}</p>
            <a class="btn btn-outline" href="${waLink("שלום מיכל, אבקש לבטל הזמנה. השם שלי: ____; פרטי ההזמנה: ____")}" target="_blank" rel="noopener">בקשת ביטול הזמנה</a>
            <ul class="policy-list">
              ${TRIKOMIK.returnPolicy
                .map((r) => `<li><strong>${r.title}:</strong> ${r.text}</li>`)
                .join("")}
            </ul>
          </details></div>
        </div>
      </section>

      <section class="reviews-section container" id="reviews" aria-labelledby="reviews-title">
        <span class="reviews-eyebrow">מילים טובות, מהלב</span>
        <h2 id="reviews-title">לקוחות ממליצים</h2>
        <p>כל פריט נסרג באהבה, והכי מרגש לשמוע איך הוא השתלב אצלכם בבית או שימח מישהו אהוב.</p>
        <p>אפשר למצוא המלצות על TrikoMik גם בגוגל וגם באתר ״עסקים עושים עסקים״.</p>
        <p>שליחת המלצה היא לבחירתכם. מיכל ב־TrikoMik מקבלת את הפרטים לבדיקה באמצעות Cloudflare. אחרי אישור, השם, ההמלצה והתמונה שתבחרו לצרף עשויים להתפרסם באתר. <a href="/privacy/">הצהרת פרטיות וזכויות עיון ותיקון</a></p>
        <form id="review-form" class="review-form">
<h3>שתפו אותנו בחוויה שלכם</h3><label>השם שיוצג לצד ההמלצה<input name="name" required maxlength="60" autocomplete="name"></label><label>ההמלצה שלכם<textarea name="text" required minlength="10" maxlength="1500" rows="5"></textarea></label><label>תמונה (לא חובה)<input name="photo" type="file" accept="image/jpeg,image/png,image/webp"><small>JPG, PNG או WebP, עד 4 מגה־בייט.</small></label><label class="review-consent"><input name="consent" type="checkbox" required>אני מאשר/ת לפרסם באתר את השם, ההמלצה והתמונה שצירפתי, ויש לי רשות לשתף את התמונה.</label><p>ההמלצה תישמר ותועבר לבדיקה לפני פרסומה באתר.</p><button class="btn btn-primary" type="submit">שליחת המלצה</button><p role="status" id="review-status" aria-live="polite"></p></form><div class="reviews-actions"><a class="btn btn-outline" href="https://www.google.com/maps/place/TrikoMik/data=!4m2!3m1!1s0x1502a3097aab1d33:0x50b11b3d99a5fce0" target="_blank" rel="noopener">להמלצות בגוגל ↗</a><a class="btn btn-outline" href="https://www.bizmakebiz.co.il/Members/e6665745-7c43-4190-a992-0cea4d85d3d4/Opinions" target="_blank" rel="noopener">להמלצות בעסקים עושים עסקים ↗</a></div>
      </section>

      <section class="contact container" id="contact">
        <img class="contact-brand-logo" src="${B.logo}" alt="TrikoMik">
        <h2>לא מצאת את הצבע המדויק? 💜</h2>
        <p>דברי איתי ונסרוג יחד פריט שמתאים לך.</p>
        <div class="contact-actions">
          <a class="btn btn-primary" href="${waLink("שלום מיכל! הגעתי לאתר של TrikoMik 💜")}" target="_blank" rel="noopener">${ICONS.whatsapp} להזמנה והתאמה אישית בוואטסאפ</a>
          <a class="btn btn-outline" href="tel:${B.phone}">${ICONS.phone} ${B.phoneDisplay}</a>
        </div>
      </section>
    `;

    const carousel = $(".hero-carousel");
    let current = 0, paused = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const pauseButton = $(".hero-pause", carousel);
    const syncPause = () => { pauseButton.setAttribute("aria-pressed", String(paused)); pauseButton.textContent = paused ? "הפעלת תמונות" : "השהיית תמונות"; };
    pauseButton.onclick = () => { paused = !paused; syncPause(); };
    syncPause();
    let transitioning = false, disposed = false;
    const showSlide = async (step) => {
      if (transitioning || disposed) return;
      transitioning = true;
      const next = (current + step + slides.length) % slides.length;
      const slide = slides[next], link = $(".hero-slide", carousel), img = $("img", link);
      const preload = new Image(); preload.src = slide.src;
      try { await preload.decode(); } catch { transitioning = false; return; }
      if (disposed) return;
      const old = img.cloneNode();
      old.className = "hero-slide-outgoing"; old.alt = ""; old.setAttribute("aria-hidden", "true");
      link.append(old);
      current = next;
      img.src = slide.src; img.alt = slide.name; link.href = `#/piece/${slide.slug}`;
      $(".hero-slide-name", carousel).textContent = slide.name;
      $(".hero-slide-count", carousel).textContent = `${current + 1} / ${slides.length}`;
      const duration = matchMedia("(prefers-reduced-motion: reduce)").matches || document.documentElement.classList.contains("a11y-motion") ? 0 : 750;
      const fade = old.animate([{ opacity: 1 }, { opacity: 0 }], { duration, easing: "ease-in-out", fill: "forwards" });
      await fade.finished.catch(() => {});
      old.remove(); transitioning = false;
    };    $(".hero-prev", carousel).onclick = () => showSlide(-1);
    $(".hero-next", carousel).onclick = () => showSlide(1);
    const timer = setInterval(() => { if (!paused && !document.documentElement.classList.contains("a11y-motion") && !matchMedia("(prefers-reduced-motion: reduce)").matches && !document.hidden && !carousel.matches(":hover") && !carousel.contains(document.activeElement)) showSlide(1); }, 4500);
    stopHeroCarousel = () => { disposed = true; clearInterval(timer); };
    renderGrid("all");
    $$(".chip").forEach((chip) =>
      chip.addEventListener("click", () => {
        $$(".chip").forEach((c) => {
          c.classList.remove("active");
          c.setAttribute("aria-pressed", "false");
        });
        chip.classList.add("active");
        chip.setAttribute("aria-pressed", "true");
        renderGrid(chip.dataset.cat);
      })
    );
  }

  const checkoutBase = "https://trikomik-services.michal-trikomik.workers.dev/checkout/";
  let stockRequest;
  function refreshStock() {
    const markers = $$("[data-stock-slug]");
    if (!markers.length) return;
    stockRequest ??= fetch(checkoutBase + "availability", { cache: "no-store" })
      .then(response => response.ok ? response.json() : Promise.reject())
      .finally(() => { stockRequest = undefined; });
    stockRequest.then(stock => {
      for (const marker of markers) {
        const state = stock[marker.dataset.stockSlug];
        marker.textContent = state === "paid" ? "SOLD OUT" : state ? "לא זמין כרגע" : "";
        marker.hidden = !state;
      }
      $$("[data-purchase-slug]").forEach(control => { control.hidden = Boolean(stock[control.dataset.purchaseSlug]); });
    }).catch(() => {});
  }
  window.addEventListener("pageshow", refreshStock);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshStock(); });

  function renderGrid(cat) {
    document.querySelector(".shop-subnav")?.remove();
    document.querySelector(".gallery-head")?.insertAdjacentHTML("beforeend",shopSubnav(cat));
    const items = TRIKOMIK.products.filter(
      (p) => (cat === "all" || p.category === cat) && shopMatches(p, new URLSearchParams(location.search).get("sub"))
    ).sort((a, b) => ({ bags: 0, birth: 1, gifts: 2, extras: 3, workshops: 4 }[a.category] ?? 3) - ({ bags: 0, birth: 1, gifts: 2, extras: 3, workshops: 4 }[b.category] ?? 3));
    $("#grid-empty").hidden = items.length > 0;
    $("#grid-empty").innerHTML = cat === "extras" ? '<img src="img/complementary-coming-soon.svg" alt="בקרוב — מוצרים משלימים בעבודת יד" width="800" height="600" style="width:min(100%,480px);height:auto;margin-inline:auto">' : "אין פריטים בקטגוריה הזו כרגע";
    $("#gallery-status").textContent = `מוצגים ${items.length} פריטים`;
    $("#grid").innerHTML = items
      .map(
        (p, i) => `
      <article class="card ${p.category === "birth" ? "card-tall" : ""}" style="--i:${i}; animation-delay:${Math.min(i * 35, 280)}ms">
      <a class="card-link" href="#/piece/${p.slug}">
        <span class="card-media">
          <img src="${p.images[0]}" alt="${p.name}" loading="lazy" style="--tint:${p.color}">
          <span class="card-price">${p.comingSoon ? "בקרוב" : p.originalPrice ? `<del aria-label="מחיר מקורי">${fmt(p.originalPrice)}</del> <span aria-label="מחיר מבצע">${fmt(p.price)}</span>` : fmt(p.price)}</span>
          ${
            p.images.length > 1
              ? `<span class="card-multi">${ICONS.stack} ${p.images.length} תמונות</span>`
              : ""
          }
        </span>
        <span class="card-body">
          <span class="card-cat">${p.category === "workshops" ? "סדנאות סריגה" : p.category === "birth" ? "מארז לידה" : p.category === "gifts" ? "מארזי מתנה" : p.category === "extras" ? "סלסלאות נוי ומוצרים משלימים" : "תיק סרוג"}</span>
          <span class="card-name">${p.name}</span>
          ${p.category === "bags" ? `<strong class="stock-status" data-stock-slug="${p.slug}" hidden></strong>` : ""}
          <span class="card-more">לפרטים ←</span>
        </span>
      </a>
      ${shareButton(p)}
      </article>`
      )
      .join("");
    refreshStock();
  }

  /* ---------- piece detail ---------- */
  function piece(slug) {
    const p = TRIKOMIK.products.find((x) => x.slug === slug);
    if (!p) return home();
    const idx = TRIKOMIK.products.indexOf(p);
    const prev = TRIKOMIK.products[(idx - 1 + TRIKOMIK.products.length) % TRIKOMIK.products.length];
    const next = TRIKOMIK.products[(idx + 1) % TRIKOMIK.products.length];
    const couponEligible = p.category !== "workshops" && !p.comingSoon && p.price > 0 && !(p.originalPrice > p.price);
    const pieceNote = p.category === "birth" ? p.note : p.note?.replace(/עלות משלוח לפי אזור החלוקה\.?/g, "").trim();
    const birth = p.category === "birth";
    const directCheckout = !p.comingSoon && p.price > 0 && (p.category === "bags" || birth);
    const orderDetails = !p.comingSoon && !["birth", "workshops"].includes(p.category) && p.price > 0;

    document.title = `${p.name} — TrikoMik`;
    const app = $("#app");
    app.innerHTML = `
      <nav class="crumbs container" aria-label="מיקום באתר">
        <a href="#/">החנות</a><span>/</span><span>${p.name}</span>
      </nav>
      <section class="piece container">
        <div class="piece-gallery">
          ${
            p.images.length === 1
              ? `<figure class="piece-main"><img src="${p.images[0]}" alt="${p.name}"></figure>`
              : `<figure class="piece-main">
                 ${
                   p.images.length > 1
                     ? `<button class="pg-arrow pg-prev" aria-label="תמונה קודמת">‹</button>
                        <button class="pg-arrow pg-next" aria-label="תמונה הבאה">›</button>`
                     : ""
                 }
                 <div class="pg-track" style="--n:${p.images.length}">
                   ${p.images.map((src) => `<img src="${src}" alt="${p.name}">`).join("")}
                 </div>
                 <div class="pg-dots">${p.images
                   .map((_, i) => `<button data-i="${i}" ${i === 0 ? "class=\"active\"" : ""} aria-label="תמונה ${i + 1}"></button>`)
                   .join("")}</div>
               </figure>`
          }
        </div>
        <div class="piece-info">
          <p class="piece-kicker">${p.category === "workshops" ? "סדנאות סריגה" : p.category === "birth" ? "מארז לידה בעבודת יד" : p.category === "gifts" ? "מארז מתנה בעבודת יד" : p.category === "extras" ? "מוצר משלים בעבודת יד" : "תיק סרוג בעבודת יד"}</p>
          <h1>${p.name}</h1>
          ${shareButton(p)}
          <p class="piece-price">${p.comingSoon ? "בקרוב" : p.originalPrice ? `<del aria-label="מחיר מקורי">${fmt(p.originalPrice)}</del> <span aria-label="מחיר מבצע">${fmt(p.price)}</span>` : fmt(p.price)}</p>
          <p class="piece-made">${p.category === "workshops" ? "זמן לעצמך, ליווי אישי ויצירה בידיים" : "כל פריט נסרג בעבודת יד באהבה והקפדה על הפרטים הקטנים"}</p>
          ${directCheckout ? `
            <p class="stock-status" data-stock-slug="${p.slug}" role="status" hidden></p>
            ${birth ? `<button type="button" class="btn btn-primary btn-block" id="piece-checkout" data-purchase-slug="${p.slug}">לבחירת איסוף או משלוח</button>` :
            `<a class="btn btn-primary btn-block" id="piece-checkout" data-purchase-slug="${p.slug}" href="${checkoutBase}${p.slug}">להזמנה ותשלום מאובטח</a>`}
          ` : orderDetails ? `<a class="btn btn-primary btn-block" id="piece-checkout" href="/order/?product=${p.slug}">לפרטי ההזמנה</a>` : ""}
          ${couponEligible ? couponOptions() : ""}
          <a class="btn btn-outline btn-block" href="tel:${B.phone}">${ICONS.phone} לשיחה: ${B.phoneDisplay}</a>
          ${!birth && p.category !== "workshops" ? shippingOptions(p) : ""}
          <div class="piece-desc">
            ${p.description.map((d) => `<p>${d}</p>`).join("")}
          </div>
          ${
            p.details
              ? `<h2 class="piece-sub">פרטים</h2>
                 <ul class="piece-details">${p.details.map((d) => `<li>${d}</li>`).join("")}</ul>`
              : ""
          }
          ${pieceNote ? `<p class="piece-note">${pieceNote}</p>` : ""}
          ${
            p.specs.length
              ? `<h2 class="piece-sub">מאפיינים</h2>
                 <dl class="piece-specs">
                   ${p.specs
                     .map(
                       (s) =>
                         `<div><dt>${s.label}</dt><dd>${s.value}</dd></div>`
                     )
                     .join("")}
                 </dl>`
              : ""
          }
          ${birth ? birthExtras(p, directCheckout) : ""}
          <a class="btn btn-outline btn-block piece-whatsapp" id="piece-order" href="${waLink(waMsg(p))}" target="_blank" rel="noopener">${ICONS.whatsapp} רוצים לדבר איתי?</a>
          <div class="piece-social">
            <a href="${B.instagram}" target="_blank" rel="noopener">${ICONS.instagram}</a>
            <a href="${B.facebook}" target="_blank" rel="noopener">${ICONS.facebook}</a>
            <a href="${B.tiktok}" target="_blank" rel="noopener">${ICONS.tiktok}</a>
          </div>
          <div class="piece-nav">
            <a href="#/piece/${prev.slug}" class="piece-navlink">→ ${prev.name}</a>
            <a href="#/" class="piece-navlink">החנות</a>
            <a href="#/piece/${next.slug}" class="piece-navlink">${next.name} ←</a>
          </div>
        </div>
      </section>
    `;

    const orderLink = $("#piece-order", app);
    const checkoutLink = $("#piece-checkout", app);
    refreshStock();
    const couponForm = $("#coupon-form", app);
    const couponInput = $("#coupon-code", app);
    const couponStatus = $("#coupon-status", app);
    let couponApplied = false;
    const productPrice = () => couponApplied ? Math.round(p.price * 80) / 100 : p.price;
    const orderMessage = () => waMsg(p) + (couponApplied
      ? `\nקופון ${couponCode} — 20% הנחה\nמחיר המוצר לאחר הנחה: ${fmt(productPrice())}`
      : "");
    let updateOrder = () => { orderLink.href = waLink(orderMessage()); };

    if (orderDetails) {
      const deliveryForm = $("#product-delivery-form", app);
      const destination = $("#shipping-destination", deliveryForm);
      const deliveryStatus = $("#product-delivery-status", app);
      const couponField = $('input[name="coupon"]', deliveryForm);
      updateOrder = () => {
        const query = new URLSearchParams({ product: p.slug });
        if (destination.value) query.set("delivery", destination.value);
        if (couponApplied) query.set("coupon", couponCode);
        const useDirect = directCheckout && (!destination.value || ["pickup", "ashdod"].includes(destination.value));
        query.delete("product");
        checkoutLink.href = useDirect ? checkoutBase + p.slug + "?" + query : "/order/?product=" + p.slug + "&" + query;
        checkoutLink.textContent = useDirect ? "להזמנה ותשלום מאובטח" : "לפרטי ההזמנה";
        orderLink.href = waLink(orderMessage());
        couponField.value = couponApplied ? couponCode : "";
      };
      updateOrder();
      destination.addEventListener("change", updateOrder);
      if (directCheckout) deliveryForm.addEventListener("submit", event => {
        if (checkoutLink.hidden) { event.preventDefault(); return; }
        if (["pickup", "ashdod"].includes(destination.value)) {
          event.preventDefault();
          location.assign(checkoutLink.href);
        }
      });
      import("/js/shipping-order.js").then(({ loadShippingDestinations }) =>
        loadShippingDestinations(destination, deliveryStatus)
      ).catch(() => {
        deliveryStatus.textContent = "רשימת היישובים לא נטענה. אפשר לרענן את העמוד או להמשיך לפרטי ההזמנה.";
      });
    }

    if (birth) {
      const extras = $(".birth-extras", app);
      const locality = $("#birth-delivery-locality", app);
      checkoutLink?.addEventListener("click", () => locality.focus());
      const greeting = $("#birth-greeting", extras);
      const couponField = $('input[name="coupon"]', extras);
      const cleanGreeting = value => Array.from(value.replace(/[#*0-9]\uFE0F?\u20E3|\p{Extended_Pictographic}|\p{Regional_Indicator}|\p{Emoji_Modifier}|[\u200D\uFE0E\uFE0F\u20E3\u{E0020}-\u{E007F}]/gu, "")).slice(0, 250).join("");
      greeting.addEventListener("input", () => {
        const clean = cleanGreeting(greeting.value);
        const removed = clean !== greeting.value;
        if (removed) greeting.value = clean;
        $("#greeting-count", extras).textContent = `${Array.from(clean).length}/250 תווים`;
        $("#greeting-feedback", extras).textContent = removed ? "ניתן להזין עד 250 תווים, ללא סמיילים או אימוג׳י." : "";
        updateOrder();
      });
      updateOrder = () => {
        const card = $("#birth-card", extras).checked;
        greeting.disabled = false;
        $(".greeting-text-field", extras).hidden = false;
        const balloon = $("input[name=balloon]:checked", extras).value;
        const total = productPrice() + (card ? 45 : 0) + (balloon ? 18 : 0);
        const pickup = locality.value === "pickup";
        const shipping = locality.value && !pickup ? TRIKOMIK.birthDelivery.price : 0;
        const choices = [];
        if (card) choices.push("כרטיס ברכה בעבודת יד של האמנית סיגל כהן — 45 ש״ח");
        if (greeting.value.trim()) choices.push("מלל הברכה:\n" + cleanGreeting(greeting.value).trim());
        if (balloon) choices.push("בלון הליום " + (balloon === "prince" ? "נסיך נולד" : "נסיכה נולדה") + " — 18 ש״ח");
        $(".extras-total", extras).textContent = fmt(total + shipping);
        $(".extras-total-label", extras).textContent = shipping ? "סה״כ כולל תוספות ומשלוח:" : "סה״כ כולל התוספות:";
        const deliveryText = shipping ? `משלוח ל${locality.value} · ${fmt(shipping)} כולל מע״מ` :
          pickup ? "איסוף עצמי באשדוד ללא תשלום, בתיאום מראש" : "לפני בחירת איסוף או משלוח";
        $(".extras-delivery-note", extras).textContent = deliveryText;
        if (couponField) couponField.value = couponApplied ? couponCode : "";
        const message = orderMessage() + (choices.length ? "\nתוספות:\n" + choices.join("\n") : "") + "\n" + deliveryText + "\nסה״כ: " + fmt(total + shipping);
        orderLink.href = waLink(message);
      };
      extras.addEventListener("change", updateOrder);
      updateOrder();
    }

    if (couponForm) {
      const updateCoupon = message => {
        $(".piece-price", app).innerHTML = couponApplied
          ? `<del aria-label="מחיר מקורי">${fmt(p.price)}</del> <span aria-label="מחיר אחרי קופון">${fmt(productPrice())}</span>`
          : fmt(p.price);
        couponStatus.textContent = message;
        updateOrder();
      };
      couponForm.addEventListener("submit", event => {
        event.preventDefault();
        const now = Date.now();
        const code = couponInput.value.trim().toUpperCase();
        couponApplied = code === couponCode && now >= couponStarts && now < couponEnds;
        if (code !== couponCode) updateCoupon("הקוד שהוזן אינו תקף.");
        else if (now < couponStarts) updateCoupon("הקופון יהיה תקף ביום שישי, 27.11.2026, לפי שעון ישראל.");
        else if (!couponApplied) updateCoupon("תוקף הקופון הסתיים.");
        else updateCoupon(`הקופון הוחל. מחיר המוצר לאחר 20% הנחה: ${fmt(productPrice())}.`);
      });
      couponInput.addEventListener("input", () => {
        couponApplied = false;
        updateCoupon("");
      });
      orderLink.addEventListener("click", event => {
        if (couponApplied && (Date.now() < couponStarts || Date.now() >= couponEnds)) {
          event.preventDefault();
          couponApplied = false;
          updateCoupon("הקופון אינו תקף כעת. המחיר עודכן.");
          couponForm.closest("details").open = true;
          couponInput.focus();
        }
      });
    }

    const imageButtons = $$(".piece-gallery img");
    imageButtons.forEach(img => { img.tabIndex = 0; img.setAttribute("role", "button"); img.setAttribute("aria-label", "הגדלת תמונת " + p.name); });
    const gallery = $(".piece-gallery");
    gallery.addEventListener("keydown", event => {
      if (event.target.matches("img[role=button]") && (event.key === "Enter" || event.key === " ")) {
        event.preventDefault(); openLightbox(event.target.src);
      }
    });
    /* multi-image slider */
    const trackImgs = $$(".pg-track img");
    if (trackImgs.length) {
      const dots = $$(".pg-dots button");
      let cur = 0;
      const show = (i) => {
        cur = (i + trackImgs.length) % trackImgs.length;
        trackImgs.forEach((img, k) => { img.classList.toggle("active", k === cur); img.tabIndex = k === cur ? 0 : -1; img.setAttribute("aria-hidden", String(k !== cur)); });
        dots.forEach((d, k) => d.classList.toggle("active", k === cur));
      };
      show(0);
      dots.forEach((d) =>
        d.addEventListener("click", () => show(+d.dataset.i))
      );
      /* RTL reading order: right-side arrow (›) goes back, left-side (‹) advances */
      $(".pg-prev")?.addEventListener("click", (e) => {
        e.stopPropagation();
        show(cur - 1);
      });
      $(".pg-next")?.addEventListener("click", (e) => {
        e.stopPropagation();
        show(cur + 1);
      });
      /* keyboard support while detail view is visible */
      gallery.addEventListener("keydown", (e) => {
        if (!e.target.matches("img[role=button]")) return;
        if (e.key === "ArrowLeft") show(cur + 1);   /* RTL: left = next */
        if (e.key === "ArrowRight") show(cur - 1);  /* RTL: right = prev */
      });
      /* lightbox opens the currently visible image */
      $(".piece-main").addEventListener("click", () =>
        openLightbox(trackImgs[cur].src)
      );
    } else {
      /* single image: lightbox on click */
      $(".piece-gallery img")?.addEventListener("click", () =>
        openLightbox($(".piece-gallery img").src)
      );
    }
  }

  function couponOptions() {
    return `<details class="piece-shipping">
      <summary class="btn btn-outline btn-block">יש לי קופון</summary>
      <form id="coupon-form" class="piece-shipping-content">
        <label for="coupon-code">קוד קופון</label>
        <input id="coupon-code" type="text" dir="ltr" maxlength="32" autocomplete="off" spellcheck="false" required>
        <button class="btn btn-outline" type="submit">החלת קופון</button>
        <p id="coupon-status" role="status"></p>
      </form>
    </details>`;
  }

  function shippingOptions(p) {
    return `<details class="piece-shipping">
      <summary class="btn btn-outline btn-block">${ICONS.truck} משלוחים</summary>
      <div class="piece-shipping-content">
          <p>משלוח באשדוד ללא תשלום או איסוף עצמי באשדוד ללא תשלום בתיאום מראש.</p>
          <p>משלוח אקספרס של דואר ישראל ליישובים שברשימה. עד 1 ק״ג כולל אריזה ב־67 ש״ח, ומעל 1 ק״ג ועד 2 ק״ג ב־73 ש״ח.</p>
          ${!p.comingSoon && p.price > 0 ? `
            <form id="product-delivery-form" action="/order/" ${p.category === "bags" ? `data-purchase-slug="${p.slug}"` : ""}>
              <input type="hidden" name="product" value="${p.slug}">
              <input type="hidden" name="coupon">
              <label for="shipping-destination">איסוף עצמי או בחירת יישוב</label>
              <select name="delivery" id="shipping-destination" required aria-describedby="product-delivery-status">
                <option value="">בחרו אפשרות</option>
                <option value="pickup">איסוף עצמי באשדוד בתיאום מראש</option>
                <option value="ashdod">משלוח חינם באשדוד</option>
              </select>
              <p id="product-delivery-status" role="status"></p>
              <button class="btn btn-outline btn-block" type="submit">לפרטי ההזמנה</button>
            </form>` : ""}
      </div>
    </details>`;
  }

  function birthExtras(p, directCheckout) {
    const delivery = TRIKOMIK.birthDelivery;
    return `<section class="birth-extras" aria-labelledby="extras-heading">
      <form action="${checkoutBase}${p.slug}/start" method="post">
      <h2 id="extras-heading" class="piece-sub">תוספות למארז</h2>
      <p class="extras-intro">עוד קצת שמחה למתנה שלך</p>
      <label class="extra-card-option"><input type="checkbox" id="birth-card" name="card" value="yes"><span>כרטיס ברכה בעבודת יד של האמנית סיגל כהן</span><strong>45 ₪</strong></label><div class="greeting-card-gallery" aria-label="תמונות כרטיסי הברכה של סיגל כהן"><img src="/img/sigal-card-girl.jpeg" alt="כרטיס ברכה של סיגל כהן — פיל ורוד"><img src="/img/sigal-card-boy-welcome.jpeg" alt="כרטיס ברכה של סיגל כהן — Welcome Baby Boy"><img src="/img/sigal-card-boy-bear.jpeg" alt="כרטיס ברכה של סיגל כהן — Baby Boy עם דובי"></div>
      <div class="greeting-text-field"><label for="birth-greeting">ברכה למקבל/ת המתנה (אופציונלי)</label><textarea id="birth-greeting" name="greeting" rows="4" dir="auto" aria-describedby="greeting-help greeting-count greeting-feedback" placeholder="לדוגמה: מזל טוב להולדת הבת! מאחלים לכם אושר, בריאות והמון רגעים יפים יחד."></textarea><p id="greeting-help">אפשר להוסיף ברכה גם ללא רכישת כרטיס מעוצב. עד 250 תווים, ללא סמיילים או אימוג׳י. הטקסט המוצג בשדה הוא לדוגמה בלבד.</p><span id="greeting-count">0/250 תווים</span><p id="greeting-feedback" role="status"></p></div><fieldset class="balloon-options">
        <legend>בלון הליום <span>18 ₪ לבלון</span></legend>
        <label class="no-balloon"><input type="radio" name="balloon" value="" checked> ללא בלון</label>
        <div class="balloon-grid">
          <label class="balloon-choice"><img src="img/balloon-prince.jpg" alt="דוגמת בלון הליום נסיך נולד" loading="lazy"><span><input type="radio" name="balloon" value="prince"> נסיך נולד</span></label>
          <label class="balloon-choice"><img src="img/balloon-princess.jpg" alt="בלון הליום נסיכה נולדה" loading="lazy"><span><input type="radio" name="balloon" value="princess"> נסיכה נולדה</span></label>
        </div>
        <p class="extras-caption">התוספת כוללת בלון הליום אחד. התמונות להמחשת הדגמים.</p>
      </fieldset>
      <div class="piece-shipping-content">
        <label for="birth-delivery-locality">איסוף עצמי או בחירת יישוב למשלוח</label>
        <select id="birth-delivery-locality" name="delivery" required>
          <option value="">בחרו אפשרות</option>
          <option value="pickup">איסוף עצמי חינם באשדוד בתיאום מראש</option>
          ${delivery.regions.map(([region, localities]) =>
            `<optgroup label="${region}">${localities.map(name => `<option>${name}</option>`).join("")}</optgroup>`
          ).join("")}
        </select>
        <p>משלוח ליישובים ברשימה ב־${fmt(delivery.price)} כולל מע״מ.</p>
      </div>
      <p class="extras-summary" role="status" aria-atomic="true"><span class="extras-total-label">סה״כ כולל התוספות:</span> <strong class="extras-total">${fmt(p.price)}</strong><small class="extras-delivery-note">לפני משלוח</small></p>
      ${directCheckout ? `<div data-purchase-slug="${p.slug}">
        <input type="hidden" name="coupon">
        <p>הברכה ותוספות המארז יועברו למסך פרטי ההזמנה. <a href="/privacy/">הצהרת פרטיות</a></p>
        <button type="submit" class="btn btn-primary btn-block">להמשך לתשלום</button>
      </div>` : ""}
      </form>
    </section>`;
  }

  let lightboxOrigin = null, lightboxInert = [];
  /* ---------- lightbox ---------- */
  function openLightbox(src) {
    const lb = $("#lightbox");
    lightboxOrigin = document.activeElement;
    $("#lightbox-img").src = src;
    $("#lightbox-img").alt = $(".piece-info h1")?.textContent || "תמונת מוצר מוגדלת";
    lb.setAttribute("aria-hidden", "false");
    [...document.body.children].filter(el => el !== lb && !["SCRIPT", "LINK"].includes(el.tagName)).forEach(el => { if (!el.inert) { el.inert = true; lightboxInert.push(el); } });
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
    $(".lb-close", lb).focus();
  }
  function closeLightbox() {
    const lb = $("#lightbox");
    if (!lb.classList.contains("open")) return;
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    lightboxInert.forEach(el => el.inert = false); lightboxInert = [];
    lightboxOrigin?.focus();
    document.body.style.overflow = "";
    $("#lightbox-img").src = "";
  }

  /* ---------- icons ---------- */
  const ICONS = {
    instagram:
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>',
    facebook:
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
    tiktok:
      '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>',
    whatsapp:
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/></svg>',
    phone:
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    truck:
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11"/><path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2"/><circle cx="7.5" cy="18.5" r="2.5"/><circle cx="17.5" cy="18.5" r="2.5"/></svg>',
    return:
      '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    stack:
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="14" height="14" rx="2"/><path d="M3 16V5a2 2 0 0 1 2-2h11"/></svg>',
  };
  window.ICONS = ICONS;

  /* ---------- helpers ---------- */
  function $$(s, el = document) {
    return [...el.querySelectorAll(s)];
  }

  /* ---------- boot ---------- */
  $("#lightbox").innerHTML = `
    <button class="lb-close" aria-label="סגירה">×</button>
    <img id="lightbox-img" alt="תצוגה מוגדלת">
  `;
  $("#lightbox").addEventListener("click", closeLightbox);
  document.addEventListener("keydown", (e) => {
    if ($("#lightbox").classList.contains("open")) {
      if (e.key === "Escape") { e.stopImmediatePropagation(); closeLightbox(); }
      if (e.key === "Tab") { e.preventDefault(); $(".lb-close").focus(); }
    }
  });

  /* mark footer year + social */
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
  const footerSocial = $("#footer-social");
  const footerNav = $(".footer-nav");
  if (footerNav && !footerNav.querySelector('a[href="/privacy/"]')) {
    const privacyLink = document.createElement("a");
    privacyLink.href = "/privacy/";
    privacyLink.textContent = "הצהרת פרטיות";
    footerNav.append(privacyLink);
  }
  if (footerSocial) {
    footerSocial.innerHTML = `
      <a href="${B.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ICONS.instagram}</a>
      <a href="${B.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${ICONS.facebook}</a>
      <a href="${B.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">${ICONS.tiktok}</a>
      <a href="tel:${B.phone}" aria-label="טלפון">${ICONS.phone}</a>
    `;
  }

  const enhanceContent = () => {
    $$(".piece-social a").forEach(link => link.setAttribute("aria-label", link.href.includes("instagram") ? "Instagram" : link.href.includes("facebook") ? "Facebook" : "TikTok"));
    $$("svg").forEach(svg => { svg.setAttribute("aria-hidden", "true"); svg.setAttribute("focusable", "false"); });
  };
  new MutationObserver(enhanceContent).observe($("#app"), {childList:true, subtree:true});
  window.addEventListener("hashchange", () => {
    const target = location.hash.startsWith("#/") ? $("#app h1") : document.getElementById(location.hash.slice(1));
    if (target) { target.tabIndex = -1; target.focus({preventScroll:true}); }
  });
  navigate();
  enhanceContent();
})();


