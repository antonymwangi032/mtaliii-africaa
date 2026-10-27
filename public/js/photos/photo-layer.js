/* Mtaliii Africa - Local Photo Loading System */

(() => {
    "use strict";

    const registry = window.MTALIII_PHOTOS || {};

    const countryFiles = {
        "Kenya": "kenya.webp",
        "Tanzania": "tanzania.webp",
        "Uganda": "uganda.webp",
        "Rwanda": "rwanda.webp",
        "Burundi": "burundi.webp",
        "Democratic Republic of the Congo": "dr-congo.webp",
        "DR Congo": "dr-congo.webp",
        "South Sudan": "south-sudan.webp",
        "Somalia": "somalia.webp",
        "Ethiopia": "ethiopia.webp",
        "Djibouti": "djibouti.webp",
        "Eritrea": "eritrea.webp",
        "Seychelles": "seychelles.webp",
        "Comoros": "comoros.webp",
        "Mauritius": "mauritius.webp",
        "Madagascar": "madagascar.webp"
    };

    const capitalNames = {
        "Nairobi": "Kenya",
        "Dodoma": "Tanzania",
        "Kampala": "Uganda",
        "Kigali": "Rwanda",
        "Gitega": "Burundi",
        "Kinshasa": "Democratic Republic of the Congo",
        "Juba": "South Sudan",
        "Mogadishu": "Somalia",
        "Addis Ababa": "Ethiopia",
        "Djibouti City": "Djibouti",
        "Asmara": "Eritrea",
        "Victoria": "Seychelles",
        "Moroni": "Comoros",
        "Port Louis": "Mauritius",
        "Antananarivo": "Madagascar"
    };


    // MTALIII_TANZANIA_SET_1
    const tanzaniaSet1 = {
    "Mkomazi National Park": "/images/attractions/tanzania/parks/mkomazi-national-park.webp",
    "Udzungwa Mountains National Park": "/images/attractions/tanzania/parks/udzungwa-mountains-national-park.webp",
    "Kitulo National Park": "/images/attractions/tanzania/parks/kitulo-national-park.webp",
    "Rubondo Island National Park": "/images/attractions/tanzania/parks/rubondo-island-national-park.webp",
    "Saanane Island National Park": "/images/attractions/tanzania/parks/saanane-island-national-park.webp",
    "Burigi-Chato National Park": "/images/attractions/tanzania/parks/burigi-chato-national-park.webp",
    "Ibanda-Kyerwa National Park": "/images/attractions/tanzania/parks/ibanda-kyerwa-national-park.webp",
    "Rumanyika-Karagwe National Park": "/images/attractions/tanzania/parks/rumanyika-karagwe-national-park.webp",
    "Ugalla River National Park": "/images/attractions/tanzania/parks/ugalla-river-national-park.webp",
    "Kigosi National Park": "/images/attractions/tanzania/parks/kigosi-national-park.webp",
    "Grumeti Game Reserve": "/images/attractions/tanzania/wildlife/grumeti-game-reserve.webp",
    "Ikorongo Game Reserve": "/images/attractions/tanzania/wildlife/ikorongo-game-reserve.webp",
    "Maswa Game Reserve": "/images/attractions/tanzania/wildlife/maswa-game-reserve.webp",
    "Mwiba Wildlife Reserve": "/images/attractions/tanzania/wildlife/mwiba-wildlife-reserve.webp",
    "Lake Natron Game Controlled Area": "/images/attractions/tanzania/wildlife/lake-natron-game-controlled-area.webp",
    "Amani Nature Forest Reserve": "/images/attractions/tanzania/forests/amani-nature-forest-reserve.webp",
    "Pugu Hills Forest Reserve": "/images/attractions/tanzania/forests/pugu-hills-forest-reserve.webp",
    "Minziro Nature Forest Reserve": "/images/attractions/tanzania/forests/minziro-nature-forest-reserve.webp",
    "Mount Meru": "/images/attractions/tanzania/mountains/mount-meru.webp",
    "Usambara Mountains": "/images/attractions/tanzania/mountains/usambara-mountains.webp"
};


    // MTALIII_TANZANIA_REPAIR_START
    const mtaliiiTanzaniaPhotos = {
    "Mkomazi National Park": "/images/attractions/tanzania/parks/mkomazi-national-park.webp",
    "Udzungwa Mountains National Park": "/images/attractions/tanzania/parks/udzungwa-mountains-national-park.webp",
    "Kitulo National Park": "/images/attractions/tanzania/parks/kitulo-national-park.webp",
    "Rubondo Island National Park": "/images/attractions/tanzania/parks/rubondo-island-national-park.webp",
    "Saanane Island National Park": "/images/attractions/tanzania/parks/saanane-island-national-park.webp",
    "Burigi-Chato National Park": "/images/attractions/tanzania/parks/burigi-chato-national-park.webp",
    "Ibanda-Kyerwa National Park": "/images/attractions/tanzania/parks/ibanda-kyerwa-national-park.webp",
    "Rumanyika-Karagwe National Park": "/images/attractions/tanzania/parks/rumanyika-karagwe-national-park.webp",
    "Ugalla River National Park": "/images/attractions/tanzania/parks/ugalla-river-national-park.webp",
    "Kigosi National Park": "/images/attractions/tanzania/parks/kigosi-national-park.webp",
    "Grumeti Game Reserve": "/images/attractions/tanzania/wildlife/grumeti-game-reserve.webp",
    "Ikorongo Game Reserve": "/images/attractions/tanzania/wildlife/ikorongo-game-reserve.webp",
    "Maswa Game Reserve": "/images/attractions/tanzania/wildlife/maswa-game-reserve.webp",
    "Mwiba Wildlife Reserve": "/images/attractions/tanzania/wildlife/mwiba-wildlife-reserve.webp",
    "Lake Natron Game Controlled Area": "/images/attractions/tanzania/wildlife/lake-natron-game-controlled-area.webp",
    "Amani Nature Forest Reserve": "/images/attractions/tanzania/forests/amani-nature-forest-reserve.webp",
    "Pugu Hills Forest Reserve": "/images/attractions/tanzania/forests/pugu-hills-forest-reserve.webp",
    "Minziro Nature Forest Reserve": "/images/attractions/tanzania/forests/minziro-nature-forest-reserve.webp",
    "Mount Meru": "/images/attractions/tanzania/mountains/mount-meru.webp",
    "Usambara Mountains": "/images/attractions/tanzania/mountains/usambara-mountains.webp",
    "Uluguru Mountains": "/images/attractions/tanzania/mountains/uluguru-mountains.webp",
    "Pare Mountains": "/images/attractions/tanzania/mountains/pare-mountains.webp",
    "Mount Hanang": "/images/attractions/tanzania/mountains/mount-hanang.webp",
    "Ol Doinyo Lengai": "/images/attractions/tanzania/mountains/ol-doinyo-lengai.webp",
    "Southern Highlands Tanzania": "/images/attractions/tanzania/mountains/southern-highlands-tanzania.webp",
    "Lake Natron": "/images/attractions/tanzania/lakes/lake-natron.webp",
    "Lake Eyasi": "/images/attractions/tanzania/lakes/lake-eyasi.webp",
    "Lake Chala": "/images/attractions/tanzania/lakes/lake-chala.webp",
    "Lake Duluti": "/images/attractions/tanzania/lakes/lake-duluti.webp",
    "Lake Ngozi": "/images/attractions/tanzania/lakes/lake-ngozi.webp",
    "Lake Tanganyika": "/images/attractions/tanzania/lakes/lake-tanganyika.webp",
    "Lake Victoria": "/images/attractions/tanzania/lakes/lake-victoria.webp",
    "Kalambo Falls": "/images/attractions/tanzania/waterfalls/kalambo-falls.webp",
    "Materuni Waterfalls": "/images/attractions/tanzania/waterfalls/materuni-waterfalls.webp",
    "Sanje Waterfalls": "/images/attractions/tanzania/waterfalls/sanje-waterfalls.webp",
    "Kendwa Beach": "/images/attractions/tanzania/beaches/kendwa-beach.webp",
    "Paje Beach": "/images/attractions/tanzania/beaches/paje-beach.webp",
    "Jambiani Beach": "/images/attractions/tanzania/beaches/jambiani-beach.webp",
    "Matemwe Beach": "/images/attractions/tanzania/beaches/matemwe-beach.webp",
    "Kizimkazi": "/images/attractions/tanzania/beaches/kizimkazi.webp",
    "Changuu Island": "/images/attractions/tanzania/islands/changuu-island.webp",
    "Mnemba Atoll": "/images/attractions/tanzania/islands/mnemba-atoll.webp",
    "Pemba Island": "/images/attractions/tanzania/islands/pemba-island.webp",
    "Misali Island": "/images/attractions/tanzania/islands/misali-island.webp",
    "Bongoyo Island": "/images/attractions/tanzania/islands/bongoyo-island.webp",
    "Olduvai Gorge": "/images/attractions/tanzania/heritage/olduvai-gorge.webp",
    "Laetoli Footprint Site": "/images/attractions/tanzania/heritage/laetoli-footprint-site.webp",
    "Isimila Stone Age Site": "/images/attractions/tanzania/heritage/isimila-stone-age-site.webp",
    "National Museum of Tanzania Dar es Salaam": "/images/attractions/tanzania/museums/national-museum-of-tanzania-dar-es-salaam.webp"
};
    // MTALIII_TANZANIA_REPAIR_END

    function getPhoto(name) {
        const exactTanzaniaPhoto =
            mtaliiiTanzaniaPhotos[String(name || "").trim()];

        if (exactTanzaniaPhoto) {
            return { url: exactTanzaniaPhoto };
        }

        const tanzaniaImage = tanzaniaSet1[String(name || "").trim()];
        if (tanzaniaImage) {
            return { url: tanzaniaImage };
        }

        const key = String(name || "").trim();
        const country = capitalNames[key] || key;

        if (countryFiles[country]) {
            return {
                url: "/images/countries/" + countryFiles[country]
            };
        }

        const entry = registry[key] || registry[country];

        if (typeof entry === "string") {
            return { url: entry };
        }

        if (entry && typeof entry.url === "string") {
            return entry;
        }

        return null;
    }

    function applyPhoto(element, name) {
        if (!element) return;

        const photo = getPhoto(name);
        const key = String(name || "").trim();

        if (element.dataset.appliedPhoto === key) return;

        element.dataset.appliedPhoto = key;

        if (!photo) {
            element.classList.add("photo-unavailable");
            return;
        }

        const image = new Image();

        image.onload = () => {
            if (!element.isConnected) return;
            if (element.dataset.appliedPhoto !== key) return;

            const background = element.classList.contains("country-image")
                ? `linear-gradient(
                    to top,
                    rgba(0, 0, 0, 0.65),
                    rgba(0, 0, 0, 0) 65%
                   ),
                   url("${photo.url}") center / cover no-repeat`
                : `url("${photo.url}") center / cover no-repeat`;

            element.classList.remove("photo-unavailable");
            element.classList.add("has-local-photo");

            element.style.setProperty(
                "background",
                background,
                "important"
            );

            if (photo.credit) {
                element.title = photo.credit;
            }
        };

        image.onerror = () => {
            if (element.dataset.appliedPhoto !== key) return;

            element.classList.remove("has-local-photo");
            element.classList.add("photo-unavailable");

            element.style.removeProperty("background");
        };

        image.src = photo.url;
    }

    window.mtaliiiIllustrate = applyPhoto;

    window.mtaliiiPhotoPick = name => {
        return getPhoto(name)?.url || null;
    };

    function scanPhotos() {
        document.querySelectorAll(
            ".country-image, .exact-photo"
        ).forEach(element => {

            const name =
                element.dataset.countryPhoto ||
                element.dataset.exactPhoto;

            if (name) {
                applyPhoto(element, name);
            }
        });
    }

    function start() {
        scanPhotos();

        const observer = new MutationObserver(scanPhotos);

        observer.observe(document.body, {
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


/* ============================================
   MTALIII AFRICA
   TANZANIA ATTRACTION PHOTO DISPLAY
   ============================================ */

(function () {
    "use strict";

    const TANZANIA_PATH = "/images/attractions/tanzania/";

    function showTanzaniaPhotos() {

        const registry = window.MTALIII_PHOTOS || {};

        document.querySelectorAll(
            ".country-place .exact-photo"
        ).forEach(photo => {

            const name = photo.getAttribute("data-exact-photo");

            if (!name) return;

            const imagePath = registry[name];

            if (
                typeof imagePath !== "string" ||
                !imagePath.startsWith(TANZANIA_PATH)
            ) {
                return;
            }

            photo.style.setProperty(
                "background-image",
                `url("${imagePath}")`,
                "important"
            );

            photo.style.setProperty(
                "background-size",
                "cover",
                "important"
            );

            photo.style.setProperty(
                "background-position",
                "center",
                "important"
            );

            photo.classList.remove("photo-unavailable");
            photo.classList.add("has-local-photo");

            photo.setAttribute("role", "img");
            photo.setAttribute("aria-label", name + ", Tanzania");

        });
    }

    function startTanzaniaPhotos() {

        showTanzaniaPhotos();

        const observer = new MutationObserver(() => {
            showTanzaniaPhotos();
        });

        observer.observe(
            document.getElementById("countryPlaces") ||
            document.body,
            {
                childList: true,
                subtree: true
            }
        );
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            startTanzaniaPhotos
        );
    } else {
        startTanzaniaPhotos();
    }

})();
