
(function () {
  "use strict";

  const photos = {
"pian-upe-wildlife-reserve": "/images/attractions/uganda/parks/pian-upe-wildlife-reserve.webp",
"ssese-islands": "/images/attractions/uganda/islands/ssese-islands.webp",
  "bwindi-impenetrable-national-park": "/images/attractions/uganda/bwindi-impenetrable-national-park.webp",
  "entebbe-botanical-gardens": "/images/attractions/uganda/entebbe-botanical-gardens.webp",
  "bigodi-wetland-sanctuary": "/images/attractions/uganda/forests/bigodi-wetland-sanctuary.webp",
  "budongo-forest-reserve": "/images/attractions/uganda/forests/budongo-forest-reserve.webp",
  "echuya-central-forest-reserve": "/images/attractions/uganda/forests/echuya-central-forest-reserve.webp",
  "kalinzu-central-forest-reserve": "/images/attractions/uganda/forests/kalinzu-central-forest-reserve.webp",
  "kasyoha-kitomi-forest-reserve": "/images/attractions/uganda/forests/kasyoha-kitomi-forest-reserve.webp",
  "lutoboka-central-forest-reserve": "/images/attractions/uganda/forests/lutoboka-central-forest-reserve.webp",
  "mabira-central-forest-reserve": "/images/attractions/uganda/forests/mabira-central-forest-reserve.webp",
  "maramagambo-forest": "/images/attractions/uganda/forests/maramagambo-forest.webp",
  "mpanga-central-forest-reserve": "/images/attractions/uganda/forests/mpanga-central-forest-reserve.webp",
  "zika-forest": "/images/attractions/uganda/forests/zika-forest.webp",
  "amabere-ga-nyina-mwiru": "/images/attractions/uganda/heritage/amabere-ga-nyina-mwiru.webp",
  "kasubi-tombs": "/images/attractions/uganda/heritage/kasubi-tombs.webp",
  "namugongo-martyrs-shrine": "/images/attractions/uganda/heritage/namugongo-martyrs-shrine.webp",
  "nyero-rock-paintings": "/images/attractions/uganda/heritage/nyero-rock-paintings.webp",
  "uganda-museum": "/images/attractions/uganda/heritage/uganda-museum.webp",
  "uganda-national-mosque": "/images/attractions/uganda/heritage/uganda-national-mosque.webp",
  "buggala-island": "/images/attractions/uganda/islands/buggala-island.webp",
  "bulago-island": "/images/attractions/uganda/islands/bulago-island.webp",
  "ngamba-island-chimpanzee-sanctuary": "/images/attractions/uganda/islands/ngamba-island-chimpanzee-sanctuary.webp",
  "kibale-national-park": "/images/attractions/uganda/kibale-national-park.webp",
  "kidepo-valley-national-park": "/images/attractions/uganda/kidepo-valley-national-park.webp",
  "lake-bunyonyi": "/images/attractions/uganda/lake-bunyonyi.webp",
  "lake-mburo-national-park": "/images/attractions/uganda/lake-mburo-national-park.webp",
  "lake-albert": "/images/attractions/uganda/lakes/lake-albert.webp",
  "lake-edward": "/images/attractions/uganda/lakes/lake-edward.webp",
  "lake-george": "/images/attractions/uganda/lakes/lake-george.webp",
  "lake-kyoga": "/images/attractions/uganda/lakes/lake-kyoga.webp",
  "lake-mutanda": "/images/attractions/uganda/lakes/lake-mutanda.webp",
  "lake-nkuruba": "/images/attractions/uganda/lakes/lake-nkuruba.webp",
  "lake-nyinambuga": "/images/attractions/uganda/lakes/lake-nyinambuga.webp",
  "lake-wamala": "/images/attractions/uganda/lakes/lake-wamala.webp",
  "mgahinga-gorilla-national-park": "/images/attractions/uganda/mgahinga-gorilla-national-park.webp",
  "kagulu-hill": "/images/attractions/uganda/mountains/kagulu-hill.webp",
  "mount-gahinga": "/images/attractions/uganda/mountains/mount-gahinga.webp",
  "mount-kadam": "/images/attractions/uganda/mountains/mount-kadam.webp",
  "mount-moroto": "/images/attractions/uganda/mountains/mount-moroto.webp",
  "mount-muhavura": "/images/attractions/uganda/mountains/mount-muhavura.webp",
  "mount-napak": "/images/attractions/uganda/mountains/mount-napak.webp",
  "mount-sabyinyo": "/images/attractions/uganda/mountains/mount-sabyinyo.webp",
  "wanale-ridge": "/images/attractions/uganda/mountains/wanale-ridge.webp",
  "murchison-falls-national-park": "/images/attractions/uganda/murchison-falls-national-park.webp",
  "mount-elgon-national-park": "/images/attractions/uganda/parks/mount-elgon-national-park.webp",
  "queen-elizabeth-national-park": "/images/attractions/uganda/queen-elizabeth-national-park.webp",
  "rwenzori-mountains-national-park": "/images/attractions/uganda/rwenzori-mountains-national-park.webp",
  "semuliki-national-park": "/images/attractions/uganda/semuliki-national-park.webp",
  "sipi-falls": "/images/attractions/uganda/sipi-falls.webp",
  "source-of-the-nile-jinja": "/images/attractions/uganda/source-of-the-nile-jinja.webp",
  "aruu-falls": "/images/attractions/uganda/waterfalls/aruu-falls.webp",
  "itanda-falls": "/images/attractions/uganda/waterfalls/itanda-falls.webp",
  "karuma-falls": "/images/attractions/uganda/waterfalls/karuma-falls.webp",
  "sezibwa-falls": "/images/attractions/uganda/waterfalls/sezibwa-falls.webp",
  "ajai-wildlife-reserve": "/images/attractions/uganda/wildlife/ajai-wildlife-reserve.webp",
  "bokora-corridor-wildlife-reserve": "/images/attractions/uganda/wildlife/bokora-corridor-wildlife-reserve.webp",
  "bugungu-wildlife-reserve": "/images/attractions/uganda/wildlife/bugungu-wildlife-reserve.webp",
  "kabwoya-wildlife-reserve": "/images/attractions/uganda/wildlife/kabwoya-wildlife-reserve.webp",
  "katonga-wildlife-reserve": "/images/attractions/uganda/wildlife/katonga-wildlife-reserve.webp",
  "kigezi-wildlife-reserve": "/images/attractions/uganda/wildlife/kigezi-wildlife-reserve.webp",
  "matheniko-wildlife-reserve": "/images/attractions/uganda/wildlife/matheniko-wildlife-reserve.webp",
  "toro-semliki-wildlife-reserve": "/images/attractions/uganda/wildlife/toro-semliki-wildlife-reserve.webp",
  "ziwa-rhino-sanctuary": "/images/attractions/uganda/ziwa-rhino-sanctuary.webp"
};

  function slug(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function update() {
    document.querySelectorAll(
      ".exact-photo[data-exact-photo]"
    ).forEach(function (card) {
      const name = card.getAttribute("data-exact-photo");
      const url = photos[slug(name)];

      if (!url) return;

      if (card.dataset.ugandaLoaded === url) return;

      const image = new Image();

      image.onload = function () {
        card.style.setProperty(
          "background-image",
          'url("' + url + '")',
          "important"
        );

        card.style.setProperty(
          "background-size",
          "cover",
          "important"
        );

        card.style.setProperty(
          "background-position",
          "center",
          "important"
        );

        const waiting = card.querySelector(".waiting-photo");

        if (waiting) waiting.remove();

        card.dataset.ugandaLoaded = url;
      };

      image.onerror = function () {
        console.warn("Uganda image failed:", url);
      };

      image.src = url;
    });
  }

  function start() {
    update();

    new MutationObserver(update).observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
