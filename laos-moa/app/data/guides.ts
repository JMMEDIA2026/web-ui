import type { Tone } from './tones'

export interface GuideSection {
  emoji: string
  title: string
  items: string[]
}

export interface GuideContact {
  label: string
  value: string
  /** tel: 또는 mailto: 링크 */
  href: string
}

export interface GuideSource {
  label: string
  url: string
}

export interface Guide {
  slug: string
  title: string
  summary: string
  emoji: string
  tone: Tone
  /** 얇은 선 아이콘(Lucide) 이름 */
  icon: string
  /** 큰 대표 이미지 */
  cover: string
  /** 한눈에 보기: 가장 중요한 3가지 */
  keyPoints: string[]
  sections: GuideSection[]
  /** 꼭 알아 두세요 */
  warning: string
  contacts?: GuideContact[]
  /** 내용을 확인한 출처 */
  sources: GuideSource[]
  /** 내용을 마지막으로 확인한 날 (YYYY-MM-DD) */
  checkedOn: string
}

// 제도·요금·연락처는 바뀔 수 있어서, 공식 안내나 여러 출처에서 함께 확인된 내용만 적었습니다.
// 확인하지 못한 항목(금액, 절차의 세부 서류 등)은 숫자를 지어내지 않고 "확인하세요"로 남겼습니다.
const CHECKED = '2026-11-26'
const EMBASSY_HOME = { label: '주라오스 대한민국 대사관', url: 'https://overseas.mofa.go.kr/la-en/index.do' }

