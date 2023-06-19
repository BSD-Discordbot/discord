import { checkBalance, weeklyReward } from '../db/utils'
import {
  type CommandInteraction,
  SlashCommandBuilder,
  EmbedBuilder
} from 'discord.js'

module.exports = {
  global: false,
  data: new SlashCommandBuilder()
    .setName('rh')
    .setDescription('Récupère ta récompense hebdomadaire'),
  async execute (interaction: CommandInteraction) {
    if (interaction.guild === null) {
      throw new Error('guild is null')
    }
    if (interaction.member === null) {
      throw new Error('member is null')
    }
    const userId = BigInt(interaction.user.id)
    const { daily_streak: daily_streak_check } = await checkBalance(userId)

    if (daily_streak_check < 7) {
      const statusUpdate = new EmbedBuilder()
        .setColor(0xff5555)
        .setTitle('Impossible de récupérer la récompense hedbomadaire : un combo minimum de 7 est nécessaire')
        .addFields({ name: 'Combo journalier', value: daily_streak_check.toString(), inline: true })
      await interaction.reply({ embeds: [statusUpdate], ephemeral: true })
      return
    }
    await weeklyReward(userId)
    const { balance, last_daily, daily_streak } = await checkBalance(userId)
    const statusUpdate = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`Porte-monnaie de ${interaction.user.username}`)
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.avatarURL() ?? undefined })
      .addFields({ name: 'Montant', value: balance.toString() })
      .addFields({ name: 'Dernière récompense récuperée', value: `<t:${Math.floor(last_daily.getTime() / 1000)}:R>`, inline: true })
      .addFields({ name: 'Combo journalier', value: daily_streak.toString(), inline: true })
      .setFooter({ text: 'Récompense hebdomadaire récuperée!' })

    await interaction.reply({ embeds: [statusUpdate], ephemeral: true })
  }
}
