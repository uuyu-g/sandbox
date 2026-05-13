export const ALL_WEEKDAYS_MASK = 0b1111111

export const weekdayMaskMatches = (mask: number, weekday: number): boolean =>
  (mask & (1 << weekday)) !== 0

export const weekdayMaskFromArray = (days: readonly number[]): number =>
  days.reduce((m, w) => m | (1 << w), 0)

export const weekdaysFromMask = (mask: number): number[] =>
  [0, 1, 2, 3, 4, 5, 6].filter((w) => weekdayMaskMatches(mask, w))
