"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.query = query;
const pg_1 = require("pg");
const config_1 = require("./config");
exports.pool = new pg_1.Pool(config_1.config.pg);
async function query(text, params) {
    const res = await exports.pool.query(text, params);
    return res.rows;
}
