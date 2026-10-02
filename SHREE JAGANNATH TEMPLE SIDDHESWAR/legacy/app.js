/* ==========================================================================
   SHREE JAGANNATH TEMPLE, SIDDHESWAR - WEBSITE JAVASCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Animate On Scroll (AOS)
  AOS.init({
    duration: 1000,
    once: true,
    offset: 120,
    easing: 'ease-out'
  });

  // Sticky Header Scroll Event
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    highlightNavLink();
  });

  // Mobile Navigation Menu Toggle
  const mobileNavToggle = document.getElementById('mobileNavToggle');
  const navMenu = document.getElementById('navMenu');
  
  if (mobileNavToggle && navMenu) {
    mobileNavToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = mobileNavToggle.querySelector('i');
      if (navMenu.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
      } else {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    });
  }

  // Close mobile nav menu when a link is clicked
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        const icon = mobileNavToggle.querySelector('i');
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
      }
    });
  });

  // Active Link Highlighting on Scroll
  const sections = document.querySelectorAll('section');
  function highlightNavLink() {
    let scrollPos = window.scrollY + 150;
    sections.forEach(section => {
      if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${section.getAttribute('id')}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // Initialize Swiper Slider for Festivals
  const swiper = new Swiper('.festivals-slider', {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      dynamicBullets: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    breakpoints: {
      640: {
        slidesPerView: 1.5,
        spaceBetween: 20,
      },
      768: {
        slidesPerView: 2,
        spaceBetween: 30,
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 30,
      },
    }
  });

  // Floating Diya Particles (HTML5 Canvas Engine)
  initCanvasParticles();

  // Load Saved Language Setting
  const savedLang = localStorage.getItem('temple-lang') || 'en';
  setLanguage(savedLang);

  // Initialize Leaflet Map
  initLeafletMap();

  // Interactive Card Lighting Effect (Card Glow mouse positioning)
  const cards = document.querySelectorAll('.timing-card');
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
});

/* ==========================================================================
   BILINGUAL TRANSLATION SYSTEM
   ========================================================================== */
function toggleLanguage() {
  const currentLang = document.body.classList.contains('lang-en') ? 'en' : 'or';
  const newLang = currentLang === 'en' ? 'or' : 'en';
  setLanguage(newLang);
}

function setLanguage(lang) {
  const body = document.body;
  const btnTextEn = document.querySelector('#langToggleBtn .lang-en');
  const btnTextOr = document.querySelector('#langToggleBtn .lang-or');

  // Fade transitions
  body.style.opacity = 0;
  
  setTimeout(() => {
    body.classList.remove('lang-en', 'lang-or');
    body.classList.add(`lang-${lang}`);
    localStorage.setItem('temple-lang', lang);

    // Dynamic map overlay language text updates, etc.
    const mapOverlay = document.querySelector('.map-overlay-card');
    if (mapOverlay) {
      if (lang === 'or') {
        mapOverlay.classList.add('lang-or-view');
      } else {
        mapOverlay.classList.remove('lang-or-view');
      }
    }

    body.style.opacity = 1;
  }, 200);
}

/* ==========================================================================
   DAILY / SPECIAL SCHEDULER TABS
   ========================================================================== */
function switchTab(tabId) {
  // Hide all tab contents
  const contents = document.querySelectorAll('.tab-content');
  contents.forEach(content => {
    content.style.display = 'none';
    content.classList.remove('active');
  });

  // Deactivate all tab buttons
  const buttons = document.querySelectorAll('.tab-btn');
  buttons.forEach(btn => btn.classList.remove('active'));

  // Show selected content and activate matching button
  const selectedContent = document.getElementById(tabId);
  if (selectedContent) {
    selectedContent.style.display = 'block';
    setTimeout(() => selectedContent.classList.add('active'), 50);
  }

  // Set active class to clicked button
  if (tabId === 'daily-schedule') {
    document.getElementById('btn-daily').classList.add('active');
  } else if (tabId === 'special-schedule') {
    document.getElementById('btn-special').classList.add('active');
  }
}

/* ==========================================================================
   FLOATING CANVAS PARTICLES ENGINE
   ========================================================================== */
function initCanvasParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width = (canvas.width = canvas.offsetWidth);
  let height = (canvas.height = canvas.offsetHeight);

  const particles = [];
  const particleCount = 40;

  // Colors mapping saffron/gold tones with opacity
  const colors = [
    'rgba(227, 95, 36, ',  // Saffron
    'rgba(243, 229, 171, ', // Light Gold
    'rgba(212, 175, 55, ',  // Gold
    'rgba(255, 130, 71, '   // Saffron Light
  ];

  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * height; // Start spread out on load
    }

    reset() {
      this.x = Math.random() * width;
      this.y = height + 10;
      this.size = Math.random() * 4 + 1;
      this.speedY = -(Math.random() * 0.8 + 0.2); // Slow upward float
      this.speedX = Math.random() * 0.4 - 0.2; // Gentle drift
      this.alpha = Math.random() * 0.5 + 0.1;
      this.colorBase = colors[Math.floor(Math.random() * colors.length)];
      this.swaySpeed = Math.random() * 0.02 + 0.005;
      this.swayRange = Math.random() * 2 + 0.5;
      this.time = Math.random() * 100;
    }

    update() {
      this.y += this.speedY;
      this.time += this.swaySpeed;
      this.x += this.speedX + Math.sin(this.time) * 0.1 * this.swayRange;
      
      // Gradually fade out as it reaches the top 30% of canvas
      if (this.y < height * 0.3) {
        this.alpha -= 0.005;
      }

      // Reset when particle leaves screen or fades out completely
      if (this.y < -10 || this.alpha <= 0) {
        this.reset();
      }
    }

    draw() {
      ctx.beginPath();
      // Glowing aura circle
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 2);
      gradient.addColorStop(0, `${this.colorBase}${this.alpha})`);
      gradient.addColorStop(0.5, `${this.colorBase}${this.alpha * 0.4})`);
      gradient.addColorStop(1, `${this.colorBase}0)`);
      ctx.fillStyle = gradient;
      ctx.arc(this.x, this.y, this.size * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Populate particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function resizeCanvas() {
    const parent = canvas.parentElement;
    width = canvas.width = parent.offsetWidth;
    height = canvas.height = parent.offsetHeight;
  }

  window.addEventListener('resize', resizeCanvas);

  function animate() {
    ctx.clearRect(0, 0, width, height);
    
    // Draw and update each particle
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
}

/* ==========================================================================
   PORTABLE LIGHTBOX ENGINE
   ========================================================================== */
const lightboxImages = [
  {
    src: 'assets/deity_darshan.png',
    captionEn: 'The Three Deities - Lord Jagannath, Balabhadra, Devi Subhadra',
    captionOr: 'ତିନି ଠାକୁର - ମହାପ୍ରଭୁ ଶ୍ରୀ ଜଗନ୍ନାଥ, ପ୍ରଭୁ ବଳଭଦ୍ର, ଦେବୀ ସୁଭଦ୍ରା'
  },
  {
    src: 'assets/temple_exterior.png',
    captionEn: 'Siddheswar Temple Spire & Sacred stone architecture',
    captionOr: 'ସିଦ୍ଧେଶ୍ୱର ମନ୍ଦିର ଚୂଡ଼ା ଓ କଳାମୟ ପ୍ରସ୍ତର କାରୁକାର୍ଯ୍ୟ'
  },
  {
    src: 'assets/rath_yatra.png',
    captionEn: 'Rath Yatra Chariot pulling at Digapahandi',
    captionOr: 'ଦିଗପହଣ୍ଡିଠାରେ ଆୟୋଜିତ ରଥଯାତ୍ରା ସମୟରେ ରଥ ଟଣା'
  },
  {
    src: 'assets/hero_jagannath.png',
    captionEn: 'Patita Pavan Lord Jagannath Darshan',
    captionOr: 'ପତିତପାବନ ପ୍ରଭୁ ଶ୍ରୀ ଜଗନ୍ନାଥଙ୍କ ଭାବମୟ ରୂପ'
  },
  {
    src: 'assets/annadan_seva.png',
    captionEn: 'Traditional Abadha Mahaprasad offering',
    captionOr: 'ପାରମ୍ପରିକ ଅବଢ଼ା ମହାପ୍ରସାଦ ସେବନ ଓ ଭୋଗ'
  }
];

let activeLightboxIndex = 0;

function openLightbox(index) {
  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('lightboxImg');
  const caption = document.getElementById('lightboxCaption');
  
  if (!modal || !img || !caption) return;
  
  activeLightboxIndex = index;
  const item = lightboxImages[index];
  
  img.src = item.src;
  
  // Set caption based on current language
  const isOdia = document.body.classList.contains('lang-or');
  caption.textContent = isOdia ? item.captionOr : item.captionEn;
  
  modal.classList.add('show');
  document.body.style.overflow = 'hidden'; // Stop page scroll
}

function closeLightbox() {
  const modal = document.getElementById('lightboxModal');
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = ''; // Resume page scroll
  }
}

