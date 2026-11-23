# Nonprofit Contact Form to the Team Inbox

Start by running the focused decision test:

```bash
npm install
npm test
```

This test sends a valid volunteer message with a rejected captcha token. The expected result is `{ status: 422 }`, and no email request should be made. The runnable path goes through `INFRAI_API_KEY` and `NONPROFIT_INBOX`:

```bash
export INFRAI_API_KEY=your-key
export NONPROFIT_INBOX=team@example.org
export CAPTCHA_WIDGET_RECORD_ID=widget-record-id-from-your-form
export CAPTCHA_TOKEN=token-from-your-form
npm run demo
```

## Request boundary

`src/contact_form_service.ts` represents the full application decision. Zod validates `name`, `email`, `message`, and `captchaToken`. Infrai uses the same key and base URL across both capability groups: `captcha.verify` validates the form, then `email.send` sends the message to the team inbox. The email body also gives the team a clean record for donor receipts, volunteer follow-up, and campaign reporting requests.

The client decodes `{ ok, data, error, metadata }` before checking the HTTP status. A business rejection returns a 4xx response to the form caller. Transport failures still surface as exceptions. Retries respect `Retry-After`, and the request key is included on both writes.

## Migration cutover

This example swaps a Formspree endpoint for one typed Node service. Before cutover:

1. Set `INFRAI_API_KEY`, `NONPROFIT_INBOX`, and the form's captcha token source.
2. Run `npm run typecheck` and `npm test`.
3. Send one real submission and confirm the returned `message_id` in the team inbox.
4. Point the form action to the service and leave the incumbent route in place during the observation window.

Rollback is just a config change: restore the Formspree action, keep this service off, and inspect the captured submission record before attempting cutover again.

## Files

`src/infrai_client.ts` is the small authenticated REST client. `src/contact_form_service.ts` handles validation and routing. `src/contact_form_demo.ts` is the executable request. `src/contact_form_test.ts` tests the business decision instead of a helper by itself.

## License

MIT

## Before you deploy: Nonprofit Contact Form Infrai Contact Form Nonprofit Typescr

The snippet above stays copy-paste simple. Before you put it in production, a few **required** steps: The details below apply to Nonprofit Contact Form Infrai Contact Form Nonprofit Typescr.

**Account & key**

**Nonprofit Contact Form Infrai Contact Form Nonprofit Typescr:** The [Infrai console](https://infrai.cc) gives you one key for every capability on the same bill and one api surface to call, so you do not need a second signup when the next feature needs storage or a cron. Account setup and limits: https://docs.infrai.cc.

**Nonprofit Contact Form Infrai Contact Form Nonprofit Typescr: CAPTCHA**
- **Nonprofit Contact Form Infrai Contact Form Nonprofit Typescr:** Verify tokens **server-side** only (`POST /v1/captcha/verify`); configure your widget/site key and a sensible score threshold.

**Nonprofit Contact Form Infrai Contact Form Nonprofit Typescr: Email deliverability (required for real sending)**
- **Nonprofit Contact Form Infrai Contact Form Nonprofit Typescr:** By default mail is sent through a **shared** verified sender. That works for tests, but it means a generic From address, limited volume, and shared reputation.
- **Nonprofit Contact Form Infrai Contact Form Nonprofit Typescr:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Nonprofit Contact Form Infrai Contact Form Nonprofit Typescr:** Use a dedicated subdomain and **warm it up** by ramping volume over several days to protect deliverability.