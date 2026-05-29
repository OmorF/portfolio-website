/* OMOTION — Video Editing Portfolio Interactive Script */

/** Email address where contact form submissions are delivered */
const CONTACT_RECEIVER_EMAIL = 'omor1750@gmail.com';

document.addEventListener('DOMContentLoaded', () => {
  
  // =========================================================================
  // 1. SCROLL INTERACTIONS (Sticky Nav & Active Links)
  // =========================================================================
  const nav = document.querySelector('nav');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section');

  const handleScroll = () => {
    // Add scrolled class to nav
    if (window.scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Active link highlighting based on scroll position
    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Trigger initial check

  // Close mobile menu when nav links are clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const hamburger = document.querySelector('.hamburger');
      const menu = document.querySelector('.nav-links');
      if (menu.classList.contains('open')) {
        menu.classList.remove('open');
        hamburger.classList.remove('open');
      }
    });
  });


  // =========================================================================
  // 2. MOBILE NAVIGATION HAMBURGER MENU
  // =========================================================================
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-links');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navMenu.classList.toggle('open');
    });
  }


  // =========================================================================
  // 3. DYNAMIC PORTFOLIO FILTERING
  // =========================================================================
  const filterButtons = document.querySelectorAll('.filter-btn');
  const workCards = document.querySelectorAll('.work-card');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      // Toggle active button state
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const filterValue = button.getAttribute('data-filter');

      workCards.forEach(card => {
        const category = card.getAttribute('data-category');
        
        // Dynamic hiding & revealing with smooth fade transitions
        if (filterValue === 'all' || category === filterValue) {
          card.classList.remove('hide');
          // Restart entrance animations if visible
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
            card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
          }, 50);
        } else {
          card.classList.add('hide');
        }
      });
      
      // Trigger scroll check to reveal newly visible cards if using IntersectionObserver
      if (typeof handleScroll === 'function') {
        handleScroll();
      }
    });
  });


  // =========================================================================
  // 4. INTERACTIVE BEFORE/AFTER COLOR GRADING SLIDER (CSS Variable Driven)
  // =========================================================================
  const sliderWrapper = document.querySelector('.grading-slider-wrapper');
  const sliderRawView = document.querySelector('.slider-raw-view');
  const sliderBarHandle = document.querySelector('.slider-bar-handle');

  if (sliderWrapper && sliderRawView && sliderBarHandle) {
    let isDragging = false;

    // Core function to update the slider positioning
    const updateSlider = (clientX) => {
      const rect = sliderWrapper.getBoundingClientRect();
      const posX = clientX - rect.left; // pixel position of pointer relative to container
      
      // Convert to percentage and clamp between 0% and 100%
      let percentage = (posX / rect.width) * 100;
      if (percentage < 0) percentage = 0;
      if (percentage > 100) percentage = 100;

      // Update position via CSS Custom Variable (hardware accelerated clipping)
      sliderWrapper.style.setProperty('--slider-pos', `${percentage}%`);
    };

    // Mouse events
    sliderBarHandle.addEventListener('mousedown', (e) => {
      isDragging = true;
      sliderWrapper.style.cursor = 'ew-resize';
      e.preventDefault();
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
      if (sliderWrapper) sliderWrapper.style.cursor = 'default';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      updateSlider(e.clientX);
    });

    // Touch events for mobile responsiveness
    sliderBarHandle.addEventListener('touchstart', (e) => {
      isDragging = true;
      // Prevent scrolling while dragging slider on mobile
      if (e.cancelable) e.preventDefault();
    }, { passive: false });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      if (e.touches && e.touches[0]) {
        updateSlider(e.touches[0].clientX);
      }
    }, { passive: false });

    // Allow clicking anywhere on the image container to position the slider
    sliderWrapper.addEventListener('click', (e) => {
      // Avoid triggering when clicking the handle button directly
      if (e.target.closest('.slider-bar-button')) return;
      updateSlider(e.clientX);
    });
  }


  // =========================================================================
  // 5. VIDEO LIGHTBOX MODAL
  // =========================================================================

  /** Accept watch, youtu.be, shorts, or embed URLs → embed URL (works for unlisted videos). */
  function getYouTubeEmbedUrl(url) {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace(/^www\./, '');

      if (host === 'youtu.be') {
        const id = parsed.pathname.slice(1).split('/')[0];
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
      }

      if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
        if (parsed.pathname.startsWith('/embed/')) {
          const id = parsed.pathname.split('/embed/')[1].split('/')[0];
          return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
        }
        if (parsed.pathname.startsWith('/shorts/')) {
          const id = parsed.pathname.split('/shorts/')[1].split('/')[0];
          return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
        }
        const id = parsed.searchParams.get('v');
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
      }
    } catch {
      return null;
    }
    return null;
  }

  const lightbox = document.getElementById('video-lightbox');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxVideo = document.getElementById('lightbox-video');
  const lightboxYoutube = document.getElementById('lightbox-youtube');
  
  // Modal detail targets
  const modalTitle = document.getElementById('modal-title');
  const modalClient = document.getElementById('modal-client');
  const modalRole = document.getElementById('modal-role');
  const modalSoftware = document.getElementById('modal-software');
  const modalDesc = document.getElementById('modal-desc');

  if (lightbox && lightboxClose && lightboxVideo) {
    
    // Open Lightbox when card is clicked
    workCards.forEach(card => {
      card.addEventListener('click', () => {
        // Read data attributes from card
        const videoUrl = card.getAttribute('data-video-url');
        const title = card.getAttribute('data-title');
        const client = card.getAttribute('data-client');
        const role = card.getAttribute('data-role');
        const software = card.getAttribute('data-software');
        const desc = card.getAttribute('data-desc');

        // Inject content
        modalTitle.textContent = title || 'Project Video';
        modalClient.textContent = client || 'Personal';
        modalRole.textContent = role || 'Lead Editor';
        modalSoftware.textContent = software || 'Adobe Premiere Pro';
        modalDesc.textContent = desc || 'Cinematic video edit focusing on storytelling and high-quality visuals.';

        const youtubeEmbed = getYouTubeEmbedUrl(videoUrl);

        if (youtubeEmbed && lightboxYoutube) {
          lightboxVideo.pause();
          lightboxVideo.removeAttribute('src');
          lightboxVideo.load();
          lightboxVideo.classList.add('is-hidden');

          const embed = new URL(youtubeEmbed);
          embed.searchParams.set('autoplay', '1');
          embed.searchParams.set('rel', '0');
          embed.searchParams.set('modestbranding', '1');
          if (window.location.protocol.startsWith('http') && window.location.origin) {
            embed.searchParams.set('origin', window.location.origin);
          }
          lightboxYoutube.src = embed.toString();
          lightboxYoutube.classList.add('is-active');
        } else {
          if (lightboxYoutube) {
            lightboxYoutube.src = '';
            lightboxYoutube.classList.remove('is-active');
          }
          lightboxVideo.classList.remove('is-hidden');

          lightboxVideo.src = videoUrl;
          lightboxVideo.load();

          const playPromise = lightboxVideo.play();
          if (playPromise !== undefined) {
            playPromise.catch(error => {
              console.log('Autoplay was prevented. Waiting for user interaction.', error);
            });
          }
        }

        // Open Modal
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden'; // Disable page scrolling
      });
    });

    // Close Lightbox
    const closeLightbox = () => {
      lightbox.classList.remove('open');
      document.body.style.overflow = 'auto'; // Re-enable scroll
      lightboxVideo.pause();
      lightboxVideo.removeAttribute('src');
      lightboxVideo.load();
      lightboxVideo.classList.remove('is-hidden');
      if (lightboxYoutube) {
        lightboxYoutube.src = '';
        lightboxYoutube.classList.remove('is-active');
      }
    };

    lightboxClose.addEventListener('click', closeLightbox);
    
    // Close on overlay background click
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // Close on Escape key press
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) {
        closeLightbox();
      }
    });
  }


  // =========================================================================
  // 6. CONTACT FORM → EMAIL (FormSubmit)
  // =========================================================================
  const contactForm = document.getElementById('portfolio-contact-form');
  const formStatus = document.getElementById('form-status');
  const submitBtn = contactForm?.querySelector('.form-submit-btn');

  const showFormStatus = (message, type) => {
    formStatus.textContent = message;
    formStatus.className = `form-status ${type}`;
    formStatus.style.display = 'block';
    formStatus.style.opacity = '1';
  };

  const fadeOutFormStatus = () => {
    setTimeout(() => {
      formStatus.style.opacity = '0';
      formStatus.style.transition = 'opacity 1s ease';
      setTimeout(() => {
        formStatus.style.display = 'none';
        formStatus.style.opacity = '1';
      }, 1000);
    }, 6000);
  };

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const honey = contactForm.querySelector('[name="_honey"]');
      if (honey?.value) return;

      const name = contactForm.querySelector('#name')?.value.trim();
      const email = contactForm.querySelector('#email')?.value.trim();
      const projectType = contactForm.querySelector('#project-type')?.value;
      const message = contactForm.querySelector('#message')?.value.trim();

      if (!name || !email || !projectType || !message) {
        showFormStatus('Please fill in all fields before sending.', 'error');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }
      showFormStatus('Sending your message…', 'pending');

      try {
        const response = await fetch(
          `https://formsubmit.co/ajax/${encodeURIComponent(CONTACT_RECEIVER_EMAIL)}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify({
              name,
              email,
              _replyto: email,
              _subject: `OMOtion portfolio inquiry — ${name}`,
              message: [
                `Name: ${name}`,
                `Email: ${email}`,
                `Project type: ${projectType}`,
                '',
                'Message:',
                message,
              ].join('\n'),
            }),
          }
        );

        const result = await response.json();

        const ok = result.success === true || result.success === 'true';
        if (!response.ok || !ok) {
          throw new Error(result.message || 'Unable to send message.');
        }

        showFormStatus('Message sent! I will reply within 24 hours.', 'success');
        contactForm.reset();
        fadeOutFormStatus();
      } catch {
        showFormStatus(
          'Could not send right now. Please email me directly at omor1750@gmail.com.',
          'error'
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send Message';
        }
      }
    });
  }


  // =========================================================================
  // 7. REVEAL ANIMATIONS (Intersection Observer)
  // =========================================================================
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.08
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Trigger once
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach(element => {
    revealObserver.observe(element);
  });

});
