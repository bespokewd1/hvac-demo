document.addEventListener("DOMContentLoaded", () => {
  const observer = new MutationObserver((mutationsList, observer) => {
    const adminEl = document.getElementById("nc-root");

    if (adminEl) {
      const img = adminEl.querySelector("img");
      const decapLogo = adminEl.querySelector("span.exus10f2");

      if (img && decapLogo) {
        // Check if both elements are now found
        img.setAttribute("src", "/assets/images/bespokeog.png");
        decapLogo.setAttribute("style", "display:none");
        observer.disconnect(); // Stop observing once changes are made
      }
    }
  });

  const ncRootElement = document.getElementById("nc-root");
  if (ncRootElement) {
    observer.observe(ncRootElement, { childList: true, subtree: true }); // Observe child elements and their descendants
  } else {
    console.log("nc-root element not found initially!"); // Optional log
  }
});
