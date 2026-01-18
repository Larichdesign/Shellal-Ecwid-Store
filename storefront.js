
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

function findOrderBlockByNumber(orderNumber) {
  var blocks = document.querySelectorAll(".ec-cart__order");
  for (var i = 0; i < blocks.length; i++) {
    var title = blocks[i].querySelector(".ec-confirmation__title");
    if (title && title.textContent.includes("#" + orderNumber)) {
      return blocks[i];
    }
  }
  return null;
}


function formatReturnCountdown(daysLeft) {
  if (daysLeft <= 0) return "Return window expired";
  if (daysLeft === 1) return "Return window: 1 day left";
  return `Return window: ${daysLeft} days left`;
}

function getReturnStatus(orderNumber) {
  return fetch("/return-status?orderNumber=" + encodeURIComponent(orderNumber))
    .then(function (r) {
      return r.ok ? r.json() : null;
    })
    .catch(function () {
      return null;
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
   RETURN FEATURE – FINAL (STABLE + ECWID-SAFE)
   ========================================================= */
(function () {
  var DEBUG = true;
  function log() {
    if (DEBUG) console.log("[RETURN]", ...arguments);
  }

  /* =========================================================
     SAFE ECWID HOOK
  ========================================================= */
  function safeOnPageLoaded(handler) {
    if (window.Ecwid && Ecwid.OnPageLoaded) {
      Ecwid.OnPageLoaded.add(handler);
    } else {
      setTimeout(function () {
        safeOnPageLoaded(handler);
      }, 50);
    }
  }

  /* =========================================================
     STYLES
  ========================================================= */
  function injectStyles() {
    if (document.getElementById("return-style")) return;

    var s = document.createElement("style");
    s.id = "return-style";
    s.innerHTML = `
      #custom-return-btn {
        background: #000;
        font-family: "DM Sans", system-ui, sans-serif;
        font-weight: 500;
        color: #fff;
        padding: 8px 24px;
        min-height: 40px;
        font-size: 14px;
        border-radius: 4px;
        cursor: pointer;
      }

      #custom-return-btn:hover { background: #222; }

      .custom-return-wrap {
  gap: 8px;
  margin-top: 8px;
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
        border-radius: 8px;
      }

      .return-label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
      }

      #return-title,
      #return-reason {
        width: 100%;
        padding: 8px 12px;
        margin-bottom: 14px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-family: "DM Sans", system-ui, sans-serif;
      }

      .return-actions {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
      }

      .return-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ccc;
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.return-meta {
  margin-top: 6px;
  font-size: 13px;
  color: #666;
}

.return-success {
  margin-top: 8px;
  color: #0a7a3b;
  font-weight: 500;
}

      #return-submit {
        background: #000;
        color: #fff;
        padding: 8px 16px;
        border-radius: 4px;
        font-weight: 500;
      }

      #return-submit:disabled {
        background: #ccc;
        cursor: not-allowed;
      }

      #return-cancel {
        background: transparent;
        border: 1px solid #ccc;
        padding: 8px 16px;
      }

      #custom-cancel-return-btn {
  background: transparent;
  font-family: "DM Sans", system-ui, sans-serif;
  font-weight: 500;
  color: #000;
  padding: 8px 24px;
  min-height: 40px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid #ccc;
  cursor: pointer;
}

#custom-cancel-return-btn:hover {
  background: #f5f5f5;
}

#custom-cancel-return-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.return-meta {
  margin-top: 6px;
  font-size: 13px;
  color: #666;
}

.return-meta strong {
  color: #000;
}


    `;
    document.head.appendChild(s);
  }

  /* =========================================================
     MODAL
  ========================================================= */
  function injectModal() {
    if (document.getElementById("return-modal")) return;

    var m = document.createElement("div");
    m.id = "return-modal";
    m.innerHTML = `
      <div class="return-overlay"></div>
      <div class="return-box">
        <input type="hidden" id="return-order-number" />

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

    var title = document.getElementById("return-title");
    var reason = document.getElementById("return-reason");
    var submit = document.getElementById("return-submit");

    title.oninput = reason.oninput = function () {
      submit.disabled = !title.value.trim() || !reason.value.trim();
    };
  }

  /* =========================================================
     SUCCESS STATE
  ========================================================= */
function showSuccess() {
  var box = document.querySelector(".return-box");
  var orderNumber =
    document.getElementById("return-order-number").value;

  box.innerHTML = `
    <h3>Return submitted</h3>
    <p class="return-success">
      Your return request has been submitted successfully.
    </p>
  `;

  // 🔒 Disable Request Return button immediately
  var orderBlock = findOrderBlockByNumber(orderNumber);
  if (!orderBlock) return;

  var wrap = orderBlock.querySelector(".custom-return-wrap");
  if (!wrap) return;

  var btn = wrap.querySelector("#custom-return-btn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Return Requested";
  }

  // 🔄 Re-fetch return status & update UI
  getReturnStatus(orderNumber).then(function (rs) {
    if (!rs) return;

    // Replace button with Cancel Return
    wrap.innerHTML = "";

    var cancelBtn = document.createElement("button");
    cancelBtn.id = "custom-cancel-return-btn";
    cancelBtn.textContent = "Cancel Return";

    var meta = document.createElement("div");
    meta.className = "return-meta";

    // ⏳ Countdown message
    if (!rs.windowExpired) {
      meta.textContent = formatReturnCountdown(rs.daysLeft);
    } else {
      meta.textContent = "Return window expired";
      cancelBtn.style.display = "none";
    }

    // 🚫 Disable cancel if pickup already collected
    if (rs.pickupStatus === "COLLECTED") {
      cancelBtn.disabled = true;
      meta.textContent = "Pickup already collected";
    } else {
      cancelBtn.onclick = function () {
        cancelBtn.disabled = true;
        cancelBtn.innerHTML = `<span class="return-spinner"></span>`;

        fetch("/cancel-return-pickup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderNumber })
        }).then(function () {
          meta.innerHTML =
            `<div class="return-success">Return cancelled successfully</div>`;
          cancelBtn.remove();
        });
      };
    }

    wrap.appendChild(cancelBtn);
    wrap.appendChild(meta);
  });
}



  /* =========================================================
     BUTTON INJECTION
  ========================================================= */
 function injectButtons() {
  document.querySelectorAll(".ec-cart__order").forEach(function (orderEl) {
    if (orderEl.querySelector(".custom-return-wrap")) return;

    var titleEl = orderEl.querySelector(".ec-confirmation__title");
    var actionsEl = orderEl.querySelector(".ec-confirmation__actions");
    var buyAgainBtn = actionsEl?.querySelector(".ec-confirmation__action-link");

    if (!titleEl || !buyAgainBtn) return;

    var match = titleEl.textContent.match(/#(\d+)/);
    if (!match) return;

    var orderNumber = match[1];

    var wrap = document.createElement("div");
    wrap.className = "custom-return-wrap";

    getReturnStatus(orderNumber).then(function (rs) {
      var btn = document.createElement("button");
      var meta = document.createElement("div");
      meta.className = "return-meta";

      /* =========================
         RETURN WINDOW MESSAGE
      ========================= */
      if (rs?.exists && !rs.windowExpired) {
        meta.textContent = `Return window: ${rs.daysLeft} day(s) left`;
      }

      if (rs?.windowExpired) {
        meta.textContent = "Return window expired";
      }

      /* =========================
         CANCEL RETURN
      ========================= */
      if (rs?.exists && rs.status !== "CANCELLED") {
        btn.id = "custom-cancel-return-btn";
        btn.textContent = "Cancel Return";

        if (rs.pickupStatus === "COLLECTED") {
          btn.disabled = true;
          meta.textContent = "Pickup already collected";
        } else if (rs.windowExpired) {
          btn.style.display = "none";
        } else {
          btn.onclick = function () {
            btn.disabled = true;
            btn.innerHTML = `<span class="return-spinner"></span>`;

            fetch("/cancel-return-pickup", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderNumber })
            }).then(function () {
              meta.innerHTML =
                `<div class="return-success">Return cancelled successfully</div>`;
            });
          };
        }
      }

      /* =========================
         REQUEST RETURN
      ========================= */
      else {
        btn.id = "custom-return-btn";
        btn.textContent = "Request Return";

        if (rs?.windowExpired) {
          btn.disabled = true;
        }

        btn.onclick = function () {
          injectModal();
          document.getElementById("return-order-number").value = orderNumber;
          document.getElementById("return-title").value = "";
          document.getElementById("return-reason").value = "";
          document.getElementById("return-submit").disabled = true;
          document.getElementById("return-modal").classList.add("active");
        };
      }

      wrap.appendChild(btn);
      wrap.appendChild(meta);
      buyAgainBtn.insertAdjacentElement("afterend", wrap);
    });
  });
}

  /* =========================================================
     EVENTS
  ========================================================= */
  document.addEventListener("click", function (e) {
    if (
      e.target.id === "return-cancel" ||
      e.target.classList.contains("return-overlay")
    ) {
      document.getElementById("return-modal")?.classList.remove("active");
    }

    if (e.target.id === "return-submit") {
      var orderNumber =
        document.getElementById("return-order-number").value;
      var title = document.getElementById("return-title").value.trim();
      var reason = document.getElementById("return-reason").value.trim();

      e.target.disabled = true;
      e.target.innerHTML = `<span class="return-spinner"></span>`;

      fetch("/request-return", {
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
      })
        .then(showSuccess)
        .catch(function () {
          alert("Failed to submit return. Please try again.");
        });
    }
  });

  /* =========================================================
     INIT
  ========================================================= */
  safeOnPageLoaded(function (page) {
    if (page.type !== "ACCOUNT_ROOT" && page.type !== "ORDER_DETAILS") return;

    injectStyles();
    injectButtons();

    new MutationObserver(injectButtons).observe(document.body, {
      childList: true,
      subtree: true
    });
  });
})();






