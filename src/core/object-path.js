export function getValueByPath(obj, path) {
  if (!obj || !path) return "";

  const normalizedPath = path.replace(/\[(\d+)\]/g, ".$1");
  const parts = normalizedPath.split(".");
  let current = obj;

  for (const part of parts) {
    if (current == null) return "";
    current = current[part];
  }

  return current ?? "";
}
