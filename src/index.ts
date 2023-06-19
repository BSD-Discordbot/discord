import { ActivityType, Client, Collection, Events, GatewayIntentBits } from 'discord.js'
import { discord_token } from './config.json'
import path from 'path'
import fs from 'fs'
import { dbReady } from './db'

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
})
client.commands = new Collection()

client.once(Events.ClientReady, async (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`)
  client.user?.setActivity('Logged in', {
    type: ActivityType.Listening
  })
})

const commandsPath = path.join(__dirname, 'commands')
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith('.js'))

const promises = [] as Array<Promise<any>>

// Load Slash commands
for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file)
  promises.push(
    import(filePath)
      .then(({ default: command }) => {
        if ('data' in command && 'execute' in command) {
          client.commands.set(command.data.name, command)
        } else {
          console.log(
            `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
          )
        }
      })
      .catch((e) => {
        console.log(e)
      })
  )
}

// Handle slash commands
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return

  const command = interaction.client.commands.get(interaction.commandName)

  if (command === undefined) {
    console.error(`No command matching ${interaction.commandName} was found.`)
    return
  }

  try {
    await command.execute(interaction)
  } catch (error) {
    console.trace(error)
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: 'Il y a eu une erreur durant l\'exécution de cette commande!',
        ephemeral: true
      }).catch(e => {})
    } else {
      await interaction.reply({
        content: 'Il y a eu une erreur durant l\'exécution de cette commande!',
        ephemeral: true
      }).catch(e => {})
    }
  }
})

promises.push(dbReady())
// Log in to Discord with your client's token
void Promise.all(promises)
  .then(async () => await client.login(discord_token))
  .catch((e) => {
    console.log(e)
  })
