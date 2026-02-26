const revealItems = document.querySelectorAll('.reveal');
const photoBand = document.querySelector('.photo-band');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (revealItems.length) {
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
  const isMobile = window.matchMedia('(max-width: 900px)').matches;
  if (!isMobile) return;
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
    event: 'יום הולדת',
    location: 'סטודיו דברים יפימו (או בבית הלקוח)',
    participants: 'כמות משתתפים',
    ageRange: 'טווח גילאים',
    date: 'תאריך הסדנא',
  },
  en: {
    fullName: 'Full name',
    event: 'Birthday',
    location: 'Devarim Yafimo Studio (or at your location)',
    participants: 'Number of participants',
    ageRange: 'Age range',
    date: 'Workshop date',
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

  const eventValue = values.event || (lang === 'he' ? 'יום הולדת' : 'Birthday');
  const locationValue =
    values.location ||
    (lang === 'he' ? 'סטודיו דברים יפימו' : 'Devarim Yafimo Studio');

  const base =
    lang === 'he'
      ? 'היי! אשמח לתאם זמן לסדנה.'
      : "Hi! I'd like to coordinate a time for a workshop.";

  const lines = [];
  if (values.fullName) {
    lines.push(lang === 'he' ? `שם מלא: ${values.fullName}` : `Full name: ${values.fullName}`);
  }
  lines.push(lang === 'he' ? `מה האירוע: ${eventValue}` : `Event: ${eventValue}`);
  lines.push(lang === 'he' ? `מיקום הסדנה: ${locationValue}` : `Location: ${locationValue}`);
  if (values.participants) {
    lines.push(
      lang === 'he'
        ? `כמות משתתפים: ${values.participants}`
        : `Participants: ${values.participants}`
    );
  }
  if (values.ageRange) {
    lines.push(lang === 'he' ? `טווח גילאים: ${values.ageRange}` : `Age range: ${values.ageRange}`);
  }
  if (values.date) {
    lines.push(lang === 'he' ? `תאריך הסדנה: ${values.date}` : `Workshop date: ${values.date}`);
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

updateWhatsAppLinks();
