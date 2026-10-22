(() => {
    "use strict";

    /*
    ==========================================
    MTALIII AFRICA — REGION APPLICATION
    SHARED TOUR ITINERARY INTEGRATION
    ==========================================
    */

    const $ = selector => document.querySelector(selector);

    const esc = value => String(value ?? "").replace(
        /[&<>"']/g,
        char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]
    );

    const TOUR_STORAGE_KEY = "mtaliii-tour-itinerary-v1";
    const TOUR_DATES_KEY = "mtaliii-tour-dates-v1";

    const cards = $("#regionCards");
    const details = $("#regionDetails");
    const search = $("#regionSearch");
    const filter = $("#regionGroup");

    if (
        !cards ||
        !details ||
        !search ||
        !filter ||
        typeof REGION_COUNTRIES === "undefined"
    ) {
        return;
    }

    /*
    ==========================================
    STORAGE
    ==========================================
    */

    function readJSON(key, fallback) {
        try {
            return JSON.parse(
                localStorage.getItem(key)
            ) ?? fallback;
        } catch {
            return fallback;
        }
    }

    function saveJSON(key, value) {
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
    ==========================================
    TOUR DESTINATION IDENTIFICATION
    ==========================================
    */

    function normalizeTour(destination) {
        if (!destination || !destination.name) {
            return null;
        }

        return {
            name: String(destination.name).trim(),

            country: String(
                destination.country || "Kenya"
            ).trim(),

            location: String(
                destination.location ||
                destination.county ||
                ""
            ).trim(),

            category: String(
                destination.category || ""
            ).trim()
        };
    }

    function tourKey(destination) {
        const tour = normalizeTour(destination);

        if (!tour) return "";

        return [
            tour.name.toLowerCase(),
            tour.country.toLowerCase()
        ].join("::");
    }

    function getTours() {
        const saved = readJSON(
            TOUR_STORAGE_KEY,
            []
        );

        if (!Array.isArray(saved)) {
            return [];
        }

        const unique = new Map();

        saved.forEach(destination => {
            const tour = normalizeTour(destination);

            if (!tour) return;

            unique.set(
                tourKey(tour),
                tour
            );
        });

        return [...unique.values()];
    }

    function hasTour(destination) {
        const key = tourKey(destination);

        return getTours().some(
            tour => tourKey(tour) === key
        );
    }

    function saveTours(tours) {
        const unique = new Map();

        tours.forEach(destination => {
            const tour = normalizeTour(destination);

            if (!tour) return;

            unique.set(
                tourKey(tour),
                tour
            );
        });

        const updated = [...unique.values()];

        if (!saveJSON(TOUR_STORAGE_KEY, updated)) {
            return false;
        }

        /*
        Notify the shared journey planner.
        */

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

        updateTripField();
        updateVisibleButtons();

        return true;
    }

    /*
    ==========================================
    ADD / REMOVE TOUR DESTINATIONS
    ==========================================
    */

    function toggleTour(destination) {
        const tour = normalizeTour(destination);

        if (!tour) return;

        const tours = getTours();
        const selected = hasTour(tour);

        if (selected) {
            const remaining = tours.filter(
                item => tourKey(item) !== tourKey(tour)
            );

            if (!saveTours(remaining)) return;

            /*
            Delete only the removed attraction's date.
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
                const dateKey = [
                    tour.name,
                    tour.country,
                    tour.location
                ].join("::");

                delete dates[dateKey];

                saveJSON(TOUR_DATES_KEY, dates);
            }

        } else {
            tours.push(tour);
            saveTours(tours);
        }
    }

    /*
    ==========================================
    UPDATE LEGACY TOUR FIELD
    ==========================================
    */

    function updateTripField() {
        const field = $("#tripDestinations");

        if (!field) return;

        field.value = getTours()
            .map(tour =>
                `${tour.name} (${tour.country})`
            )
            .join(", ");
    }

    /*
    ==========================================
    BUTTON SYNCHRONIZATION
    ==========================================
    */

    function updateVisibleButtons() {
        details.querySelectorAll(
            "button[data-place]"
        ).forEach(button => {
            const destination = {
                name: button.dataset.place,
                country: button.dataset.country,
                location: button.dataset.country,
                category: category(
                    button.dataset.place
                )
            };

            const selected = hasTour(destination);

            button.textContent = selected
                ? "✓ Remove from Itinerary"
                : "+ Add to Itinerary";

            button.classList.toggle(
                "selected",
                selected
            );

            button.setAttribute(
                "aria-pressed",
                String(selected)
            );
        });
    }

    /*
    ==========================================
    COUNTRY FILTER OPTIONS
    ==========================================
    */

    [
        ...new Set(
            REGION_COUNTRIES.map(
                country => country.group
            )
        )
    ].forEach(group => {
        const exists = [
            ...filter.options
        ].some(
            option => option.value === group
        );

        if (!exists) {
            filter.add(
                new Option(group, group)
            );
        }
    });

    /*
    ==========================================
    ATTRACTION CATEGORIES
    ==========================================
    */

    const themes = [
        [
            "Wildlife & safari",
            /park|reserve|safari|wildlife|conservancy|sanctuary|gorilla|chimpanzee|giraffe|rhino|elephant/i
        ],
        [
            "Lakes, rivers & falls",
            /lake|falls|river|nile|spring|waterfall|delta/i
        ],
        [
            "Mountains & forests",
            /mount|mountain|forest|volcano|peak|hill|gorge|crater|highland/i
        ],
        [
            "Beaches & islands",
            /beach|island|marine|coast|bay|atoll|reef|lagoon|zanzibar|anse/i
        ],
        [
            "Culture, cities & heritage",
            /museum|fort|monument|town|palace|city|church|temple|heritage|market|medina|stone town/i
        ]
    ];

    function category(name) {
        const found = themes.find(
            ([, expression]) =>
                expression.test(name)
        );

        return found
            ? found[0]
            : "Nature & experiences";
    }

    /*
    ==========================================
    COUNTRY ATTRACTIONS
    ==========================================
    */

    function places(country) {
        const kenyaDestinations =
            typeof DESTINATIONS !== "undefined" &&
                Array.isArray(DESTINATIONS)
                ? DESTINATIONS
                : [];

        if (country.name === "Kenya") {
            return [
                ...new Set([
                    ...kenyaDestinations.map(
                        destination => destination.name
                    ),
                    ...country.places
                ])
            ];
        }

        return country.places;
    }

    /*
    ==========================================
    RENDER COUNTRIES
    ==========================================
    */

    function renderCountries() {
        const query = search.value
            .toLowerCase()
            .trim();

        const group = filter.value;

        const items = REGION_COUNTRIES.filter(
            country => {
                const matchesGroup =
                    !group ||
                    country.group === group;

                const searchable = [
                    country.name,
                    country.intro,
                    ...places(country)
                ].join(" ").toLowerCase();

                return (
                    matchesGroup &&
                    (!query || searchable.includes(query))
                );
            }
        );

        const regionCount = $("#regionCount");

        if (regionCount) {
            regionCount.textContent =
                items.length +
                " countries · " +
                items.reduce(
                    (total, country) =>
                        total + places(country).length,
                    0
                ) +
                " listed experiences";
        }

        cards.innerHTML = items.map(
            (country, index) => `
                <article class="region-card">

                    <div
                        class="country-image"
                        data-country-photo="${esc(country.name)}"
                        role="img"
                        aria-label="${esc(country.capital)} city photograph"
                    >
                        <div class="city-pending">
                            <strong>
                                ${esc(country.capital)}
                            </strong>

                            <span>
                                CAPITAL CITY ·
                                ${esc(country.name)}
                            </span>
                        </div>
                    </div>

                    <div class="country-top">
                        <span>
                            ${esc(country.group)}
                        </span>

                        <b>
                            ${String(index + 1).padStart(2, "0")}
                        </b>
                    </div>

                    <h3>
                        ${esc(country.name)}
                    </h3>

                    <span class="tag">
                        ${esc(country.tag)}
                    </span>

                    <p>
                        ${esc(country.intro)}
                    </p>

                    <div class="country-foot">
                        <span>
                            ${places(country).length}
                            places to discover
                        </span>

                        <button
                            type="button"
                            data-country="${esc(country.name)}"
                        >
                            Explore country ↗
                        </button>
                    </div>

                </article>
            `
        ).join("");

        /*
        Preserve existing country photographs.
        */

        cards.querySelectorAll(
            "[data-country-photo]"
        ).forEach(element => {
            window.mtaliiiIllustrate?.(
                element,
                element.dataset.countryPhoto
            );
        });

        cards.querySelectorAll(
            "button[data-country]"
        ).forEach(button => {
            button.onclick = () => {
                showCountry(
                    button.dataset.country
                );
            };
        });
    }

    /*
    ==========================================
    SHOW COUNTRY ATTRACTIONS
    ==========================================
    */

    function showCountry(name) {
        const country = REGION_COUNTRIES.find(
            item => item.name === name
        );

        if (!country) return;

        let attractions = places(country);

        details.hidden = false;

        details.innerHTML = `
            <button
                class="country-back"
                id="closeCountry"
                type="button"
            >
                ← All countries
            </button>

            <span class="eyebrow">
                EXPLORE ${esc(country.name.toUpperCase())}
            </span>

            <h3>
                ${esc(country.name)} · Your next adventure
            </h3>

            <p>
                ${esc(country.intro)}
            </p>

            <div class="region-controls">
                <input
                    id="countrySearch"
                    placeholder="Search attractions in ${esc(country.name)}…"
                >

                <select id="countryCategory">
                    <option value="">
                        All categories
                    </option>

                    ${[
                ...new Set(
                    attractions.map(category)
                )
            ]
                .sort()
                .map(
                    item => `
                                <option>
                                    ${esc(item)}
                                </option>
                            `
                )
                .join("")
            }
                </select>
            </div>

            <div id="countryCount"></div>

            <div class="region-controls">
                <button
                    id="loadMappedPlaces"
                    class="loadmore"
                    type="button"
                >
                    Find more mapped attractions in this country
                </button>

                <span
                    id="mappedStatus"
                    role="status"
                ></span>
            </div>

            <div
                class="country-places"
                id="countryPlaces"
            ></div>
        `;

        /*
        ======================================
        DRAW COUNTRY ATTRACTIONS
        ======================================
        */

        function drawAttractions() {
            const query = $("#countrySearch")
                .value.toLowerCase();

            const selectedCategory =
                $("#countryCategory").value;

            const found = attractions.filter(
                name => {
                    const matchesSearch =
                        name.toLowerCase().includes(query);

                    const matchesCategory =
                        !selectedCategory ||
                        category(name) === selectedCategory;

                    return (
                        matchesSearch &&
                        matchesCategory
                    );
                }
            );

            const visible = found.slice(0, 80);

            $("#countryCount").textContent =
                found.length +
                " destinations · showing first " +
                visible.length +
                " (refine search to see more)";

            $("#countryPlaces").innerHTML =
                visible.map(name => {
                    const destination = {
                        name,
                        country: country.name,
                        location: country.name,
                        category: category(name)
                    };

                    const selected = hasTour(
                        destination
                    );

                    return `
                        <article class="country-place">

                            <div
                                class="exact-photo"
                                data-exact-photo="${esc(name)}"
                            >
                                <span class="waiting-photo">
                                    Illustrative destination photo
                                </span>
                            </div>

                            <span class="place-type">
                                ${esc(category(name))}
                            </span>

                            <h4>
                                ${esc(name)}
                            </h4>

                            <p>
                                ${esc(country.name)}
                            </p>

                            <button
                                type="button"
                                data-place="${esc(name)}"
                                data-country="${esc(country.name)}"
                                aria-pressed="${selected}"
                            >
                                ${selected
                            ? "✓ Remove from Itinerary"
                            : "+ Add to Itinerary"
                        }
                            </button>

                        </article>
                    `;
                }).join("");

            /*
            Preserve existing attraction photos.
            */

            $("#countryPlaces")
                .querySelectorAll(
                    "[data-exact-photo]"
                )
                .forEach(element => {
                    window.mtaliiiIllustrate?.(
                        element,
                        element.dataset.exactPhoto
                    );
                });

            /*
            Add or remove attractions immediately.
            */

            $("#countryPlaces")
                .querySelectorAll(
                    "button[data-place]"
                )
                .forEach(button => {
                    button.onclick = () => {
                        const destination = {
                            name: button.dataset.place,
                            country: button.dataset.country,
                            location: button.dataset.country,
                            category: category(
                                button.dataset.place
                            )
                        };

                        toggleTour(destination);
                    };
                });
        }

        /*
        ======================================
        SEARCH AND FILTER
        ======================================
        */

        $("#countrySearch").oninput =
            drawAttractions;

        $("#countryCategory").onchange =
            drawAttractions;

        /*
        ======================================
        OPENSTREETMAP DISCOVERY
        ======================================
        */

        $("#loadMappedPlaces").onclick =
            async () => {
                const status = $("#mappedStatus");
                const button = $("#loadMappedPlaces");

                button.disabled = true;

                status.textContent =
                    "Searching mapped attractions…";

                try {
                    const response = await fetch(
                        "/api/discover?country=" +
                        encodeURIComponent(country.name)
                    );

                    if (!response.ok) {
                        throw new Error(
                            "Map service temporarily unavailable"
                        );
                    }

                    const payload =
                        await response.json();

                    const more = (
                        payload.places || []
                    )
                        .map(item => item.name)
                        .filter(Boolean);

                    attractions = [
                        ...new Set([
                            ...attractions,
                            ...more
                        ])
                    ];

                    status.textContent =
                        more.length +
                        " additional mapped names loaded from OpenStreetMap.";

                    drawAttractions();

                } catch (error) {
                    status.textContent =
                        error.message;

                } finally {
                    button.disabled = false;
                }
            };

        /*
        ======================================
        CLOSE COUNTRY
        ======================================
        */

        $("#closeCountry").onclick = () => {
            details.hidden = true;

            $("#countries")?.scrollIntoView({
                behavior: "smooth"
            });
        };

        drawAttractions();

        /*
        Load additional attractions as before.
        */

        $("#loadMappedPlaces").click();

        details.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    /*
    ==========================================
    UPDATE AFTER OTHER ITINERARY CHANGES
    ==========================================
    */

    window.addEventListener(
        "mtaliii:tour-itinerary-changed",
        () => {
            updateTripField();
            updateVisibleButtons();
        }
    );

    /*
    Synchronize changes from another browser tab.
    */

    window.addEventListener(
        "storage",
        event => {
            if (event.key === TOUR_STORAGE_KEY) {
                updateTripField();
                updateVisibleButtons();
            }
        }
    );

    /*
    ==========================================
    COUNTRY SELECTION IN LEGACY FORM
    ==========================================
    */

    const tripForm = $("#tripForm");

    if (tripForm) {
        const notes = tripForm.querySelector(
            'textarea[name="notes"]'
        );

        if (notes && notes.parentElement) {
            const existing = $("#travelCountries");

            if (!existing) {
                const label = document.createElement(
                    "label"
                );

                label.innerHTML = `
                    Country to visit

                    <select
                        name="travelCountries"
                        id="travelCountries"
                    >
                        <option value="">
                            Select country
                        </option>

                        ${REGION_COUNTRIES.map(
                    country => `
                                    <option value="${esc(country.name)}">
                                        ${esc(country.name)}
                                    </option>
                                `
                ).join("")
                    }
                    </select>
                `;

                notes.parentElement.before(label);
            }
        }

        /*
        Selecting a country does not
        automatically add any attraction.
        */
    }

    /*
    ==========================================
    INITIALIZE
    ==========================================
    */

    search.oninput = renderCountries;
    filter.onchange = renderCountries;

    renderCountries();
    updateTripField();

})();