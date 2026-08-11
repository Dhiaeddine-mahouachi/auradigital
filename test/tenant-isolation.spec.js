import { env } from "cloudflare:workers";
import { applyD1Migrations, createExecutionContext } from "cloudflare:test";
import { beforeAll, describe, expect, it } from "vitest";
import worker from "../src/worker.js";
import { sha256 } from "../src/customer/crypto.js";

const ORIGIN = "https://auradigital.ink";
const ids = {
  tenantA: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  tenantB: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  userA: "11111111-1111-4111-8111-111111111111",
  userB: "22222222-2222-4222-8222-222222222222",
  businessA: "33333333-3333-4333-8333-333333333333",
  businessB: "44444444-4444-4444-8444-444444444444",
  categoryA: "55555555-5555-4555-8555-555555555555",
  categoryB: "66666666-6666-4666-8666-666666666666",
  productA: "77777777-7777-4777-8777-777777777777",
  productB: "88888888-8888-4888-8888-888888888888",
  websiteB: "99999999-9999-4999-8999-999999999999",
};
const tokenA = "tenant-a-session-token-with-enough-random-looking-characters";

beforeAll(async () => {
  await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
  const tokenHash = await sha256(tokenA);
  await env.DB.batch([
    env.DB.prepare("INSERT INTO tenants (id,name) VALUES (?,?)").bind(ids.tenantA, "Cafe A"),
    env.DB.prepare("INSERT INTO tenants (id,name) VALUES (?,?)").bind(ids.tenantB, "Cafe B"),
    env.DB.prepare("INSERT INTO users (id,tenant_id,email,password_hash,password_salt,password_iterations,role) VALUES (?,?,?,?,?,?,?)").bind(ids.userA, ids.tenantA, "a@example.com", "hash", "salt", 1, "customer_admin"),
    env.DB.prepare("INSERT INTO users (id,tenant_id,email,password_hash,password_salt,password_iterations,role) VALUES (?,?,?,?,?,?,?)").bind(ids.userB, ids.tenantB, "b@example.com", "hash", "salt", 1, "customer_admin"),
    env.DB.prepare("INSERT INTO customer_sessions (id,user_id,tenant_id,token_hash,expires_at) VALUES (?,?,?,?,datetime('now','+1 day'))").bind(crypto.randomUUID(), ids.userA, ids.tenantA, tokenHash),
    env.DB.prepare("INSERT INTO businesses (id,tenant_id,name,slug) VALUES (?,?,?,?)").bind(ids.businessA, ids.tenantA, "Cafe A", "cafe-a"),
    env.DB.prepare("INSERT INTO businesses (id,tenant_id,name,slug) VALUES (?,?,?,?)").bind(ids.businessB, ids.tenantB, "Cafe B", "cafe-b"),
    env.DB.prepare("INSERT INTO customer_projects (id,tenant_id,business_id,project_type,status) VALUES (?,?,?,?,?)").bind(crypto.randomUUID(), ids.tenantA, ids.businessA, "auramenu", "active"),
    env.DB.prepare("INSERT INTO customer_projects (id,tenant_id,business_id,project_type,status) VALUES (?,?,?,?,?)").bind(crypto.randomUUID(), ids.tenantB, ids.businessB, "auramenu", "active"),
    env.DB.prepare("INSERT INTO customer_projects (id,tenant_id,business_id,project_type,status) VALUES (?,?,?,?,?)").bind(crypto.randomUUID(), ids.tenantB, ids.businessB, "quicksite", "active"),
    env.DB.prepare("INSERT INTO menu_settings (business_id,tenant_id) VALUES (?,?)").bind(ids.businessA, ids.tenantA),
    env.DB.prepare("INSERT INTO menu_settings (business_id,tenant_id) VALUES (?,?)").bind(ids.businessB, ids.tenantB),
    env.DB.prepare("INSERT INTO menu_categories (id,tenant_id,business_id,name) VALUES (?,?,?,?)").bind(ids.categoryA, ids.tenantA, ids.businessA, "Coffee A"),
    env.DB.prepare("INSERT INTO menu_categories (id,tenant_id,business_id,name) VALUES (?,?,?,?)").bind(ids.categoryB, ids.tenantB, ids.businessB, "Coffee B"),
    env.DB.prepare("INSERT INTO menu_products (id,tenant_id,business_id,category_id,name,price) VALUES (?,?,?,?,?,?)").bind(ids.productA, ids.tenantA, ids.businessA, ids.categoryA, "Cappuccino A", 90),
    env.DB.prepare("INSERT INTO menu_products (id,tenant_id,business_id,category_id,name,price) VALUES (?,?,?,?,?,?)").bind(ids.productB, ids.tenantB, ids.businessB, ids.categoryB, "Cappuccino B", 120),
    env.DB.prepare("INSERT INTO websites (id,tenant_id,business_id,template_id,status) VALUES (?,?,?,?,?)").bind(ids.websiteB, ids.tenantB, ids.businessB, "local-pro", "published"),
    env.DB.prepare("INSERT INTO website_content (website_id,tenant_id,hero_title,about_text) VALUES (?,?,?,?)").bind(ids.websiteB, ids.tenantB, "Cafe B Website", "Private admin fields never appear here"),
  ]);
});

