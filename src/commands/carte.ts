import {
  type CommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder
} from 'discord.js'
import db from '../db'

module.exports = {
  global: false,
  data: new SlashCommandBuilder()
    .setName('carte')
    .setDescription('Inspecte une carte')
    .addIntegerOption((option) =>
      option
        .setName('numéro')
        .setDescription('Le numéro de la carte à inspecter')
        .setRequired(true)
    ),
  async execute (interaction: CommandInteraction) {
    if (interaction.guild === null) {
      throw new Error('guild is null')
    }
    if (interaction.member === null) {
      throw new Error('member is null')
    }
    const userId = BigInt(interaction.user.id)
    const cardId = Number(interaction.options.get('numéro')?.value)
    console.log(interaction.options.get('numéro')?.value)
    if (isNaN(cardId)) {
      throw new Error('cardId is NaN')
    }

    const card = await db
      .selectFrom('card')
      .select('card.rarity')
      .where('card.card_id', '=', cardId)
      .executeTakeFirst()
    if (!card) {
      const statusUpdate = new EmbedBuilder()
        .setColor(0xff5555)
        .setTitle("Cette carte n'a pas l'air d'exister...")
      await interaction.reply({ embeds: [statusUpdate], ephemeral: true })
      return
    }

    const inInventory = await db
      .selectFrom('player_has_card')
      .select('amount')
      .where('player_has_card.card_id', '=', cardId)
      .where('player_has_card.discord_id', '=', userId)
      .executeTakeFirst()

    /* const statusUpdate = new EmbedBuilder()
      .setColor(0x0099ff)
      .setImage(
        inInventory
          ? 'https://media.discordapp.net/attachments/1120094631355502693/1120349414591053895/4000.png'
          : 'https://media.discordapp.net/attachments/627205200566026243/1119982284129456248/cartes_4etoiles.png'
      )

    await interaction.reply({ embeds: [statusUpdate], ephemeral: true }) */
    await interaction.reply({
      files: [{
        attachment: inInventory
          ? 'https://media.discordapp.net/attachments/1120094631355502693/1120349414591053895/4000.png'
          : 'https://media.discordapp.net/attachments/627205200566026243/1119982284129456248/cartes_4etoiles.png'
      }]
    })
  }
}
