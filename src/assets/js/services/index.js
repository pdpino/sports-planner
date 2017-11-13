export default async function jsonRequest(path, options = {}) {
  const result = await fetch(path, {
    ...options,
    headers: { ...options.headers, Accept: 'application/json' },
    credentials: 'include',
  });
  if (result.status !== 200) {
    throw Object.assign(new Error(), result);
  }
  return result.json();
}