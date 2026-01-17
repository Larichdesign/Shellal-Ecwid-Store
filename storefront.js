
/* =========================================================
   SAFE ECWID LOADERS (CRITICAL)
   ========================================================= */

function safeOnApiLoaded(handler) {
  if (window.Ecwid && Ecwid.OnAPILoaded && Ecwid.OnAPILoaded.add) {
    Ecwid.OnAPILoaded.add(handler);
  } else {
    setTimeout(function () {
      safeOnApiLoaded(handler);
    }, 50);
  }
}

function safeOnPageLoaded(handler) {
  safeOnApiLoaded(function () {
    if (Ecwid.OnPageLoaded && Ecwid.OnPageLoaded.add) {
      Ecwid.OnPageLoaded.add(handler);
    }
  });
}

function getOrderNumberFromEl(orderEl) {
  var titleEl = orderEl.querySelector(".ec-confirmation__title");
  if (!titleEl) return null;
  var match = titleEl.textContent.match(/#(\d+)/);
  return match ? match[1] : null;
}

function cancelReturn(orderNumber) {
  fetch("https://shellalalnoor.com/cancel-return", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
       orderNumber: orderNumber
    })
  }).then(function () {
    location.reload();
  });
}


/* =========================================================
   TABBY CONFIG (UNCHANGED LOGIC, SAFE HOOKS)
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
    var tabby = document.querySelector(
      ".ec-radiogroup__item--app_id-" + client_id
    );
    if (!tabby) return;
    tabby.style.display =
      cart.shippingPerson.countryCode === "AE" ? "" : "none";
  });
}

function isCheckoutPage(page) {
  if (typeof page === "string") return page.indexOf("checkout") === 0;
  if (typeof page === "object" && page.type)
    return page.type.indexOf("CHECKOUT_") === 0;
  return false;
}

safeOnApiLoaded(function () {
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

function loadTabbyPromoScript(cb) {
  if (window.TabbyPromo) return cb();
  var s = document.createElement("script");
  s.src = "https://checkout.tabby.ai/tabby-promo.js";
  s.onload = cb;
  document.head.appendChild(s);
}

function getProductPriceFromDOM() {
  var el =
    document.querySelector(".product-details__product-price[itemprop='price']") ||
    document.querySelector(".ec-price-item[itemprop='price']");
  if (!el) return null;
  var c = el.getAttribute("content");
  if (c) return parseFloat(c).toFixed(2);
  var t = el.innerText.replace(/[^\d.]/g, "");
  return t ? parseFloat(t).toFixed(2) : null;
}

function renderProductTabbyPromoFromDOM() {
  if (document.getElementById("tabby-promo-product")) return;
  var price = getProductPriceFromDOM();
  if (!price) return;

  var block =
    document.querySelector(".product-details__product-price") ||
    document.querySelector(".ec-price-item");
  if (!block) return;

  var d = document.createElement("div");
  d.id = "tabby-promo-product";
  d.style.marginTop = "8px";
  block.appendChild(d);

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

  var d = document.createElement("div");
  d.id = "tabby-promo-cart";

  var row =
    document.querySelector(".ec-cart-summary") ||
    document.querySelector(".ec-cart__footer");
  if (!row) return;

  row.appendChild(d);

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
   CHECKOUT – TABBY PROMO
   ========================================================= */

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
    publicKey: "pk_019a48dc-9449-c3a6-1f94-ac79d83b5dea",
    merchantCode: "SHN"
  });
}


