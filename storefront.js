var client_id = "custom-app-123237799-1";
var image_link = "https://iili.io/fAXNFcu.png";

function addTabbyIcon() {
  var target = document.querySelector(
    "label.ec-radiogroup__item--app_id-" +
      client_id +
      " div.ec-radiogroup__info"
  );

  if (!target || target.children.length) return;

  target.innerHTML =
    "<div style='height:40px;overflow:hidden'>" +
    "<img src='" +
    image_link +
    "' style='height:100%;width:auto;display:block'>" +
    "</div>";
}

function toggleTabbyByCountry() {
  Ecwid.Cart.get(function (cart) {
    if (!cart || !cart.shippingPerson) return;

    var country = cart.shippingPerson.countryCode;

    var tabby = document.querySelector(
      ".ec-radiogroup__item--app_id-" + client_id
    );

    if (!tabby) return;

    tabby.style.display = country === "AE" ? "" : "none";
  });
}

function isCheckoutPage(page) {
  if (typeof page === "string") {
    return page.indexOf("checkout") === 0;
  }

  if (typeof page === "object" && page.type) {
    return page.type.indexOf("CHECKOUT_") === 0;
  }

  return false;
}

Ecwid.OnAPILoaded.add(function () {
  Ecwid.OnPageLoaded.add(function (page) {
    if (!isCheckoutPage(page)) return;

    addTabbyIcon();
    toggleTabbyByCountry();
  });

  if (Ecwid.OnCheckoutChanged && Ecwid.OnCheckoutChanged.add) {
    Ecwid.OnCheckoutChanged.add(toggleTabbyByCountry);
  }
});
