/** Tone marks used in Zhuyin IME. */
export const ZHUYIN_TONES = ['ˊ', 'ˇ', 'ˋ', '˙'] as const;

/** Strip tone marks from a zhuyin string. */
export function stripTone(s: string) {
  return s.replace(/[ˊˇˋ˙]/g, '');
}

export function endsWithTone(s: string) {
  return /[ˊˇˋ˙]$/.test(s);
}

/**
 * Syllable → candidate characters (escape-room focused + common neighbors).
 * Tone-1 syllables are stored without a mark (Taiwan convention).
 */
export const ZHUYIN_SYLLABLES: Record<string, string[]> = {
  // 小星星 / 小星星歌
  'ㄒㄧㄠˇ': ['小', '曉', '筱'],
  ㄒㄧㄥ: ['星', '興', '行', '腥'],
  'ㄒㄧㄥˊ': ['行', '形', '型', '邢'],
  'ㄒㄧㄥˋ': ['幸', '性', '姓', '杏'],
  ㄍㄜ: ['歌', '哥', '擱'],
  'ㄍㄜˊ': ['格', '隔', '革'],
  'ㄍㄜˋ': ['個', '各'],

  // 探索中心
  'ㄊㄢˋ': ['探', '嘆', '碳'],
  'ㄙㄨㄛˇ': ['索', '鎖', '所'],
  ㄙㄨㄛ: ['縮', '梭'],
  ㄓㄨㄥ: ['中', '終', '鐘', '忠'],
  'ㄓㄨㄥˇ': ['種', '腫'],
  'ㄓㄨㄥˋ': ['重', '仲', '眾'],
  ㄒㄧㄣ: ['心', '新', '欣', '辛'],
  'ㄒㄧㄣˊ': ['尋', '鄩'],
  'ㄒㄧㄣˋ': ['信', '釁'],

  // 宿舍
  'ㄙㄨˋ': ['宿', '訴', '素', '速'],
  ㄙㄨ: ['蘇', '酥'],
  'ㄕㄜˋ': ['舍', '社', '設', '射'],
  ㄕㄜ: ['奢'],
  'ㄕㄜˊ': ['蛇', '舌'],
  'ㄕㄜˇ': ['捨'],

  // 體育館
  'ㄊㄧˇ': ['體', '缇'],
  ㄊㄧ: ['梯', '踢'],
  'ㄊㄧˊ': ['題', '提', '蹄'],
  'ㄊㄧˋ': ['替', '惕'],
  'ㄩˋ': ['育', '預', '玉', '遇', '域'],
  ㄩ: ['於', '淤'],
  'ㄩˊ': ['魚', '愚', '餘'],
  'ㄩˇ': ['雨', '語', '與'],
  'ㄍㄨㄢˇ': ['館', '管', '莞'],
  ㄍㄨㄢ: ['官', '關', '觀'],
  'ㄍㄨㄢˋ': ['貫', '慣', '灌'],

  // 小學樓
  'ㄒㄩㄝˊ': ['學', '穴'],
  ㄒㄩㄝ: ['薛'],
  'ㄒㄩㄝˇ': ['雪'],
  'ㄒㄩㄝˋ': ['血'],
  'ㄌㄡˊ': ['樓', '婁'],
  ㄌㄡ: ['摟'],
  'ㄌㄡˇ': ['簍'],
  'ㄌㄡˋ': ['漏', '陋'],

  // 藝文館
  'ㄧˋ': ['藝', '意', '易', '異', '億', '亦', '義'],
  ㄧ: ['一', '衣', '依'],
  'ㄧˊ': ['移', '疑', '宜', '遺'],
  'ㄧˇ': ['以', '已', '椅', '乙'],
  'ㄨㄣˊ': ['文', '聞'],
  ㄨㄣ: ['溫', '瘟'],
  'ㄨㄣˇ': ['穩', '吻'],
  'ㄨㄣˋ': ['問', '雯'],

  // 祝你畢業快樂
  'ㄓㄨˋ': ['祝', '住', '注', '助', '鑄'],
  ㄓㄨ: ['朱', '珠', '株'],
  'ㄓㄨˊ': ['竹', '逐'],
  'ㄓㄨˇ': ['主', '煮', '囑'],
  'ㄋㄧˇ': ['你', '妳', '擬'],
  ㄋㄧ: ['妮', '尼'],
  'ㄋㄧˊ': ['泥', '倪'],
  'ㄋㄧˋ': ['逆', '匿'],
  'ㄅㄧˋ': ['畢', '必', '閉', '壁', '幣'],
  ㄅㄧ: ['逼'],
  'ㄅㄧˊ': ['鼻'],
  'ㄅㄧˇ': ['比', '筆', '彼'],
  'ㄧㄝˋ': ['業', '葉', '頁', '夜'],
  ㄧㄝ: ['耶', '噎'],
  'ㄧㄝˊ': ['爺'],
  'ㄧㄝˇ': ['也', '野'],
  'ㄎㄨㄞˋ': ['快', '塊', '會'],
  ㄎㄨㄞ: ['蒯'],
  'ㄌㄜˋ': ['樂', '勒'],
  ㄌㄜ: ['嘞'],
  'ㄩㄝˋ': ['樂', '月', '越', '岳'],

  // Extra common syllables students may try
  'ㄏㄠˇ': ['好'],
  ㄏㄠ: ['蒿'],
  'ㄉㄜ˙': ['的', '得'],
  ㄉㄜ: ['德'],
  'ㄕˋ': ['是', '事', '市', '世', '士'],
  ㄕ: ['師', '詩', '失'],
  'ㄕˊ': ['十', '時', '實', '石'],
  'ㄕˇ': ['使', '史', '始'],
  'ㄗㄞˋ': ['在', '再'],
  'ㄅㄨˋ': ['不', '部', '步'],
  ㄨㄛ: ['窩'],
  'ㄨㄛˇ': ['我'],
  'ㄊㄚ': ['他', '她', '它'],
  'ㄇㄣˊ': ['們'],
  'ㄌㄞˊ': ['來'],
  'ㄑㄩˋ': ['去'],
  'ㄎㄢˋ': ['看'],
  'ㄉㄠˋ': ['到', '道'],
  'ㄧㄡˇ': ['有', '友'],
  ㄇㄟ: ['沒'],
  'ㄇㄟˊ': ['沒', '眉', '梅'],
  'ㄇㄟˇ': ['美', '每'],
  'ㄇㄟˋ': ['妹'],
};

