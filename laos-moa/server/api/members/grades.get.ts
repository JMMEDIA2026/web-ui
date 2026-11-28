import { ADMIN_GRADE, GRADES, GRADE_RULES } from '../../utils/grade'

// 등급표(이름과 기준 점수). 회원 화면의 "등급 안내"에서 씁니다.
export default defineEventHandler(() => ({
  rules: GRADE_RULES,
  grades: [...GRADES, { ...ADMIN_GRADE, min: null }]
}))
