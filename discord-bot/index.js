const { Client, GatewayIntentBits } = require('discord.js')
const { createClient } = require('@supabase/supabase-js')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
  ],
})

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

const GUILD_ID = process.env.DISCORD_GUILD_ID

let memberRoleId = null
const scrimChannels = new Set() // 현재 활성 스크림 채널 ID들

async function loadConfig() {
  // D31 Member 역할 ID 로드
  const { data: role } = await supabase
    .from('discord_roles')
    .select('discord_role_id')
    .eq('name', 'D31 Member')
    .single()
  if (role) memberRoleId = role.discord_role_id

  // 활성 스크림 채널 로드
  await refreshScrimChannels()

  console.log(`[D31 Bot] 설정 로드 완료 - memberRole: ${memberRoleId}, 채널: ${scrimChannels.size}개`)
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

// ── 봇 준비 ──
client.once('ready', async () => {
  console.log(`[D31 Bot] 온라인: ${client.user.tag}`)
  await loadConfig()
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

// ── 음성채널에서 모두 나가면 스크림 채널 자동 삭제 ──
client.on('voiceStateUpdate', async (oldState, newState) => {
  // 나간 경우만 처리 (들어오거나 이동은 무시)
  if (!oldState.channelId) return
  if (oldState.channelId === newState.channelId) return
  if (!scrimChannels.has(oldState.channelId)) return

  const channel = oldState.channel
  if (!channel) return

  // 채널이 비어있으면 삭제
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

// 30초마다 새 스크림 채널 감지 (DB 폴링)
setInterval(refreshScrimChannels, 30_000)

client.login(process.env.DISCORD_BOT_TOKEN)
