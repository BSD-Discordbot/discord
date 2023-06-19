import { checkBalance, dailyReward } from '../db/utils'
import {
  type CommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder
} from 'discord.js'

module.exports = {
  global: false,
  data: new SlashCommandBuilder()
    .setName('rj')
    .setDescription('Récupère ta récompense journalière'),
  async execute (interaction: CommandInteraction) {
    if (interaction.guild === null) {
      throw new Error('guild is null')
    }
    if (interaction.member === null) {
      throw new Error('member is null')
    }
    const userId = BigInt(interaction.user.id)
    await dailyReward(userId)
    const { balance, last_daily, daily_streak } = await checkBalance(userId)
    const statusUpdate = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`Porte-monnaie de ${interaction.user.username}`)
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() ?? undefined })
      .setTimestamp()
      .addFields({ name: 'Montant', value: balance.toString() })
      .addFields({ name: 'Dernière récompense récuperée', value: `<t:${Math.floor(last_daily.getTime() / 1000)}:R>`, inline: true })
      .addFields({ name: 'Combo journalier', value: daily_streak.toString(), inline: true })
      .setFooter({ text: 'Récompense journalière récuperée!' })

    await interaction.reply({ embeds: [statusUpdate], ephemeral: true })
  }
}
