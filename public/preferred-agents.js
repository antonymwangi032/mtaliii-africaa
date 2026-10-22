
/* =====================================================
   MTALIII AFRICA — PREFERRED TOUR PARTNER
   Adds partner selection to the Plan My Visit popup.
   ===================================================== */

(() => {
    "use strict";

    const SAMPLE_AGENCIES = [
        "Savannah Horizon Safaris",
        "Serengeti Trails Africa",
        "Pearl of Africa Journeys",
        "Thousand Hills Adventures",
        "Lake Tanganyika Explorers",
        "Congo Rainforest Journeys",
        "Nile Heritage Expeditions",
        "Horn of Africa Discoveries",
        "Abyssinia Heritage Tours",
        "Red Sea Horizon Travel",
        "Asmara Heritage Travel",
        "Island Paradise Journeys",
        "Comoros Ocean Escapes",
        "Mauritius Blue Lagoon Tours",
        "Madagascar Nature Trails"
    ];

    const FIELD_ID = "mtPreferredTourPartner";
    const FIELD_WRAPPER_ID = "mtPreferredPartnerField";

    function collectPartners() {
        const partners = new Map();

        // Demonstration partners are clearly labelled.
        SAMPLE_AGENCIES.forEach(name => {
            partners.set(name.toLowerCase(), {
                name,
                sample: true
            });
        });

        // Read partner names already displayed by the
        // existing approved-agency listing.
        const agencyList = document.getElementById("agencyList");

        if (agencyList) {
            agencyList.querySelectorAll(
                "article h3, .agency-card h3, .agencycard h3"
            ).forEach(heading => {
                const name = heading.textContent.trim();

                if (!name) return;

                partners.set(name.toLowerCase(), {
                    name,
                    sample: false
                });
            });
        }

        return Array.from(partners.values());
    }

    function createOption(value, label) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = label;
        return option;
    }

    function updateOptions(select) {
        const selected = select.value || "Our Mtaliii";

        select.replaceChildren();

        select.appendChild(
            createOption(
                "Our Mtaliii",
                "Our Mtaliii — Mtaliii Africa"
            )
        );

        collectPartners().forEach(partner => {
            select.appendChild(
                createOption(
                    partner.name,
                    partner.sample
                        ? partner.name + " (demonstration only)"
                        : partner.name
                )
            );
        });

        const stillExists = Array.from(select.options)
            .some(option => option.value === selected);

        select.value = stillExists
            ? selected
            : "Our Mtaliii";
    }

    function createField() {
        const wrapper = document.createElement("div");
        wrapper.id = FIELD_WRAPPER_ID;
        wrapper.className = "mt-preferred-partner";

        const label = document.createElement("label");
        label.htmlFor = FIELD_ID;
        label.textContent = "Choose my preferred tour partner";

        const select = document.createElement("select");
        select.id = FIELD_ID;
        select.name = "preferredAgent";

        updateOptions(select);

        const description = document.createElement("small");
        description.textContent =
            "Our Mtaliii is the default. Demonstration " +
            "partners are not verified or available for booking.";

        wrapper.append(label, select, description);

        return wrapper;
    }

    function findPlanner() {
        // The shared journey planner can have different
        // wrapper IDs depending on the project version.
        const candidates = [
            "#journeyPlanner",
            "#journeyPlannerModal",
            "#mtaliiiJourneyPlanner",
            "#visitPlanner",
            "#plannerModal",
            '[role="dialog"]'
        ];

        for (const selector of candidates) {
            const element = document.querySelector(selector);

            if (
                element &&
                element.textContent.includes("Plan My Visit")
            ) {
                return element;
            }
        }

        // Fallback: find a popup containing the title.
        const headings = document.querySelectorAll(
            "h1, h2, h3"
        );

        for (const heading of headings) {
            if (
                heading.textContent.trim()
                    .toLowerCase() === "plan my visit"
            ) {
                return heading.closest(
                    '[role="dialog"], .modal, .planner-modal, .overlay'
                ) || heading.parentElement.parentElement;
            }
        }

        return null;
    }

    function installField() {
        const planner = findPlanner();

        if (!planner) return;

        if (
            planner.querySelector(
                "#" + FIELD_WRAPPER_ID
            )
        ) {
            return;
        }

        const field = createField();

        const contactHeading = Array.from(
            planner.querySelectorAll(
                "h2, h3, h4, legend"
            )
        ).find(element =>
            element.textContent.trim()
                .toLowerCase() === "contact details"
        );

        if (contactHeading) {
            contactHeading.before(field);
        } else {
            const form = planner.querySelector("form");

            if (form) {
                form.prepend(field);
            } else {
                planner.appendChild(field);
            }
        }
    }

    function syncAllDropdowns() {
        const preferredSelect =
            document.getElementById(FIELD_ID);

        if (preferredSelect) {
            updateOptions(preferredSelect);
        }

        // Preserve the existing trip form's partner selector.
        const tripPartnerSelect =
            document.getElementById("partnerSelect");

        if (tripPartnerSelect) {
            const selected = tripPartnerSelect.value;

            const known = new Set(
                Array.from(tripPartnerSelect.options)
                    .map(option => option.textContent.trim())
            );

            collectPartners().forEach(partner => {
                const label = partner.sample
                    ? partner.name + " (demonstration only)"
                    : partner.name;

                if (known.has(label)) return;

                tripPartnerSelect.appendChild(
                    createOption(partner.name, label)
                );
            });

            if (selected) {
                tripPartnerSelect.value = selected;
            }
        }
    }

    function initialize() {
        let scheduled = false;

        function scheduleRefresh() {
            if (scheduled) return;

            scheduled = true;

            requestAnimationFrame(() => {
                scheduled = false;
                installField();
                syncAllDropdowns();
            });
        }

        // The popup may be created only when clicked.
        const observer = new MutationObserver(scheduleRefresh);

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        document.addEventListener(
            "click",
            scheduleRefresh
        );

        scheduleRefresh();
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
