(() => {
    "use strict";

    /*
    ============================================
    MTALIII AFRICA
    SHARED TOUR ITINERARY FIX

    Works with:
    - app.js
    - region-app.js
    - journey-planner.js
    - accommodation-itinerary.js

    Keeps selected attractions after refresh.
    Does not remove accommodation selections.
    ============================================
    */

    const STORAGE_KEY = "mtaliii-tour-itinerary-v1";

    const TOUR_DATES_KEY = "mtaliii-tour-dates-v1";

    const COUNTRY_DEFAULT = "Kenya";

    /*
    ============================================
    STORAGE HELPERS
    ============================================
    */

    function readJSON(key, fallback) {
        try {
            const value = JSON.parse(
                localStorage.getItem(key)
            );

            return value ?? fallback;

        } catch (error) {
            console.warn(
                "Mtaliii: Unable to read saved data:",
                key
            );

            return fallback;
        }
    }

    function writeJSON(key, value) {
        try {
            localStorage.setItem(
                key,
                JSON.stringify(value)
            );

            return true;

        } catch (error) {
            console.error(
                "Mtaliii: Unable to save itinerary.",
                error
            );

            return false;
        }
    }

    /*
    ============================================
    DESTINATION NORMALIZATION
    ============================================
    */

    function normalizeDestination(destination) {
        if (
            !destination ||
            typeof destination !== "object"
        ) {
            return null;
        }

        const name = String(
            destination.name ||
            destination.title ||
            ""
        ).trim();

        if (!name) return null;

        return {
            name,

            country: String(
                destination.country ||
                COUNTRY_DEFAULT
            ).trim(),

            location: String(
                destination.location ||
                destination.county ||
                destination.region ||
                destination.town ||
                ""
            ).trim(),

            category: String(
                destination.category ||
                destination.type ||
                ""
            ).trim()
        };
    }

    function destinationKey(destination) {
        const item = normalizeDestination(
            destination
        );

        if (!item) return "";

        return [
            item.name,
            item.country,
            item.location
        ]
            .map(value => value.toLowerCase())
            .join("::");
    }

    /*
    ============================================
    GET SAVED TOUR DESTINATIONS
    ============================================
    */

    function getTours() {
        const saved = readJSON(
            STORAGE_KEY,
            []
        );

        if (!Array.isArray(saved)) {
            return [];
        }

        const unique = new Map();

        saved.forEach(destination => {
            const item = normalizeDestination(
                destination
            );

            if (!item) return;

            unique.set(
                destinationKey(item),
                item
            );
        });

        return [...unique.values()];
    }

    /*
    ============================================
    SAVE TOUR DESTINATIONS
    ============================================
    */

    function saveTours(tours) {
        if (!Array.isArray(tours)) {
            return false;
        }

        const unique = new Map();

        tours.forEach(destination => {
            const item = normalizeDestination(
                destination
            );

            if (!item) return;

            unique.set(
                destinationKey(item),
                item
            );
        });

        const updated = [...unique.values()];

        if (!writeJSON(STORAGE_KEY, updated)) {
            return false;
        }

        window.dispatchEvent(
            new CustomEvent(
                "mtaliii:tour-itinerary-changed",
                {
                    detail: {
                        destinations: updated
                    }
                }
            )
        );

        updateTourButtons();

        updateTourCount();

        return true;
    }

    /*
    ============================================
    CHECK WHETHER A TOUR IS SELECTED
    ============================================
    */

    function hasTour(destination) {
        const key = destinationKey(
            destination
        );

        if (!key) return false;

        return getTours().some(
            item =>
                destinationKey(item) === key
        );
    }

    /*
    ============================================
    ADD A TOUR
    ============================================
    */

    function addTour(destination) {
        const item = normalizeDestination(
            destination
        );

        if (!item) return false;

        const tours = getTours();

        if (hasTour(item)) {
            return true;
        }

        tours.push(item);

        return saveTours(tours);
    }

    /*
    ============================================
    REMOVE A TOUR
    ============================================
    */

    function removeTour(destination) {
        const key = destinationKey(
            destination
        );

        if (!key) return false;

        const tours = getTours().filter(
            item =>
                destinationKey(item) !== key
        );

        const saved = saveTours(tours);

        if (!saved) return false;

        /*
        Remove the date for this attraction only.
        Do not remove dates for other attractions.
        */

        const dates = readJSON(
            TOUR_DATES_KEY,
            {}
        );

        if (
            dates &&
            typeof dates === "object" &&
            !Array.isArray(dates)
        ) {
            const item = normalizeDestination(
                destination
            );

            const dateKey = [
                item.name,
                item.country,
                item.location
            ].join("::");

            delete dates[dateKey];

            writeJSON(
                TOUR_DATES_KEY,
                dates
            );
        }

        return true;
    }

    /*
    ============================================
    TOGGLE TOUR SELECTION
    ============================================
    */

    function toggleTour(destination) {
        const item = normalizeDestination(
            destination
        );

        if (!item) return false;

        if (hasTour(item)) {
            return removeTour(item);
        }

        return addTour(item);
    }

    /*
    ============================================
    UPDATE TOUR BUTTONS
    ============================================
    */

    function updateTourButtons() {
        const buttons = document.querySelectorAll(
            "[data-mtaliii-tour]"
        );

        buttons.forEach(button => {
            let destination;

            try {
                destination = JSON.parse(
                    button.dataset.mtaliiiTour
                );

            } catch {
                return;
            }

            const selected = hasTour(
                destination
            );

            button.textContent = selected
                ? "✓ Remove from Itinerary"
                : "+ Add to Itinerary";

            button.classList.toggle(
                "mt-tour-selected",
                selected
            );

            button.setAttribute(
                "aria-pressed",
                String(selected)
            );
        });
    }

    /*
    ============================================
    UPDATE ITINERARY COUNTS
    ============================================
    */

    function updateTourCount() {
        const count = getTours().length;

        document.querySelectorAll(
            "[data-mtaliii-tour-count]"
        ).forEach(element => {
            element.textContent = String(
                count
            );
        });

        const tripField = document.getElementById(
            "tripDestinations"
        );

        if (tripField) {
            tripField.value = getTours()
                .map(item => item.name)
                .join(", ");
        }
    }

    /*
    ============================================
    BUTTON CLICK HANDLING
    ============================================
    */

    document.addEventListener(
        "click",
        event => {
            const button = event.target.closest(
                "[data-mtaliii-tour]"
            );

            if (!button) return;

            let destination;

            try {
                destination = JSON.parse(
                    button.dataset.mtaliiiTour
                );

            } catch {
                return;
            }

            event.preventDefault();

            toggleTour(destination);
        }
    );

    /*
    ============================================
    STORAGE SYNCHRONIZATION
    ============================================
    */

    window.addEventListener(
        "storage",
        event => {
            if (
                event.key !== STORAGE_KEY &&
                event.key !== TOUR_DATES_KEY
            ) {
                return;
            }

            updateTourButtons();

            updateTourCount();
        }
    );

    window.addEventListener(
        "mtaliii:tour-itinerary-changed",
        () => {
            updateTourButtons();

            updateTourCount();
        }
    );

    /*
    ============================================
    EXPOSE SHARED TOUR FUNCTIONS
    ============================================
    */

    window.MtaliiiTourItinerary = {
        getTours,
        saveTours,
        addTour,
        removeTour,
        toggleTour,
        hasTour,
        normalizeDestination,
        destinationKey,
        updateTourButtons
    };

    /*
    ============================================
    INITIALIZE
    ============================================
    */

    function initialize() {
        updateTourButtons();

        updateTourCount();
    }

    if (
        document.readyState === "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            { once: true }
        );

    } else {
        initialize();
    }

})();
