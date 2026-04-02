import 'dotenv/config';
import { REST, Routes, SlashCommandBuilder } from 'discord.js';

const commands = [
  new SlashCommandBuilder()
    .setName('addkey')
    .setDescription('Cria/ativa licença por Discord ID')
    .addStringOption(o => o.setName('discord_id').setDescription('ID do cliente').setRequired(true))
    .addStringOption(o => o.setName('product').setDescription('Produto (ex: client)').setRequired(true))
    .addIntegerOption(o => o.setName('days').setDescription('Dias até expirar (0 = sem expiração)').setRequired(true)),

  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Bane uma licença (status=banned)')
    .addStringOption(o => o.setName('discord_id').setDescription('ID do cliente').setRequired(true)),

  new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Desbane uma licença (status=active)')
    .addStringOption(o => o.setName('discord_id').setDescription('ID do cliente').setRequired(true)),

  new SlashCommandBuilder()
    .setName('reset_hwid')
    .setDescription('Reseta o HWID (permite bindar outro PC)')
    .addStringOption(o => o.setName('discord_id').setDescription('ID do cliente').setRequired(true)),

  new SlashCommandBuilder()
    .setName('info')
    .setDescription('Mostra informações da licença')
    .addStringOption(o => o.setName('discord_id').setDescription('ID do cliente').setRequired(true)),
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

await rest.put(
  Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
  { body: commands }
);

console.log('✅ Slash commands registrados no servidor');
