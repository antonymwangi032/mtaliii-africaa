/* MTALIII_APP_SCOPE_REPAIR_V1 */
(() => {
'use strict';

/*
====================================================
MTALIII AFRICA — MAIN APPLICATION
Unified touring itinerary, photography, agencies,
enquiries and dashboards
====================================================
*/

const $ = selector => document.querySelector(selector);

const esc = value => String(value ?? '').replace(
    /[&<>"']/g,
    char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[char]
);

/*
====================================================
HERO SLIDESHOW
====================================================
*/

const hero = [
    ['photo-1546182990-dffeafbe841d', 'African lion · The Big Five'],
    ['photo-1564760055775-d63b17a55c44', 'African elephant · The Big Five'],
    ['photo-1516026672322-bc52d61a55d5', 'African leopard · The Big Five'],
    ['photo-1549366021-9f761d450615', 'African buffalo · The Big Five'],
    ['photo-1511497584788-876760111969', 'Rhinoceros · The Big Five'],
    ['photo-1516426122078-c23e76319801', 'Safari landscapes · Africa'],
    ['photo-1507525428034-b723cf961d3e', 'Indian Ocean · Africa'],
    ['photo-1464822759023-fed622ff2c3b', 'Mountain landscapes · Africa']
];

let slide = 0;

function showHero() {
    const bg = $('#heroBg');
    if (!bg) return;

    const currentIndex = slide;
    const [photo, caption] = hero[currentIndex];

    bg.style.backgroundImage = 'url(/assets/landscape-1.svg)';
    bg.dataset.slide = String(currentIndex);

    const image = new Image();

    image.onload = () => {
        if (bg.dataset.slide === String(currentIndex)) {
            bg.style.backgroundImage =
                `linear-gradient(90deg,rgba(7,27,21,.15),transparent),url(${image.src})`;
        }
    };

    image.src = `/cached-photo/${photo}?w=1800`;

    if ($('#heroNumber')) {
        $('#heroNumber').textContent =
            String(currentIndex + 1).padStart(2, '0');
    }

    if ($('#heroCaption')) {
        $('#heroCaption').textContent = caption;
    }

    const total = document.querySelector(
        '.hero-counter span:nth-child(3)'
    );

    if (total) {
        total.textContent =
            String(hero.length).padStart(2, '0');
    }

    slide = (slide + 1) % hero.length;
}

showHero();
setInterval(showHero, 6500);

/*
====================================================
DESTINATION PHOTOGRAPHS
====================================================
*/

const imageCache = new Map();
let imageActive = 0;
const imageQueue = [];

async function findImage(name) {
    if (imageCache.has(name)) {
        return imageCache.get(name);
    }

    try {
        const url = new URL(
            'https://commons.wikimedia.org/w/api.php'
        );

        url.searchParams.set('action', 'query');
        url.searchParams.set('generator', 'search');
        url.searchParams.set(
            'gsrsearch',
            'filetype:bitmap "' + name + '"'
        );
        url.searchParams.set('gsrnamespace', '6');
        url.searchParams.set('gsrlimit', '6');
        url.searchParams.set('prop', 'imageinfo');
        url.searchParams.set('iiprop', 'url|mime|extmetadata');
        url.searchParams.set('iiurlwidth', '680');
        url.searchParams.set('format', 'json');
        url.searchParams.set('origin', '*');

        const response = await fetch(url, {
            signal: AbortSignal.timeout(8500)
        });

        if (!response.ok) {
            throw new Error('Photo service unavailable');
        }

        const data = await response.json();
        const pages = Object.values(data.query?.pages || {});

        const words = name
            .toLowerCase()
            .replace(/[^a-z0-9 ]/g, '')
            .split(' ')
            .filter(word => word.length > 3);

        const found = pages.find(page => {
            const title = page.title.toLowerCase();

            const matches = words.filter(
                word => title.includes(word)
            ).length;

            return matches >= Math.min(2, words.length) &&
                page.imageinfo?.[0]?.mime?.startsWith('image/');
        });

        const imageUrl =
            found?.imageinfo?.[0]?.thumburl || null;

        imageCache.set(name, imageUrl);

        return imageUrl;

    } catch {
        imageCache.set(name, null);
        return null;
    }
}

function queuePhoto(element, name) {
    imageQueue.push({ element, name });
    drain();
}

function drain() {
    while (imageActive < 3 && imageQueue.length) {
        const { element, name } = imageQueue.shift();

        if (!element.isConnected) continue;

        imageActive++;

        findImage(name)
            .then(url => {
                if (!url || !element.isConnected) return;

                const img = document.createElement('img');

                img.alt = 'Wikimedia Commons image search: ' + name;
                img.loading = 'eager';
                img.referrerPolicy = 'no-referrer';
                img.src = url;
                img.onerror = () => img.remove();

                element.prepend(img);
            })
            .finally(() => {
                imageActive--;
                drain();
            });
    }
}

/*
====================================================
THE BIG FIVE
====================================================
*/

const animals = [
    ['African lion', 'photo-1546182990-dffeafbe841d'],
    ['African elephant', 'photo-1564760055775-d63b17a55c44'],
    ['African leopard', 'photo-1516026672322-bc52d61a55d5'],
    ['African buffalo', 'photo-1549366021-9f761d450615'],
    ['Rhinoceros', 'photo-1511497584788-876760111969']
];

const animalDescriptions = [
    'The iconic African lion, often seen in savannah ecosystems.',
    'African elephants travel in family herds across grasslands and woodlands.',
    'The elusive African leopard is a skilled, mostly solitary hunter.',
    'African buffalo are powerful herd animals of savannah and woodland.',
    'African rhinoceroses are threatened species protected in conservation areas.'
];

const bigFiveRoot = $('#bigfive');

if (bigFiveRoot) {
    bigFiveRoot.innerHTML = animals.map(([name]) => `
        <div class="animal">
            <div class="photo"
                 style="height:100%;position:absolute;inset:0">
                ${esc(name)}
            </div>
            <span>${esc(name)}</span>
        </div>
    `).join('');

    [...bigFiveRoot.children].forEach((element, index) => {
        const photo = element.querySelector('.photo');

        if (photo) {
            photo.style.backgroundImage =
                `url(/cached-photo/${animals[index][1]}?w=900)`;
        }

        element.setAttribute(
            'aria-label',
            animals[index][0]
        );

        element.title = animalDescriptions[index];

        const link = document.createElement('a');

        link.href = '#countries';
        link.textContent = 'Explore wildlife experiences ↗';
        link.className = 'bigfive-link';

        link.style.cssText =
            'position:absolute;bottom:10px;left:12px;' +
            'right:12px;color:white;background:#123b2bc9;' +
            'padding:7px;border-radius:7px;' +
            'text-align:center;font-size:12px';

        element.append(link);
    });
}

/*
====================================================
UNIFIED TOURING ITINERARY
====================================================
*/

const tourStorageKey = 'mtaliii-tour-itinerary-v1';

const destinationsData =
    typeof DESTINATIONS !== 'undefined' &&
    Array.isArray(DESTINATIONS)
        ? DESTINATIONS
        : [];

const categoriesData =
    typeof CATEGORIES !== 'undefined' &&
    Array.isArray(CATEGORIES)
        ? CATEGORIES
        : [];

const counties = [
    ...new Set(
        destinationsData
            .map(item => item.county)
            .filter(name =>
                name &&
                name !== 'County to confirm' &&
                name !== 'Multiple counties'
            )
    )
].sort();

const countySelect = $('#county');
const categorySelect = $('#category');

if (countySelect) {
    counties.forEach(county => {
        const exists = [...countySelect.options].some(
            option => option.value === county
        );

        if (!exists) {
            countySelect.add(new Option(county, county));
        }
    });
}

if (categorySelect) {
    categoriesData.forEach(category => {
        const exists = [...categorySelect.options].some(
            option => option.value === category
        );

        if (!exists) {
            categorySelect.add(new Option(category, category));
        }
    });
}

let limit = 12;
let hotelLimit = 9;

/*
The shared localStorage array is the source of truth.

Do not keep a separate list that overwrites attractions
selected from the African-country directory.
*/

function normalizeTour(item) {
    if (!item || typeof item !== 'object') return null;

    const name = String(item.name || '').trim();

    if (!name) return null;

    return {
        name,
        country: String(item.country || 'Kenya').trim(),
        location: String(
            item.location || item.county || ''
        ).trim(),
        category: String(item.category || '').trim()
    };
}

function tourIdentity(item) {
    const tour = normalizeTour(item);

    if (!tour) return '';

    return [
        tour.name.toLowerCase(),
        tour.country.toLowerCase()
    ].join('::');
}

function getTourItinerary() {
    try {
        const stored = JSON.parse(
            localStorage.getItem(tourStorageKey) || '[]'
        );

        if (!Array.isArray(stored)) return [];

        const unique = new Map();

        stored.forEach(item => {
            const tour = normalizeTour(item);

            if (tour) {
                unique.set(tourIdentity(tour), tour);
            }
        });

        return [...unique.values()];

    } catch (error) {
        console.error('Could not load touring itinerary:', error);
        return [];
    }
}

function hasTour(destination) {
    const key = tourIdentity(destination);

    return getTourItinerary().some(
        item => tourIdentity(item) === key
    );
}

function updateTripDestinations() {
    const field = $('#tripDestinations');

    if (!field) return;

    field.value = getTourItinerary()
        .map(item => `${item.name} (${item.country})`)
        .join(', ');
}

function saveTourItinerary(itinerary) {
    if (!Array.isArray(itinerary)) return false;

    const unique = new Map();

    itinerary.forEach(item => {
        const tour = normalizeTour(item);

        if (tour) {
            unique.set(tourIdentity(tour), tour);
        }
    });

    const updated = [...unique.values()];

    try {
        localStorage.setItem(
            tourStorageKey,
            JSON.stringify(updated)
        );

    } catch (error) {
        console.error('Could not save touring itinerary:', error);
        return false;
    }

    updateTripDestinations();

    window.dispatchEvent(
        new CustomEvent('mtaliii:tour-itinerary-changed', {
            detail: {
                destinations: updated
            }
        })
    );

    return true;
}

function addTour(destination) {
    const tour = normalizeTour(destination);

    if (!tour) return false;

    const existing = getTourItinerary();

    if (existing.some(
        item => tourIdentity(item) === tourIdentity(tour)
    )) {
        return true;
    }

    existing.push(tour);

    return saveTourItinerary(existing);
}

function removeTour(destination) {
    const key = tourIdentity(destination);

    if (!key) return false;

    const updated = getTourItinerary().filter(
        item => tourIdentity(item) !== key
    );

    return saveTourItinerary(updated);
}

function toggleTour(destination) {
    return hasTour(destination)
        ? removeTour(destination)
        : addTour(destination);
}

/*
Make the shared functions available to other scripts.
*/

window.MtaliiiTourItinerary = {
    getTours: getTourItinerary,
    saveTours: saveTourItinerary,
    addTour,
    removeTour,
    toggleTour,
    hasTour,
    normalizeDestination: normalizeTour,
    destinationKey: tourIdentity
};

/*
====================================================
KENYA DESTINATION SEARCH
====================================================
*/

function filtered() {
    const query =
        $('#search')?.value.trim().toLowerCase() || '';

    const county = countySelect?.value || '';
    const category = categorySelect?.value || '';

    return destinationsData.filter(destination => {
        const searchable = [
            destination.name,
            destination.county,
            destination.category
        ].join(' ').toLowerCase();

        return (
            (!query || searchable.includes(query)) &&
            (!county || destination.county === county) &&
            (!category || destination.category === category)
        );
    });
}

function render() {
    const results = $('#results');

    if (!results) return;

    const items = filtered();

    if ($('#count')) {
        $('#count').textContent =
            `${items.length} matching listings · ` +
            `${destinationsData.length} total`;
    }

    results.innerHTML = items.slice(0, limit)
        .map((destination, index) => {
            const tour = {
                name: destination.name,
                country: 'Kenya',
                location: destination.county,
                category: destination.category
            };

            const selected = hasTour(tour);

            return `
                <article class="destination">
                    <div class="photo"
                         data-photo="${index}"
                         style="background-size:cover;
                                background-position:center">
                        <span>Photograph being checked</span>
                        <span class="category-tag">
                            ${esc(destination.category)}
                        </span>
                    </div>

                    <div class="body">
                        <h3>${esc(destination.name)}</h3>

                        <p>
                            📍 ${esc(destination.county)} · Kenya
                        </p>

                        <button
                            type="button"
                            data-add="${index}"
                            aria-pressed="${selected}">
                            ${selected
                                ? 'Remove from itinerary'
                                : 'Add to itinerary'}
                        </button>
                    </div>
                </article>
            `;
        })
        .join('');

    if ($('#loadMore')) {
        $('#loadMore').hidden = items.length <= limit;
    }

    results.querySelectorAll('[data-photo]')
        .forEach(element => {
            const destination =
                items[Number(element.dataset.photo)];

            if (destination) {
                queuePhoto(element, destination.name);
            }
        });

    results.querySelectorAll('[data-add]')
        .forEach(button => {
            button.onclick = () => {
                const destination =
                    items[Number(button.dataset.add)];

                if (!destination) return;

                toggleTour({
                    name: destination.name,
                    country: 'Kenya',
                    location: destination.county,
                    category: destination.category
                });

                render();
            };
        });
}

if ($('#search')) {
    $('#search').oninput = () => {
        limit = 12;
        render();
    };
}

if (countySelect) {
    countySelect.onchange = () => {
        limit = 12;
        render();
    };
}

if (categorySelect) {
    categorySelect.onchange = () => {
        limit = 12;
        render();
    };
}

if ($('#reset')) {
    $('#reset').onclick = () => {
        if ($('#search')) $('#search').value = '';
        if (countySelect) countySelect.value = '';
        if (categorySelect) categorySelect.value = '';

        limit = 12;
        render();
    };
}

if ($('#loadMore')) {
    $('#loadMore').onclick = () => {
        limit += 12;
        render();
    };
}

if ($('#destinationStat')) {
    $('#destinationStat').textContent =
        destinationsData.length + '+';
}

/*
Keep Kenya cards synchronized when the user selects
or removes an attraction through region-app.js
or the shared journey planner.
*/

window.addEventListener(
    'mtaliii:tour-itinerary-changed',
    () => {
        updateTripDestinations();
        render();
    }
);

window.addEventListener('storage', event => {
    if (event.key === tourStorageKey) {
        updateTripDestinations();
        render();
    }
});

render();
updateTripDestinations();

/*
====================================================
LEGACY HOTEL DIRECTORY
====================================================
*/

const hotelCounty = $('#hotelCounty');
const hotelSearch = $('#hotelSearch');
const hotelsRoot = $('#hotels');
const moreHotels = $('#moreHotels');

if (
    typeof HOTELS !== 'undefined' &&
    Array.isArray(HOTELS) &&
    hotelCounty &&
    hotelSearch &&
    hotelsRoot &&
    moreHotels
) {
    const hotelCounties = [
        ...new Set(HOTELS.map(hotel => hotel.county))
    ].sort();

    hotelCounties.forEach(county => {
        hotelCounty.add(new Option(county, county));
    });

    function renderHotels() {
        const query = hotelSearch.value.toLowerCase();
        const county = hotelCounty.value;

        const matches = HOTELS.filter(hotel =>
            (!county || hotel.county === county) &&
            hotel.name.toLowerCase().includes(query)
        );

        hotelsRoot.innerHTML = matches
            .slice(0, hotelLimit)
            .map(hotel => `
                <div class="hotel">
                    <span>
                        HOTEL / LODGE ·
                        ${esc(hotel.county.toUpperCase())} COUNTY
                    </span>

                    <h3>${esc(hotel.name)}</h3>

                    <span>
                        Rates and availability on enquiry.
                        Independently verify property.
                    </span>
                </div>
            `)
            .join('');

        moreHotels.hidden = matches.length <= hotelLimit;
    }

    hotelSearch.oninput = () => {
        hotelLimit = 9;
        renderHotels();
    };

    hotelCounty.onchange = () => {
        hotelLimit = 9;
        renderHotels();
    };

    moreHotels.onclick = () => {
        hotelLimit += 9;
        renderHotels();
    };

    renderHotels();
}

/*
====================================================
API HELPER
====================================================
*/

async function api(url, method = 'GET', data) {
    const token = sessionStorage.getItem('mtaliii_token');

    const response = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token
                ? { Authorization: 'Bearer ' + token }
                : {})
        },
        ...(data !== undefined
            ? { body: JSON.stringify(data) }
            : {})
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(
            result.error || 'Request failed'
        );
    }

    return result;
}