function request(path, options = {}, authenticated = true) {
  const headers = new Headers(options.headers || {});
  if (options.body) headers.set("Content-Type", "application/json");
  if (authenticated) headers.set("Cookie", `__Host-aura_customer=${tokenA}`);
  if (options.method && options.method !== "GET") headers.set("Origin", ORIGIN);
  return worker.fetch(new Request(`${ORIGIN}${path}`, { ...options, headers }), env, createExecutionContext());
}

describe("tenant isolation", () => {
  it("rejects unauthenticated private API access", async () => {
    const response = await request("/api/products", {}, false);
    expect(response.status).toBe(401);
  });

  it("returns only the authenticated tenant's products", async () => {
    const response = await request("/api/products");
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.products.map((item) => item.id)).toEqual([ids.productA]);
    expect(JSON.stringify(data)).not.toContain(ids.productB);
  });

  it("cannot update another tenant's product by changing the ID", async () => {
    const response = await request(`/api/products/${ids.productB}`, { method: "PUT", body: JSON.stringify({ price: 1 }) });
    expect(response.status).toBe(404);
    const row = await env.DB.prepare("SELECT price FROM menu_products WHERE id=?").bind(ids.productB).first();
    expect(row.price).toBe(120);
  });

  it("cannot delete another tenant's product by changing the ID", async () => {
    const response = await request(`/api/products/${ids.productB}`, { method: "DELETE" });
    expect(response.status).toBe(404);
    expect(await env.DB.prepare("SELECT id FROM menu_products WHERE id=?").bind(ids.productB).first()).not.toBeNull();
  });

  it("updates its own product and exposes the new price publicly", async () => {
    const update = await request(`/api/products/${ids.productA}`, { method: "PUT", body: JSON.stringify({ price: 110 }) });
    expect(update.status).toBe(200);
    const publicResponse = await request("/api/public/menu/cafe-a", {}, false);
    expect(publicResponse.status).toBe(200);
    const data = await publicResponse.json();
    expect(data.menu.categories[0].items[0].price).toBe(110);
    expect(data.menu).not.toHaveProperty("tenant_id");
    expect(data.menu).not.toHaveProperty("contactName");
  });

  it("hides unpurchased QuickSite APIs", async () => {
    const response = await request("/api/website");
    expect(response.status).toBe(403);
  });

  it("rejects cross-site mutations even with a valid session cookie", async () => {
    const response = await worker.fetch(new Request(`${ORIGIN}/api/products/${ids.productA}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Cookie: `__Host-aura_customer=${tokenA}`, Origin: "https://evil.example" },
      body: JSON.stringify({ price: 1 }),
    }), env, createExecutionContext());
    expect(response.status).toBe(403);
  });

  it("rejects unauthenticated image uploads", async () => {
    const response = await worker.fetch(new Request(`${ORIGIN}/api/uploads`, {
      method: "POST", headers: { "Content-Type": "image/png", Origin: ORIGIN }, body: new Uint8Array([137,80,78,71,13,10,26,10]),
    }), env, createExecutionContext());
    expect(response.status).toBe(401);
  });

  it("does not expose an unreferenced tenant upload to other users", async () => {
    const key = "12121212-1212-4212-8212-121212121212.png";
    await env.CUSTOMER_UPLOADS.put(key, new Uint8Array([137,80,78,71,13,10,26,10]), {
      httpMetadata: { contentType: "image/png" }, customMetadata: { tenantId: ids.tenantA },
    });
    const anonymous = await request(`/media/${key}`, {}, false);
    expect(anonymous.status).toBe(404);
    const owner = await request(`/media/${key}`);
    expect(owner.status).toBe(200);
  });

  it("serves published QuickSite data without tenant or account fields", async () => {
    const response = await request("/api/public/site/cafe-b", {}, false);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.project.heroTitle).toBeUndefined();
    expect(data.project.businessName).toBe("Cafe B");
    expect(JSON.stringify(data)).not.toContain(ids.tenantB);
    expect(JSON.stringify(data)).not.toContain("b@example.com");
  });
});
