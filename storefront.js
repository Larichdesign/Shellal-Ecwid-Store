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
    return parseFloat(text.replace(/[^\d.]/g, "")).toFixed(2);
  }

  function removeTabbyCard() {
    var existing = document.getElementById("tabbyCard");
    if (existing) existing.remove();
  }

  function initTabbyCheckoutCard() {
    removeTabbyCard();

    // Find Tabby payment method label using your client_id
    var tabbyLabel = document.querySelector(
      "label.ec-radiogroup__item--app_id-" + client_id
    );

    if (!tabbyLabel) return;

    // Get order total
    var totalEl = document.querySelector(".ec-order-summary-total__value");
    if (!totalEl) return;

    var price = cleanPrice(totalEl.innerText);

    // Create container
    var card = document.createElement("div");
    card.id = "tabbyCard";
    card.style.marginTop = "10px";

    // Insert under Tabby payment option
    tabbyLabel.appendChild(card);

    // Init TabbyCard
    new TabbyCard({
      selector: "#tabbyCard",
      currency: "AED",
      price: price,
      lang: "en",
      shouldInheritBg: true,
      publicKey: "pk_test_019a48dc-9449-c3a6-1f94-ac7a81772c7a",
      merchantCode: "SHN"
    });
  }

  // Ecwid lifecycle-safe hook
  Ecwid.OnAPILoaded.add(function () {
    Ecwid.OnPageLoaded.add(function (page) {
      if (page.type === "CHECKOUT_PAYMENT_DETAILS") {
        setTimeout(initTabbyCheckoutCard, 600);
      }
    });
  });

})();
