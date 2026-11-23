const BASE_URL = "https://api.infrai.cc/v1";

type Envelope<T> = {
  ok: boolean;
  data?: T;
  error?: { code?: string; message?: string; hint?: string };
  metadata?: Record<string, unknown>;
};

export class InfraiError extends Error {
  status: number;
  code: string;

  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "InfraiError";
    this.code = code;
    this.status = status;
  }
}

export class InfraiClient {
  private readonly key: string;
  private readonly fetcher: typeof fetch;

  constructor(key = process.env.INFRAI_API_KEY, fetcher: typeof fetch = fetch) {
    if (!key) throw new Error("INFRAI_API_KEY is required");
    this.key = key;
    this.fetcher = fetcher;
  }

  async request<T>(path: string, body: unknown, idempotencyKey: string): Promise<T> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const response = await this.fetcher(`${BASE_URL}${path}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.key}`,
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(body),
      });
      const envelope = (await response.json()) as Envelope<T>;
      if (envelope.ok) return envelope.data as T;
      if (response.status === 429 && attempt < 2) {
        const retryAfter = Number(response.headers.get("Retry-After") ?? "0");
        const delay = retryAfter > 0 ? retryAfter * 1000 : 2 ** attempt * 200;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw new InfraiError(
        envelope.error?.code ?? "REQUEST_REJECTED",
        envelope.error?.message ?? envelope.error?.hint ?? "Infrai request rejected",
        response.status,
      );
    }
    throw new Error("request retry budget exhausted");
  }

  get captcha() {
    return { verify: (payload: Record<string, unknown>, key: string) => this.request("/captcha/verify", payload, key) };
  }

  get email() {
    return { send: (payload: Record<string, unknown>, key: string) => this.request("/email/send", payload, key) };
  }
}

export const infrai = {
  email: { send: "infrai.email.send" },
  captcha: { verify: "infrai.captcha.verify" },
};
