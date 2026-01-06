(function () {

  /* ================================
     CONFIG
  ================================= */
  var client_id = "custom-app-123237799-1"; // your app’s client_id
  var image_link = "https://iili.io/fAXNFcu.png"; // your image URL (https only)

  var TABBY_PUBLIC_KEY = "pk_test_019a48dc-9449-c3a6-1f94-ac7a81772c7a";
  var TABBY_CURRENCY = "AED";
  var TABBY_LANG = "en";
  var TABBY_MERCHANT_CODE = "SHN";

  /* ================================
     HELPERS
  ================================= */
  function cleanPrice(text) {
    return Number(text.replace(/[^0-9.]/g, ""));
  }

  /* ================================
     1. PAYMENT METHOD ICON (CHECKOUT)
     — Your logic, made safe
  ================================= */
  function CheckoutIconLoad() {
    var label = document.querySelector(
      "label.ec-radiogroup__item--app_id-" + client_id
    );
    if (!label) return;

    var info = label.querySelector("div.ec-radiogroup__info");
    if (!info) return;

    // prevent duplicates
    if (info.querySelector("img")) return;

    var icon =
      "<div class='icon_resizer' style='height:40px;overflow:hidden'>" +
      "<img style='width:auto;height:100%;display:block' src='" + image_link + "' />" +
      "</div>";

    info.insertAdjacentHTML("beforeend", icon);
  }

  /* ================================
     2. TABBY CARD (CHECKOUT)
  ================================= */
  function removeTabbyCard() {
    var el = document.getElementById("tabbyCard");
    if (el) el.remove();
  }

  function initTabbyCheckoutCard() {
    removeTabbyCard();

    var label = document.querySelector(
      "label.ec-radiogroup__item--app_id-" + client_id
    );
    if (!label) return;

    var totalEl = document.querySelector(".ec-order-summary-total__value");
    if (!totalEl) return;

    var price = cleanPrice(totalEl.innerText);
    if (!price || price <= 0) return;

    var card = document.createElement("div");
    card.id = "tabbyCard";
    card.style.marginTop = "10px";

    label.appendChild(card);

    if (typeof TabbyCard !== "function") return;

    new TabbyCard({
      selector: "#tabbyCard",
      currency: TABBY_CURRENCY,
      price: price,
      lang: TABBY_LANG,
      shouldInheritBg: true,
      publicKey: TABBY_PUBLIC_KEY,
      merchantCode: TABBY_MERCHANT_CODE
    });
  }

  /* ================================
     3. TABBY PROMO (PRODUCT PAGE)
  ================================= */
  function injectTabbyPromo() {
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

    if (typeof TabbyPromo !== "function") return;

    new TabbyPromo({
      selector: "#tabbyPromo",
      currency: TABBY_CURRENCY,
      price: price,
      lang: TABBY_LANG,
      source: "product",
      publicKey: pk_test_019a48dc-9449-c3a6-1f94-ac7a81772c7a,
      merchantCode: 'SHN'
    });
  }

  /* ================================
     ECWID LIFECYCLE
  ================================= */
  Ecwid.OnAPILoaded.add(function () {
    Ecwid.OnPageLoaded.add(function (page) {

      // PRODUCT PAGE
      if (page.type === "PRODUCT") {
        setTimeout(injectTabbyPromo, 500);
      }

      // CHECKOUT – PAYMENT STEP
      if (page.type === "CHECKOUT_PAYMENT_DETAILS") {
        setTimeout(function () {
          CheckoutIconLoad();      // your icon
          initTabbyCheckoutCard(); // tabby card
        }, 600);
      }

    });
  });

})();
