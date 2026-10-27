
(function () {
  "use strict";

  const photos = {"congo-nile-trail":"/images/attractions/rwanda/adventure/congo-nile-trail.webp","bujumbura-lake-beaches":"/images/attractions/rwanda/lakes/bujumbura-lake-beaches.webp","saga-beach":"/images/attractions/rwanda/lakes/saga-beach.webp","busekera-cultural-village":"/images/attractions/rwanda/culture/busekera-cultural-village.webp","kirundo-intore-dance-heritage":"/images/attractions/rwanda/culture/kirundo-intore-dance-heritage.webp","makamba-agasimbo-dance-heritage":"/images/attractions/rwanda/culture/makamba-agasimbo-dance-heritage.webp","mugamba-traditional-huts":"/images/attractions/rwanda/culture/mugamba-traditional-huts.webp","rubumba-cultural-village":"/images/attractions/rwanda/culture/rubumba-cultural-village.webp","buhanga-eco-park":"/images/attractions/rwanda/forests/buhanga-eco-park.webp","bururi-forest-nature-reserve":"/images/attractions/rwanda/forests/bururi-forest-nature-reserve.webp","cyamudongo-forest":"/images/attractions/rwanda/forests/cyamudongo-forest.webp","gisakura-forest-area":"/images/attractions/rwanda/forests/gisakura-forest-area.webp","gishwati-forest":"/images/attractions/rwanda/forests/gishwati-forest.webp","kigwena-forest-reserve":"/images/attractions/rwanda/forests/kigwena-forest-reserve.webp","mukura-forest":"/images/attractions/rwanda/forests/mukura-forest.webp","vyanda-forest-reserve":"/images/attractions/rwanda/forests/vyanda-forest-reserve.webp","bisesero-genocide-memorial":"/images/attractions/rwanda/heritage/bisesero-genocide-memorial.webp","bukeye-church":"/images/attractions/rwanda/heritage/bukeye-church.webp","bukeye-royal-palace-site":"/images/attractions/rwanda/heritage/bukeye-royal-palace-site.webp","campaign-against-genocide-museum":"/images/attractions/rwanda/heritage/campaign-against-genocide-museum.webp","dian-fossey-tomb-and-karisoke-research-site":"/images/attractions/rwanda/heritage/dian-fossey-tomb-and-karisoke-research-site.webp","ethnographic-museum-huye":"/images/attractions/rwanda/heritage/ethnographic-museum-huye.webp","gorilla-guardians-village":"/images/attractions/rwanda/heritage/gorilla-guardians-village.webp","igisumanyenzi-caves":"/images/attractions/rwanda/heritage/igisumanyenzi-caves.webp","independence-monument-bujumbura":"/images/attractions/rwanda/heritage/independence-monument-bujumbura.webp","inema-arts-center":"/images/attractions/rwanda/heritage/inema-arts-center.webp","kayanza-belgian-cemetery":"/images/attractions/rwanda/heritage/kayanza-belgian-cemetery.webp","kayanza-royal-tombs-inganzo":"/images/attractions/rwanda/heritage/kayanza-royal-tombs-inganzo.webp","kibeho-pilgrimage-site":"/images/attractions/rwanda/heritage/kibeho-pilgrimage-site.webp","kigali-genocide-memorial":"/images/attractions/rwanda/heritage/kigali-genocide-memorial.webp","kiganda-treaty-site":"/images/attractions/rwanda/heritage/kiganda-treaty-site.webp","kimironko-market":"/images/attractions/rwanda/heritage/kimironko-market.webp","kings-palace-museum-nyanza":"/images/attractions/rwanda/heritage/kings-palace-museum-nyanza.webp","living-museum-of-bujumbura":"/images/attractions/rwanda/heritage/living-museum-of-bujumbura.webp","mpotsa-queen-mothers-tombs":"/images/attractions/rwanda/heritage/mpotsa-queen-mothers-tombs.webp","murambi-genocide-memorial":"/images/attractions/rwanda/heritage/murambi-genocide-memorial.webp","muramvya-royal-palace-site":"/images/attractions/rwanda/heritage/muramvya-royal-palace-site.webp","musanze-caves":"/images/attractions/rwanda/heritage/musanze-caves.webp","national-museum-of-gitega":"/images/attractions/rwanda/heritage/national-museum-of-gitega.webp","ntarama-genocide-memorial":"/images/attractions/rwanda/heritage/ntarama-genocide-memorial.webp","nyakazu-german-fault":"/images/attractions/rwanda/heritage/nyakazu-german-fault.webp","nyakazu-nkoma-natural-monument":"/images/attractions/rwanda/heritage/nyakazu-nkoma-natural-monument.webp","nyamata-genocide-memorial":"/images/attractions/rwanda/heritage/nyamata-genocide-memorial.webp","nyamirambo-women-s-center":"/images/attractions/rwanda/heritage/nyamirambo-women-s-center.webp","prince-louis-rwagasore-mausoleum":"/images/attractions/rwanda/heritage/prince-louis-rwagasore-mausoleum.webp","rwanda-art-museum":"/images/attractions/rwanda/heritage/rwanda-art-museum.webp","unity-monument-bujumbura":"/images/attractions/rwanda/heritage/unity-monument-bujumbura.webp","amahoro-island":"/images/attractions/rwanda/islands/amahoro-island.webp","napoleon-island":"/images/attractions/rwanda/islands/napoleon-island.webp","nkombo-island":"/images/attractions/rwanda/islands/nkombo-island.webp","nyamirundi-island":"/images/attractions/rwanda/islands/nyamirundi-island.webp","lake-burera":"/images/attractions/rwanda/lakes/lake-burera.webp","lake-cohoha":"/images/attractions/rwanda/lakes/lake-cohoha.webp","lake-cyohoha-south":"/images/attractions/rwanda/lakes/lake-cyohoha-south.webp","lake-ihema":"/images/attractions/rwanda/lakes/lake-ihema.webp","lake-kivu":"/images/attractions/rwanda/lakes/lake-kivu.webp","lake-mugesera":"/images/attractions/rwanda/lakes/lake-mugesera.webp","lake-muhazi":"/images/attractions/rwanda/lakes/lake-muhazi.webp","lake-ruhondo":"/images/attractions/rwanda/lakes/lake-ruhondo.webp","lake-rwanyakazinga":"/images/attractions/rwanda/lakes/lake-rwanyakazinga.webp","lake-rweru":"/images/attractions/rwanda/lakes/lake-rweru.webp","lake-rwihinda":"/images/attractions/rwanda/lakes/lake-rwihinda.webp","lake-sake":"/images/attractions/rwanda/lakes/lake-sake.webp","lake-shakani":"/images/attractions/rwanda/lakes/lake-shakani.webp","nyanza-lac-fishing-shore":"/images/attractions/rwanda/lakes/nyanza-lac-fishing-shore.webp","ruhwa-hot-springs":"/images/attractions/rwanda/springs/ruhwa-hot-springs.webp","rumonge-lakeshore":"/images/attractions/rwanda/lakes/rumonge-lakeshore.webp","bujumbura-central-market-area":"/images/attractions/rwanda/markets/bujumbura-central-market-area.webp","bujumbura-craft-market":"/images/attractions/rwanda/markets/bujumbura-craft-market.webp","gitega-city":"/images/attractions/rwanda/towns/gitega-city.webp","mount-bigugu":"/images/attractions/rwanda/mountains/mount-bigugu.webp","mount-bisoke":"/images/attractions/rwanda/mountains/mount-bisoke.webp","mount-gahinga":"/images/attractions/rwanda/mountains/mount-gahinga.webp","mount-heha":"/images/attractions/rwanda/mountains/mount-heha.webp","mount-huye":"/images/attractions/rwanda/mountains/mount-huye.webp","mount-karisimbi":"/images/attractions/rwanda/mountains/mount-karisimbi.webp","mount-kigali":"/images/attractions/rwanda/mountains/mount-kigali.webp","mount-muhabura":"/images/attractions/rwanda/mountains/mount-muhabura.webp","mount-sabyinyo":"/images/attractions/rwanda/mountains/mount-sabyinyo.webp","gitega-royal-landscapes":"/images/attractions/rwanda/nature/gitega-royal-landscapes.webp","kamiranzovu-swamp":"/images/attractions/rwanda/nature/kamiranzovu-swamp.webp","nyandungu-eco-park":"/images/attractions/rwanda/nature/nyandungu-eco-park.webp","nyungwe-canopy-walkway":"/images/attractions/rwanda/nature/nyungwe-canopy-walkway.webp","rugezi-marsh":"/images/attractions/rwanda/nature/rugezi-marsh.webp","rwegura-dam":"/images/attractions/rwanda/nature/rwegura-dam.webp","rwegura-tea-plantations":"/images/attractions/rwanda/nature/rwegura-tea-plantations.webp","teza-tea-plantations":"/images/attractions/rwanda/nature/teza-tea-plantations.webp","akagera-national-park":"/images/attractions/rwanda/parks/akagera-national-park.webp","gishwati-mukura-national-park":"/images/attractions/rwanda/parks/gishwati-mukura-national-park.webp","nyungwe-national-park":"/images/attractions/rwanda/parks/nyungwe-national-park.webp","volcanoes-national-park":"/images/attractions/rwanda/parks/volcanoes-national-park.webp","rusizi-river-delta":"/images/attractions/rwanda/rivers/rusizi-river-delta.webp","ruvubu-river-valley":"/images/attractions/rwanda/rivers/ruvubu-river-valley.webp","kayanza-thermal-springs":"/images/attractions/rwanda/springs/kayanza-thermal-springs.webp","mugara-hot-springs":"/images/attractions/rwanda/springs/mugara-hot-springs.webp","muyange-hot-springs":"/images/attractions/rwanda/springs/muyange-hot-springs.webp","bururi-town":"/images/attractions/rwanda/towns/bururi-town.webp","karongi":"/images/attractions/rwanda/towns/karongi.webp","kigali-city":"/images/attractions/rwanda/towns/kigali-city.webp","kirundo-town":"/images/attractions/rwanda/towns/kirundo-town.webp","musanze-town":"/images/attractions/rwanda/towns/musanze-town.webp","muyinga-town":"/images/attractions/rwanda/towns/muyinga-town.webp","ngozi-town":"/images/attractions/rwanda/towns/ngozi-town.webp","rubavu":"/images/attractions/rwanda/towns/rubavu.webp","rusizi-town":"/images/attractions/rwanda/towns/rusizi-town.webp","agasumo-ka-mwaro-waterfall":"/images/attractions/rwanda/waterfalls/agasumo-ka-mwaro-waterfall.webp","kamiranzovu-waterfall":"/images/attractions/rwanda/waterfalls/kamiranzovu-waterfall.webp","kibimbi-and-siguvyaye-waterfalls":"/images/attractions/rwanda/waterfalls/kibimbi-and-siguvyaye-waterfalls.webp","ku-mahoro-waterfall":"/images/attractions/rwanda/waterfalls/ku-mahoro-waterfall.webp","umusambi-village":"/images/attractions/rwanda/waterfalls/umusambi-village.webp","nyamirambo-womens-center":"/images/attractions/rwanda/heritage/nyamirambo-women-s-center.webp"};

  function slug(value) {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function apply() {
    const cards = document.querySelectorAll(".country-place");

    cards.forEach(card => {
      const heading = card.querySelector("h2,h3,h4");
      if (!heading) return;

      const name = heading.textContent.trim();
      const url = photos[slug(name)];
      if (!url) return;

      // Do not modify cards belonging to another country.
      if (!/rwanda/i.test(card.textContent || "")) return;

      const existing = card.querySelector("img");

      if (existing) {
        if (existing.getAttribute("src") !== url) {
          existing.src = url;
          existing.removeAttribute("srcset");
          existing.removeAttribute("sizes");
        }
        return;
      }

      const placeholder = Array.from(card.querySelectorAll("*"))
        .find(el =>
          el.children.length === 0 &&
          /illustrative destination photo/i.test(el.textContent || "")
        );

      if (!placeholder) return;

      const container = placeholder.parentElement;
      if (!container) return;

      container.style.position = "relative";
      container.style.overflow = "hidden";

      let image = container.querySelector("img[data-rwanda-fixed]");

      if (!image) {
        image = document.createElement("img");
        image.dataset.rwandaFixed = "true";
        image.alt = name;
        image.loading = "eager";
        image.decoding = "async";

        Object.assign(image.style, {
          position: "absolute",
          inset: "0",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
          zIndex: "10"
        });

        container.appendChild(image);
      }

      if (image.getAttribute("src") !== url)
        image.src = url;
    });
  }

  let pending = false;

  function schedule() {
    if (pending) return;
    pending = true;

    requestAnimationFrame(() => {
      pending = false;
      apply();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule);
  } else {
    schedule();
  }

  new MutationObserver(schedule).observe(
    document.documentElement,
    { childList: true, subtree: true }
  );
})();
