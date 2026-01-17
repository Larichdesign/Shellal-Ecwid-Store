/* =========================================================
   GLOBAL HELPERS (SAFE ECWID HOOKS)
   ========================================================= */

function safeOnPageLoaded(handler) {
  if (window.Ecwid && Ecwid.OnAPILoaded && Ecwid.OnAPILoaded.add) {
    Ecwid.OnAPILoaded.add(function () {
      if (Ecwid.OnPageLoaded && Ecwid.OnPageLoaded.add) {
        Ecwid.OnPageLoaded.add(handler);
      }
    });
  }
}

/* =========================================================
   TABBY CONFIG (UNCHANGED)
   ========================================================= */

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
  if (typeof page === "string") return page.indexOf("checkout") === 0;
  if (typeof page === "object" && page.type)
    return page.type.indexOf("CHECKOUT_") === 0;
  return false;
}

Ecwid.OnAPILoaded.add(function () {
  safeOnPageLoaded(function (page) {
    if (!isCheckoutPage(page)) return;
    addTabbyIcon();
    toggleTabbyByCountry();
  });

  if (Ecwid.OnCheckoutChanged && Ecwid.OnCheckoutChanged.add) {
    Ecwid.OnCheckoutChanged.add(toggleTabbyByCountry);
  }
});

/* =========================================================
   PRODUCT PAGE – TABBY PROMO
   ========================================================= */

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
  var contentPrice = priceEl.getAttribute("content");
  if (contentPrice) return parseFloat(contentPrice).toFixed(2);
  var textPrice = priceEl.innerText.replace(/[^\d.]/g, "");
  return textPrice ? parseFloat(textPrice).toFixed(2) : null;
}

function renderProductTabbyPromoFromDOM() {
  if (document.getElementById("tabby-promo-product")) return;
  var price = getProductPriceFromDOM();
  if (!price) return;

  var priceBlock =
    document.querySelector(".product-details__product-price") ||
    document.querySelector(".ec-price-item");
  if (!priceBlock) return;

  var container = document.createElement("div");
  container.id = "tabby-promo-product";
  container.style.marginTop = "8px";
  priceBlock.appendChild(container);

  new TabbyPromo({
    selector: "#tabby-promo-product",
    currency: "AED",
    price: price,
    lang: "en",
    source: "product",
    publicKey: "pk_019a48dc-9449-c3a6-1f94-ac79d83b5dea",
    merchantCode: "SHN"
  });
}

safeOnPageLoaded(function (page) {
  if (page.type !== "PRODUCT") return;
  loadTabbyPromoScript(function () {
    setTimeout(renderProductTabbyPromoFromDOM, 300);
  });
});

/* =========================================================
   CART – TABBY PROMO
   ========================================================= */

function renderCartTabbyPromo(cart) {
  if (!cart || !cart.total) return;
  if (document.getElementById("tabby-promo-cart")) return;

  var container = document.createElement("div");
  container.id = "tabby-promo-cart";

  var totalRow =
    document.querySelector(".ec-cart-summary") ||
    document.querySelector(".ec-cart__footer");
  if (!totalRow) return;

  totalRow.appendChild(container);

  new TabbyPromo({
    selector: "#tabby-promo-cart",
    currency: cart.currency || "AED",
    price: cart.total.toFixed(2),
    lang: "en",
    source: "cart",
    publicKey: "pk_019a48dc-9449-c3a6-1f94-ac79d83b5dea",
    merchantCode: "SHN"
  });
}

safeOnPageLoaded(function (page) {
  if (page.type !== "CART") return;
  loadTabbyPromoScript(function () {
    Ecwid.Cart.get(renderCartTabbyPromo);
  });
});

/* =========================================================
   RETURN FEATURE (WITH LOGS)
   ========================================================= */

(function () {
  var RETURN_DEBUG = true;
  var RETURN_PREFIX = "[RETURN REQUEST]";

  function log() {
    if (!RETURN_DEBUG) return;
    console.log.apply(console, ["[RETURN]"].concat([].slice.call(arguments)));
  }

  function getReturnReason(notes) {
    if (!notes) return null;
    var m = notes.match(/\[RETURN REQUEST\][\s\S]*?Reason:\s*(.*)/i);
    return m ? m[1] : null;
  }

  function injectStyles() {
    if (document.getElementById("return-styles")) return;
    var s = document.createElement("style");
    s.id = "return-styles";
    s.innerHTML = `
      #return-modal{display:none}
      #return-modal.active{display:block}
      .return-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9998}
      .return-box{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
        background:#fff;width:90%;max-width:420px;padding:20px;border-radius:6px;z-index:9999}
      .return-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:15px}
      textarea{width:100%;min-height:90px}
    `;
    document.head.appendChild(s);
    log("Styles injected");
  }

  function injectModal() {
    if (document.getElementById("return-modal")) return;
    var m = document.createElement("div");
    m.id = "return-modal";
    m.innerHTML = `
      <div class="return-overlay"></div>
      <div class="return-box">
        <h2>Request a Return</h2>
        <input type="hidden" id="return-order-id">
        <textarea id="return-reason" placeholder="Reason for return"></textarea>
        <div class="return-actions">
          <button id="return-submit">Submit</button>
          <button id="return-cancel">Cancel</button>
        </div>
      </div>`;
    document.body.appendChild(m);
    log("Modal injected");
  }

  function injectReturnButton(order) {
    var actions = document.querySelector(".ec-confirmation__actions");
    log("Actions container:", !!actions);
    if (!actions || document.getElementById("custom-return-btn")) return;

    var wrap = document.createElement("div");
    wrap.className =
      "ec-confirmation__action-link ec-confirmation__action-link--desktop";

    var btn = document.createElement("button");
    btn.id = "custom-return-btn";
    btn.className =
      "form-control form-control--button form-control--medium";
    btn.textContent = "Request Return";

    btn.onclick = function () {
      log("Return button clicked", order.id);
      document.getElementById("return-order-id").value = order.id;
      document.getElementById("return-modal").classList.add("active");
    };

    wrap.appendChild(btn);
    actions.appendChild(wrap);
    log("Return button injected");
  }

  function bindModalEvents() {
    document.addEventListener("click", function (e) {
      if (e.target.id === "return-cancel" ||
          e.target.classList.contains("return-overlay")) {
        log("Modal closed");
        document.getElementById("return-modal").classList.remove("active");
      }

      if (e.target.id === "return-submit") {
        var id = document.getElementById("return-order-id").value;
        var reason = document.getElementById("return-reason").value.trim();
        if (!reason) return alert("Provide a reason");

        log("Submitting return", { id: id, reason: reason });

        fetch("/return-handler", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: id,
            note: RETURN_PREFIX + "\nReason: " + reason
          })
        }).then(function (r) {
          log("Return handler response", r.status);
          location.reload();
        });
      }
    });
  }

  Ecwid.OnAPILoaded.add(function () {
    safeOnPageLoaded(function (page) {
      log("Page:", page.type);
      if (page.type !== "ORDER_DETAILS") return;

      injectStyles();
      injectModal();
      bindModalEvents();

      Ecwid.getOrder(function (order) {
        log("Order loaded", order.id, order.fulfillmentStatus);
        injectReturnButton(order);
      });
    });
  });

})();