function changeLightboxImg(dir) {
  let newIndex = activeLightboxIndex + dir;
  if (newIndex < 0) {
    newIndex = lightboxImages.length - 1;
  } else if (newIndex >= lightboxImages.length) {
    newIndex = 0;
  }
  
  // Fade effect on image change
  const img = document.getElementById('lightboxImg');
  const caption = document.getElementById('lightboxCaption');
  
  if (img && caption) {
    img.style.opacity = 0;
    setTimeout(() => {
      activeLightboxIndex = newIndex;
      const item = lightboxImages[newIndex];
      img.src = item.src;
      const isOdia = document.body.classList.contains('lang-or');
      caption.textContent = isOdia ? item.captionOr : item.captionEn;
      img.style.opacity = 1;
    }, 150);
  }
}

// Close lightbox on clicking backdrop outside image
const lightboxModal = document.getElementById('lightboxModal');
if (lightboxModal) {
  lightboxModal.addEventListener('click', (e) => {
    if (e.target.id === 'lightboxModal') {
      closeLightbox();
    }
  });
}

// Keyboards triggers for lightbox
document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('lightboxModal');
  if (modal && modal.classList.contains('show')) {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') changeLightboxImg(-1);
    if (e.key === 'ArrowRight') changeLightboxImg(1);
  }
});

/* ==========================================================================
   GALLERY FILTER SYSTEM
   ========================================================================== */
function filterGallery(category) {
  // Update active button styling
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  
  const activeButton = document.getElementById(`btn-filter-${category}`);
  if (activeButton) activeButton.classList.add('active');

  // Filter images
  const items = document.querySelectorAll('.gallery-item');
  items.forEach(item => {
    const itemCategory = item.getAttribute('data-category');
    if (category === 'all' || itemCategory === category) {
      item.classList.remove('hide');
      item.style.transform = 'scale(0.8)';
      item.style.opacity = '0';
      setTimeout(() => {
        item.style.transform = 'scale(1)';
        item.style.opacity = '1';
      }, 100);
    } else {
      item.classList.add('hide');
    }
  });
}

/* ==========================================================================
   SEVA PORTAL INTERACTIONS
   ========================================================================== */
let selectedSevaNameEn = 'General Temple Fund';
let selectedSevaNameOr = 'ସାଧାରଣ ମନ୍ଦିର ପାଣ୍ଠି';

