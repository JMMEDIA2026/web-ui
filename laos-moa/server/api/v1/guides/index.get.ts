import { guides } from '../../../../app/data/guides'
import { requireApiClient } from '../../../utils/apiAuth'

const SITE = 'https://laja.joybox.day'

// 생활 가이드 목록 (제목·요약·표지). 본문은 /guides/{slug} 에서 받아요.
export default defineEventHandler(async (event) => {
  await requireApiClient(event, 'content:read')
  return {
    total: guides.length,
    items: guides.map(g => ({
      slug: g.slug,
      title: g.title,
      summary: g.summary,
      coverUrl: `${SITE}${g.cover}`,
      iconUrl: `${SITE}${g.emoji}`,
      checkedOn: g.checkedOn,
      url: `${SITE}/guides/${g.slug}`
    }))
  }
})
