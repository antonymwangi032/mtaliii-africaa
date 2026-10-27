
/* MTALIII_CUSTOM_CONFIRM_DIALOG_V1 */
function mtaliiiConfirmStatus(status, type) {
    return new Promise(resolve => {
        const overlay = document.createElement("div");

        overlay.style.cssText = [
            "position:fixed",
            "inset:0",
            "background:rgba(0,0,0,.55)",
            "display:flex",
            "align-items:center",
            "justify-content:center",
            "padding:20px",
            "z-index:999999"
        ].join(";");

        const dialog = document.createElement("div");

        dialog.style.cssText = [
            "background:#ffffff",
            "color:#172d25",
            "width:100%",
            "max-width:430px",
            "border-radius:18px",
            "padding:30px",
            "box-shadow:0 25px 80px rgba(0,0,0,.25)",
            "font-family:inherit"
        ].join(";");

        dialog.setAttribute("role", "alertdialog");
        dialog.setAttribute("aria-modal", "true");

        const title = document.createElement("h2");
        title.textContent = "Confirm status change";
        title.style.cssText =
            "font-size:23px;margin:0 0 12px;font-weight:700;color:#123c2e";

        const message = document.createElement("p");
        message.textContent =
            "Are you sure you want to change this " +
            (type === "agents" ? "agency" :
             type === "offers" ? "offer" : "enquiry") +
            " status to " + status + "?";

        message.style.cssText =
            "font-size:15px;line-height:1.7;margin:0 0 25px;color:#46554f";

        const buttons = document.createElement("div");
        buttons.style.cssText =
            "display:flex;justify-content:flex-end;gap:12px;flex-wrap:wrap";

        const cancel = document.createElement("button");
        cancel.type = "button";
        cancel.textContent = "Cancel";
        cancel.style.cssText =
            "padding:12px 20px;border:1px solid #d6ded9;" +
            "border-radius:9px;background:#fff;color:#17382b;" +
            "font:inherit;cursor:pointer";

        const approve = document.createElement("button");
        approve.type = "button";
        approve.textContent = "Confirm Change";
        approve.style.cssText =
            "padding:12px 20px;border:0;border-radius:9px;" +
            "background:#123c2e;color:#fff;font:inherit;" +
            "font-weight:600;cursor:pointer";

        function finish(value) {
            document.removeEventListener("keydown", onKeydown);
            overlay.remove();
            resolve(value);
        }

        function onKeydown(event) {
            if (event.key === "Escape") {
                finish(false);
            }
        }

        cancel.addEventListener("click", () => finish(false));
        approve.addEventListener("click", () => finish(true));

        overlay.addEventListener("click", event => {
            if (event.target === overlay) finish(false);
        });

        document.addEventListener("keydown", onKeydown);

        buttons.append(cancel, approve);
        dialog.append(title, message, buttons);
        overlay.append(dialog);
        document.body.append(overlay);

        cancel.focus();
    });
}

"use strict";

/* MTALIII AFRICA — ADMINISTRATOR WORKSPACE */

const $ = selector => document.querySelector(selector);

const loginForm = $("#loginForm");
const loginMessage = $("#loginMessage");
const dashboardRoot = $("#dashboard");
const pageHeading = document.querySelector(".section-head");

let token = sessionStorage.getItem("mtaliii_admin_token");
let activeTab = "agents";
let loading = false;
let dashboardData = null;

function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));
}

function display(value) {
    if (Array.isArray(value)) {
        return value.map(display).join(", ");
    }

    return value === null || value === undefined || value === ""
        ? "Not provided"
        : String(value);
}

function setMessage(text, error = false) {
    loginMessage.textContent = text;
    loginMessage.style.color = error ? "#b91c1c" : "";
}

function showLogin(text = "") {
    token = null;
    sessionStorage.removeItem("mtaliii_admin_token");

    loginForm.hidden = false;
    dashboardRoot.hidden = true;
    dashboardRoot.replaceChildren();

    if (pageHeading) pageHeading.hidden = false;

    setMessage(text);
}

