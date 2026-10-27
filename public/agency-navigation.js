
/* ===================================================
   MTALIII AFRICA
   TOUR PARTNERS + AGENCY REGISTRATION
   =================================================== */

(() => {
    "use strict";

    const demoPartners = [
        ["Savannah Horizon Safaris", "Kenya", "Wildlife safaris"],
        ["Serengeti Trails Africa", "Tanzania", "Safari adventures"],
        ["Pearl of Africa Journeys", "Uganda", "Gorilla trekking"],
        ["Thousand Hills Adventures", "Rwanda", "Nature and culture"],
        ["Lake Tanganyika Explorers", "Burundi", "Lakes and culture"],
        ["Congo Rainforest Journeys", "DR Congo", "Forest adventures"],
        ["Nile Heritage Expeditions", "South Sudan", "Culture and heritage"],
        ["Horn of Africa Discoveries", "Somalia", "Coastal experiences"],
        ["Abyssinia Heritage Tours", "Ethiopia", "Historical journeys"],
        ["Red Sea Horizon Travel", "Djibouti", "Marine adventures"],
        ["Asmara Heritage Travel", "Eritrea", "City and culture"],
        ["Island Paradise Journeys", "Seychelles", "Island holidays"],
        ["Comoros Ocean Escapes", "Comoros", "Beaches and islands"],
        ["Mauritius Blue Lagoon Tours", "Mauritius", "Luxury island holidays"],
        ["Madagascar Nature Trails", "Madagascar", "Wildlife and nature"]
    ];

    function revealSection(id) {
        const section = document.getElementById(id);

        if (!section) {
            console.error("Missing section:", id);
            return;
        }

        section.hidden = false;
        section.removeAttribute("hidden");

        section.style.removeProperty("display");
        section.style.removeProperty("visibility");

        requestAnimationFrame(() => {
            section.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    }

    function renderDemoPartners() {
        const container = document.getElementById("demoAgents");

        if (!container) return;

        // Preserve any existing demonstration content.
        if (container.dataset.mtDemoRendered === "true") {
            return;
        }

        const grid = document.createElement("div");
        grid.className = "agencygrid";

        demoPartners.forEach(([name, country, specialty]) => {
            const card = document.createElement("article");
            card.className = "agency-demo-card";

            const heading = document.createElement("h3");
            heading.textContent = name;

            const location = document.createElement("p");
            location.textContent = country;

            const description = document.createElement("p");
            description.textContent = specialty;

            const label = document.createElement("small");
            label.textContent =
                "Fictional example · Not verified · Not bookable";

            card.append(
                heading,
                location,
                description,
                label
            );

            grid.appendChild(card);
        });

        container.replaceChildren(grid);
        container.dataset.mtDemoRendered = "true";
    }

    function initialize() {
        renderDemoPartners();

        // Show the registration form by default.
        const register = document.getElementById("register");

        if (register) {
            register.hidden = false;
            register.removeAttribute("hidden");
        }

        // Handle both header and footer navigation.
        document.addEventListener("click", event => {
            const link = event.target.closest(
                'a[href="#register"], a[href="#agencies"]'
            );

            if (!link) return;

            event.preventDefault();

            const target = link.getAttribute("href").slice(1);

            history.pushState(null, "", "#" + target);

            revealSection(target);
        });

        function handleLocation() {
            const target = location.hash.slice(1);

            if (target === "register" || target === "agencies") {
                revealSection(target);
            }
        }

        window.addEventListener("hashchange", handleLocation);

        if (
            location.hash === "#register" ||
            location.hash === "#agencies"
        ) {
            setTimeout(handleLocation, 100);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initialize);
    } else {
        initialize();
    }
})();