/** Multi-syllable phrase shortcuts (composition without spaces). */
export const ZHUYIN_PHRASES: Record<string, string[]> = {
  'ㄒㄧㄠˇㄒㄧㄥㄒㄧㄥ': ['小星星'],
  'ㄒㄧㄠˇㄒㄧㄥㄒㄧㄥㄍㄜ': ['小星星歌'],
  'ㄊㄢˋㄙㄨㄛˇㄓㄨㄥㄒㄧㄣ': ['探索中心'],
  'ㄙㄨˋㄕㄜˋ': ['宿舍'],
  'ㄊㄧˇㄩˋㄍㄨㄢˇ': ['體育館'],
  'ㄒㄧㄠˇㄒㄩㄝˊㄌㄡˊ': ['小學樓'],
  'ㄧˋㄨㄣˊㄍㄨㄢˇ': ['藝文館'],
  'ㄓㄨˋㄋㄧˇㄅㄧˋㄧㄝˋㄎㄨㄞˋㄌㄜˋ': ['祝你畢業快樂'],
};

export function lookupZhuyin(composition: string): string[] {
  if (!composition) return [];

  const phraseHits = ZHUYIN_PHRASES[composition];
  if (phraseHits?.length) return [...phraseHits];

  const exact = ZHUYIN_SYLLABLES[composition];
  if (exact?.length) return [...exact];

  const bare = stripTone(composition);
  if (!bare) return [];

  const ranked: { score: number; ch: string }[] = [];
  const seen = new Set<string>();

  const push = (ch: string, score: number) => {
    if (seen.has(ch)) return;
    seen.add(ch);
    ranked.push({ ch, score });
  };

  // Phrase shortcuts only after a reasonably complete reading prefix
  if (bare.length >= 4) {
    for (const [key, chars] of Object.entries(ZHUYIN_PHRASES)) {
      if (key.startsWith(composition) || stripTone(key).startsWith(bare)) {
        chars.forEach((ch) => push(ch, 0));
      }
    }
  }

  // Syllable: exact tone-stripped match (一聲可不標調)
  for (const [key, chars] of Object.entries(ZHUYIN_SYLLABLES)) {
    if (stripTone(key) === bare) {
      chars.forEach((ch) => push(ch, key === composition ? 1 : 2));
    }
  }

  ranked.sort((a, b) => a.score - b.score);
  return ranked.map((r) => r.ch).slice(0, 10);
}
