import { sql } from 'kysely'
import db from '.'

/**
 * ```ts
 * player.balance += 100
 * player.last_daily = new Date()
 * player.daily_streak = player.last_daily < yesterday ? 0 : player.daily_streak + 1
 * ```
 * Does not provides any cooldow
 * @param discordId id of player
 */
export async function dailyReward (discordId: bigint): Promise<void> {
  const amount = 100
  await db
    .insertInto('player')
    .values({
      balance: amount,
      daily_streak: 0,
      last_daily: new Date(),
      discord_id: discordId
    })
    .onConflict((oc) =>
      oc.column('discord_id').doUpdateSet({
        balance: (eb) => eb.bxp('player.balance', '+', amount),
        daily_streak: (eb) => {
          const date = new Date()
          date.setHours(0)
          date.setDate(date.getDate() - 1)
          return eb
            .case()
            .when('player.last_daily', '<', date)
            .then(0)
            .else(eb.bxp('player.daily_streak', '+', 1))
            .end()
        },
        last_daily: new Date()
      })
    )
    .execute()
}

/**
 * ```ts
 * if (player.daily_streak > 7){
 *   player.balance += 500
 *   player.daily_streak = 0
 * }
 * ```
 * @param discordId id of player
 */
export async function weeklyReward (discordId: bigint): Promise<void> {
  const amount = 500
  await db
    .updateTable('player')
    .set({
      balance: (eb) => eb.bxp('player.balance', '+', amount),
      daily_streak: 0
    })
    .where('discord_id', '=', discordId)
    .execute()
}

export async function withdrawMoney (discordId: bigint, amount: number): Promise<void> {
  await db
    .updateTable('player')
    .set({
      balance: (eb) => eb.bxp('player.balance', '-', amount)
    })
    .where('discord_id', '=', discordId)
    .execute()
}

export const checkBalance = async (
  discordId: bigint
): Promise<{
  balance: number
  last_daily: Date
  daily_streak: number
}> =>
  (await db
    .selectFrom('player')
    .select(['player.balance', 'player.daily_streak', 'player.last_daily'])
    .where('player.discord_id', '=', discordId)
    .executeTakeFirst()) ?? { balance: 0, last_daily: new Date(0), daily_streak: 0 }

/**
 * Give 5 random cards to a player
 * @param discordId id of player
 * @param event id of event
 */
export async function pull (discordId: bigint, event: number): Promise<number[]> {
  // drop rates
  // 1* = 66%
  // 2* = 25%
  // 3* = 7%
  // 4* = 2%
  const rarities = new Array(5)
    .fill(undefined)
    .map(Math.random)
    .map((e) => (e < 2 / 3 ? 1 : e < 13 / 15 ? 2 : e < 49 / 50 ? 3 : 4))

  const cards = (
    await Promise.all(
      rarities.map(
        async (e) =>
          await db
            .selectFrom('card')
            .innerJoin(
              'event_has_card',
              'event_has_card.card_id',
              'card.card_id'
            )
            .select('card.card_id')
            .where('card.rarity', '=', e)
            .where('event_has_card.event_id', '=', event)
            .orderBy(sql`RANDOM()`)
            .limit(1)
            .executeTakeFirstOrThrow()
      )
    )
  ).map((e) => e.card_id)

  await Promise.all(
    cards.map(
      async (c) =>
        await db
          .insertInto('player_has_card')
          .values({
            discord_id: discordId,
            card_id: c,
            amount: 1,
            date_owned: new Date()
          })
          .onConflict((oc) =>
            oc.constraint('player_has_card_pkey').doUpdateSet({
              amount: (eb) => eb.bxp('player_has_card.amount', '+', 1)
            })
          )
          .execute()
    )
  )

  return cards
}
