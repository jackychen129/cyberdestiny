import type { KnowledgeSeed } from './types';

/**
 * 现代科学种子 — 量子力学、复杂性、系统论等
 * 用途：推演释象之当代补充与象意桥梁，非替代命理计算
 */
export const SCIENCE_MODERN: KnowledgeSeed[] = [
  {
    type: 'science',
    tradition: 'quantum',
    title: '量子力学 · 不确定性原理',
    content:
      '海森堡不确定性原理：同一粒子的位置与动量不能同时被精确测定。推命启示：吉凶亦不可单点精确锁定，宜观概率云与趋势区间，留有余地。',
    metadata: { source: '量子力学', concept: 'uncertainty', seed_key: 'sci:heisenberg' },
  },
  {
    type: 'science',
    tradition: 'quantum',
    title: '量子力学 · 叠加态',
    content:
      '微观粒子在观测前可处于多种状态的叠加。象意：重大决策前，多种可能并存；「观」与「行」之时机，可使势态坍缩为一路。',
    metadata: { source: '量子力学', concept: 'superposition', seed_key: 'sci:superposition' },
  },
  {
    type: 'science',
    tradition: 'quantum',
    title: '量子力学 · 纠缠',
    content:
      '纠缠粒子对一方状态的改变 instantaneously 关联另一方。象意：人事网络中，远距关联与合盘、世应之「感而遂通」可作现代隐喻，宜察牵连。',
    metadata: { source: '量子力学', concept: 'entanglement', seed_key: 'sci:entanglement' },
  },
  {
    type: 'science',
    tradition: 'quantum',
    title: '量子力学 · 观测者效应',
    content:
      '测量行为参与塑造被测系统。象意：心念、关注与叙事会强化某一运势走向——知命后之焦虑或笃定，皆可反馈于行事气场。',
    metadata: { source: '量子力学', concept: 'observer', seed_key: 'sci:observer' },
  },
  {
    type: 'science',
    tradition: 'quantum',
    title: '量子力学 · 波粒二象性',
    content:
      '光与物质兼具波动与粒子二象。象意：同一人事，既可见宏观趋势（波），又须抓关键节点（粒）；合参而不偏执一端。',
    metadata: { source: '量子力学', concept: 'duality', seed_key: 'sci:duality' },
  },
  {
    type: 'science',
    tradition: 'physics',
    title: '相对论 · 时空相对性',
    content:
      '爱因斯坦相对论：时间流逝与参考系相关。象意：大运十年如长时标，日运如短时标；尺度不同，吉凶判断不可混用同一标准。',
    metadata: { source: '相对论', concept: 'spacetime', seed_key: 'sci:relativity' },
  },
  {
    type: 'science',
    tradition: 'physics',
    title: '热力学 · 熵增原理',
    content:
      '孤立系统熵趋于增加，无序度自发上升。象意：无修为之运，格局易趋散乱；修行、整理、节律即「负熵」输入，与命理调候相通。',
    metadata: { source: '热力学', concept: 'entropy', seed_key: 'sci:entropy' },
  },
  {
    type: 'science',
    tradition: 'physics',
    title: '宇宙学 · 暗物质暗能量',
    content:
      '可见物质仅占宇宙质能一小部分，大部分为暗物质与暗能量。象意：命盘所示为「可显之机」，尚有潜势与未知变量，宜 humility。',
    metadata: { source: '宇宙学', concept: 'dark_matter', seed_key: 'sci:cosmos' },
  },
  {
    type: 'science',
    tradition: 'complexity',
    title: '混沌理论 · 蝴蝶效应',
    content:
      '非线性系统中，初始条件的微小差异可导致巨大结果分歧。象意：日柱细微之机、一时一念，可在长程放大；慎小谨始。',
    metadata: { source: '混沌理论', concept: 'butterfly', seed_key: 'sci:chaos' },
  },
  {
    type: 'science',
    tradition: 'complexity',
    title: '复杂性科学 · 涌现',
    content:
      '整体行为无法简单还原为部分之和，涌现出新秩序。象意：命局、大运、流年、人事交织后，或有超越单柱断语的整体主题涌现。',
    metadata: { source: '复杂性科学', concept: 'emergence', seed_key: 'sci:emergence' },
  },
  {
    type: 'science',
    tradition: 'complexity',
    title: '复杂性科学 · 临界态',
    content:
      '系统可处于临界点，小扰动引发相变。象意：冲合刑害之年月，常为人生相变窗口，既险亦机，宜备而不惧。',
    metadata: { source: '复杂性科学', concept: 'criticality', seed_key: 'sci:critical' },
  },
  {
    type: 'science',
    tradition: 'systems',
    title: '系统论 · 反馈回路',
    content:
      '正反馈放大、负反馈稳定。象意：顺势则正反馈成势，逆势则阻力倍增；识得回路，可知何时宜进、何时宜收。',
    metadata: { source: '系统论', concept: 'feedback', seed_key: 'sci:feedback' },
  },
  {
    type: 'science',
    tradition: 'systems',
    title: '系统论 · 延迟效应',
    content:
      '因果之间常有时间延迟，短期行动未必即时见效。象意：改运修行、积德迁善，或需跨运方显；不可因未即时应验而弃。',
    metadata: { source: '系统论', concept: 'delay', seed_key: 'sci:delay' },
  },
  {
    type: 'science',
    tradition: 'neuro',
    title: '神经科学 · 神经可塑性',
    content:
      '大脑结构与功能可被经验重塑。象意：「性由心生」有现代科学支撑——习惯、修习可改气质与行事模式，与知命不认命相合。',
    metadata: { source: '神经科学', concept: 'plasticity', seed_key: 'sci:neuro' },
  },
  {
    type: 'science',
    tradition: 'neuro',
    title: '神经科学 · 默认模式网络',
    content:
      '人脑空闲时默认网络活跃，易反刍与焦虑。象意：「致虚极守静笃」有生理对应——减少空转反刍，方能观气不失。',
    metadata: { source: '神经科学', concept: 'dmn', seed_key: 'sci:dmn' },
  },
  {
    type: 'science',
    tradition: 'physics',
    title: '信息论 · 香农熵',
    content:
      '信息熵度量不确定性的多寡。象意：局势越不明，越宜收集信息、减少妄断；推演旨在降熵（增清晰），非增焦虑。',
    metadata: { source: '信息论', concept: 'shannon', seed_key: 'sci:information' },
  },
  {
    type: 'science',
    tradition: 'quantum',
    title: '量子计算 · 并行探索',
    content:
      '量子比特可并行探索多解空间。象意：周运、年运宜多方案预演，保留选项，待气机明朗再收敛决策。',
    metadata: { source: '量子计算', concept: 'qubit', seed_key: 'sci:qcompute' },
  },
  {
    type: 'principle',
    tradition: 'quantum',
    title: '科学象意 · 概率而非定数',
    content:
      '现代物理学以概率幅描述世界，非经典决定论。与推命三戒相合：命盘示倾向与概率，不代绝对定数；人仍保有选择与观测参与。',
    metadata: { bridge: 'tianli', seed_key: 'sci:bridge:prob' },
  },
  {
    type: 'principle',
    tradition: 'systems',
    title: '科学象意 · 人机共生时代',
    content:
      'AI 与自动化重塑劳动与决策结构。流年推运宜纳入技术变革变量：宜终身学习、宜与机器协作，忌固守单一路径。',
    metadata: { bridge: 'world', seed_key: 'sci:bridge:ai' },
  },
  {
    type: 'principle',
    tradition: 'physics',
    title: '科学象意 · 尺度律',
    content:
      '物理定律随尺度而变——量子域与宏观域规则不同。推命须分尺度：日运重机微，年运重主题，一生重格局，不可混断。',
    metadata: { bridge: 'tianli', seed_key: 'sci:bridge:scale' },
  },
];