function showWorkspace() {
    loginForm.hidden = true;
    dashboardRoot.hidden = false;

    if (pageHeading) pageHeading.hidden = true;

    setMessage("");
}

async function api(url, method = "GET", body) {
    const response = await fetch(url, {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(token ? {
                Authorization: `Bearer ${token}`
            } : {})
        },
        ...(body !== undefined ? {
            body: JSON.stringify(body)
        } : {})
    });

    let result;

    try {
        result = await response.json();
    } catch {
        throw new Error("The server returned an invalid response.");
    }

    if (!response.ok) {
        const error = new Error(
            result.error || `Request failed (${response.status}).`
        );

        error.status = response.status;
        throw error;
    }

    return result;
}

function statusBadge(status) {
    const safeStatus = String(status || "unknown").toLowerCase();

    const allowed = [
        "approved", "pending", "rejected",
        "suspended", "new", "contacted", "quotation_sent", "confirmed", "cancelled", "closed"
    ];

    const className = allowed.includes(safeStatus)
        ? safeStatus
        : "unknown";

    return `
        <span class="admin-status admin-status-${className}">
            ${esc(safeStatus.replace(/_/g, " "))}
        </span>
    `;
}

function statusSelect(type, record, options) {
    return `
        <select
            class="admin-status-select"
            data-type="${esc(type)}"
            data-id="${esc(record.id)}"
            aria-label="Change status"
        >
            <option value="">Change status</option>
            ${options.map(option => `
                <option value="${esc(option)}"
                    ${option === record.status ? "disabled" : ""}>
                    ${esc(option.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()))}
                </option>
            `).join("")}
        </select>
    `;
}

function metricCard(label, number, detail, icon) {
    return `
        <article class="admin-metric">
            <div class="admin-metric-top">
                <span>${esc(label)}</span>
                <span class="admin-metric-icon">${icon}</span>
            </div>
            <strong>${number}</strong>
            <small>${esc(detail)}</small>
        </article>
    `;
}

function agencyCard(agency) {
    return `
        <article class="admin-record">
            <div class="admin-record-main">
                <div class="admin-record-title">
                    <h4>${esc(display(agency.company))}</h4>
                    ${statusBadge(agency.status)}
                </div>

                <p>${esc(display(agency.name))}</p>

                <div class="admin-record-meta">
                    <span>${esc(display(agency.email))}</span>
                    <span>${esc(display(agency.phone))}</span>
                </div>

                <p class="admin-record-small">
                    Registration: ${esc(display(agency.license))}
                </p>
            </div>

            <div class="admin-record-actions">
                ${statusSelect("agents", agency, [
                    "approved", "rejected", "pending", "suspended"
                ])}
            </div>
        </article>
    `;
}


function formatTravelNotes(value) {
    const raw = String(value ?? "").trim();

    if (!raw) {
        return '<p class="admin-note-empty">No additional notes.</p>';
    }

    // Preserve original customer information.
    // Split only recognizable section headings and date-based entries.
    const normalized = raw
        .replace(/\r\n?/g, "\n")
        .replace(/\b(MTALIII AFRICA JOURNEY|ACCOMMODATION ITINERARY|TOURS|ACCOMMODATION|ROOMS|SPECIAL REQUESTS|Guest requests|Preference|Adults|Children|Accommodation nights):/gi,
            "\n$1:")
        .replace(/\b(ROOMS|SPECIAL REQUESTS|Guest requests|Preference|Adults|Children|Accommodation nights):/gi,
            "\n$1:");

    const lines = normalized.split("\n")
        .map(line => line.trim())
        .filter(Boolean);

    const sections = [];
    let section = { title: "Travel information", items: [] };

    const headings = new Set([
        "TOURS", "ACCOMMODATION", "ACCOMMODATION ITINERARY"
    ]);

    for (const line of lines) {
        const heading = line.replace(/:$/, "").toUpperCase();

        if (headings.has(heading)) {
            if (section.items.length) sections.push(section);
            section = {
                title: heading === "TOURS" ? "Planned tours"
                    : "Accommodation",
                items: []
            };
            continue;
        }

        if (line.toUpperCase() === "MTALIII AFRICA JOURNEY") {
            if (section.items.length) sections.push(section);
            section = { title: "Mtaliii Africa journey", items: [] };
            continue;
        }

        section.items.push(line);
    }

    if (section.items.length) sections.push(section);

    return sections.map(group => `
        <section class="admin-itinerary-section">
            <h5>${esc(group.title)}</h5>
            <div class="admin-itinerary-items">
                ${group.items.map(item => `
                    <div class="admin-itinerary-item">
                        ${esc(item)}
                    </div>
                `).join("")}
            </div>
        </section>
    `).join("");
}

