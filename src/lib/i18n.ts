import type { Lang } from '@/contexts/LanguageContext'

const translations = {
  // ── Navbar ──────────────────────────────────────────────────────────
  nav_scrims_post:       { ko:'스크림 올리기',   en:'Post Scrim',      ja:'スクリム掲載',    zh:'发布训练赛',   th:'โพสต์สคริม',       pt:'Postar Scrim',      es:'Publicar Scrim'   },
  nav_find_team:        { ko:'팀 찾기',          en:'Find Team',       ja:'チーム検索',      zh:'查找队伍',     th:'หาทีม',            pt:'Encontrar Time',    es:'Buscar Equipo'    },
  nav_recruit:          { ko:'모집',             en:'Recruit',         ja:'募集',            zh:'招募',         th:'รับสมัคร',          pt:'Recrutar',          es:'Reclutar'         },
  nav_leaderboard:      { ko:'리더보드',          en:'Leaderboard',    ja:'ランキング',      zh:'排行榜',       th:'ลีดเดอร์บอร์ด',     pt:'Placar',            es:'Clasificación'    },
  nav_search_placeholder:{ ko:'팀 또는 유저 검색', en:'Search team or user', ja:'チームまたはユーザー検索', zh:'搜索队伍或用户', th:'ค้นหาทีมหรือผู้ใช้', pt:'Buscar time ou usuário', es:'Buscar equipo o usuario' },
  nav_teams_section:    { ko:'팀',               en:'Teams',           ja:'チーム',          zh:'队伍',         th:'ทีม',              pt:'Times',             es:'Equipos'          },
  nav_users_section:    { ko:'유저',             en:'Users',           ja:'ユーザー',        zh:'用户',         th:'ผู้ใช้',            pt:'Usuários',          es:'Usuarios'         },

  // ── Login ───────────────────────────────────────────────────────────
  login_subtitle:       { ko:"Korea's First Scrim Platform", en:"Korea's First Scrim Platform", ja:"韓国初スクリムプラットフォーム", zh:"韩国首个训练赛平台", th:"แพลตฟอร์มสคริมแรกของเกาหลี", pt:"Primeira Plataforma de Scrim da Coreia", es:"Primera Plataforma de Scrim de Corea" },
  login_title:          { ko:'로그인',            en:'Login',           ja:'ログイン',        zh:'登录',         th:'เข้าสู่ระบบ',        pt:'Entrar',            es:'Iniciar Sesión'   },
  login_discord_btn:    { ko:'Discord로 로그인 / 회원가입', en:'Login / Sign up with Discord', ja:'Discordでログイン / 登録', zh:'使用Discord登录 / 注册', th:'เข้าสู่ระบบ / สมัครด้วย Discord', pt:'Entrar / Cadastrar com Discord', es:'Entrar / Registrarse con Discord' },
  login_discord_connecting: { ko:'연결 중...', en:'Connecting...', ja:'接続中...', zh:'连接中...', th:'กำลังเชื่อมต่อ...', pt:'Conectando...', es:'Conectando...' },
  login_or:             { ko:'또는',             en:'or',              ja:'または',          zh:'或者',         th:'หรือ',              pt:'ou',                es:'o'                },
  login_email_placeholder: { ko:'이메일',        en:'Email',           ja:'メール',          zh:'邮箱',         th:'อีเมล',             pt:'E-mail',            es:'Correo electrónico' },
  login_password_placeholder: { ko:'비밀번호',   en:'Password',        ja:'パスワード',      zh:'密码',         th:'รหัสผ่าน',          pt:'Senha',             es:'Contraseña'       },
  login_email_error:    { ko:'이메일 또는 비밀번호가 올바르지 않아요', en:'Invalid email or password', ja:'メールまたはパスワードが正しくありません', zh:'邮箱或密码不正确', th:'อีเมลหรือรหัสผ่านไม่ถูกต้อง', pt:'E-mail ou senha incorretos', es:'Correo o contraseña incorrectos' },
  login_email_btn:      { ko:'이메일로 로그인',  en:'Login with Email', ja:'メールでログイン', zh:'邮箱登录',    th:'เข้าสู่ระบบด้วยอีเมล', pt:'Entrar com E-mail', es:'Entrar con Correo' },
  login_email_loading:  { ko:'로그인 중...',     en:'Logging in...',   ja:'ログイン中...',   zh:'登录中...',    th:'กำลังเข้าสู่ระบบ...', pt:'Entrando...',      es:'Iniciando sesión...' },
  login_back:           { ko:'← 메인으로 돌아가기', en:'← Back to Main', ja:'← メインに戻る', zh:'← 返回主页', th:'← กลับหน้าหลัก',  pt:'← Voltar ao Início', es:'← Volver al Inicio' },

  // ── ProfileDropdown ─────────────────────────────────────────────────
  profile_view:         { ko:'프로필 보기',       en:'View Profile',    ja:'プロフィール表示', zh:'查看资料',     th:'ดูโปรไฟล์',        pt:'Ver Perfil',        es:'Ver Perfil'       },
  profile_edit:         { ko:'정보 수정',         en:'Edit Info',       ja:'情報編集',        zh:'编辑信息',     th:'แก้ไขข้อมูล',       pt:'Editar Informações', es:'Editar Información' },
  profile_team_manage:  { ko:'팀 관리',           en:'Team Management', ja:'チーム管理',      zh:'队伍管理',     th:'จัดการทีม',         pt:'Gerenciar Time',    es:'Gestionar Equipo' },
  profile_dashboard:    { ko:'대시보드',           en:'Dashboard',       ja:'ダッシュボード',  zh:'仪表板',       th:'แดชบอร์ด',          pt:'Painel',            es:'Panel'            },
  profile_logout:       { ko:'로그아웃',           en:'Logout',          ja:'ログアウト',      zh:'退出登录',     th:'ออกจากระบบ',        pt:'Sair',              es:'Cerrar Sesión'    },
  profile_default_name: { ko:'유저',              en:'User',            ja:'ユーザー',        zh:'用户',         th:'ผู้ใช้',            pt:'Usuário',           es:'Usuario'          },

  // ── AutoMatchButton ─────────────────────────────────────────────────
  auto_match_title:     { ko:'자동 매칭',         en:'Auto Match',      ja:'自動マッチング',  zh:'自动匹配',     th:'จับคู่อัตโนมัติ',   pt:'Partida Automática', es:'Emparejamiento Automático' },
  auto_match_count:     { ko:'경기 수',           en:'Games',           ja:'試合数',          zh:'局数',         th:'จำนวนเกม',          pt:'Partidas',          es:'Partidas'         },
  auto_match_server:    { ko:'서버',              en:'Server',          ja:'サーバー',        zh:'服务器',       th:'เซิร์ฟเวอร์',       pt:'Servidor',          es:'Servidor'         },
  auto_match_start:     { ko:'⚡ 매칭 시작',      en:'⚡ Start Match',  ja:'⚡ マッチ開始',   zh:'⚡ 开始匹配',  th:'⚡ เริ่มจับคู่',    pt:'⚡ Iniciar Partida', es:'⚡ Iniciar Partida' },
  auto_match_searching: { ko:'탐색 중...',        en:'Searching...',    ja:'検索中...',       zh:'搜索中...',    th:'กำลังค้นหา...',     pt:'Buscando...',       es:'Buscando...'      },
  auto_match_waiting:   { ko:'상대팀 탐색 중...',  en:'Finding opponent...', ja:'相手チーム検索中...', zh:'正在寻找对手...', th:'กำลังหาคู่แข่ง...', pt:'Procurando adversário...', es:'Buscando adversario...' },
  auto_match_cancel:    { ko:'취소',              en:'Cancel',          ja:'キャンセル',      zh:'取消',         th:'ยกเลิก',            pt:'Cancelar',          es:'Cancelar'         },

  // ── My Team card ────────────────────────────────────────────────────
  my_team_label:        { ko:'My Team',           en:'My Team',         ja:'マイチーム',      zh:'我的队伍',     th:'ทีมของฉัน',         pt:'Meu Time',          es:'Mi Equipo'        },
  my_team_captain:      { ko:'캡틴',              en:'Captain',         ja:'キャプテン',      zh:'队长',         th:'กัปตัน',            pt:'Capitão',           es:'Capitán'          },
  my_team_member:       { ko:'멤버',              en:'Member',          ja:'メンバー',        zh:'成员',         th:'สมาชิก',            pt:'Membro',            es:'Miembro'          },
  my_team_no_team:      { ko:'팀 없음',           en:'No team',         ja:'チームなし',      zh:'无队伍',       th:'ไม่มีทีม',          pt:'Sem time',          es:'Sin equipo'       },
  my_team_create:       { ko:'팀 만들기',         en:'Create Team',     ja:'チーム作成',      zh:'创建队伍',     th:'สร้างทีม',          pt:'Criar Time',        es:'Crear Equipo'     },

  // ── Manner Score ────────────────────────────────────────────────────
  manner_score:         { ko:'Manner Score',      en:'Manner Score',    ja:'マナースコア',    zh:'礼仪分',       th:'คะแนนมารยาท',       pt:'Pontuação de Conduta', es:'Puntuación de Conducta' },
  manner_default:       { ko:'기본',              en:'Basic',           ja:'基本',            zh:'基础',         th:'พื้นฐาน',           pt:'Básico',            es:'Básico'           },

  // ── Onboarding Checklist ────────────────────────────────────────────
  guide_title:              { ko:'시작 가이드',              en:'Getting Started',         ja:'スタートガイド',          zh:'入门指南',          th:'คู่มือเริ่มต้น',          pt:'Guia de Início',              es:'Guía de Inicio'              },
  onboard_step_riot_label:  { ko:'Riot 계정 연동',          en:'Link Riot Account',       ja:'Riotアカウント連携',      zh:'关联Riot账户',      th:'เชื่อมบัญชี Riot',       pt:'Vincular Conta Riot',         es:'Vincular Cuenta Riot'        },
  onboard_step_riot_desc_val:{ ko:'발로란트 닉네임과 티어를 등록하세요', en:'Register your VALORANT name and tier', ja:'VALORANTのニックネームとティアを登録', zh:'注册你的VALORANT昵称和段位', th:'ลงทะเบียนชื่อและระดับ VALORANT ของคุณ', pt:'Registre seu nome e nível no VALORANT', es:'Registra tu nombre y nivel en VALORANT' },
  onboard_step_riot_desc_lol:{ ko:'리그 오브 레전드 닉네임과 티어를 등록하세요', en:'Register your LoL name and tier', ja:'リーグ・オブ・レジェンドのニックネームとティアを登録', zh:'注册你的英雄联盟昵称和段位', th:'ลงทะเบียนชื่อและระดับ LoL ของคุณ', pt:'Registre seu nome e nível no LoL', es:'Registra tu nombre y nivel en LoL' },
  onboard_step_riot_cta:    { ko:'연동하기',                en:'Link Now',                ja:'連携する',                zh:'立即关联',          th:'เชื่อมเลย',               pt:'Vincular Agora',              es:'Vincular Ahora'              },
  onboard_step_team_label:  { ko:'팀 가입 또는 생성',       en:'Join or Create a Team',   ja:'チームに参加または作成',  zh:'加入或创建队伍',    th:'เข้าร่วมหรือสร้างทีม',    pt:'Entrar ou Criar um Time',     es:'Unirse o Crear un Equipo'    },
  onboard_step_team_desc:   { ko:'팀이 있어야 스크림을 신청할 수 있어요', en:'You need a team to apply for scrims', ja:'スクリムを申請するにはチームが必要です', zh:'需要有队伍才能申请训练赛', th:'คุณต้องมีทีมเพื่อสมัครสคริม', pt:'Você precisa de um time para solicitar scrims', es:'Necesitas un equipo para solicitar scrims' },
  onboard_step_team_view:   { ko:'내 팀 보기',              en:'View My Team',            ja:'マイチームを見る',        zh:'查看我的队伍',      th:'ดูทีมของฉัน',             pt:'Ver Meu Time',                es:'Ver Mi Equipo'               },
  onboard_step_scrim_label: { ko:'첫 스크림 신청',          en:'Apply for First Scrim',   ja:'初めてのスクリム申請',    zh:'申请第一场训练赛',  th:'สมัครสคริมครั้งแรก',      pt:'Solicitar Primeiro Scrim',    es:'Solicitar Primer Scrim'      },
  onboard_step_scrim_desc:  { ko:'스크림 게시판에서 상대 팀을 찾아보세요', en:'Find an opponent on the scrim board', ja:'スクリム掲示板で相手チームを探してみよう', zh:'在训练赛看板找对手队伍', th:'หาคู่แข่งในบอร์ดสคริม', pt:'Encontre um adversário no quadro de scrims', es:'Busca un adversario en el tablero de scrims' },
  onboard_step_scrim_cta:   { ko:'스크림 찾기',             en:'Find Scrim',              ja:'スクリムを探す',          zh:'查找训练赛',        th:'หาสคริม',                  pt:'Encontrar Scrim',             es:'Buscar Scrim'                },

  // ── ScrimList ───────────────────────────────────────────────────────
  scrim_board:          { ko:'스크림 게시판',      en:'Scrim Board',     ja:'スクリム掲示板',  zh:'训练赛看板',   th:'บอร์ดสคริม',        pt:'Quadro de Scrims',  es:'Tablero de Scrims' },
  scrim_view_all:       { ko:'전체 보기 →',        en:'View All →',      ja:'すべて見る →',    zh:'查看全部 →',   th:'ดูทั้งหมด →',       pt:'Ver Todos →',       es:'Ver Todo →'       },
  scrim_no_results:     { ko:'조건에 맞는 스크림이 없어요', en:'No scrims found', ja:'条件に合うスクリムがありません', zh:'没有符合条件的训练赛', th:'ไม่พบสคริมที่ตรงเงื่อนไข', pt:'Nenhum scrim encontrado', es:'No se encontraron scrims' },
  scrim_post_btn:       { ko:'+ 스크림 올리기',   en:'+ Post Scrim',    ja:'+ スクリム掲載',  zh:'+ 发布训练赛', th:'+ โพสต์สคริม',      pt:'+ Publicar Scrim',  es:'+ Publicar Scrim' },
  scrim_team_name:      { ko:'팀 이름',           en:'Team',            ja:'チーム名',        zh:'队伍名',       th:'ชื่อทีม',           pt:'Time',              es:'Equipo'           },
  scrim_avg_tier:       { ko:'평균 티어',          en:'Avg Tier',        ja:'平均ティア',      zh:'平均段位',     th:'ระดับเฉลี่ย',       pt:'Nível Médio',       es:'Nivel Promedio'   },
  scrim_preferred_time: { ko:'희망 시간',          en:'Preferred Time',  ja:'希望時間',        zh:'希望时间',     th:'เวลาที่ต้องการ',    pt:'Horário Preferido', es:'Hora Preferida'   },
  scrim_server:         { ko:'서버',              en:'Server',          ja:'サーバー',        zh:'服务器',       th:'เซิร์ฟเวอร์',       pt:'Servidor',          es:'Servidor'         },
  scrim_format:         { ko:'포맷',              en:'Format',          ja:'フォーマット',    zh:'赛制',         th:'รูปแบบ',            pt:'Formato',           es:'Formato'          },
  scrim_apply:          { ko:'신청',              en:'Apply',           ja:'申請',            zh:'申请',         th:'สมัคร',             pt:'Aplicar',           es:'Aplicar'          },
  scrim_undecided:      { ko:'미정',              en:'TBD',             ja:'未定',            zh:'待定',         th:'ยังไม่กำหนด',       pt:'A definir',         es:'Por definir'      },
  scrim_filter:         { ko:'필터',              en:'Filter',          ja:'フィルター',      zh:'筛选',         th:'กรอง',              pt:'Filtrar',           es:'Filtrar'          },
  scrim_filter_reset:   { ko:'초기화',            en:'Reset',           ja:'リセット',        zh:'重置',         th:'รีเซ็ต',            pt:'Redefinir',         es:'Reiniciar'        },
  scrim_filter_tier:    { ko:'티어',              en:'Tier',            ja:'ティア',          zh:'段位',         th:'ระดับ',             pt:'Nível',             es:'Nivel'            },
  scrim_apply_btn:      { ko:'스크림 신청',        en:'Apply for Scrim', ja:'スクリム申請',    zh:'申请训练赛',   th:'สมัครสคริม',        pt:'Candidatar-se',     es:'Solicitar Scrim'  },
  scrim_applying:       { ko:'신청 중...',         en:'Applying...',     ja:'申請中...',       zh:'申请中...',    th:'กำลังสมัคร...',     pt:'Candidatando...',   es:'Solicitando...'   },
  scrim_accepted:       { ko:'수락됨 ✓',          en:'Accepted ✓',      ja:'承認済み ✓',      zh:'已接受 ✓',     th:'ยอมรับแล้ว ✓',     pt:'Aceito ✓',          es:'Aceptado ✓'       },
  scrim_no_team_msg:    { ko:'신청하려면 먼저',    en:'To apply, first', ja:'申請するにはまず', zh:'申请前请先', th:'สมัครก่อนต้อง',     pt:'Para se candidatar, primeiro', es:'Para aplicar, primero' },
  scrim_no_team_link:   { ko:'팀을 만드세요',      en:'create a team',   ja:'チームを作ってください', zh:'创建队伍', th:'สร้างทีม',         pt:'crie um time',      es:'crea un equipo'   },

  // ── ReceivedApplications ────────────────────────────────────────────
  recv_title:           { ko:'받은 스크림 신청',   en:'Received Applications', ja:'受け取ったスクリム申請', zh:'收到的训练赛申请', th:'คำขอสคริมที่ได้รับ', pt:'Candidaturas Recebidas', es:'Solicitudes Recibidas' },
  recv_no_requests:     { ko:'아직 들어온 요청이 없어요!', en:'No requests yet!', ja:'まだリクエストがありません！', zh:'暂无请求！', th:'ยังไม่มีคำขอ!', pt:'Sem solicitações ainda!', es:'¡Sin solicitudes aún!' },
  recv_preferred_time:  { ko:'희망 시간:',         en:'Preferred time:',  ja:'希望時間：',      zh:'希望时间：',   th:'เวลาที่ต้องการ:',   pt:'Horário preferido:', es:'Hora preferida:'  },
  recv_confirm:         { ko:'확정',              en:'Confirm',          ja:'確定',            zh:'确认',         th:'ยืนยัน',            pt:'Confirmar',         es:'Confirmar'        },
  recv_accept:          { ko:'수락',              en:'Accept',           ja:'承認',            zh:'接受',         th:'ยอมรับ',            pt:'Aceitar',           es:'Aceptar'          },
  recv_reject:          { ko:'거절',              en:'Reject',           ja:'拒否',            zh:'拒绝',         th:'ปฏิเสธ',            pt:'Rejeitar',          es:'Rechazar'         },
  recv_accepted:        { ko:'수락됨',            en:'Accepted',         ja:'承認済み',        zh:'已接受',       th:'ยอมรับแล้ว',        pt:'Aceito',            es:'Aceptado'         },
  recv_rejected:        { ko:'거절됨',            en:'Rejected',         ja:'拒否済み',        zh:'已拒绝',       th:'ถูกปฏิเสธ',         pt:'Rejeitado',         es:'Rechazado'        },
  recv_view_match:      { ko:'매치 보기 →',        en:'View Match →',     ja:'マッチを見る →',  zh:'查看比赛 →',   th:'ดูแมตช์ →',         pt:'Ver Partida →',     es:'Ver Partida →'    },

  // ── TeamRankings ────────────────────────────────────────────────────
  ranking_title:        { ko:'팀 랭킹',           en:'Team Rankings',   ja:'チームランキング', zh:'队伍排名',     th:'อันดับทีม',         pt:'Ranking de Times',  es:'Clasificación de Equipos' },
  ranking_avg_tier:     { ko:'평균 티어',          en:'Avg Tier',        ja:'平均ティア',      zh:'平均段位',     th:'ระดับเฉลี่ย',       pt:'Nível Médio',       es:'Nivel Promedio'   },
  ranking_winrate:      { ko:'승률',              en:'Win Rate',        ja:'勝率',            zh:'胜率',         th:'อัตราชนะ',          pt:'Taxa de Vitória',   es:'Tasa de Victorias' },
  ranking_activity:     { ko:'스크림 활동',        en:'Activity',        ja:'スクリム活動',    zh:'训练赛活动',   th:'กิจกรรมสคริม',      pt:'Atividade',         es:'Actividad'        },
  ranking_no_teams:     { ko:'아직 팀이 없어요',   en:'No teams yet',    ja:'まだチームがありません', zh:'暂无队伍', th:'ยังไม่มีทีม',       pt:'Sem times ainda',   es:'Sin equipos aún'  },
  ranking_col_rank:     { ko:'순위',              en:'Rank',            ja:'順位',            zh:'排名',         th:'อันดับ',            pt:'Posição',           es:'Posición'         },
  ranking_col_team:     { ko:'팀 이름',           en:'Team',            ja:'チーム名',        zh:'队伍名',       th:'ชื่อทีม',           pt:'Time',              es:'Equipo'           },
  ranking_col_value:    { ko:'수치',              en:'Value',           ja:'値',              zh:'数值',         th:'ค่า',               pt:'Valor',             es:'Valor'            },

  // ── MatchTabs ───────────────────────────────────────────────────────
  tab_overview:         { ko:'개요',              en:'Overview',        ja:'概要',            zh:'概览',         th:'ภาพรวม',            pt:'Visão Geral',       es:'Resumen'          },
  tab_stats:            { ko:'통계',              en:'Stats',           ja:'統計',            zh:'统计',         th:'สถิติ',              pt:'Estatísticas',      es:'Estadísticas'     },
  map_all:              { ko:'전체 맵',           en:'All Maps',        ja:'全マップ',        zh:'所有地图',     th:'ทุกแผนที่',          pt:'Todos os Mapas',    es:'Todos los Mapas'  },
  stat_player:          { ko:'플레이어',           en:'Player',          ja:'プレイヤー',      zh:'玩家',         th:'ผู้เล่น',            pt:'Jogador',           es:'Jugador'          },

  // ── RosterComparison ────────────────────────────────────────────────
  roster_title:         { ko:'로스터 비교',        en:'Roster Comparison', ja:'ロスター比較',  zh:'阵容对比',     th:'เปรียบเทียบรายชื่อ', pt:'Comparação de Equipes', es:'Comparación de Plantillas' },
  unknown_player:       { ko:'알 수 없음',         en:'Unknown',         ja:'不明',            zh:'未知',         th:'ไม่ทราบ',            pt:'Desconhecido',      es:'Desconocido'      },

  // ── NotificationBell ────────────────────────────────────────────────
  notif_title:          { ko:'알림',              en:'Notifications',   ja:'通知',            zh:'通知',         th:'การแจ้งเตือน',      pt:'Notificações',      es:'Notificaciones'   },
  notif_mark_read:      { ko:'모두 읽음',          en:'Mark all read',   ja:'すべて既読',      zh:'全部已读',     th:'ทำเครื่องหมายอ่านทั้งหมด', pt:'Marcar tudo como lido', es:'Marcar todo leído' },
  notif_none:           { ko:'알림이 없어요',       en:'No notifications', ja:'通知はありません', zh:'暂无通知',    th:'ไม่มีการแจ้งเตือน', pt:'Sem notificações',  es:'Sin notificaciones' },

  // ── TeamPageTabs ────────────────────────────────────────────────────
  team_tab_overview:    { ko:'개요',              en:'Overview',        ja:'概要',            zh:'概览',         th:'ภาพรวม',            pt:'Visão Geral',       es:'Resumen'          },
  team_tab_stats:       { ko:'통계',              en:'Stats',           ja:'統計',            zh:'统计',         th:'สถิติ',              pt:'Estatísticas',      es:'Estadísticas'     },
  team_tab_matches:     { ko:'매치',              en:'Matches',         ja:'マッチ',          zh:'比赛',         th:'แมตช์',             pt:'Partidas',          es:'Partidas'         },
  team_tab_chat:        { ko:'채팅',              en:'Chat',            ja:'チャット',        zh:'聊天',         th:'แชท',               pt:'Chat',              es:'Chat'             },

  // ── Match Page ──────────────────────────────────────────────────────
  match_scrim_label:    { ko:'스크림 매치',        en:'Scrim Match',     ja:'スクリムマッチ',  zh:'训练赛',       th:'แมตช์สคริม',        pt:'Partida de Scrim',  es:'Partida de Scrim' },
  match_undecided:      { ko:'날짜 미정',          en:'Date TBD',        ja:'日程未定',        zh:'日期待定',     th:'วันที่ยังไม่กำหนด', pt:'Data a definir',    es:'Fecha por definir' },
  match_completed:      { ko:'종료',              en:'Ended',           ja:'終了',            zh:'已结束',       th:'จบแล้ว',             pt:'Encerrado',         es:'Finalizado'       },
  match_ongoing:        { ko:'진행 중',           en:'Ongoing',         ja:'進行中',          zh:'进行中',       th:'กำลังดำเนินการ',    pt:'Em Andamento',      es:'En Curso'         },
  match_scheduled:      { ko:'예정',              en:'Scheduled',       ja:'予定',            zh:'计划中',       th:'กำหนดการ',          pt:'Agendado',          es:'Programado'       },
  match_team1:          { ko:'팀 1',              en:'Team 1',          ja:'チーム1',         zh:'队伍1',        th:'ทีม 1',             pt:'Time 1',            es:'Equipo 1'         },
  match_team2:          { ko:'팀 2',              en:'Team 2',          ja:'チーム2',         zh:'队伍2',        th:'ทีม 2',             pt:'Time 2',            es:'Equipo 2'         },
  match_waiting_room:   { ko:'대기실',             en:'Waiting Room',    ja:'待機室',          zh:'等待室',       th:'ห้องรอ',             pt:'Sala de Espera',    es:'Sala de Espera'   },
  match_team_only:      { ko:'팀원만 입장 가능',   en:'Team members only', ja:'チームメンバーのみ入場可', zh:'仅限队员进入', th:'เฉพาะสมาชิกทีมเท่านั้น', pt:'Apenas membros do time', es:'Solo miembros del equipo' },

  // ── Dashboard ───────────────────────────────────────────────────────
  dash_users:           { ko:'가입 유저 수',       en:'Users',           ja:'登録ユーザー数',  zh:'注册用户数',   th:'จำนวนผู้ใช้',       pt:'Usuários',          es:'Usuarios'         },
  dash_teams:           { ko:'팀',                en:'Teams',           ja:'チーム数',        zh:'队伍数',       th:'ทีม',               pt:'Times',             es:'Equipos'          },
  dash_avg_manner:      { ko:'평균 매너점수',       en:'Avg Manner Score', ja:'平均マナースコア', zh:'平均礼仪分', th:'คะแนนมารยาทเฉลี่ย', pt:'Pontuação Média de Conduta', es:'Puntuación de Conducta Promedio' },
  dash_recent_matches:  { ko:'최근 매치',          en:'Recent Matches',  ja:'最近のマッチ',    zh:'最近比赛',     th:'แมตช์ล่าสุด',       pt:'Partidas Recentes', es:'Partidas Recientes' },
  dash_no_matches:      { ko:'매치 기록이 없어요',  en:'No match records', ja:'マッチ記録なし', zh:'暂无比赛记录', th:'ไม่มีบันทึกแมตช์',  pt:'Sem registros de partida', es:'Sin registros de partidas' },
  dash_applied_scrims:  { ko:'내가 신청한 스크림',  en:'My Applied Scrims', ja:'申請済みスクリム', zh:'我申请的训练赛', th:'สคริมที่ฉันสมัคร', pt:'Meus Scrims Aplicados', es:'Mis Scrims Solicitados' },
  dash_check_status:    { ko:'신청 현황 확인',      en:'Check application status', ja:'申請状況確認', zh:'查看申请状态', th:'ตรวจสอบสถานะการสมัคร', pt:'Ver status da candidatura', es:'Ver estado de solicitud' },

  // ── Team Detail ─────────────────────────────────────────────────────
  team_info:            { ko:'팀 정보',           en:'Team Info',       ja:'チーム情報',      zh:'队伍信息',     th:'ข้อมูลทีม',         pt:'Informações do Time', es:'Información del Equipo' },
  team_game:            { ko:'게임',              en:'Game',            ja:'ゲーム',          zh:'游戏',         th:'เกม',               pt:'Jogo',              es:'Juego'            },
  team_avg_tier:        { ko:'평균 티어',          en:'Avg Tier',        ja:'平均ティア',      zh:'平均段位',     th:'ระดับเฉลี่ย',       pt:'Nível Médio',       es:'Nivel Promedio'   },
  team_members_label:   { ko:'멤버',              en:'Members',         ja:'メンバー',        zh:'成员',         th:'สมาชิก',            pt:'Membros',           es:'Miembros'         },
  team_players:         { ko:'선수',              en:'Players',         ja:'選手',            zh:'选手',         th:'นักกีฬา',           pt:'Jogadores',         es:'Jugadores'        },
  team_staff:           { ko:'스태프',             en:'Staff',           ja:'スタッフ',        zh:'工作人员',     th:'สตาฟ',              pt:'Equipe Técnica',    es:'Cuerpo Técnico'   },
  team_win:             { ko:'승',                en:'W',               ja:'勝',              zh:'胜',           th:'ชนะ',               pt:'V',                 es:'V'                },
  team_loss:            { ko:'패',                en:'L',               ja:'負',              zh:'负',           th:'แพ้',               pt:'D',                 es:'D'                },
  team_winrate:         { ko:'승률',              en:'Win Rate',        ja:'勝率',            zh:'胜率',         th:'อัตราชนะ',          pt:'Taxa de Vitória',   es:'Tasa de Victorias' },
  team_no_matches:      { ko:'아직 매치 기록이 없어요', en:'No match records yet', ja:'まだマッチ記録がありません', zh:'暂无比赛记录', th:'ยังไม่มีบันทึกแมตช์', pt:'Sem registros de partida ainda', es:'Sin registros de partidas aún' },
  team_invite_only:     { ko:'🔒 초대 전용 팀',   en:'🔒 Invite Only',  ja:'🔒 招待制チーム', zh:'🔒 仅限邀请',  th:'🔒 เฉพาะเชิญ',     pt:'🔒 Apenas por Convite', es:'🔒 Solo por Invitación' },
  team_manage_btn:      { ko:'팀 관리',           en:'Manage Team',     ja:'チーム管理',      zh:'管理队伍',     th:'จัดการทีม',         pt:'Gerenciar Time',    es:'Gestionar Equipo' },
  team_recent_matches:  { ko:'최근 매치',          en:'Recent Matches',  ja:'最近のマッチ',    zh:'最近比赛',     th:'แมตช์ล่าสุด',       pt:'Partidas Recentes', es:'Partidas Recientes' },
  team_records:         { ko:'전적',              en:'Record',          ja:'戦績',            zh:'战绩',         th:'ผลการแข่งขัน',      pt:'Histórico',         es:'Historial'        },
  team_total_scrims:    { ko:'총 스크림',          en:'Total Scrims',    ja:'総スクリム数',    zh:'总训练赛',     th:'สคริมทั้งหมด',      pt:'Total de Scrims',   es:'Total de Scrims'  },

  // ── Onboarding ──────────────────────────────────────────────────────
  onboard_title:        { ko:'프로필 설정',        en:'Profile Setup',   ja:'プロフィール設定', zh:'设置资料',     th:'ตั้งค่าโปรไฟล์',    pt:'Configurar Perfil', es:'Configurar Perfil' },
  onboard_riot_id:      { ko:'라이엇 ID',          en:'Riot ID',         ja:'ライアットID',    zh:'拳头ID',       th:'Riot ID',           pt:'ID Riot',           es:'ID de Riot'       },
  onboard_nickname:     { ko:'닉네임',             en:'Nickname',        ja:'ニックネーム',    zh:'昵称',         th:'ชื่อเล่น',          pt:'Apelido',           es:'Apodo'            },
  onboard_tier:         { ko:'현재 티어',           en:'Current Tier',    ja:'現在のティア',    zh:'当前段位',     th:'ระดับปัจจุบัน',     pt:'Nível Atual',       es:'Nivel Actual'     },
  onboard_saved:        { ko:'저장됨 ✓',           en:'Saved ✓',         ja:'保存済み ✓',      zh:'已保存 ✓',     th:'บันทึกแล้ว ✓',     pt:'Salvo ✓',           es:'Guardado ✓'       },
  onboard_saving:       { ko:'저장 중...',          en:'Saving...',       ja:'保存中...',       zh:'保存中...',    th:'กำลังบันทึก...',    pt:'Salvando...',       es:'Guardando...'     },
  onboard_save:         { ko:'저장',               en:'Save',            ja:'保存',            zh:'保存',         th:'บันทึก',            pt:'Salvar',            es:'Guardar'          },
  onboard_skip:         { ko:'건너뛰기',            en:'Skip',            ja:'スキップ',        zh:'跳过',         th:'ข้าม',              pt:'Pular',             es:'Omitir'           },
  onboard_later:        { ko:'나중에 하기',          en:'Do Later',        ja:'後でやる',        zh:'稍后设置',     th:'ทำทีหลัง',          pt:'Fazer Depois',      es:'Hacer Después'    },
  onboard_done_title:   { ko:'프로필 설정 완료!',   en:'Profile Setup Complete!', ja:'プロフィール設定完了！', zh:'资料设置完成！', th:'ตั้งค่าโปรไฟล์เสร็จแล้ว!', pt:'Perfil Configurado!', es:'¡Perfil Configurado!' },
  onboard_next_steps:   { ko:'다음 단계',           en:'Next Steps',      ja:'次のステップ',    zh:'下一步',       th:'ขั้นตอนถัดไป',      pt:'Próximos Passos',   es:'Próximos Pasos'   },
  onboard_create_team:  { ko:'새 팀 만들기',        en:'Create New Team', ja:'新しいチームを作成', zh:'创建新队伍',  th:'สร้างทีมใหม่',      pt:'Criar Novo Time',   es:'Crear Nuevo Equipo' },
  onboard_find_team:    { ko:'팀 찾아 가입하기',    en:'Find & Join Team', ja:'チームを探して参加する', zh:'查找并加入队伍', th:'หาทีมและเข้าร่วม', pt:'Encontrar e Entrar em um Time', es:'Buscar y Unirse a un Equipo' },
  onboard_go_dashboard: { ko:'나중에 → 대시보드로',  en:'Later → Dashboard', ja:'後で → ダッシュボード', zh:'稍后 → 仪表板', th:'ทีหลัง → แดชบอร์ด', pt:'Depois → Painel', es:'Después → Panel' },

  // ── Create Team ─────────────────────────────────────────────────────
  create_team_title:    { ko:'팀 만들기',           en:'Create Team',     ja:'チーム作成',      zh:'创建队伍',     th:'สร้างทีม',          pt:'Criar Time',        es:'Crear Equipo'     },
  create_team_desc:     { ko:'팀을 만들고 스크림을 시작하세요', en:'Create a team and start scrims', ja:'チームを作ってスクリムを始めよう', zh:'创建队伍并开始训练赛', th:'สร้างทีมและเริ่มสคริม', pt:'Crie um time e comece a jogar scrims', es:'Crea un equipo y empieza a hacer scrims' },
  create_team_name:     { ko:'팀 이름',             en:'Team Name',       ja:'チーム名',        zh:'队伍名称',     th:'ชื่อทีม',           pt:'Nome do Time',      es:'Nombre del Equipo' },
  create_team_abbr:     { ko:'팀 약자',             en:'Abbreviation',    ja:'チーム略称',      zh:'队伍缩写',     th:'ตัวย่อทีม',         pt:'Abreviação',        es:'Abreviatura'      },
  create_team_game:     { ko:'게임',                en:'Game',            ja:'ゲーム',          zh:'游戏',         th:'เกม',               pt:'Jogo',              es:'Juego'            },
  create_team_submit:   { ko:'팀 만들기',           en:'Create Team',     ja:'チーム作成',      zh:'创建队伍',     th:'สร้างทีม',          pt:'Criar Time',        es:'Crear Equipo'     },
  create_team_loading:  { ko:'만드는 중...',         en:'Creating...',     ja:'作成中...',       zh:'创建中...',    th:'กำลังสร้าง...',     pt:'Criando...',        es:'Creando...'       },

  // ── Post Scrim ──────────────────────────────────────────────────────
  post_scrim_title:     { ko:'스크림 올리기',        en:'Post Scrim',      ja:'スクリム掲載',    zh:'发布训练赛',   th:'โพสต์สคริม',        pt:'Publicar Scrim',    es:'Publicar Scrim'   },
  post_scrim_desc:      { ko:'상대 팀을 모집하세요',  en:'Find your opponent', ja:'相手チームを募集しよう', zh:'招募对手队伍', th:'หาทีมคู่แข่ง',    pt:'Encontre seu adversário', es:'Encuentra a tu adversario' },
  post_scrim_date:      { ko:'희망 날짜',            en:'Preferred Date',  ja:'希望日',          zh:'希望日期',     th:'วันที่ต้องการ',      pt:'Data Preferida',    es:'Fecha Preferida'  },
  post_scrim_time:      { ko:'희망 시간',            en:'Preferred Time',  ja:'希望時間',        zh:'希望时间',     th:'เวลาที่ต้องการ',    pt:'Horário Preferido', es:'Hora Preferida'   },
  post_scrim_format:    { ko:'매치 포맷',            en:'Match Format',    ja:'マッチフォーマット', zh:'比赛赛制',   th:'รูปแบบแมตช์',       pt:'Formato da Partida', es:'Formato del Partido' },
  post_scrim_server:    { ko:'서버',                en:'Server',          ja:'サーバー',        zh:'服务器',       th:'เซิร์ฟเวอร์',       pt:'Servidor',          es:'Servidor'         },
  post_scrim_submit:    { ko:'스크림 올리기',         en:'Post Scrim',      ja:'スクリム掲載',    zh:'发布训练赛',   th:'โพสต์สคริม',        pt:'Publicar Scrim',    es:'Publicar Scrim'   },
  post_scrim_loading:   { ko:'올리는 중...',          en:'Posting...',      ja:'掲載中...',       zh:'发布中...',    th:'กำลังโพสต์...',     pt:'Publicando...',     es:'Publicando...'    },

  // ── Leaderboard ─────────────────────────────────────────────────────
  lb_title:             { ko:'D31 랭킹',            en:'D31 Rankings',    ja:'D31ランキング',   zh:'D31排行榜',    th:'D31 อันดับ',         pt:'Ranking D31',       es:'Clasificación D31' },
  lb_team_rank:         { ko:'팀 랭킹',             en:'Team Rankings',   ja:'チームランキング', zh:'队伍排名',     th:'อันดับทีม',         pt:'Ranking de Times',  es:'Clasificación de Equipos' },
  lb_player_rank:       { ko:'플레이어 랭킹',        en:'Player Rankings', ja:'プレイヤーランキング', zh:'玩家排名', th:'อันดับผู้เล่น',      pt:'Ranking de Jogadores', es:'Clasificación de Jugadores' },
  lb_no_teams:          { ko:'아직 매치 기록이 있는 팀이 없어요', en:'No teams with match records yet', ja:'まだマッチ記録のあるチームがありません', zh:'暂无有比赛记录的队伍', th:'ยังไม่มีทีมที่มีบันทึกแมตช์', pt:'Nenhum time com registros de partidas ainda', es:'Sin equipos con registros de partidas aún' },
  lb_no_players:        { ko:'아직 등록된 플레이어가 없어요', en:'No players registered yet', ja:'まだ登録されたプレイヤーがいません', zh:'暂无注册玩家', th:'ยังไม่มีผู้เล่นที่ลงทะเบียน', pt:'Nenhum jogador registrado ainda', es:'Sin jugadores registrados aún' },
  lb_col_team:          { ko:'팀',                  en:'Team',            ja:'チーム',          zh:'队伍',         th:'ทีม',               pt:'Time',              es:'Equipo'           },
  lb_col_tier:          { ko:'티어',                en:'Tier',            ja:'ティア',          zh:'段位',         th:'ระดับ',             pt:'Nível',             es:'Nivel'            },
  lb_col_record:        { ko:'전적',                en:'Record',          ja:'戦績',            zh:'战绩',         th:'ผลงาน',             pt:'Histórico',         es:'Historial'        },
  lb_col_winrate:       { ko:'승률',                en:'Win Rate',        ja:'勝率',            zh:'胜率',         th:'อัตราชนะ',          pt:'Taxa de Vitória',   es:'Tasa de Victorias' },
  lb_col_player:        { ko:'플레이어',             en:'Player',          ja:'プレイヤー',      zh:'玩家',         th:'ผู้เล่น',            pt:'Jogador',           es:'Jugador'          },

  // ── Recruit ─────────────────────────────────────────────────────────
  recruit_title:        { ko:'모집 게시판',          en:'Recruit Board',   ja:'募集掲示板',      zh:'招募看板',     th:'บอร์ดรับสมัคร',     pt:'Quadro de Recrutamento', es:'Tablero de Reclutamiento' },
  recruit_desc:         { ko:'팀을 찾거나 선수를 모집하세요', en:'Find a team or recruit players', ja:'チームを探すか選手を募集しよう', zh:'寻找队伍或招募选手', th:'หาทีมหรือรับสมัครผู้เล่น', pt:'Encontre um time ou recrute jogadores', es:'Encuentra un equipo o recluta jugadores' },
  recruit_post:         { ko:'+ 글 올리기',          en:'+ Post',          ja:'+ 投稿する',      zh:'+ 发帖',       th:'+ โพสต์',            pt:'+ Publicar',        es:'+ Publicar'       },

  // ── Profile Page ────────────────────────────────────────────────────
  profile_manner:       { ko:'매너 점수',            en:'Manner Score',    ja:'マナースコア',    zh:'礼仪分',       th:'คะแนนมารยาท',       pt:'Pontuação de Conduta', es:'Puntuación de Conducta' },
  profile_team:         { ko:'소속 팀',              en:'Team',            ja:'所属チーム',      zh:'所属队伍',     th:'ทีมที่สังกัด',      pt:'Time',              es:'Equipo'           },
  profile_no_team:      { ko:'소속 팀 없음',          en:'No team',         ja:'所属チームなし',  zh:'暂无队伍',     th:'ไม่มีทีม',          pt:'Sem time',          es:'Sin equipo'       },
  profile_scrim_record: { ko:'스크림 전적',           en:'Scrim Record',    ja:'スクリム戦績',    zh:'训练赛战绩',   th:'ผลการแข่งขันสคริม', pt:'Histórico de Scrims', es:'Historial de Scrims' },
  profile_recent_scrims:{ ko:'최근 스크림',           en:'Recent Scrims',   ja:'最近のスクリム',  zh:'最近训练赛',   th:'สคริมล่าสุด',       pt:'Scrims Recentes',   es:'Scrims Recientes' },
  profile_no_scrims:    { ko:'아직 스크림 기록이 없어요', en:'No scrim records yet', ja:'まだスクリム記録がありません', zh:'暂无训练赛记录', th:'ยังไม่มีบันทึกสคริม', pt:'Sem registros de scrims ainda', es:'Sin registros de scrims aún' },
  profile_delete_acct:  { ko:'회원탈퇴',             en:'Delete Account',  ja:'アカウント削除',  zh:'注销账户',     th:'ลบบัญชี',           pt:'Excluir Conta',     es:'Eliminar Cuenta'  },

  // ── Shared ──────────────────────────────────────────────────────────
  back:                 { ko:'← 뒤로',              en:'← Back',          ja:'← 戻る',          zh:'← 返回',       th:'← กลับ',             pt:'← Voltar',          es:'← Volver'         },
  loading:              { ko:'로딩 중...',            en:'Loading...',      ja:'読み込み中...',   zh:'加载中...',    th:'กำลังโหลด...',      pt:'Carregando...',     es:'Cargando...'      },
  error:                { ko:'오류가 발생했어요.',    en:'An error occurred.', ja:'エラーが発生しました。', zh:'发生错误。', th:'เกิดข้อผิดพลาด',   pt:'Ocorreu um erro.',  es:'Ocurrió un error.' },
  save:                 { ko:'저장',                 en:'Save',            ja:'保存',            zh:'保存',         th:'บันทึก',            pt:'Salvar',            es:'Guardar'          },
  cancel:               { ko:'취소',                 en:'Cancel',          ja:'キャンセル',      zh:'取消',         th:'ยกเลิก',            pt:'Cancelar',          es:'Cancelar'         },
  confirm:              { ko:'확인',                 en:'Confirm',         ja:'確認',            zh:'确认',         th:'ยืนยัน',            pt:'Confirmar',         es:'Confirmar'        },
  submit:               { ko:'제출',                 en:'Submit',          ja:'送信',            zh:'提交',         th:'ส่ง',               pt:'Enviar',            es:'Enviar'           },
  win:                  { ko:'승',                   en:'W',               ja:'勝',              zh:'胜',           th:'ชนะ',               pt:'V',                 es:'V'                },
  loss:                 { ko:'패',                   en:'L',               ja:'負',              zh:'负',           th:'แพ้',               pt:'D',                 es:'D'                },
  tbd:                  { ko:'미정',                 en:'TBD',             ja:'未定',            zh:'待定',         th:'ยังไม่กำหนด',       pt:'A definir',         es:'Por definir'      },
  view_all:             { ko:'전체 보기 →',           en:'View All →',      ja:'すべて見る →',    zh:'查看全部 →',   th:'ดูทั้งหมด →',       pt:'Ver Todos →',       es:'Ver Todo →'       },
  no_data:              { ko:'데이터가 없어요',        en:'No data',         ja:'データなし',      zh:'暂无数据',     th:'ไม่มีข้อมูล',       pt:'Sem dados',         es:'Sin datos'        },
} as const

export type TranslationKey = keyof typeof translations

export function t(key: TranslationKey, lang: Lang): string {
  const entry = translations[key]
  if (!entry) return key
  return (entry as Record<string, string>)[lang] ?? (entry as Record<string, string>)['ko'] ?? key
}
