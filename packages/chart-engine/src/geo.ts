/** 常见城市经度（东经），用于真太阳时 stub */
const CITY_LONGITUDE: Record<string, number> = {
  成都: 104.06,
  北京: 116.4,
  上海: 121.47,
  广州: 113.26,
  深圳: 114.05,
  杭州: 120.15,
  西安: 108.93,
  重庆: 106.55,
  武汉: 114.31,
  南京: 118.78,
};

export function resolveLongitude(place?: string, explicit?: number | null): number | undefined {
  if (explicit != null && !Number.isNaN(explicit)) return explicit;
  if (!place) return undefined;
  for (const [city, lon] of Object.entries(CITY_LONGITUDE)) {
    if (place.includes(city)) return lon;
  }
  return undefined;
}
