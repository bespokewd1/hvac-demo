
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
