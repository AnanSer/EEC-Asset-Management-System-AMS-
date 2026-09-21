import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaClient } from '@prisma/client';
declare const pool: Pool;
export declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/client").DefaultArgs>;
export { pool };
export default prisma;
//# sourceMappingURL=prisma.d.ts.map