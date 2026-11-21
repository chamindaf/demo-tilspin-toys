/**
 * Unit tests for category data-access helpers.
 *
 * Exercises category queries against an in-memory Node SQLite database.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';
import { categories } from '../../db/schema';
import type { Database } from './db';
import { getAllCategories } from './categories';

describe('categories data-access helpers', () => {
    let db: Database;

    beforeEach(async () => {
        db = await createTestDatabase();
    });

    it('returns an empty array when there are no categories', async () => {
        expect(await getAllCategories(db)).toEqual([]);
    });

    it('returns categories ordered alphabetically by name', async () => {
        await db.insert(categories).values([
            { name: 'Strategy', description: 'cat' },
            { name: 'Adventure', description: 'cat' },
        ]);

        const result = await getAllCategories(db);

        expect(result).toEqual([
            { id: expect.any(Number), name: 'Adventure' },
            { id: expect.any(Number), name: 'Strategy' },
        ]);
    });
});
