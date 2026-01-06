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


(function () {

  function cleanPrice(text) {
    return Number(text.replace(/[^0-9.]/g, ""));
  }

  function injectTabbyPromo() {
    // Prevent duplicates
    if (document.getElementById("tabbyPromo")) return;

    var priceEl = document.querySelector(
      ".details-product-price__value.ec-price-item"
    );
    if (!priceEl) return;

    var price = cleanPrice(priceEl.innerText);
    if (!price || price <= 0) return;

    var promo = document.createElement("div");
    promo.id = "tabbyPromo";
    promo.style.marginTop = "8px";

    priceEl.parentNode.appendChild(promo);

    new TabbyPromo({
      selector: "#tabbyPromo",
      currency: "AED",
      price: price,
      lang: "en",
      source: "product",
      publicKey: "pk_test_019a48dc-9449-c3a6-1f94-ac7a81772c7a",
      merchantCode: "SHN"
    });
  }

  Ecwid.OnAPILoaded.add(function () {
    Ecwid.OnPageLoaded.add(function (page) {
      if (page.type === "PRODUCT") {
        setTimeout(injectTabbyPromo, 500);
      }
    });
  });

})();