safeOnPageLoaded(function (page) {
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

/* =========================================================
   RETURN FEATURE – FINAL (ALIGNED + STYLED)
   ========================================================= */

(function () {
  var DEBUG = true;

  function log() {
    if (DEBUG) {
      console.log.apply(console, ["[RETURN]"].concat([].slice.call(arguments)));
    }
  }

  /* ---------- STYLES (STRUCTURE ONLY) ---------- */
  function injectStyles() {
    if (document.getElementById("return-style")) return;

    var s = document.createElement("style");
    s.id = "return-style";
    s.innerHTML = `
      /* Align return button exactly under Buy again */
      .ec-confirmation__actions .custom-return-wrap {
        display: block;
        margin-top: 8px;
      }

      @media (max-width: 768px) {
        .ec-confirmation__actions .custom-return-wrap {
          width: 100%;
        }

        .custom-return-btn {
          width: 100%;
        }
      }

      #return-modal { display: none; }
      #return-modal.active { display: block; }

      .return-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,.5);
        z-index: 9998;
      }

      .return-box {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #fff;
        padding: 20px;
        width: 90%;
        max-width: 420px;
        z-index: 9999;
      }
    `;
    document.head.appendChild(s);
  }

  /* ---------- MODAL ---------- */
  function injectModal() {
    if (document.getElementById("return-modal")) return;

    var m = document.createElement("div");
    m.id = "return-modal";
    m.innerHTML = `
      <div class="return-overlay"></div>
      <div class="return-box">

        <input type="hidden" id="return-order-id" />

        <label class="return-label">Return title</label>
        <input id="return-title" />

        <label class="return-label">Reason for return</label>
        <textarea id="return-reason"></textarea>

        <div class="return-actions">
          <button id="return-submit" disabled>Submit</button>
          <button id="return-cancel">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(m);

    var titleEl = document.getElementById("return-title");
    var reasonEl = document.getElementById("return-reason");
    var submitBtn = document.getElementById("return-submit");

    titleEl.oninput = reasonEl.oninput = function () {
      submitBtn.disabled =
        !titleEl.value.trim() || !reasonEl.value.trim();
    };
  }

  /* ---------- BUTTON PER ORDER ---------- */
  function injectButtons() {
    document.querySelectorAll(".ec-cart__order").forEach(function (orderEl) {
      if (orderEl.querySelector(".custom-return-btn")) return;

      var titleEl = orderEl.querySelector(".ec-confirmation__title");
      var actionsEl = orderEl.querySelector(".ec-confirmation__actions");
      var buyAgainBtn = actionsEl?.querySelector(".ec-confirmation__action-link");

      if (!titleEl || !actionsEl || !buyAgainBtn) return;

      var orderNumber = getOrderNumberFromEl(orderEl);
if (!orderNumber) return;

      var wrap = document.createElement("div");
      wrap.className = "custom-return-wrap";

var btn = document.createElement("button");
btn.className = "custom-return-btn";
btn.dataset.orderNumber = orderNumber;
btn.textContent = "Checking return…";
btn.disabled = true;

fetch("https://shellalalnoor.com/return-status?=" + )
  .then(r => r.json())
  .then(data => {
    btn.disabled = false;

    if (data.status === "RETURNED") {
      btn.textContent = "Return Completed";
      btn.disabled = true;
      return;
    }

    if (data.hasReturn) {
      btn.textContent = "Cancel Return";
      btn.onclick = function () {
        cancelReturn(orderNumber);
      };
    } else {
      btn.textContent = "Request Return";
      btn.onclick = function () {
        injectModal();
        document.getElementById("return-order-id").value = orderNumber;
        document.getElementById("return-title").value = "";
        document.getElementById("return-reason").value = "";
        document.getElementById("return-submit").disabled = true;
        document.getElementById("return-modal").classList.add("active");
      };
    }
  })
  .catch(() => {
    btn.disabled = false;
    btn.textContent = "Request Return";
  });

      wrap.appendChild(btn);
      buyAgainBtn.insertAdjacentElement("afterend", wrap);

      log("Return button injected for order", orderNumber);
    });
  }

  /* ---------- EVENTS ---------- */
  document.addEventListener("click", function (e) {
    if (
      e.target.id === "return-cancel" ||
      e.target.classList.contains("return-overlay")
    ) {
      document.getElementById("return-modal")?.classList.remove("active");
    }
if (e.target.id === "return-submit") {
  var orderNumber = document.getElementById("return-order-id").value;
  var title = document.getElementById("return-title").value.trim();
  var reason = document.getElementById("return-reason").value.trim();

  e.target.disabled = true;
  e.target.textContent = "Submitting...";

  fetch("https://shellalalnoor.com/request-return", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
       orderNumber: orderNumber,
      returnRequest: {
        title: title,
        reason: reason,
        requestedAt: new Date().toISOString()
      }
    })
  }).then(function () {
    location.reload();
  });
}
  });
   

  /* ---------- PAGE + OBSERVER ---------- */
  safeOnPageLoaded(function (page) {
    if (page.type !== "ACCOUNT_ROOT" && page.type !== "ORDER_DETAILS") return;

    injectStyles();
    injectButtons();

    var observer = new MutationObserver(injectButtons);
    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
