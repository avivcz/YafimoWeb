const revealItems = document.querySelectorAll('.reveal');
const photoBand = document.querySelector('.photo-band');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (revealItems.length && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

const updatePhotoBand = () => {
  if (!photoBand) return;
  const rect = photoBand.getBoundingClientRect();
  const windowHeight = window.innerHeight || 1;
  const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
  const clamped = Math.max(0, Math.min(1, progress));
  const offset = (clamped - 0.5) * 60;
  photoBand.style.setProperty('--photo-offset', `${Math.round(offset)}px`);
};

const handleScroll = () => {
  if (prefersReducedMotion || !photoBand) return;
  // always run the offset calculation so the band moves even on desktop
  updatePhotoBand();
};

if (!prefersReducedMotion && photoBand) {
  updatePhotoBand();
  window.addEventListener('scroll', () => requestAnimationFrame(handleScroll));
  window.addEventListener('resize', () => requestAnimationFrame(handleScroll));
}

const html = document.documentElement;
const body = document.body;
const langButtons = document.querySelectorAll('.lang-btn');
const whatsappLinks = document.querySelectorAll('[data-whatsapp]');
const bookingForm = document.getElementById('bookingForm');
const formFields = bookingForm ? bookingForm.querySelectorAll('input') : [];

const placeholders = {
  he: {
    fullName: 'שם מלא',
    event: 'פעילות משפחתית בבית',
    location: 'אצלנו בסטודיו או אצלכם בבית',
    participants: 'כמה משתתפים',
    ageRange: 'גילאי הילדים',
    date: 'מתי תרצו לקיים את הסדנה',
  },
  en: {
    fullName: 'Full name',
    event: 'Creative family activity at home',
    location: 'At your home, in a nearby shelter, or another protected space',
    participants: 'How many participants',
    ageRange: "Children's ages",
    date: 'Preferred date',
  },
};

const setLanguage = (lang) => {
  body.dataset.lang = lang;
  html.lang = lang;
  html.dir = lang === 'he' ? 'rtl' : 'ltr';

  formFields.forEach((field) => {
    const key = field.name;
    const next = placeholders[lang]?.[key];
    if (next) field.placeholder = next;
  });

  langButtons.forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.lang === lang);
    btn.setAttribute('aria-pressed', btn.dataset.lang === lang ? 'true' : 'false');
  });

  updateWhatsAppLinks();
};

langButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    setLanguage(btn.dataset.lang);
  });
});

const buildMessage = (lang) => {
  const values = {};
  formFields.forEach((field) => {
    values[field.name] = field.value.trim();
  });

  const eventValue = values.event || (lang === 'he' ? 'פעילות משפחתית' : 'Family activity');
  const locationValue =
    values.location ||
    (lang === 'he' ? 'בסטודיו או בבית הלקוח' : 'At your home, in a nearby shelter, or another protected space');

  const base =
    lang === 'he'
      ? 'היי! נשמח לתאם סדנת פימו משפחתית.'
      : "Hi! We'd like to coordinate a family polymer clay workshop.";

  const lines = [];
  if (values.fullName) {
    lines.push(lang === 'he' ? `שם מלא: ${values.fullName}` : `Full name: ${values.fullName}`);
  }
  lines.push(lang === 'he' ? `מה מחפשים: ${eventValue}` : `Looking for: ${eventValue}`);
  lines.push(lang === 'he' ? `מיקום מועדף: ${locationValue}` : `Preferred location: ${locationValue}`);
  if (values.participants) {
    lines.push(
      lang === 'he'
        ? `כמה משתתפים: ${values.participants}`
        : `Participants: ${values.participants}`
    );
  }
  if (values.ageRange) {
    lines.push(lang === 'he' ? `גילאי הילדים: ${values.ageRange}` : `Children's ages: ${values.ageRange}`);
  }
  if (values.date) {
    lines.push(lang === 'he' ? `מועד מועדף: ${values.date}` : `Preferred date: ${values.date}`);
  }

  return `${base}\n${lines.join('\n')}`;
};

const updateWhatsAppLinks = () => {
  if (!whatsappLinks.length) return;
  const lang = body.dataset.lang || 'he';
  const message = buildMessage(lang);
  const encoded = encodeURIComponent(message);
  whatsappLinks.forEach((link) => {
    link.href = `https://wa.me/972543381224?text=${encoded}`;
  });
};

if (bookingForm) {
  bookingForm.addEventListener('input', updateWhatsAppLinks);
}

setLanguage(body.dataset.lang || 'he');
