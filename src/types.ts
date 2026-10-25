export interface LevelInfo {
  id: string;
  title: string;
  locationName: string;
}

export interface GameState {
  currentLevelId: string;
  unlockedLevels: string[];
  isAlarmActive: boolean;
  alarmTimeLeft: number;
  dormGateSequence: string[];
  dormLoungeSolved: boolean;
  horcruxSolved: {
    dorm: boolean;
    art: boolean;
    primary: boolean;
  };
  /** Warm cookie — unlocked at dorm lounge */
  hasCookie: boolean;
  /** Starry Night postcard — unlocked at art mirror */
  hasStarCard: boolean;
  /** Faded diary — unlocked at primary lawn */
  hasDiary: boolean;
  /** Elite activity banner — unlocked at explore center */
  hasBanner: boolean;
  currentDormGateInputs: string[];
  completedLevels: string[];
}

/** Level titles / locations aligned with modified lesson plan */
export const LEVELS: LevelInfo[] = [
  { id: 'intro', title: '故事前言', locationName: '起點' },
  { id: 'loc_gate', title: '密碼的節奏', locationName: '校門口' },
  { id: 'loc_alarm', title: '中斷警報', locationName: '警衛室大門' },
  { id: 'loc_office_door', title: '遺落的行事曆', locationName: '九導辦公室門口' },
  { id: 'loc_safe', title: '便利貼上的數字', locationName: '九導辦公室' },
  { id: 'loc_tablet', title: '拼湊完美的圖騰', locationName: '九導辦公室' },
  { id: 'loc_star_map', title: '疊合的真相', locationName: '九導辦公室' },
  { id: 'loc_intermission1', title: '下一站的選擇', locationName: '平板提示' },
  { id: 'loc_dorm_gate', title: '辛苦的時刻', locationName: '宿舍大門' },
  { id: 'loc_dorm_lounge', title: '絕對平衡的置物櫃', locationName: '宿舍交誼廳' },
  { id: 'loc_intermission2', title: '下一站的選擇', locationName: '平板提示' },
  { id: 'loc_art_mirror', title: '倒影中的真相', locationName: '藝文館鏡牆' },
  { id: 'loc_art_piano', title: '神秘的旋律', locationName: '315練琴室' },
  { id: 'loc_intermission3', title: '下一站的選擇', locationName: '平板提示' },
  { id: 'loc_primary_grass', title: 'ㄖˋ ㄐㄧˋ', locationName: '小學樓草皮' },
  { id: 'loc_explore_center', title: '錯置的祝福', locationName: '探索中心' },
  { id: 'loc_intermission4', title: '下一站的選擇', locationName: '平板提示' },
  { id: 'loc_gym_outer', title: '數字的重組', locationName: '體育館大門' },
  { id: 'loc_gym_inner', title: '完美的人', locationName: '體育館內' },
  { id: 'finish', title: '驚喜揭曉', locationName: '體育館內' },
];
