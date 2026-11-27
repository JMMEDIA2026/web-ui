// 다른 사이트(같은 DB를 쓰는 프로젝트)가 넣은 분류 이름을 라자 분류로 바꿔 줍니다.
// DB 값은 그대로 두고 보여 줄 때만 바꾸므로, 그쪽 사이트에는 영향이 없습니다.
export const CATEGORY_ALIASES: Record<string, string> = {
  restaurant: 'food',
  market: 'mart',
  medical: 'hospital',
  rental: 'rent',
  realestate: 'rent'
}

export const normalizeCategory = (raw: string): string => CATEGORY_ALIASES[raw] ?? raw

/** 라자 분류 하나에 해당하는 DB 값 모두 (예: rent → rent, rental, realestate) */
export const rawCategoriesFor = (key: string): string[] => [key, ...Object.entries(CATEGORY_ALIASES).filter(([, v]) => v === key).map(([k]) => k)]
