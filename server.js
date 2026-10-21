
"use strict";

require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const root = __dirname;
const dbFile = path.join(root, "data", "store.json");

app.disable("x-powered-by");
app.set("trust proxy", false);
app.use(express.json({ limit: "40kb" }));

app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader(
        "Content-Security-Policy",
        [
            "default-src 'self'",
            "img-src 'self' https://upload.wikimedia.org https://images.unsplash.com data:",
            "connect-src 'self' https://commons.wikimedia.org",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "font-src 'self' https://fonts.gstatic.com",
            "script-src 'self'",
            "base-uri 'self'",
            "object-src 'none'",
            "form-action 'self'"
        ].join("; ")
    );
    next();
});

// DATABASE HELPERS

const read = () =>
    JSON.parse(fs.readFileSync(dbFile, "utf8"));

const write = data => {
    const temp = dbFile + ".tmp";
    fs.writeFileSync(
        temp,
        JSON.stringify(data, null, 2),
        { mode: 0o600 }
    );
    fs.renameSync(temp, dbFile);
};

const uid = () => crypto.randomUUID();

const clean = (value, length = 250) =>
    String(value ?? "").trim().slice(0, length);

const validEmail = email =>
    typeof email === "string" &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    email.length < 190;

const passHash = (password, salt) =>
    crypto.scryptSync(password, salt, 64).toString("hex");

const equal = (a, b) => {
    try {
        return crypto.timingSafeEqual(
            Buffer.from(a, "hex"),
            Buffer.from(b, "hex")
        );
    } catch {
        return false;
    }
};

// RATE LIMITING

const sessions = new Map();
const attempts = new Map();

function limit(req, res, next) {
    const key = req.ip + req.path;
    const now = Date.now();
    const entry = attempts.get(key) || { n: 0, t: now };

    if (now - entry.t > 15 * 60000) {
        entry.n = 0;
        entry.t = now;
    }

    if (++entry.n > 40) {
        return res.status(429).json({
            error: "Too many requests; try again later."
        });
    }

    attempts.set(key, entry);
    next();
}

app.use("/api", limit);

// AUTHENTICATION

function auth(req, res, next) {
    const token = (req.headers.authorization || "")
        .match(/^Bearer ([a-f0-9]{64})$/)?.[1];

    const session = token && sessions.get(token);

    if (!session || session.until < Date.now()) {
        if (token) sessions.delete(token);

        return res.status(401).json({
            error: "Sign in required."
        });
    }

    req.identity = session;
    next();
}

function admin(req, res, next) {
    if (req.identity.role !== "admin") {
        return res.status(403).json({
            error: "Administrator access only."
        });
    }
    next();
}

function agent(req, res, next) {
    if (req.identity.role !== "agent") {
        return res.status(403).json({
            error: "Agency access only."
        });
    }
    next();
}

function safeAgent(agentRecord) {
    const {
        passwordHash,
        salt,
        email,
        name,
        license,
        ...publicAgent
    } = agentRecord;

    return publicAgent;
}

// PUBLIC AGENCY ROUTES

app.get("/api/agents", (req, res) => {
    res.json(
        read().agents
            .filter(a => a.status === "approved" && !a.demo)
            .map(safeAgent)
    );
});

app.get("/api/demo-agents", (req, res) => {
    res.json(
        read().agents
            .filter(a => a.demo)
            .map(safeAgent)
    );
});

app.get("/api/offers", (req, res) => {
    const data = read();

    const offers = data.offers
        .filter(offer =>
            offer.status === "approved" &&
            data.agents.some(a =>
                a.id === offer.agentId &&
                a.status === "approved" &&
                !a.demo
            )
        )
        .map(offer => ({
            ...offer,
            company: data.agents.find(
                a => a.id === offer.agentId
            )?.company
        }));

    res.json(offers);
});

// AGENCY REGISTRATION

