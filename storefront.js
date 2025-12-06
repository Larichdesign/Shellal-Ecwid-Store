var client_id = "custom-app-123237799-1";
var image_link = "https://iili.io/fz8RtDv.png";

// Add icon to payment method
function CheckoutIconLoad() {
    // Icon wrapper
    var iconHTML = `
        <div class="icon_resizer" style="height:40px; overflow:hidden;">
            <img src="${image_link}" style="width:auto; height:100%; display:block;" />
        </div>
    `;

    // Target Ecwid payment method selector
    var selector = "label.ec-radiogroup__item--app_id-" + client_id + " .ec-radiogroup__info";

    // Get the element
    var target = document.querySelector(selector);

    // Fallback: wait for element to appear
    if (!target) {
        setTimeout(CheckoutIconLoad, 300);
        return;
    }

    // Prevent duplicate icons
    if (target.innerHTML.trim() === "") {
        target.innerHTML = iconHTML;
    }
}

// Ecwid Hooks
Ecwid.OnAPILoaded.add(function () {
    Ecwid.OnPageLoaded.add(function (page) {
        if (page.type === "CHECKOUT_PAYMENT_DETAILS") {
            CheckoutIconLoad();
        }
    });
});
