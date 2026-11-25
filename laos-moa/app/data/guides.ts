import type { Tone } from './tones'

export interface Guide {
  slug: string
  title: string
  summary: string
  emoji: string
  tone: Tone
  /** 가이드에 담을 항목. 실제 내용은 확인된 정보로 채웁니다. */
  topics: string[]
}

// 가이드 본문은 아직 작성 전입니다. 비자·면허·세금 같은 제도 정보는
// 관할 기관의 최신 안내를 확인한 내용만 게시하세요.
export const guides: Guide[] = [
  {
    slug: 'visa',
    title: '비자·거주증',
    summary: '비자 종류와 신청 순서, 필요 서류를 정리합니다.',
    emoji: '/emoji/visa.png', tone: 'sky',
    topics: ['비자 종류', '신청 순서', '필요 서류', '연장·갱신', '자주 묻는 질문']
  },
  {
    slug: 'driving',
    title: '운전면허·오토바이',
    summary: '면허 전환과 차량·오토바이 등록 방법을 안내합니다.',
    emoji: '/emoji/scooter.png', tone: 'peach',
    topics: ['면허 전환', '오토바이 등록', '보험', '교통 규칙']
  },
  {
    slug: 'telecom',
    title: '심카드·인터넷',
    summary: '통신사별 요금과 개통 방법을 비교합니다.',
    emoji: '/emoji/phone.png', tone: 'lilac',
    topics: ['통신사 비교', '심카드 개통', '집 인터넷', '충전 방법']
  },
  {
    slug: 'health',
    title: '병원·응급',
    summary: '응급 연락처와 진료받는 방법을 안내합니다.',
    emoji: '/emoji/hospital.png', tone: 'pink',
    topics: ['응급 연락처', '한국어 진료', '약국 이용', '여행자 보험']
  },
  {
    slug: 'embassy',
    title: '대사관·영사 서비스',
    summary: '여권, 공증, 긴급 도움 요청 방법을 안내합니다.',
    emoji: '/emoji/embassy.png', tone: 'mint',
    topics: ['여권 발급', '공증·영사확인', '긴급 상황 연락', '재외국민 등록']
  },
  {
    slug: 'banking',
    title: '은행·환전·송금',
    summary: '계좌 개설과 환전, 한국 송금 방법을 정리합니다.',
    emoji: '/emoji/money.png', tone: 'sun',
    topics: ['계좌 개설', '환전', '한국 송금', '수수료 비교']
  }
]
