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

var TABBY_APP_ID = "custom-app-123237799-1";

function hideTabby() {
  var el = document.querySelector(
    ".ec-radiogroup__item--app_id-" + TABBY_APP_ID
  );
  if (el) el.style.display = "none";
}

function showTabby() {
  var el = document.querySelector(
    ".ec-radiogroup__item--app_id-" + TABBY_APP_ID
  );
  if (el) el.style.display = "";
}
function evaluateCountry(countryCode) {
  if (countryCode !== "AE") {
    hideTabby();
  } else {
    showTabby();
  }
}
Ecwid.OnAPILoaded.add(function () {
  Ecwid.OnPageLoaded.add(function (page) {

    // Shipping address page
    if (page.type === "CHECKOUT_SHIPPING_ADDRESS") {
      setTimeout(bindCountryListener, 500);
    }

    // Payment page (re-evaluate on load)
    if (page.type === "CHECKOUT_PAYMENT_DETAILS") {
      Ecwid.getCustomerCountry(function (country) {
        evaluateCountry(country);
      });
    }
  });
});
function bindCountryListener() {
  var countrySelect = document.querySelector("select.ec-country");

  if (!countrySelect) return;

  // Initial state
  evaluateCountry(countrySelect.value);

  // On change
  countrySelect.addEventListener("change", function () {
    evaluateCountry(this.value);
  });
}


