import assert from "node:assert/strict";
import { InfraiClient } from "./infrai_client.ts";
import { routeContact } from "./contact_form_service.ts";

const calls: Array<{ path: string; body: Record<string, unknown> }> = [];
const fetcher: typeof fetch = async (input, init) => {
  const path = new URL(String(input)).pathname;
  calls.push({ path, body: JSON.parse(String(init?.body)) });
  if (path === "/v1/captcha/verify") {
    return new Response(JSON.stringify({ ok: false, error: { code: "CAPTCHA_SCORE_TOO_LOW", message: "captcha rejected" } }), { status: 422 });
  }
  return new Response(JSON.stringify({ ok: true, data: { message_id: "unused" } }), { status: 202 });
};

const result = await routeContact({
  name: "Ari",
  email: "ari@example.org",
  message: "Please send a volunteer reminder.",
  widgetRecordId: "widget-record",
  captchaToken: "token",
}, new InfraiClient("test-key", fetcher), "team@example.org");

assert.deepEqual(result, { status: 422, error: "captcha rejected" });
assert.equal(calls.length, 1);
assert.equal(calls[0].path, "/v1/captcha/verify");
console.log("contact decision test passed");
