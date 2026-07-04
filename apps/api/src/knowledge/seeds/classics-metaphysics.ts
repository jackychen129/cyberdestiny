import type { KnowledgeSeed } from './types';

/** 紫微、奇门、梅花、六壬等术数典籍与术语 */
export const CLASSICS_METAPHYSICS: KnowledgeSeed[] = [
  {
    type: 'classic',
    tradition: 'ziwei',
    title: '紫微斗数 · 命宫',
    content: '命宫为先天格局之枢。主星入命，定性情与人生主轴；辅星会合，论吉凶祸福。须与八字日主、大运参看，不可单宫独断。',
    metadata: { source: '紫微斗数全书', topic: '命宫', seed_key: 'ziwei:命宫' },
  },
  {
    type: 'classic',
    tradition: 'ziwei',
    title: '紫微斗数 · 三方四正',
    content: '命、财、官、迁四宫为三方四正。看格局高低，须会照对宫与三合宫之星曜，方见全貌。',
    metadata: { source: '紫微斗数全书', seed_key: 'ziwei:三方四正' },
  },
  {
    type: 'glossary',
    tradition: 'qimen',
    title: '奇门遁甲 · 八门',
    content: '休、生、伤、杜、景、死、惊、开为八门。门主事之方向与态度：生门、开门、休门多主吉；死门、惊门宜慎。',
    metadata: { topic: '八门', seed_key: 'qimen:八门' },
  },
  {
    type: 'glossary',
    tradition: 'qimen',
    title: '奇门遁甲 · 九星',
    content: '天蓬、天芮、天冲、天辅、天禽、天心、天柱、天任、天英为九星。星主天时气势，与门、神配合以断事。',
    metadata: { topic: '九星', seed_key: 'qimen:九星' },
  },
  {
    type: 'classic',
    tradition: 'bagua',
    title: '梅花易数 · 体用',
    content: '梅花以体卦、用卦生克定吉凶。用生体、体克用多为吉；体生用则泄，用克体则凶。动爻为机，应期在变。',
    metadata: { source: '梅花易数', topic: '体用', seed_key: 'meihua:体用' },
  },
  {
    type: 'glossary',
    tradition: 'calendar',
    title: '大六壬 · 三传',
    content: '初传发端，中传发展，末传结局。四课定象，三传别体用，与干支、神煞合参以断人事。',
    metadata: { topic: '三传', seed_key: 'liuren:三传' },
  },
  {
    type: 'glossary',
    tradition: 'calendar',
    title: '小六壬 · 六宫',
    content: '大安、留连、速喜、赤口、小吉、空亡六宫。以月日时起课，数步得宫，主事之快慢吉凶，宜占近事。',
    metadata: { topic: '六宫', seed_key: 'xiaoliuren:六宫' },
  },
  {
    type: 'glossary',
    tradition: 'bazi',
    title: '神煞 · 天乙贵人',
    content: '天乙贵人，逢凶化吉之助。甲戊庚牛羊，乙己鼠猴乡，丙丁猪鸡位，壬癸兔蛇藏，六辛逢马虎。入命入运，多主贵人提携。',
    metadata: { topic: '神煞', seed_key: 'shensha:天乙' },
  },
  {
    type: 'glossary',
    tradition: 'bazi',
    title: '择日 · 建除十二神',
    content: '建、除、满、平、定、执、破、危、成、收、开、闭。建除满平定执破危成收开闭，各有所宜所忌，须合事类与干支。',
    metadata: { topic: '建除', seed_key: 'zeri:建除' },
  },
];
