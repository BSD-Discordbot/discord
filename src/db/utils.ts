import db from '.'

export async function dailyReward (discordID: bigint): Promise<void> {
  const amount = 100
  await db.insertInto('player')
    .values({
      balance: amount,
      daily_streak: 0,
      last_daily: new Date(),
      discord_id: discordID
    })
    .onConflict((oc) =>
      oc.column('discord_id').doUpdateSet({
        balance: (eb) => eb.bxp('player.balance', '+', amount),
        daily_streak: (eb) => {
          const date = new Date()
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
    ).execute()
}

export const checkBalance = async (
  discordId: bigint
): Promise<{
  balance: number
  last_daily: Date
  daily_streak: number
}> =>
  await db
    .selectFrom('player')
    .select(['player.balance', 'player.daily_streak', 'player.last_daily'])
    .where('player.discord_id', '=', discordId)
    .executeTakeFirstOrThrow()
