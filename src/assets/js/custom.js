// FAQ

const faqItems = Array.from(document.querySelectorAll(".cs-faq-item"));
for (const item of faqItems) {
  const onClick = () => {
    item.classList.toggle("active");
  };
  item.addEventListener("click", onClick);
}

document.addEventListener("DOMContentLoaded", function () {
  const allAccordion = document.querySelectorAll(".cs-accordion");
  const windowMatcher = window.matchMedia("(max-width: 48rem)");

  if (allAccordion.length === 0 || !windowMatcher.matches) return; // return if there is no accordion parent

  document.querySelectorAll("button[data-trigger]").forEach((button) => {
    button.addEventListener("click", function () {
      // Toggle the 'accordion-show' class on the parent .cs-accordion
      const accordion = this.closest(".cs-accordion");
      accordion.classList.toggle("accordion-show");
    });
  });
});

// Coupon functionality - wrapped in DOMContentLoaded to ensure elements exist
document.addEventListener("DOMContentLoaded", function () {
  // Performance optimization: Cache the coupon container
  const couponContainer = document.getElementById("coupons");
  if (!couponContainer) return; // Exit if no coupon section exists

  // Use event delegation instead of multiple event listeners
  couponContainer.addEventListener("click", function (e) {
    const target = e.target;

    // Handle print button clicks
    if (target.classList.contains("print-btn")) {
      e.preventDefault();
      handlePrint(target.closest(".coupon"));
    }

    // Handle save button clicks
    if (target.classList.contains("save-btn")) {
      e.preventDefault();
      handleSave(target.closest(".coupon"));
    }
  });
});

// Separate functions for better organization and reusability
function handlePrint(coupon) {
  if (!coupon) return;

  // Remove any existing print classes
  const printingCoupons = document.querySelectorAll(".printing-coupon");
  printingCoupons.forEach((c) => c.classList.remove("printing-coupon"));

  // Add print class to current coupon
  coupon.classList.add("printing-coupon");
  console.log("Printing class added:", coupon); // ADD THIS LINE

  // Small delay to ensure styles are applied
  setTimeout(() => {
    window.print();

    // Cleanup after print dialog closes
    requestAnimationFrame(() => {
      coupon.classList.remove("printing-coupon");
      console.log("Printing class removed:", coupon); // ADD THIS LINE
    });
  }, 100);
}

function handleSave(coupon) {
  if (!coupon) return;

  // Show loading state
  coupon.style.opacity = "0.7";

  // --- NEW: Hide the buttons using visibility: hidden instead of display: none ---
  const buttons = coupon.querySelector(".buttons");
  if (buttons) {
    buttons.style.visibility = "hidden"; // Use visibility: hidden
  }

  // Create a filename based on the coupon title and date
  const couponTitle = coupon.querySelector(".coupon-header").textContent;
  const filename = `${couponTitle.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.png`;

  // Try to use modern file system API first (for supported browsers)
  if ("showSaveFilePicker" in window) {
    html2canvas(coupon, {
      scale: 2,
      logging: false,
      useCORS: true,
      backgroundColor: "#ffffff",
    }).then(async (canvas) => {
      // --- NEW: Restore button visibility after capture (even on error) ---
      if (buttons) {
        buttons.style.visibility = ""; // Revert to original visibility (likely 'visible' or 'inherit')
      }
      coupon.style.opacity = ""; // Remove loading state

      try {
        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png"),
        );

        const opts = {
          suggestedName: filename,
          types: [
            {
              description: "PNG file",
              accept: { "image/png": [".png"] },
            },
          ],
        };

        const handle = await window.showSaveFilePicker(opts);
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
      } catch (err) {
        // Fallback to traditional download if user cancels or API fails
        fallbackSave(canvas, filename);
      }
    });
  } else {
    // Fallback for browsers that don't support File System API
    html2canvas(coupon, {
      scale: 2,
      logging: false,
      useCORS: true,
      backgroundColor: "#ffffff",
    }).then((canvas) => {
      // --- NEW: Restore button visibility after capture (even on error) ---
      if (buttons) {
        buttons.style.visibility = ""; // Revert to original visibility
      }
      coupon.style.opacity = ""; // Remove loading state
      fallbackSave(canvas, filename);
    });
  }
}

// Fallback save function using traditional download
function fallbackSave(canvas, filename) {
  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, "image/png");
}

