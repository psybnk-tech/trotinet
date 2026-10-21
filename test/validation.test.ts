import assert from "node:assert/strict";
import test from "node:test";
import { inquirySchema, productSchema } from "../lib/validation";
import { toWhatsAppDigits } from "../lib/phone";

test("inquiry accepts Moroccan phone formatting and trims fields", () => {
  const result = inquirySchema.safeParse({ name: "  Salma  ", phone: "+212 6 12 34 56 78", message: "  Wash kayn had pneu?  ", website: "" });
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data.name, "Salma");
    assert.equal(result.data.message, "Wash kayn had pneu?");
  }
});

test("inquiry rejects malformed phone numbers and short messages, while allowing the honeypot to be checked separately", () => {
  for (const data of [
    { name: "Amina", phone: "telephone", message: "long enough message" },
    { name: "Amina", phone: "0612345678", message: "short" },
  ]) assert.equal(inquirySchema.safeParse(data).success, false);
  assert.equal(inquirySchema.safeParse({ name: "Amina", phone: "0612345678", message: "long enough message", website: "bot" }).success, true);
});

test("products accept exact decimal prices but reject floats encoded with excessive precision", () => {
  const valid = { name: "Pneu", slug: "pneu-85", sku: "PN-85", categoryId: "", description: "", brand: "", price: "125.50", salePrice: "", availability: "ASK_SELLER", published: false, featured: false, specifications: "", compatibility: "", compatibilityVerified: false, seoTitle: "", seoDescription: "" };
  assert.equal(productSchema.safeParse(valid).success, true);
  assert.equal(productSchema.safeParse({ ...valid, price: "125.555" }).success, false);
  assert.equal(productSchema.safeParse({ ...valid, sku: "../admin" }).success, false);
  assert.equal(productSchema.safeParse({ ...valid, slug: "Pneu 85" }).success, false);
  assert.equal(productSchema.safeParse({ ...valid, salePrice: "130.00" }).success, true);
});

test("WhatsApp links normalize Moroccan local numbers to the international country code", () => {
  assert.equal(toWhatsAppDigits("0669978386"), "212669978386");
  assert.equal(toWhatsAppDigits("+212 669-978-386"), "212669978386");
});