app.post("/api/register", (req, res) => {
    const {
        name,
        email,
        password,
        company,
        license,
        phone
    } = req.body || {};

    if (
        !clean(name, 120) ||
        !clean(company, 150) ||
        !validEmail(email) ||
        typeof password !== "string" ||
        password.length < 12 ||
        password.length > 128
    ) {
        return res.status(400).json({
            error: "Provide a name, company, valid email and a password of 12–128 characters."
        });
    }

    const data = read();

    if (data.agents.some(
        a => a.email === email.toLowerCase()
    )) {
        return res.status(409).json({
            error: "Email already registered."
        });
    }

    const salt = crypto.randomBytes(16).toString("hex");

    data.agents.push({
        id: uid(),
        name: clean(name, 120),
        company: clean(company, 150),
        email: email.toLowerCase(),
        phone: clean(phone, 40),
        license: clean(license, 100),
        salt,
        passwordHash: passHash(password, salt),
        status: "pending",
        demo: false,
        createdAt: new Date().toISOString()
    });

    write(data);

    res.status(201).json({
        message: "Agency application received. Approval requires manual licence and identity checks."
    });
});

// LOGIN AND LOGOUT

app.post("/api/login", (req, res) => {
    const { email, password } = req.body || {};

    let role = "agent";
    let identity = null;

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (
        adminEmail &&
        adminPassword &&
        adminPassword.length >= 16 &&
        email === adminEmail &&
        typeof password === "string" &&
        equal(
            passHash(password, "mtaliii-admin"),
            passHash(adminPassword, "mtaliii-admin")
        )
    ) {
        role = "admin";
        identity = "admin";
    } else {
        const account = read().agents.find(
            a => !a.demo &&
                a.email === String(email || "").toLowerCase()
        );

        if (
            account &&
            typeof password === "string" &&
            equal(
                passHash(password, account.salt),
                account.passwordHash
            )
        ) {
            identity = account.id;
        }
    }

    if (!identity) {
        return res.status(401).json({
            error: "Incorrect email or password."
        });
    }

    const token = crypto.randomBytes(32).toString("hex");

    sessions.set(token, {
        role,
        id: identity,
        until: Date.now() + 8 * 3600000
    });

    res.json({ token, role });
});

app.post("/api/logout", auth, (req, res) => {
    const token = req.headers.authorization.slice(7);
    sessions.delete(token);
    res.json({ ok: true });
});

app.get("/api/me", auth, (req, res) => {
    res.json({
        role: req.identity.role,
        id: req.identity.id
    });
});

// DATE VALIDATION

function validDate(value) {
    if (
        typeof value !== "string" ||
        !/^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        return false;
    }

    const date = new Date(value + "T12:00:00");

    return (
        !Number.isNaN(date.getTime()) &&
        date.getFullYear() === Number(value.slice(0, 4)) &&
        date.getMonth() + 1 === Number(value.slice(5, 7)) &&
        date.getDate() === Number(value.slice(8, 10))
    );
}

function todayLocal() {
    const date = new Date();

    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0")
    ].join("-");
}

function nightsBetween(start, end) {
    return Math.round(
        (
            new Date(end + "T12:00:00") -
            new Date(start + "T12:00:00")
        ) / 86400000
    );
}

// ============================================
// MTALIII AFRICA — TRIP AND ACCOMMODATION
// ENQUIRY SUBMISSION
// ============================================

