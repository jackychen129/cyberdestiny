import type { Pillar } from '../types';

/** 十二时辰与经络（子午流注简化） */
const ZISHI_TABLE: Array<{
  branch: string;
  hours: string;
  meridian: string;
  practice: string;
}> = [
  { branch: '子', hours: '23:00–01:00', meridian: '胆经', practice: '宜静卧收神' },
  { branch: '丑', hours: '01:00–03:00', meridian: '肝经', practice: '深睡养肝' },
  { branch: '寅', hours: '03:00–05:00', meridian: '肺经', practice: '可轻醒吐纳' },
  { branch: '卯', hours: '05:00–07:00', meridian: '大肠经', practice: '宜早起饮水' },
  { branch: '辰', hours: '07:00–09:00', meridian: '胃经', practice: '宜进食与静坐' },
  { branch: '巳', hours: '09:00–11:00', meridian: '脾经', practice: '宜专注劳作' },
  { branch: '午', hours: '11:00–13:00', meridian: '心经', practice: '宜小憩养心' },
  { branch: '未', hours: '13:00–15:00', meridian: '小肠经', practice: '宜整理思绪' },
  { branch: '申', hours: '15:00–17:00', meridian: '膀胱经', practice: '宜运动排汗' },
  { branch: '酉', hours: '17:00–19:00', meridian: '肾经', practice: '宜收功静养' },
  { branch: '戌', hours: '19:00–21:00', meridian: '心包经', practice: '宜读书静坐' },
  { branch: '亥', hours: '21:00–23:00', meridian: '三焦经', practice: '宜放松入眠' },
];

export interface ZishiWindow {
  branch: string;
  hours: string;
  meridian: string;
  practice: string;
  recommended: boolean;
}

export function getZishiPracticeWindows(
  dayPillar: Pillar,
  favorableElements: string[] = [],
): ZishiWindow[] {
  const element = stemElement(dayPillar.stem);
  const preferWater = favorableElements.includes('水') || element === '水';
  const preferWood = favorableElements.includes('木') || element === '木';

  return ZISHI_TABLE.map((z, i) => {
    let recommended = false;
    if (preferWater && (z.branch === '子' || z.branch === '亥')) recommended = true;
    if (preferWood && (z.branch === '寅' || z.branch === '卯')) recommended = true;
    if (!preferWater && !preferWood && (z.branch === '辰' || z.branch === '酉')) recommended = true;
    if (i === dayPillar.branch_index % 12) recommended = true;
    return { ...z, recommended };
  }).filter((z) => z.recommended);
}

function stemElement(stem: string): string {
  const map: Record<string, string> = {
    甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土',
    庚: '金', 辛: '金', 壬: '水', 癸: '水',
  };
  return map[stem] ?? '土';
}

export function getDailyClassic(seed: number): { title: string; content: string; basis: string } {
  const classics = [
    { title: '道德经 · 第一章', content: '道可道，非常道。名可名，非常名。', basis: 'classic:道德经-1' },
    { title: '道德经 · 致虚极', content: '致虚极，守静笃。万物并作，吾以观复。', basis: 'classic:道德经-16' },
    { title: '南华经 · 齐物', content: '天地与我并生，而万物与我为一。', basis: 'classic:南华经-齐物' },
    { title: '易经 · 乾卦', content: '天行健，君子以自强不息。', basis: 'classic:易经-乾' },
  ];
  return classics[seed % classics.length]!;
}
