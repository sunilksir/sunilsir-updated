/* Core interactions for the multi-page glassmorphism portfolio */

(() => {
  const doc = document;
  const body = doc.body;

  const header = doc.querySelector('[data-header]');
  const navToggle = doc.querySelector('[data-nav-toggle]');
  const mobileNav = doc.querySelector('[data-mobile-nav]');
  const navLinks = doc.querySelectorAll('[data-page-link]');
  const backToTop = doc.querySelector('[data-back-to-top]');

  /* Helpers */
  const closeNav = () => {
    if (!mobileNav) return;
    mobileNav.classList.remove('is-visible');
    body.classList.remove('has-open-nav');
    if (navToggle) {
      navToggle.classList.remove('is-active');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  };

  const openNav = () => {
    if (!mobileNav) return;
    mobileNav.classList.add('is-visible');
    body.classList.add('has-open-nav');
    if (navToggle) {
      navToggle.classList.add('is-active');
      navToggle.setAttribute('aria-expanded', 'true');
    }
  };

  /* Navigation toggle */
  if (navToggle && mobileNav) {
    navToggle.addEventListener('click', () => {
      if (mobileNav.classList.contains('is-visible')) {
        closeNav();
      } else {
        openNav();
      }
    });

    mobileNav.addEventListener('click', (event) => {
      if (event.target === mobileNav) {
        closeNav();
      }
    });
  }

  doc.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileNav && mobileNav.classList.contains('is-visible')) {
      closeNav();
    }
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (link.closest('[data-mobile-nav]')) {
        closeNav();
      }
    });
  });

  /* Active navigation state */
  const currentPage = body.dataset.page;
  if (currentPage) {
    navLinks.forEach((link) => {
      const target = link.dataset.pageLink;
      const isActive = target === currentPage;
      link.classList.toggle('is-active', isActive);
      link.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
  }

  /* Sticky header + back to top */
  const updateOnScroll = () => {
    const offset = window.scrollY;
    if (header) {
      header.classList.toggle('is-sticky', offset > 40);
    }
    if (backToTop) {
      backToTop.classList.toggle('is-visible', offset > 280);
    }
  };

  window.addEventListener('scroll', updateOnScroll, { passive: true });
  updateOnScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* Reveal animations */
  const revealables = doc.querySelectorAll('[data-reveal]');
  const animateSkillBar = (bar) => {
    const fill = bar.querySelector('.skill-bar__fill');
    const value = bar.querySelector('.skill-bar__value');
    const target = Math.max(0, Math.min(100, Number(bar.dataset.skillProgress) || 0));
    if (!fill || !value || bar.dataset.animated) return;

    bar.dataset.animated = 'true';
    fill.style.width = `${target}%`;
    value.textContent = `${target}%`;
  };

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        el.classList.add('is-visible');
        if (el.matches('[data-skill-progress]')) {
          animateSkillBar(el);
        }
        obs.unobserve(el);
      });
    }, { threshold: 0.1, rootMargin: "-10% 0px" });

    revealables.forEach((el) => observer.observe(el));
  } else {
    revealables.forEach((el) => {
      el.classList.add('is-visible');
      if (el.matches('[data-skill-progress]')) {
        animateSkillBar(el);
      }
    });
  }

  /* Portfolio filters */
  const filterButtons = Array.from(doc.querySelectorAll('[data-filter]'));
  const portfolioCards = Array.from(doc.querySelectorAll('.portfolio-card'));

  if (filterButtons.length && portfolioCards.length) {
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        const filter = button.dataset.filter || 'all';
        filterButtons.forEach((btn) => {
          btn.classList.toggle('is-active', btn === button);
          btn.setAttribute('aria-selected', btn === button ? 'true' : 'false');
        });

        portfolioCards.forEach((card) => {
          const category = card.dataset.category || 'all';
          const isVisible = filter === 'all' || category === filter;
          card.classList.toggle('is-hidden', !isVisible);
        });
      });
    });
  }

  /* Theme toggle */
  const themeToggle = doc.querySelector('[data-theme-toggle]');
  const themeKey = 'sk-theme-preference';
  const themeIcon = themeToggle ? themeToggle.querySelector('span') : null;
  let storageEnabled = true;

  const getStoredTheme = () => {
    if (!storageEnabled) return null;
    try {
      return window.localStorage.getItem(themeKey);
    } catch (error) {
      storageEnabled = false;
      return null;
    }
  };

  const setStoredTheme = (value) => {
    if (!storageEnabled) return;
    try {
      window.localStorage.setItem(themeKey, value);
    } catch (error) {
      storageEnabled = false;
    }
  };

  const applyTheme = (theme) => {
    const nextTheme = theme === 'light' ? 'light' : 'dark';
    body.dataset.theme = nextTheme;
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', `Switch to ${nextTheme === 'dark' ? 'light' : 'dark'} mode`);
    }
    if (themeIcon) {
      themeIcon.textContent = nextTheme === 'dark' ? '☀️' : '🌙';
    }
  };

  const initialTheme = getStoredTheme();
  applyTheme(initialTheme || 'dark');

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = body.dataset.theme === 'light' ? 'light' : 'dark';
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
      setStoredTheme(next);
    });
  }

  /* Contact form */
  const form = doc.querySelector('[data-form]');
  if (form) {
    const messageBox = form.querySelector('.form-message');
    const submitBtn = form.querySelector('[data-form-btn]');
    let emailJsReady = false;

    const updateMessage = (text, type) => {
      if (!messageBox) return;
      messageBox.textContent = text;
      messageBox.classList.remove('is-success', 'is-error');
      if (type) {
        messageBox.classList.add(type === 'success' ? 'is-success' : 'is-error');
      }
    };

    if (window.emailjs && typeof window.emailjs.init === 'function') {
      try {
        window.emailjs.init('QqR-lniyxZFJ-r4Uv');
        emailJsReady = true;
      } catch (error) {
        emailJsReady = false;
        console.warn('EmailJS init failed:', error);
      }
    }

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (typeof form.reportValidity === 'function' && !form.reportValidity()) {
        updateMessage('Please complete the required fields.', 'error');
        return;
      }

      const formData = new FormData(form);
      const payload = {
        from_name: formData.get('name') || '',
        reply_to: formData.get('email') || '',
        message: formData.get('message') || '',
        phone: formData.get('phone') || '',
        designation: formData.get('designation') || '',
        subject: formData.get('subject') || '',
      };

      const finish = (text, type) => {
        updateMessage(text, type);
        form.reset();
        if (submitBtn) submitBtn.disabled = false;
        setTimeout(() => {
          updateMessage('', null);
        }, 5200);
      };

      if (submitBtn) submitBtn.disabled = true;
      updateMessage('Sending your message…');

      if (emailJsReady && window.emailjs) {
        window.emailjs
          .send('service_b7eny1w', 'template_8m056ap', payload)
          .then(() => finish('Thank you! Your message has been sent.', 'success'))
          .catch((error) => {
            console.error('EmailJS error:', error);
            finish('Message sent locally. Please reach out via email if you do not receive a reply.', 'error');
          });
      } else {
        finish('Thanks! Your message has been recorded. I will respond shortly.', 'success');
      }
    });
  }

  /* Auto-update footer year */
  const yearEl = doc.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear().toString();
  }
})();
