
/* Mtaliii Africa — Accommodation Photo Loader */
/* Uses genuine locally saved WebP photographs */

(() => {
    "use strict";

    function applyPhoto(element) {
        const key = element.dataset.stayPhoto || "";

        // Existing card keys use "Town, Country".
        const separator = key.lastIndexOf(", ");

        if (separator === -1) return;

        const town = key.slice(0, separator).trim();
        const country = key.slice(separator + 2).trim();

        // Our accommodation registry uses "Country|Town".
        const registryKey = `${country}|${town}`;

        const photos =
            window.MTALIII_ACCOMMODATION_PHOTOS || {};

        const photoURL = photos[registryKey];

        if (!photoURL) return;

        // Avoid loading the same photograph twice.
        if (element.dataset.loadedPhoto === photoURL) {
            return;
        }

        element.dataset.loadedPhoto = photoURL;

        const image = document.createElement("img");

        image.src = photoURL;
        image.alt = `${town}, ${country} accommodation`;
        image.loading = "lazy";
        image.decoding = "async";

        image.style.width = "100%";
        image.style.height = "100%";
        image.style.objectFit = "cover";
        image.style.display = "block";

        image.onerror = () => {
            element.dataset.loadedPhoto = "";
            element.classList.add("photo-unavailable");
        };

        image.onload = () => {
            element.classList.remove("photo-unavailable");
            element.classList.add("has-local-photo");
        };

        // Replace the placeholder with the actual image.
        element.replaceChildren(image);
    }

    function updatePhotos() {
        document
            .querySelectorAll("[data-stay-photo]")
            .forEach(applyPhoto);
    }

    function initialize() {
        const container =
            document.getElementById("stayDestinations");

        if (!container) return;

        const observer = new MutationObserver(updatePhotos);

        observer.observe(container, {
            childList: true
        });

        updatePhotos();
    }

    if (document.readyState === "loading") {
        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );
    } else {
        initialize();
    }
})();
