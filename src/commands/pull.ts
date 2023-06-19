import { showCards } from '../canvasUtils'
import db from '../db'
import { checkBalance, pull, withdrawMoney } from '../db/utils'
import {
  type CommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder,
  type AutocompleteInteraction
} from 'discord.js'

module.exports = {
  global: false,
  data: new SlashCommandBuilder()
    .setName('pull')
    .setDescription('Tire 5 cartes')
    .addStringOption((option) =>
      option
        .setName('bannière')
        .setDescription('Une bannière depuis laquelle pull')
        .setAutocomplete(true)
    ),
  async autocomplete (interaction: AutocompleteInteraction) {
    const focusedValue = interaction.options.getFocused()
    const events = await db.selectFrom('event').selectAll().execute()
    const filtered = events
      .filter(
        (e) =>
          (e.start_time ?? -Infinity) <= Date.now() &&
          (e.end_time ?? +Infinity) >= Date.now() &&
          e.name.startsWith(focusedValue)
      )
      .slice(0, 25)
    await interaction.respond(
      filtered.map((choice) => ({ name: choice.name, value: choice.id.toString() }))
    )
  },
  async execute (interaction: CommandInteraction) {
    if (interaction.guild === null) {
      throw new Error('guild is null')
    }
    if (interaction.member === null) {
      throw new Error('member is null')
    }
    const userId = BigInt(interaction.user.id)
    const { balance: balance_check } = await checkBalance(userId)

    if (balance_check < 200) {
      const statusUpdate = new EmbedBuilder()
        .setColor(0xff5555)
        .setTitle("Vous n'avez pas les fond nécessaires. Requis : 200")
        .addFields({
          name: 'Dans votre porte monnaie',
          value: balance_check.toString()
        })
      await interaction.reply({ embeds: [statusUpdate], ephemeral: true })
      return
    }

    const event = Number(interaction.options.get('bannière')?.value ?? (await db
      .selectFrom('event')
      .select('event.id')
      .where('default', '=', true)
      .executeTakeFirstOrThrow()).id)
    if (isNaN(event)) {
      throw new Error('event is NaN')
    }
    const cards = await pull(userId, event)

    await withdrawMoney(userId, 200)

    const image = await showCards(cards)

    await interaction.reply({ files: [{ attachment: image }], ephemeral: true })
  }
}
