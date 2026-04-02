# Discord Auth Bot

Bot do Discord para gerenciar licenças de produtos com integração ao Supabase.

## Funcionalidades

- ✅ Criar/ativar licenças por Discord ID
- ⛔ Banir/desbanir usuários
- ♻️ Resetar HWID (permite trocar de PC)
- 📄 Consultar informações de licença
- 🔒 Controle de acesso por cargo de admin

## Comandos

| Comando | Descrição | Parâmetros |
|---------|-----------|------------|
| `/addkey` | Cria ou ativa uma licença | `discord_id`, `product`, `days` |
| `/ban` | Bane uma licença | `discord_id` |
| `/unban` | Desbane uma licença | `discord_id` |
| `/reset_hwid` | Reseta o HWID vinculado | `discord_id` |
| `/info` | Mostra informações da licença | `discord_id` |

## Configuração

### 1. Pré-requisitos

- Node.js 16+ instalado
- Conta no Discord Developer Portal
- Conta no Supabase

### 2. Criar o Bot no Discord

1. Acesse https://discord.com/developers/applications
2. Crie uma nova aplicação
3. Vá em "Bot" e crie um bot
4. Copie o token do bot
5. Em "OAuth2 > URL Generator":
   - Selecione `bot` e `applications.commands`
   - Permissões: `Send Messages`, `Use Slash Commands`
   - Copie a URL gerada e adicione o bot ao seu servidor

### 3. Configurar Supabase

Crie uma tabela `licenses` com a seguinte estrutura:

```sql
CREATE TABLE licenses (
  discord_id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'active',
  product TEXT,
  expires_at TIMESTAMPTZ,
  hwid TEXT,
  hwid_set_at TIMESTAMPTZ,
  last_ip TEXT,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4. Instalação

```bash
# Clone o repositório
git clone https://github.com/WinterFellCore/auth-bot-for-discord.git
cd auth-bot-for-discord

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
```

### 5. Configurar Variáveis de Ambiente

Edite o arquivo `.env` com suas credenciais:

```env
DISCORD_TOKEN=seu_token_do_bot
CLIENT_ID=id_da_aplicacao
GUILD_ID=id_do_servidor

ADMIN_ROLE_ID=id_do_cargo_admin

SUPABASE_URL=sua_url_do_supabase
SUPABASE_SERVICE_KEY=sua_service_key
```

**Como obter os IDs:**
- Discord IDs: Ative o "Modo Desenvolvedor" nas configurações do Discord, depois clique com botão direito > Copiar ID
- Supabase: Acesse o painel do projeto > Settings > API

### 6. Registrar Comandos

```bash
node deploy-commands.js
```

### 7. Iniciar o Bot

```bash
node index.js
```

Você deve ver: `✅ Online como NomeDoBot#1234`

## Uso

Apenas membros com o cargo especificado em `ADMIN_ROLE_ID` podem usar os comandos.

**Exemplos:**

```
/addkey discord_id:123456789 product:premium days:30
/ban discord_id:123456789
/unban discord_id:123456789
/reset_hwid discord_id:123456789
/info discord_id:123456789
```

## Estrutura do Projeto

```
.
├── index.js              # Bot principal
├── deploy-commands.js    # Registra slash commands
├── package.json          # Dependências
├── .env                  # Credenciais (não commitado)
└── .env.example          # Template de configuração
```

## Tecnologias

- [Discord.js](https://discord.js.org/) v14
- [Supabase](https://supabase.com/) - Banco de dados PostgreSQL
- Node.js com ES Modules

## Licença

ISC