function inquiryCard(inquiry) {
    return `
        <article class="admin-record">
            <div class="admin-record-main">
                <div class="admin-record-title">
                    <h4>${esc(display(inquiry.name))}</h4>
                    ${statusBadge(inquiry.status)}
                </div>

                <div class="admin-record-meta">
                    <span>${esc(display(inquiry.email))}</span>
                    <span>${esc(display(inquiry.phone))}</span>
                </div>

                <p class="admin-record-small">
                    ${esc(display(inquiry.date))}
                    · ${esc(display(inquiry.days))} days
                    · ${esc(display(inquiry.guests))} guests
                </p>

                <p class="admin-record-small">
                    <strong>Destinations:</strong>
                    ${esc(display(inquiry.destinations))}
                </p>

                <details class="admin-details">
                    <summary>View full travel request</summary>

                    <div class="admin-details-content">
                        <p>
                            <strong>Country:</strong>
                            ${esc(display(inquiry.country))}
                        </p>
                        <p>
                            <strong>Travel notes:</strong>
                        </p>
                        <div class="admin-itinerary">
                            ${formatTravelNotes(inquiry.notes)}
                        </div>
                    </div>
                </details>
            </div>

            <div class="admin-record-actions">
                ${statusSelect("inquiries", inquiry, [
                    "new", "contacted", "quotation_sent", "confirmed", "cancelled", "closed"
                ])}
            </div>
        </article>
    `;
}

function offerCard(offer) {
    return `
        <article class="admin-record">
            <div class="admin-record-main">
                <div class="admin-record-title">
                    <h4>${esc(display(offer.title))}</h4>
                    ${statusBadge(offer.status)}
                </div>

                <p>${esc(display(offer.description))}</p>

                <p class="admin-record-small">
                    <strong>Destinations:</strong>
                    ${esc(display(offer.destinations))}
                </p>

                <p class="admin-record-small">
                    <strong>Price:</strong>
                    ${offer.price == null ? "Not provided" : new Intl.NumberFormat("en-US", {style:"currency",currency:"USD"}).format(Number(offer.price))}
                </p>
            </div>

            <div class="admin-record-actions">
                ${statusSelect("offers", offer, [
                    "approved", "rejected", "pending"
                ])}
            </div>
        </article>
    `;
}

