import * as dotenv from 'dotenv'
import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import migrateToLatest from './migrations'
import type Database from './model'
dotenv.config()

const migration = migrateToLatest()
const db = new Kysely<Database>({
  dialect: new PostgresDialect({
    pool: new Pool({
      host: process.env.POSTGRES_HOST,
      database: process.env.POSTGRES_DATABASE,
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      max: 30
    })
  }),
  log (event) {
    if (process.env.ENVIRONMENT !== 'dev') {
      return
    }
    if (event.level === 'query') {
      console.log(event.query.sql)
      console.log(event.query.parameters)
    }
  }
})

export async function dbReady (): Promise<Kysely<Database>> {
  await migration
  return db
}

export default db
