export type CategoryKey = 'food' | 'mart' | 'hospital' | 'school' | 'rent' | 'job'

export interface Category {
  key: CategoryKey
  label: string
  description: string
  emoji: string
}

export interface Business {
  slug: string
  name: string
  category: CategoryKey
  area: string
  description: string
  hours: string
  contact: string
  sponsored?: boolean
  /** 실제 업체 정보로 교체되기 전까지 true. 화면에 "예시" 배지가 표시됩니다. */
  example: boolean
}

export const categories: Category[] = [
  { key: 'food', label: '한식당', description: '한식당·카페·배달', emoji: '/emoji/food.png' },
  { key: 'mart', label: '마트·환전', description: '한인 마트·환전소', emoji: '/emoji/mart.png' },
  { key: 'hospital', label: '병원·약국', description: '한국어 진료·약국', emoji: '/emoji/hospital.png' },
  { key: 'school', label: '학교·학원', description: '국제학교·학원', emoji: '/emoji/school.png' },
  { key: 'rent', label: '렌트·부동산', description: '주거·사무실 임대', emoji: '/emoji/house.png' },
  { key: 'job', label: '구인·구직', description: '일자리·인력', emoji: '/emoji/job.png' }
]

export const categoryMap = Object.fromEntries(categories.map(c => [c.key, c])) as Record<CategoryKey, Category>

// 아래 업체는 화면 구성을 위한 예시입니다. 실제 업체 정보로 교체하세요.
export const businesses: Business[] = [
  {
    slug: 'example-korean-restaurant',
    name: '예시 한식당 A',
    category: 'food',
    area: '비엔티안',
    description: '메뉴, 영업시간, 위치를 한눈에 보여주는 업체 카드 예시입니다.',
    hours: '영업시간 등록 예정',
    contact: '연락처 등록 예정',
    sponsored: true,
    example: true
  },
  {
    slug: 'example-korean-mart',
    name: '예시 한인 마트 B',
    category: 'mart',
    area: '비엔티안',
    description: '한국 식품과 생활용품 취급 여부, 환전 가능 여부를 표시하는 예시입니다.',
    hours: '영업시간 등록 예정',
    contact: '연락처 등록 예정',
    example: true
  },
  {
    slug: 'example-clinic',
    name: '예시 병원 C',
    category: 'hospital',
    area: '비엔티안',
    description: '진료 과목과 한국어 가능 여부, 응급 연락 방법을 안내하는 예시입니다.',
    hours: '진료시간 등록 예정',
    contact: '연락처 등록 예정',
    example: true
  },
  {
    slug: 'example-school',
    name: '예시 학원 D',
    category: 'school',
    area: '비엔티안',
    description: '수업 과목, 대상 연령, 상담 방법을 소개하는 예시입니다.',
    hours: '상담시간 등록 예정',
    contact: '연락처 등록 예정',
    example: true
  },
  {
    slug: 'example-rental',
    name: '예시 부동산 E',
    category: 'rent',
    area: '비엔티안',
    description: '원룸·주택·사무실 임대 정보를 소개하는 예시입니다.',
    hours: '상담시간 등록 예정',
    contact: '연락처 등록 예정',
    example: true
  },
  {
    slug: 'example-recruit',
    name: '예시 구인 F',
    category: 'job',
    area: '비엔티안',
    description: '채용 공고와 지원 방법을 안내하는 예시입니다.',
    hours: '접수시간 등록 예정',
    contact: '연락처 등록 예정',
    example: true
  }
]
