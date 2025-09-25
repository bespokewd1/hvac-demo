
  function serviceBlazeSlider () {
    const bp = 767;
    const sliderEl = document.querySelector("#services-ducts .cards-slider");
    if (!sliderEl) return;

    let slider = null;
    const getPaginationEl = () =>
      sliderEl.querySelector(".blaze-pagination");

    const cleanPagination = () => {
      const pg = getPaginationEl();
      if (pg) while (pg.firstChild) pg.removeChild(pg.firstChild);
    };

    const init = () => {
      if (slider || sliderEl.dataset.initialized === "true") return;
      cleanPagination(); // prevent duplicate buttons
      slider = new BlazeSlider(sliderEl, {
        all: {
          slidesToShow: 1,
          slideGap: "16px",
          enableAutoplay: true,
          autoplayInterval: 4500,
          stopOnMouseEnter: true,
          transitionDuration: 450,
        },
      });
      sliderEl.removeAttribute("aria-hidden");
      sliderEl.dataset.initialized = "true";
    };

    const destroy = () => {
      if (!slider) return;
      slider.destroy();
      slider = null;
      sliderEl.setAttribute("aria-hidden", "true");
      sliderEl.dataset.initialized = "false";
      cleanPagination(); // also clear on destroy to avoid stale buttons
    };

    const mq = window.matchMedia(`(max-width:${bp}px)`);
    const handler = (e) => (e.matches ? init() : destroy());
    handler(mq);
    mq.addEventListener
      ? mq.addEventListener("change", handler)
      : mq.addListener(handler);
  }

  serviceBlazeSlider();


// Before/After slider init
function initBeforeAfterGallery() {
  const root = document.querySelector("#bsp-gallery");
  if (!root) return;

  const cards = root.querySelectorAll(".ba-card");
  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  cards.forEach((card) => {
    const range = card.querySelector(".ba-range");
    const after = card.querySelector(".ba-after");
    const divider = card.querySelector(".ba-divider");
    if (!range || !after || !divider) return;

    const setPosition = (value) => {
      const pct = Math.max(0, Math.min(100, Number(value)));
      const rightInset = 100 - pct;
      after.style.clipPath = `inset(0 ${rightInset}% 0 0)`;
      divider.style.left = `${pct}%`;
    };

    // Initial position
    setPosition(range.value || 50);

    // Input handling
    range.addEventListener("input", (e) => {
      setPosition(e.target.value);
    });

    // Keyboard fine control
    range.addEventListener("keydown", (e) => {
      const step = e.shiftKey ? 10 : 1;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
        e.preventDefault();
        range.value = Math.max(0, range.value - step);
        range.dispatchEvent(new Event("input", { bubbles: true }));
      } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
        e.preventDefault();
        range.value = Math.min(100, Number(range.value) + step);
        range.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });

    // Reduce animation jitter if user prefers reduced motion
    if (prefersReduced) {
      after.style.transition = "none";
      divider.style.transition = "none";
    }
  });
}

// Defer until DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBeforeAfterGallery);
} else {
  initBeforeAfterGallery();
}


// Lazy load Google Map on user interaction (performance/privacy friendly)
function initInteractiveServiceMap() {
    const root = document.querySelector('#service-areas');
    if (!root) return;

    const items = root.querySelectorAll('.sa-item[data-map-src]');
    const mapContainer = root.querySelector('.sa-map');

    if (!items.length || !mapContainer) {
        console.warn('Service areas map components not found.');
        return;
    }

    // Function to create and inject the iframe
    const loadMap = (src) => {
        if (!src) return;
        mapContainer.innerHTML = ''; // Clear container
        const iframe = document.createElement('iframe');
        iframe.title = 'Service Areas Map';
        iframe.loading = 'lazy';
        iframe.referrerPolicy = 'no-referrer-when-downgrade';
        iframe.style.cssText = 'border:0; width:100%; height:100%;';
        iframe.src = src;
        mapContainer.appendChild(iframe);
    };

    // Function to create the "click to load" overlay
    const createOverlay = () => {
        const overlayButton = document.createElement('button');
        overlayButton.className = 'sa-map-overlay';
        overlayButton.type = 'button';
        overlayButton.setAttribute('aria-label', 'Load map');
        overlayButton.innerHTML = `
            <div class="overlay-content">
                <span class="pin" aria-hidden="true">📍</span>
                <span class="overlay-title">View Our Locations on the Map</span>
                <span class="overlay-hint">Click to load Google Maps</span>
            </div>
        `;

        const handleOverlayClick = () => {
            const activeItem = root.querySelector('.sa-item.active[data-map-src]');
            if (activeItem) {
                loadMap(activeItem.dataset.mapSrc);
            }
        };

        overlayButton.addEventListener('click', handleOverlayClick);
        overlayButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleOverlayClick();
            }
        });

        mapContainer.appendChild(overlayButton);
    };

    // Add click listeners to each location card
    items.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            if (item.classList.contains('active')) return;

            items.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const newMapSrc = item.dataset.mapSrc;
            const existingIframe = mapContainer.querySelector('iframe');

            // If map is already loaded, update its source
            if (existingIframe) {
                existingIframe.src = newMapSrc;
            }
        });
    });

    // Initial setup
    const firstItem = items[0];
    if (firstItem) {
        firstItem.classList.add('active');
    }
    createOverlay(); // Create the initial overlay
}

// Run the function when the DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initInteractiveServiceMap);
} else {
    initInteractiveServiceMap();
}
