(() => {
  "use strict";

  const photos = {
  "Mogadishu Old Town Hamar Weyne": "/images/attractions/somalia/heritage/mogadishu-old-town-hamar-weyne.webp",
  "Liido Beach": "/images/attractions/somalia/beaches/liido-beach.webp",
  "Laas Geel Rock Art": "/images/attractions/somalia/archaeology/laas-geel-rock-art.webp",
  "Berbera Coast": "/images/attractions/somalia/beaches/berbera-coast.webp",
  "Kismayo Coast": "/images/attractions/somalia/beaches/kismayo-coast.webp",
  "Zeila Historic Town": "/images/attractions/somalia/heritage/zeila-historic-town.webp"
};

  const normalize = value =>
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();

  const lookup = new Map(
    Object.entries(photos).map(([name, url]) => [normalize(name), url])
  );

  function update() {
    const cards = document.querySelectorAll(
      "article, .destination-card, .attraction-card, .country-attraction-card"
    );

    for (const card of cards) {
      const text = normalize(card.textContent);
      const match = [...lookup.entries()].find(([name]) =>
        text.includes(name)
      );

      if (!match) continue;

      const img = card.querySelector("img");
      if (!img) continue;

      const url = match[1];

      if (img.getAttribute("src") !== url) {
        img.src = url;
        img.loading = "eager";
        img.decoding = "async";
      }
    }
  }

  let scheduled = false;

  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;

    requestAnimationFrame(() => {
      scheduled = false;
      update();
    });
  });

  function start() {
    update();
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