function renderWorkspace() {
    if (!dashboardData) return;

    const agents = dashboardData.agents;
    const inquiries = dashboardData.inquiries;
    const offers = dashboardData.offers;

    const pendingAgencies = agents.filter(
        agency => agency.status === "pending"
    ).length;

    const approvedAgencies = agents.filter(
        agency => agency.status === "approved"
    ).length;

    const newInquiries = inquiries.filter(
        inquiry => inquiry.status === "new"
    ).length;

    const tabs = [
        ["agents", "Agency applications", agents.length],
        ["inquiries", "Travel enquiries", inquiries.length],
        ["offers", "Agency offers", offers.length]
    ];

    const currentRecords = {
        agents: agents.map(agencyCard),
        inquiries: inquiries.map(inquiryCard),
        offers: offers.map(offerCard)
    };

    dashboardRoot.innerHTML = `
        <div class="admin-workspace">
            <div class="admin-workspace-header">
                <div>
                    <div class="admin-brand">
                        
                        <div>
                            <span class="admin-eyebrow">
                                MTALIII AFRICA / ADMINISTRATION
                            </span>
                            <h2>Operations overview</h2>
                            <p class="admin-slogan">
                                Africa is calling. Travel beautifully.
                            </p>
                            <p>Manage your tourism platform in one place.</p>
                        </div>
                    </div>
                </div>

                <button id="logout" type="button">
                    Sign out
                </button>
            </div>

            <div class="admin-metrics">
                ${metricCard(
                    "Total agencies",
                    agents.length,
                    `${pendingAgencies} awaiting review`,
                    "◈"
                )}

                ${metricCard(
                    "Travel enquiries",
                    inquiries.length,
                    `${newInquiries} new requests`,
                    "✉"
                )}

                ${metricCard(
                    "Agency offers",
                    offers.length,
                    "Registered travel offers",
                    "◇"
                )}

                ${metricCard(
                    "Approved agencies",
                    approvedAgencies,
                    "Approved applications",
                    "✓"
                )}
            </div>

            <div class="admin-management">
                <div class="admin-management-heading">
                    <div>
                        <h3>Platform management</h3>
                        <p>Review applications, enquiries and offers.</p>
                    </div>
                </div>

                <div class="admin-tabs" role="tablist"
                     aria-label="Administrator sections">
                    ${tabs.map(([id, label, count]) => `
                        <button
                            type="button"
                            role="tab"
                            class="admin-tab ${activeTab === id ? "active" : ""}"
                            data-tab="${id}"
                            aria-selected="${activeTab === id}"
                        >
                            ${esc(label)}
                            <span>${count}</span>
                        </button>
                    `).join("")}
                </div>

                <p id="adminFeedback" role="status"></p>

                
    ${activeTab === "offers" ? `
      <section class="mt-offer-panel">
        <h3>Create New Tour Offer</h3>
        <p>Create a package for Mtaliii Africa or an approved agency.</p>

        <form id="mtCreateOffer" class="mt-offer-form">
          <label>Offer provider
            <select name="owner" required>
              <option value="mtaliii">Mtaliii Africa</option>
              <option value="agency">Approved agency</option>
            </select>
          </label>

          <label>Approved agency (required for agency offers)
            <select name="agentId">
              <option value="">Select agency</option>
              ${dashboardData.agents
                .filter(a => a.status === "approved")
                .map(a => `
                  <option value="${esc(a.id)}">
                    ${esc(a.company)}
                  </option>
                `).join("")}
            </select>
          </label>

          <label>Package title
            <input name="title" required maxlength="120"
              placeholder="5 Days Maasai Mara Safari">
          </label>

          <label>Destination
            <input name="destinations" required maxlength="350"
              placeholder="Maasai Mara, Kenya">
          </label>

          <label>Package description
            <textarea name="description" required maxlength="1200"
              placeholder="Accommodation, activities, meals and transfers"></textarea>
          </label>

          <div class="mt-offer-grid">
            <label>Number of people
              <input type="number" name="people" min="1"
                step="1" required value="2">
            </label>

            <label>Trip duration
              <input name="duration" required maxlength="80"
                placeholder="5 Days / 4 Nights">
            </label>

            <label>Price (USD $)
              <input type="number" name="price" min="0"
                step="0.01" required placeholder="850">
            </label>

            <label>Publication status
              <select name="status">
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </label>

            <label>Valid from
              <input type="date" name="validFrom">
            </label>

            <label>Valid until
              <input type="date" name="validUntil">
            </label>
          </div>

          <label>Package image URL
            <input type="url" name="imageUrl"
              placeholder="https://example.com/safari.jpg">
          </label>

          <button type="submit" class="mt-offer-save">
            + Save Tour Offer
          </button>

          <p id="mtOfferFeedback" role="status"></p>
        </form>
      </section>
    ` : ""}

                <div class="admin-record-list">
                    ${currentRecords[activeTab].join("") ||
                        `<div class="admin-empty">
                            No records available in this section.
                        </div>`}
                </div>
            </div>
        </div>
    `;

    showWorkspace();
}

