/*************************************
 * EXISTING CHECKOUT ICON LOGIC
 *************************************/
var client_id = "custom-app-123237799-1"; // your app’s client_id
var image_link = "https://iili.io/fAXNFcu.png"; // your image URL (must be https)

// function that adds an image
var CheckoutIconLoad = function () {
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
};

/*************************************
 * TABBY PROMO LOGIC
 *************************************/
function insertTabbyPromo(price, source) {
  if (document.getElementById("TabbyPromo")) return;

  var promoDiv = document.createElement("div");
  promoDiv.id = "TabbyPromo";
  promoDiv.style.maxWidth = "100%";
  promoDiv.style.margin = "8px 0";

  // PRODUCT PAGE – under price
  if (source === "product") {
    var priceBlock = document.querySelector(".product-details-product-price");
    if (priceBlock && priceBlock.parentNode) {
      priceBlock.parentNode.insertBefore(promoDiv, priceBlock.nextSibling);
    }
  }

  // CART / CHECKOUT – under TOTAL
  if (source === "cart") {
    var totalEl = document.querySelector(".ec-order-summary-total");
    if (totalEl && totalEl.parentNode) {
      totalEl.parentNode.insertBefore(promoDiv, totalEl.nextSibling);
    }
  }

  if (typeof TabbyPromo !== "undefined") {
    new TabbyPromo({
      selector: "#TabbyPromo",
      currency: "AED",
      price: price,
      lang: "en",
      source: source,
      shouldInheritBg: true,
      publicKey: "pk_test_019a48dc-9449-c3a6-1f94-ac7a81772c7a",
      merchantCode: "SHN"
    });
  }
}

/*************************************
 * ECWID EVENTS (SINGLE ENTRY POINT)
 *************************************/
Ecwid.OnAPILoaded.add(function () {

  Ecwid.OnPageLoaded.add(function (page) {

    // Checkout payment icon (existing logic)
    if (page.type === "CHECKOUT_PAYMENT_DETAILS") {
      CheckoutIconLoad();
    }

    // Product page – Tabby promo
    if (page.type === "PRODUCT" && page.product) {
      insertTabbyPromo(page.product.price.toFixed(2), "product");
    }

  });

  // Cart page – Tabby promo
  Ecwid.OnCartChanged.add(function (cart) {
    if (!cart || !cart.total) return;
    insertTabbyPromo(cart.total.toFixed(2), "cart");
  });

});