app.post("/api/inquiries", (req, res) => {
    try {
        const body = req.body || {};

        const name = clean(body.name, 120);
        const email = clean(body.email, 180);
        const phone = clean(body.phone, 50);
        const date = clean(body.date, 20);
        const checkout = clean(body.checkout, 20);

        const days = Number(body.days);
        const guests = Number(body.guests);

        const destinations = Array.isArray(body.destinations)
            ? body.destinations
                .map(item => clean(item, 120))
                .filter(Boolean)
                .slice(0, 30)
            : [];

        const isAccommodation =
            body.enquiryType === "accommodation";

        if (
            !name ||
            !validEmail(email) ||
            !validDate(date) ||
            date < todayLocal() ||
            !Number.isInteger(days) ||
            days < 1 ||
            days > 90 ||
            !Number.isInteger(guests) ||
            guests < 1 ||
            guests > 40 ||
            destinations.length === 0
        ) {
            return res.status(400).json({
                error: "Please provide valid dates, guests, destinations, name and email."
            });
        }

        let adults = null;
        let children = null;
        let rooms = null;
        let accommodationType = null;

        if (isAccommodation) {
            adults = Number(body.adults);
            children = Number(body.children);
            rooms = Number(body.rooms);

            const allowedTypes = [
                "Any accommodation",
                "Luxury hotel or resort",
                "Safari lodge or camp",
                "Private villa or apartment",
                "Budget-friendly stay"
            ];

            accommodationType = clean(
                body.accommodationType,
                100
            );

            if (
                !validDate(checkout) ||
                nightsBetween(date, checkout) !== days ||
                !Number.isInteger(adults) ||
                adults < 1 ||
                adults > 30 ||
                !Number.isInteger(children) ||
                children < 0 ||
                children > 30 ||
                adults + children !== guests ||
                !Number.isInteger(rooms) ||
                rooms < 1 ||
                rooms > 20 ||
                !allowedTypes.includes(accommodationType)
            ) {
                return res.status(400).json({
                    error: "Please check the accommodation dates, guests, rooms and preferences."
                });
            }
        }

        const data = read();

        if (
            body.agentId &&
            !data.agents.some(a =>
                a.id === body.agentId &&
                a.status === "approved" &&
                !a.demo
            )
        ) {
            return res.status(400).json({
                error: "Selected agency is not approved."
            });
        }

        const record = {
            id: uid(),
            enquiryType: isAccommodation
                ? "accommodation"
                : "trip",

            name,
            email,
            phone,

            country: clean(body.country, 80),

            date,
            checkout: isAccommodation ? checkout : null,
            days,
            guests,

            adults,
            children,
            rooms,
            accommodationType,

            destinations,
            agentId: body.agentId || null,

            notes: clean(body.notes, 2000),

            status: "new",
            createdAt: new Date().toISOString()
        };

        data.inquiries.push(record);
        write(data);

        return res.status(201).json({
            success: true,
            reference: record.id.slice(0, 8).toUpperCase(),
            message: "Your enquiry has been received successfully. Our team will contact you."
        });

    } catch (error) {
        console.error("Enquiry submission error:", error);

        return res.status(500).json({
            error: "We could not save your enquiry. Please try again."
        });
    }
});

// AGENCY OFFERS

app.post("/api/offers", auth, agent, (req, res) => {
    const data = read();
    const account = data.agents.find(
        a => a.id === req.identity.id
    );

    if (!account || account.status !== "approved") {
        return res.status(403).json({
            error: "Agency approval required."
        });
    }

    const body = req.body || {};

    if (
        !clean(body.title) ||
        !clean(body.description) ||
        !clean(body.destinations)
    ) {
        return res.status(400).json({
            error: "Title, description and destinations required."
        });
    }

    data.offers.push({
        id: uid(),
        agentId: account.id,
        title: clean(body.title, 120),
        description: clean(body.description, 1200),
        duration: clean(body.duration, 80),
        destinations: clean(body.destinations, 350),
        status: "pending",
        createdAt: new Date().toISOString()
    });

    write(data);

    res.status(201).json({
        message: "Offer submitted for administrator review."
    });
});

// AGENCY DASHBOARD

app.get("/api/agency", auth, agent, (req, res) => {
    const data = read();
    const account = data.agents.find(
        a => a.id === req.identity.id
    );

    res.json({
        agency: safeAgent(account),
        offers: data.offers.filter(
            offer => offer.agentId === account.id
        ),
        inquiries: data.inquiries.filter(
            inquiry =>
                inquiry.agentId === account.id &&
                account.status === "approved"
        )
    });
});

