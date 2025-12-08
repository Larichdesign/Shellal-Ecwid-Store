/* ============================================================
   PART 1 — TABBY ELIGIBILITY CHECK
   ============================================================ */

Ecwid.OnPageLoaded.add(async function(page) {

  // Only check eligibility on the payment method screen
  if (page.type !== "CHECKOUT_PAYMENT_DETAILS") return;

  // Get cart total from Ecwid API
  Ecwid.Cart.get(async function(cart) {
    const amount = cart?.total || 0;

    // Call Cloudflare Worker
    const res = await fetch(
      `https://shellalalnoor.com/eligibility?amount=${amount}&currency=AED`
    );
    const data = await res.json();

    if (!data.eligible) {
      hideTabbyOption();
    }
  });
});

// Hide Tabby method (called only when NOT eligible)
function hideTabbyOption() {
  const interval = setInterval(() => {
    const labels = document.querySelectorAll(".ecwid-PaymentMethods-block div");

    labels.forEach(label => {
      if (label.textContent.includes("Tabby")) {
        label.parentElement.style.display = "none";
        clearInterval(interval);
      }
    });

  }, 300);
}



/* ============================================================
   PART 2 — YOUR EXISTING ICON LOADER (UNCHANGED)
   ============================================================ */

var client_id = "custom-app-123237799-1";
var image_link = "https://iili.io/fuHZzw7.png";

var CheckoutIconLoad = function () {
   var icon =
     "<div class='icon_resizer' style='height:40px; overflow:hidden'>" +
     "<img style='width:auto; height:100%; display:block;' src='" +
     image_link +
     "'></img></div>";

   var selector = "label.ec-radiogroup__item--app_id-" + client_id +
                  " div.ec-radiogroup__info:empty";

   var target = document.querySelector(selector);

   if (target) {
      target.innerHTML = icon;
   }
};

// Execute icon loader
Ecwid.OnAPILoaded.add(function () {
   Ecwid.OnPageLoaded.add(function (page) {
      if (page.type === "CHECKOUT_PAYMENT_DETAILS") {
         CheckoutIconLoad();
      }
   });
});
