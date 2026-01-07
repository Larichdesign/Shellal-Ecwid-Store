<script src="https://checkout.tabby.ai/tabby-promo.js"></script>
<script src="https://checkout.tabby.ai/tabby-card.js"></script>

<script>
var client_id = "custom-app-123237799-1"; // your app client_id
var image_link = "https://iili.io/fAXNFcu.png"; // must be https
var WORKER_BASE_URL = "https://your-worker-domain.workers.dev"; // CHANGE THIS

function hideTabbyPayment() {
  var selector = "label.ec-radiogroup__item--app_id-" + client_id;
  var el = document.querySelector(selector);
  if (el) {
    el.style.display = "none";
  }
}

function CheckoutIconLoad() {
  var selector =
    "label.ec-radiogroup__item--app_id-" +
    client_id +
    " div.ec-radiogroup__info:empty";

  var el = document.querySelector(selector);
  if (!el) return;

  el.innerHTML =
    "<div class='icon_resizer' style='height:40px; overflow:hidden'>" +
    "<img style='width:auto;height:100%;display:block' src='" +
    image_link +
    "' />" +
    "</div>";
}

Ecwid.OnAPILoaded.add(function () {
  Ecwid.OnPageLoaded.add(function (page) {
    if (page.type !== "CHECKOUT_PAYMENT_DETAILS") return;

    var order = Ecwid.getAppPublicConfig
      ? Ecwid.getAppPublicConfig()
      : null;

    var cart = Ecwid.getCart();
    if (!cart) return;

    var amount = cart.total;
    var country =
      cart.shippingPerson?.countryCode ||
      cart.billingPerson?.countryCode ||
      "";

    // If not UAE, hide immediately (UX improvement)
    if (country !== "AE") {
      hideTabbyPayment();
      return;
    }

    // Verify with backend eligibility
    fetch(
      WORKER_BASE_URL +
        "/eligibility?amount=" +
        amount +
        "&country=" +
        country
    )
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        if (!data.eligible) {
          hideTabbyPayment();
        } else {
          CheckoutIconLoad();
        }
      })
      .catch(function () {
        // Fail-safe: hide Tabby if eligibility fails
        hideTabbyPayment();
      });
  });
});
</script>
