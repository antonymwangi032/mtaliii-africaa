
(function () {
  "use strict";

  const photos = {
  "jambiani-beach": "/images/attractions/tanzania/beaches/jambiani-beach.webp",
  "kendwa-beach": "/images/attractions/tanzania/beaches/kendwa-beach.webp",
  "kizimkazi": "/images/attractions/tanzania/beaches/kizimkazi.webp",
  "matemwe-beach": "/images/attractions/tanzania/beaches/matemwe-beach.webp",
  "nungwi-beach": "/images/attractions/tanzania/beaches/nungwi-beach.webp",
  "paje-beach": "/images/attractions/tanzania/beaches/paje-beach.webp",
  "minziro-nature-forest-reserve": "/images/attractions/tanzania/forests/minziro-nature-forest-reserve.webp",
  "pugu-hills-forest-reserve": "/images/attractions/tanzania/forests/pugu-hills-forest-reserve.webp",
  "isimila-stone-age-site": "/images/attractions/tanzania/heritage/isimila-stone-age-site.webp",
  "kilwa-kisiwani": "/images/attractions/tanzania/heritage/kilwa-kisiwani.webp",
  "laetoli-footprint-site": "/images/attractions/tanzania/heritage/laetoli-footprint-site.webp",
  "olduvai-gorge": "/images/attractions/tanzania/heritage/olduvai-gorge.webp",
  "stone-town-zanzibar": "/images/attractions/tanzania/heritage/stone-town-zanzibar.webp",
  "bongoyo-island": "/images/attractions/tanzania/islands/bongoyo-island.webp",
  "changuu-island": "/images/attractions/tanzania/islands/changuu-island.webp",
  "misali-island": "/images/attractions/tanzania/islands/misali-island.webp",
  "mnemba-atoll": "/images/attractions/tanzania/islands/mnemba-atoll.webp",
  "pemba-island": "/images/attractions/tanzania/islands/pemba-island.webp",
  "lake-chala": "/images/attractions/tanzania/lakes/lake-chala.webp",
  "lake-duluti": "/images/attractions/tanzania/lakes/lake-duluti.webp",
  "lake-eyasi": "/images/attractions/tanzania/lakes/lake-eyasi.webp",
  "lake-natron": "/images/attractions/tanzania/lakes/lake-natron.webp",
  "lake-ngozi": "/images/attractions/tanzania/lakes/lake-ngozi.webp",
  "lake-tanganyika": "/images/attractions/tanzania/lakes/lake-tanganyika.webp",
  "lake-victoria": "/images/attractions/tanzania/lakes/lake-victoria.webp",
  "mount-hanang": "/images/attractions/tanzania/mountains/mount-hanang.webp",
  "mount-meru": "/images/attractions/tanzania/mountains/mount-meru.webp",
  "ol-doinyo-lengai": "/images/attractions/tanzania/mountains/ol-doinyo-lengai.webp",
  "pare-mountains": "/images/attractions/tanzania/mountains/pare-mountains.webp",
  "southern-highlands-tanzania": "/images/attractions/tanzania/mountains/southern-highlands-tanzania.webp",
  "uluguru-mountains": "/images/attractions/tanzania/mountains/uluguru-mountains.webp",
  "usambara-mountains": "/images/attractions/tanzania/mountains/usambara-mountains.webp",
  "national-museum-of-tanzania-dar-es-salaam": "/images/attractions/tanzania/museums/national-museum-of-tanzania-dar-es-salaam.webp",
  "arusha-national-park": "/images/attractions/tanzania/parks/arusha-national-park.webp",
  "burigi-chato-national-park": "/images/attractions/tanzania/parks/burigi-chato-national-park.webp",
  "gombe-stream-national-park": "/images/attractions/tanzania/parks/gombe-stream-national-park.webp",
  "ibanda-kyerwa-national-park": "/images/attractions/tanzania/parks/ibanda-kyerwa-national-park.webp",
  "katavi-national-park": "/images/attractions/tanzania/parks/katavi-national-park.webp",
  "kigosi-national-park": "/images/attractions/tanzania/parks/kigosi-national-park.webp",
  "kitulo-national-park": "/images/attractions/tanzania/parks/kitulo-national-park.webp",
  "lake-manyara-national-park": "/images/attractions/tanzania/parks/lake-manyara-national-park.webp",
  "mafia-island-marine-park": "/images/attractions/tanzania/parks/mafia-island-marine-park.webp",
  "mahale-mountains-national-park": "/images/attractions/tanzania/parks/mahale-mountains-national-park.webp",
  "mikumi-national-park": "/images/attractions/tanzania/parks/mikumi-national-park.webp",
  "mkomazi-national-park": "/images/attractions/tanzania/parks/mkomazi-national-park.webp",
  "mount-kilimanjaro-national-park": "/images/attractions/tanzania/parks/mount-kilimanjaro-national-park.webp",
  "ngorongoro-conservation-area": "/images/attractions/tanzania/parks/ngorongoro-conservation-area.webp",
  "nyerere-national-park": "/images/attractions/tanzania/parks/nyerere-national-park.webp",
  "ruaha-national-park": "/images/attractions/tanzania/parks/ruaha-national-park.webp",
  "rubondo-island-national-park": "/images/attractions/tanzania/parks/rubondo-island-national-park.webp",
  "rumanyika-karagwe-national-park": "/images/attractions/tanzania/parks/rumanyika-karagwe-national-park.webp",
  "saadani-national-park": "/images/attractions/tanzania/parks/saadani-national-park.webp",
  "saanane-island-national-park": "/images/attractions/tanzania/parks/saanane-island-national-park.webp",
  "serengeti-national-park": "/images/attractions/tanzania/parks/serengeti-national-park.webp",
  "tarangire-national-park": "/images/attractions/tanzania/parks/tarangire-national-park.webp",
  "udzungwa-mountains-national-park": "/images/attractions/tanzania/parks/udzungwa-mountains-national-park.webp",
  "ugalla-river-national-park": "/images/attractions/tanzania/parks/ugalla-river-national-park.webp",
  "kalambo-falls": "/images/attractions/tanzania/waterfalls/kalambo-falls.webp",
  "materuni-waterfalls": "/images/attractions/tanzania/waterfalls/materuni-waterfalls.webp",
  "sanje-waterfalls": "/images/attractions/tanzania/waterfalls/sanje-waterfalls.webp",
  "grumeti-game-reserve": "/images/attractions/tanzania/wildlife/grumeti-game-reserve.webp",
  "ikorongo-game-reserve": "/images/attractions/tanzania/wildlife/ikorongo-game-reserve.webp",
  "lake-natron-game-controlled-area": "/images/attractions/tanzania/wildlife/lake-natron-game-controlled-area.webp",
  "maswa-game-reserve": "/images/attractions/tanzania/wildlife/maswa-game-reserve.webp",
  "mwiba-wildlife-reserve": "/images/attractions/tanzania/wildlife/mwiba-wildlife-reserve.webp"
};

  function slug(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function update() {
    document.querySelectorAll(".country-place").forEach(card => {
      const heading = card.querySelector("h2,h3,h4");

      if (!heading) return;

      const url = photos[slug(heading.textContent)];

      if (!url) return;

      let img = card.querySelector("img");

      if (img) {
        if (img.getAttribute("src") !== url) {
          img.src = url;
          img.removeAttribute("srcset");
          img.removeAttribute("sizes");
        }
        return;
      }

      const placeholder = [...card.querySelectorAll("*")]
        .find(el =>
          el.children.length === 0 &&
          /illustrative destination photo/i.test(
            el.textContent || ""
          )
        );

      let container = placeholder?.parentElement;

      if (!container) {
        container = [...card.querySelectorAll("div")]
          .find(el => {
            const rect = el.getBoundingClientRect();
            const style = getComputedStyle(el);

            return rect.width > 150 &&
              rect.height > 120 &&
              style.backgroundImage !== "none";
          });
      }

      if (!container) return;

      container.style.position = "relative";
      container.style.overflow = "hidden";

      img = document.createElement("img");

      img.src = url;
      img.alt = heading.textContent.trim();
      img.loading = "eager";
      img.decoding = "async";

      Object.assign(img.style, {
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "block",
        zIndex: "2"
      });

      container.appendChild(img);
    });
  }

  let pending = false;

  function schedule() {
    if (pending) return;

    pending = true;

    requestAnimationFrame(() => {
      pending = false;
      update();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule);
  } else {
    schedule();
  }

  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
