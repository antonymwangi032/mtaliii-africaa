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

    function getPhoto(name) {
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
