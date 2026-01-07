var client_id = "custom-app-123237799-1"  //  your app’s client_id
var image_link = "https://iili.io/fAXNFcu.png"  //  your image URL (must be https)

// function that adds an image
var CheckoutIconLoad = function () {
   var icon = "<div class='icon_resizer' style='height:40px; overflow:hidden'> <img style='width:auto; height:100%; display:block;' src='"+image_link+"'></img> </div>";
   document.querySelector("label.ec-radiogroup__item--app_id-"+client_id+" div.ec-radiogroup__info:empty").innerHTML = icon;
}

// call function on the page load
Ecwid.OnAPILoaded.add(function () {
   Ecwid.OnPageLoaded.add(function (page) {
      if (page.type == "CHECKOUT_PAYMENT_DETAILS") {
         CheckoutIconLoad();
      }
   });
});


Ecwid.OnPageLoaded.add(function (page) {
  if (!page.startsWith("checkout")) return;

  function toggleTabbyByCountry() {
    Ecwid.Cart.get(function (cart) {
      const countryCode = cart.shippingPerson?.countryCode;

      const tabbyEl = document.querySelector(
        ".ec-radiogroup__item--Pay-with-Tabby"
      );

      if (!tabbyEl) return;

      // Show Tabby ONLY for UAE
      if (countryCode === "AE") {
        tabbyEl.style.display = "";
      } else {
        tabbyEl.style.display = "none";
      }
    });
  }

  // Initial check
  toggleTabbyByCountry();

  // Re-check when checkout updates (country change, step change)
  Ecwid.OnCheckoutChanged.add(toggleTabbyByCountry);
});




