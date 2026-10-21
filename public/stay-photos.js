
/* Mtaliii Africa — Optimized Accommodation Photo Loader */
/* Loads local WebP photos only when cards approach the screen. */

(() => {
    "use strict";

    const observedCards = new WeakSet();

    const photoObserver = "IntersectionObserver" in window
        ? new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                observer.unobserve(entry.target);
                applyPhoto(entry.target);
            });
        }, {
            rootMargin: "300px 0px",
            threshold: 0
        })
        : null;

    function applyPhoto(element) {
        const key = element.dataset.stayPhoto || "";
        const separator = key.lastIndexOf(", ");

        if (separator === -1) return;

        const town = key.slice(0, separator).trim();
        const country = key.slice(separator + 2).trim();
        const registryKey = `${country}|${town}`;

        const photos =
            window.MTALIII_ACCOMMODATION_PHOTOS || {};

        const photoURL = photos[registryKey];

        if (!photoURL) return;

        if (element.dataset.loadedPhoto === photoURL) {
            return;
        }

        element.dataset.loadedPhoto = photoURL;

        const image = document.createElement("img");

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

        element.replaceChildren(image);

        // Assigning src starts the actual image request.
        image.src = photoURL;
    }

    function updatePhotos() {
        document
            .querySelectorAll("[data-stay-photo]")
            .forEach(element => {
                if (observedCards.has(element)) return;

                observedCards.add(element);

                if (photoObserver) {
                    photoObserver.observe(element);
                } else {
                    applyPhoto(element);
                }
            });
    }

    function initialize() {
        const container =
            document.getElementById("stayDestinations");

        if (!container) return;

        const mutationObserver =
            new MutationObserver(updatePhotos);

        mutationObserver.observe(container, {
            childList: true,
            subtree: true
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
