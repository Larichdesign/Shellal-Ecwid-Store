/* ============================================================
   TABBY SDK LOADERS (must run before everything else)
   ============================================================ */
(function loadTabbySDK() {
    const promo = document.createElement("script");
    promo.src = "https://checkout.tabby.ai/tabby-promo.js";
    document.head.appendChild(promo);

    const card = document.createElement("script");
    card.src = "https://checkout.tabby.ai/tabby-card.js";
    document.head.appendChild(card);
})();

/* ============================================================
   ECWID API LOADED
   ============================================================ */
Ecwid.OnAPILoaded.add(function () {
    console.log("Ecwid API Loaded");

    Ecwid.OnProductDisplayed.add(loadTabbyProductPromo);
    Ecwid.OnCartChanged.add(loadTabbyCartPromo);

    Ecwid.OnPageLoaded.add(function (page) {
        if (page.type === "CHECKOUT_PAYMENT_DETAILS") {
            loadTabbyCheckoutPromo();
            detectTabbyIneligibilityFromWorker();
            insertTabbyPaymentIcon();
        }
    });
});

/* ============================================================
   CONFIG
   ============================================================ */
const WORKER_BASE = "https://shellalalnoor.com/";
const TABBY_PUBLIC_KEY = "pk_test_019a48dc-9449-c3a6-1f94-ac7a81772c7a";
const TABBY_MERCHANT_CODE = "SHN";

/* ============================================================
   1. PRODUCT PAGE PROMO
   ============================================================ */
function loadTabbyProductPromo(product) {
    const price = product?.price;
    if (!price) return;

    const containerId = "tabby-product-promo";
    document.getElementById(containerId)?.remove();

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
        publicKey: TABBY_PUBLIC_KEY,
        merchantCode: TABBY_MERCHANT_CODE
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
    } else {
        div.innerHTML = "";
    }

    new TabbyPromo({
        selector: `#${containerId}`,
        currency: "AED",
        price: Number(price).toFixed(2),
        lang: "en",
        source: "cart",
        publicKey: TABBY_PUBLIC_KEY,
        merchantCode: TABBY_MERCHANT_CODE
    });
}

/* ============================================================
   3. CHECKOUT PAGE TABBY CARD
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
        publicKey: TABBY_PUBLIC_KEY,
        merchantCode: TABBY_MERCHANT_CODE
    });
}

/* ============================================================
   4. DETECT INELIGIBILITY FROM WORKER
   ============================================================ */
function detectTabbyIneligibilityFromWorker() {
    const url = new URL(window.location.href);
    const errorMsg = url.searchParams.get("error") || url.searchParams.get("errorMsg");

    if (errorMsg) {
        showEcwidErrorNotice(decodeURIComponent(errorMsg));
    }
}

/* ============================================================
   5. SHOW ECWID NOTICE
   ============================================================ */
function showEcwidErrorNotice(message) {
    const ecwidNotices = document.querySelector(".ec-notices");
    if (!ecwidNotices) return;

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
   6. OPTIONAL — TABBY ICON NEAR PAYMENT OPTION
   ============================================================ */
function insertTabbyPaymentIcon() {
    const client_id = "custom-app-XXXX-1"; // replace with YOUR Ecwid payment method ID
    const image_link = "https://iili.io/fAq4ehF.jpg";

    const selector =
        "label.ec-radiogroup__item--app_id-" + client_id + " .ec-radiogroup__info";

    const target = document.querySelector(selector);
    if (!target) return;

    if (target.innerHTML.trim() === "") {
        target.innerHTML = `
            <div style='height:40px;overflow:hidden;'>
                <img src="${image_link}" style='height:100%;width:auto;display:block;'>
            </div>
        `;
    }
}
