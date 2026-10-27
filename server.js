
"use strict";

require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const database = require("./lib/database");

const app = express();
const root = __dirname;


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

/* MTALIII_SESSION_CLEANUP_V1 */
const sessionCleanupTimer = setInterval(() => {
    const now = Date.now();

    for (const [token, session] of sessions) {
        if (session.until <= now) {
            sessions.delete(token);
        }
    }
}, 15 * 60 * 1000);

sessionCleanupTimer.unref();

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

// PUBLIC AGENCY ROUTES — POSTGRESQL

app.get("/api/agents", async (req, res) => {
    try {
        const result = await database.query(
            `SELECT * FROM "Agency"
              WHERE "status" = $1 AND "demo" = false
              ORDER BY "company" ASC`,
            ["approved"]
        );

        res.json(result.rows.map(safeAgent));
    } catch (error) {
        console.error("Agency listing failed:", error.message);
        res.status(500).json({
            error: "Unable to load agencies."
        });
    }
});

app.get("/api/demo-agents", async (req, res) => {
    try {
        const result = await database.query(
            `SELECT * FROM "Agency"
              WHERE "demo" = true
              ORDER BY "company" ASC`
        );

        res.json(result.rows.map(safeAgent));
    } catch (error) {
        console.error("Demo agency listing failed:", error.message);
        res.status(500).json({
            error: "Unable to load demonstration agencies."
        });
    }
});