/*
====================================================
TOUR PARTNERS
====================================================
*/

async function agents() {
    try {
        const [real, demo] = await Promise.all([
            api('/api/agents'),
            api('/api/demo-agents')
        ]);

        if ($('#agencyList')) {
            $('#agencyList').innerHTML = real.length
                ? real.map(agent => `
                    <div class="agencycard">
                        <small>
                            ✓ APPROVED ON MTALIII ·
                            CHECK TRA LICENCE
                        </small>

                        <h3>${esc(agent.company)}</h3>

                        <p>Travel operator · Kenya</p>

                        <button type="button"
                                data-partner="${esc(agent.id)}">
                            Request this partner ↗
                        </button>
                    </div>
                `).join('')
                : `<p>
                    No real operators have completed approval yet.
                    Be among the first to apply.
                   </p>`;
        }

        if ($('#partnerSelect')) {
            $('#partnerSelect').innerHTML =
                '<option value="">Mtaliii team / decide later</option>' +
                real.map(agent => `
                    <option value="${esc(agent.id)}">
                        ${esc(agent.company)}
                    </option>
                `).join('');
        }

        document.querySelectorAll('[data-partner]')
            .forEach(button => {
                button.onclick = () => {
                    const partner = $('#partnerSelect');

                    if (partner) {
                        partner.value = button.dataset.partner;
                    }

                    if (
                        typeof window.mtaliiiOpenJourneyPlanner ===
                        'function'
                    ) {
                        window.mtaliiiOpenJourneyPlanner();
                    } else {
                        location.hash = 'plan';
                    }
                };
            });

        if ($('#demoAgents')) {
            $('#demoAgents').innerHTML = demo.map(agent => `
                <div>
                    ${esc(agent.company)} —
                    FICTIONAL DEMO · NOT VERIFIED · NOT BOOKABLE
                </div>
            `).join('');
        }

    } catch {
        if ($('#agencyList')) {
            $('#agencyList').textContent =
                'Agency listings temporarily unavailable.';
        }
    }
}

