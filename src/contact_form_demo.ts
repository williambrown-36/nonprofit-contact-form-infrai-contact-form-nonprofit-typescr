import { InfraiClient } from "./infrai_client.ts";
import { routeContact } from "./contact_form_service.ts";

const inbox = process.env.NONPROFIT_INBOX;
if (!inbox) throw new Error("NONPROFIT_INBOX is required");
const widgetRecordId = process.env.CAPTCHA_WIDGET_RECORD_ID;
if (!widgetRecordId) throw new Error("CAPTCHA_WIDGET_RECORD_ID is required");

const result = await routeContact({
  name: "Maya Chen",
  email: "maya@example.org",
  message: "I would like to volunteer at the food pantry.",
  widgetRecordId,
  captchaToken: process.env.CAPTCHA_TOKEN ?? "replace-with-a-captcha-token",
}, new InfraiClient(), inbox);

console.log(result);
