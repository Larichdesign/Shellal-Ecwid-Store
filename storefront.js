var client_id = "custom-app-123237799-1"; // your app’s client_id
var image_link = "https://iili.io/fAXNFcu.png"; // must be https

// Add icon to Tabby payment method
function CheckoutIconLoad() {
  var icon =
    "<div class='icon_resizer' style='height:40px; overflow:hidden'>" +
    "<img style='width:auto; height:100%; display:block;' src='" +
    image_link +
    "' />" +
    "</div>";

  var target = document.querySelector(
    "label.ec-radiogroup__item--app_id-" +
      client_id +
      " div.ec-radiogroup__info:empty"
  );

  if (target) {
    target.innerHTML = icon;
  }
}

// Show / hide Tabby based on shipping country
function toggleTabbyByCountry() {
  Ecwid.Cart.get(function (cart) {
    var countryCode = cart.shippingPerson && cart.shippingPerson.countryCode;

    var tabbyEl = document.querySelector(
      ".ec-radiogroup__item--Pay-with-Tabby"
    );

    if (!tabbyEl) return;

    // Show ONLY for UAE
    if (countryCode === "AE") {
      tabbyEl.style.display = "";
    } else {
      tabbyEl.style.display = "none";
    }
  });
}

// Run logic when Ecwid is ready
Ecwid.OnAPILoaded.add(function () {
  Ecwid.OnPageLoaded.add(function (page) {
    if (!page.startsWith("checkout")) return;

    // Add icon only on payment step
    if (page === "checkout_payment_details") {
      CheckoutIconLoad();
    }

    // Always enforce country rule during checkout
    toggleTabbyByCountry();
  });

  // Re-run when checkout updates (country change, step change)
  Ecwid.OnCheckoutChanged.add(function () {
    toggleTabbyByCountry();
  });
});
