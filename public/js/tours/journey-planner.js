(() => {
    "use strict";

    /*
    ==================================================
    MTALIII AFRICA — UNIFIED JOURNEY PLANNER
    ==================================================

    Supports:
    - Tourist attractions from all African countries
    - Accommodation selections
    - Persistent selections after refresh
    - Adding and removing destinations
    - Individual attraction visit dates
    - Accommodation check-in and check-out dates
    - Traveller and room details
    - One combined travel enquiry

    Storage:
    mtaliii-tour-itinerary-v1
    mtaliii-stay-planner-v2
    mtaliii-tour-dates-v1
    ==================================================
    */

    const TOUR_KEY = "mtaliii-tour-itinerary-v1";
    const STAY_KEY = "mtaliii-stay-planner-v2";
    const TOUR_DATES_KEY = "mtaliii-tour-dates-v1";

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

    function read(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            console.error("Mtaliii storage error:", key, error);
            return fallback;
        }
    }

    function write(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error("Mtaliii save error:", key, error);
            return false;
        }
    }

    function today() {
        const d = new Date();

        return [
            d.getFullYear(),
            String(d.getMonth() + 1).padStart(2, "0"),
            String(d.getDate()).padStart(2, "0")
        ].join("-");
    }

    function addDays(value, count) {
        const d = new Date(value + "T12:00:00");
        d.setDate(d.getDate() + count);

        return [
            d.getFullYear(),
            String(d.getMonth() + 1).padStart(2, "0"),
            String(d.getDate()).padStart(2, "0")
        ].join("-");
    }

    function daysBetween(a, b) {
        return Math.round(
            (
                new Date(b + "T12:00:00") -
                new Date(a + "T12:00:00")
            ) / 86400000
        );
    }

    function validDate(value) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
            return false;
        }

        const d = new Date(value + "T12:00:00");

        return !Number.isNaN(d.getTime()) &&
            todayFromDate(d) === value;
    }

    function todayFromDate(d) {
        return [
            d.getFullYear(),
            String(d.getMonth() + 1).padStart(2, "0"),
            String(d.getDate()).padStart(2, "0")
        ].join("-");
    }

    /*
    ==================================================
    TOURING ATTRACTIONS
    ==================================================
    */

    function normalizeTour(item) {
        if (!item || typeof item !== "object") {
            return null;
        }

        const name = String(item.name || "").trim();

        if (!name) return null;

        return {
            name,
            country: String(item.country || "Kenya").trim(),
            location: String(
                item.location || item.county || ""
            ).trim(),
            category: String(item.category || "").trim()
        };
    }

    function tourKey(tour) {
        const item = normalizeTour(tour);

        if (!item) return "";

        return [
            item.name.toLowerCase(),
            item.country.toLowerCase()
        ].join("::");
    }

    function getTours() {
        /*
        Always read the latest localStorage data.

        Do not use a separate outdated array.
        */

        const stored = read(TOUR_KEY, []);

        if (!Array.isArray(stored)) return [];

        const unique = new Map();

        stored.forEach(item => {
            const tour = normalizeTour(item);

            if (tour) {
                unique.set(tourKey(tour), tour);
            }
        });

        return [...unique.values()];
    }

    function saveTours(tours) {
        const unique = new Map();

        tours.forEach(item => {
            const tour = normalizeTour(item);

            if (tour) {
                unique.set(tourKey(tour), tour);
            }
        });

        const updated = [...unique.values()];

        const controller = window.MtaliiiTourItinerary;

        /*
        Prefer the controller in app.js when available.
        This keeps both scripts synchronized.
        */

        if (
            controller &&
            typeof controller.saveTours === "function"
        ) {
            return controller.saveTours(updated);
        }

        if (!write(TOUR_KEY, updated)) {
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

        return true;
    }

    function removeTour(tour) {
        const key = tourKey(tour);

        if (!key) return false;

        return saveTours(
            getTours().filter(
                item => tourKey(item) !== key
            )
        );
    }

    /*
    ==================================================
    ACCOMMODATION
    ==================================================
    */

    function getStayPlanner() {
        const saved = read(STAY_KEY, {});

        return saved &&
            typeof saved === "object" &&
            !Array.isArray(saved)
            ? saved
            : {};
    }

    function getStays() {
        const planner = getStayPlanner();

        return Array.isArray(planner.stays)
            ? planner.stays
            : [];
    }

    function saveStays(stays) {
        const planner = getStayPlanner();

        planner.stays = stays;

        if (!write(STAY_KEY, planner)) {
            return false;
        }

        window.dispatchEvent(
            new CustomEvent(
                "mtaliii:accommodation-changed",
                {
                    detail: { stays }
                }
            )
        );

        return true;
    }

    /*
    ==================================================
    TOUR VISIT DATES
    ==================================================
    */

    function tourDateKey(tour) {
        return [
            tour.name,
            tour.country || "",
            tour.location || ""
        ].join("::");
    }

    function getTourDates() {
        const saved = read(TOUR_DATES_KEY, {});

        return saved &&
            typeof saved === "object" &&
            !Array.isArray(saved)
            ? saved
            : {};
    }

    function saveTourDates(dates) {
        return write(TOUR_DATES_KEY, dates);
    }

    /*
    ==================================================
    CREATE PLANNER
    ==================================================
    */

    const oldModal = document.getElementById(
        "mtJourneyModal"
    );

    if (oldModal) {
        oldModal.remove();
    }

    const modal = document.createElement("div");

    modal.id = "mtJourneyModal";
    modal.hidden = true;

    modal.innerHTML = `
        <div class="mt-journey-backdrop"></div>

        <section
            class="mt-journey-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mtJourneyTitle"
            tabindex="-1"
        >
            <div class="mt-journey-content"></div>
        </section>
    `;

    document.body.appendChild(modal);

    const content = modal.querySelector(
        ".mt-journey-content"
    );

    const dialog = modal.querySelector(
        ".mt-journey-dialog"
    );

    let previousFocus = null;
    let submitting = false;
    let successScreen = false;

    const contact = {
        name: "",
        email: "",
        phone: "",
        notes: ""
    };

    /*
    ==================================================
    STYLING
    ==================================================
    */

    const style = document.createElement("style");

    style.textContent = `
        #mtJourneyModal[hidden] {
            display: none !important;
        }

        #mtJourneyModal {
            position: fixed;
            inset: 0;
            z-index: 99999;
        }

        .mt-journey-backdrop {
            position: absolute;
            inset: 0;
            background: rgba(8,24,19,.78);
        }

        .mt-journey-dialog {
            position: relative;
            width: min(1000px, calc(100% - 24px));
            max-height: 94vh;
            margin: 3vh auto;
            overflow-y: auto;
            background: #fff;
            border-radius: 18px;
            box-shadow: 0 20px 80px rgba(0,0,0,.25);
            color: #173b2d;
        }

        .mt-journey-content {
            padding: 26px;
        }

        .mt-journey-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 15px;
            margin-bottom: 24px;
        }

        .mt-journey-header h2 {
            margin: 5px 0;
            font-size: clamp(24px,4vw,34px);
        }

        .mt-journey-header p {
            margin: 0;
            color: #65766d;
        }

        .mt-journey-close {
            border: 0;
            background: #edf2ef;
            color: #173b2d;
            border-radius: 50%;
            width: 42px;
            height: 42px;
            font-size: 26px;
            cursor: pointer;
            flex-shrink: 0;
        }

        .mt-journey-section {
            border: 1px solid #e1e9e4;
            border-radius: 14px;
            padding: 20px;
            margin-bottom: 18px;
        }

        .mt-journey-section h3 {
            margin: 0 0 15px;
            font-size: 19px;
        }

        .mt-journey-empty {
            color: #78867e;
            font-size: 14px;
            padding: 12px 0;
        }

        .mt-journey-item {
            padding: 14px 0;
            border-bottom: 1px solid #edf1ee;
        }

        .mt-journey-item:last-child {
            border-bottom: 0;
        }

        .mt-journey-item-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
        }

        .mt-journey-item strong {
            display: block;
            font-size: 15px;
        }

        .mt-journey-item small {
            color: #697b70;
        }

        .mt-journey-remove {
            background: transparent;
            border: 1px solid #dfb9b9;
            color: #a13e3e;
            border-radius: 8px;
            padding: 8px 12px;
            cursor: pointer;
        }

        .mt-journey-grid {
            display: grid;
            grid-template-columns: repeat(2,minmax(0,1fr));
            gap: 14px;
            margin-top: 12px;
        }

        .mt-journey-grid.three {
            grid-template-columns: repeat(3,minmax(0,1fr));
        }

        .mt-journey-field {
            display: flex;
            flex-direction: column;
            gap: 7px;
            font-size: 13px;
            font-weight: 600;
        }

        .mt-journey-field input,
        .mt-journey-field select,
        .mt-journey-field textarea {
            width: 100%;
            box-sizing: border-box;
            padding: 12px;
            border: 1px solid #ccd9d0;
            border-radius: 8px;
            font: inherit;
            color: #173b2d;
            background: #fff;
        }

        .mt-journey-hint {
            color: #75847a;
            font-size: 12px;
            margin-top: 10px;
        }

        .mt-journey-summary {
            background: #f3f7f4;
            border-radius: 12px;
            padding: 18px;
            margin-bottom: 18px;
        }

        .mt-journey-summary-row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            padding: 8px 0;
            font-size: 14px;
        }

        .mt-journey-submit {
            width: 100%;
            background: #176844;
            color: white;
            padding: 16px;
            border: 0;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
        }

        .mt-journey-submit:disabled {
            opacity: .55;
            cursor: not-allowed;
        }

        .mt-journey-error {
            color: #ad3030;
            font-size: 14px;
            margin: 12px 0;
        }

        .mt-journey-success {
            text-align: center;
            padding: 35px 10px;
        }

        @media(max-width:600px) {
            .mt-journey-content {
                padding: 16px;
            }

            .mt-journey-grid,
            .mt-journey-grid.three {
                grid-template-columns: 1fr;
            }
        }
    `;

    document.head.appendChild(style);

    /*
    ==================================================
    OPEN AND CLOSE
    ==================================================
    */

    function openPlanner() {
        previousFocus = document.activeElement;
        successScreen = false;

        modal.hidden = false;
        document.body.style.overflow = "hidden";

        render();
        dialog.focus();
    }

    function closePlanner() {
        if (submitting) return;

        modal.hidden = true;
        document.body.style.overflow = "";

        previousFocus?.focus?.();
    }

    /*
    ==================================================
    KEEP FORM DETAILS DURING UPDATES
    ==================================================
    */

    function rememberContact() {
        const form = $("#mtJourneyForm");

        if (!form) return;

        contact.name = form.elements.name?.value || "";
        contact.email = form.elements.email?.value || "";
        contact.phone = form.elements.phone?.value || "";
        contact.notes = form.elements.notes?.value || "";

        const planner = getStayPlanner();

        planner.adults = Number(
            form.elements.adults?.value || 2
        );

        planner.children = Number(
            form.elements.children?.value || 0
        );

        if (
            form.elements.rooms &&
            !form.elements.rooms.disabled
        ) {
            planner.rooms = Number(
                form.elements.rooms.value || 1
            );
        }

        write(STAY_KEY, planner);
    }

    function restoreContact() {
        const form = $("#mtJourneyForm");

        if (!form) return;

        form.elements.name.value = contact.name;
        form.elements.email.value = contact.email;
        form.elements.phone.value = contact.phone;
        form.elements.notes.value = contact.notes;
    }

    /*
    ==================================================
    DATE VALIDATION
    ==================================================
    */

    function validate(tours, stays, dates) {
        if (!tours.length && !stays.length) {
            return "Please select at least one destination.";
        }

        for (const tour of tours) {
            const date = dates[tourDateKey(tour)];

            if (!validDate(date) || date < today()) {
                return (
                    "Please choose a valid visit date for " +
                    tour.name + "."
                );
            }
        }

        const ordered = [...stays].sort(
            (a, b) =>
                String(a.checkin || "").localeCompare(
                    String(b.checkin || "")
                )
        );

        for (let i = 0; i < ordered.length; i++) {
            const stay = ordered[i];

            if (
                !validDate(stay.checkin) ||
                !validDate(stay.checkout) ||
                stay.checkin < today() ||
                daysBetween(stay.checkin, stay.checkout) < 1 ||
                daysBetween(stay.checkin, stay.checkout) > 90
            ) {
                return (
                    "Please check accommodation dates for " +
                    stay.town + "."
                );
            }

            if (
                i > 0 &&
                ordered[i - 1].checkout > stay.checkin
            ) {
                return (
                    "Accommodation dates overlap between " +
                    ordered[i - 1].town +
                    " and " +
                    stay.town + "."
                );
            }
        }

        const allDates = [
            ...tours.map(
                tour => dates[tourDateKey(tour)]
            ),
            ...stays.flatMap(stay => [
                stay.checkin,
                stay.checkout
            ])
        ].sort();

        if (
            allDates.length &&
            daysBetween(
                allDates[0],
                allDates[allDates.length - 1]
            ) > 90
        ) {
            return "The full journey cannot exceed 90 days.";
        }

        return "";
    }

    /*
    ==================================================
    RENDER THE COMPLETE PLANNER
    ==================================================
    */

    function render(message = "") {
        if (modal.hidden || submitting || successScreen) {
            return;
        }

        const tours = getTours();
        const stays = getStays();
        const dates = getTourDates();
        const planner = getStayPlanner();

        content.innerHTML = `
            <div class="mt-journey-header">
                <div>
                    <small>MTALIII AFRICA</small>

                    <h2 id="mtJourneyTitle">
                        Plan My Visit
                    </h2>

                    <p>
                        Your African journey, your choices.
                    </p>
                </div>

                <button
                    type="button"
                    class="mt-journey-close"
                    id="mtJourneyClose"
                    aria-label="Close planner"
                >
                    ×
                </button>
            </div>

            <form id="mtJourneyForm">

                <div class="mt-journey-section">
                    <h3>
                        Touring attractions (${tours.length})
                    </h3>

                    ${tours.length
                ? tours.map((tour, index) => `
                            <div class="mt-journey-item">
                                <div class="mt-journey-item-top">
                                    <div>
                                        <strong>
                                            ${index + 1}.
                                            ${esc(tour.name)}
                                        </strong>

                                        <small>
                                            ${esc(tour.location)}
                                            ${tour.country
                        ? " · " + esc(tour.country)
                        : ""}
                                        </small>
                                    </div>

                                    <button
                                        type="button"
                                        class="mt-journey-remove"
                                        data-remove-tour="${index}"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <div class="mt-journey-grid">
                                    <label class="mt-journey-field">
                                        Visit date

                                        <input
                                            type="date"
                                            data-tour-date="${index}"
                                            min="${today()}"
                                            value="${esc(
                            dates[tourDateKey(tour)] || ""
                        )}"
                                        >
                                    </label>
                                </div>
                            </div>
                        `).join("")
                : `
                            <p class="mt-journey-empty">
                                No attractions selected.
                                Add tourist sites while exploring Africa.
                            </p>
                        `
            }
                </div>

                <div class="mt-journey-section">
                    <h3>
                        Accommodation (${stays.length})
                    </h3>

                    ${stays.length
                ? stays.map((stay, index) => `
                            <div class="mt-journey-item">
                                <div class="mt-journey-item-top">
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
                                        class="mt-journey-remove"
                                        data-remove-stay="${index}"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <div class="mt-journey-grid">
                                    <label class="mt-journey-field">
                                        Check-in

                                        <input
                                            type="date"
                                            data-stay-index="${index}"
                                            data-stay-field="checkin"
                                            min="${today()}"
                                            value="${esc(stay.checkin || "")}"
                                        >
                                    </label>

                                    <label class="mt-journey-field">
                                        Check-out

                                        <input
                                            type="date"
                                            data-stay-index="${index}"
                                            data-stay-field="checkout"
                                            min="${today()}"
                                            value="${esc(stay.checkout || "")}"
                                        >
                                    </label>
                                </div>
                            </div>
                        `).join("")
                : `
                            <p class="mt-journey-empty">
                                No accommodation selected.
                                Add accommodation destinations while browsing.
                            </p>
                        `
            }
                </div>

                <div class="mt-journey-section">
                    <h3>Travellers and rooms</h3>

                    <div class="mt-journey-grid three">
                        <label class="mt-journey-field">
                            Adults

                            <input
                                type="number"
                                name="adults"
                                min="1"
                                max="30"
                                value="${esc(planner.adults ?? 2)}"
                                required
                            >
                        </label>

                        <label class="mt-journey-field">
                            Children

                            <input
                                type="number"
                                name="children"
                                min="0"
                                max="30"
                                value="${esc(planner.children ?? 0)}"
                                required
                            >
                        </label>

                        <label class="mt-journey-field">
                            Rooms

                            <input
                                type="number"
                                name="rooms"
                                min="1"
                                max="20"
                                value="${esc(planner.rooms ?? 1)}"
                                ${stays.length ? "required" : "disabled"}
                            >
                        </label>
                    </div>

                    <p class="mt-journey-hint">
                        Rooms are needed only when accommodation
                        is included.
                    </p>
                </div>

                <div class="mt-journey-section">
                    <h3>Contact details</h3>

                    <div class="mt-journey-grid">
                        <label class="mt-journey-field">
                            Full name

                            <input
                                name="name"
                                required
                                maxlength="120"
                                autocomplete="name"
                            >
                        </label>

                        <label class="mt-journey-field">
                            Email

                            <input
                                name="email"
                                type="email"
                                required
                                maxlength="180"
                                autocomplete="email"
                            >
                        </label>

                        <label class="mt-journey-field">
                            Phone / WhatsApp

                            <input
                                name="phone"
                                type="tel"
                                required
                                maxlength="50"
                                autocomplete="tel"
                            >
                        </label>
                    </div>

                    <label
                        class="mt-journey-field"
                        style="margin-top:12px"
                    >
                        Special requests

                        <textarea
                            name="notes"
                            rows="3"
                            maxlength="900"
                            placeholder="Anything else we should know?"
                        ></textarea>
                    </label>
                </div>

                <div class="mt-journey-summary">
                    <h3>Journey summary</h3>

                    <div class="mt-journey-summary-row">
                        <span>Touring attractions</span>
                        <strong>${tours.length}</strong>
                    </div>

                    <div class="mt-journey-summary-row">
                        <span>Accommodation destinations</span>
                        <strong>${stays.length}</strong>
                    </div>

                    <div class="mt-journey-summary-row">
                        <span>Journey type</span>

                        <strong>
                            ${tours.length && stays.length
                ? "Tours + accommodation"
                : tours.length
                    ? "Tours only"
                    : stays.length
                        ? "Accommodation only"
                        : "Not selected"
            }
                        </strong>
                    </div>
                </div>

                <p
                    class="mt-journey-error"
                    id="mtJourneyError"
                    role="alert"
                >${esc(message)}</p>

                <button
                    type="submit"
                    class="mt-journey-submit"
                    id="mtJourneySubmit"
                    ${!tours.length && !stays.length
                ? "disabled"
                : ""}
                >
                    Submit travel enquiry ↗
                </button>

                <p class="mt-journey-hint">
                    Submitting an enquiry does not confirm
                    tour or accommodation availability.
                </p>
            </form>
        `;

        bindEvents();
    }

    /*
    ==================================================
    CONNECT FORM EVENTS
    ==================================================
    */

    function bindEvents() {
        const close = $("#mtJourneyClose");

        if (close) {
            close.onclick = closePlanner;
        }

        const form = $("#mtJourneyForm");

        if (!form) return;

        restoreContact();

        form.addEventListener("input", event => {
            if (
                [
                    "name",
                    "email",
                    "phone",
                    "notes",
                    "adults",
                    "children",
                    "rooms"
                ].includes(event.target.name)
            ) {
                rememberContact();
            }
        });

        /*
        TOUR VISIT DATES
        */

        content.querySelectorAll(
            "[data-tour-date]"
        ).forEach(input => {
            input.onchange = () => {
                rememberContact();

                const tours = getTours();

                const tour = tours[
                    Number(input.dataset.tourDate)
                ];

                if (!tour) return;

                const dates = getTourDates();
                const key = tourDateKey(tour);

                if (input.value) {
                    dates[key] = input.value;
                } else {
                    delete dates[key];
                }

                saveTourDates(dates);
                render();
            };
        });

        /*
        ACCOMMODATION DATES
        */

        content.querySelectorAll(
            "[data-stay-index]"
        ).forEach(input => {
            input.onchange = () => {
                rememberContact();

                const stays = getStays();
                const index = Number(
                    input.dataset.stayIndex
                );

                if (!stays[index]) return;

                const field = input.dataset.stayField;

                if (
                    field !== "checkin" &&
                    field !== "checkout"
                ) {
                    return;
                }

                stays[index][field] = input.value;

                saveStays(stays);
                render();
            };
        });

        /*
        REMOVE TOUR
        */

        content.querySelectorAll(
            "[data-remove-tour]"
        ).forEach(button => {
            button.onclick = () => {
                rememberContact();

                const tours = getTours();

                const index = Number(
                    button.dataset.removeTour
                );

                const tour = tours[index];

                if (!tour) return;

                const dates = getTourDates();

                delete dates[tourDateKey(tour)];

                saveTourDates(dates);

                removeTour(tour);

                render();
            };
        });

        /*
        REMOVE ACCOMMODATION
        */

        content.querySelectorAll(
            "[data-remove-stay]"
        ).forEach(button => {
            button.onclick = () => {
                rememberContact();

                const stays = getStays();

                const index = Number(
                    button.dataset.removeStay
                );

                if (
                    index < 0 ||
                    index >= stays.length
                ) {
                    return;
                }

                stays.splice(index, 1);

                saveStays(stays);
                render();
            };
        });

        form.onsubmit = submitJourney;
    }

    /*
    ==================================================
    SUBMIT ONE TRAVEL ENQUIRY
    ==================================================
    */

    async function submitJourney(event) {
        event.preventDefault();

        if (submitting) return;

        rememberContact();

        const tours = getTours();
        const stays = getStays();
        const dates = getTourDates();

        const error = $("#mtJourneyError");

        const problem = validate(
            tours,
            stays,
            dates
        );

        if (problem) {
            error.textContent = problem;
            return;
        }

        const form = event.target;

        if (!form.reportValidity()) return;

        const allDates = [
            ...tours.map(
                tour => dates[tourDateKey(tour)]
            ),
            ...stays.flatMap(stay => [
                stay.checkin,
                stay.checkout
            ])
        ].sort();

        const start = allDates[0];
        const end = allDates[allDates.length - 1];

        const adults = Number(
            form.elements.adults.value
        );

        const children = Number(
            form.elements.children.value
        );

        const rooms = stays.length
            ? Number(form.elements.rooms.value)
            : 0;

        if (
            !Number.isInteger(adults) ||
            adults < 1 ||
            adults > 30 ||
            !Number.isInteger(children) ||
            children < 0 ||
            children > 30 ||
            adults + children > 40 ||
            (
                stays.length &&
                (
                    !Number.isInteger(rooms) ||
                    rooms < 1 ||
                    rooms > 20
                )
            )
        ) {
            error.textContent =
                "Please check the traveller and room numbers.";

            return;
        }

        const enquiryType =
            tours.length && stays.length
                ? "combined"
                : tours.length
                    ? "tour"
                    : "accommodation";

        const tourLines = tours.map(tour =>
            `${tour.name}, ${tour.location}, ` +
            `${tour.country} — ` +
            `${dates[tourDateKey(tour)]}`
        );

        const stayLines = stays.map(stay =>
            `${stay.town}, ${stay.country} — ` +
            `${stay.checkin} to ${stay.checkout}`
        );

        const notes = [
            "MTALIII AFRICA JOURNEY",
            "",
            "TOURS:",
            ...tourLines,
            "",
            "ACCOMMODATION:",
            ...stayLines,
            "",
            "ROOMS: " + rooms,
            "SPECIAL REQUESTS:",
            contact.notes || "None"
        ].join("\n");

        const payload = {
            enquiryType,

            name: contact.name.trim(),
            email: contact.email.trim(),
            phone: contact.phone.trim(),

            country: "Multiple destinations",

            date: start,
            checkout: end,

            days: Math.max(
                1,
                daysBetween(start, end)
            ),

            guests: adults + children,
            adults,
            children,
            rooms,

            destinations: [
                ...tours.map(tour => tour.name),
                ...stays.map(
                    stay =>
                        stay.town + ", " +
                        stay.country
                )
            ],

            tours: tours.map(tour => ({
                ...tour,
                visitDate: dates[tourDateKey(tour)]
            })),

            accommodation: stays.map(
                stay => ({ ...stay })
            ),

            notes
        };

        const button = $("#mtJourneySubmit");

        submitting = true;

        button.disabled = true;
        button.textContent = "Submitting...";

        try {
            const response = await fetch(
                "/api/inquiries",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify(payload)
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(
                    result.error ||
                    "Unable to submit enquiry."
                );
            }

            /*
            Keep all destinations saved.
            Do not clear the itinerary.
            */

            successScreen = true;

            content.innerHTML = `
                <div class="mt-journey-success">
                    <h2>✓ Enquiry received</h2>

                    <p>
                        Your travel enquiry was submitted.
                    </p>

                    <p>
                        Reference:
                        <strong>
                            ${esc(result.reference || "")}
                        </strong>
                    </p>

                    <p>
                        Your selected attractions and
                        accommodation remain saved.
                    </p>

                    <button
                        type="button"
                        class="mt-journey-submit"
                        id="mtJourneyDone"
                    >
                        Continue exploring
                    </button>
                </div>
            `;

            $("#mtJourneyDone").onclick = closePlanner;

        } catch (err) {
            error.textContent =
                err.message || "Please try again.";

            button.disabled = false;

            button.textContent =
                "Submit travel enquiry ↗";

        } finally {
            submitting = false;
        }
    }

    /*
    ==================================================
    AUTOMATIC SYNCHRONIZATION
    ==================================================
    */

    function refreshPlanner() {
        if (modal.hidden || submitting || successScreen) {
            return;
        }

        rememberContact();
        render();
    }

    /*
    Refresh when any attraction is added or removed.
    */

    window.addEventListener(
        "mtaliii:tour-itinerary-changed",
        refreshPlanner
    );

    /*
    Refresh when accommodation changes.
    */

    window.addEventListener(
        "mtaliii:accommodation-changed",
        refreshPlanner
    );

    /*
    Refresh when storage changes in another tab.
    */

    window.addEventListener(
        "storage",
        event => {
            if (
                event.key === TOUR_KEY ||
                event.key === STAY_KEY
            ) {
                refreshPlanner();
            }
        }
    );

    /*
    ==================================================
    CLOSE EVENTS
    ==================================================
    */

    modal.querySelector(
        ".mt-journey-backdrop"
    ).onclick = closePlanner;

    document.addEventListener(
        "keydown",
        event => {
            if (modal.hidden) return;

            if (event.key === "Escape") {
                closePlanner();
            }
        }
    );

    /*
    ==================================================
    PUBLIC PLANNER FUNCTIONS
    ==================================================
    */

    window.mtaliiiOpenJourneyPlanner = openPlanner;
    window.mtaliiiOpenStayPlanner = openPlanner;

    /*
    Diagnostic helper.

    This reports the exact attractions currently saved.
    It does not change or delete any selection.
    */

    window.mtaliiiCheckItinerary = function () {
        const tours = getTours();
        const stays = getStays();

        console.log(
            "MTALIII AFRICA — ITINERARY STATUS"
        );

        console.log(
            "Touring attractions:",
            tours.length
        );

        console.table(tours);

        console.log(
            "Accommodation:",
            stays.length
        );

        console.table(stays);

        return {
            tours,
            stays,
            tourCount: tours.length,
            stayCount: stays.length
        };
    };

})();
