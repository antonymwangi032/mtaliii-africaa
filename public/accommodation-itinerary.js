(() => {
    "use strict";

    /* ==========================================
       MTALIII AFRICA
       ACCOMMODATION ITINERARY CONTROLLER
    ========================================== */

    const STORAGE_KEY = "mtaliii-stay-planner-v2";

    const root = document.getElementById(
        "stayDestinations"
    );

    if (!root) return;

    function readPlanner() {
        try {
            const data = JSON.parse(
                localStorage.getItem(STORAGE_KEY)
            );

            return data && typeof data === "object"
                ? data
                : {};

        } catch {
            return {};
        }
    }

    function getStays() {
        const planner = readPlanner();

        return Array.isArray(planner.stays)
            ? planner.stays
            : [];
    }

    function saveStays(stays) {
        const planner = readPlanner();

        planner.stays = stays;

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(planner)
        );

        window.dispatchEvent(
            new CustomEvent(
                "mtaliii:accommodation-changed",
                {
                    detail: {
                        stays
                    }
                }
            )
        );
    }

    function today() {
        const date = new Date();

        return [
            date.getFullYear(),
            String(date.getMonth() + 1)
                .padStart(2, "0"),
            String(date.getDate())
                .padStart(2, "0")
        ].join("-");
    }

    function addDays(dateValue, days) {
        const date = new Date(
            dateValue + "T12:00:00"
        );

        date.setDate(
            date.getDate() + days
        );

        return [
            date.getFullYear(),
            String(date.getMonth() + 1)
                .padStart(2, "0"),
            String(date.getDate())
                .padStart(2, "0")
        ].join("-");
    }

    function hasStay(country, town) {
        return getStays().some(stay =>
            stay.country === country &&
            stay.town === town
        );
    }

    function toggleStay(country, town) {
        const data =
            window.MTALIII_STAY_DESTINATIONS;

        if (
            !data ||
            !Array.isArray(data[country]) ||
            !data[country].includes(town)
        ) {
            return;
        }

        const stays = getStays();

        const existing = stays.findIndex(
            stay =>
                stay.country === country &&
                stay.town === town
        );

        if (existing !== -1) {
            stays.splice(existing, 1);

        } else {
            if (stays.length >= 30) {
                alert(
                    "You can select up to 30 accommodation destinations."
                );

                return;
            }

            const latestCheckout = stays.reduce(
                (latest, stay) =>
                    stay.checkout > latest
                        ? stay.checkout
                        : latest,
                today()
            );

            stays.push({
                country,
                town,
                checkin: latestCheckout,
                checkout: addDays(
                    latestCheckout,
                    2
                )
            });
        }

        saveStays(stays);
        updateButtons();
    }

    function updateButtons() {
        root.querySelectorAll(
            "button[data-stay]"
        ).forEach(button => {
            const country =
                button.dataset.country;

            const town =
                button.dataset.stay;

            const selected =
                hasStay(country, town);

            button.textContent = selected
                ? "✓ Remove from Itinerary"
                : "+ Add to Itinerary";

            button.classList.toggle(
                "mt-stay-selected",
                selected
            );

            button.setAttribute(
                "aria-pressed",
                String(selected)
            );
        });
    }

    /* ==========================================
       PREVENT OLD BOOKING CLICK HANDLER
    ========================================== */

    root.addEventListener(
        "click",
        event => {
            const button = event.target.closest(
                "button[data-stay]"
            );

            if (!button) return;

            event.preventDefault();

            // Prevent the old stays-app.js handler
            // from opening the booking popup.
            event.stopImmediatePropagation();

            toggleStay(
                button.dataset.country,
                button.dataset.stay
            );

        },
        true
    );

    /* ==========================================
       UPDATE CARDS AFTER SEARCH/FILTER
    ========================================== */

    const observer = new MutationObserver(() => {
        updateButtons();
    });

    observer.observe(root, {
        childList: true
    });

    window.addEventListener(
        "mtaliii:accommodation-changed",
        updateButtons
    );

    updateButtons();

})();