function selectSeva(sevaName, defaultAmount) {
  // Update state values based on seva click
  if (sevaName === 'Annadan Seva') {
    selectedSevaNameEn = 'Annadan Seva (Mahaprasad)';
    selectedSevaNameOr = 'ଅନ୍ନଦାନ ସେବା (ମହାପ୍ରସାଦ)';
  } else if (sevaName === 'Pushpalankara Seva') {
    selectedSevaNameEn = 'Pushpalankara & Puja Seva';
    selectedSevaNameOr = 'ପୁଷ୍ପାଳଙ୍କାର ଓ ଦୈନିକ ପୂଜା';
  } else if (sevaName === 'Temple Construction Seva') {
    selectedSevaNameEn = 'Temple Construction & Maintenance';
    selectedSevaNameOr = 'ମନ୍ଦିର ନିର୍ମାଣ ଓ ରକ୍ଷଣାବେକ୍ଷଣ';
  }

  // Update text values in the donation form
  document.getElementById('selectedSevaText').textContent = selectedSevaNameEn;
  document.getElementById('selectedSevaTextOr').textContent = selectedSevaNameOr;
  
  // Set default price inside amount field
  document.getElementById('donationAmount').value = defaultAmount;

  // Clear messages
  const successMsg = document.getElementById('donationSuccessMsg');
  successMsg.style.display = 'none';
  
  // Auto Scroll down to the donation form panel smoothly
  const panel = document.getElementById('donationPanel');
  if (panel) {
    panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function submitDonation() {
  const devoteeName = document.getElementById('devoteeName').value.trim();
  const amount = document.getElementById('donationAmount').value.trim();
  const successMsg = document.getElementById('donationSuccessMsg');

  if (!devoteeName || !amount) {
    alert(document.body.classList.contains('lang-or') 
      ? 'ଦୟାକରି ଆପଣଙ୍କ ନାମ ଏବଂ ଦାନ ରାଶି ପ୍ରବେଶ କରନ୍ତୁ।' 
      : 'Please fill in both Devotee Name and Donation Amount.');
    return;
  }

  // Create a randomized mock transaction receipt ID
  const txnId = 'TXN' + Math.floor(Math.random() * 8999999 + 1000000);
  const dateStr = new Date().toLocaleDateString();

  const isOdia = document.body.classList.contains('lang-or');
  
  if (isOdia) {
    successMsg.innerHTML = `
      <div style="font-family: var(--font-headings); font-weight:600;">
        <i class="fa-solid fa-circle-check"></i> ଦାନ ସୂଚନା ସଫଳତାପୂର୍ବକ ଦାଖଲ ହେଲା!<br>
        <span style="font-size:0.9em; font-weight:400; color:var(--text-light);">
          ଭକ୍ତଙ୍କ ନାମ: <strong>${devoteeName}</strong><br>
          ସେବା କାର୍ଯ୍ୟ: <strong>${selectedSevaNameOr}</strong><br>
          ରାଶି: <strong>₹${amount}</strong><br>
          ରସିଦ କୋଡ୍: <strong>${txnId}</strong> (ତାରିଖ: ${dateStr})<br>
          <em>* ଦୟାକରି ୟୁପିଆଇ ପେମେଣ୍ଟ କରି ଏହି ରସିଦ କୋଡ୍ ମନ୍ଦିର କାଉଣ୍ଟରରେ ଦେଖାନ୍ତୁ।</em>
        </span>
      </div>
    `;
  } else {
    successMsg.innerHTML = `
      <div style="font-family: var(--font-headings); font-weight:600;">
        <i class="fa-solid fa-circle-check"></i> Donation Intent Registered Successfully!<br>
        <span style="font-size:0.9em; font-weight:400; color:var(--text-light);">
          Devotee Name: <strong>${devoteeName}</strong><br>
          Seva Option: <strong>${selectedSevaNameEn}</strong><br>
          Amount: <strong>₹${amount}</strong><br>
          Receipt Code: <strong>${txnId}</strong> (Date: ${dateStr})<br>
          <em>* Please scan the QR code to complete transfer and quote Receipt Code at the Temple Office.</em>
        </span>
      </div>
    `;
  }

  successMsg.style.display = 'block';
  
  // Reset input fields
  document.getElementById('devoteeName').value = '';
}

/* ==========================================================================
   MAP & LOCATION SERVICE (LEAFLET.JS)
   ========================================================================== */
function initLeafletMap() {
  const mapElement = document.getElementById('leaflet-map');
  if (!mapElement) return;

  // Coordinate center representing Digapahandi area (Ganjam District, Odisha)
  // Siddheswar coordinates roughly at Lat: 19.3888, Lng: 84.5901
  const mapCenter = [19.3888, 84.5901];
  
  // Initialize map and disable scroll wheel zoom to avoid annoying scrolls on page glide
  const map = L.map('leaflet-map', {
    scrollWheelZoom: false
  }).setView(mapCenter, 13);

  // Apply dark/warm thematic tile skins using CARTO DB or OpenStreetMap with contrast filters
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20
  }).addTo(map);

  // Custom golden temple pin marker popup
  const isOdia = document.body.classList.contains('lang-or');
  
  const popupHtml = `
    <div style="font-family: var(--font-headings); text-align: center; color: #24150E;">
      <strong style="color: #E35F24; font-size: 1.1em; display: block; margin-bottom:4px;">
        ${isOdia ? 'ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର' : 'Shree Jagannath Temple'}
      </strong>
      <span style="font-size:0.9em;">
        ${isOdia ? '9JMV+VVC, ସିଦ୍ଧେଶ୍ୱର, ଓଡ଼ିଶା ୭୬୧୦୫୪' : '9JMV+VVC, Sidhaswar, Odisha 761054'}
      </span>
      <a href="https://maps.google.com/?q=9JMV%2BVVC,+Sidhaswar,+Odisha+761054" target="_blank" style="display:block; margin-top:8px; background:#E35F24; color:#fff; padding:4px 8px; border-radius:4px; text-decoration:none; font-size:0.8em; font-weight:600;">
        ${isOdia ? 'ମାର୍ଗ ଦର୍ଶାନ୍ତୁ' : 'Get Directions'}
      </a>
    </div>
  `;

  const marker = L.marker(mapCenter).addTo(map);
  marker.bindPopup(popupHtml).openPopup();
}

/* ==========================================================================
   HELPER UTILITIES
   ========================================================================== */
function copyAddress() {
  const isOdia = document.body.classList.contains('lang-or');
  
  const addressText = isOdia 
    ? 'ଶ୍ରୀ ଜଗନ୍ନାଥ ମନ୍ଦିର, 9JMV+VVC, ସିଦ୍ଧେଶ୍ୱର, ଓଡ଼ିଶା - ୭୬୧୦୫୪' 
    : 'Shree Jagannath Temple, 9JMV+VVC, Sidhaswar, Odisha 761054';

  navigator.clipboard.writeText(addressText)
    .then(() => {
      alert(isOdia ? 'ଠିକଣା ସଫଳତାପୂର୍ବକ କପି ହେଲା!' : 'Temple address copied to clipboard!');
    })
    .catch(err => {
      console.error('Failed to copy: ', err);
    });
}
