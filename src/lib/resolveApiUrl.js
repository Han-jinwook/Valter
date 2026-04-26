/**
 * Netlify 배포에서 `/api/...` → Functions 리다이렉트가 404가 되는 환경이 있어,
 * 빌드 시 `VITE_NETLIFY=1` 이면 `/.netlify/functions/...` 로 직접 호출한다.
 * 로컬 `npm run dev` 는 `vite-local-netlify-api` 가 `/api` 를 쓰므로 그대로 둔다.
 */
export function resolveApiUrl(path) {
  if (import.meta.env.VITE_NETLIFY === '1') {
    return path.replace(/^\/api\//, '/.netlify/functions/')
  }
  return path
}
