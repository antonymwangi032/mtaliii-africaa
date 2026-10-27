
(function () {
  "use strict";
  const photos = {"bigodi-wetland-sanctuary":"/images/attractions/uganda/forests/bigodi-wetland-sanctuary.webp","budongo-forest-reserve":"/images/attractions/uganda/forests/budongo-forest-reserve.webp","echuya-central-forest-reserve":"/images/attractions/uganda/forests/echuya-central-forest-reserve.webp","kalinzu-central-forest-reserve":"/images/attractions/uganda/forests/kalinzu-central-forest-reserve.webp","kasyoha-kitomi-forest-reserve":"/images/attractions/uganda/forests/kasyoha-kitomi-forest-reserve.webp","lutoboka-central-forest-reserve":"/images/attractions/uganda/forests/lutoboka-central-forest-reserve.webp","mabira-central-forest-reserve":"/images/attractions/uganda/forests/mabira-central-forest-reserve.webp","maramagambo-forest":"/images/attractions/uganda/forests/maramagambo-forest.webp","mpanga-central-forest-reserve":"/images/attractions/uganda/forests/mpanga-central-forest-reserve.webp","zika-forest":"/images/attractions/uganda/forests/zika-forest.webp","entebbe-botanical-gardens":"/images/attractions/uganda/gardens/entebbe-botanical-gardens.webp","amabere-ga-nyina-mwiru":"/images/attractions/uganda/heritage/amabere-ga-nyina-mwiru.webp","kasubi-tombs":"/images/attractions/uganda/heritage/kasubi-tombs.webp","namugongo-martyrs-shrine":"/images/attractions/uganda/heritage/namugongo-martyrs-shrine.webp","nyero-rock-paintings":"/images/attractions/uganda/heritage/nyero-rock-paintings.webp","uganda-museum":"/images/attractions/uganda/heritage/uganda-museum.webp","uganda-national-mosque":"/images/attractions/uganda/heritage/uganda-national-mosque.webp","buggala-island":"/images/attractions/uganda/islands/buggala-island.webp","bulago-island":"/images/attractions/uganda/islands/bulago-island.webp","ngamba-island-chimpanzee-sanctuary":"/images/attractions/uganda/islands/ngamba-island-chimpanzee-sanctuary.webp","ssese-islands":"/images/attractions/uganda/islands/ssese-islands.webp","lake-albert":"/images/attractions/uganda/lakes/lake-albert.webp","lake-edward":"/images/attractions/uganda/lakes/lake-edward.webp","lake-george":"/images/attractions/uganda/lakes/lake-george.webp","lake-kyoga":"/images/attractions/uganda/lakes/lake-kyoga.webp","lake-mutanda":"/images/attractions/uganda/lakes/lake-mutanda.webp","lake-nkuruba":"/images/attractions/uganda/lakes/lake-nkuruba.webp","lake-nyinambuga":"/images/attractions/uganda/lakes/lake-nyinambuga.webp","lake-wamala":"/images/attractions/uganda/lakes/lake-wamala.webp","kagulu-hill":"/images/attractions/uganda/mountains/kagulu-hill.webp","mount-gahinga":"/images/attractions/uganda/mountains/mount-gahinga.webp","mount-kadam":"/images/attractions/uganda/mountains/mount-kadam.webp","mount-moroto":"/images/attractions/uganda/mountains/mount-moroto.webp","mount-muhavura":"/images/attractions/uganda/mountains/mount-muhavura.webp","mount-napak":"/images/attractions/uganda/mountains/mount-napak.webp","mount-sabyinyo":"/images/attractions/uganda/mountains/mount-sabyinyo.webp","wanale-ridge":"/images/attractions/uganda/mountains/wanale-ridge.webp","bwindi-impenetrable-national-park":"/images/attractions/uganda/parks/bwindi-impenetrable-national-park.webp","kibale-national-park":"/images/attractions/uganda/parks/kibale-national-park.webp","kidepo-valley-national-park":"/images/attractions/uganda/parks/kidepo-valley-national-park.webp","mgahinga-gorilla-national-park":"/images/attractions/uganda/parks/mgahinga-gorilla-national-park.webp","mount-elgon-national-park":"/images/attractions/uganda/parks/mount-elgon-national-park.webp","murchison-falls-national-park":"/images/attractions/uganda/parks/murchison-falls-national-park.webp","pian-upe-wildlife-reserve":"/images/attractions/uganda/parks/pian-upe-wildlife-reserve.webp","queen-elizabeth-national-park":"/images/attractions/uganda/parks/queen-elizabeth-national-park.webp","rwenzori-mountains-national-park":"/images/attractions/uganda/parks/rwenzori-mountains-national-park.webp","semuliki-national-park":"/images/attractions/uganda/parks/semuliki-national-park.webp","source-of-the-nile-jinja":"/images/attractions/uganda/rivers/source-of-the-nile-jinja.webp","aruu-falls":"/images/attractions/uganda/waterfalls/aruu-falls.webp","itanda-falls":"/images/attractions/uganda/waterfalls/itanda-falls.webp","karuma-falls":"/images/attractions/uganda/waterfalls/karuma-falls.webp","sezibwa-falls":"/images/attractions/uganda/waterfalls/sezibwa-falls.webp","sipi-falls":"/images/attractions/uganda/waterfalls/sipi-falls.webp","ajai-wildlife-reserve":"/images/attractions/uganda/wildlife/ajai-wildlife-reserve.webp","bokora-corridor-wildlife-reserve":"/images/attractions/uganda/wildlife/bokora-corridor-wildlife-reserve.webp","bugungu-wildlife-reserve":"/images/attractions/uganda/wildlife/bugungu-wildlife-reserve.webp","kabwoya-wildlife-reserve":"/images/attractions/uganda/wildlife/kabwoya-wildlife-reserve.webp","katonga-wildlife-reserve":"/images/attractions/uganda/wildlife/katonga-wildlife-reserve.webp","kigezi-wildlife-reserve":"/images/attractions/uganda/wildlife/kigezi-wildlife-reserve.webp","matheniko-wildlife-reserve":"/images/attractions/uganda/wildlife/matheniko-wildlife-reserve.webp","toro-semliki-wildlife-reserve":"/images/attractions/uganda/wildlife/toro-semliki-wildlife-reserve.webp","ziwa-rhino-sanctuary":"/images/attractions/uganda/wildlife/ziwa-rhino-sanctuary.webp"};

  function slug(s) {
    return String(s || "").normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function apply() {
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

      const placeholder = [...card.querySelectorAll("*")].find(el =>
        el.children.length === 0 &&
        /illustrative destination photo/i.test(el.textContent || "")
      );

      if (!placeholder || !placeholder.parentElement) return;

      const container = placeholder.parentElement;
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
      apply();
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
