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
   RETURN FEATURE (WITH LOGS)
   ========================================================= */

(function () {
  var RETURN_DEBUG = true;
  var PREFIX = "[RETURN REQUEST]";

  function log() {
    if (!RETURN_DEBUG) return;
    console.log.apply(console, ["[RETURN]"].concat([].slice.call(arguments)));
  }

  function injectStyles() {
    if (document.getElementById("return-style")) return;
    var s = document.createElement("style");
    s.id = "return-style";
    s.innerHTML = `
      #return-modal{display:none}
      #return-modal.active{display:block}
      .return-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9998}
      .return-box{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
        background:#fff;padding:20px;width:90%;max-width:420px;border-radius:6px;z-index:9999}
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

      <!-- ✅ ADD THIS BACK -->
      <input type="hidden" id="return-order-id" />

      <label for="return-title" class="return-label">Return title</label>
      <input
        type="text"
        id="return-title"
        placeholder="e.g. Wrong size, damaged item"
      />

      <label for="return-reason" class="return-label">Reason for return</label>
      <textarea
        id="return-reason"
        placeholder="Please explain the reason for return"
      ></textarea>

      <div class="return-actions">
        <button id="return-submit">Submit</button>
        <button id="return-cancel">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(m);
}


 function injectButton(order) {
  var actions = document.querySelector(".ec-confirmation__actions");
  log("Actions container found:", !!actions);
  if (!actions) return;

  if (document.getElementById("custom-return-btn")) {
    log("Return button already exists");
    return;
  }

  // Find the Buy Again wrapper (first action-link)
  var actionLinks = actions.querySelectorAll(
    ".ec-confirmation__action-link--desktop"
  );

  if (!actionLinks.length) {
    log("No action links found");
    return;
  }

  var buyAgainWrapper = actionLinks[0];
  log("Buy Again wrapper found");

  // Create wrapper (must match Ecwid structure)
  var wrapper = document.createElement("div");
  wrapper.className =
    "ec-confirmation__action-link ec-confirmation__action-link--desktop";

  // Create button
  var btn = document.createElement("button");
  btn.id = "custom-return-btn";
  btn.type = "button";
  btn.className =
    "form-control form-control--button form-control--medium";
  btn.textContent = "Request Return";

  btn.onclick = function () {
  log("Return button clicked", order.id);
  injectModal();
  var orderInput = document.getElementById("return-order-id");
  if (!orderInput) {
    console.error("[RETURN] return-order-id not found");
    return;
  }
  orderInput.value = order.id;
  document.getElementById("return-modal").classList.add("active");
};


  wrapper.appendChild(btn);

  // 🔑 Insert DIRECTLY AFTER "Buy again"
  buyAgainWrapper.insertAdjacentElement("afterend", wrapper);

  log("Return button injected below Buy Again");
}


  document.addEventListener("click", function (e) {
    if (e.target.id === "return-cancel" ||
        e.target.classList.contains("return-overlay")) {
      document.getElementById("return-modal")?.classList.remove("active");
      log("Modal closed");
    }

    if (e.target.id === "return-submit") {
      var id = document.getElementById("return-order-id").value;
      var title = document.getElementById("return-title").value.trim();
      var reason = document.getElementById("return-reason").value.trim();

if (!title || !reason) {
  alert("Please fill in both title and reason");
  return;
}
      if (!reason) return alert("Provide a reason");

      log("Submitting return", id, reason);

      fetch("/return-handler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: id,
          note:
    "[RETURN REQUEST]\n" +
    "Title: " + title + "\n" +
    "Reason: " + reason
        })
      }).then(function (r) {
        log("Return handler status", r.status);
        location.reload();
      });
    }
  });

  safeOnPageLoaded(function (page) {
  log("Page:", page.type);

  if (page.type !== "ORDER_DETAILS" && page.type !== "ACCOUNT_ROOT") return;

  waitForOrderActions();
});

function waitForOrderActions() {
  var actions = document.querySelector(".ec-confirmation__actions");

  if (!actions) {
    log("Actions not ready, retrying...");
    setTimeout(waitForOrderActions, 300);
    return;
  }

  log("Actions container ready");

  injectStyles();
  injectModal();

  // Extract order ID from DOM
  var orderTitle = document.querySelector(
    ".ec-confirmation__title, .ec-cart-order__title"
  );

  if (!orderTitle) {
    log("Order title not found, retrying...");
    setTimeout(waitForOrderActions, 300);
    return;
  }

  var match = orderTitle.textContent.match(/#(\d+)/);
  if (!match) {
    log("Order number not found in title");
    return;
  }

  var orderId = match[1];
  log("Order ID detected:", orderId);

  injectButton({ id: orderId });
}

})();






