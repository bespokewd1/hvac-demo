document.addEventListener("DOMContentLoaded", function () {

   const scrollers = document.querySelectorAll('.scroller')

   if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      addAnimation()
   }

   function addAnimation() {
      scrollers.forEach((scroller) => {
         scroller.setAttribute("data-animated", true)

         const scrollerInner = scroller.querySelector(".scroller-inner")
         const innerContent = Array.from(scrollerInner.children);

         innerContent.forEach(item => {
            const duplicatedItem = item.cloneNode(true);
            duplicatedItem.setAttribute('aria-hidden', true)
            scrollerInner.appendChild(duplicatedItem)
         })

      })
   }
})

document.addEventListener('DOMContentLoaded', function () {
   // Get all the list items in the auto-scroll gallery
   const scrollerItems = document.querySelectorAll('#autoscroll-gallery .scroller-inner li');

   // Get the scroller-inner element
   const scrollerInner = document.querySelector('#autoscroll-gallery .scroller-inner');

   // Add touch event listeners to each item
   scrollerItems.forEach(item => {
      // Touch start - pause the animation
      item.addEventListener('touchstart', function () {
         scrollerInner.style.animationPlayState = 'paused';
         scrollerInner.style.filter = 'grayscale(0.4)';
      });

      // Touch end - resume the animation
      item.addEventListener('touchend', function () {
         scrollerInner.style.animationPlayState = 'running';
         scrollerInner.style.filter = 'none';
      });
   });
});