// ADMIN DASHBOARD

app.get("/api/admin/overview", auth, admin, (req, res) => {
    const data = read();

    res.json({
        agents: data.agents
            .filter(a => !a.demo)
            .map(({ passwordHash, salt, ...a }) => a),

        inquiries: data.inquiries,
        offers: data.offers
    });
});

// ADMIN — UPDATE AGENCY STATUS

app.patch("/api/admin/agents/:id", auth, admin, (req, res) => {
    const status = req.body?.status;

    if (
        !["approved", "rejected", "pending", "suspended"]
            .includes(status)
    ) {
        return res.status(400).json({
            error: "Invalid status."
        });
    }

    const data = read();

    const account = data.agents.find(
        a => a.id === req.params.id && !a.demo
    );

    if (!account) {
        return res.status(404).json({
            error: "Agency not found."
        });
    }

    account.status = status;
    account.reviewedAt = new Date().toISOString();

    write(data);
    res.json({ ok: true });
});

// ADMIN — UPDATE OFFER STATUS

app.patch("/api/admin/offers/:id", auth, admin, (req, res) => {
    const status = req.body?.status;

    if (
        !["approved", "rejected", "pending"].includes(status)
    ) {
        return res.status(400).json({
            error: "Invalid status."
        });
    }

    const data = read();

    const offer = data.offers.find(
        o => o.id === req.params.id
    );

    if (!offer) {
        return res.status(404).json({
            error: "Offer not found."
        });
    }

    offer.status = status;
    write(data);

    res.json({ ok: true });
});

// ADMIN — UPDATE ENQUIRY STATUS

app.patch("/api/admin/inquiries/:id", auth, admin, (req, res) => {
    const status = req.body?.status;

    if (
        !["new", "contacted", "closed"].includes(status)
    ) {
        return res.status(400).json({
            error: "Invalid status."
        });
    }

    const data = read();

    const inquiry = data.inquiries.find(
        i => i.id === req.params.id
    );

    if (!inquiry) {
        return res.status(404).json({
            error: "Enquiry not found."
        });
    }

    inquiry.status = status;
    write(data);

    res.json({ ok: true });
});

// ============================================
// EXISTING PHOTO CACHING SYSTEM
// ============================================

const photoIds = new Set([
    "photo-1546182990-dffeafbe841d",
    "photo-1564760055775-d63b17a55c44",
    "photo-1516026672322-bc52d61a55d5",
    "photo-1549366021-9f761d450615",
    "photo-1511497584788-876760111969",
    "photo-1516426122078-c23e76319801",
    "photo-1507525428034-b723cf961d3e",
    "photo-1464822759023-fed622ff2c3b"
]);

const imageDir = path.join(
    root,
    "public",
    "assets",
    "cached"
);

fs.mkdirSync(imageDir, { recursive: true });

const inflightPhotos = new Map();

app.get("/cached-photo/:id", async (req, res) => {
    const id = req.params.id;
    const width = req.query.w === "1800" ? 1800 : 900;

    if (!photoIds.has(id)) {
        return res.status(404).end();
    }

    const file = path.join(
        imageDir,
        id + "-" + width + ".jpg"
    );

    const send = () =>
        res
            .set("Cache-Control", "public, max-age=31536000, immutable")
            .type("jpg")
            .sendFile(file);

    if (fs.existsSync(file)) {
        return send();
    }

    const key = id + "-" + width;

    if (!inflightPhotos.has(key)) {
        const job = (async () => {
            const url =
                "https://images.unsplash.com/" +
                id +
                "?auto=format&fit=crop&w=" +
                width +
                "&q=80";

            const response = await fetch(url, {
                signal: AbortSignal.timeout(15000)
            });

            if (
                !response.ok ||
                !response.headers
                    .get("content-type")
                    ?.startsWith("image/")
            ) {
                throw new Error("Remote image unavailable.");
            }

            const bytes = Buffer.from(
                await response.arrayBuffer()
            );

            if (
                bytes.length > 5000000 ||
                bytes.length < 100
            ) {
                throw new Error("Invalid image size.");
            }

            const temp = file + ".tmp";
            fs.writeFileSync(temp, bytes);
            fs.renameSync(temp, file);
        })();

        inflightPhotos.set(
            key,
            job.finally(() => inflightPhotos.delete(key))
        );
    }

    try {
        await inflightPhotos.get(key);
        return send();
    } catch {
        return res.redirect(
            302,
            "/assets/landscape-1.svg"
        );
    }
});

