"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = exports.prisma = void 0;
require("dotenv/config");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_1 = require("@prisma/client");
const connectionString = process.env.DATABASE_URL;
const pool = new pg_1.Pool({ connectionString });
exports.pool = pool;
const adapter = new adapter_pg_1.PrismaPg(pool);
const globalForPrisma = global;
exports.prisma = globalForPrisma.prisma ||
    new client_1.PrismaClient({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
exports.default = exports.prisma;
//# sourceMappingURL=prisma.js.map