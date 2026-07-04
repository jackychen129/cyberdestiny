export interface XiaoLiurenChart {
  question?: string;
  start_palace: string;
  result_palace: string;
  path: string[];
  interpretation: string;
}

const PALACES = ['大安', '留连', '速喜', '赤口', '小吉', '空亡'] as const;

export function computeXiaoLiuren(month: number, day: number, hour: number, question?: string): XiaoLiurenChart {
  const steps = (month + day + hour) % 6;
  const startIdx = 0;
  const endIdx = (startIdx + steps) % PALACES.length;
  const path: string[] = [];
  for (let i = 0; i <= steps; i++) {
    path.push(PALACES[(startIdx + i) % PALACES.length]!);
  }

  const result = PALACES[endIdx]!;
  const interpretation = XIAO_MEANINGS[result] ?? '事有变数，宜静观其变';

  return {
    question,
    start_palace: PALACES[startIdx]!,
    result_palace: result,
    path,
    interpretation,
  };
}

const XIAO_MEANINGS: Record<string, string> = {
  大安: '身不动时，五行属木，主平安、稳进、静守为吉',
  留连: '人未归时，五行属水，主拖延、等待、事有阻滞',
  速喜: '人即至时，五行属火，主喜讯、快速、宜积极',
  赤口: '官事凶时，五行属金，主口舌、争执、慎言',
  小吉: '人来喜时，五行属木，主小成、贵人、可推进',
  空亡: '音信稀时，五行属土，主落空、不宜大动',
};
