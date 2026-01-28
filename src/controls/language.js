const LANGUAGES = { he: 'he', en: 'en' };

let currentLang = LANGUAGES.he;

export function getCurrentLang() {
  return currentLang;
}

export function initLanguageControl(map) {
  const btn = document.getElementById('lang-toggle');

  btn.addEventListener('click', () => {
    currentLang = currentLang === LANGUAGES.he ? LANGUAGES.en : LANGUAGES.he;
    applyLanguage(map);
  });

  applyLanguage(map);
}

function applyLanguage(map) {
  const isHebrew = currentLang === LANGUAGES.he;

  // Update HTML direction
  document.documentElement.dir = isHebrew ? 'rtl' : 'ltr';
  document.documentElement.lang = currentLang;

  // Update all bilingual UI text
  document.querySelectorAll('[data-he][data-en]').forEach(el => {
    el.textContent = isHebrew ? el.dataset.he : el.dataset.en;
  });

  // Update map label language
  const labelProp = isHebrew ? 'name:he' : 'name:en';
  const fallback = 'name';

  try {
    const style = map.getStyle();
    if (!style || !style.layers) return;

    for (const layer of style.layers) {
      if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) {
        map.setLayoutProperty(layer.id, 'text-field', [
          'coalesce',
          ['get', labelProp],
          ['get', fallback]
        ]);
      }
    }
  } catch (e) {
    console.warn('Could not update map labels:', e);
  }
}
