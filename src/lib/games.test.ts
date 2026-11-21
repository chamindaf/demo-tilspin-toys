import { describe, it, expect, beforeEach } from 'vitest';
import { createTestDatabase } from '../../db/test-helpers';
import { categories, publishers, games } from '../../db/schema';
import type { Database } from './db';
import {
    getAllGames,
    getAllGameIds,
    getFilteredGames,
    getGameById,
} from './games';

async function seedGames(db: Database, count: number): Promise<void> {
    const [category] = await db
        .insert(categories)
        .values({ name: 'Strategy', description: 'cat' })
        .returning({ id: categories.id });
    const [publisher] = await db
        .insert(publishers)
        .values({ name: 'Pub One', description: 'pub' })
        .returning({ id: publishers.id });

    // Insert titles in reverse-alphabetical order to prove ordering is applied.
    for (let i = count; i >= 1; i--) {
        await db.insert(games).values({
            title: `Game ${String(i).padStart(2, '0')}`,
            description: `Description ${i}`,
            starRating: 4.2,
            categoryId: category.id,
            publisherId: publisher.id,
        });
    }
}

describe('games data-access helpers', () => {
    let db: Database;

    beforeEach(async () => {
        db = await createTestDatabase();
    });

    it('returns all games ordered by title', async () => {
        await seedGames(db, 3);
        const all = await getAllGames(db);
        expect(all.map((g) => g.title)).toEqual(['Game 01', 'Game 02', 'Game 03']);
        expect(all[0].category).toEqual({ id: expect.any(Number), name: 'Strategy' });
        expect(all[0].publisher).toEqual({ id: expect.any(Number), name: 'Pub One' });
    });

    it('returns all game ids ordered by title', async () => {
        await seedGames(db, 3);
        const ids = await getAllGameIds(db);
        const all = await getAllGames(db);
        expect(ids).toEqual(all.map((g) => g.id));
    });

    it('fetches a single game by id', async () => {
        await seedGames(db, 2);
        const ids = await getAllGameIds(db);
        const game = await getGameById(db, ids[0]);
        expect(game?.title).toBe('Game 01');
    });

    it('returns null for a non-existent game', async () => {
        await seedGames(db, 2);
        expect(await getGameById(db, 99999)).toBeNull();
    });

    it('returns all games when filtering has no selected values', async () => {
        await seedGames(db, 3);
        const all = await getFilteredGames(db, {});
        expect(all.map((game) => game.title)).toEqual([
            'Game 01',
            'Game 02',
            'Game 03',
        ]);
    });

    it('filters games by one or more categories', async () => {
        const [strategy] = await db
            .insert(categories)
            .values({ name: 'Strategy', description: 'cat' })
            .returning({ id: categories.id });
        const [puzzle] = await db
            .insert(categories)
            .values({ name: 'Puzzle', description: 'cat' })
            .returning({ id: categories.id });
        const [publisher] = await db
            .insert(publishers)
            .values({ name: 'Pub One', description: 'pub' })
            .returning({ id: publishers.id });

        await db.insert(games).values([
            {
                title: 'Strategy Game',
                description: 'Description',
                categoryId: strategy.id,
                publisherId: publisher.id,
            },
            {
                title: 'Puzzle Game',
                description: 'Description',
                categoryId: puzzle.id,
                publisherId: publisher.id,
            },
        ]);

        const filtered = await getFilteredGames(db, {
            categoryIds: [strategy.id, puzzle.id],
        });

        expect(filtered.map((game) => game.title)).toEqual([
            'Puzzle Game',
            'Strategy Game',
        ]);
    });

    it('filters games by publisher', async () => {
        const [category] = await db
            .insert(categories)
            .values({ name: 'Strategy', description: 'cat' })
            .returning({ id: categories.id });
        const [pubOne] = await db
            .insert(publishers)
            .values({ name: 'Pub One', description: 'pub' })
            .returning({ id: publishers.id });
        const [pubTwo] = await db
            .insert(publishers)
            .values({ name: 'Pub Two', description: 'pub' })
            .returning({ id: publishers.id });

        await db.insert(games).values([
            {
                title: 'First Game',
                description: 'Description',
                categoryId: category.id,
                publisherId: pubOne.id,
            },
            {
                title: 'Second Game',
                description: 'Description',
                categoryId: category.id,
                publisherId: pubTwo.id,
            },
        ]);

        const filtered = await getFilteredGames(db, {
            publisherIds: [pubTwo.id],
        });

        expect(filtered.map((game) => game.title)).toEqual(['Second Game']);
    });

    it('combines category and publisher filters', async () => {
        const [strategy] = await db
            .insert(categories)
            .values({ name: 'Strategy', description: 'cat' })
            .returning({ id: categories.id });
        const [puzzle] = await db
            .insert(categories)
            .values({ name: 'Puzzle', description: 'cat' })
            .returning({ id: categories.id });
        const [pubOne] = await db
            .insert(publishers)
            .values({ name: 'Pub One', description: 'pub' })
            .returning({ id: publishers.id });
        const [pubTwo] = await db
            .insert(publishers)
            .values({ name: 'Pub Two', description: 'pub' })
            .returning({ id: publishers.id });

        await db.insert(games).values([
            {
                title: 'Matching Game',
                description: 'Description',
                categoryId: strategy.id,
                publisherId: pubOne.id,
            },
            {
                title: 'Wrong Publisher',
                description: 'Description',
                categoryId: strategy.id,
                publisherId: pubTwo.id,
            },
            {
                title: 'Wrong Category',
                description: 'Description',
                categoryId: puzzle.id,
                publisherId: pubOne.id,
            },
        ]);

        const filtered = await getFilteredGames(db, {
            categoryIds: [strategy.id],
            publisherIds: [pubOne.id],
        });

        expect(filtered.map((game) => game.title)).toEqual(['Matching Game']);
    });
});
