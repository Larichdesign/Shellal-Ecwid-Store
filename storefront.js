/* var client_id = "custom-app-123237799-1";
var image_link = "https://iili.io/fAXNFcu.png";
var WORKER_BASE_URL = "https://tabby-ecwid-worker.designlarich.workers.dev";

function hideTabbyPayment() {
  var selector = "label.ec-radiogroup__item--app_id-" + client_id;
  var el = document.querySelector(selector);
  if (el) {
    el.style.display = "none";
  }
}

function CheckoutIconLoad() {
  var selector =
    "label.ec-radiogroup__item--app_id-" +client_id +" div.ec-radiogroup__info:empty";

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

    var cart = Ecwid.getCart();
    if (!cart) return;

    var amount = cart.total;
    var country =
      cart.shippingPerson?.countryCode ||
      cart.billingPerson?.countryCode ||
      "";

    if (country !== "AE") {
      hideTabbyPayment();
      return;
    }

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
        hideTabbyPayment();
      });
  });
});



