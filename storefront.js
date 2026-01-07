var client_id = "custom-app-123237799-1";
var image_link = "https://iili.io/fAXNFcu.png";

function addTabbyIcon() {
  var target = document.querySelector(
    "label.ec-radiogroup__item--app_id-" +
      client_id +
      " div.ec-radiogroup__info:empty"
  );

  if (!target) return;

  target.innerHTML =
    "<div style='height:40px;overflow:hidden'>" +
    "<img src='" +
    image_link +
    "' style='height:100%;width:auto;display:block'>" +
    "</div>";
}

function toggleTabbyByCountry() {
  Ecwid.Cart.get(function (cart) {
    var country = cart.shippingPerson && cart.shippingPerson.countryCode;

    var tabby = document.querySelector(
      ".ec-radiogroup__item--Pay-with-Tabby"
    );

    if (!tabby) return;

    tabby.style.display = country === "AE" ? "" : "none";
  });
}

Ecwid.OnAPILoaded.add(function () {
  Ecwid.OnPageLoaded.add(function (page) {
    if (!page.startsWith("checkout")) return;

    if (page === "checkout_payment_details") {
      addTabbyIcon();
    }

    toggleTabbyByCountry();
  });

  Ecwid.OnCheckoutChanged.add(toggleTabbyByCountry);
});
