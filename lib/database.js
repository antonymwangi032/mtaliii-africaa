"use strict";

require("dotenv").config({ quiet: true });

const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
    throw new Error(
        "DATABASE_URL is missing from environment configuration."
    );
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
});

async function query(sql, params = []) {
    return pool.query(sql, params);
}

async function transaction(callback) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const result = await callback(client);

        await client.query("COMMIT");

        return result;
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function healthCheck() {
    const result = await query(`
        SELECT
            current_database() AS database,
            current_user AS username,
            (
                SELECT COUNT(*)
                FROM "Agency"
            ) AS agencies,
            (
                SELECT COUNT(*)
                FROM "Inquiry"
            ) AS inquiries
    `);

    return result.rows[0];
}

async function close() {
    await pool.end();
}

module.exports = {
    pool,
    query,
    transaction,
    healthCheck,
    close
};
