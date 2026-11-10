const deliveryLabels = {
  pickup: "איסוף עצמי באשדוד בתיאום מראש",
  ashdod: "משלוח חינם באשדוד",
};

const currency = new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" });
let destinationRequest;

export async function loadShippingDestinations(select, status, selected) {
  const localOptions = new Set(Object.keys(deliveryLabels));
  if (localOptions.has(selected)) select.value = selected;
  const updateStatus = () => {
    const days = select.selectedOptions[0]?.dataset.days;
    status.textContent = days
      ? `ניסיון מסירה עד ${days} ימי עסקים ממסירת החבילה לדואר. זמן ההכנה מתווסף לזמן המשלוח.`
      : select.value ? "ללא תשלום." : "";
  };
  select.addEventListener("change", updateStatus);
  updateStatus();
  destinationRequest ??= fetch("/js/israel-post-express-destinations.json").then(response => {
    if (!response.ok) throw new Error("Destinations unavailable");
    return response.json();
  }).catch(error => {
    destinationRequest = undefined;
    throw error;
  });
  const { destinations } = await destinationRequest;
  const group = document.createElement("optgroup");
  group.label = "דואר ישראל אקספרס";
  Object.keys(destinations).filter(name => name !== "אשדוד")
    .sort((first, second) => first.localeCompare(second, "he")).forEach(name => {
      const option = new Option(name, name);
      option.dataset.days = destinations[name];
      group.append(option);
    });
  select.append(group);
  if (!select.value && Object.hasOwn(destinations, selected) && selected !== "אשדוד") select.value = selected;
  updateStatus();
}

const form = document.querySelector("#order-details");
if (form) {
  const query = new URLSearchParams(location.search);
  const product = TRIKOMIK.products.find(item => item.slug === query.get("product"));
  const productName = document.querySelector("#order-product");
  if (!product || product.comingSoon || ["birth", "workshops"].includes(product.category) || !(product.price > 0)) {
    productName.textContent = "בחרו מוצר בחנות כדי להמשיך להזמנה.";
  } else {
    const now = Date.now();
    const coupon = query.get("coupon") === "TRIKO20" && !(product.originalPrice > product.price)
      && now >= Date.parse("2026-11-27T00:00:00+02:00") && now < Date.parse("2026-11-28T00:00:00+02:00");
    const price = coupon ? Math.round(product.price * 80) / 100 : product.price;
    productName.textContent = `${product.name} · ${currency.format(price)}`;
    document.querySelector("#order-back").href = `/products/${product.slug}/`;
    const destination = form.elements.delivery;
    const address = form.elements.address;
    const addressBlock = document.querySelector("#order-address");
    const status = document.querySelector("#order-delivery-status");
    const summary = document.querySelector("#order-summary");
    const updateAddress = () => {
      address.required = Boolean(destination.value && destination.value !== "pickup");
      addressBlock.hidden = !address.required;
      summary.hidden = true;
    };
    form.hidden = false;
    destination.addEventListener("change", updateAddress);
    form.addEventListener("input", () => { summary.hidden = true; });
    loadShippingDestinations(destination, status, query.get("delivery"))
      .then(updateAddress)
      .catch(() => { status.textContent = "רשימת היישובים לא נטענה. למשלוח מחוץ לאשדוד, נסו לרענן את העמוד."; });
    updateAddress();

    form.addEventListener("submit", event => {
      event.preventDefault();
      const pickup = destination.value === "pickup";
      const local = pickup || destination.value === "ashdod";
      const delivery = local ? deliveryLabels[destination.value] : `דואר ישראל אקספרס ל${destination.value}`;
      const name = form.elements.customer.value.trim();
      const phone = form.elements.phone.value.trim();
      const fullAddress = address.value.trim();
      const lines = [
        `מוצר: ${product.name} · ${currency.format(price)}`,
        `שם: ${name}`,
        `טלפון: ${phone}`,
        delivery,
        ...(pickup ? [] : [`כתובת: ${fullAddress}`]),
        local ? `סה״כ: ${currency.format(price)} · ללא דמי משלוח` : "דמי משלוח לפי משקל החבילה כולל אריזה: 67 או 73 ש״ח.",
        ...(coupon ? ["קופון TRIKO20"] : []),
      ];
      document.querySelector("#order-summary-details").textContent = lines.join("\n");
      document.querySelector("#order-send").href = TRIKOMIK.brand.whatsapp + "?text=" +
        encodeURIComponent(["היי מיכל, אשמח לתאם הזמנה מ־TrikoMik.", ...lines].join("\n"));
      summary.hidden = false;
      document.querySelector("#order-summary-heading").focus();
    });
  }
}
