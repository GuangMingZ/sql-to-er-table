export function tryParseJson<T = unknown>(
  data: unknown
): {
  json: T | null;
  error: Error | null;
} {
  if (typeof data !== "string") {
    return {
      json: null,
      error: new Error("Invalid JSON string"),
    };
  }
  let jsonString = data;
  try {
    // Remove the code block markers if present
    jsonString = jsonString.replace(/^\s*```json/, "").trim();
    jsonString = jsonString.replace(/```\s*$/, "").trim();
    return {
      json: JSON.parse(jsonString) as T,
      error: null,
    };
  } catch (error: any) {
    return {
      json: null,
      error: new Error("Invalid JSON string: " + error.message),
    };
  }
}
