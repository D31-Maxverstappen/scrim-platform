// 요원 스킬(어빌리티) 아이콘 — 자동생성. 출처: Riot 공식 VALORANT 자산(Public Content Catalog).
// agentSlug → 스킬 목록(기본기2·시그니처·궁극기). public/abilities/ 에 보관.

export type Ability = { name: string; icon: string }

export const ABILITIES: Record<string, Ability[]> = {
  "gekko": [
    {
      "name": "지원봇",
      "icon": "/abilities/gekko-0.png"
    },
    {
      "name": "기절봇",
      "icon": "/abilities/gekko-1.png"
    },
    {
      "name": "폭파봇 지옥",
      "icon": "/abilities/gekko-2.png"
    },
    {
      "name": "요동봇",
      "icon": "/abilities/gekko-3.png"
    }
  ],
  "fade": [
    {
      "name": "포박",
      "icon": "/abilities/fade-0.png"
    },
    {
      "name": "귀체",
      "icon": "/abilities/fade-1.png"
    },
    {
      "name": "추적귀",
      "icon": "/abilities/fade-2.png"
    },
    {
      "name": "황혼",
      "icon": "/abilities/fade-3.png"
    }
  ],
  "breach": [
    {
      "name": "섬광 폭발",
      "icon": "/abilities/breach-0.png"
    },
    {
      "name": "균열",
      "icon": "/abilities/breach-1.png"
    },
    {
      "name": "여진",
      "icon": "/abilities/breach-2.png"
    },
    {
      "name": "지진 강타",
      "icon": "/abilities/breach-3.png"
    }
  ],
  "deadlock": [
    {
      "name": "음향 센서",
      "icon": "/abilities/deadlock-0.png"
    },
    {
      "name": "장벽망",
      "icon": "/abilities/deadlock-2.png"
    },
    {
      "name": "중력그물",
      "icon": "/abilities/deadlock-1.png"
    },
    {
      "name": "소멸",
      "icon": "/abilities/deadlock-3.png"
    }
  ],
  "raze": [
    {
      "name": "폭발 팩",
      "icon": "/abilities/raze-0.png"
    },
    {
      "name": "페인트탄",
      "icon": "/abilities/raze-1.png"
    },
    {
      "name": "폭발 봇",
      "icon": "/abilities/raze-2.png"
    },
    {
      "name": "대미 장식",
      "icon": "/abilities/raze-3.png"
    }
  ],
  "chamber": [
    {
      "name": "랑데부",
      "icon": "/abilities/chamber-1.png"
    },
    {
      "name": "트레이드마크",
      "icon": "/abilities/chamber-2.png"
    },
    {
      "name": "헤드헌터",
      "icon": "/abilities/chamber-0.png"
    },
    {
      "name": "역작",
      "icon": "/abilities/chamber-3.png"
    }
  ],
  "skye": [
    {
      "name": "정찰자",
      "icon": "/abilities/skye-0.png"
    },
    {
      "name": "인도하는 빛",
      "icon": "/abilities/skye-1.png"
    },
    {
      "name": "재생",
      "icon": "/abilities/skye-2.png"
    },
    {
      "name": "추적자",
      "icon": "/abilities/skye-3.png"
    }
  ],
  "sova": [
    {
      "name": "충격 화살",
      "icon": "/abilities/sova-0.png"
    },
    {
      "name": "정찰용 화살",
      "icon": "/abilities/sova-1.png"
    },
    {
      "name": "올빼미 드론",
      "icon": "/abilities/sova-2.png"
    },
    {
      "name": "사냥꾼의 분노",
      "icon": "/abilities/sova-3.png"
    }
  ],
  "killjoy": [
    {
      "name": "나노스웜",
      "icon": "/abilities/killjoy-2.png"
    },
    {
      "name": "알람봇",
      "icon": "/abilities/killjoy-0.png"
    },
    {
      "name": "포탑",
      "icon": "/abilities/killjoy-1.png"
    },
    {
      "name": "봉쇄",
      "icon": "/abilities/killjoy-3.png"
    }
  ],
  "harbor": [
    {
      "name": "만조",
      "icon": "/abilities/harbor-0.png"
    },
    {
      "name": "폭풍 쇄도",
      "icon": "/abilities/harbor-2.png"
    },
    {
      "name": "해만",
      "icon": "/abilities/harbor-1.png"
    },
    {
      "name": "심판",
      "icon": "/abilities/harbor-3.png"
    }
  ],
  "viper": [
    {
      "name": "독성 연기",
      "icon": "/abilities/viper-0.png"
    },
    {
      "name": "독성 장막",
      "icon": "/abilities/viper-1.png"
    },
    {
      "name": "뱀 이빨",
      "icon": "/abilities/viper-2.png"
    },
    {
      "name": "독사의 구덩이",
      "icon": "/abilities/viper-3.png"
    }
  ],
  "astra": [
    {
      "name": "신성 파동",
      "icon": "/abilities/astra-0.png"
    },
    {
      "name": "성운 / 소멸",
      "icon": "/abilities/astra-1.png"
    },
    {
      "name": "중력의 샘",
      "icon": "/abilities/astra-2.png"
    },
    {
      "name": "천상계 형상 / 우주 장벽",
      "icon": "/abilities/astra-3.png"
    }
  ],
  "iso": [
    {
      "name": "약화",
      "icon": "/abilities/iso-0.png"
    },
    {
      "name": "청부 계약",
      "icon": "/abilities/iso-3.png"
    },
    {
      "name": "구슬 보호막",
      "icon": "/abilities/iso-1.png"
    },
    {
      "name": "대비책",
      "icon": "/abilities/iso-2.png"
    }
  ],
  "clove": [
    {
      "name": "활력 회복",
      "icon": "/abilities/clove-2.png"
    },
    {
      "name": "계략",
      "icon": "/abilities/clove-1.png"
    },
    {
      "name": "아직 안 죽었어",
      "icon": "/abilities/clove-3.png"
    },
    {
      "name": "간섭",
      "icon": "/abilities/clove-0.png"
    }
  ],
  "neon": [
    {
      "name": "고속 기어",
      "icon": "/abilities/neon-1.png"
    },
    {
      "name": "릴레이 볼트",
      "icon": "/abilities/neon-0.png"
    },
    {
      "name": "추월 차선",
      "icon": "/abilities/neon-2.png"
    },
    {
      "name": "오버드라이브",
      "icon": "/abilities/neon-3.png"
    }
  ],
  "yoru": [
    {
      "name": "기만",
      "icon": "/abilities/yoru-2.png"
    },
    {
      "name": "기습",
      "icon": "/abilities/yoru-0.png"
    },
    {
      "name": "관문 충돌",
      "icon": "/abilities/yoru-1.png"
    },
    {
      "name": "차원 표류",
      "icon": "/abilities/yoru-3.png"
    }
  ],
  "sage": [
    {
      "name": "둔화 구슬",
      "icon": "/abilities/sage-0.png"
    },
    {
      "name": "회복 구슬",
      "icon": "/abilities/sage-1.png"
    },
    {
      "name": "장벽 구슬",
      "icon": "/abilities/sage-2.png"
    },
    {
      "name": "부활",
      "icon": "/abilities/sage-3.png"
    }
  ],
  "reyna": [
    {
      "name": "포식",
      "icon": "/abilities/reyna-0.png"
    },
    {
      "name": "무시",
      "icon": "/abilities/reyna-1.png"
    },
    {
      "name": "눈총",
      "icon": "/abilities/reyna-2.png"
    },
    {
      "name": "여제",
      "icon": "/abilities/reyna-3.png"
    }
  ],
  "omen": [
    {
      "name": "피해망상",
      "icon": "/abilities/omen-0.png"
    },
    {
      "name": "어둠의 장막",
      "icon": "/abilities/omen-1.png"
    },
    {
      "name": "어둠의 발자국",
      "icon": "/abilities/omen-2.png"
    },
    {
      "name": "그림자 습격",
      "icon": "/abilities/omen-3.png"
    }
  ],
  "jett": [
    {
      "name": "상승 기류",
      "icon": "/abilities/jett-0.png"
    },
    {
      "name": "순풍",
      "icon": "/abilities/jett-1.png"
    },
    {
      "name": "연막 폭발",
      "icon": "/abilities/jett-2.png"
    },
    {
      "name": "칼날 폭풍",
      "icon": "/abilities/jett-3.png"
    }
  ]
}
