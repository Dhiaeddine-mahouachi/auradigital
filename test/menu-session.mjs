// Test helper: a verified AuraDigital customer with an AuraMenu (auramenu.space) session cookie.
import { ensureCustomers, tokenHash } from '../src/customer-accounts.ts';
export async function menuSession(DB, email = 'owner-' + crypto.randomUUID() + '@test.test') {
  await ensureCustomers(DB);
  const id = crypto.randomUUID(), raw = (crypto.randomUUID() + crypto.randomUUID()).replaceAll('-', '');
  await DB.prepare("INSERT INTO customer_users(id,email,full_name,password_hash) VALUES(?,?,?,'!x')").bind(id, email, 'Owner').run();
  await DB.prepare("INSERT INTO customer_sessions(token_hash,customer_id,expires_at) VALUES(?,?,datetime('now','+1 day'))").bind(await tokenHash(raw), id).run();
  return { id, email, Cookie: '__Host-auramenu_customer=' + raw };
}
