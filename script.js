
  const firebaseConfig = {
    apiKey: "AIzaSyD_CSAnVTFZfzhEpTlzvtJraX0uvRmhTDo",
    authDomain: "set-geomatics.firebaseapp.com",
    projectId: "set-geomatics",
    storageBucket: "set-geomatics.firebasestorage.app",
    messagingSenderId: "234939834748",
    appId: "1:234939834748:web:434136c227a920e6f084f9",
    measurementId: "G-J2JW3B7HMD"
  };



// Initialize Firebase (using compat SDK loaded via CDN in HTML)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ============================================================
// UTILITY: TOAST NOTIFICATION
// ============================================================
/**
 * Show a toast notification.
 * @param {string} message  - Text to display
 * @param {'success'|'error'} type - Visual style
 * @param {number} duration - Auto-hide after ms (default 3500)
 */
function showToast(message, type = 'success', duration = 3500) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast toast-${type} show`;
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// ============================================================
// UTILITY: SET BUTTON LOADING STATE
// ============================================================
function setButtonLoading(btn, loading) {
  if (loading) {
    btn.disabled = true;
    btn.classList.add('loading');
  } else {
    btn.disabled = false;
    btn.classList.remove('loading');
  }
}

// ============================================================
// UTILITY: CLEAR FIELD ERRORS
// ============================================================
function clearErrors(fields) {
  fields.forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = ''; el.classList.remove('error'); }
  });
}

// ============================================================
// UTILITY: SHOW FIELD ERROR
// ============================================================
function showFieldError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const err   = document.getElementById(errorId);
  if (input) input.classList.add('error');
  if (err)   err.textContent = message;
}

// ============================================================
// NAVBAR: SCROLL BEHAVIOR
// ============================================================
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

// ============================================================
// NAVBAR: HAMBURGER MOBILE MENU
// ============================================================
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close mobile menu when a nav link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    link.blur();
 

  });
});

// ============================================================
// SCROLL-REVEAL ANIMATIONS
// ============================================================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger child elements if .reveal-group
      entry.target.querySelectorAll('.reveal').forEach((el, idx) => {
        setTimeout(() => el.classList.add('visible'), idx * 100);
      });
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

// Add reveal class to elements we want animated
document.querySelectorAll(
  '.about-grid, .service-card, .stat-card, .request-wrap'
).forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// ============================================================
// FOOTER: SET CURRENT YEAR
// ============================================================
document.getElementById('year').textContent = new Date().getFullYear();

// ============================================================
// CLIENT PORTAL: MODAL OPEN / CLOSE
// ============================================================
const portalModal    = document.getElementById('portalModal');
const portalNavBtn   = document.getElementById('portalNavBtn');
const footerPortalBtn = document.getElementById('footerPortalBtn');
const modalClose     = document.getElementById('modalClose');

// Replace your openPortal function with this:
function openPortal() {
  // 1. Immediately close the mobile menu state
  navLinks.classList.remove('open');
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
  
  // 2. Open the modal
  portalModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  
  // 3. Clear the focus/hover from the button
  portalNavBtn.blur(); 
  
  setTimeout(() => {
    document.getElementById('planNumber').focus();
  }, 350);
}

// Ensure ALL links (including portal) handle the body overflow correctly
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    // Only restore scroll if the portal modal ISN'T about to open
    if (!link.classList.contains('nav-portal-btn')) {
      document.body.style.overflow = '';
    }
  });
});


function closePortal() {
  portalModal.classList.remove('open');
  document.body.style.overflow = '';
  // Reset form & result
  document.getElementById('portalForm').reset();
  const result = document.getElementById('portalResult');
  result.className = 'portal-result';
  result.textContent = '';
  clearErrors(['planNumber', 'planYear']);
}

portalNavBtn.addEventListener('click', (e) => { e.preventDefault(); openPortal(); });
footerPortalBtn.addEventListener('click', openPortal);
modalClose.addEventListener('click', closePortal);

// Close modal when clicking the backdrop
portalModal.addEventListener('click', (e) => {
  if (e.target === portalModal) closePortal();
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && portalModal.classList.contains('open')) closePortal();
});

// ============================================================
// CLIENT PORTAL: RETRIEVE DOCUMENT
// ============================================================
const portalForm = document.getElementById('portalForm');
const portalBtn  = document.getElementById('portalBtn');

portalForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const planNumber = document.getElementById('planNumber').value.trim();
  const planYear   = document.getElementById('planYear').value.trim();
  const resultEl   = document.getElementById('portalResult');

  // Reset UI
  clearErrors(['planNumber', 'planYear']);
  resultEl.className = 'portal-result';
  resultEl.textContent = '';

  // Validate inputs
  let hasError = false;
  if (!planNumber) {
    showFieldError('planNumber', 'planError', 'Please enter a Survey Plan Number.');
    hasError = true;
  }
  if (!planYear || planYear < 1990 || planYear > 2099) {
    showFieldError('planYear', 'yearError', 'Please enter a valid year (1990–2099).');
    hasError = true;
  }
  if (hasError) return;

  setButtonLoading(portalBtn, true);

  try {
    // ── Fetch document from Firestore ──────────────────────
    // Collection: dt_documents
    // Document ID: planNumber (the survey plan number)
    const docSnap = await db.collection('dt_documents').doc(planNumber).get();

    if (!docSnap.exists) {
      // Document not found in database
      resultEl.className = 'portal-result error';
      resultEl.textContent = '❌ No document found for the provided Survey Plan Number.';
      return;
    }

    const data = docSnap.data();

    // Verify year matches stored record
    if (String(data.year) !== String(planYear)) {
      resultEl.className = 'portal-result error';
      resultEl.textContent = '❌ The year entered does not match our records. Please check and try again.';
      return;
    }

    // Both checks passed — open Cloudinary URL
    if (data.cloudinaryUrl) {
      resultEl.className = 'portal-result success';
      resultEl.textContent = '✅ Document found! Opening in a new tab…';
      window.open(data.cloudinaryUrl, '_blank', 'noopener,noreferrer');
    } else {
      resultEl.className = 'portal-result error';
      resultEl.textContent = '⚠️ Document record exists but the file URL is missing. Please contact the office.';
    }

  } catch (err) {
    console.error('Portal retrieval error:', err);
    resultEl.className = 'portal-result error';
    resultEl.textContent = '⚠️ A network error occurred. Please check your connection and try again.';
  } finally {
    setButtonLoading(portalBtn, false);
  }
});

// ============================================================
// SERVICE REQUEST FORM: VALIDATION + SUBMISSION
// ============================================================
const requestForm = document.getElementById('requestForm');
const submitBtn   = document.getElementById('submitBtn');

requestForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // Gather values
  const fullName    = document.getElementById('fullName').value.trim();
  const phone       = document.getElementById('phone').value.trim();
  const serviceType = document.getElementById('serviceType').value;
  const location    = document.getElementById('location').value.trim();
  const message     = document.getElementById('message').value.trim();

  // Reset previous errors
  clearErrors(['fullName', 'phone', 'serviceType', 'location']);
  ['fullName', 'phone', 'serviceType', 'location', 'message'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('error');
  });

  // Validation
  let valid = true;

  if (!fullName || fullName.length < 2) {
    showFieldError('fullName', 'nameError', 'Please enter your full name (at least 2 characters).');
    valid = false;
  }

  // Basic Nigerian phone number validation (starts with 0 or +234, 10-14 digits)
  const phoneClean = phone.replace(/[\s\-()]/g, '');
  if (!phone || !/^(\+?234|0)\d{9,10}$/.test(phoneClean)) {
    showFieldError('phone', 'phoneError', 'Please enter a valid Nigerian phone number.');
    valid = false;
  }

  if (!serviceType) {
    showFieldError('serviceType', 'serviceError', 'Please select a service type.');
    valid = false;
  }

  if (!location || location.length < 3) {
    showFieldError('location', 'locationError', 'Please enter a valid location.');
    valid = false;
  }

  if (!valid) return;

  setButtonLoading(submitBtn, true);

  try {
    // ── Save to Firestore ─────────────────────────────────
    // Collection: service_requests
    await db.collection('service_requests').add({
      fullName,
      phone,
      serviceType,
      location,
      message: message || '',
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    // Success feedback
    requestForm.reset();
    showToast('✅ Request submitted! We will contact you within 24 hours.', 'success', 5000);

  } catch (err) {
    console.error('Form submission error:', err);
    showToast('⚠️ Submission failed. Please check your connection and try again.', 'error', 5000);
  } finally {
    setButtonLoading(submitBtn, false);
  }
});

// ============================================================
// SMOOTH ANCHOR SCROLL (fallback for browsers without CSS support)
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = navbar.offsetHeight + 16;
      const top    = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// Add this inside your nav link click listener
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    // Existing logic to close menu...
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    
    // THE FIX: Remove focus so the button doesn't stay "stuck" white
    link.blur(); 
    
    document.body.style.overflow = '';
  });
});

