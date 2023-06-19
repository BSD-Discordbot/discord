import { type Generated } from 'kysely'

interface Player {
  discord_id: bigint
  balance: number
  last_daily: Date
  daily_streak: number
}

interface PlayerHasCards {
  discord_id: bigint
  card_id: number
  amount: number
  date_owned: Date
}

interface Card {
  card_id: number
  rarity: number
  description: string
  name: string
}

interface CardUpgrade {
  card_id: number
  requirement: number
}

interface Event {
  id: Generated<number>
  start_time: number
  end_time: number
}

interface EventHasCards {
  event_id: bigint
  card_id: number
}

interface Database {
  player: Player
  player_has_cards: PlayerHasCards
  card: Card
  card_upgrade: CardUpgrade
  event: Event
  event_has_cards: EventHasCards
}

export default Database
