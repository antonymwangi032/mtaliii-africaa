
(function () {
  "use strict";

  const API = "/api/offers";
  const REFRESH_MS = 5 * 60 * 1000;

  let offers = [];
  let opened = false;

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = String(text);
    return node;
  }

  // MTALIII_WILDLIFE_FALLBACK_V1
  const DEFAULT_WILDLIFE_IMAGE =
    "/images/offers/default-wildlife.jpg";


  // MTALIII_DESTINATION_IMAGES_V1
  function offerImage(offer) {
    if (validImage(offer.imageUrl)) {
      return offer.imageUrl;
    }

    const destination = (
      String(offer.destinations || "") + " " +
      String(offer.title || "")
    ).toLowerCase();

    if (destination.includes("nakuru")) {
      return "/images/attractions/kenya/parks/lake-nakuru-national-park.webp";
    }

    return "/images/hero/maasai-mara.webp";
  }

  function validImage(value) {
    if (typeof value !== "string") return false;
    try {
      const url = new URL(value, window.location.href);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }

  function money(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return "Price on enquiry";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2
    }).format(amount);
  }

  function active(offer) {
    if (!offer || offer.status !== "approved") return false;

    const today = new Date().toISOString().slice(0, 10);

    if (
      offer.validFrom &&
      String(offer.validFrom).slice(0, 10) > today
    ) return false;

    if (
      offer.validUntil &&
      String(offer.validUntil).slice(0, 10) < today
    ) return false;

    return true;
  }

  const root = element("div", "mt-offers-root");
  root.id = "mt-smart-offers";

  const trigger = element("button", "mt-offers-trigger");
  trigger.type = "button";
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", "mt-offers-panel");

  const triggerIcon = element("span", "mt-offers-trigger-icon", "✦");
  const triggerText = element("span", "", "Special Offers");
  const counter = element("span", "mt-offers-counter", "0");

  trigger.append(triggerIcon, triggerText, counter);

  const panel = element("section", "mt-offers-panel");
  panel.id = "mt-offers-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "false");
  panel.setAttribute("aria-label", "Available travel offers");
  panel.hidden = true;

  const header = element("div", "mt-offers-header");
  const headingWrap = element("div");
  const eyebrow = element(
    "div",
    "mt-offers-eyebrow",
    "MTALIII AFRICA"
  );
  const heading = element(
    "h2",
    "",
    "Exclusive Travel Offers"
  );
  const subtitle = element(
    "p",
    "",
    "Africa is calling. Travel beautifully."
  );

  headingWrap.append(eyebrow, heading, subtitle);

  const close = element("button", "mt-offers-close", "×");
  close.type = "button";
  close.setAttribute("aria-label", "Close travel offers");

  header.append(headingWrap, close);

  const list = element("div", "mt-offers-list");

  const footer = element(
    "div",
    "mt-offers-footer",
    "Packages are subject to availability. Enquiries are not confirmed bookings."
  );

  panel.append(header, list, footer);
  root.append(trigger, panel);

  function setOpen(value) {
    opened = Boolean(value) && offers.length > 0;
    panel.hidden = !opened;
    trigger.setAttribute("aria-expanded", String(opened));
    root.classList.toggle("mt-offers-open", opened);
  }


  // MTALIII_OFFER_DETAILS_WHATSAPP_V1
  const WHATSAPP_NUMBER = "254715767638";

  function whatsappUrl(offer) {
    const message = [
      "Hello Mtaliii Africa,",
      "",
      "I am interested in this travel package:",
      "",
      "Package: " + (offer.title || "Tour package"),
      "Destination: " + (offer.destinations || "Africa"),
      "Duration: " + (offer.duration || "To be confirmed"),
      "Travellers: " + (offer.people || "To be confirmed"),
      "Price: " + money(offer.price),
      "Provider: " + (offer.company || "Mtaliii Africa"),
      "",
      "Please share availability and booking details.",
      "Thank you."
    ].join("\n");

    return "https://wa.me/" + WHATSAPP_NUMBER +
      "?text=" + encodeURIComponent(message);
  }

  function enquire(offer) {
    window.open(
      whatsappUrl(offer),
      "_blank",
      "noopener,noreferrer"
    );
  }

  function explore(offer) {
    const existing = document.getElementById(
      "mt-offers-detail-overlay"
    );

    if (existing) existing.remove();

    const overlay = element(
      "div",
      "mt-offers-detail-overlay"
    );

    overlay.id = "mt-offers-detail-overlay";

    const modal = element(
      "div",
      "mt-offers-detail-modal"
    );

    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute(
      "aria-label",
      offer.title || "Tour package details"
    );

    const closeButton = element(
      "button",
      "mt-offers-detail-close",
      "×"
    );

    closeButton.type = "button";
    closeButton.setAttribute(
      "aria-label",
      "Close package details"
    );

    function closeDetails() {
      overlay.remove();
      document.removeEventListener(
        "keydown",
        onEscape
      );
    }

    function onEscape(event) {
      if (event.key === "Escape") closeDetails();
    }

    closeButton.addEventListener(
      "click",
      closeDetails
    );

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) {
        closeDetails();
      }
    });

    document.addEventListener(
      "keydown",
      onEscape
    );

    const media = element(
      "div",
      "mt-offers-detail-media"
    );

    if (validImage(offerImage(offer))) {
      const image = document.createElement("img");
      image.src = offerImage(offer);
      image.alt = offer.title || "African travel package";
      image.onerror = function () {
        media.textContent = "Discover Africa";
        media.classList.add("mt-offers-no-image");
      };
      media.appendChild(image);
    } else {
      media.classList.add("mt-offers-no-image");
      media.textContent = "Discover Africa";
    }

    const body = element(
      "div",
      "mt-offers-detail-body"
    );

    const provider = element(
      "div",
      "mt-offers-provider",
      offer.company || "Mtaliii Africa"
    );

    const title = element(
      "h2",
      "mt-offers-detail-title",
      offer.title || "African travel package"
    );

    const destination = element(
      "p",
      "mt-offers-detail-destination",
      "⌖ " + (offer.destinations || "Africa")
    );

    const facts = element(
      "div",
      "mt-offers-detail-facts"
    );

    if (offer.duration) {
      facts.appendChild(
        element("span", "", "◷ " + offer.duration)
      );
    }

    if (offer.people) {
      facts.appendChild(
        element(
          "span",
          "",
          "♙ " + offer.people + " travellers"
        )
      );
    }

    const description = element(
      "p",
      "mt-offers-detail-description",
      offer.description || ""
    );

    const priceLabel = element(
      "div",
      "mt-offers-detail-price-label",
      "Package price"
    );

    const price = element(
      "strong",
      "mt-offers-detail-price",
      money(offer.price)
    );

    const whatsapp = element(
      "a",
      "mt-offers-detail-whatsapp",
      "Enquire on WhatsApp →"
    );

    whatsapp.href = whatsappUrl(offer);
    whatsapp.target = "_blank";
    whatsapp.rel = "noopener noreferrer";

    const priceRow = element(
      "div",
      "mt-offers-detail-price-row"
    );

    priceRow.append(
      price,
      whatsapp
    );

    const note = element(
      "p",
      "mt-offers-detail-note",
      "Enquiries are subject to availability and do not confirm a booking."
    );

    body.append(
      provider,
      title,
      destination,
      facts,
      description,
      priceLabel,
      priceRow,
      note
    );

    modal.append(
      closeButton,
      media,
      body
    );

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    closeButton.focus();
  }

  function createCard(offer) {
    const card = element("article", "mt-offers-card");

    const media = element("div", "mt-offers-media");

    if (validImage(offerImage(offer))) {
      const image = document.createElement("img");
      image.src = offerImage(offer);
      image.alt = offer.destinations || offer.title || "African tour";
      image.loading = "eager";
      image.referrerPolicy = "no-referrer";
      image.onerror = function () {
        image.remove();
        media.classList.add("mt-offers-no-image");
        media.textContent = "Discover Africa";
      };
      media.appendChild(image);
    } else {
      media.classList.add("mt-offers-no-image");
      media.textContent = "Discover Africa";
    }

    const content = element("div", "mt-offers-content");

    const provider = element(
      "div",
      "mt-offers-provider",
      offer.company || "Mtaliii Africa"
    );

    const title = element(
      "h3",
      "",
      offer.title || "African travel experience"
    );

    const destination = element(
      "p",
      "mt-offers-destination",
      "⌖ " + (offer.destinations || "Africa")
    );

    const details = element("div", "mt-offers-details");

    if (offer.duration) {
      details.appendChild(
        element("span", "", "◷ " + offer.duration)
      );
    }

    if (offer.people) {
      details.appendChild(
        element(
          "span",
          "",
          "♙ " + offer.people +
          (Number(offer.people) === 1 ? " traveller" : " travellers")
        )
      );
    }

    const description = element(
      "p",
      "mt-offers-description",
      offer.description || ""
    );

    const bottom = element("div", "mt-offers-bottom");
    const price = element(
      "strong",
      "mt-offers-price",
      money(offer.price)
    );

    const button = element(
      "button",
      "mt-offers-enquire",
      "Explore Package →"
    );

    button.type = "button";
    button.addEventListener("click", function () {
      explore(offer);
    });

    bottom.append(price, button);

    content.append(
      provider,
      title,
      destination,
      details,
      description,
      bottom
    );

    card.append(media, content);
    return card;
  }

  function render() {
    counter.textContent = String(offers.length);
    root.hidden = offers.length === 0;

    if (!offers.length) {
      setOpen(false);
      list.replaceChildren();
      return;
    }

    list.replaceChildren(...offers.map(createCard));
  }

  async function refresh() {
    try {
      const response = await fetch(API, {
        headers: { Accept: "application/json" },
        cache: "no-store"
      });

      if (!response.ok) throw new Error("HTTP " + response.status);

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid offers response");
      }

      offers = data.filter(active);
      render();
    } catch (error) {
      console.warn("Mtaliii offers could not be loaded:", error.message);
      offers = [];
      render();
    }
  }

  trigger.addEventListener("click", function () {
    setOpen(!opened);
  });

  close.addEventListener("click", function () {
    setOpen(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && opened) {
      setOpen(false);
      trigger.focus();
    }
  });

  document.addEventListener("click", function (event) {
    if (opened && !root.contains(event.target)) {
      setOpen(false);
    }
  });

  function start() {
    document.body.appendChild(root);
    root.hidden = true;
    refresh();
    setInterval(refresh, REFRESH_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
