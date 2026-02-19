/* ============================================================
   Stars Elite Wood Industry LLC — Main JavaScript
   FILE: assets/js/main.js
   ============================================================ */
(function () {
  'use strict';

  /* ========================
     Helpers
     ======================== */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ========================
     Navigation Controller
     ======================== */
  const NavController = {
    init() {
      const header   = $('.header');
      const menuBtn  = $('#menuBtn');
      const navLinks = $('#navLinks');

      if (!header || !menuBtn || !navLinks) return;

      // Scroll state
      const onScroll = () => {
        header.classList.toggle('scrolled', window.scrollY > 30);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();

      // Toggle
      menuBtn.addEventListener('click', () => {
        const isOpen = navLinks.classList.toggle('open');
        menuBtn.classList.toggle('open', isOpen);
        menuBtn.setAttribute('aria-expanded', String(isOpen));
        document.body.style.overflow = isOpen ? 'hidden' : '';
      });

      // Close on link click
      $$('a', navLinks).forEach(a => {
        a.addEventListener('click', () => this.close(menuBtn, navLinks));
      });

      // Close outside click
      document.addEventListener('click', e => {
        if (navLinks.classList.contains('open') &&
            !navLinks.contains(e.target) &&
            !menuBtn.contains(e.target)) {
          this.close(menuBtn, navLinks);
        }
      });

      // ESC key
      document.addEventListener('keydown', e => {
        if (e.key === 'Escape') this.close(menuBtn, navLinks);
      });

      // Active link
      this.setActiveLink();
    },

    close(btn, nav) {
      if (!nav) return;
      nav.classList.remove('open');
      btn && btn.classList.remove('open');
      btn && btn.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    },

    setActiveLink() {
      const path = location.pathname.split('/').pop() || 'index.html';
      $$('.nav-links a').forEach(a => {
        const href = (a.getAttribute('href') || '').split('/').pop();
        if (href === path) {
          a.classList.add('active');
        }
      });
    }
  };

  /* ========================
     Animation Controller
     ======================== */
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

  /* ========================
     Form Validation Controller
     ======================== */
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
      if (error) {
        field.classList.add('error');
        if (errEl) { errEl.textContent = error; errEl.classList.add('visible'); }
      } else {
        field.classList.remove('error');
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
      // Save to localStorage
      try {
        const key = form.id + '_submissions';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        const data = {};
        new FormData(form).forEach((v, k) => data[k] = v);
        data._timestamp = new Date().toISOString();
        existing.push(data);
        localStorage.setItem(key, JSON.stringify(existing));
      } catch(e) { /* silent */ }
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
      form.addEventListener('submit', e => {
        e.preventDefault();
        if (submitting) return;
        if (!this.validateAll(form)) return;

        submitting = true;
        const btn = $('[type="submit"]', form);
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

        // Simulate async
        setTimeout(() => {
          const successEl = $('#quoteSuccess');
          this.showSuccess(form, successEl);
          submitting = false;
        }, 1200);
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
      form.addEventListener('submit', e => {
        e.preventDefault();
        if (submitting) return;
        if (!this.validateAll(form)) return;

        submitting = true;
        const btn = $('[type="submit"]', form);
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

        setTimeout(() => {
          const successEl = $('#contactSuccess');
          this.showSuccess(form, successEl);
          submitting = false;
        }, 1200);
      });
    }
  };

  /* ========================
     UI Controller
     ======================== */
  const UIController = {
    init() {
      this.setYear();
      this.initSmoothScroll();
      this.initProductQuoteLinks();
    },

    setYear() {
      const el = $('#currentYear');
      if (el) el.textContent = new Date().getFullYear();
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
      // Product "Request Quote" links populate the quote form's product field
      $$('[data-product]').forEach(btn => {
        btn.addEventListener('click', e => {
          const product = btn.dataset.product;
          // Store in sessionStorage and navigate
          try { sessionStorage.setItem('quoteProduct', product); } catch(e) {}
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
        } catch(e) {}
      }
    }
  };

  /* ========================
     Boot
     ======================== */
  document.addEventListener('DOMContentLoaded', () => {
    NavController.init();
    AnimController.init();
    FormController.init();
    UIController.init();
  });

})();
