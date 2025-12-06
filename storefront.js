var client_id = "custom-app-123237799-1";
var image_link = "https://iili.io/fT8bjLv.png";

// ================================
// 1) Add custom image to payment method
// ================================
var CheckoutIconLoad = function () {
   var icon = "<div class='icon_resizer' style='height:22px; overflow:hidden'> <img style='width:auto; height:100%; display:block;' src='" + image_link + "'></img> </div>";
   var labelTarget = document.querySelector("label.ec-radiogroup__item--app_id-" + client_id + " div.ec-radiogroup__info:empty");
   if (labelTarget) {
      labelTarget.innerHTML = icon;
   }
};

// ================================
// 2) Hide Stripe Terms Text
// ================================
var HideStripeTerms = function () {
   var interval = setInterval(function () {
      var termsEl = document.querySelector('.de7zKgf4__p-Root');

      if (termsEl) {
         termsEl.style.display = "none";

         var wrapper = termsEl.closest('.p-Grid');
         if (wrapper) wrapper.style.display = "none";

         clearInterval(interval);
      }
   }, 200);
};

// ================================
// 3) Ecwid event listener
// ================================
Ecwid.OnAPILoaded.add(function () {
   Ecwid.OnPageLoaded.add(function (page) {
      if (page.type === "CHECKOUT_PAYMENT_DETAILS") {
         CheckoutIconLoad();
         HideStripeTerms();
      }
   });
});




