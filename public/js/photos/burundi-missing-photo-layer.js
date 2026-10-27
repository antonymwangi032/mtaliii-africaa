
(function () {
  "use strict";

  const photos = {"bujumbura-lake-beaches":"/images/attractions/burundi/beaches/bujumbura-lake-beaches.webp","saga-beach":"/images/attractions/burundi/beaches/saga-beach.webp","busekera-cultural-village":"/images/attractions/burundi/culture/busekera-cultural-village.webp","kirundo-intore-dance-heritage":"/images/attractions/burundi/culture/kirundo-intore-dance-heritage.webp","makamba-agasimbo-dance-heritage":"/images/attractions/burundi/culture/makamba-agasimbo-dance-heritage.webp","mugamba-traditional-huts":"/images/attractions/burundi/culture/mugamba-traditional-huts.webp","rubumba-cultural-village":"/images/attractions/burundi/culture/rubumba-cultural-village.webp","bururi-forest-nature-reserve":"/images/attractions/burundi/forests/bururi-forest-nature-reserve.webp","kigwena-forest-reserve":"/images/attractions/burundi/forests/kigwena-forest-reserve.webp","vyanda-forest-reserve":"/images/attractions/burundi/forests/vyanda-forest-reserve.webp","bukeye-church":"/images/attractions/burundi/heritage/bukeye-church.webp","bukeye-royal-palace-site":"/images/attractions/burundi/heritage/bukeye-royal-palace-site.webp","gishora-drum-sanctuary":"/images/attractions/burundi/heritage/gishora-drum-sanctuary.webp","igisumanyenzi-caves":"/images/attractions/burundi/heritage/igisumanyenzi-caves.webp","independence-monument-bujumbura":"/images/attractions/burundi/heritage/independence-monument-bujumbura.webp","kayanza-belgian-cemetery":"/images/attractions/burundi/heritage/kayanza-belgian-cemetery.webp","kayanza-royal-tombs-inganzo":"/images/attractions/burundi/heritage/kayanza-royal-tombs-inganzo.webp","kiganda-treaty-site":"/images/attractions/burundi/heritage/kiganda-treaty-site.webp","living-museum-of-bujumbura":"/images/attractions/burundi/heritage/living-museum-of-bujumbura.webp","livingstone-stanley-monument":"/images/attractions/burundi/heritage/livingstone-stanley-monument.webp","mpotsa-queen-mothers-tombs":"/images/attractions/burundi/heritage/mpotsa-queen-mothers-tombs.webp","muramvya-royal-palace-site":"/images/attractions/burundi/heritage/muramvya-royal-palace-site.webp","national-museum-of-gitega":"/images/attractions/burundi/heritage/national-museum-of-gitega.webp","nyakazu-german-fault":"/images/attractions/burundi/heritage/nyakazu-german-fault.webp","nyakazu-nkoma-natural-monument":"/images/attractions/burundi/heritage/nyakazu-nkoma-natural-monument.webp","prince-louis-rwagasore-mausoleum":"/images/attractions/burundi/heritage/prince-louis-rwagasore-mausoleum.webp","unity-monument-bujumbura":"/images/attractions/burundi/heritage/unity-monument-bujumbura.webp","lake-cohoha":"/images/attractions/burundi/lakes/lake-cohoha.webp","lake-rweru":"/images/attractions/burundi/lakes/lake-rweru.webp","lake-rwihinda":"/images/attractions/burundi/lakes/lake-rwihinda.webp","lake-tanganyika-bujumbura":"/images/attractions/burundi/lakes/lake-tanganyika-bujumbura.webp","nyanza-lac-fishing-shore":"/images/attractions/burundi/lakes/nyanza-lac-fishing-shore.webp","rumonge-lakeshore":"/images/attractions/burundi/lakes/rumonge-lakeshore.webp","bujumbura-central-market-area":"/images/attractions/burundi/markets/bujumbura-central-market-area.webp","bujumbura-craft-market":"/images/attractions/burundi/markets/bujumbura-craft-market.webp","mount-heha":"/images/attractions/burundi/mountains/mount-heha.webp","gitega-royal-landscapes":"/images/attractions/burundi/nature/gitega-royal-landscapes.webp","rwegura-dam":"/images/attractions/burundi/nature/rwegura-dam.webp","rwegura-tea-plantations":"/images/attractions/burundi/nature/rwegura-tea-plantations.webp","teza-tea-plantations":"/images/attractions/burundi/nature/teza-tea-plantations.webp","kibira-national-park":"/images/attractions/burundi/parks/kibira-national-park.webp","rusizi-national-park":"/images/attractions/burundi/parks/rusizi-national-park.webp","ruvubu-national-park":"/images/attractions/burundi/parks/ruvubu-national-park.webp","rusizi-river-delta":"/images/attractions/burundi/rivers/rusizi-river-delta.webp","ruvubu-river-valley":"/images/attractions/burundi/rivers/ruvubu-river-valley.webp","source-of-the-nile-rutovu":"/images/attractions/burundi/rivers/source-of-the-nile-rutovu.webp","kayanza-thermal-springs":"/images/attractions/burundi/springs/kayanza-thermal-springs.webp","mugara-hot-springs":"/images/attractions/burundi/springs/mugara-hot-springs.webp","muyange-hot-springs":"/images/attractions/burundi/springs/muyange-hot-springs.webp","ruhwa-hot-springs":"/images/attractions/burundi/springs/ruhwa-hot-springs.webp","bujumbura-city":"/images/attractions/burundi/towns/bujumbura-city.webp","bururi-town":"/images/attractions/burundi/towns/bururi-town.webp","gitega-city":"/images/attractions/burundi/towns/gitega-city.webp","kirundo-town":"/images/attractions/burundi/towns/kirundo-town.webp","muyinga-town":"/images/attractions/burundi/towns/muyinga-town.webp","ngozi-town":"/images/attractions/burundi/towns/ngozi-town.webp","agasumo-ka-mwaro-waterfall":"/images/attractions/burundi/waterfalls/agasumo-ka-mwaro-waterfall.webp","karera-waterfalls":"/images/attractions/burundi/waterfalls/karera-waterfalls.webp","kibimbi-and-siguvyaye-waterfalls":"/images/attractions/burundi/waterfalls/kibimbi-and-siguvyaye-waterfalls.webp","ku-mahoro-waterfall":"/images/attractions/burundi/waterfalls/ku-mahoro-waterfall.webp"};

  function slug(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[\u2018\u2019']/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function update() {
    document.querySelectorAll(".country-place").forEach(card => {
      if (!/burundi/i.test(card.textContent || "")) return;

      const heading = [...card.querySelectorAll("h2,h3,h4")]
        .find(h => photos[slug(h.textContent)]);

      if (!heading) return;

      const url = photos[slug(heading.textContent)];

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
          /illustrative destination photo/i.test(el.textContent || "")
        );

      if (!placeholder) return;

      const container = placeholder.parentElement;
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
        zIndex: "20"
      });

      container.appendChild(img);
    });
  }

  let scheduled = false;

  function schedule() {
    if (scheduled) return;
    scheduled = true;

    requestAnimationFrame(() => {
      scheduled = false;
      update();
    });
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", schedule);
  else schedule();

  new MutationObserver(schedule).observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
