import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY must be set");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = "The Builder Brief <newsletter@thebuilderbrief.com>";
export const SITE_URL = process.env.SITE_URL ?? "https://thebuilderbrief.com";
