/** 匿名推演：每浏览器会话唯一 ID，对应服务端单条 guest 档案 */
export const GUEST_SESSION_HEADER = 'X-Guest-Session';

const GUEST_SESSION_KEY = 'cyberdestiny_guest_session';

export function getGuestSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(GUEST_SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(GUEST_SESSION_KEY, id);
  }
  return id;
}

export function clearGuestSessionId(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GUEST_SESSION_KEY);
}
