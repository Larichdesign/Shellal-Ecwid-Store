var client_id = "custom-app-123237799-1";
var image_link = "https://iili.io/fAXNFcu.png";

/* -----------------------------
   Add Tabby icon
------------------------------ */
function CheckoutIconLoad() {
  var container = document.querySelector(
    ".ec-radiogroup__item--app_id-" + client_id +
    " .ec-radiogroup__info"
  );

  if (!container || container.childNodes.length > 0) return;

  var icon =
    "<div style='height:40px; overflow:hidden'>" +
    "<img style='height:100%; display:block' src='" +
    image_link +
    "' />" +
    "</div>";

  container.innerHTML = icon;
}

/* -----------------------------
   Force-hide Tabby if country ≠ AE
------------------------------ */
function forceHideTabbyIfNotAE() {
  var country =
    Ecwid.Cart?.profile?.shippingAddress?.countryCode ||
    Ecwid.Cart?.profile?.billingAddress?.countryCode ||
    null;

  if (!country || country === "AE") return;

  var attempts = 0;
  var maxAttempts = 30;

  var interval = setInterval(function () {
    var tabbyNodes = document.querySelector("label.ec-radiogroup__item--app_id-"+client_id+" div.ec-radiogroup__info:empty")

    if (tabbyNodes.length > 0) {
      tabbyNodes.forEach(function (node) {
        node.style.display = "none";
      });
    }

    attempts++;
    if (attempts >= maxAttempts) {
      clearInterval(interval);
    }
  }, 300);
}

/* -----------------------------
   Ecwid lifecycle hooks
------------------------------ */
Ecwid.OnAPILoaded.add(function () {
  Ecwid.OnPageLoaded.add(function (page) {
    if (page.type === "CHECKOUT_PAYMENT_DETAILS") {
      CheckoutIconLoad();
      forceHideTabbyIfNotAE();
    }
  });

  Ecwid.OnCartChanged.add(function () {
    forceHideTabbyIfNotAE();
  });
});

