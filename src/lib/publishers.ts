/**
 * Data-access helpers for publisher records.
 *
 * Queries the publishers table with an injectable Drizzle database and maps
 * rows to the app-facing Publisher type used by Astro pages and components.
 */

import { asc } from 'drizzle-orm';



import type { Database } from './db';



import { publishers } from '../../db/schema';



import type { Publisher } from '../types/game';

/**
 * Retrieves all publishers ordered alphabetically by name.
 *
 * @param db - The injectable Drizzle database instance.
 * @returns All publishers ordered alphabetically by name.
 */
export async function getAllPublishers(db: Database): Promise<Publisher[]> {
    const rows = await db
        .select({ id: publishers.id, name: publishers.name })
        .from(publishers)
        .orderBy(asc(publishers.name));

    return rows.map((row): Publisher => ({ id: row.id, name: row.name }));
}