// ============================================
// STATIC WEBSITE AND ADMIN PAGE
// ============================================

app.get("/admin", (req, res) => {
    res.sendFile(
        path.join(root, "public", "admin.html")
    );
});

app.use(
    express.static(path.join(root, "public"), {
        extensions: ["html"]
    })
);

// ============================================
// OPENSTREETMAP DESTINATION DISCOVERY
// ============================================

const osmCache = new Map();

app.get("/api/discover", async (req, res) => {
    const country = String(req.query.country || "");

    const allowed = {
        Kenya: "Kenya",
        Tanzania: "Tanzania",
        Uganda: "Uganda",
        Rwanda: "Rwanda",
        Burundi: "Burundi",
        "Democratic Republic of the Congo":
            "Democratic Republic of the Congo",
        "South Sudan": "South Sudan",
        Somalia: "Somalia",
        Ethiopia: "Ethiopia",
        Djibouti: "Djibouti",
        Eritrea: "Eritrea",
        Seychelles: "Seychelles",
        Comoros: "Comoros",
        Mauritius: "Mauritius",
        Madagascar: "Madagascar"
    };

    if (!allowed[country]) {
        return res.status(400).json({
            error: "Unknown country."
        });
    }

    const cached = osmCache.get(country);

    if (
        cached &&
        Date.now() - cached.at < 86400000
    ) {
        return res.json(cached.data);
    }

    const query = `
    [out:json][timeout:24];
    area["name:en"="${allowed[country]}"]["admin_level"="2"]->.a;
    (
      nwr["tourism"~"attraction|museum|zoo|viewpoint|gallery|theme_park|artwork|picnic_site|information"](area.a);
      nwr["natural"~"waterfall|peak|cave_entrance|beach|spring"](area.a);
      nwr["leisure"="nature_reserve"](area.a);
    );
    out tags 650;
  `;

    try {
        const response = await fetch(
            "https://overpass.kumi.systems/api/interpreter",
            {
                method: "POST",
                headers: {
                    "content-type":
                        "application/x-www-form-urlencoded"
                },
                body: new URLSearchParams({
                    data: query
                }),
                signal: AbortSignal.timeout(28000)
            }
        );

        if (!response.ok) {
            throw new Error("Map provider unavailable.");
        }

        const json = await response.json();

        const names = [
            ...new Set(
                (json.elements || [])
                    .map(x =>
                        x.tags?.["name:en"] ||
                        x.tags?.name
                    )
                    .filter(x =>
                        x &&
                        x.length > 3 &&
                        x.length < 110
                    )
            )
        ].slice(0, 500);

        const result = {
            country,
            places: names,
            source: "OpenStreetMap contributors",
            note: "Community-mapped places; not independently verified or guaranteed complete."
        };

        osmCache.set(country, {
            at: Date.now(),
            data: result
        });

        res.json(result);

    } catch {
        res.status(503).json({
            error: "Map discovery unavailable; try again later."
        });
    }
});

// START SERVER

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    if (
        !process.env.ADMIN_EMAIL ||
        !process.env.ADMIN_PASSWORD ||
        process.env.ADMIN_PASSWORD.length < 16
    ) {
        console.warn(
            "ADMIN LOGIN: Set ADMIN_EMAIL and a unique ADMIN_PASSWORD of at least 16 characters in .env."
        );
    }

    console.log(
        "Mtaliii Africa running at http://localhost:" + PORT
    );
});
