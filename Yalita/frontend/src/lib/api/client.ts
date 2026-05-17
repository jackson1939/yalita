// Cliente HTTP autenticado. Capa única para todas las llamadas al backend.

import { getAccessToken } from "@privy-io/react-auth";
import { env } from "../env";

export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

interface RequestOpts extends Omit<RequestInit, "body"> {
  body?: unknown;
  skipAuth?: boolean;
}

async function request<T>(path: string, opts: RequestOpts = {}): Promise<T> {
  const { skipAuth, body, headers, ...rest } = opts;

  const finalHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string> | undefined),
  };

  if (!skipAuth) {
    try {
      const token = await getAccessToken();
      if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
    } catch {
      // ok — no auth disponible aún
    }
  }

  const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
    ...rest,
    headers: finalHeaders,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ error: res.statusText })) as {
      error?: string;
      code?: string;
    };
    throw new ApiClientError(
      res.status,
      errBody.code ?? "UNKNOWN",
      errBody.error ?? res.statusText
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string, opts?: Omit<RequestOpts, "body">) =>
    request<T>(path, { ...opts, method: "GET" }),
  post: <T>(path: string, body?: unknown, opts?: Omit<RequestOpts, "body">) =>
    request<T>(path, { ...opts, method: "POST", body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
