-- Synthetic records for scripts/qa-crm-browser.mjs (local QA only).
CREATE TABLE clients (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, company TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', service TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'lead', renewal_date TEXT, notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')));
    CREATE TABLE orders (id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER, type TEXT, quantity INTEGER, amount REAL, status TEXT, due_date TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE invoices (id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER, invoice_number TEXT, amount REAL, status TEXT, due_date TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE subscriptions (id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER, plan TEXT, amount REAL, interval TEXT, status TEXT, next_billing_date TEXT, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE nfc_requests (id TEXT PRIMARY KEY, card_type TEXT, business_name TEXT, contact_name TEXT, contact_phone TEXT, email TEXT, status TEXT, payment_status TEXT, created_at TEXT, updated_at TEXT);
    CREATE TABLE auramenu_requests (id TEXT PRIMARY KEY, slug TEXT, business_name TEXT, contact_name TEXT, contact_phone TEXT, whatsapp TEXT, email TEXT, status TEXT, payment_status TEXT, created_at TEXT, updated_at TEXT);
    CREATE TABLE quicksite_projects (id TEXT PRIMARY KEY, slug TEXT, business_name TEXT, contact_name TEXT, phone TEXT, whatsapp TEXT, email TEXT, status TEXT, payment_status TEXT, created_at TEXT, updated_at TEXT);
    CREATE TABLE customer_users (id TEXT PRIMARY KEY, email TEXT, full_name TEXT, password_hash TEXT, active INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')));
    CREATE TABLE shop_bank_orders (id TEXT PRIMARY KEY, reference TEXT, customer_id TEXT, payment_status TEXT, production_status TEXT, total_minor INTEGER, created_at TEXT DEFAULT (datetime('now')));
INSERT INTO clients (id, name, company, email, phone, status) VALUES (1, 'Ayşe Kaya', 'Café Lale', 'ayse@cafelale.test', '+90 532 111 22 33', 'active');
    INSERT INTO orders (client_id, type, quantity, amount, status) VALUES (1, 'NFC', 10, 7000, 'in_production');
    INSERT INTO invoices (client_id, invoice_number, amount, status) VALUES (1, 'INV-1', 7000, 'paid'), (1, 'INV-2', 2500, 'sent');
    INSERT INTO subscriptions (client_id, plan, amount, interval, status) VALUES (1, 'Business Care', 4900, 'monthly', 'active');
    INSERT INTO nfc_requests VALUES ('n1', 'review', 'Café Lale', 'Ayşe', '0532 111 22 33', '', 'pending', 'unpaid', '2026-11-01 10:00:00', '2026-11-01 10:00:00');
    INSERT INTO auramenu_requests VALUES ('m1', 'cafe-lale', 'Café Lale', 'Ayşe', '', '', 'AYSE@cafelale.test', 'approved', 'paid', '2026-11-02 10:00:00', '2026-11-02 10:00:00');
    INSERT INTO quicksite_projects VALUES ('q1', 'kebab', 'Kebap Evi', 'Mehmet', '0555 000 11 22', '', 'mehmet@kebap.test', 'pending', 'unpaid', '2026-11-03 10:00:00', '2026-11-03 10:00:00');
    INSERT INTO customer_users (id, email, full_name, password_hash) VALUES ('u1', 'ayse@cafelale.test', 'Ayşe Kaya', 'x'), ('u2', 'new@shop.test', 'New Person', 'x');
    INSERT INTO shop_bank_orders (id, reference, customer_id, payment_status, production_status, total_minor) VALUES ('s1', 'AD-1001', 'u1', 'paid', 'awaiting_artwork', 70000);
