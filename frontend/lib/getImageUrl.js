// Builds a full URL for an image path returned by the backend (e.g. "/uploads/foo.jpg").
// Falls back safely to a placeholder if the path or the API URL env var is missing,
// so a misconfigured .env.local can never produce an invalid "undefined/..." src.
const FALLBACK_IMAGE = 'https://placehold.co/400x500/EDE0F5/7B68B0?text=coop+shop';

export function getImageUrl(path, fallback = FALLBACK_IMAGE) {
  if (!path) return fallback;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) return fallback; // env not configured yet - don't build a broken URL

  const base = apiUrl.replace(/\/api\/?$/, '');
  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}
