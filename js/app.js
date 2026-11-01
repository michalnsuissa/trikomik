/* TrikoMik — hash router, gallery, piece detail, lightbox */
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const B = TRIKOMIK.brand;
  const fmt = (n) => new Intl.NumberFormat("he-IL").format(n) + " ₪";
  const waMsg = (p) =>
    `שלום מיכל! אני מתעניינ/ת ב${p.name} מהאתר של TrikoMik 💜`;

  /* ---------- router ---------- */
  const routes = {
    "": home,
    home: home,
    piece: piece,
  };

  function parseHash() {
    const h = location.hash.replace(/^#\/?/, "");
    const [route, param] = h.split("/");
    return { route: routes[route] ? route : "", param };
  }

  let stopHeroCarousel = () => {};
  function navigate() {
    const hash = location.hash;
    /* in-page anchors (#about, #policy) — let the browser scroll natively */
    if (hash && hash[1] !== "/") {
      if ($("#app").children.length === 0) home(); /* first land with anchor hash */
      return;
    }
    stopHeroCarousel();
    const { route, param } = parseHash();
    window.scrollTo(0, 0);
    if (route === "piece") piece(param);
    else home();
  }
  window.addEventListener("hashchange", navigate);

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

  /* ---------- home ---------- */
  function home() {
    document.title = "TrikoMik — סרוג באהבה, נוצר במיוחד בשבילך";
    const app = $("#app");
    const slides = TRIKOMIK.products.flatMap(p => p.images.map(src => ({ src, name: p.name, slug: p.slug })));
    for (let i = slides.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [slides[i], slides[j]] = [slides[j], slides[i]]; }

    app.innerHTML = `
      <section class="hero">
        <div class="container hero-inner">
          <div class="hero-copy">
            <img class="hero-brand-logo" src="img/trikomik-logo-transparent.png" alt="TRIKOMIK">
            <h1 class="hero-title">סרוג באהבה<br><span class="hero-title-accent">ומדויק בשבילך</span></h1>
            <p class="hero-text">מארזי לידה • סלסלות מעוצבות • תיקים בהתאמה אישית • סדנאות סריגה<br>הכל 100% עבודת יד</p>
            <div class="hero-actions">
              <a class="btn btn-primary" href="#gallery-anchor">צפייה בגלריה <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg></a>
              <a class="btn btn-ghost" href="${waLink("שלום מיכל! הגעתי לאתר של TrikoMik 💜")}">שיחה בוואטסאפ</a>
            </div>
          </div>
          <div class="hero-art hero-carousel" role="region" aria-roledescription="קרוסלה" aria-label="מוצרים מהגלריה">
            <a class="hero-slide" href="#/piece/${slides[0].slug}"><img src="${slides[0].src}" alt="${slides[0].name}" loading="eager"><span class="hero-slide-name">${slides[0].name}</span></a>
            <div class="hero-carousel-controls">
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
            <h2 class="about-heading"><span>ברוכים הבאים ל־</span><img class="about-heading-logo" src="${B.logo}" alt="TrikoMik"></h2>
            <p>${TRIKOMIK.brand.description.replace(/^ברוכים הבאים ל-TrikoMik 💜 /, "")}</p>
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
        <div class="gallery-head">
          <h2>הגלריה</h2>
          <p>כל פריט נסרג ביד, אחד לאחד. לחיצה על פריט תפתח את כל הפרטים והמידות</p>
          <div class="filter-chips" role="tablist" aria-label="סינון לפי קטגוריה">
            ${TRIKOMIK.categories
              .map(
                (c, i) =>
                  `<button class="chip ${i === 0 ? "active" : ""}" role="tab" aria-selected="${i === 0}" data-cat="${c.id}">${c.label}</button>`
              )
              .join("")}
          </div>
        </div>
        <div class="grid" id="grid"></div>
        <div id="grid-empty" class="grid-empty" hidden>אין פריטים בקטגוריה הזו כרגע</div>
      </section>

      <section class="policy container" id="policy">
        <div class="policy-grid">
          <div class="policy-block">
            <h3><span class="icon">${ICONS.truck}</span> משלוחים</h3>
            <p>${TRIKOMIK.delivery}</p>
          </div>
          <div class="policy-block">
            <h3><span class="icon">${ICONS.return}</span> מדיניות החזרות</h3>
            <p>${TRIKOMIK.returnPolicyMain}</p>
            <ul class="policy-list">
              ${TRIKOMIK.returnPolicy
                .map((r) => `<li><strong>${r.title}:</strong> ${r.text}</li>`)
                .join("")}
            </ul>
          </div>
        </div>
      </section>

      <section class="contact container" id="contact">
        <h2>מתחשק לכם משהו שונה? 💜</h2>
        <p>אשמח לשאלות, התאמות אישיות, צבעים ומידות בהתאמה — פשוט שלחו הודעה</p>
        <div class="contact-actions">
          <a class="btn btn-primary" href="${waLink("שלום מיכל! הגעתי לאתר של TrikoMik 💜")}" target="_blank" rel="noopener">${ICONS.whatsapp} הודעה בוואטסאפ</a>
          <a class="btn btn-outline" href="tel:${B.phone}">${ICONS.phone} ${B.phoneDisplay}</a>
        </div>
      </section>
    `;

    const carousel = $(".hero-carousel");
    let current = 0, paused = matchMedia("(prefers-reduced-motion: reduce)").matches;
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
      const duration = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 750;
      const fade = old.animate([{ opacity: 1 }, { opacity: 0 }], { duration, easing: "ease-in-out", fill: "forwards" });
      await fade.finished.catch(() => {});
      old.remove(); transitioning = false;
    };    $(".hero-prev", carousel).onclick = () => showSlide(-1);
    $(".hero-next", carousel).onclick = () => showSlide(1);
    const timer = setInterval(() => { if (!paused && !document.hidden && !carousel.matches(":hover") && !carousel.contains(document.activeElement)) showSlide(1); }, 4500);
    stopHeroCarousel = () => { disposed = true; clearInterval(timer); };
    renderGrid("all");
    $$(".chip").forEach((chip) =>
      chip.addEventListener("click", () => {
        $$(".chip").forEach((c) => {
          c.classList.remove("active");
          c.setAttribute("aria-selected", "false");
        });
        chip.classList.add("active");
        chip.setAttribute("aria-selected", "true");
        renderGrid(chip.dataset.cat);
      })
    );
  }

  function renderGrid(cat) {
    const items = TRIKOMIK.products.filter(
      (p) => cat === "all" || p.category === cat
    ).sort((a, b) => ({ bags: 0, birth: 1, extras: 2 }[a.category] ?? 3) - ({ bags: 0, birth: 1, extras: 2 }[b.category] ?? 3));
    $("#grid-empty").hidden = items.length > 0;
    $("#grid").innerHTML = items
      .map(
        (p, i) => `
      <a class="card ${p.category === "birth" ? "card-tall" : ""}" href="#/piece/${p.slug}" style="--i:${i}; animation-delay:${Math.min(i * 35, 280)}ms">
        <span class="card-media">
          <img src="${p.images[0]}" alt="${p.name}" loading="lazy" style="--tint:${p.color}">
          <span class="card-price">${p.originalPrice ? `<del aria-label="מחיר מקורי">${fmt(p.originalPrice)}</del> <span aria-label="מחיר מבצע">${fmt(p.price)}</span>` : fmt(p.price)}</span>
          ${
            p.images.length > 1
              ? `<span class="card-multi">${ICONS.stack} ${p.images.length} תמונות</span>`
              : ""
          }
        </span>
        <span class="card-body">
          <span class="card-cat">${p.category === "birth" ? "מארז לידה" : p.category === "extras" ? "מוצרים משלימים ומארזים" : "תיק סרוג"}</span>
          <span class="card-name">${p.name}</span>
          <span class="card-more">לפרטי הפריט ←</span>
        </span>
      </a>`
      )
      .join("");
  }

  /* ---------- piece detail ---------- */
  function piece(slug) {
    const p = TRIKOMIK.products.find((x) => x.slug === slug);
    if (!p) return home();
    const idx = TRIKOMIK.products.indexOf(p);
    const prev = TRIKOMIK.products[(idx - 1 + TRIKOMIK.products.length) % TRIKOMIK.products.length];
    const next = TRIKOMIK.products[(idx + 1) % TRIKOMIK.products.length];

    document.title = `${p.name} — TrikoMik`;
    const app = $("#app");
    app.innerHTML = `
      <nav class="crumbs container">
        <a href="#/">הגלריה</a><span>/</span><span>${p.name}</span>
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
          <p class="piece-kicker">${p.category === "birth" ? "מארז לידה בעבודת יד" : p.category === "extras" ? "מארז בעבודת יד" : "תיק סרוג בעבודת יד"}</p>
          <h1>${p.name}</h1>
          <p class="piece-price">${p.originalPrice ? `<del aria-label="מחיר מקורי">${fmt(p.originalPrice)}</del> <span aria-label="מחיר מבצע">${fmt(p.price)}</span>` : fmt(p.price)}</p>
          <p class="piece-made">כל פריט נסרג בעבודת יד באהבה והקפדה על הפרטים הקטנים</p>
          <a class="btn btn-primary btn-block" href="${waLink(waMsg(p))}" target="_blank" rel="noopener">${ICONS.whatsapp} להזמנה / שאילתא בוואטסאפ</a>
          <a class="btn btn-outline btn-block" href="tel:${B.phone}">${ICONS.phone} לשיחה: ${B.phoneDisplay}</a>
          <div class="piece-desc">
            ${p.description.map((d) => `<p>${d}</p>`).join("")}
          </div>
          ${
            p.details
              ? `<h3 class="piece-sub">פרטים</h3>
                 <ul class="piece-details">${p.details.map((d) => `<li>${d}</li>`).join("")}</ul>`
              : ""
          }
          ${p.note ? `<p class="piece-note">${p.note}</p>` : ""}
          ${
            p.specs.length
              ? `<h3 class="piece-sub">מאפיינים</h3>
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
          ${p.category === "birth" ? birthExtras(p) : ""}
          <div class="piece-social">
            <a href="${B.instagram}" target="_blank" rel="noopener">${ICONS.instagram}</a>
            <a href="${B.facebook}" target="_blank" rel="noopener">${ICONS.facebook}</a>
            <a href="${B.tiktok}" target="_blank" rel="noopener">${ICONS.tiktok}</a>
          </div>
          <div class="piece-nav">
            <a href="#/piece/${prev.slug}" class="piece-navlink">→ ${prev.name}</a>
            <a href="#/" class="piece-navlink">הגלריה</a>
            <a href="#/piece/${next.slug}" class="piece-navlink">${next.name} ←</a>
          </div>
        </div>
      </section>
    `;

    if (p.category === "birth") {
      const extras = $(".birth-extras", app);
      const updateExtras = () => {
        const card = $("#birth-card", extras).checked;
        const balloon = $("input[name=birth-balloon]:checked", extras).value;
        const total = p.price + (card ? 50 : 0) + (balloon ? 18 : 0);
        const choices = [];
        if (card) choices.push("כרטיס ברכה בעבודת יד — 50 ש״ח");
        if (balloon) choices.push("בלון הליום " + (balloon === "prince" ? "נסיך נולד" : "נסיכה נולדה") + " — 18 ש״ח");
        $(".extras-total", extras).textContent = fmt(total);
        const message = waMsg(p) + (choices.length ? "\nתוספות:\n" + choices.join("\n") : "") + "\nסה״כ: " + fmt(total) + " (לפני משלוח)";
        $$(".piece-info a[href^='https://wa.me/']", app).forEach(link => link.href = waLink(message));
      };
      extras.addEventListener("change", updateExtras);
      updateExtras();
    }

    /* multi-image slider */
    const trackImgs = $$(".pg-track img");
    if (trackImgs.length) {
      const dots = $$(".pg-dots button");
      let cur = 0;
      const show = (i) => {
        cur = (i + trackImgs.length) % trackImgs.length;
        trackImgs.forEach((img, k) => img.classList.toggle("active", k === cur));
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
      document.addEventListener("keydown", (e) => {
        if (!location.hash.startsWith("#/piece")) return;
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

  function birthExtras(p) {
    return `<section class="birth-extras" aria-labelledby="extras-heading">
      <h2 id="extras-heading" class="piece-sub">תוספות למארז</h2>
      <p class="extras-intro">עוד קצת שמחה למתנה שלך</p>
      <label class="extra-card-option"><input type="checkbox" id="birth-card"><span>כרטיס ברכה בעבודת יד</span><strong>50 ₪</strong></label>
      <fieldset class="balloon-options">
        <legend>בלון הליום <span>18 ₪ לבלון</span></legend>
        <label class="no-balloon"><input type="radio" name="birth-balloon" value="" checked> ללא בלון</label>
        <div class="balloon-grid">
          <label class="balloon-choice"><img src="img/balloon-prince.jpg" alt="דוגמת בלון הליום נסיך נולד" loading="lazy"><span><input type="radio" name="birth-balloon" value="prince"> נסיך נולד</span></label>
          <label class="balloon-choice"><img src="img/balloon-princess.jpg" alt="בלון הליום נסיכה נולדה" loading="lazy"><span><input type="radio" name="birth-balloon" value="princess"> נסיכה נולדה</span></label>
        </div>
        <p class="extras-caption">התוספת כוללת בלון הליום אחד. התמונות להמחשת הדגמים.</p>
      </fieldset>
      <p class="extras-summary">סה״כ כולל התוספות: <strong class="extras-total">${fmt(p.price)}</strong><small>לפני משלוח</small></p>
      <a class="btn btn-primary btn-block" href="${waLink(waMsg(p))}" target="_blank" rel="noopener">${ICONS.whatsapp} להזמנת המארז עם הבחירות שלי</a>
    </section>`;
  }

  /* ---------- lightbox ---------- */
  function openLightbox(src) {
    const lb = $("#lightbox");
    $("#lightbox-img").src = src;
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
    $("#lightbox").focus();
  }
  function closeLightbox() {
    const lb = $("#lightbox");
    lb.classList.remove("open");
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
    if (e.key === "Escape") closeLightbox();
  });

  /* mark footer year + social */
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
  const footerSocial = $("#footer-social");
  if (footerSocial) {
    footerSocial.innerHTML = `
      <a href="${B.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ICONS.instagram}</a>
      <a href="${B.facebook}" target="_blank" rel="noopener" aria-label="Facebook">${ICONS.facebook}</a>
      <a href="${B.tiktok}" target="_blank" rel="noopener" aria-label="TikTok">${ICONS.tiktok}</a>
      <a href="tel:${B.phone}" aria-label="טלפון">${ICONS.phone}</a>
    `;
  }

  navigate();
})();

