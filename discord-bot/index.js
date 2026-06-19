const { Client, GatewayIntentBits, Partials } = require('discord.js')
const { createClient } = require('@supabase/supabase-js')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Reaction, Partials.User],
})

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

const GUILD_ID = process.env.DISCORD_GUILD_ID
const VERIFY_CHANNEL_ID = '1517581328936210464'
const VERIFY_EMOJI = '✅'

let memberRoleId = null
const scrimChannels = new Set()

async function loadConfig() {
  const { data: role } = await supabase
    .from('discord_roles')
    .select('discord_role_id')
    .eq('name', 'D31 Member')
    .single()
  if (role) memberRoleId = role.discord_role_id

  await refreshScrimChannels()
  console.log(`[D31 Bot] 설정 로드 완료 - memberRole: ${memberRoleId}`)
}

async function refreshScrimChannels() {
  const { data } = await supabase
    .from('matches')
    .select('discord_channel_id')
    .not('discord_channel_id', 'is', null)
    .neq('status', 'completed')

  data?.forEach((m) => {
    if (m.discord_channel_id) scrimChannels.add(m.discord_channel_id)
  })
}

async function postVerifyMessage() {
  const channel = await client.channels.fetch(VERIFY_CHANNEL_ID).catch(() => null)
  if (!channel) return

  // 기존 메시지 있으면 스킵
  const messages = await channel.messages.fetch({ limit: 10 })
  const existing = messages.find(m => m.author.id === client.user.id && m.reactions.cache.has(VERIFY_EMOJI))
  if (existing) {
    console.log('[D31 Bot] 인증 메시지 이미 존재')
    return
  }

  const msg = await channel.send({
    content: [
      '## D31 스크림 플랫폼에 오신 걸 환영해요!',
      '',
      '**D31**은 발로란트 & 리그 오브 레전드 스크림 매칭 플랫폼입니다.',
      '',
      '**서버 규칙**',
      '1. 상대방을 존중해주세요',
      '2. 스크림 약속은 반드시 지켜주세요',
      '3. 욕설 및 비하 발언 금지',
      '',
      '아래 ✅ 를 클릭하면 모든 채널이 열립니다.',
    ].join('\n'),
  })

  await msg.react(VERIFY_EMOJI)
  console.log('[D31 Bot] 인증 메시지 게시 완료')
}

// ── 봇 준비 ──
client.once('ready', async () => {
  console.log(`[D31 Bot] 온라인: ${client.user.tag}`)
  await loadConfig()
  await postVerifyMessage()
})

// ── 서버 입장 시 D31 Member 역할 부여 ──
client.on('guildMemberAdd', async (member) => {
  if (member.guild.id !== GUILD_ID) return
  if (!memberRoleId) return

  try {
    await member.roles.add(memberRoleId)
    console.log(`[D31 Bot] D31 Member 역할 부여: ${member.user.tag}`)
  } catch (e) {
    console.error(`[D31 Bot] 역할 부여 실패 (${member.user.tag}):`, e.message)
  }
})

// ── ✅ 반응 시 인증 역할 부여 ──
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return
  if (reaction.message.channelId !== VERIFY_CHANNEL_ID) return
  if (reaction.emoji.name !== VERIFY_EMOJI) return
  if (!memberRoleId) return

  try {
    const guild = await client.guilds.fetch(GUILD_ID)
    const member = await guild.members.fetch(user.id)
    if (member.roles.cache.has(memberRoleId)) return

    await member.roles.add(memberRoleId)
    console.log(`[D31 Bot] 인증 완료 - 역할 부여: ${user.tag}`)
  } catch (e) {
    console.error(`[D31 Bot] 인증 역할 부여 실패:`, e.message)
  }
})

// ── 음성채널에서 모두 나가면 스크림 채널 자동 삭제 ──
client.on('voiceStateUpdate', async (oldState, newState) => {
  if (!oldState.channelId) return
  if (oldState.channelId === newState.channelId) return
  if (!scrimChannels.has(oldState.channelId)) return

  const channel = oldState.channel
  if (!channel) return

  if (channel.members.size === 0) {
    try {
      const channelId = oldState.channelId
      await channel.delete('스크림 종료 - 모든 인원 퇴장')
      scrimChannels.delete(channelId)

      await supabase
        .from('matches')
        .update({ discord_channel_id: null })
        .eq('discord_channel_id', channelId)

      console.log(`[D31 Bot] 스크림 채널 자동 삭제: ${channel.name}`)
    } catch (e) {
      console.error('[D31 Bot] 채널 삭제 실패:', e.message)
    }
  }
})

setInterval(refreshScrimChannels, 30_000)

client.login(process.env.DISCORD_BOT_TOKEN)
