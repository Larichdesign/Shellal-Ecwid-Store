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
   RETURN FEATURE (FINAL + STABLE)
   ========================================================= */

(function () {
  var RETURN_DEBUG = true;

  function log() {
    if (!RETURN_DEBUG) return;
    console.log.apply(console, ["[RETURN]"].concat([].slice.call(arguments)));
  }

  /* ---------- LIVE SUBMIT VALIDATION ---------- */

  function updateSubmitState() {
    var titleEl = document.getElementById("return-title");
    var reasonEl = document.getElementById("return-reason");
    var submitBtn = document.getElementById("return-submit");

    if (!titleEl || !reasonEl || !submitBtn) return;

    submitBtn.disabled = !(
      titleEl.value.trim().length > 0 &&
      reasonEl.value.trim().length > 0
    );
  }

  /* ---------- STYLES ---------- */

  function injectStyles() {
    if (document.getElementById("return-style")) return;

    var s = document.createElement("style");
    s.id = "return-style";
    s.innerHTML = `
      #return-modal{display:none}
      #return-modal.active{display:block}
      .return-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9998}
      .return-box{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);
        background:#fff;padding:20px;width:90%;max-width:420px;border-radius:8px;z-index:9999}
      .return-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:20px}
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
        <input id="return-title" type="text" placeholder="e.g. Wrong size, damaged item"/>

        <label class="return-label">Reason for return</label>
        <textarea id="return-reason" placeholder="Please explain the reason for return"></textarea>

        <div class="return-actions">
          <button id="return-submit" disabled>Submit</button>
          <button id="return-cancel">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(m);

    // Bind live validation ONCE
    document.getElementById("return-title").addEventListener("input", updateSubmitState);
    document.getElementById("return-reason").addEventListener("input", updateSubmitState);

    log("Modal injected");
  }

  /* ---------- BUTTON INJECTION ---------- */

  function injectButton(orderId) {
    var actions = document.querySelector(".ec-confirmation__actions");
    if (!actions || document.getElementById("custom-return-btn")) return;

    var buyAgain = actions.querySelector(".ec-confirmation__action-link--desktop");
    if (!buyAgain) return;

    var wrap = document.createElement("div");
    wrap.className =
      "ec-confirmation__action-link ec-confirmation__action-link--desktop";

    var btn = document.createElement("button");
    btn.id = "custom-return-btn";
    btn.className =
      "form-control form-control--button form-control--medium";
    btn.textContent = "Request Return";

    btn.onclick = function () {
      injectModal();

      document.getElementById("return-order-id").value = orderId;
      document.getElementById("return-title").value = "";
      document.getElementById("return-reason").value = "";
      document.getElementById("return-submit").disabled = true;

      document.getElementById("return-modal").classList.add("active");
      log("Return modal opened for order", orderId);
    };

    wrap.appendChild(btn);
    buyAgain.insertAdjacentElement("afterend", wrap);
  }

  /* ---------- EVENTS ---------- */

  document.addEventListener("click", function (e) {
    if (
      e.target.id === "return-cancel" ||
      e.target.classList.contains("return-overlay")
    ) {
      document.getElementById("return-modal")?.classList.remove("active");
      document.getElementById("return-submit").disabled = true;
      log("Modal closed");
    }

    if (e.target.id === "return-submit") {
      var id = document.getElementById("return-order-id").value;
      var title = document.getElementById("return-title").value.trim();
      var reason = document.getElementById("return-reason").value.trim();

      if (!title || !reason) return;

      e.target.disabled = true;
      e.target.textContent = "Submitting...";

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
      }).then(function () {
        location.reload();
      });
    }
  });

  /* ---------- PAGE HOOK ---------- */

  safeOnPageLoaded(function (page) {
    if (page.type !== "ORDER_DETAILS" && page.type !== "ACCOUNT_ROOT") return;

    var title = document.querySelector(".ec-confirmation__title");
    if (!title) return;

    var match = title.textContent.match(/#(\d+)/);
    if (!match) return;

    injectStyles();
    injectButton(match[1]);
  });
})();

