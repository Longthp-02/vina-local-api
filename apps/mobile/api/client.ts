import { env } from "../config/env";
import { getAccessToken } from "../auth/session";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

function buildUrl(path: string): string {
  const baseUrl = env.apiBaseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const accessToken = await getAccessToken();
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;

  const response = await fetch(buildUrl(path), {
    method: options.method ?? "GET",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
    },
    body: isFormData
      ? (options.body as FormData)
      : options.body
        ? JSON.stringify(options.body)
        : undefined,
  });

  if (!response.ok) {
    let errorMessage = `API request failed (${response.status})`;

    try {
      const errorBody = (await response.json()) as { message?: string | string[] };
      if (Array.isArray(errorBody.message)) {
        errorMessage = errorBody.message.join(", ");
      } else if (typeof errorBody.message === "string") {
        errorMessage = errorBody.message;
      }
    } catch {
      // Ignore non-JSON error bodies.
    }

    throw new Error(errorMessage);
  }

  return (await response.json()) as T;
}

export function resolveApiMediaUrl(path: string): string {
  if (/^https?:\/\//.test(path)) {
    return path;
  }

  return buildUrl(path);
}