agents();

/*
====================================================
TOUR ENQUIRY SUBMISSION
====================================================
*/

const tripForm = $('#tripForm');

if (tripForm) {
    tripForm.onsubmit = async event => {
        event.preventDefault();

        const form = event.target;

        const fields = Object.fromEntries(
            new FormData(form)
        );

        /*
        Always submit the latest selected attractions,
        including those from other African countries.
        */

        const tours = getTourItinerary();

        fields.destinations = tours.map(
            item => `${item.name} (${item.country})`
        );

        fields.tours = tours;

        const message = $('#tripMessage');

        try {
            const response = await api(
                '/api/inquiries',
                'POST',
                fields
            );

            if (message) {
                message.textContent =
                    `✓ Received! Reference ${response.reference}. ` +
                    response.message;
            }

            /*
            Do not clear selected attractions after
            submitting an enquiry.
            */

            form.reset();

            updateTripDestinations();

            render();

        } catch (error) {
            if (message) {
                message.textContent = error.message;
            }
        }
    };
}

/*
====================================================
AGENCY REGISTRATION
====================================================
*/

if ($('#registerForm')) {
    $('#registerForm').onsubmit = async event => {
        event.preventDefault();

        const form = event.target;

        const fields = Object.fromEntries(
            new FormData(form)
        );

        try {
            const response = await api(
                '/api/register',
                'POST',
                fields
            );

            if ($('#registerMessage')) {
                $('#registerMessage').textContent =
                    '✓ Application submitted successfully. Your agency is awaiting administrator approval.';
            }

            form.reset();

        } catch (error) {
            if ($('#registerMessage')) {
                $('#registerMessage').textContent =
                    /already registered/i.test(error.message || '')
                        ? 'This email is already registered. Please use your existing account.'
                        : 'Registration unsuccessful: ' + (error.message || 'Please try again.');
            }
        }
    };
}

