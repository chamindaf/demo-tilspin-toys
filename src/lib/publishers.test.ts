/**
 * Unit tests for publisher data-access helpers.
 *
 * Exercises publisher queries against an in-memory Node SQLite database.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';
import { publishers } from '../../db/schema';
import type { Database } from './db';
import { getAllPublishers } from './publishers';

describe('publishers data-access helpers', () => {
    let db: Database;

    beforeEach(async () => {
        db = await createTestDatabase();
    });

    it('returns an empty array when there are no publishers', async () => {
        expect(await getAllPublishers(db)).toEqual([]);
    });

    it('returns publishers ordered alphabetically by name', async () => {
        await db.insert(publishers).values([
            { name: 'Zebra Games', description: 'pub' },
            { name: 'Alpha Games', description: 'pub' },
        ]);

        const result = await getAllPublishers(db);

        expect(result).toEqual([
            { id: expect.any(Number), name: 'Alpha Games' },
            { id: expect.any(Number), name: 'Zebra Games' },
        ]);
    });
});
