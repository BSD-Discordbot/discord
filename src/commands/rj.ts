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
    const statusUpdate = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('List of roles')
      .setTimestamp()
      .addFields({ name: 'User', value: 'helo' })

    await interaction.reply({ embeds: [statusUpdate], ephemeral: true })
  }
}
