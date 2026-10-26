/**
 * Scene image paths — from 系統圖片 (modified_1025).
 */
export const LEVEL_IMAGES = {
  gate: `${import.meta.env.BASE_URL}images/levels/02-gate.jpg`,
  alarm: `${import.meta.env.BASE_URL}images/levels/03-alarm.jpg`,
  calendar: `${import.meta.env.BASE_URL}images/levels/04-calendar.jpg`,
  safe: `${import.meta.env.BASE_URL}images/levels/05-safe.jpg`,
  tabletEnvelope: `${import.meta.env.BASE_URL}images/levels/06-tablet-envelope.jpg`,
  /** 地圖兩個星星 — rotatable transparent overlay */
  starMap: `${import.meta.env.BASE_URL}images/levels/07-star-map.jpg`,
  /** 地圖注音提示 */
  hintMap: `${import.meta.env.BASE_URL}images/levels/07-hint-map.jpg`,
  locationChoice8: `${import.meta.env.BASE_URL}images/levels/08-location-choice.jpg`,
  dormGate: `${import.meta.env.BASE_URL}images/levels/09-dorm-gate.jpg`,
  magicSquare: `${import.meta.env.BASE_URL}images/levels/10-magic-square.jpg`,
  dormBox: `${import.meta.env.BASE_URL}images/levels/10-dorm-box.jpg`,
  locationChoice11: `${import.meta.env.BASE_URL}images/levels/11-location-choice.jpg`,
  mirrorPostcard: `${import.meta.env.BASE_URL}images/levels/12-mirror-postcard.jpg`,
  sheetMusic: `${import.meta.env.BASE_URL}images/levels/13-sheet-music.jpg`,
  locationChoice14: `${import.meta.env.BASE_URL}images/levels/14-location-choice.jpg`,
  lawnDiary: `${import.meta.env.BASE_URL}images/levels/15-lawn-diary.jpg`,
  banner: `${import.meta.env.BASE_URL}images/levels/16-banner.jpg`,
  locationChoice17: `${import.meta.env.BASE_URL}images/levels/17-location-choice.jpg`,
  gymOuterLock: `${import.meta.env.BASE_URL}images/levels/18-gym-outer-lock.jpg`,
  perfectScreen: `${import.meta.env.BASE_URL}images/levels/19-perfect-screen.jpg`,
  teachersSilhouette: `${import.meta.env.BASE_URL}images/levels/20-teachers-silhouette.jpg`,
} as const;

export const ITEM_IMAGES = {
  cookie: `${import.meta.env.BASE_URL}images/items/cookie.jpg`,
  postcard: `${import.meta.env.BASE_URL}images/items/postcard.jpg`,
  diary: `${import.meta.env.BASE_URL}images/items/diary.jpg`,
  banner: `${import.meta.env.BASE_URL}images/items/banner.jpg`,
} as const;

/** Six-star positions from 拼湊完美的圖騰 (percent in puzzle canvas). */
export const PARA_STAR_POSITIONS: { x: number; y: number }[] = [
  { x: 35, y: 30 },
  { x: 60, y: 70 },
  { x: 85, y: 70 },
  { x: 60, y: 30 },
  { x: 35, y: 70 },
  { x: 10, y: 70 },
];

/** Fixed tablet six-star positions in 疊合的真相 (percent). */
export const TABLET_STAR_POSITIONS: { x: number; y: number }[] = [
  { x: 63, y: 47 },
  { x: 75, y: 63 },
  { x: 31.5, y: 40 },
  { x: 44, y: 57 },
  { x: 55.5, y: 73 },
  { x: 68, y: 89 },
];

export const STAR_HANDOFF_KEY = 'escape-star-handoff-v1';
