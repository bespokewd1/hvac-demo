
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
(function initServiceAreasMap() {
  const root = document.querySelector('#service-areas .sa-map');
  if (!root) return;

  const overlay = root.querySelector('.sa-map-overlay');
  if (!overlay) return;

  // Replace this with your actual Google Maps embed src
  // Tip: In Google Maps, click Share > Embed a map > copy the iframe src.
  const MAP_SRC =
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!...'; // TODO: paste real embed URL

  const loadMap = () => {
    if (root.querySelector('iframe')) return;
    const iframe = document.createElement('iframe');
    iframe.title = 'Service Areas Map';
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.style.border = '0';
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.src = MAP_SRC;
    root.appendChild(iframe);
    overlay.remove();
  };

  overlay.addEventListener('click', loadMap);
  overlay.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      loadMap();
    }
  });
})();
