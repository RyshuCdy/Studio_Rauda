// Pointer-responsive photo framing, with one scheduled update per frame.
(() => {
  const enabled = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  document.querySelectorAll('.event-photo').forEach(photo => {
    let frame = 0;
    function reset() {
      cancelAnimationFrame(frame);
      frame = 0;
      ['--photo-x', '--photo-y', '--mouse-x', '--mouse-y'].forEach(key => photo.style.removeProperty(key));
    }
    photo.addEventListener('pointermove', event => {
      if (!enabled.matches || event.pointerType === 'touch') return;
      const bounds = photo.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
      const y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        photo.style.setProperty('--photo-x', `${(x - .5) * -12}px`);
        photo.style.setProperty('--photo-y', `${(y - .5) * -12}px`);
        photo.style.setProperty('--mouse-x', `${x * 100}%`);
        photo.style.setProperty('--mouse-y', `${y * 100}%`);
        frame = 0;
      });
    }, { passive: true });
    photo.addEventListener('pointerleave', reset);
    photo.addEventListener('pointercancel', reset);
    photo.addEventListener('click', reset);
    enabled.addEventListener('change', reset);
  });
})();

// Event gallery: native dialog provides focus containment and Escape support.
(() => {
  const dialog = document.getElementById('eventLightbox');
  if (!dialog) return;
  const nativeDialog = typeof dialog.showModal === 'function';
  document.body.append(dialog);
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  const links = [...document.querySelectorAll('[data-event-photo]')];
  const image = document.getElementById('eventLightboxImage');
  const counter = document.getElementById('eventLightboxCounter');
  const error = dialog.querySelector('.event-image-error');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let index = 0, trigger, previousOverflow, touchStart;
  function showPhoto(next) {
    index = (next + links.length) % links.length;
    const link = links[index];
    error.hidden = true;
    image.alt = link.querySelector('img')?.alt || link.dataset.caption;
    image.src = link.href;
    counter.textContent = `${index + 1} / ${links.length}`;
    if (!reducedMotion.matches && image.animate) {
      image.getAnimations().forEach(animation => animation.cancel());
      image.animate([{ opacity: .25, transform: 'translateY(8px) scale(.985)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'ease-out' });
    }
  }
  image.addEventListener('error', () => { error.hidden = false; });
  image.addEventListener('load', () => { error.hidden = true; });
  links.forEach((link, i) => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    trigger = link;
    previousOverflow = document.body.style.overflow;
    showPhoto(i);
    if (nativeDialog) dialog.showModal();
    else {
      dialog.setAttribute('open', '');
      dialog.querySelector('[data-gallery-close]').focus();
    }
    document.body.style.overflow = 'hidden';
  }));
  function restoreFocus() {
    document.body.style.overflow = previousOverflow;
    trigger?.focus({ preventScroll: true });
  }
  function closeGallery() {
    if (nativeDialog) dialog.close();
    else { dialog.removeAttribute('open'); restoreFocus(); }
  }
  dialog.querySelector('[data-gallery-close]').addEventListener('click', closeGallery);
  dialog.querySelector('[data-gallery-prev]').addEventListener('click', () => showPhoto(index - 1));
  dialog.querySelector('[data-gallery-next]').addEventListener('click', () => showPhoto(index + 1));
  dialog.addEventListener('close', restoreFocus);
  dialog.addEventListener('keydown', event => {
    if (!nativeDialog && event.key === 'Escape') closeGallery();
    if (!nativeDialog && event.key === 'Tab') {
      const buttons = [...dialog.querySelectorAll('button')];
      if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons[buttons.length - 1].focus(); }
      else if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) { event.preventDefault(); buttons[0].focus(); }
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault();
      showPhoto(index + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  const stage = dialog.querySelector('.event-lightbox-stage');
  stage.addEventListener('touchstart', event => {
    touchStart = event.touches.length === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  stage.addEventListener('touchend', event => {
    if (!touchStart) return;
    const dx = event.changedTouches[0].clientX - touchStart.x;
    const dy = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) showPhoto(index + (dx < 0 ? 1 : -1));
    touchStart = null;
  }, { passive: true });
  stage.addEventListener('touchcancel', () => { touchStart = null; });
})();

// ── NAV SCROLL ──
  const nav = document.getElementById('mainNav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
  }

  // ── MOBILE MENU ──
  const hamburger = document.getElementById('navHamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  // Close menu on link click
  if (navLinks) navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // ── SCROLL REVEAL ──
  const reveals = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      // Reset only once an element has fully left the view. This lets the
      // reveal replay naturally when the visitor scrolls back to it.
      e.target.classList.toggle('visible', e.isIntersecting);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });
  reveals.forEach(el => observer.observe(el));

  // ── JOIN EVENT FORM ──
  const joinForm = document.getElementById('joinEventForm');
  const joinSuccess = document.getElementById('joinSuccess');
  const joinError = document.getElementById('joinError');
  const joinBtn = document.getElementById('joinSubmitBtn');
  const joinEmail = document.getElementById('joinEmail');

  if (joinForm) {
    joinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      joinError.style.display = 'none';
      joinSuccess.style.display = 'none';

      // Validate email
      const email = joinEmail.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        joinError.textContent = 'Please enter a valid email address.';
        joinError.style.display = 'block';
        joinEmail.focus();
        return;
      }

      // Loading state
      joinBtn.disabled = true;
      joinBtn.textContent = 'Sending...';

      try {
        const formData = new FormData(joinForm);
        const response = await fetch('https://formsubmit.co/ajax/rauda.elsewhere@gmail.com', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ email: email, _subject: 'New Event Signup - Studio Rauda', _template: 'table' })
        });

        if (response.ok) {
          joinForm.querySelector('.join-form-row').style.display = 'none';
          joinSuccess.style.display = 'block';
        } else {
          throw new Error('Network response was not ok');
        }
      } catch (err) {
        joinBtn.disabled = false;
        joinBtn.textContent = 'Join Upcoming Events';
        joinError.textContent = 'Something went wrong. Please try again or email us at contact@studiorauda.com';
        joinError.style.display = 'block';
      }
    });
  }
