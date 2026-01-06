var client_id = "custom-app-123237799-1";
var image_link = "https://iili.io/fAXNFcu.png";

/* -----------------------------
   Add Tabby icon
------------------------------ */
function CheckoutIconLoad() {
  var selector =
    "label.ec-radiogroup__item--app_id-" +
    client_id +
    " div.ec-radiogroup__info:empty";

  var container = document.querySelector(selector);
  if (!container) return;

  var icon =
    "<div class='icon_resizer' style='height:40px; overflow:hidden'>" +
    "<img style='width:auto; height:100%; display:block;' src='" +
    image_link +
    "' />" +
    "</div>";

  container.innerHTML = icon;
}

/* -----------------------------
   Hide Tabby if country ≠ AE
------------------------------ */
function hideTabbyIfNotAE() {
  var country =
    Ecwid.Cart?.profile?.shippingAddress?.countryCode ||
    Ecwid.Cart?.profile?.billingAddress?.countryCode ||
    null;

  if (!country || country === "AE") return;

  var interval = setInterval(function () {
    var method = document.querySelector(
      "label.ec-radiogroup__item--app_id-" + client_id
    );

    if (method) {
      method.style.display = "none";
      clearInterval(interval);
    }
  }, 200);
}

/* -----------------------------
   Ecwid hooks
------------------------------ */
Ecwid.OnAPILoaded.add(function () {
  Ecwid.OnPageLoaded.add(function (page) {
    if (page.type === "CHECKOUT_PAYMENT_DETAILS") {
      CheckoutIconLoad();
      hideTabbyIfNotAE();
    }
  });
});
