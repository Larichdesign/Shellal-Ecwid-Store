var client_id = "custom-app-123237799-1"
var image_link = "https://iili.io/fAXNFcu.png"

// function that adds an image
var CheckoutIconLoad = function () {
   var icon = "<div class='icon_resizer' style='height:40px; overflow:hidden'> <img style='width:auto; height:100%; display:block;' src='"+image_link+"'></img> </div>";
   document.querySelector("label.ec-radiogroup__item--app_id-"+client_id+" div.ec-radiogroup__info:empty").innerHTML = icon;
}

// call function on the page load
Ecwid.OnAPILoaded.add(function () {
   Ecwid.OnPageLoaded.add(function (page) {
      if (page.type == "CHECKOUT_PAYMENT_DETAILS") {
         CheckoutIconLoad();
      }
   });
});

Ecwid.OnPageLoaded.add(function(page) {
  if (page.type !== "CHECKOUT_PAYMENT_DETAILS") return;

  const params = new URLSearchParams(window.location.search);
  const errorMessage = params.get("error");

  if (errorMessage) {
    showTabbyError(decodeURIComponent(errorMessage));
  }
});

function showTabbyError(msg) {

  const container = document.createElement("div");
  container.style.background = "#ffeeee";
  container.style.color = "#a40000";
  container.style.padding = "12px 15px";
  container.style.borderRadius = "6px";
  container.style.marginBottom = "15px";
  container.style.fontSize = "14px";
  container.style.border = "1px solid #dd8888";

  container.textContent = msg;

  const target = document.querySelector(".ecwid-Checkout-block");
  if (target) {
    target.prepend(container);
  }
}

