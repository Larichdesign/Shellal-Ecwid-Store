<!-- ============ TABBY CORE SDK ============ -->
<script src="https://checkout.tabby.ai/tabby-promo.js"></script>
<script src="https://checkout.tabby.ai/tabby-card.js"></script>

<script>
/* ============================================================
   REQUIRED: ECWID API LOADED
   ============================================================ */
Ecwid.OnAPILoaded.add(function () {
    console.log("Ecwid API Loaded");

    /* PRODUCT PAGE */
    Ecwid.OnProductDisplayed.add(function (product) {
        loadTabbyProductPromo(product);
    });

    /* CART PAGE */
    Ecwid.OnCartChanged.add(function (cart) {
        loadTabbyCartPromo(cart);
    });

    /* CHECKOUT PAGE */
    Ecwid.OnPageLoaded.add(function (page) {
        if (page.type === "CHECKOUT_PAYMENT_DETAILS") {
            loadTabbyCheckoutPromo();
            detectTabbyIneligibilityFromWorker();
        }
    });
});

/* ============================================================
   WORKER BASE URL
   ============================================================ */
const WORKER_BASE = "https://shellalalnoor.com/";

/* ============================================================
   1. PRODUCT PAGE PROMO
   ============================================================ */
function loadTabbyProductPromo(product) {
    const price = product?.price;
    if (!price) return;

    const containerId = "tabby-product-promo";
    const old = document.getElementById(containerId);
    if (old) old.remove();

    const priceElem = document.querySelector(".ec-price-item");
    if (!priceElem) return;

    const div = document.createElement("div");
    div.id = containerId;
    priceElem.after(div);

    new TabbyPromo({
        selector: `#${containerId}`,
        currency: "AED",
        price: Number(price).toFixed(2),
        lang: "en",
        source: "product",
        publicKey: "pk_test_019a48dc-9449-c3a6-1f94-ac7a81772c7a",
        merchantCode: "SHN"
    });
}

/* ============================================================
   2. CART PAGE PROMO
   ============================================================ */
function loadTabbyCartPromo(cart) {
    const price = cart?.total;
    if (!price) return;

    const containerId = "tabby-cart-promo";
    const checkoutBtn = document.querySelector(".ec-cart__button");
    if (!checkoutBtn) return;

    let div = document.getElementById(containerId);
    if (!div) {
        div = document.createElement("div");
        div.id = containerId;
        checkoutBtn.before(div);
    }
    div.innerHTML = "";

    new TabbyPromo({
        selector: `#${containerId}`,
        currency: "AED",
        price: Number(price).toFixed(2),
        lang: "en",
        source: "cart",
        publicKey: "pk_test_019a48dc-9449-c3a6-1f94-ac7a81772c7a",
        merchantCode: "SHN"
    });
}

/* ============================================================
   3. CHECKOUT PAGE TABBY CARD WIDGET
   ============================================================ */
function loadTabbyCheckoutPromo() {
    const totalEl = document.querySelector(".ec-cart-summary__total .ec-price-item");
    if (!totalEl) return;

    const amount = Number(totalEl.innerText.replace(/[^\d.]/g, "")).toFixed(2);
    const containerId = "tabby-checkout-card";

    let div = document.getElementById(containerId);
    if (!div) {
        div = document.createElement("div");
        div.id = containerId;

        const summary = document.querySelector(".ec-cart-summary__items");
        if (summary) summary.after(div);
    }
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

/* ============================================================
   4. DETECT INELIGIBILITY REDIRECT FROM WORKER
   ============================================================ */
function detectTabbyIneligibilityFromWorker() {
    const url = new URL(window.location.href);
    const errorMsg = url.searchParams.get("error") || url.searchParams.get("errorMsg");

    if (errorMsg) {
        showEcwidErrorNotice(decodeURIComponent(errorMsg));
    }
}

/* ============================================================
   5. SHOW ERROR IN ECWID NOTICE BOX
   ============================================================ */
function showEcwidErrorNotice(message) {
    const ecwidNotices = document.querySelector(".ec-notices");
    if (!ecwidNotices) return;

    // Remove previous custom message
    document.querySelectorAll(".tabby-error-notice").forEach(e => e.remove());

    const div = document.createElement("div");
    div.className =
        "ec-notice ec-notice--animation-default ec-notice--error ec-notice--fixed ec-notices--top ec-notice--right tabby-error-notice";

    div.innerHTML = `
        <div class="ec-notice__wrap" style="display:flex;align-items:center;">
            <div class="ec-notice__icon"></div>
            <div class="ec-notice__message">
                <div class="ec-notice__text">
                    <div class="ec-notice__text-inner">
                        <label>${message}</label>
                    </div>
                </div>
            </div>
            <div class="ec-notice__control">
                <div class="ec-notice__close" style="cursor:pointer;">✕</div>
            </div>
        </div>
    `;

    ecwidNotices.appendChild(div);

    div.querySelector(".ec-notice__close").onclick = () => div.remove();

    setTimeout(() => div.remove(), 8000);
}

/* ============================================================
   6. OPTIONAL — DISPLAY ICON FOR TABBY PAYMENT OPTION
   ============================================================ */
Ecwid.OnPageLoaded.add(function(page) {
    if (page.type !== "CHECKOUT_PAYMENT_DETAILS") return;

    const client_id = "custom-app-XXXX-1"; // replace with YOUR Ecwid payment method ID
    const image_link = "https://iili.io/fAq4ehF.jpg"; // your icon

    const selector = "label.ec-radiogroup__item--app_id-" + client_id + " .ec-radiogroup__info";
    let target = document.querySelector(selector);

    if (!target) {
        setTimeout(() => Ecwid.OnPageLoaded.dispatch(page), 300);
        return;
    }

    if (target.innerHTML.trim() === "") {
        target.innerHTML = `
            <div style='height:40px;overflow:hidden;'>
                <img src="${image_link}" style='height:100%;width:auto;display:block;'>
            </div>
        `;
    }
});
</script>
