export default async function jsonRequest(path, options = {}) {
  const headers = { ...options.headers, Accept: 'application/json' };
  if (options.sendJson) {
    headers['Content-Type'] = 'application/json';
  }
  const result = await fetch(path, {
    ...options,
    headers,
    credentials: 'include',
  });
  if (result.status !== 200) { // REVIEW: use result.ok ??
    throw Object.assign(new Error(), result);
  }
  return result.json();
}