async function loadDashboard() {
    if (loading) return;

    loading = true;

    try {
        const data = await api("/api/admin/overview");

        dashboardData = {
            agents: Array.isArray(data.agents) ? data.agents : [],
            inquiries: Array.isArray(data.inquiries) ? data.inquiries : [],
            offers: Array.isArray(data.offers) ? data.offers : []
        };

        renderWorkspace();

    } catch (error) {
        if (error.status === 401 || error.status === 403) {
            showLogin("Your session expired. Please sign in again.");
        } else {
            const feedback = $("#adminFeedback");

            if (feedback) {
                feedback.textContent = error.message;
            } else {
                setMessage(error.message, true);
            }
        }
    } finally {
        loading = false;
    }
}

dashboardRoot.addEventListener("click", async event => {
    const tab = event.target.closest("[data-tab]");

    if (tab) {
        activeTab = tab.dataset.tab;
        renderWorkspace();
        return;
    }

    if (event.target.closest("#logout")) {
        try {
            await api("/api/logout", "POST");
        } catch (error) {
            console.warn("Logout request:", error.message);
        }

        dashboardData = null;
        showLogin("You have signed out.");
    }
});


/* MTALIII_ADMIN_OFFER_FORM_V1 */
dashboardRoot.addEventListener("submit", async event => {
  if (event.target.id !== "mtCreateOffer") return;

  event.preventDefault();

  const form = event.target;
  const button = form.querySelector('button[type="submit"]');
  const feedback = form.querySelector("#mtOfferFeedback");
  const data = Object.fromEntries(new FormData(form).entries());

  button.disabled = true;
  feedback.textContent = "Saving tour offer...";

  try {
    await api("/api/admin/offers", "POST", data);
    await loadDashboard();
    const notice = document.querySelector("#adminFeedback");
    if (notice) notice.textContent = "Tour offer saved successfully.";
  } catch (error) {
    feedback.textContent = error.message;
    button.disabled = false;
  }
});

dashboardRoot.addEventListener("change", async event => {
    const select = event.target.closest(
        "select[data-type][data-id]"
    );

    if (!select || !select.value) return;

    const type = select.dataset.type;
    const id = select.dataset.id;
    const status = select.value;

    if (
        !["agents", "inquiries", "offers"].includes(type) ||
        !id
    ) return;

    if (!(await mtaliiiConfirmStatus(status, type))) {
        select.value = "";
        return;
    }

    select.disabled = true;

    try {
        await api(
            `/api/admin/${type}/${encodeURIComponent(id)}`,
            "PATCH",
            { status }
        );

        await loadDashboard();

    } catch (error) {
        if (error.status === 401 || error.status === 403) {
            showLogin("Please sign in again.");
            return;
        }

        const feedback = $("#adminFeedback");

        if (feedback) {
            feedback.textContent = error.message;
            feedback.style.color = "#b91c1c";
        }

        select.value = "";

    } finally {
        if (select.isConnected) select.disabled = false;
    }
});

loginForm.addEventListener("submit", async event => {
    event.preventDefault();

    const button = loginForm.querySelector("button");
    button.disabled = true;

    setMessage("Signing in...");

    try {
        const credentials = Object.fromEntries(
            new FormData(loginForm)
        );

        const result = await api(
            "/api/login",
            "POST",
            credentials
        );

        if (result.role !== "admin" || !result.token) {
            throw new Error("Administrator account required.");
        }

        token = result.token;
        sessionStorage.setItem("mtaliii_admin_token", token);

        loginForm.reset();
        await loadDashboard();

    } catch (error) {
        setMessage(error.message, true);
    } finally {
        button.disabled = false;
    }
});

async function restoreSession() {
    if (!token) {
        showLogin();
        return;
    }

    try {
        const session = await api("/api/me");

        if (session.role !== "admin") {
            showLogin("Administrator access required.");
            return;
        }

        await loadDashboard();

    } catch {
        showLogin("Please sign in again.");
    }
}

restoreSession();
