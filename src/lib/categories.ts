/**
 * Data-access helpers for category records.
 *
 * Queries the categories table with an injectable Drizzle database and maps
 * rows to the app-facing Category type used by Astro pages and components.
 */

import { asc } from 'drizzle-orm';



import type { Database } from './db';



import { categories } from '../../db/schema';



import type { Category } from '../types/game';

/**
 * Retrieves all categories ordered alphabetically by name.
 *
 * @param db - The injectable Drizzle database instance.
 * @returns All categories ordered alphabetically by name.
 */
export async function getAllCategories(db: Database): Promise<Category[]> {
    const rows = await db
        .select({ id: categories.id, name: categories.name })
        .from(categories)
        .orderBy(asc(categories.name));

    return rows.map((row): Category => ({ id: row.id, name: row.name }));
}
