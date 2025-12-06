var client_id = "custom-app-123237799-1"
var image_link = "https://iili.io/fT8bjLv.png"

// function that adds an image
var CheckoutIconLoad = function () {
   var icon = "<div class='icon_resizer' style='height:30px; overflow:hidden'> <img style='width:auto; height:100%; display:block;' src='"+image_link+"'></img> </div>";
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


<!-- Tabby Promo Scripts -->
<script src="https://checkout.tabby.ai/tabby-promo.js"></script>
<script src="https://checkout.tabby.ai/tabby-card.js"></script>

<script>
// ==========================================================
// REQUIRED ECWID API HOOK
// ==========================================================
Ecwid.OnAPILoaded.add(function() {
    console.log("Ecwid JS API is loaded.");

    // Product Page
    Ecwid.OnProductDisplayed.add(function(product) {
        loadTabbyProductPromo(product);
    });

    // Cart Page
    Ecwid.OnCartChanged.add(function(cart) {
        loadTabbyCartPromo(cart);
    });

    // Checkout Page
    Ecwid.OnPageLoaded.add(function(page) {
        if (page.type === "CHECKOUT_PAYMENT_DETAILS") {
            loadTabbyCheckoutPromo();
        }
    });
});

// ==========================================================
// PRODUCT PAGE – Tabby Promo
// ==========================================================
function loadTabbyProductPromo(product) {
    if (!product || !product.price) return;

    const price = Number(product.price).toFixed(2);
    const containerId = "tabby-product-promo";

    // Remove old promo if exists
    const existing = document.getElementById(containerId);
    if (existing) existing.remove();

    // Insert promo container
    const priceBlock = document.querySelector(".ec-price-item");
    if (!priceBlock) return;

    const div = document.createElement("div");
    div.id = containerId;
    priceBlock.after(div);

    new TabbyPromo({
        selector: `#${containerId}`,
        currency: "AED",
        price: price,
        lang: "en",
        source: "product",
        publicKey: "pk_test_019a48dc-9449-c3a6-1f94-ac7a81772c7a",
        merchantCode: "SHN"
    });
}

// ==========================================================
// CART PAGE – Tabby Promo
// ==========================================================
function loadTabbyCartPromo(cart) {
    if (!cart || !cart.total) return;

    const price = Number(cart.total).toFixed(2);
    const containerId = "tabby-cart-promo";

    const checkoutButton = document.querySelector(".ec-cart__button");
    if (!checkoutButton) return;

    let div = document.getElementById(containerId);
    if (!div) {
        div = document.createElement("div");
        div.id = containerId;
        checkoutButton.before(div);
    }

    // Reset content before re-render
    div.innerHTML = "";

    new TabbyPromo({
        selector: `#${containerId}`,
        currency: "AED",
        price: price,
        lang: "en",
        source: "cart",
        publicKey: "pk_test_019a48dc-9449-c3a6-1f94-ac7a81772c7a",
        merchantCode: "SHN"
    });
}

// ==========================================================
// CHECKOUT PAGE – Tabby Card Widget
// ==========================================================
function loadTabbyCheckoutPromo() {
    const totalElement = document.querySelector(".ec-cart-summary__total .ec-price-item");
    if (!totalElement) return;

    const amount = Number(totalElement.innerText.replace(/[^\d.]/g, "")).toFixed(2);
    const containerId = "tabby-checkout-card";

    let div = document.getElementById(containerId);
    if (!div) {
        div = document.createElement("div");
        div.id = containerId;

        const summaryArea = document.querySelector(".ec-cart-summary__items");
        if (summaryArea) summaryArea.after(div);
    }

    // Prevent duplicates
    div.innerHTML = "";

    new TabbyCard({
        selector: `#${containerId}`,
        currency: "AED",
        price: amount,
        lang: "en",
        shouldInheritBg: false,
        publicKey: "pk_test_019a48dc-9449-c3a6-1f94-ac7a81772c7a",
        merchantCode: "SHN"
    });
}
</script>

