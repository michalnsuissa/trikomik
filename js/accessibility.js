/* Local display preferences; no third-party widget or tracking. */
(() => {
  const root = document.documentElement;
  const host = document.createElement('div');
  host.className = 'accessibility-tools';
  host.innerHTML = `<button class="accessibility-toggle" aria-expanded="false" aria-controls="accessibility-panel" aria-label="פתיחת אפשרויות נגישות">♿ <span>נגישות</span></button>
    <section id="accessibility-panel" aria-label="אפשרויות נגישות" hidden>
      <h2>אפשרויות נגישות</h2>
      <button type="button" data-setting="large" aria-pressed="false">הגדלת טקסט</button>
      <button type="button" data-setting="contrast" aria-pressed="false">ניגודיות גבוהה</button>
      <button type="button" data-setting="links" aria-pressed="false">הדגשת קישורים</button>
      <button type="button" data-setting="motion" aria-pressed="false">הפחתת תנועה</button>
      <button type="button" data-reset>איפוס הגדרות</button>
      <p>לקבלת עזרה או לדיווח על קושי בנגישות: <a href="tel:+972529698082">052-969-8082</a></p>
      <p>אפשרויות התצוגה אינן תחליף לבדיקת נגישות מלאה של האתר.</p>
      <p><a href="#accessibility-statement" data-statement>הצהרת נגישות ופרטי קשר</a></p>
      <button type="button" data-close>סגירה</button>
    </section>`;
  document.body.append(host);
  const toggle = host.querySelector('.accessibility-toggle');
  const panel = host.querySelector('section');
  let settings = {};
  try { settings = JSON.parse(localStorage.getItem('trikomik-accessibility') || '{}') || {}; } catch {}
  const apply = () => {
    host.querySelectorAll('[data-setting]').forEach(button => {
      const enabled = settings[button.dataset.setting] === true;
      root.classList.toggle('a11y-' + button.dataset.setting, enabled);
      button.setAttribute('aria-pressed', String(enabled));
    });
    try { localStorage.setItem('trikomik-accessibility', JSON.stringify(settings)); } catch {}
  };
  const close = () => { panel.hidden = true; toggle.setAttribute('aria-expanded','false'); toggle.focus(); };
  toggle.addEventListener('click', () => {
    panel.hidden = !panel.hidden;
    toggle.setAttribute('aria-expanded',String(!panel.hidden));
    if (!panel.hidden) panel.querySelector('button').focus();
  });
  host.querySelectorAll('[data-setting]').forEach(button => button.addEventListener('click', () => {
    settings[button.dataset.setting] = !settings[button.dataset.setting]; apply();
  }));
  host.querySelector('[data-reset]').addEventListener('click', () => { settings = {}; apply(); });
  host.querySelector('[data-close]').addEventListener('click', close);
  host.querySelector('[data-statement]').addEventListener('click', () => {
    close();
    const statement = document.getElementById('accessibility-statement');
    statement.open = true;
    statement.querySelector('summary').focus();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) close(); });
  apply();
})();
