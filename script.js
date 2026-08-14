const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const content = {
  services: ['Modern Photo Booth', '360 Video Booth', 'Keychain Station'],
  locations: ['Long Island', 'New York City', 'Tampa'],
  eventTypes: {
    weddings: {
      name: 'Weddings', primary: '/images/wedding-party.jpg', position: 'center center',
      frames: [
        ['/images/sweet-sixteen.jpg', 'Friends celebrating a wedding in the photo booth', 'WEDDING · FRAME 01'],
        ['/images/wedding-party.jpg', 'Wedding guests laughing with colorful photo booth props', 'WEDDING · LONG ISLAND'],
        ['/images/keychain-keepsake.jpg', 'A personalized wedding photo keepsake', 'WEDDING · KEEPSAKE']
      ]
    },
    sweet16: {
      name: 'Sweet 16s', primary: '/images/sweet-sixteen.jpg', position: 'center 42%',
      frames: [
        ['/images/wedding-party.jpg', 'Friends enjoying a Sweet 16 photo booth', 'SWEET 16 · FRAME 01'],
        ['/images/sweet-sixteen.jpg', 'Three friends celebrating a Sweet 16', 'SWEET 16 · LONG ISLAND'],
        ['/images/keychain-keepsake.jpg', 'A personalized Sweet 16 keepsake', 'SWEET 16 · KEEPSAKE']
      ]
    },
    corporate: {
      name: 'Corporate', primary: '/images/corporate-party.jpg', position: 'center center',
      frames: [
        ['/images/keychain-keepsake.jpg', 'A personalized event keepsake', 'CORPORATE · KEEPSAKE'],
        ['/images/corporate-party.jpg', 'Coworkers enjoying a black and gold photo booth', 'CORPORATE · NYC'],
        ['/images/wedding-party.jpg', 'Guests enjoying a professional event booth', 'CORPORATE · FRAME 03']
      ]
    },
    birthdays: {
      name: 'Birthdays', primary: '/images/keychain-keepsake.jpg', position: 'center center',
      frames: [
        ['/images/wedding-party.jpg', 'Birthday guests posing with colorful props', 'BIRTHDAY · FRAME 01'],
        ['/images/keychain-keepsake.jpg', 'A personalized birthday photo keepsake', 'BIRTHDAY · TAMPA'],
        ['/images/sweet-sixteen.jpg', 'Friends celebrating a birthday together', 'BIRTHDAY · FRAME 03']
      ]
    },
    quinceaneras: {
      name: 'Quinceañeras', primary: '/images/sweet-sixteen.jpg', position: 'center 18%',
      frames: [
        ['/images/corporate-party.jpg', 'Guests dressed for an elegant quinceañera celebration', 'QUINCEAÑERA · FRAME 01'],
        ['/images/sweet-sixteen.jpg', 'Friends celebrating together at a quinceañera', 'QUINCEAÑERA · LONG ISLAND'],
        ['/images/keychain-keepsake.jpg', 'A personalized quinceañera photo keepsake', 'QUINCEAÑERA · KEEPSAKE']
      ]
    }
  }
};
window.momentsContent = content;

const menuButton = $('.menu-trigger');
const mobileMenu = $('.mobile-menu');
const flashOverlay = $('.flash');
flashOverlay?.addEventListener('animationend', () => flashOverlay.remove(), { once: true });
setTimeout(() => flashOverlay?.remove(), 1200);

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
  mobileMenu.classList.toggle('open', !open);
});
$$('.mobile-menu a').forEach(link => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  mobileMenu.classList.remove('open');
}));

const mobileHero = $('#mobile-hero-image');
const celebrationPreview = $('.celebration-preview');
const previewImage = $('.celebration-preview img');
const previewLabel = $('.celebration-preview strong');
const desktopFrames = $$('.desktop-photo-strip .strip-frame');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let celebrationTimer;

Object.values(content.eventTypes).forEach(event => {
  [event.primary, ...event.frames.map(frame => frame[0])].forEach(src => { const image = new Image(); image.src = src; });
});