// Optional: Add lazy loading for QR codes
function lazyLoadQRCodes() {
  const qrCodes = document.querySelectorAll(".qr-code img[data-src]");

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          observer.unobserve(img);
        }
      });
    });

    qrCodes.forEach((qr) => observer.observe(qr));
  } else {
    // Fallback for older browsers
    qrCodes.forEach((qr) => (qr.src = qr.dataset.src));
  }
}

// Initialize QR code lazy loading
document.addEventListener("DOMContentLoaded", lazyLoadQRCodes);

// ------------- Dialog Modal by Query STring -------------//
/**
 * @file custom.js
 * Handles custom JavaScript functionalities for the website, including coupon modal display.
 */

/**
 * Function to extract a query parameter value from the URL.
 * @param {string} paramName - The name of the query parameter to extract.
 * @returns {string|null} The value of the query parameter or null if not found.
 */
function getQueryParam(paramName) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(paramName);
}

/**
 * Function to remove a query parameter from the URL without reloading the page.
 * @param {string} paramName - The name of the query parameter to remove.
 */
function removeQueryParam(paramName) {
  const urlParams = new URLSearchParams(window.location.search);
  urlParams.delete(paramName);
  const newUrl =
    window.location.pathname +
    (urlParams.toString() ? "?" + urlParams.toString() : "");
  window.history.replaceState({}, document.title, newUrl);
}

/**
 * Function to initialize and control the coupon modal.
 */
async function initCouponModal() {
  const couponModal = document.getElementById("couponModal");
  const closeModalButton = document.querySelector(".coupon-modal-close-button");
  const modalContentElement = document.getElementById("coupons");

  if (!couponModal || !closeModalButton || !modalContentElement) {
    console.error("Coupon modal elements not found.");
    return; // Exit if modal elements are not found
  }

  const couponQuery = getQueryParam("coupon");

  if (couponQuery) {
    try {
      const response = await fetch("../../_data/coupons.json"); // Adjust path to coupons.json if necessary
      console.log(response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const couponsData = await response.json();
      const decodedCouponQuery = decodeURIComponent(couponQuery).toLowerCase();

      const matchedCoupon = couponsData.find(
        (coupon) => coupon.title.toLowerCase() === decodedCouponQuery,
      );

      if (matchedCoupon) {
        renderCouponInModal(matchedCoupon, modalContentElement);
        couponModal.style.display = "grid";
      } else {
        console.warn(`No coupon found matching query: ${couponQuery}`);
        // Optionally display a "coupon not found" message in the modal.
        modalContentElement.textContent = "Coupon not found.";
        couponModal.style.display = "grid"; // Still show modal to display message
      }
    } catch (error) {
      console.error("Could not fetch coupons:", error);
      modalContentElement.textContent = "Failed to load coupon."; // Display error message in modal
      couponModal.style.display = "grid"; // Still show modal to display error
    }
  }

  closeModalButton.onclick = function () {
    couponModal.style.display = "none";
    removeQueryParam("coupon");
  };

  window.onclick = function (event) {
    if (event.target == couponModal) {
      couponModal.style.display = "none";
      removeQueryParam("coupon");
    }
  };
}

/**
 * Function to render a single coupon's HTML inside a given element.
 * This mimics the structure of the Nunjucks macro `renderCoupons` for a single coupon.
 * @param {object} coupon - The coupon data object.
 * @param {HTMLElement} containerElement - The HTML element where the coupon should be rendered.
 */
function renderCouponInModal(coupon, containerElement) {
  const couponHTML = `
        <div class="coupon" >
            <div class="coupon-header">${coupon.title}</div>
            <div class="coupon-body">
                <p><strong>${coupon.discount}</strong></p>
                <p>Expires on ${coupon.expiryDate}</p>
                <p>${coupon.description}</p>
            </div>
            <div class="coupon-footer">
                <div class="qr-code">
                    <img
                        loading="lazy"
                        decoding="async"
                        src="${coupon.qrCodeSrc}"
                        alt="QR Code for ${coupon.title}"
                        width="120"
                        height="120"
                    />
                </div>
                <div class="buttons">
                    <button class="btn save-btn">Save to Device</button>
                    <button class="btn print-btn">Print Coupon</button>
                </div>
            </div>
        </div>
    `;
  containerElement.innerHTML = couponHTML;
}

// Initialize coupon modal functionality on page load
document.addEventListener("DOMContentLoaded", initCouponModal);
