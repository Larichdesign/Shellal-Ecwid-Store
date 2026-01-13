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

//---------- ProductPage ---------------//

function loadTabbyPromoScript(callback) {
  if (window.TabbyPromo) return callback();

  var s = document.createElement("script");
  s.src = "https://checkout.tabby.ai/tabby-promo.js";
  s.onload = callback;
  document.head.appendChild(s);
}

function getProductPriceFromDOM() {
  var priceEl =
    document.querySelector(".product-details__product-price[itemprop='price']") ||
    document.querySelector(".ec-price-item[itemprop='price']");

  if (!priceEl) return null;

  // Prefer structured data
  var contentPrice = priceEl.getAttribute("content");
  if (contentPrice) return parseFloat(contentPrice).toFixed(2);

  // Fallback to visible price
  var textPrice = priceEl.innerText.replace(/[^\d.]/g, "");
  return textPrice ? parseFloat(textPrice).toFixed(2) : null;
}

function renderProductTabbyPromoFromDOM() {
  var containerId = "tabby-promo-product";
  if (document.getElementById(containerId)) return;

  var price = getProductPriceFromDOM();
  if (!price) return;

  var priceBlock =
    document.querySelector(".product-details__product-price") ||
    document.querySelector(".ec-price-item");

  if (!priceBlock) return;

  var container = document.createElement("div");
  container.id = containerId;
  container.style.marginTop = "8px";

  priceBlock.appendChild(container);

  new TabbyPromo({
    selector: "#" + containerId,
    currency: "AED",
    price: price,
    lang: "en",
    source: "product",
    publicKey: "pk_test_019a48dc-9449-c3a6-1f94-ac7a81772c7a",
    merchantCode: "SHN"
  });
}

Ecwid.OnPageLoaded.add(function (page) {
  if (page.type !== "PRODUCT") return;

  loadTabbyPromoScript(function () {
    // Delay ensures DOM is fully hydrated
    setTimeout(renderProductTabbyPromoFromDOM, 300);
  });
});



// --------------------- Cart ----------------------//

function renderCartTabbyPromo(cart) {
  if (!cart || !cart.total) return;

  var id = "tabby-promo-cart";
  if (document.getElementById(id)) return;

  var container = document.createElement("div");
  container.id = id;

  var totalRow =
    document.querySelector(".ec-cart-summary") ||
    document.querySelector(".ec-cart__footer");

  if (!totalRow) return;
  totalRow.appendChild(container);

  new TabbyPromo({
    selector: "#" + id,
    currency: cart.currency || "AED",
    price: cart.total.toFixed(2),
    lang: "en",
    source: "cart",
    publicKey: "pk_test_019a48dc-9449-c3a6-1f94-ac7a81772c7a",
    merchantCode: "SHN"
  });
}


Ecwid.OnPageLoaded.add(function (page) {
  if (page.type !== "CART") return;

  loadTabbyPromoScript(function () {
    Ecwid.Cart.get(renderCartTabbyPromo);
  });
});


// ------------------ Checkout -----------------------//
function loadTabbyCardScript(callback) {
  if (window.TabbyCard) return callback();

  var s = document.createElement("script");
  s.src = "https://checkout.tabby.ai/tabby-card.js";
  s.onload = callback;
  document.head.appendChild(s);
}


function renderCheckoutTabbyCard(cart) {
  var containerId = "tabby-card-checkout";

  var tabbyMethod = document.querySelector(
    ".ec-radiogroup__item--app_id-custom-app-123237799-1"
  );

  if (!tabbyMethod) return;

  var existing = document.getElementById(containerId);
  if (existing) existing.remove();

  var container = document.createElement("div");
  container.id = containerId;
  container.style.marginTop = "12px";

  tabbyMethod.appendChild(container);

  new TabbyCard({
    selector: "#" + containerId,
    currency: cart.currency || "AED",
    price: cart.total.toFixed(2),
    lang: "en",
    publicKey: "pk_test_019a48dc-9449-c3a6-1f94-ac7a81772c7a",
    merchantCode: "SHN"
  });
}


Ecwid.OnPageLoaded.add(function (page) {
  if (
    typeof page !== "object" ||
    page.type !== "CHECKOUT_PAYMENT_DETAILS"
  )
    return;

  loadTabbyCardScript(function () {
    Ecwid.Cart.get(function (cart) {
      if (cart.shippingPerson?.countryCode !== "AE") return;
      renderCheckoutTabbyCard(cart);
    });
  });
});

if (Ecwid.OnCheckoutChanged && Ecwid.OnCheckoutChanged.add) {
  Ecwid.OnCheckoutChanged.add(function () {
    Ecwid.Cart.get(renderCheckoutTabbyCard);
  });
}
