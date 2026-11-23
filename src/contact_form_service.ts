import { z } from "zod";
import { InfraiClient, InfraiError } from "./infrai_client.ts";

export const contactForm = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  message: z.string().min(1),
  widgetRecordId: z.string().min(1),
  captchaToken: z.string().min(1),
});

export type ContactForm = z.infer<typeof contactForm>;

export type ServiceResult =
  | { status: 202; messageId: string }
  | { status: 422; error: string };

export async function routeContact(form: unknown, client: InfraiClient, inbox: string): Promise<ServiceResult> {
  const input = contactForm.parse(form);
  const requestKey = `contact-${input.email}-${input.captchaToken}`;
  try {
    await client.captcha.verify({
      widget_record_id: input.widgetRecordId,
      token: input.captchaToken,
      action: "contact_form",
    }, requestKey);
    const sent = await client.email.send({
      to: inbox,
      subject: `Contact form from ${input.name}`,
      body: `${input.name} <${input.email}>\n\n${input.message}`,
    }, requestKey);
    return { status: 202, messageId: (sent as { message_id: string }).message_id };
  } catch (error) {
    if (error instanceof InfraiError && error.status >= 400 && error.status < 500) {
      return { status: 422, error: error.message };
    }
    throw error;
  }
}
