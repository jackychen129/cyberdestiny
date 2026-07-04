/** 推演信息完整度 — Web / Agent 共用说明 */
export const INFERENCE_FIELD_GUIDE = [
  {
    key: 'birth_datetime',
    label: '出生日期时间',
    required: true,
    impact: '四柱根基，缺则无法排盘。',
  },
  {
    key: 'birth_hour',
    label: '出生时辰（精确到分钟）',
    required: true,
    impact: '时柱占命局约四分之一；缺时辰则格局、子女、晚运皆不准。',
  },
  {
    key: 'birth_place',
    label: '出生地点',
    required: true,
    impact: '真太阳时校正，经度差 1° 约差 4 分钟，可能导致时辰错位。',
  },
  {
    key: 'gender',
    label: '性别',
    required: true,
    impact: '决定大运顺行或逆行，十年运势方向完全不同。',
  },
  {
    key: 'current_location',
    label: '现居地',
    required: false,
    impact: '流年方位、气候宜忌与出行建议更贴地气。',
  },
  {
    key: 'occupation',
    label: '职业/行业',
    required: false,
    impact: '财官印食伤可对应到具体事业与财路象意。',
  },
  {
    key: 'question',
    label: '问事主题',
    required: false,
    impact: '有问事则释象对准主题，无问事则偏通用修身。',
  },
] as const;

export const GUEST_SESSION_HEADER = 'X-Guest-Session';