/** 宏观时势主题种子（相对静态，补充动态 RSS） */
export const WORLD_THEMES: KnowledgeSeed[] = [
  {
    type: 'current_affairs',
    tradition: 'world',
    title: '时势主题 · 人工智能变革',
    content:
      '生成式 AI 加速知识工作与决策辅助，带来效率红利与就业结构重组。个人运势外应：宜提升数字素养，忌完全外包判断于算法。',
    metadata: { theme: 'ai', horizon: '2020s', seed_key: 'world:ai' },
  },
  {
    type: 'current_affairs',
    tradition: 'world',
    title: '时势主题 · 气候与极端天气',
    content:
      '全球变暖加剧极端降水、高温与供应链扰动。推运外应：出行、置业、农业相关决策宜纳入气候风险与季节异常因素。',
    metadata: { theme: 'climate', horizon: '2020s', seed_key: 'world:climate' },
  },
  {
    type: 'current_affairs',
    tradition: 'world',
    title: '时势主题 · 地缘博弈与供应链',
    content:
      '多边秩序调整，产业链区域化。象意：驿马、变动之星旺时，或与跨境、迁移、行业轮动相呼应，宜分散风险。',
    metadata: { theme: 'geopolitics', horizon: '2020s', seed_key: 'world:geo' },
  },
  {
    type: 'current_affairs',
    tradition: 'world',
    title: '时势主题 · 低利率到高波动金融周期',
    content:
      '全球货币政策周期切换，资产波动率上升。命理外应：财星、官杀受制之年，宜保守杠杆，重现金流与安全边际。',
    metadata: { theme: 'finance', horizon: '2020s', seed_key: 'world:finance' },
  },
  {
    type: 'current_affairs',
    tradition: 'world',
    title: '时势主题 · 人口老龄化',
    content:
      '多国学龄与劳动人口达峰回落，养老与医疗需求上升。个人宜早规划健康、储蓄与第二曲线，与长生十二宫「养」「墓」之戒相应。',
    metadata: { theme: 'demographics', horizon: '2020s', seed_key: 'world:aging' },
  },
  {
    type: 'current_affairs',
    tradition: 'world',
    title: '时势主题 · 新能源转型',
    content:
      '风光储与电动车渗透加速，旧能源与新政策博弈。变动之机：宜关注政策窗口与技术路线，忌 All-in 单一叙事。',
    metadata: { theme: 'energy', horizon: '2020s', seed_key: 'world:energy' },
  },
];
