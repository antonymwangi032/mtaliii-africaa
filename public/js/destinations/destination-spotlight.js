
/* MTALIII AFRICA — DESTINATION SPOTLIGHT
   Connect Kenya + all 15 country collections.
   Preserve existing photo and country systems.
*/
(() => {
    "use strict";

    const $ = id => document.getElementById(id);
    const search = $("search");
    const country = $("county");
    const category = $("category");
    const results = $("results");
    const count = $("count");
    const reset = $("reset");
    const more = $("loadMore");

    if (!search || !country || !category ||
        !results || !count || !reset || !more) return;

    if (typeof REGION_COUNTRIES === "undefined") {
        console.error("REGION_COUNTRIES is not loaded.");
        return;
    }

    const escapeHTML = value =>
        String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[char]));

    const classify = name => {
        const n = name.toLowerCase();

        if (/museum|heritage|old town|historic|palace|monument|archaeological|church|medina|rock art|sanctuary of drums|cultural/.test(n))
            return "Culture & heritage";

        if (/beach|island|atoll|marine|coast|bay|lagoon|île|anse/.test(n))
            return "Beaches & islands";

        if (/lake|river|falls|waterfall|wetland|nile|sudd/.test(n))
            return "Lakes, rivers & waterfalls";

        if (/mount|mountain|volcano|highland|tsingy|gorge|cave|depression/.test(n))
            return "Mountains & adventure";

        if (/forest|botanical|garden|rainforest/.test(n))
            return "Forests & nature";

        if (/national park|reserve|conservancy|rhino|gorilla|wildlife/.test(n))
            return "Wildlife & safari";

        return "Nature & experiences";
    };

    const directory = [];
    const seen = new Set();

    function add(entry) {
        const name = String(entry.name || "").trim();
        const nation = String(entry.country || "").trim();

        if (!name || !nation) return;

        const key = nation.toLowerCase() + "|" + name.toLowerCase();

        if (seen.has(key)) return;
        seen.add(key);

        directory.push({
            name,
            country: nation,
            county: entry.county || "",
            category: entry.category || classify(name)
        });
    }

    // Full original Kenya directory.
    if (typeof DESTINATIONS !== "undefined" &&
        Array.isArray(DESTINATIONS)) {

        DESTINATIONS.forEach(d => add({
            name: d.name,
            country: "Kenya",
            county: d.county,
            category: d.category
        }));
    }

    // All 15 country attraction collections.
    REGION_COUNTRIES.forEach(c => {
        (c.places || []).forEach(name => add({
            name,
            country: c.name
        }));
    });

    const countries = REGION_COUNTRIES.map(c => c.name);
    const experiences = [...new Set(
        directory.map(d => d.category).filter(Boolean)
    )].sort();

    function populate(select, label, values) {
        select.replaceChildren(new Option(label, ""));

        values.forEach(value => {
            select.add(new Option(value, value));
        });
    }

    populate(country, "All 15 countries", countries);
    populate(category, "All experiences", experiences);

    // Stop the old Kenya-only filters from replacing our results.
    search.oninput = null;
    country.onchange = null;
    category.onchange = null;
    reset.onclick = null;
    more.onclick = null;

    let limit = 12;

    // Keep itinerary selections separate from the old card renderer.
    const selected = new Set();

    const tripField = $("tripDestinations");

    function syncItinerary() {
        if (!tripField) return;

        tripField.value = [...selected].join(", ");
        tripField.dispatchEvent(new Event("input", {
            bubbles: true
        }));
    }

    function photoFor(name) {
        const registry = window.MTALIII_PHOTOS || {};
        return registry[name] || "";
    }

    function matches() {
        const query = search.value.trim().toLowerCase();

        return directory.filter(d => {
            const text = [
                d.name,
                d.country,
                d.county,
                d.category
            ].join(" ").toLowerCase();

            return (!query || text.includes(query)) &&
                (!country.value || d.country === country.value) &&
                (!category.value || d.category === category.value);
        });
    }

    function render() {
        const items = matches();
        const visible = items.slice(0, limit);

        count.textContent =
            `${items.length} matching attractions · ` +
            `${directory.length} total`;

        results.innerHTML = visible.map((d, index) => {
            const image = photoFor(d.name);
            const label = d.county
                ? `${d.county} · ${d.country}`
                : d.country;

            return `
        <article class="destination mt-spotlight-card">

          <div class="photo mt-spotlight-photo">
            ${image
                    ? `<img src="${escapeHTML(image)}"
                   alt="${escapeHTML(d.name)}"
                   loading="eager">`
                    : `<span>Photo unavailable</span>`
                }
            <span class="category-tag">
              ${escapeHTML(d.category)}
            </span>
          </div>

          <div class="body">
            <h3>${escapeHTML(d.name)}</h3>

            <p>📍 ${escapeHTML(label)}</p>

            <button type="button"
                    data-spotlight-add="${index}">
              ${selected.has(d.country + "|" + d.name)
                    ? "Remove from itinerary"
                    : "Add to itinerary"}
            </button>
          </div>

        </article>
      `;
        }).join("");

        if (!visible.length) {
            results.innerHTML =
                `<p>No destinations match your search. Try another filter.</p>`;
        }

        more.hidden = visible.length >= items.length;
    }

    results.addEventListener("click", event => {
        const button = event.target.closest("[data-spotlight-add]");
        if (!button) return;

        const item = matches()[Number(button.dataset.spotlightAdd)];
        if (!item) return;

        const key = item.country + "|" + item.name;

        if (selected.has(key)) {
            selected.delete(key);
        } else {
            selected.add(key);
        }

        // Display country-qualified names for cross-border journeys.
        if (tripField) {
            tripField.value = [...selected].map(key => {
                const divider = key.indexOf("|");
                return key.slice(divider + 1) +
                    " (" + key.slice(0, divider) + ")";
            }).join(", ");
        }

        render();
    });

    function changeFilters() {
        limit = 12;
        render();
    }

    search.addEventListener("input", changeFilters);
    country.addEventListener("change", changeFilters);
    category.addEventListener("change", changeFilters);

    reset.addEventListener("click", () => {
        search.value = "";
        country.value = "";
        category.value = "";
        changeFilters();
    });

    more.addEventListener("click", () => {
        limit += 12;
        render();
    });

    render();
})();