/*
====================================================
LOGIN
====================================================
*/

if ($('#loginForm')) {
    $('#loginForm').onsubmit = async event => {
        event.preventDefault();

        const form = event.target;

        const fields = Object.fromEntries(
            new FormData(form)
        );

        try {
            const response = await api(
                '/api/login',
                'POST',
                fields
            );

            sessionStorage.setItem(
                'mtaliii_token',
                response.token
            );

            if ($('#loginMessage')) {
                $('#loginMessage').textContent =
                    '✓ Signed in as ' + response.role;
            }

            form.reset();
            dashboard(response.role);

        } catch (error) {
            if ($('#loginMessage')) {
                $('#loginMessage').textContent =
                    error.message;
            }
        }
    };
}

/*
====================================================
DASHBOARD STATUS ACTIONS
====================================================
*/

function rowActions(endpoint, id, options) {
    return `
        <select
            data-endpoint="${esc(endpoint)}"
            data-id="${esc(id)}"
        >
            <option value="">Change status…</option>

            ${options.map(status => `
                <option>${esc(status)}</option>
            `).join('')}
        </select>
    `;
}

/*
====================================================
ADMIN AND AGENCY DASHBOARDS
====================================================
*/

async function dashboard(role) {
    const root = $('#dashboard');

    if (!root) return;

    root.hidden = false;

    try {
        const data = await api(
            role === 'admin'
                ? '/api/admin/overview'
                : '/api/agency'
        );

        if (role === 'admin') {
            root.innerHTML = `
                <h3>Mtaliii administrator dashboard</h3>

                <button id="logout" type="button">
                    Sign out
                </button>

                <h3>
                    Agency applications (${data.agents.length})
                </h3>

                ${data.agents.map(agent => `
                    <div class="dash-row">
                        <div>
                            <b>${esc(agent.company)}</b>

                            <p>
                                Contact: ${esc(agent.name)} ·
                                ${esc(agent.email)} ·
                                ${esc(agent.phone)} ·
                                TRA: ${esc(agent.license)}
                            </p>

                            <p>
                                Status: ${esc(agent.status)} ·
                                Submitted: ${esc(agent.createdAt)}
                            </p>
                        </div>

                        ${rowActions(
                            'agents',
                            agent.id,
                            [
                                'approved',
                                'rejected',
                                'pending',
                                'suspended'
                            ]
                        )}
                    </div>
                `).join('') || '<p>No applications.</p>'}

                <h3>
                    Traveller enquiries (${data.inquiries.length})
                </h3>

                ${data.inquiries.map(inquiry => `
                    <div class="dash-row">
                        <div>
                            <b>${esc(inquiry.name)}</b>
                            · ${esc(inquiry.status)}

                            <p>
                                ${esc(inquiry.email)} ·
                                ${esc(inquiry.phone)} ·
                                ${esc(inquiry.country)} ·
                                Arrival ${esc(inquiry.date)} ·
                                ${esc(inquiry.days)} days ·
                                ${esc(inquiry.guests)} guests
                            </p>

                            <p>
                                Places:
                                ${esc(
                                    Array.isArray(inquiry.destinations)
                                        ? inquiry.destinations.join(', ')
                                        : inquiry.destinations || ''
                                )}
                            </p>

                            <p>
                                Notes: ${esc(inquiry.notes)}
                            </p>

                            <p>
                                Partner ID:
                                ${esc(inquiry.agentId || 'Unassigned')}
                                · Ref:
                                ${esc(String(inquiry.id).slice(0, 8))}
                            </p>
                        </div>

                        ${rowActions(
                            'inquiries',
                            inquiry.id,
                            ['new', 'contacted', 'closed']
                        )}
                    </div>
                `).join('') || '<p>No enquiries.</p>'}

                <h3>
                    Submitted offers (${data.offers.length})
                </h3>

                ${data.offers.map(offer => `
                    <div class="dash-row">
                        <div>
                            <b>${esc(offer.title)}</b>

                            <p>
                                ${esc(offer.description)} ·
                                ${esc(offer.destinations)} ·
                                ${esc(offer.status)}
                            </p>
                        </div>

                        ${rowActions(
                            'offers',
                            offer.id,
                            ['approved', 'rejected', 'pending']
                        )}
                    </div>
                `).join('') || '<p>No offers.</p>'}
            `;

            root.querySelectorAll(
                'select[data-endpoint]'
            ).forEach(select => {
                select.onchange = async () => {
                    if (!select.value) return;

                    if (!confirm('Confirm this status change?')) {
                        select.value = '';
                        return;
                    }

                    try {
                        await api(
                            `/api/admin/${select.dataset.endpoint}/${select.dataset.id}`,
                            'PATCH',
                            { status: select.value }
                        );

                        dashboard('admin');

                        if (select.dataset.endpoint === 'agents') {
                            agents();
                        }

                    } catch (error) {
                        alert(error.message);
                    }
                };
            });

        } else {
            root.innerHTML = `
                <h3>
                    Agency dashboard —
                    ${esc(data.agency.company)}
                </h3>

                <p>
                    Application status:
                    <b>${esc(data.agency.status)}</b>
                </p>

                <button id="logout" type="button">
                    Sign out
                </button>

                <h3>Your offers</h3>

                ${data.offers.map(offer => `
                    <p>
                        ${esc(offer.title)} —
                        ${esc(offer.status)}
                    </p>
                `).join('') || '<p>No offers submitted.</p>'}

                <h3>
                    Traveller enquiries assigned to your agency
                </h3>

                ${data.inquiries.map(inquiry => `
                    <div class="dash-row">
                        <b>${esc(inquiry.name)}</b>

                        <p>
                            ${esc(inquiry.email)} ·
                            ${esc(inquiry.phone)} ·
                            ${esc(inquiry.date)} ·
                            ${esc(
                                Array.isArray(inquiry.destinations)
                                    ? inquiry.destinations.join(', ')
                                    : inquiry.destinations || ''
                            )}
                        </p>
                    </div>
                `).join('') || '<p>No assigned enquiries.</p>'}

                <form id="offerForm" class="form">
                    <h3>Submit a tour offer for review</h3>

                    <label>
                        Title
                        <input name="title" required>
                    </label>

                    <label>
                        Duration
                        <input name="duration"
                               placeholder="e.g. 7 days">
                    </label>

                    <label>
                        Destinations
                        <input name="destinations" required>
                    </label>

                    <label>
                        Description
                        <textarea name="description" required></textarea>
                    </label>

                    <button class="submit">
                        Submit offer
                    </button>

                    <p id="offerMsg"></p>
                </form>
            `;

            if ($('#offerForm')) {
                $('#offerForm').onsubmit = async event => {
                    event.preventDefault();

                    try {
                        const response = await api(
                            '/api/offers',
                            'POST',
                            Object.fromEntries(
                                new FormData(event.target)
                            )
                        );

                        if ($('#offerMsg')) {
                            $('#offerMsg').textContent =
                                response.message;
                        }

                        dashboard('agent');

                    } catch (error) {
                        if ($('#offerMsg')) {
                            $('#offerMsg').textContent =
                                error.message;
                        }
                    }
                };
            }
        }

        if ($('#logout')) {
            $('#logout').onclick = async () => {
                try {
                    await api('/api/logout', 'POST');
                } catch {
                    // Local sign-out continues.
                }

                sessionStorage.removeItem('mtaliii_token');

                root.hidden = true;
                root.innerHTML = '';

                if ($('#loginMessage')) {
                    $('#loginMessage').textContent =
                        'Signed out.';
                }
            };
        }

    } catch (error) {
        root.textContent = error.message;
    }
}

/*
====================================================
RESTORE EXISTING LOGIN
====================================================
*/

if (
    $('#loginForm') &&
    sessionStorage.getItem('mtaliii_token')
) {
    api('/api/me')
        .then(user => dashboard(user.role))
        .catch(() => {
            sessionStorage.removeItem('mtaliii_token');
        });
}
})();