export const guides: Guide[] = [
  {
    slug: 'visa',
    icon: 'i-lucide-id-card',
    title: '비자·거주증',
    summary: '비자 종류와 신청 순서, 필요 서류를 정리합니다.',
    emoji: '/emoji/visa.png',
    tone: 'sky',
    cover: '/images/guides/visa.jpg',
    keyPoints: [
      '한국 여권은 관광 목적이면 30일까지 비자 없이 머물 수 있어요',
      '여권 유효기간이 6개월 이상 남아 있어야 해요',
      '일하거나 사업을 하려면 관광과 다른 비자가 따로 필요해요'
    ],
    sections: [
      {
        emoji: '🛬',
        title: '입국할 때',
        items: [
          '입국 심사에서 여권에 찍어 주는 체류 기한 도장을 꼭 확인하세요. 그 날짜가 머물 수 있는 마지막 날이에요.',
          '여권 유효기간은 입국일부터 최소 6개월 이상 남아 있어야 해요.',
          '2026년에 디지털 입국 신고서(LDIF) 도입이 진행되고 있다는 안내가 있어요. 출발 전에 대사관 공지에서 필요한지 확인해 보세요.'
        ]
      },
      {
        emoji: '⏳',
        title: '더 머물고 싶다면',
        items: [
          '관광으로 입국한 사람은 비엔티안 등 주요 도시의 이민청에서 체류 연장을 신청할 수 있다는 안내가 많아요.',
          '연장 수수료와 가능한 기간은 출처마다 달라서 금액은 적지 않았어요. 이민청이나 대사관에서 직접 확인해 주세요.',
          '체류 기한을 넘기면 출국할 때 벌금을 내야 해요. 기한 3일 전에는 연장을 알아보세요.'
        ]
      },
      {
        emoji: '💼',
        title: '일하거나 오래 살 때',
        items: [
          '취업·사업 목적이면 관광 입국과 달리 목적에 맞는 비자와 거주 허가가 필요해요.',
          '필요 서류와 절차는 회사(고용주)와 대사관 안내를 따라야 해요. 라자에는 확인된 내용만 올릴게요.'
        ]
      }
    ],
    warning: '비자 제도는 바뀔 수 있어요. 출국 전에 주라오스 대한민국 대사관 공지를 꼭 확인하세요.',
    contacts: [
      { label: '대사관 영사과', value: '+856-21-255-770', href: 'tel:+85621255770' },
      { label: '영사콜센터 (24시간)', value: '+82-2-3210-0404', href: 'tel:+82232100404' }
    ],
    sources: [
      EMBASSY_HOME,
      { label: '대사관 공지: 입국 관련', url: 'https://www.mofa.go.kr/la-ko/brd/m_27006/view.do?seq=1337683' }
    ],
    checkedOn: CHECKED
  },
  {
    slug: 'driving',
    icon: 'i-lucide-bike',
    title: '운전면허·오토바이',
    summary: '면허 전환과 차량·오토바이 등록 방법을 안내합니다.',
    emoji: '/emoji/scooter.png',
    tone: 'peach',
    cover: '/images/guides/driving.jpg',
    keyPoints: [
      '한국 운전면허증만으로는 라오스에서 운전할 수 없어요',
      '한국에서 발급받은 국제운전면허증이 필요해요',
      '오토바이는 국제면허에 A 확인 도장이 있어야 해요'
    ],
    sections: [
      {
        emoji: '🪪',
        title: '어떤 면허가 필요해요?',
        items: [
          '라오스는 한국 영문 운전면허증을 인정하지 않아요. 한국에서 국제운전면허증을 발급받아 오세요.',
          '국제면허는 한국 면허증과 함께 들고 다녀야 해요.',
          '번호판이 있는 오토바이(이륜차)는 A 확인 도장이 있어야 해요. B 도장은 승용차와 소형 화물차만 해당돼요.'
        ]
      },
      {
        emoji: '🛵',
        title: '오토바이를 빌릴 때',
        items: [
          '렌트숍이 면허를 확인하지 않는 경우도 있지만, 그게 합법이라는 뜻은 아니에요.',
          '사고가 나면 무면허 운전으로 처벌받고 보험금을 받지 못할 수 있어요.',
          '헬멧은 꼭 쓰고, 현지 교통 규칙을 지켜 주세요.'
        ]
      },
      {
        emoji: '📅',
        title: '오래 살 때',
        items: [
          '장기 체류 허가를 받은 뒤에는 외국 면허 사용 허가증을 받거나 라오스 면허를 따는 방법이 있어요.',
          '라오스 면허는 보통 필기와 실기 시험을 봐요.',
          '3개월 이상 머물 예정이면 현지 면허를 권하는 안내가 있어요. (민간 대행 업체 안내라서 대사관에서 한 번 더 확인하세요.)'
        ]
      }
    ],
    warning: '면허 종류가 맞지 않으면 보험금이 거절될 수 있어요. 빌리기 전에 국제면허의 A 도장부터 확인하세요.',
    contacts: [
      { label: '대사관 긴급전화', value: '+856-20-5839-0080', href: 'tel:+8562058390080' }
    ],
    sources: [
      { label: '대사관 공지: 운전면허 관련', url: 'https://www.mofa.go.kr/la-ko/brd/m_27006/view.do?seq=1337649' },
      { label: '국제운전면허 안내 (민간)', url: 'https://idaoffice.org/ko/countries/laos/' }
    ],
    checkedOn: CHECKED
  },
  {
    slug: 'telecom',
    icon: 'i-lucide-smartphone',
    title: '심카드·인터넷',
    summary: '통신사별 요금과 개통 방법을 비교합니다.',
    emoji: '/emoji/phone.png',
    tone: 'lilac',
    cover: '/images/guides/telecom.jpg',
    keyPoints: [
      '통신사는 Unitel, Lao Telecom, TPlus, ETL 네 곳이에요',
      '전국에서 잘 터지는 곳으로 Unitel을 꼽는 안내가 많아요',
      '심카드를 살 때 여권이 필요해요'
    ],
    sections: [
      {
        emoji: '📱',
        title: '통신사 고르기',
        items: [
          'Unitel: 전국 커버리지가 넓다는 평이 많아요. 도시 밖으로 다닌다면 먼저 고려해 보세요.',
          'Lao Telecom: 관광객용 심카드 상품이 따로 있어요.',
          'TPlus(예전 이름 Beeline): 요금이 저렴한 편이지만 시골에서는 잘 안 터질 수 있다는 평이 있어요.',
          'ETL: 네 번째 통신사예요.'
        ]
      },
      {
        emoji: '🛒',
        title: '어디서 사요?',
        items: [
          '공항 입국장 부스: 바로 개통해 주지만 시내보다 비싼 편이에요.',
          '시내 통신사 매장: 보통 더 저렴해요. 여권 원본을 가져가세요.',
          '출국 전 eSIM: Unitel 등에서 eSIM 상품을 팔아요. 도착하자마자 바로 쓸 수 있어요.'
        ]
      },
      {
        emoji: '💸',
        title: '요금',
        items: [
          '심카드 자체는 1~2만 킵대이고, 관광객용 패키지는 그보다 훨씬 비싸다는 안내가 있어요.',
          '출처마다 금액 차이가 커서 정확한 숫자는 적지 않았어요. 사기 전에 매장에서 가격표를 확인하세요.'
        ]
      }
    ],
    warning: '요금은 자주 바뀌어요. 이 내용은 여행 안내 글을 바탕으로 해서 공식 가격이 아니에요. 매장에서 한 번 더 확인하세요.',
    sources: [
      { label: '라오스 심카드 안내 (Expedia)', url: 'https://www.expedia.com.sg/stories/tips-inspiration/laos-sim-card' },
      { label: '라오스 심카드 가이드 (esim.net)', url: 'https://www.esim.net/sim-card-guides/laos-sim-card-guide' }
    ],
    checkedOn: CHECKED
  },
  {
    slug: 'health',
    icon: 'i-lucide-heart-pulse',
    title: '병원·응급',
    summary: '응급 연락처와 진료받는 방법을 안내합니다.',
    emoji: '/emoji/pill.png',
    tone: 'pink',
    cover: '/images/guides/health.jpg',
    keyPoints: [
      '경찰 191 · 소방 190 · 구급 195',
      '큰 병이나 사고는 태국 병원으로 가는 경우가 많아요',
      '여행자 보험은 출발 전에 꼭 가입하세요'
    ],
    sections: [
      {
        emoji: '🚨',
        title: '응급 연락처',
        items: [
          '경찰 191 · 소방 190 · 구급 195 (자료에 따라 1191·1190·1195로 적힌 곳도 있어요.)',
          '비엔티안 관광경찰 021 251 128',
          '비엔티안 구조대 1623. 구급대를 부를 때는 공식 표식이 있는 대원인지 확인하세요.',
          '번호가 연결되지 않으면 대사관 긴급전화 +856-20-5839-0080으로 연락하세요.'
        ]
      },
      {
        emoji: '🏥',
        title: '병원 이용',
        items: [
          '라오스는 지방 의료시설이 부족해요. 가벼운 증상이 아니면 태국 병원을 권하는 안내가 많아요.',
          '큰 사고나 병이 생기면 보험사에 바로 연락해서 이송과 치료 절차를 확인하세요.'
        ]
      },
      {
        emoji: '💊',
        title: '약과 보험',
        items: [
          '먹던 약은 한국에서 충분히 챙겨 오세요.',
          '해외 치료비와 긴급 이송비가 크니 의료비와 긴급 이송이 포함된 여행자 보험에 가입하세요.'
        ]
      }
    ],
    warning: '응급 번호는 자료마다 표기가 달라요. 큰 사고라면 대사관 긴급전화와 보험사 번호를 먼저 누르세요.',
    contacts: [
      { label: '대사관 긴급전화', value: '+856-20-5839-0080', href: 'tel:+8562058390080' },
      { label: '영사콜센터 (24시간)', value: '+82-2-3210-0404', href: 'tel:+82232100404' },
      { label: '비엔티안 관광경찰', value: '021 251 128', href: 'tel:021251128' }
    ],
    sources: [
      { label: '영국 외무부: 라오스 도움받기', url: 'https://gov.uk/foreign-travel-advice/laos/getting-help' },
      { label: '호주 대사관: 라오스 의료 안내', url: 'https://laos.embassy.gov.au/vtan/MD02.html' }
    ],
    checkedOn: CHECKED
  },
  {
    slug: 'embassy',
    icon: 'i-lucide-landmark',
    title: '대사관·영사 서비스',
    summary: '여권, 공증, 긴급 도움 요청 방법을 안내합니다.',
    emoji: '/emoji/embassy.png',
    tone: 'mint',
    cover: '/images/guides/embassy.jpg',
    keyPoints: [
      '대사관은 비엔티안 시사타낙 구 왓낙 마을에 있어요',
      '평일 오전 8시 30분부터 오후 5시까지 (점심시간 제외)',
      '긴급 상황은 24시간 영사콜센터가 도와요'
    ],
    sections: [
      {
        emoji: '📍',
        title: '위치와 시간',
        items: [
          '주소: Lao-Thai Friendship Road, Watnak Village, Sisattanak District, Vientiane (라오스국립대 공대 근처)',
          '대사관이 이전한 적이 있어요. 방문 전에 공식 페이지에서 주소를 한 번 더 확인하세요.',
          '업무시간은 평일 오전 8시 30분부터 오후 5시까지이고, 점심시간은 제외돼요.'
        ]
      },
      {
        emoji: '🧾',
        title: '도움받을 수 있는 일',
        items: [
          '여권 분실·재발급 같은 영사 업무',
          '공증과 영사확인',
          '재외국민 등록과 긴급 상황 연락',
          '필요한 서류와 수수료는 대사관 공지에서 확인하세요.'
        ]
      }
    ],
    warning: '긴급한 일이면 방문하기 전에 전화부터 하세요. 밤이나 휴일에는 긴급전화와 영사콜센터를 이용하세요.',
    contacts: [
      { label: '영사과', value: '+856-21-255-770', href: 'tel:+85621255770' },
      { label: '긴급전화', value: '+856-20-5839-0080', href: 'tel:+8562058390080' },
      { label: '영사콜센터 (24시간)', value: '+82-2-3210-0404', href: 'tel:+82232100404' },
      { label: '이메일', value: 'laos@mofa.go.kr', href: 'mailto:laos@mofa.go.kr' }
    ],
    sources: [
      EMBASSY_HOME,
      { label: '대사관 안내 페이지', url: 'https://overseas.mofa.go.kr/la-en/wpge/m_1890/contents.do' }
    ],
    checkedOn: CHECKED
  },
  {
    slug: 'banking',
    icon: 'i-lucide-banknote',
    title: '은행·환전·송금',
    summary: '계좌 개설과 환전, 한국 송금 방법을 정리합니다.',
    emoji: '/emoji/money.png',
    tone: 'sun',
    cover: '/images/guides/banking.jpg',
    keyPoints: [
      '환전은 은행 창구나 허가된 환전소에서만 하세요',
      '길거리 환전은 불법이라 문제가 생길 수 있어요',
      '환율은 BCEL 은행의 공식 고시로 확인할 수 있어요'
    ],
    sections: [
      {
        emoji: '💱',
        title: '환전',
        items: [
          '외화 환전은 공인 은행 창구에서만 허용된다는 안내가 있어요. 길거리 환전은 불법이에요.',
          '비엔티안 공항에는 여권으로 본인 확인을 하는 BCEL 자동 환전기가 있어요.',
          '원화를 바로 바꾸는 것보다 달러를 가져가 킵으로 바꾸는 쪽이 유리할 수 있다는 계산이 있어요. 하지만 날마다 고시 환율이 달라요. 라자 환율 화면과 BCEL 고시를 함께 비교해 보세요.'
        ]
      },
      {
        emoji: '🏦',
        title: '계좌와 송금',
        items: [
          '외국인 계좌 개설에 필요한 서류와 한국 송금 수수료는 아직 공식 자료로 확인하지 못했어요. 확인되면 올릴게요.',
          '라오스에는 예금자 보호 제도가 없다는 안내가 있어요. 큰돈을 오래 두기보다 필요한 만큼만 두세요.'
        ]
      }
    ],
    warning: '환율은 매일 달라요. 환전하기 전에 은행 고시 환율을 확인하세요.',
    sources: [
      { label: '호주 대사관: 라오스 은행과 통화', url: 'https://laos.embassy.gov.au/vtan/AEV0001001.html' },
      { label: '미국 상무부: 라오스 금융 안내', url: 'https://trade.gov/country-commercial-guides/laos-trade-financing' },
      { label: 'BCEL 환율 고시', url: 'https://www.bcel.com.la/bcel/exchange-rate.html?lang=en' }
    ],
    checkedOn: CHECKED
  }
]
