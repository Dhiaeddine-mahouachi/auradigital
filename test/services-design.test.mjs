import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { renderPricingFallback } from "../src/pricing-html.js";

const file = name => readFileSync(new URL("../" + name, import.meta.url), "utf8");

test("Services page keeps catalogue but removes duplicate infrastructure and ads breakdowns", () => {
  const html = file("services.html");
  assert.match(html, /id="service-offerings"/);
  assert.doesNotMatch(html, /id="infrastructure"/);
  assert.doesNotMatch(html, /id="advertising"/);
  assert.doesNotMatch(html, /data-pricing-view="infrastructure"/);
  assert.doesNotMatch(html, /data-pricing-view="advertising"/);
  assert.doesNotMatch(html, /Secure foundations|Advertising <em>management/);
});

test("Every fallback service card has an icon, price, and usable Explore link", () => {
  const markup = renderPricingFallback("services");
  assert.equal((markup.match(/class="service-card reveal in"/g) || []).length, 11);
  assert.equal((markup.match(/<svg viewBox="0 0 24 24"/g) || []).length, 11);
  assert.equal((markup.match(/class="service-link"/g) || []).length, 11);
  assert.doesNotMatch(markup, /href="#(?:infrastructure|advertising)"/);
  assert.doesNotMatch(markup, /⌘/);
  assert.match(markup, /contact\?service=pricing&amp;plan=standard-infra/);
});

test("Services hover effect does not animate background fills or text colors", () => {
  const css = file("services-classic.css");
  const js = file("pricing/ui.js");
  assert.match(css, /\.service-card::after\s*\{\s*content:none!important/);
  assert.match(css, /backdrop-filter:blur\(20px\)/);
  assert.match(js, /const serviceIconPaths=/);
  assert.doesNotMatch(js, /"⌘"/);
});
