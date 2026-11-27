import { guides } from '../../../../app/data/guides'
import { requireApiClient } from '../../../utils/apiAuth'

const SITE = 'https://laja.joybox.day'

export default defineEventHandler(async (event) => {
  await requireApiClient(event, 'content:read')
  const slug = getRouterParam(event, 'slug') ?? ''
  const g = guides.find(x => x.slug === slug)
  if (!g) throw createError({ statusCode: 404, statusMessage: '가이드를 찾을 수 없어요' })
  return {
    guide: {
      slug: g.slug,
      title: g.title,
      summary: g.summary,
      coverUrl: `${SITE}${g.cover}`,
      iconUrl: `${SITE}${g.emoji}`,
      keyPoints: g.keyPoints,
      sections: g.sections,
      warning: g.warning,
      contacts: g.contacts ?? [],
      sources: g.sources,
      checkedOn: g.checkedOn,
      url: `${SITE}/guides/${g.slug}`
    }
  }
})
