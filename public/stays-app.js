(() => {
    "use strict";

    /* ==========================================
       MTALIII AFRICA
       CONNECTED ACCOMMODATION & TOUR PLANNER
    ========================================== */

    const data = window.MTALIII_STAY_DESTINATIONS;

    const root = document.getElementById("stayDestinations");
    const countryFilter = document.getElementById("stayCountry");
    const search = document.getElementById("staySearch");
    const count = document.getElementById("stayCount");
    const oldDetail = document.getElementById("stayDetail");

    if (!data || !root || !countryFilter || !search || !count) {
        return;
    }

    const esc = value =>
        String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[char]));

    const countries = Object.keys(data);

    const storageKey = "mtaliii-stay-planner-v2";
    const tourStorageKey = "mtaliii-tour-itinerary-v1";

    const types = [
        "Any accommodation",
        "Luxury hotel or resort",
        "Safari lodge or camp",
        "Private villa or apartment",
        "Budget-friendly stay"
    ];

    /* ==========================================
       DATE UTILITIES
    ========================================== */

    function formatDate(date) {
        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");
    }

    function today() {
        return formatDate(new Date());
    }

    function addDays(value, days) {
        const date = new Date(value + "T12:00:00");

        date.setDate(date.getDate() + days);

        return formatDate(date);
    }

    function nightsBetween(start, end) {
        if (!start || !end) return NaN;

        const first = new Date(start + "T12:00:00");
        const last = new Date(end + "T12:00:00");

        return Math.round(
            (last - first) / 86400000
        );
    }

    function validDate(value) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
            return false;
        }

        const date = new Date(value + "T12:00:00");

        return !Number.isNaN(date.getTime()) &&
            formatDate(date) === value;
    }

    function validTown(country, town) {
        return Array.isArray(data[country]) &&
            data[country].includes(town);
    }

    /* ==========================================
       PLANNER STATE
    ========================================== */

    let stays = [];

    let adults = 2;
    let children = 0;
    let rooms = 1;
    let preference = types[0];

    let includeTours = false;
    let tourDate = "";
    let tourDays = 7;
    let partnerId = "";

    const contact = {
        name: "",
        email: "",
        phone: "",
        notes: ""
    };

    function getTours() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(tourStorageKey)
            );

            if (!Array.isArray(saved)) return [];

            return saved.filter(item =>
                item &&
                typeof item.name === "string" &&
                item.name.trim()
            ).map(item => ({
                name: String(item.name),
                country: String(item.country || ""),
                location: String(item.location || ""),
                category: String(item.category || "")
            }));

        } catch {
            return [];
        }
    }

    function restore() {
        try {
            const saved = JSON.parse(
                localStorage.getItem(storageKey)
            );

            if (!saved || typeof saved !== "object") {
                return;
            }

            stays = Array.isArray(saved.stays)
                ? saved.stays.filter(stay =>
                    stay &&
                    validTown(stay.country, stay.town) &&
                    validDate(stay.checkin) &&
                    validDate(stay.checkout) &&
                    stay.checkin >= today() &&
                    nightsBetween(
                        stay.checkin,
                        stay.checkout
                    ) >= 1
                ).slice(0, 30)
                : [];

            adults = Number.isInteger(saved.adults) &&
                saved.adults >= 1 &&
                saved.adults <= 30
                ? saved.adults : 2;

            children = Number.isInteger(saved.children) &&
                saved.children >= 0 &&
                saved.children <= 30
                ? saved.children : 0;

            rooms = Number.isInteger(saved.rooms) &&
                saved.rooms >= 1 &&
                saved.rooms <= 20
                ? saved.rooms : 1;

            preference = types.includes(saved.preference)
                ? saved.preference
                : types[0];

        } catch {
            console.warn(
                "Could not restore accommodation itinerary."
            );
        }
    }

    function save() {
        try {
            localStorage.setItem(
                storageKey,
                JSON.stringify({
                    stays,
                    adults,
                    children,
                    rooms,
                    preference
                })
            );
        } catch {
            console.warn(
                "Could not save accommodation itinerary."
            );
        }
    }

    restore();

    /* ==========================================
       ACCOMMODATION DIRECTORY
    ========================================== */

    countries.forEach(country => {
        const exists = [...countryFilter.options].some(
            option => option.value === country
        );

        if (!exists) {
            countryFilter.add(
                new Option(country, country)
            );
        }
    });

    function renderCards() {
        const query = search.value.trim().toLowerCase();
        const selectedCountry = countryFilter.value;

        const matches = Object.entries(data).flatMap(
            ([country, towns]) =>
                towns.filter(town =>
                    (!selectedCountry ||
                        selectedCountry === country) &&
                    (!query ||
                        (country + " " + town)
                            .toLowerCase()
                            .includes(query))
                ).map(town => ({
                    country,
                    town
                }))
        );

        count.textContent =
            matches.length +
            " accommodation destinations across " +
            countries.length +
            " countries";

        root.innerHTML = matches.map(({ country, town }) => `
            <article class="stay-town">
                <div
                    class="stay-town-photo"
                    data-stay-photo="${esc(town + ", " + country)}"
                >
                    <span>
                        Explore stays in this destination
                    </span>
                </div>

                <div class="stay-town-body">
                    <small>${esc(country)}</small>

                    <h3>${esc(town)}</h3>

                    <button
                        type="button"
                        data-stay="${esc(town)}"
                        data-country="${esc(country)}"
                    >
                        Book accommodation ↗
                    </button>
                </div>
            </article>
        `).join("");

        root.querySelectorAll(
            "[data-stay-photo]"
        ).forEach(element => {
            window.mtaliiiIllustrate?.(
                element,
                element.dataset.stayPhoto
            );
        });
    }

    if (oldDetail) {
        oldDetail.hidden = true;
    }

    /* ==========================================
       MODAL
    ========================================== */

    const modal = document.createElement("div");

    modal.id = "mtStayModal";
    modal.className = "mt-stay-modal";
    modal.hidden = true;

    modal.innerHTML = `
        <div
            class="mt-stay-overlay"
            data-close="true"
        ></div>

        <section
            class="mt-stay-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mtStayTitle"
            tabindex="-1"
        >
            <div id="mtStayContent"></div>
        </section>
    `;

    document.body.appendChild(modal);

    const content = modal.querySelector(
        "#mtStayContent"
    );

    const dialog = modal.querySelector(
        ".mt-stay-dialog"
    );

    let previousFocus = null;
    let submitting = false;
    let suggestedDestination = null;

    function openModal(country = "", town = "") {
        previousFocus = document.activeElement;

        suggestedDestination =
            validTown(country, town)
                ? { country, town }
                : null;

        modal.hidden = false;

        document.body.classList.add(
            "mt-modal-open"
        );

        renderPlanner();
        dialog.focus();
    }

    function closeModal() {
        if (submitting) return;

        modal.hidden = true;

        document.body.classList.remove(
            "mt-modal-open"
        );

        previousFocus?.focus?.();
    }

    /* ==========================================
       STAY MANAGEMENT
    ========================================== */

    function suggestedCheckin() {
        if (!stays.length) {
            return today();
        }

        return stays.reduce(
            (latest, stay) =>
                stay.checkout > latest
                    ? stay.checkout
                    : latest,
            today()
        );
    }

    function addStay(country, town) {
        if (!validTown(country, town)) {
            return false;
        }

        const exists = stays.some(stay =>
            stay.country === country &&
            stay.town === town
        );

        if (exists || stays.length >= 30) {
            return false;
        }

        const checkin = suggestedCheckin();

        stays.push({
            country,
            town,
            checkin,
            checkout: addDays(checkin, 2)
        });

        save();

        return true;
    }

    function removeStay(index) {
        stays.splice(index, 1);
        save();
    }

    function itineraryError() {
        if (!stays.length) {
            return "Please add at least one accommodation destination.";
        }

        const ordered = [...stays].sort(
            (a, b) =>
                a.checkin.localeCompare(b.checkin)
        );

        for (let index = 0; index < ordered.length; index++) {
            const stay = ordered[index];

            const nights = nightsBetween(
                stay.checkin,
                stay.checkout
            );

            if (
                !validDate(stay.checkin) ||
                !validDate(stay.checkout) ||
                stay.checkin < today() ||
                !Number.isFinite(nights) ||
                nights < 1 ||
                nights > 90
            ) {
                return (
                    "Please correct the dates for " +
                    stay.town + "."
                );
            }

            if (
                index > 0 &&
                ordered[index - 1].checkout >
                stay.checkin
            ) {
                return (
                    "Dates overlap between " +
                    ordered[index - 1].town +
                    " and " +
                    stay.town +
                    ". Please adjust the dates."
                );
            }
        }

        const first = ordered[0].checkin;

        const last =
            ordered[ordered.length - 1].checkout;

        if (nightsBetween(first, last) > 90) {
            return (
                "The overall travel period " +
                "cannot exceed 90 days."
            );
        }

        return "";
    }

    function getSummary() {
        const ordered = [...stays].sort(
            (a, b) =>
                a.checkin.localeCompare(b.checkin)
        );

        const totalNights = ordered.reduce(
            (sum, stay) =>
                sum + Math.max(
                    0,
                    nightsBetween(
                        stay.checkin,
                        stay.checkout
                    ) || 0
                ),
            0
        );

        return {
            ordered,
            totalNights,
            first: ordered[0]?.checkin || "",
            last:
                ordered[ordered.length - 1]?.checkout || ""
        };
    }

    function rememberForm() {
        const form = content.querySelector(
            "#mtStayForm"
        );

        if (!form) return;

        adults = Number(
            form.elements.adults.value
        );

        children = Number(
            form.elements.children.value
        );

        rooms = Number(
            form.elements.rooms.value
        );

        preference =
            form.elements.preference.value;

        contact.name =
            form.elements.guestName.value;

        contact.email =
            form.elements.guestEmail.value;

        contact.phone =
            form.elements.guestPhone.value;

        contact.notes =
            form.elements.notes.value;

        includeTours =
            Boolean(form.elements.includeTours?.checked);

        if (form.elements.tourDate) {
            tourDate =
                form.elements.tourDate.value;
        }

        if (form.elements.tourDays) {
            tourDays = Number(
                form.elements.tourDays.value
            );
        }

        if (form.elements.partnerId) {
            partnerId =
                form.elements.partnerId.value;
        }

        save();
    }

    /* ==========================================
       RENDER BOOKING PLANNER
    ========================================== */

    function renderPlanner(message = "") {
        const summary = getSummary();
        const tours = getTours();

        const selectedSuggestion =
            suggestedDestination &&
            stays.some(stay =>
                stay.country === suggestedDestination.country &&
                stay.town === suggestedDestination.town
            );

        content.innerHTML = `
            <div class="mt-modal-header">
                <div>
                    <small>
                        MTALIII AFRICA · JOURNEY PLANNER
                    </small>

                    <h2 id="mtStayTitle">
                        Plan your African journey
                    </h2>

                    <p>
                        Choose accommodation, dates and
                        optional touring experiences.
                    </p>
                </div>

                <button
                    type="button"
                    id="mtModalClose"
                    class="mt-modal-close"
                    aria-label="Close booking"
                >
                    ×
                </button>
            </div>

            <div class="mt-modal-body">
                <form id="mtStayForm">

                    ${suggestedDestination ? `
                        <div class="mt-add-stay">
                            <h3>
                                Selected accommodation location
                            </h3>

                            <p>
                                <strong>
                                    ${esc(suggestedDestination.town)}
                                </strong>
                                · ${esc(suggestedDestination.country)}
                            </p>

                            <button
                                type="button"
                                id="mtConfirmSuggested"
                                class="mt-modal-submit"
                                ${selectedSuggestion ? "disabled" : ""}
                            >
                                ${selectedSuggestion
                    ? "Already in your itinerary ✓"
                    : "+ Add this accommodation destination"}
                            </button>
                        </div>
                    ` : ""}

                    <h3>Your accommodation destinations</h3>

                    <div class="mt-stay-items">
                        ${stays.length
                ? stays.map((stay, index) => `
                                <div class="mt-stay-item">
                                    <div class="mt-stay-item-head">
                                        <div>
                                            <strong>
                                                ${index + 1}.
                                                ${esc(stay.town)}
                                            </strong>

                                            <small>
                                                ${esc(stay.country)}
                                            </small>
                                        </div>

                                        <button
                                            type="button"
                                            class="mt-remove-stay"
                                            data-remove="${index}"
                                        >
                                            Remove
                                        </button>
                                    </div>

                                    <div class="mt-date-grid">
                                        <label>
                                            Check-in

                                            <input
                                                type="date"
                                                data-date-index="${index}"
                                                data-date-field="checkin"
                                                min="${today()}"
                                                value="${esc(stay.checkin)}"
                                                required
                                            >
                                        </label>

                                        <label>
                                            Check-out

                                            <input
                                                type="date"
                                                data-date-index="${index}"
                                                data-date-field="checkout"
                                                min="${addDays(stay.checkin, 1)}"
                                                value="${esc(stay.checkout)}"
                                                required
                                            >
                                        </label>
                                    </div>

                                    <div class="mt-night-count">
                                        ${Math.max(
                    0,
                    nightsBetween(
                        stay.checkin,
                        stay.checkout
                    ) || 0
                )} night(s)
                                    </div>
                                </div>
                            `).join("")
                : `
                                <p class="mt-empty-stays">
                                    No accommodation selected yet.
                                    Add a destination to begin.
                                </p>
                            `}
                    </div>

                    <div class="mt-add-stay">
                        <h4>+ Add another destination</h4>

                        <div class="mt-date-grid">
                            <label>
                                Country

                                <select id="mtAddCountry">
                                    <option value="">
                                        Select country
                                    </option>

                                    ${countries.map(country => `
                                        <option value="${esc(country)}">
                                            ${esc(country)}
                                        </option>
                                    `).join("")}
                                </select>
                            </label>

                            <label>
                                Destination

                                <select
                                    id="mtAddTown"
                                    disabled
                                >
                                    <option value="">
                                        Select destination
                                    </option>
                                </select>
                            </label>
                        </div>

                        <p class="mt-hint">
                            Select a country and destination.
                            Dates will be suggested after
                            your previous accommodation stay.
                        </p>

                        <p
                            id="mtAddFeedback"
                            aria-live="polite"
                        ></p>
                    </div>

                    <div class="mt-add-stay">
                        <h3>Touring experiences</h3>

                        <label>
                            <input
                                type="checkbox"
                                name="includeTours"
                                ${includeTours ? "checked" : ""}
                            >
                            Include my selected tour destinations
                            in this enquiry
                        </label>

                        <p class="mt-hint">
                            Tours are optional. You can book
                            accommodation without touring.
                        </p>

                        ${tours.length ? `
                            <div class="mt-journey-locations">
                                <h4>
                                    Attractions in your touring itinerary
                                </h4>

                                ${tours.map((tour, index) => `
                                    <article class="mt-journey-stop">
                                        <div class="mt-journey-stop-title">
                                            <strong>
                                                ${index + 1}.
                                                ${esc(tour.name)}
                                            </strong>

                                            <span>
                                                ${esc(tour.country)}
                                            </span>
                                        </div>

                                        <small>
                                            ${esc(tour.location)}
                                            ${tour.category
                        ? " · " + esc(tour.category)
                        : ""}
                                        </small>
                                    </article>
                                `).join("")}
                            </div>
                        ` : `
                            <p class="mt-hint">
                                No touring attractions selected.
                                Explore destinations and use
                                "Add to itinerary" to include them.
                            </p>
                        `}
                    </div>

                    <div class="mt-stay-summary">
                        <h3>Journey summary</h3>

                        <div>
                            <span>
                                Accommodation destinations
                            </span>

                            <strong>${stays.length}</strong>
                        </div>

                        <div>
                            <span>
                                Accommodation nights
                            </span>

                            <strong>
                                ${summary.totalNights}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Travel period
                            </span>

                            <strong>
                                ${summary.first
                ? esc(summary.first) +
                " to " +
                esc(summary.last)
                : "Not selected"}
                            </strong>
                        </div>

                        <div>
                            <span>
                                Touring attractions
                            </span>

                            <strong>
                                ${includeTours ? tours.length : 0}
                            </strong>
                        </div>

                        <div class="mt-journey-locations">
                            <h4>
                                Your accommodation itinerary
                            </h4>

                            ${summary.ordered.length
                ? summary.ordered.map(
                    (stay, index) => `
                                        <article class="mt-journey-stop">
                                            <div class="mt-journey-stop-title">
                                                <strong>
                                                    ${index + 1}.
                                                    ${esc(stay.town)}
                                                </strong>

                                                <span>
                                                    ${esc(stay.country)}
                                                </span>
                                            </div>

                                            <div class="mt-journey-stop-dates">
                                                <span>
                                                    Check-in:
                                                    <strong>
                                                        ${esc(stay.checkin)}
                                                    </strong>
                                                </span>

                                                <span>
                                                    Check-out:
                                                    <strong>
                                                        ${esc(stay.checkout)}
                                                    </strong>
                                                </span>
                                            </div>

                                            <small>
                                                ${nightsBetween(
                        stay.checkin,
                        stay.checkout
                    )} night(s)
                                            </small>
                                        </article>
                                    `
                ).join("")
                : `
                                    <p class="mt-journey-empty">
                                        No accommodation destinations
                                        selected yet.
                                    </p>
                                `}
                        </div>
                    </div>

                    <h3>Guests and rooms</h3>

                    <div class="mt-date-grid mt-guest-grid">
                        <label>
                            Adults

                            <input
                                type="number"
                                name="adults"
                                min="1"
                                max="30"
                                value="${adults}"
                                required
                            >
                        </label>

                        <label>
                            Children

                            <input
                                type="number"
                                name="children"
                                min="0"
                                max="30"
                                value="${children}"
                                required
                            >
                        </label>

                        <label>
                            Rooms

                            <input
                                type="number"
                                name="rooms"
                                min="1"
                                max="20"
                                value="${rooms}"
                                required
                            >
                        </label>
                    </div>

                    <label class="mt-modal-field">
                        Accommodation preference

                        <select name="preference">
                            ${types.map(type => `
                                <option
                                    value="${esc(type)}"
                                    ${type === preference
                        ? "selected"
                        : ""}
                                >
                                    ${esc(type)}
                                </option>
                            `).join("")}
                        </select>
                    </label>

                    <h3>Contact details</h3>

                    <div class="mt-date-grid">
                        <label>
                            Full name

                            <input
                                type="text"
                                name="guestName"
                                maxlength="120"
                                autocomplete="name"
                                value="${esc(contact.name)}"
                                required
                            >
                        </label>

                        <label>
                            Email

                            <input
                                type="email"
                                name="guestEmail"
                                maxlength="180"
                                autocomplete="email"
                                value="${esc(contact.email)}"
                                required
                            >
                        </label>

                        <label>
                            Phone / WhatsApp

                            <input
                                type="tel"
                                name="guestPhone"
                                maxlength="50"
                                autocomplete="tel"
                                value="${esc(contact.phone)}"
                                required
                            >
                        </label>
                    </div>

                    <label class="mt-modal-field">
                        Special requests (optional)

                        <textarea
                            name="notes"
                            rows="3"
                            maxlength="900"
                            placeholder="Transfers, accessibility, room preferences or other requests"
                        >${esc(contact.notes)}</textarea>
                    </label>

                    <p
                        id="mtStayError"
                        class="mt-error"
                        role="alert"
                    >${esc(message)}</p>

                    <button
                        type="submit"
                        id="mtStaySubmit"
                        class="mt-modal-submit"
                    >
                        Submit travel enquiry ↗
                    </button>

                    <p class="mt-hint">
                        This is an enquiry, not a confirmed
                        reservation. Availability and prices
                        will be discussed with you.
                    </p>
                </form>
            </div>
        `;

        bindPlanner();
    }

    /* ==========================================
       PLANNER EVENTS
    ========================================== */

    function bindPlanner() {
        const form = content.querySelector(
            "#mtStayForm"
        );

        const error = content.querySelector(
            "#mtStayError"
        );

        content.querySelector(
            "#mtModalClose"
        ).onclick = closeModal;

        const confirmSuggestion =
            content.querySelector("#mtConfirmSuggested");

        if (confirmSuggestion) {
            confirmSuggestion.onclick = () => {
                rememberForm();

                if (
                    suggestedDestination &&
                    addStay(
                        suggestedDestination.country,
                        suggestedDestination.town
                    )
                ) {
                    renderPlanner();
                }
            };
        }

        content.querySelectorAll(
            "[data-remove]"
        ).forEach(button => {
            button.onclick = () => {
                rememberForm();

                removeStay(
                    Number(button.dataset.remove)
                );

                renderPlanner();
            };
        });

        content.querySelectorAll(
            "[data-date-index]"
        ).forEach(input => {
            input.addEventListener("change", () => {
                rememberForm();

                const index = Number(
                    input.dataset.dateIndex
                );

                const field =
                    input.dataset.dateField;

                const value = input.value;

                if (
                    !stays[index] ||
                    !validDate(value)
                ) {
                    return;
                }

                stays[index][field] = value;

                if (
                    field === "checkin" &&
                    stays[index].checkout <= value
                ) {
                    stays[index].checkout =
                        addDays(value, 1);
                }

                save();

                renderPlanner(
                    itineraryError()
                );
            });
        });

        const addCountry = content.querySelector(
            "#mtAddCountry"
        );

        const addTown = content.querySelector(
            "#mtAddTown"
        );

        const feedback = content.querySelector(
            "#mtAddFeedback"
        );

        addCountry.onchange = () => {
            addTown.innerHTML =
                '<option value="">Select destination</option>';

            addTown.disabled =
                !addCountry.value;

            feedback.textContent = "";

            (data[addCountry.value] || [])
                .forEach(town => {
                    addTown.add(
                        new Option(town, town)
                    );
                });
        };

        addTown.onchange = () => {
            const country = addCountry.value;
            const town = addTown.value;

            if (!country || !town) return;

            rememberForm();

            if (!addStay(country, town)) {
                feedback.textContent =
                    "Already selected or destination limit reached.";

                return;
            }

            renderPlanner(
                itineraryError()
            );
        };

        form.addEventListener("input", event => {
            if (event.target.name) {
                rememberForm();
            }

            if (
                event.target.name === "includeTours"
            ) {
                renderPlanner();
            }
        });

        form.addEventListener(
            "submit",
            submitEnquiry
        );
    }

    /* ==========================================
       SUBMIT ENQUIRY
    ========================================== */

    async function submitEnquiry(event) {
        event.preventDefault();

        if (submitting) return;

        rememberForm();

        const form = event.target;
        const error = content.querySelector(
            "#mtStayError"
        );

        const tours = getTours();

        if (
            !stays.length &&
            (!includeTours || !tours.length)
        ) {
            error.textContent =
                "Please add at least one accommodation or touring destination.";

            return;
        }

        if (stays.length) {
            const problem = itineraryError();

            if (problem) {
                error.textContent = problem;
                return;
            }
        }

        if (
            !Number.isInteger(adults) ||
            adults < 1 ||
            adults > 30 ||
            !Number.isInteger(children) ||
            children < 0 ||
            children > 30 ||
            adults + children > 40 ||
            !Number.isInteger(rooms) ||
            rooms < 1 ||
            rooms > 20
        ) {
            error.textContent =
                "Please check guests and rooms.";

            return;
        }

        if (!form.reportValidity()) return;

        const summary = getSummary();

        const orderedTours =
            includeTours ? tours : [];

        const accommodationText =
            summary.ordered.map((stay, index) =>
                `${index + 1}. ${stay.town}, ${stay.country}: ` +
                `${stay.checkin} to ${stay.checkout} ` +
                `(${nightsBetween(
                    stay.checkin,
                    stay.checkout
                )} nights)`
            ).join("\n");

        const tourText =
            orderedTours.map((tour, index) =>
                `${index + 1}. ${tour.name}, ` +
                `${tour.location}, ${tour.country}`
            ).join("\n");

        const enquiryType =
            stays.length && orderedTours.length
                ? "combined"
                : stays.length
                    ? "accommodation"
                    : "tour";

        const notes = [
            "MTALIII AFRICA TRAVEL ITINERARY",
            "Enquiry type: " + enquiryType,
            "",
            "ACCOMMODATION",
            accommodationText || "None requested",
            "",
            "TOURING ATTRACTIONS",
            tourText || "None requested",
            "",
            "Accommodation nights: " +
            summary.totalNights,
            "Accommodation preference: " +
            preference,
            "Rooms: " + rooms,
            "Adults: " + adults,
            "Children: " + children,
            "Guest requests: " +
            (contact.notes || "None")
        ].join("\n");

        if (notes.length > 2000) {
            error.textContent =
                "Your itinerary is too long. Please reduce destinations or notes.";

            return;
        }

        const destinations = [
            ...summary.ordered.map(stay =>
                stay.town + ", " + stay.country
            ),
            ...orderedTours.map(tour =>
                tour.name + ", " + tour.country
            )
        ];

        const firstDate =
            summary.first || tourDate || today();

        const lastDate =
            summary.last ||
            addDays(firstDate, tourDays);

        const tripDays =
            nightsBetween(
                firstDate,
                lastDate
            );

        const payload = {
            enquiryType,
            name: contact.name.trim(),
            email: contact.email.trim(),
            phone: contact.phone.trim(),
            country:
                summary.ordered.length === 1 &&
                    !orderedTours.length
                    ? summary.ordered[0].country
                    : "Multiple destinations",
            date: firstDate,
            checkout: lastDate,
            days: tripDays,
            guests: adults + children,
            adults,
            children,
            rooms,
            accommodationType: preference,
            destinations,
            notes
        };

        const button = content.querySelector(
            "#mtStaySubmit"
        );

        submitting = true;

        button.disabled = true;
        button.textContent = "Submitting...";

        try {
            const response = await fetch(
                "/api/inquiries",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json"
                    },
                    body: JSON.stringify(payload)
                }
            );

            const result =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error ||
                    "Enquiry could not be saved."
                );
            }

            stays = [];

            contact.name = "";
            contact.email = "";
            contact.phone = "";
            contact.notes = "";

            save();

            content.innerHTML = `
                <div class="mt-modal-success">
                    <div class="mt-success-check">
                        ✓
                    </div>

                    <h2>Enquiry received!</h2>

                    <p>
                        Thank you for choosing Mtaliii Africa.
                        Our team will contact you to discuss
                        your journey and availability.
                    </p>

                    <div class="mt-success-reference">
                        Reference:
                        <strong>
                            ${esc(result.reference || "")}
                        </strong>
                    </div>

                    <button
                        type="button"
                        id="mtSuccessClose"
                        class="mt-modal-submit"
                    >
                        Continue exploring Africa
                    </button>
                </div>
            `;

            content.querySelector(
                "#mtSuccessClose"
            ).onclick = closeModal;

        } catch (errorMessage) {
            error.textContent =
                errorMessage.message ||
                "Submission failed. Please try again.";

            button.disabled = false;
            button.textContent =
                "Submit travel enquiry ↗";

        } finally {
            submitting = false;
        }
    }

    /* ==========================================
       MODAL ACCESSIBILITY
    ========================================== */

    modal.addEventListener("click", event => {
        if (
            event.target.dataset.close === "true"
        ) {
            closeModal();
        }
    });

    document.addEventListener(
        "keydown",
        event => {
            if (modal.hidden) return;

            if (event.key === "Escape") {
                event.preventDefault();
                closeModal();
            }

            if (event.key !== "Tab") return;

            const focusable = [
                ...modal.querySelectorAll(
                    'button:not([disabled]), ' +
                    'input:not([disabled]), ' +
                    'select:not([disabled]), ' +
                    'textarea:not([disabled])'
                )
            ].filter(element =>
                element.getClientRects().length
            );

            if (!focusable.length) return;

            const first = focusable[0];
            const last =
                focusable[focusable.length - 1];

            if (
                event.shiftKey &&
                document.activeElement === first
            ) {
                event.preventDefault();
                last.focus();
            } else if (
                !event.shiftKey &&
                document.activeElement === last
            ) {
                event.preventDefault();
                first.focus();
            }
        }
    );

    /* ==========================================
       BOOKING ENTRY POINTS
    ========================================== */

    root.addEventListener(
        "click",
        event => {
            const button = event.target.closest(
                "button[data-stay]"
            );

            if (!button) return;

            const country =
                button.dataset.country;

            const town =
                button.dataset.stay;

            if (!validTown(country, town)) {
                return;
            }

            // Opening the popup does not add a stay.
            // The visitor must confirm the destination.
            openModal(country, town);
        }
    );

    // Expose a safe entry point for the next
    // stage: the shared Plan My Trip popup.
    window.mtaliiiOpenStayPlanner = () => {
        openModal();
    };

    countryFilter.addEventListener(
        "change",
        renderCards
    );

    search.addEventListener(
        "input",
        renderCards
    );

    renderCards();
})();