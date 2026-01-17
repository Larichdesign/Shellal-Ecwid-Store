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
    publicKey: "pk_019a48dc-9449-c3a6-1f94-ac79d83b5dea",
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
    publicKey: "pk_019a48dc-9449-c3a6-1f94-ac79d83b5dea",
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
    publicKey: "pk_019a48dc-9449-c3a6-1f94-ac79d83b5dea",
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

/* =========================================================
   ECWID RETURN REQUEST FEATURE (ORDER NOTES BASED)
   ========================================================= */

(function () {
  var RETURN_PREFIX = "[RETURN REQUEST]";

  function getReturnReason(notes) {
    if (!notes) return null;
    var match = notes.match(/\[RETURN REQUEST\][\s\S]*?Reason:\s*(.*)/i);
    return match ? match[1] : null;
  }

  function injectStyles() {
    if (document.getElementById("return-styles")) return;

    var style = document.createElement("style");
    style.id = "return-styles";
    style.innerHTML = `
      #return-modal { display:none; }
      #return-modal.active { display:block; }

      .return-overlay {
        position:fixed; inset:0;
        background:rgba(0,0,0,.5);
        z-index:9998;
      }

      .return-box {
        position:fixed;
        top:50%; left:50%;
        transform:translate(-50%,-50%);
        background:#fff;
        width:90%; max-width:420px;
        padding:20px;
        border-radius:6px;
        z-index:9999;
      }

      .return-box textarea {
        width:100%;
        min-height:90px;
        margin-top:8px;
      }

      .return-actions {
        display:flex;
        gap:10px;
        justify-content:flex-end;
        margin-top:15px;
      }
    `;
    document.head.appendChild(style);
  }

  function injectModal() {
    if (document.getElementById("return-modal")) return;

    var modal = document.createElement("div");
    modal.id = "return-modal";
    modal.innerHTML = `
      <div class="return-overlay"></div>
      <div class="return-box">
        <h2 id="return-modal-title">Request a Return</h2>
        <input type="hidden" id="return-order-id">
        <label for="return-reason">Reason for return</label>
        <textarea id="return-reason"></textarea>
        <div class="return-actions">
          <button id="return-submit">Submit</button>
          <button id="return-cancel">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  function showModal(orderId) {
    document.getElementById("return-order-id").value = orderId;
    document.getElementById("return-modal").classList.add("active");
  }

  function hideModal() {
    document.getElementById("return-modal").classList.remove("active");
  }

  function injectReturnButton(order) {
    var actions = document.querySelector(".ec-confirmation__actions");
    if (!actions || document.getElementById("custom-return-btn")) return;

    var btn = document.createElement("button");
    btn.id = "custom-return-btn";
    btn.className = "ec-btn ec-btn--secondary";
    btn.textContent = "Request Return";

    btn.onclick = function () {
      showModal(order.id);
    };

    actions.appendChild(btn);
    return btn;
  }

  function updateButtonState(order) {
    var btn = document.getElementById("custom-return-btn");
    if (!btn) return;

    var reason = getReturnReason(order.notes);

    if (order.fulfillmentStatus === "RETURNED") {
      btn.disabled = true;
      btn.textContent = "Returned";
    } else if (reason) {
      btn.disabled = true;
      btn.textContent = "Return Requested";
    }
  }

  function displayReturnReason(order) {
    var reason = getReturnReason(order.notes);
    if (!reason || document.getElementById("return-reason-display")) return;

    var container = document.querySelector(".ec-confirmation__details");
    if (!container) return;

    var block = document.createElement("div");
    block.id = "return-reason-display";
    block.innerHTML = `<strong>Return reason</strong><div>${reason}</div>`;
    container.appendChild(block);
  }

  function bindModalEvents() {
    document.addEventListener("click", function (e) {
      if (e.target.id === "return-cancel" ||
          e.target.classList.contains("return-overlay")) {
        hideModal();
      }

      if (e.target.id === "return-submit") {
        var orderId = document.getElementById("return-order-id").value;
        var reason = document.getElementById("return-reason").value.trim();

        if (!reason) {
          alert("Please provide a reason for return");
          return;
        }

        fetch("/return-handler", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: orderId,
            note: RETURN_PREFIX + "\nReason: " + reason
          })
        }).then(function () {
          hideModal();
          location.reload();
        });
      }
    });
  }

  /* ---------------- ECWID HOOK ---------------- */
if (window.Ecwid && Ecwid.OnAPILoaded && Ecwid.OnAPILoaded.add) {
  Ecwid.OnAPILoaded.add(function () {

    if (!Ecwid.OnPageLoaded || !Ecwid.OnPageLoaded.add) return;

    Ecwid.OnPageLoaded.add(function (page) {
      if (page.type !== "ORDER_DETAILS") return;

      injectStyles();
      injectModal();
      bindModalEvents();

      Ecwid.getOrder(function (order) {
        injectReturnButton(order);
        updateButtonState(order);
        displayReturnReason(order);
      });
    });

  });
}


})();




