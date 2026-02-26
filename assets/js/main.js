(function () {
  'use strict';

  const SiteConfig = {
    WHATSAPP_NUMBER: '971557891658',
    WHATSAPP_MESSAGE: 'Hello Stars Elite Wood Industry LLC, I would like a quote.',
  };

  // Helpers
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const isMobileNav = () => window.matchMedia('(max-width: 768px)').matches;
  const buildWhatsAppLink = (number, message) =>
    `https://wa.me/${String(number).replace(/[^\d]/g, '')}?text=${encodeURIComponent(message)}`;

  /* Build pre-filled WhatsApp message from form. Quote: Name, Company, Phone, Email, Product Type, Quantity, Dimensions, Treatment, Notes. Contact: Name, Email, Phone, Subject, Message. */
  function buildWhatsAppMessageFromForm(form) {
    if (!form || !form.elements) return '';
    const get = (name) => {
      const el = form.querySelector(`[name="${name}"]`);
      return (el && el.value && el.value.trim()) ? el.value.trim() : '';
    };
    const lines = [];
    const add = (label, value) => { if (value) lines.push(`${label}: ${value}`); };

    if (form.id === 'quoteForm') {
      lines.push('Quote Request — Stars Elite Wood Industry LLC');
      lines.push('');
      add('Name', get('fullName'));
      add('Company', get('company'));
      add('Phone', get('phone'));
      add('Email', get('email'));
      add('Industry / Use Case', get('industry'));
      add('Product Type', get('productType'));
      add('Quantity', get('quantity'));
      add('Dimensions', get('dimensions'));
      add('Timeline', get('timeline'));
      add('Treatment (ISPM-15 / Fumigation / None)', get('treatment'));
      add('Notes', get('message'));
    } else if (form.id === 'contactForm') {
      lines.push('Contact — Stars Elite Wood Industry LLC');
      lines.push('');
      add('Name', get('name'));
      add('Email', get('email'));
      add('Phone', get('phone'));
      add('Subject', get('subject'));
      add('Message', get('message'));
    }
    return lines.filter(Boolean).join('\n') || '';
  }

  // Navigation
  const NavController = {
    init() {
      const header   = $('.header');
      const menuBtn  = $('#menuBtn');
      const navLinks = $('#navLinks');
      this.menuBtn = menuBtn;
      this.navLinks = navLinks;

      if (!header || !menuBtn || !navLinks) return;

      // Scroll state
      const onScroll = () => {
        header.classList.toggle('scrolled', window.scrollY > 30);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      // Toggle mobile menu on burger click
      menuBtn.addEventListener('click', () => {
        const isActive = document.body.classList.contains('mobile-menu-active');
        this.setOpen(!isActive);
      });

      // Close menu when any nav link is clicked
      $$('a', navLinks).forEach(a => {
        a.addEventListener('click', () => this.setOpen(false));
      });

      // Close on outside click
      document.addEventListener('click', e => {
        if (document.body.classList.contains('mobile-menu-active') &&
            !navLinks.contains(e.target) &&
            !menuBtn.contains(e.target)) {
          this.setOpen(false);
        }
      });

      // ESC key
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') this.setOpen(false);
        if (e.key === 'Tab') this.handleFocusTrap(e);
      });

      window.addEventListener('resize', () => {
        if (!isMobileNav()) this.setOpen(false);
      });

      // Active link
      this.setActiveLink();
    },

    setOpen(open) {
      if (!this.navLinks || !this.menuBtn) return;

      if (!isMobileNav()) {
        this.menuBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('mobile-menu-active');
        return;
      }

      this.menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('mobile-menu-active', open);

      if (open) {
        const firstLink = $('a', this.navLinks);
        firstLink && firstLink.focus();
      } else {
        this.menuBtn.focus();
      }
    },

    handleFocusTrap(e) {
      if (!this.navLinks || !document.body.classList.contains('mobile-menu-active')) return;
      const focusables = $$('a, button, [tabindex]:not([tabindex="-1"])', this.navLinks);
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },

    setActiveLink() {
      const path = location.pathname.split('/').pop() || 'index.html';
      $$('.nav-links a').forEach(a => {
        const href = (a.getAttribute('href') || '').split('/').pop();
        const isActive = href === path || (path === '' && href === 'index.html');
        a.classList.toggle('active', isActive);
        if (isActive) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
      });
    }
  };

  // WhatsApp
  const WhatsAppController = {
    init() {
      const href = buildWhatsAppLink(SiteConfig.WHATSAPP_NUMBER, SiteConfig.WHATSAPP_MESSAGE);
      this.updateInlineLinks(href);
      this.injectFloatingButton(href);
      this.initFormSendToWhatsApp();
    },

    updateInlineLinks(href) {
      $$('[data-whatsapp-link]').forEach(link => {
        link.setAttribute('href', href);
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      });
    },

    initFormSendToWhatsApp() {
      $$('[data-whatsapp-link]').forEach(link => {
        link.addEventListener('click', (e) => {
          const form = link.closest('form') || $('#quoteForm') || $('#contactForm');
          if (!form) return;
          e.preventDefault();
          if (!FormController.validateAll(form)) return;
          const msg = buildWhatsAppMessageFromForm(form);
          const text = msg || SiteConfig.WHATSAPP_MESSAGE;
          const url = buildWhatsAppLink(SiteConfig.WHATSAPP_NUMBER, text);
          window.open(url, '_blank', 'noopener,noreferrer');
        });
      });
    },

    injectFloatingButton(href) {
      if ($('.whatsapp-float')) return;
      const btn = document.createElement('a');
      btn.className = 'whatsapp-float';
      btn.href = href;
      btn.target = '_blank';
      btn.rel = 'noopener noreferrer';
      btn.setAttribute('aria-label', 'WhatsApp');
      btn.setAttribute('title', 'WhatsApp');
      btn.innerHTML = `
        <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M16.04 3.2c-7.07 0-12.8 5.73-12.8 12.8 0 2.25.59 4.45 1.72 6.39L3.2 28.8l6.57-1.72a12.73 12.73 0 0 0 6.27 1.65h.01c7.07 0 12.8-5.73 12.8-12.8s-5.74-12.73-12.8-12.73Zm0 23.44h-.01a10.58 10.58 0 0 1-5.39-1.47l-.39-.23-3.9 1.02 1.04-3.8-.25-.39a10.59 10.59 0 1 1 8.9 4.87Zm5.81-7.93c-.32-.16-1.88-.93-2.17-1.03-.29-.11-.51-.16-.72.16-.21.32-.83 1.03-1.02 1.24-.19.21-.37.24-.69.08-.32-.16-1.34-.49-2.56-1.55-.95-.85-1.59-1.89-1.78-2.21-.19-.32-.02-.49.14-.65.14-.14.32-.37.48-.56.16-.19.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.74-.99-2.38-.26-.63-.53-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.29.32-1.11 1.08-1.11 2.63s1.14 3.05 1.3 3.26c.16.21 2.22 3.39 5.38 4.75.75.32 1.34.51 1.8.65.76.24 1.45.21 2 .13.61-.09 1.88-.77 2.14-1.51.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z"/>
        </svg>`;
      document.body.appendChild(btn);
    }
  };

  // Scroll reveal animation
  const AnimController = {
    init() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const els = $$('.reveal');
      if (!els.length) return;

      const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

      els.forEach(el => io.observe(el));
    }
  };

  // Form validation
  const FormController = {
    rules: {
      required: (val) => val.trim() !== '' || 'This field is required',
      email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()) || 'Please enter a valid email address',
      phone: (val) => val.trim() === '' || /^[\+]?[\d\s\-\(\)]{7,20}$/.test(val.trim()) || 'Please enter a valid phone number',
      minLen: (n) => (val) => val.trim().length >= n || `Minimum ${n} characters required`,
    },

    init() {
      this.initQuoteForm();
      this.initContactForm();
    },

    validate(field) {
      const validators = field.dataset.validate ? field.dataset.validate.split(',') : [];
      let error = null;

      for (const rule of validators) {
        const trimmed = rule.trim();
        let result;

        if (trimmed === 'required') result = this.rules.required(field.value);
        else if (trimmed === 'email') result = this.rules.email(field.value);
        else if (trimmed === 'phone') result = this.rules.phone(field.value);
        else if (trimmed.startsWith('min:')) {
          const n = parseInt(trimmed.split(':')[1], 10);
          result = this.rules.minLen(n)(field.value);
        }

        if (result !== true && result !== undefined) {
          error = result;
          break;
        }
      }

      const errEl = field.parentElement.querySelector('.field-error');
      if (errEl) {
        if (!errEl.id) {
          const fieldKey = field.id || field.name || 'field';
          errEl.id = `${fieldKey}-error`;
        }
        field.setAttribute('aria-describedby', errEl.id);
      }
      if (error) {
        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');
        if (errEl) { errEl.textContent = error; errEl.classList.add('visible'); }
      } else {
        field.classList.remove('error');
        field.setAttribute('aria-invalid', 'false');
        if (errEl) { errEl.classList.remove('visible'); }
      }
      return !error;
    },

    validateAll(form) {
      const fields = $$('[data-validate]', form);
      let valid = true;
      fields.forEach(f => { if (!this.validate(f)) valid = false; });
      if (!valid) {
        const firstErr = $('[data-validate].error', form);
        if (firstErr) firstErr.focus();
      }
      return valid;
    },

    showSuccess(form, successEl) {
      form.style.display = 'none';
      if (successEl) successEl.classList.add('visible');
    },

    showSubmitError(form, message) {
      let errorEl = $('.form-submit-error', form);
      if (!errorEl) {
        errorEl = document.createElement('p');
        errorEl.className = 'form-submit-error';
        errorEl.setAttribute('role', 'alert');
        errorEl.setAttribute('aria-live', 'polite');
        errorEl.style.color = '#b91c1c';
        errorEl.style.marginTop = '12px';
        errorEl.style.fontSize = '0.9rem';
        const submitRow = $('.form-submit-row', form);
        if (submitRow) submitRow.appendChild(errorEl);
      }
      errorEl.textContent = message;
    },

    clearSubmitError(form) {
      const errorEl = $('.form-submit-error', form);
      if (errorEl) errorEl.textContent = '';
    },

    async submitForm(form) {
      const endpoint = form.dataset.endpoint || form.getAttribute('action') || window.STARS_ELITE_FORM_ENDPOINT;
      if (!endpoint) {
        throw new Error('No form endpoint configured');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: new FormData(form)
      });

      let payload = null;
      try { payload = await response.json(); } catch (e) { /* ignore json parse errors */ }

      if (!response.ok) {
        const err = payload && payload.message ? payload.message : 'Submission failed';
        throw new Error(err);
      }
    },

    initQuoteForm() {
      const form = $('#quoteForm');
      if (!form) return;

      // Live validation on blur
      $$('[data-validate]', form).forEach(f => {
        f.addEventListener('blur', () => this.validate(f));
        f.addEventListener('input', () => {
          if (f.classList.contains('error')) this.validate(f);
        });
      });

      let submitting = false;
      form.addEventListener('submit', async e => {
        e.preventDefault();
        if (submitting) return;
        if (!this.validateAll(form)) return;
        this.clearSubmitError(form);

        submitting = true;
        const btn = $('[type="submit"]', form);
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

        try {
          await this.submitForm(form);
          const successEl = $('#quoteSuccess');
          this.showSuccess(form, successEl);
        } catch (err) {
          this.showSubmitError(form, 'Unable to send right now. Please call +971-55-7891658 or email starselite.wood@gmail.com.');
        } finally {
          submitting = false;
          if (btn) { btn.disabled = false; btn.textContent = 'Send Quote Request'; }
        }
      });
    },

    initContactForm() {
      const form = $('#contactForm');
      if (!form) return;

      $$('[data-validate]', form).forEach(f => {
        f.addEventListener('blur', () => this.validate(f));
        f.addEventListener('input', () => {
          if (f.classList.contains('error')) this.validate(f);
        });
      });

      let submitting = false;
      form.addEventListener('submit', async e => {
        e.preventDefault();
        if (submitting) return;
        if (!this.validateAll(form)) return;
        this.clearSubmitError(form);

        submitting = true;
        const btn = $('[type="submit"]', form);
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

        try {
          await this.submitForm(form);
          const successEl = $('#contactSuccess');
          this.showSuccess(form, successEl);
        } catch (err) {
          this.showSubmitError(form, 'Unable to send right now. Please call +971-55-7891658 or email starselite.wood@gmail.com.');
        } finally {
          submitting = false;
          if (btn) { btn.disabled = false; btn.textContent = 'Send Message'; }
        }
      });
    }
  };

  // UI (smooth scroll, product links, card pinch)
  const UIController = {
    init() {
      this.initSmoothScroll();
      this.initProductQuoteLinks();
      this.initProductCardRightClickPinch();
    },

    initSmoothScroll() {
      document.addEventListener('click', e => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        const id = link.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    },

    initProductQuoteLinks() {
      // Request Quote links pre-fill quote form product
      $$('[data-product]').forEach(btn => {
        btn.addEventListener('click', () => {
          const product = btn.dataset.product;
          // Store in sessionStorage and navigate
          try { sessionStorage.setItem('quoteProduct', product); } catch (error) { /* ignore storage errors */ }
        });
      });

      // On quote page, pre-fill if present
      const productSelect = $('#productType');
      if (productSelect) {
        try {
          const stored = sessionStorage.getItem('quoteProduct');
          if (stored) {
            // Find matching option
            $$('option', productSelect).forEach(opt => {
              if (opt.value === stored || opt.textContent.includes(stored)) {
                opt.selected = true;
              }
            });
            sessionStorage.removeItem('quoteProduct');
          }
        } catch (error) { /* ignore storage errors */ }
      }
    },

    initProductCardRightClickPinch() {
      const cards = $$('.product-card');
      if (!cards.length) return;

      const applyPinch = (card) => {
        card.classList.remove('pinch-press');
        void card.offsetWidth;
        card.classList.add('pinch-press');
        window.setTimeout(() => card.classList.remove('pinch-press'), 220);
      };

      cards.forEach(card => {
        card.addEventListener('contextmenu', () => applyPinch(card));
        card.addEventListener('mousedown', (e) => {
          if (e.button === 2) applyPinch(card);
        });
      });
    }
  };

  // Product card click (data-href, no nested anchors)
  const ProductCardController = {
    init() {
      document.addEventListener('click', (e) => this.handleClick(e));
      document.addEventListener('keydown', (e) => this.handleKeydown(e));
    },

    getCard(el) {
      return el && el.closest('.product-card[data-href]');
    },

    handleClick(e) {
      const card = this.getCard(e.target);
      if (!card) return;
      if (e.target.closest('a, button')) return;

      const href = (card.dataset.href || '').trim();
      if (!href || href === '#') return;

      if (href.startsWith('#')) {
        const targetEl = document.querySelector(href);
        if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        try {
          if (card.dataset.product) sessionStorage.setItem('quoteProduct', card.dataset.product);
        } catch (err) { /* ignore */ }
        window.location.href = href;
      }
    },

    handleKeydown(e) {
      const card = this.getCard(e.target);
      if (!card) return;
      if (e.key !== 'Enter' && e.key !== ' ') return;

      const focusInside = card.contains(document.activeElement) && document.activeElement !== card;
      if (focusInside && (document.activeElement.closest('a') || document.activeElement.closest('button'))) return;

      e.preventDefault();
      if (e.key === ' ') e.preventDefault();

      const href = (card.dataset.href || '').trim();
      if (!href || href === '#') return;

      if (href.startsWith('#')) {
        const targetEl = document.querySelector(href);
        if (targetEl) targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        try {
          if (card.dataset.product) sessionStorage.setItem('quoteProduct', card.dataset.product);
        } catch (err) { /* ignore */ }
        window.location.href = href;
      }
    }
  };

  // CTA / conversion tracking
  const ConversionTracker = {
    init() {
      $$('[data-cta]').forEach(el => {
        el.addEventListener('click', (e) => {
          const cta = el.getAttribute('data-cta');
          if (cta) this.trackClick(cta, el);
        });
      });
      this.trackFormSuccess();
    },

    trackClick(ctaName, element) {
      // dataLayer / gtag
      if (typeof window.dataLayer !== 'undefined') {
        try {
          window.dataLayer.push({
            event: 'cta_click',
            cta_name: ctaName,
            cta_element: element.tagName,
            page: (window.location.pathname || '').split('/').pop() || 'index.html'
          });
        } catch (err) { /* ignore */ }
      }
      if (typeof window.gtag === 'function') {
        try {
          window.gtag('event', 'cta_click', { cta_name: ctaName });
        } catch (err) { /* ignore */ }
      }
    },

    trackFormSuccess() {
      // Hook after showSuccess for conversion tracking
      const orig = FormController.showSuccess.bind(FormController);
      FormController.showSuccess = (form, successEl) => {
        orig(form, successEl);
        const conversion = form && form.getAttribute('data-conversion');
        if (conversion && typeof window.dataLayer !== 'undefined') {
          try {
            window.dataLayer.push({ event: 'form_submit_success', form_type: conversion });
          } catch (err) { /* ignore */ }
        }
        if (conversion && typeof window.gtag === 'function') {
          try { window.gtag('event', 'generate_lead', { form_type: conversion }); } catch (err) { /* ignore */ }
        }
      };
    }
  };

  // Boot
  document.addEventListener('DOMContentLoaded', () => {
    NavController.init();
    AnimController.init();
    FormController.init();
    UIController.init();
    WhatsAppController.init();
    ConversionTracker.init();
    ProductCardController.init();
    heroLogoParallax();
  });

  function heroLogoParallax() {
    const hero = document.querySelector('.hero');
    const logo = document.querySelector('.hero-logo-overlay');
    if (!hero || !logo) return;

    const mq = window.matchMedia('(max-width: 768px)');
    let raf = null;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    function animate() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      logo.style.transform = `translate3d(${currentX}px, calc(-50% + ${currentY}px), 0)`;
      raf = requestAnimationFrame(animate);
    }

    function onMove(e) {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 10;
      targetY = y * 10;
      if (!raf) raf = requestAnimationFrame(animate);
    }

    function onLeave() {
      targetX = 0;
      targetY = 0;
    }

    function enable() {
      hero.addEventListener('mousemove', onMove);
      hero.addEventListener('mouseleave', onLeave);
    }

    function disable() {
      hero.removeEventListener('mousemove', onMove);
      hero.removeEventListener('mouseleave', onLeave);
      logo.style.transform = '';
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      targetX = targetY = currentX = currentY = 0;
    }

    if (!mq.matches) enable();
    mq.addEventListener('change', (ev) => {
      if (ev.matches) disable();
      else enable();
    });
  }

})();
