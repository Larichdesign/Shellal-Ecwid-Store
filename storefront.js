(function () {

  var client_id = "custom-app-123237799-1";
  var image_link = "https://iili.io/fAXNFcu.png";

  function addPaymentIcon() {
    var icon = "<div style='height:40px;overflow:hidden'><img style='height:100%' src='" + image_link + "'></div>";
    var info = document.querySelector(
      "label.ec-radiogroup__item--app_id-" + client_id + " div.ec-radiogroup__info"
    );
    if (info && !info.querySelector("img")) {
      info.insertAdjacentHTML("beforeend", icon);
    }
  }

  function cleanPrice(text) {
    return Number(text.replace(/[^0-9.]/g, ""));
  }

  function removeTabbyCard() {
    var el = document.getElementById("tabbyCard");
    if (el) el.remove();
  }

  function initTabbyCheckoutCard() {
    removeTabbyCard();

    var label = document.querySelector(
      "label.ec-radiogroup__item--app_id-" + client_id
    );
    if (!label) return;

    var totalEl = document.querySelector(".ec-order-summary-total__value");
    if (!totalEl) return;

    var price = cleanPrice(totalEl.innerText);
    if (!price) return;

    var card = document.createElement("div");
    card.id = "tabbyCard";
    card.style.marginTop = "10px";
    label.appendChild(card);

    new TabbyCard({
      selector: "#tabbyCard",
      currency: "AED",
      price: price,
      lang: "en",
      shouldInheritBg: true,
      publicKey: "pk_test_019a48dc-9449-c3a6-1f94-ac7a81772c7a",
      merchantCode: "SHN"
    });
  }

  Ecwid.OnAPILoaded.add(function () {
    Ecwid.OnPageLoaded.add(function (page) {
      if (page.type === "CHECKOUT_PAYMENT_DETAILS") {
        setTimeout(function () {
          addPaymentIcon();
          initTabbyCheckoutCard();
        }, 600);
      }
    });
  });

})();
