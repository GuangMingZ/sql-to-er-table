export function safeParseJSON(json) {
   return typeof json === 'string' ? JSON.parse(json) : json;
}