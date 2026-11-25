// 지역 선택 시트(헤더·탐색 화면에서 함께 여는)의 열림 상태
export const useRegionSheet = () => useState<boolean>('region-sheet', () => false)