$$('.negative-tabs button').forEach((tab, index, tabs) => {
  tab.tabIndex = index === 0 ? 0 : -1;
  tab.addEventListener('click', () => {
    const event = content.eventTypes[tab.dataset.event];
    clearTimeout(celebrationTimer);
    tabs.forEach(item => { item.setAttribute('aria-selected', 'false'); item.tabIndex = -1; });
    tab.setAttribute('aria-selected', 'true');
    tab.tabIndex = 0;
    celebrationPreview.setAttribute('aria-labelledby', tab.id);
    celebrationPreview.classList.add('is-changing');
    $('.desktop-photo-strip').classList.add('is-changing');
    const delay = reduceMotion ? 0 : 110;
    celebrationTimer = setTimeout(() => {
      previewImage.src = event.primary;
      previewImage.alt = event.frames[1][1];
      previewImage.style.objectPosition = event.position;
      previewLabel.textContent = event.name;
      mobileHero.src = event.primary;
      mobileHero.alt = event.frames[1][1];
      mobileHero.style.objectPosition = event.position;
      desktopFrames.forEach((frame, frameIndex) => {
        const [src, alt, caption] = event.frames[frameIndex];
        const image = $('img', frame);
        image.src = src;
        image.alt = alt;
        image.style.objectPosition = frameIndex === 1 ? event.position : 'center center';
        $('figcaption', frame).textContent = caption;
      });
      celebrationPreview.classList.remove('is-changing');
      $('.desktop-photo-strip').classList.remove('is-changing');
    }, delay);
  });
  tab.addEventListener('keydown', event => {
    if (!['ArrowRight', 'ArrowLeft'].includes(event.key)) return;
    event.preventDefault();
    const next = (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    tabs[next].focus(); tabs[next].click();
  });
});

const desktopStrip = $('.desktop-photo-strip');
if (desktopStrip && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  $('.hero').addEventListener('pointermove', event => {
    if (innerWidth <= 800) return;
    const x = (event.clientX / innerWidth - .5) * 16;
    const y = (event.clientY / innerHeight - .5) * 8;
    desktopStrip.style.transform = `translate(${x}px, ${y}px)`;
  });
  $('.hero').addEventListener('pointerleave', () => desktopStrip.style.transform = 'translate(0, 0)');
}

const orbit = $('#orbit');
let orbitRotation = 0, dragStart = null;
const setOrbit = value => { orbitRotation = value; orbit.style.transform = `rotate(${orbitRotation}deg)`; $$('.orbit-photo img', orbit).forEach(img => img.style.transform = `rotate(${-orbitRotation}deg)`); };
orbit?.addEventListener('pointerdown', event => { dragStart = event.clientX; orbit.setPointerCapture(event.pointerId); });
orbit?.addEventListener('pointermove', event => { if (dragStart === null) return; const delta = event.clientX - dragStart; dragStart = event.clientX; setOrbit(orbitRotation + delta * .45); });
orbit?.addEventListener('pointerup', () => dragStart = null);
orbit?.addEventListener('pointercancel', () => dragStart = null);
orbit?.addEventListener('keydown', event => { if (event.key === 'ArrowLeft') setOrbit(orbitRotation - 12); if (event.key === 'ArrowRight') setOrbit(orbitRotation + 12); });

const lightbox = $('.lightbox');
const lightboxImage = $('.lightbox img');
const lightboxCaption = $('.lightbox p');
let lightboxTrigger = null;
$$('.gallery-item').forEach(item => item.addEventListener('click', () => {
  lightboxTrigger = item;
  lightboxImage.src = item.dataset.full;
  lightboxImage.alt = $('img', item).alt;
  lightboxCaption.textContent = item.dataset.caption;
  lightbox.classList.add('opening');
  lightbox.showModal();
  setTimeout(() => lightbox.classList.remove('opening'), 400);
}));
const closeLightbox = () => { lightbox.close(); lightboxTrigger?.focus(); };
$('.lightbox-close')?.addEventListener('click', closeLightbox);
lightbox?.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });

const processObserver = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('in-view', entry.isIntersecting)), { threshold: .5 });
$$('.process-strip article').forEach(item => processObserver.observe(item));

const stickyBook = $('.sticky-book');
const hero = $('.hero');
const booking = $('.booking');
const mobileViewport = matchMedia('(max-width: 800px)');
let heroPassed = false;
let formNear = false;
const updateSticky = () => stickyBook.classList.toggle('visible', mobileViewport.matches && heroPassed && !formNear);

const heroObserver = new IntersectionObserver(([entry]) => {
  heroPassed = !entry.isIntersecting && entry.boundingClientRect.bottom < 20;
  updateSticky();
}, { rootMargin: '-20px 0px 0px' });

const bookingObserver = new IntersectionObserver(([entry]) => {
  formNear = entry.isIntersecting || entry.boundingClientRect.top < 0;
  updateSticky();
}, { rootMargin: '0px 0px -15% 0px' });

heroObserver.observe(hero);
bookingObserver.observe(booking);
mobileViewport.addEventListener('change', updateSticky);
updateSticky();

const form = $('.inquiry-form');
const dateInput = $('#date');
dateInput.min = new Date().toISOString().split('T')[0];
const messages = { valueMissing: 'Please complete this field.', typeMismatch: 'Please enter a valid email address.', patternMismatch: 'Please enter a valid phone number.', rangeUnderflow: 'Guest count must be at least 1.' };
const validateField = field => {
  const wrap = field.closest('.field');
  if (!wrap) return true;
  const error = $('.error', wrap);
  const invalid = !field.validity.valid;
  wrap.classList.toggle('invalid', invalid);
  field.setAttribute('aria-invalid', String(invalid));
  error.textContent = invalid ? (Object.keys(messages).find(key => field.validity[key]) ? messages[Object.keys(messages).find(key => field.validity[key])] : 'Please check this field.') : '';
  return !invalid;
};
$$('input, select, textarea', form).forEach(field => field.addEventListener('blur', () => validateField(field)));
form?.addEventListener('submit', event => {
  event.preventDefault();
  const fields = $$('input, select, textarea', form);
  const valid = fields.map(validateField).every(Boolean);
  const status = $('.form-status', form);
  if (!valid) {
    status.textContent = 'Please check the highlighted fields.';
    $('.invalid input, .invalid select', form)?.focus();
    return;
  }
  status.textContent = 'Demo inquiry received — this concept form is ready to connect to your booking system.';
  form.reset();
  fields.forEach(field => { field.removeAttribute('aria-invalid'); field.closest('.field')?.classList.remove('invalid'); });
});

$('#year').textContent = new Date().getFullYear();
