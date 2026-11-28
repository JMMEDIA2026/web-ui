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

// ── 공공데이터포털 '현지 생활정보'(라오스, 2024년 자료)를 일반 거주자·여행자 눈높이로 다시 정리한 가이드 ──
// 원문은 파견 봉사단원 대상 글이라, 단원 전용 내용은 빼고 누구에게나 쓸모 있는 내용만 내 말로 옮겼습니다.
const PUBLIC_DATA = { label: '공공데이터포털 "현지 생활정보" (라오스, 2024년 자료를 정리)', url: 'https://www.data.go.kr' }
const CHECKED_PUBLIC = '2026-11-27'

const publicGuides: Guide[] = [
  {
    slug: 'packing',
    icon: 'i-lucide-luggage',
    title: '출국 전 짐싸기',
    summary: '라오스에서 구하기 어렵거나 비싼 물건, 안 가져와도 되는 물건을 정리합니다.',
    emoji: '/emoji/packing.png',
    tone: 'sky',
    cover: '/images/guides/packing.jpg',
    keyPoints: [
      '평소 먹는 약, 안경·렌즈, 쓰던 화장품은 꼭 챙기세요',
      '한국산 전자제품과 화장품은 라오스에서 더 비싸요',
      '12~2월은 쌀쌀하고 우기는 습해서 옷과 신발도 신경 쓰세요'
    ],
    sections: [
      {
        emoji: '🧳',
        title: '꼭 챙길 것',
        items: [
          '노트북과 외장하드: 일이나 서류 처리가 많다면 필수예요.',
          '먹는 약과 처방약, 비타민: 약국은 있지만 한국 제약사 제품은 거의 없어요. 성분을 알면 같은 성분의 태국·프랑스 약을 구할 수 있지만 수도 중심이에요. 자료에는 처방약을 6개월 치까지 가져올 수 있다고 안내돼요.',
          '안경과 렌즈: 안경점은 있지만 품질에 비해 값이 비싸요. 난시 렌즈는 태국에서 주문 제작해 일주일 넘게 걸려요. 여분 안경 1~2개, 렌즈는 일회용을 넉넉히 챙기세요. 공기가 좋지 않아 렌즈보다 안경이 낫다는 조언도 있어요.',
          '밥솥: 라오스 쌀은 길쭉한 장립종이라 한국식 밥맛을 내려면 한국 압력밥솥이 좋아요. 집에 밥솥이 있어도 보온·취사만 되는 경우가 많고 잘 눌어붙어요.',
          '선크림·선글라스·화장품: 관세 때문에 한국보다 비싸요. 헤어 에센스는 현지에서 구하기 어려워요.'
        ]
      },
      {
        emoji: '🌦️',
        title: '옷과 신발',
        items: [
          '우기가 길고 비가 많아서 물에 젖어도 괜찮은 샌들과 편한 운동화 한 켤레가 있으면 좋아요.',
          '12월~2월에는 전국 최저기온이 15℃ 아래로 내려가는 날이 있어요. 난방이 없는 집이 많아 실내도 춥게 느껴지니 긴소매, 바람막이, 두꺼운 겉옷, 수면 양말을 챙기세요. 북부는 경량 패딩이 필요해요.',
          '현지 행사나 모임에는 라오스 전통 의상을 입으면 좋아한다고 해요. 단정한 가방과 구두를 하나쯤 챙기면 어울려요.'
        ]
      },
      {
        emoji: '🏠',
        title: '있으면 편한 것',
        items: [
          '믹서기, 에어프라이어: 현지에서도 팔지만 값이 많이 비싸요.',
          '방충망 스티커와 문틈막이: 창에 방충망이 없거나 찢어진 집이 많고, 문틈으로 벌레와 먼지가 들어와요.',
          '샤워기 연수 헤드: 물에 석회질이 많아 피부나 머릿결이 민감하다면 도움이 돼요.',
          '스테인리스 텀블러, 양우산: 더운 날씨에 얼음이 오래 가는 텀블러를 현지에서 구하기 어려워요. 아침엔 비, 낮엔 햇볕인 날이 많아 양우산이 편해요. 우비는 현지 시장에서 싸게 살 수 있어요.',
          '운동화·축구화, 스포츠 테이프, 탐폰: 현지에서 구하기 어렵거나 정품인지 알기 어려워요. 평소 쓰던 것을 챙기세요.'
        ]
      },
      {
        emoji: '🙅',
        title: '안 가져와도 되는 것',
        items: [
          '두통약·감기약 같은 일반 의약품은 현지 약국에서 충분히 살 수 있어요. 꼭 먹는 약만 챙기세요.',
          '드라이클리닝이 필요한 옷: 세탁소가 드물어 관리가 어려워요.',
          '가죽 가방과 가죽 제품: 우기가 약 5개월 이어져 습도가 높아 곰팡이가 피기 쉬워요.'
        ]
      }
    ],
    warning: '약은 나라마다 반입 규정이 달라요. 처방약은 처방 내용을 함께 챙기고, 출국 전에 항공사와 입국 규정을 확인하세요.',
    sources: [PUBLIC_DATA],
    checkedOn: CHECKED_PUBLIC
  },
  {
    slug: 'post',
    icon: 'i-lucide-mailbox',
    title: '우체국·EMS',
    summary: '한국과 우편·EMS를 주고받는 방법, 지방에서 물건 받는 방법을 정리합니다.',
    emoji: '/emoji/post.png',
    tone: 'mint',
    cover: '/images/guides/post.jpg',
    keyPoints: [
      '우체국에서 엽서·편지·등기·EMS를 해외로 보낼 수 있어요',
      '한국에서 라오스로 EMS는 보통 3~4일 걸려요',
      '집까지 배달하는 우체부가 없어서, 우체국에서 전화가 오면 찾으러 가야 해요'
    ],
    sections: [
      {
        emoji: '📮',
        title: '우체국에서 할 수 있는 일',
        items: [
          '엽서, 편지, 등기, EMS를 외국으로 보낼 수 있어요.',
          '각종 세금 납부도 우체국에서 할 수 있어요.'
        ]
      },
      {
        emoji: '📦',
        title: '한국에서 온 EMS 받기',
        items: [
          '한국에서 보내면 약 3~4일 만에 도착한다고 해요.',
          '라오스에는 집 앞까지 배달하는 우체부가 없어요. 물건이 지역 우체국에 도착하면 받는 사람 전화번호로 연락이 와서 직접 찾으러 가야 해요.',
          '받는 사람 이름과 전화번호를 정확히 적으세요. 보낸 지 3~7일쯤엔 모르는 번호로 전화가 올 수 있으니 당황하지 말고 받으세요.',
          '찾을 때는 여권이나 신분증이 필요하고, 크기에 따라 정해진 수수료를 내요.'
        ]
      },
      {
        emoji: '🚌',
        title: '지방에서 물건 받는 다른 방법',
        items: [
          '공항 화물 서비스: 우체국 EMS보다 싸게 받을 수 있지만 공항까지 직접 가서 찾아야 해요. 거리, 교통비, 물건 무게를 따져 보세요.',
          '버스 배송: 비엔티안 버스터미널에서 받는 사람 이름·전화번호·주소를 적어 해당 지역 버스 기사님께 맡기고, 도착 시간에 그 지역 터미널에서 찾아요. 비포장도로가 많아 먼 지역은 물건이 깨질 수 있어요. 방비엥은 당일 발송·수령이 가능해 많이 쓴다고 해요.',
          '택배 회사: 라오스에는 여러 택배 회사가 있어요. 냉동 상품은 받아 주는 곳이 한 곳뿐이라는 안내가 있고, 비엔티안~루앙프라방 냉동 택배는 55,000킵이었어요(2024년 2월 기준).',
          '한인 마트 중에는 메신저로 주문하면 지방까지 택배로 보내 주는 곳도 있어요.'
        ]
      }
    ],
    warning: '우편·택배 요금과 수령 수수료는 크기, 무게, 시기에 따라 달라요. 보내기 전에 우체국이나 택배 회사에 요금을 먼저 물어보세요.',
    sources: [PUBLIC_DATA],
    checkedOn: CHECKED_PUBLIC
  },
  {
    slug: 'prices',
    icon: 'i-lucide-receipt',
    title: '물가·생활비',
    summary: '식비와 생필품 물가, 환율 흐름, 한국에서 가져오면 좋은 물건을 정리합니다.',
    emoji: '/emoji/prices.png',
    tone: 'peach',
    cover: '/images/guides/prices.jpg',
    keyPoints: [
      '쌀국수·볶음밥은 보통 2만~3만 킵이고 2천 원이 채 안 돼요',
      '쌀·채소·과일은 싸고, 수입 공산품은 비싸요',
      '낍 가치가 크게 떨어져서 달러·바트·위안을 선호해요'
    ],
    sections: [
      {
        emoji: '🍜',
        title: '식비',
        items: [
          '가장 흔한 볶음밥이나 쌀국수는 20,000~30,000킵 정도예요(2024년 자료). 방비엥·루앙프라방 같은 관광지에서는 45,000킵까지 받는 곳도 있어요.',
          '쌀은 1kg에 약 22,000킵, 찹쌀은 약 17,000킵이에요(같은 자료).',
          '곡식, 채소, 과일 같은 농수산물은 한국보다 훨씬 싸요. 직접 해 먹으면 샤브샤브 한 끼를 7천 원 아래로 푸짐하게 먹을 수 있다고 해요.'
        ]
      },
      {
        emoji: '💱',
        title: '환율과 물가 흐름',
        items: [
          '2024년 자료에서는 코로나 이후 경제 성장은 2%대인데 물가는 23% 가까이 올랐다고 해요.',
          '2024년 4월 기준으로 1달러가 약 21,403킵(BCEL)이고, 10,000킵이 한화로 550원쯤이에요. 2019년에는 10,000킵이 1,300원쯤이었어요.',
          '1997년 외환위기 때 낍 가치가 크게 떨어진 경험 때문에 현지인들은 낍보다 달러, 태국 바트, 중국 위안을 선호해요. 비엔티안과 루앙프라방의 일부 가게는 달러를 환전 없이 받아요.',
          '정부가 외화의 시장 유통을 막는 캠페인과 사설 환전소 이용 제한을 계속하고 있어요. 환전은 은행이나 허가된 곳에서 하세요.'
        ]
      },
      {
        emoji: '🛒',
        title: '공산품과 생필품',
        items: [
          '"딱딱한 물건은 전부 수입한다"는 말이 있을 만큼 대부분의 공산품을 들여와요. 수입 관세가 붙어 가격 대비 성능이 좋지 않아요.',
          '에어프라이어, 밥솥, 화장품 같은 물건은 한국에서 가져오는 쪽이 이득이에요. 자세한 목록은 "출국 전 짐싸기" 가이드를 보세요.'
        ]
      }
    ],
    warning: '가격과 환율은 시기와 장소에 따라 크게 달라요. 여기 적은 금액은 2024년 자료 기준 참고용이에요. 오늘 환율은 라자의 환율 화면에서 확인하세요.',
    sources: [PUBLIC_DATA],
    checkedOn: CHECKED_PUBLIC
  },
  {
    slug: 'festivals',
    icon: 'i-lucide-party-popper',
    title: '축제·명절',
    summary: '라오스의 큰 명절과 축제를 시기와 함께 소개합니다.',
    emoji: '/emoji/festival.png',
    tone: 'pink',
    cover: '/images/guides/festival.jpg',
    keyPoints: [
      '가장 큰 명절은 4월 중순 새해 "삐마이"(물 뿌리기 축제)예요',
      '대부분 라오스 음력과 불교 달력을 따라 해마다 날짜가 달라요',
      '큰 명절에는 문을 닫는 곳이 있을 수 있으니 미리 확인하세요'
    ],
    sections: [
      {
        emoji: '💦',
        title: '삐마이 (라오스 새해, 4월 중순)',
        items: [
          '전통적으로 절에서 공덕을 쌓고, 집을 청소하고, 불상과 어른, 스님께 물을 뿌려 한 해의 복을 빌어요.',
          '요즘은 사흘 동안 거리에서 물을 뿌리며 즐기는 축제로 유명해요. 새해 미녀 선발대회와 행렬도 열려요.',
          '루앙프라방이 전통과 현대 모습을 함께 보기 좋은 곳으로 소개돼요.'
        ]
      },
      {
        emoji: '🚀',
        title: '분파이 (로켓 축제)',
        items: [
          '모내기 전, 비를 부르려고 직접 만든 대나무 로켓을 하늘로 쏘아 올려요. 음악과 잔치가 함께해요.',
          '날짜는 농사 일정에 맞춰 지역마다 달라요.'
        ]
      },
      {
        emoji: '🕯️',
        title: '불교 안거와 물의 축제',
        items: [
          '카오판사: 7월쯤 석 달간의 불교 안거(우기 수행)가 시작돼요. 스님들은 한 절에 머물고, 사람들은 아침에 시주를 해요.',
          '억판사: 안거가 끝나는 날이에요. 저녁에 바나나 줄기에 꽃과 초를 꾸민 배를 강에 띄워요. 루앙프라방에서는 불 켠 배 행렬, 비엔티안에서는 보트 경주가 열려요.',
          '분카틴: 스님께 새 가사와 공양물을 올려요. 비엔티안 탓루앙에서 일주일 동안 큰 축제가 열려 전국에서 사람들이 모여요.'
        ]
      },
      {
        emoji: '🌾',
        title: '그 밖의 전통 명절',
        items: [
          '분콩카오: 추수가 끝난 뒤 쌀의 영혼에게 감사하는 축제로, 사야부리 피앙 지역의 커다란 볏단이 유명해요.',
          '분카오찌: 찰밥을 긴 막대에 구워 스님께 올려요.',
          '분파벳: 스님이 전생 이야기를 낭송하고 마을 사람들이 행렬을 지어 절로 가요. 절마다 날짜가 달라요.',
          '분살락과 분사랑: 돌아가신 가족의 공덕을 빌고, 마을을 지키는 영혼에게 한 해의 평안을 빌어요.',
          '분카오깜: 12월쯤 라오스 달력이 시작되는 때로, 스님들이 수행에 들어가요.'
        ]
      }
    ],
    warning: '축제 날짜는 라오스 음력과 불교 달력에 따라 해마다 바뀌어요. 이 가이드는 시기를 대략만 알려 드려요. 일정을 잡기 전에 현지 공지를 꼭 확인하세요.',
    sources: [
      { label: '라오스 문화관광부 관광홍보국: Twelve Annual Festival Highlights (2023-09-21)', url: 'https://www.tourismlaos.org/2023/09/21/twelve-annual-festival-highlights-that-showcase-the-rich-heritage-of-laos/' }
    ],
    checkedOn: CHECKED_PUBLIC
  }
]

guides.push(...publicGuides)
