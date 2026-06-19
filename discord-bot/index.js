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
      '## 🎮 D31 스크림 플랫폼 디스코드에 오신 걸 환영합니다!',
      '',
      'D31은 대한민국 발로란트 & 리그 오브 레전드 팀들을 위한 스크림 매칭 플랫폼입니다.',
      '공정하고 즐거운 경쟁 환경을 위해 아래 규칙을 반드시 읽어주세요.',
      '',
      '─────────────────────────────',
      '',
      '**📌 기본 규칙**',
      '',
      '1. 상대방을 존중해주세요. 욕설, 비하, 혐오 발언은 즉시 제재됩니다.',
      '2. 스크림 약속은 반드시 지켜주세요. 노쇼는 매너 점수 감점 및 이용 제한으로 이어집니다.',
      '3. 어뷰징, 핵 사용, 불공정 행위는 영구 밴 처리됩니다.',
      '4. 광고 및 스팸은 금지입니다.',
      '',
      '─────────────────────────────',
      '',
      '**⚔️ 스크림 관련**',
      '',
      '- D31 공식 사이트에서 스크림 성사 시 해당 팀만 보이는 전용 음성 채널이 자동 생성됩니다.',
      '- 모든 팀원이 음성 채널을 나가면 채널은 자동으로 삭제됩니다.',
      '- 경기 결과는 플랫폼에 정직하게 입력해주세요. 조작 시 제재됩니다.',
      '- 상대팀에 대한 비매너 행위는 신고 대상입니다.',
      '',
      '─────────────────────────────',
      '',
      '**💬 채널 이용 안내**',
      '',
      '- 📌│공지사항 — 플랫폼 업데이트 및 중요 공지',
      '- 💬│자유채팅 — 자유롭게 대화하는 공간',
      '- 🎮│게임얘기 — 게임 관련 정보 공유',
      '- 📸│인증-자랑 — 전적 인증, 하이라이트 자랑',
      '- 💬│발로란트-채팅 / 💬│롤-채팅 — 게임별 채팅',
      '',
      '─────────────────────────────',
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
