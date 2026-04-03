import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';
import { createClient } from '@supabase/supabase-js';
import http from 'http';

const bot = new Client({ intents: [GatewayIntentBits.Guilds] });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  { auth: { persistSession: false } }
);

function hasAdminRole(member) {
  const roleId = process.env.ADMIN_ROLE_ID;
  return member?.roles?.cache?.has(roleId);
}

function toIsoOrNull(days) {
  if (!days || days <= 0) return null;
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

bot.once('ready', () => {
  console.log(`✅ Online como ${bot.user.tag}`);
});

bot.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // Permissão por cargo
  const member = interaction.member; // GuildMember
  if (!hasAdminRole(member)) {
    return interaction.reply({ content: '❌ Você não tem permissão (cargo admin).', ephemeral: true });
  }

  try {
    if (interaction.commandName === 'addkey') {
      const discord_id = interaction.options.getString('discord_id', true).trim();
      const product = interaction.options.getString('product', true).trim();
      const days = interaction.options.getInteger('days', true);

      const expires_at = toIsoOrNull(days);

      // upsert: cria ou atualiza
      const { error } = await supabase.from('licenses').upsert({
        discord_id,
        status: 'active',
        product,
        expires_at,
      }, { onConflict: 'discord_id' });

      if (error) throw error;

      return interaction.reply({
        content: `✅ Licença ativa\n• ID: \`${discord_id}\`\n• Product: \`${product}\`\n• Expira: ${expires_at ?? 'NUNCA'}`,
        ephemeral: true
      });
    }

    if (interaction.commandName === 'ban') {
      const discord_id = interaction.options.getString('discord_id', true).trim();

      const { error } = await supabase.from('licenses')
        .update({ status: 'banned' })
        .eq('discord_id', discord_id);

      if (error) throw error;

      return interaction.reply({ content: `⛔ Banido: \`${discord_id}\``, ephemeral: true });
    }

    if (interaction.commandName === 'unban') {
      const discord_id = interaction.options.getString('discord_id', true).trim();

      const { error } = await supabase.from('licenses')
        .update({ status: 'active' })
        .eq('discord_id', discord_id);

      if (error) throw error;

      return interaction.reply({ content: `✅ Ativado: \`${discord_id}\``, ephemeral: true });
    }

    if (interaction.commandName === 'reset_hwid') {
      const discord_id = interaction.options.getString('discord_id', true).trim();

      const { error } = await supabase.from('licenses')
        .update({ hwid: null, hwid_set_at: null })
        .eq('discord_id', discord_id);

      if (error) throw error;

      return interaction.reply({ content: `♻️ HWID resetado: \`${discord_id}\``, ephemeral: true });
    }

    if (interaction.commandName === 'info') {
      const discord_id = interaction.options.getString('discord_id', true).trim();

      const { data, error } = await supabase.from('licenses')
        .select('discord_id,status,product,expires_at,hwid,hwid_set_at,last_ip,last_seen_at')
        .eq('discord_id', discord_id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return interaction.reply({ content: `❌ Não encontrado: \`${discord_id}\``, ephemeral: true });

      return interaction.reply({
        content:
`📄 Licença
• ID: \`${data.discord_id}\`
• Status: \`${data.status}\`
• Product: \`${data.product ?? 'null'}\`
• Expira: \`${data.expires_at ?? 'NUNCA'}\`
• HWID: \`${data.hwid ?? 'NÃO BINDA'}\`
• HWID set: \`${data.hwid_set_at ?? '-'}\`
• Last IP: \`${data.last_ip ?? '-'}\`
• Last seen: \`${data.last_seen_at ?? '-'}\``,
        ephemeral: true
      });
    }

  } catch (e) {
    console.error(e);
    return interaction.reply({ content: `❌ Erro: ${e.message ?? 'unknown'}`, ephemeral: true });
  }
});

bot.login(process.env.DISCORD_TOKEN);

// Servidor HTTP para manter o bot acordado
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Bot is alive!');
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🌐 HTTP server running on port ${PORT}`);
});
