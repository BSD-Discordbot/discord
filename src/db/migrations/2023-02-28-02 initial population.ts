import { type Kysely } from 'kysely'

export async function up (db: Kysely<any>): Promise<void> {
  await db
    .insertInto('card')
    .values([
      { card_id: 1000, rarity: 1 },
      { card_id: 2000, rarity: 2 },
      { card_id: 3000, rarity: 3 },
      { card_id: 4000, rarity: 4 },
      { card_id: 5000, rarity: 5 }
    ])
    .execute()

  const banner = await db.insertInto('event').values({ name: 'Standard', default: true }).returning('id').executeTakeFirstOrThrow()
  await db.insertInto('event_has_card').values([
    { card_id: 1000, event_id: banner.id },
    { card_id: 2000, event_id: banner.id },
    { card_id: 3000, event_id: banner.id },
    { card_id: 4000, event_id: banner.id },
    { card_id: 5000, event_id: banner.id }
  ]).execute()
}

export async function down (db: Kysely<any>): Promise<void> {
  await db.deleteFrom('card').execute()
}