app.get("/api/offers", async (req, res) => {
    try {
        const result = await database.query(
            `SELECT
                o."id",
                o."agentId",
                o."title",
                o."description",
                o."price",
                o."duration",
                o."destinations",
                o."status",
                o."createdAt",
                o."owner",
                o."people",
                o."validFrom",
                o."validUntil",
                o."imageUrl",
                COALESCE(a."company", 'Mtaliii Africa') AS "company"
              FROM "Offer" o
              LEFT JOIN "Agency" a
                  ON a."id" = o."agentId"
              WHERE o."status" = $1
                AND (
                  o."owner" = 'mtaliii'
                  OR (
                    a."status" = $1
                    AND a."demo" = false
                  )
                )
                AND (
                  o."validFrom" IS NULL
                  OR o."validFrom" <= CURRENT_DATE
                )
                AND (
                  o."validUntil" IS NULL
                  OR o."validUntil" >= CURRENT_DATE
                )
              ORDER BY o."createdAt" DESC`,
            ["approved"]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Offer listing failed:", error.message);
        res.status(500).json({
            error: "Unable to load offers."
        });
    }
});

// AGENCY REGISTRATION

app.post("/api/register", async (req, res) => {
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

    const normalizedEmail = email.trim().toLowerCase();

    try {
        const salt = crypto.randomBytes(16).toString("hex");
        const passwordHash = passHash(password, salt);

        await database.query(
            `INSERT INTO "Agency" (
                "id", "name", "company", "email",
                "phone", "license", "salt", "passwordHash",
                "status", "demo", "createdAt", "updatedAt"
            )
            VALUES (
                $1, $2, $3, $4,
                $5, $6, $7, $8,
                $9, $10, NOW(), NOW()
            )`,
            [
                uid(),
                clean(name, 120),
                clean(company, 150),
                normalizedEmail,
                clean(phone, 40),
                clean(license, 100),
                salt,
                passwordHash,
                "pending",
                false
            ]
        );

        return res.status(201).json({
            message: "Agency application received. Approval requires manual licence and identity checks."
        });
    } catch (error) {
        if (error.code === "23505") {
            return res.status(409).json({
                error: "Email already registered."
            });
        }

        console.error("Agency registration failed:", error.message);

        return res.status(500).json({
            error: "Unable to complete registration."
        });
    }
});

// LOGIN AND LOGOUT


/* MTALIII_LOGIN_RATE_LIMIT_V1 */
const loginAttempts = new Map();

function loginLimit(req, res, next) {
    const now = Date.now();
    const key = req.ip;
    const windowMs = 15 * 60 * 1000;
    const maxAttempts = 10;

    if (loginAttempts.size > 10000) {
        for (const [ip, entry] of loginAttempts) {
            if (now - entry.start >= windowMs) {
                loginAttempts.delete(ip);
            }
        }
    }

    const entry = loginAttempts.get(key);

    if (!entry || now - entry.start >= windowMs) {
        loginAttempts.set(key, { count: 1, start: now });
        return next();
    }

    if (entry.count >= maxAttempts) {
        res.setHeader(
            "Retry-After",
            String(Math.ceil((windowMs - (now - entry.start)) / 1000))
        );

        return res.status(429).json({
            error: "Too many sign-in attempts. Please try again later."
        });
    }

    entry.count++;
    next();
}

app.post("/api/login", loginLimit, async (req, res) => {
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
        try {
            const result = await database.query(
                `SELECT "id", "salt", "passwordHash"
                 FROM "Agency"
                 WHERE "email" = $1 AND "demo" = false
                 LIMIT 1`,
                [String(email || "").toLowerCase()]
            );

            const account = result.rows[0];

            if (
                account &&
                typeof password === "string" &&
                account.salt &&
                account.passwordHash &&
                equal(
                    passHash(password, account.salt),
                    account.passwordHash
                )
            ) {
                identity = account.id;
            }
        } catch (error) {
            console.error("Agency login failed:", error.message);

            return res.status(500).json({
                error: "Unable to complete sign in."
            });
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


app.post("/api/inquiries", async (req, res) => {
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

        const agentId = body.agentId || null;

        if (agentId) {
            const agencyResult = await database.query(
                `SELECT "id"
                 FROM "Agency"
                 WHERE "id" = $1
                   AND "status" = 'approved'
                   AND "demo" = false
                 LIMIT 1`,
                [agentId]
            );

            if (!agencyResult.rows.length) {
                return res.status(400).json({
                    error: "Selected agency is not approved."
                });
            }
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
            agentId,
            notes: clean(body.notes, 2000),
            status: "new"
        };

        await database.query(
            `INSERT INTO "Inquiry" (
                "id", "enquiryType", "name", "email",
                "phone", "country", "date", "checkout",
                "days", "guests", "adults", "children",
                "rooms", "accommodationType",
                "destinations", "agentId", "notes",
                "status", "createdAt"
             )
             VALUES (
                $1, $2, $3, $4,
                $5, $6, $7, $8,
                $9, $10, $11, $12,
                $13, $14,
                $15::jsonb, $16, $17,
                $18, NOW()
             )`,
            [
                record.id,
                record.enquiryType,
                record.name,
                record.email,
                record.phone,
                record.country,
                record.date,
                record.checkout,
                record.days,
                record.guests,
                record.adults,
                record.children,
                record.rooms,
                record.accommodationType,
                JSON.stringify(record.destinations),
                record.agentId,
                record.notes,
                record.status
            ]
        );

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

app.post("/api/offers", auth, agent, async (req, res) => {
    try {
        const accountResult = await database.query(
            `SELECT "id", "status"
             FROM "Agency"
             WHERE "id" = $1 AND "demo" = false
             LIMIT 1`,
            [req.identity.id]
        );

        const account = accountResult.rows[0];

        if (!account || account.status !== "approved") {
            return res.status(403).json({
                error: "Agency approval required."
            });
        }

        const body = req.body || {};

        const price =
            body.price === undefined ||
            body.price === null ||
            String(body.price).trim() === ""
                ? null
                : Number(body.price);

        if (
            price !== null &&
            (!Number.isFinite(price) || price < 0)
        ) {
            return res.status(400).json({
                error: "Price must be a valid non-negative number."
            });
        }

        if (
            !clean(body.title) ||
            !clean(body.description) ||
            !clean(body.destinations)
        ) {
            return res.status(400).json({
                error: "Title, description and destinations required."
            });
        }

        await database.query(
            `INSERT INTO "Offer" (
                "id", "agentId", "title", "description",
                "price", "duration", "destinations", "status", "createdAt"
             )
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
            [
                uid(),
                account.id,
                clean(body.title, 120),
                clean(body.description, 1200),
                price,
                clean(body.duration, 80),
                clean(body.destinations, 350),
                "pending"
            ]
        );

        res.status(201).json({
            message: "Offer submitted for administrator review."
        });
    } catch (error) {
        console.error("Offer submission failed:", error.message);
        res.status(500).json({
            error: "Unable to submit offer."
        });
    }
});

// AGENCY DASHBOARD

app.get("/api/agency", auth, agent, async (req, res) => {
    try {
        const accountResult = await database.query(
            `SELECT "id", "company", "name", "email",
                    "phone", "license", "description",
                    "status", "demo", "createdAt", "updatedAt"
             FROM "Agency"
             WHERE "id" = $1 AND "demo" = false
             LIMIT 1`,
            [req.identity.id]
        );

        const account = accountResult.rows[0];

        if (!account) {
            return res.status(404).json({
                error: "Agency not found."
            });
        }

        const [offersResult, inquiriesResult] = await Promise.all([
            database.query(
                `SELECT * FROM "Offer"
                 WHERE "agentId" = $1
                 ORDER BY "createdAt" DESC`,
                [account.id]
            ),
            account.status === "approved"
                ? database.query(
                    `SELECT * FROM "Inquiry"
                     WHERE "agentId" = $1
                     ORDER BY "createdAt" DESC`,
                    [account.id]
                )
                : Promise.resolve({ rows: [] })
        ]);

        res.json({
            agency: safeAgent(account),
            offers: offersResult.rows,
            inquiries: inquiriesResult.rows
        });
    } catch (error) {
        console.error("Agency dashboard failed:", error.message);
        res.status(500).json({
            error: "Unable to load agency dashboard."
        });
    }
});

app.get("/api/admin/overview", auth, admin, async (req, res) => {
    try {
        const [agencies, inquiries, offers] = await Promise.all([
            database.query(
                `SELECT "id", "company", "name", "email",
                        "phone", "license", "description",
                        "status", "demo", "userId",
                        "createdAt", "updatedAt"
                 FROM "Agency"
                 WHERE "demo" = false
                 ORDER BY "createdAt" DESC`
            ),
            database.query(
                `SELECT * FROM "Inquiry"
                 ORDER BY "createdAt" DESC`
            ),
            database.query(
                `SELECT * FROM "Offer"
                 ORDER BY "createdAt" DESC`
            )
        ]);

        res.json({
            agents: agencies.rows,
            inquiries: inquiries.rows,
            offers: offers.rows
        });
    } catch (error) {
        console.error("Admin overview failed:", error.message);
        res.status(500).json({
            error: "Unable to load administrator dashboard."
        });
    }
});


/* MTALIII_ADMIN_AUDIT_LOG_V1 */
const adminAuditDirectory = path.join(__dirname, "data", "security");
const adminAuditFile = path.join(adminAuditDirectory, "admin-audit.jsonl");

function recordAdminAction(req, action, recordId, status) {
    const entry = {
        timestamp: new Date().toISOString(),
        actor: "admin",
        action,
        recordId: String(recordId),
        status: String(status)
    };

    try {
        fs.mkdirSync(adminAuditDirectory, { recursive: true });

        fs.appendFileSync(
            adminAuditFile,
            JSON.stringify(entry) + "\n",
            { encoding: "utf8", mode: 0o600 }
        );
    } catch (error) {
        console.error("Administrator audit logging failed:", error.message);
    }
}

// ADMIN — UPDATE AGENCY STATUS

app.patch("/api/admin/agents/:id", auth, admin, async (req, res) => {
    const status = req.body?.status;

    if (!["approved", "rejected", "pending", "suspended"].includes(status)) {
        return res.status(400).json({ error: "Invalid status." });
    }

    try {
        const result = await database.query(
            `UPDATE "Agency"
             SET "status" = $1, "updatedAt" = NOW()
             WHERE "id" = $2 AND "demo" = false
             RETURNING "id"`,
            [status, req.params.id]
        );

        if (!result.rowCount) {
            return res.status(404).json({
                error: "Agency not found."
            });
        }

        recordAdminAction(req, "agency_status_updated", req.params.id, status);

        res.json({ ok: true });
    } catch (error) {
        console.error("Agency approval failed:", error.message);
        res.status(500).json({
            error: "Unable to update agency."
        });
    }
});


/* MTALIII_ADMIN_CREATE_OFFER_V1 */
app.post("/api/admin/offers", auth, admin, async (req, res) => {
  try {
    const b = req.body || {};
    const title = String(b.title || "").trim();
    const description = String(b.description || "").trim();
    const destinations = String(b.destinations || "").trim();
    const duration = String(b.duration || "").trim();
    const owner = b.owner === "agency" ? "agency" : "mtaliii";
    const status = String(b.status || "pending");
    const price = Number(b.price);
    const people = Number(b.people);
    const imageUrl = String(b.imageUrl || "").trim();
    const validFrom = b.validFrom || null;
    const validUntil = b.validUntil || null;

    if (!title || !description || !destinations || !duration) {
      return res.status(400).json({
        error: "Complete the title, description, destination and duration."
      });
    }

    if (title.length > 120 || description.length > 1200 ||
        destinations.length > 350 || duration.length > 80) {
      return res.status(400).json({
        error: "One or more text fields are too long."
      });
    }

    if (!Number.isFinite(price) || price < 0 ||
        !Number.isSafeInteger(people) || people < 1) {
      return res.status(400).json({
        error: "Enter a valid USD price and number of people."
      });
    }

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid offer status." });
    }

    const validDate = value =>
      !value || (
        /^\d{4}-\d{2}-\d{2}$/.test(value) &&
        !Number.isNaN(Date.parse(value))
      );

    if (!validDate(validFrom) || !validDate(validUntil) ||
        (validFrom && validUntil && validUntil < validFrom)) {
      return res.status(400).json({
        error: "Enter a valid offer date range."
      });
    }

    if (imageUrl && (
      imageUrl.length > 1500 ||
      !/^https?:\/\//i.test(imageUrl)
    )) {
      return res.status(400).json({
        error: "Use a valid HTTP or HTTPS image URL."
      });
    }

    let agentId = null;

    if (owner === "agency") {
      agentId = String(b.agentId || "");

      const agency = await database.query(
        `SELECT "id" FROM "Agency"
         WHERE "id" = $1 AND "status" = 'approved'
         AND "demo" = false LIMIT 1`,
        [agentId]
      );

      if (!agency.rowCount) {
        return res.status(400).json({
          error: "Select an approved agency."
        });
      }
    }

    const result = await database.query(
      `INSERT INTO "Offer"
       ("id", "agentId", "title", "description",
        "price", "duration", "destinations", "status",
        "owner", "people", "validFrom", "validUntil",
        "imageUrl", "createdAt")
       VALUES
       (gen_random_uuid()::text, $1, $2, $3,
        $4, $5, $6, $7, $8, $9,
        $10::date, $11::date, $12, NOW())
       RETURNING "id"`,
      [
        agentId, title, description, price, duration,
        destinations, status, owner, people,
        validFrom, validUntil, imageUrl || null
      ]
    );

    res.status(201).json({
      success: true,
      id: result.rows[0].id,
      message: "Tour offer created successfully."
    });
  } catch (error) {
    console.error("Admin offer creation failed:", error.message);
    res.status(500).json({
      error: "Unable to create tour offer."
    });
  }
});

// ADMIN — UPDATE OFFER STATUS

app.patch("/api/admin/offers/:id", auth, admin, async (req, res) => {
    const status = req.body?.status;

    if (!["approved", "rejected", "pending"].includes(status)) {
        return res.status(400).json({ error: "Invalid status." });
    }

    try {
        const result = await database.query(
            `UPDATE "Offer"
             SET "status" = $1
             WHERE "id" = $2
             RETURNING "id"`,
            [status, req.params.id]
        );

        if (!result.rowCount) {
            return res.status(404).json({
                error: "Offer not found."
            });
        }

        recordAdminAction(req, "offer_status_updated", req.params.id, status);

        res.json({ ok: true });
    } catch (error) {
        console.error("Offer approval failed:", error.message);
        res.status(500).json({
            error: "Unable to update offer."
        });
    }
});

// ADMIN — UPDATE ENQUIRY STATUS

app.patch("/api/admin/inquiries/:id", auth, admin, async (req, res) => {
    const status = req.body?.status;

    if (!["new", "contacted", "quotation_sent", "confirmed", "cancelled", "closed"].includes(status)) {
        return res.status(400).json({ error: "Invalid status." });
    }

    try {
        const result = await database.query(
            `UPDATE "Inquiry"
             SET "status" = $1
             WHERE "id" = $2
             RETURNING "id"`,
            [status, req.params.id]
        );

        if (!result.rowCount) {
            return res.status(404).json({
                error: "Enquiry not found."
            });
        }

        recordAdminAction(req, "inquiry_status_updated", req.params.id, status);

        res.json({ ok: true });
    } catch (error) {
        console.error("Inquiry update failed:", error.message);
        res.status(500).json({
            error: "Unable to update enquiry."
        });
    }
});


// MTALIII_PHOTO_CACHE_INITIALIZATION_V1
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

const imageDir = path.join(__dirname, "public", "images", "cache");
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


    // Local attraction records are the primary reliable source.
    // Add country-specific JSON files under data/discovery/.
    const discoveryFile = path.join(
        __dirname,
        "data",
        "discovery",
        country.toLowerCase().replace(/[^a-z0-9]+/g, "-") + ".json"
    );

    if (fs.existsSync(discoveryFile)) {
        try {
            const records = JSON.parse(
                fs.readFileSync(discoveryFile, "utf8")
            );

            const places = [...new Set(
                records
                    .map(item =>
                        typeof item === "string"
                            ? item
                            : item && item.name
                    )
                    .filter(name =>
                        typeof name === "string" &&
                        name.trim().length > 3
                    )
            )];

            return res.json({
                country,
                places,
                source: "Mtaliii curated attraction directory",
                note: "Curated discovery suggestions; verify details before visiting."
            });
        } catch (error) {
            console.error("Discovery dataset error:", error.message);
        }
    }

    return res.status(503).json({
        error: "No local attraction directory is available for this country yet."
    });

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
