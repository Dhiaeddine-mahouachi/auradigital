PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT,
  email TEXT NOT NULL COLLATE NOCASE UNIQUE,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  password_iterations INTEGER NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'customer_admin', 'customer_editor')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  last_login_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  CHECK ((role = 'super_admin' AND tenant_id IS NULL) OR (role <> 'super_admin' AND tenant_id IS NOT NULL))
);

CREATE TABLE IF NOT EXISTS customer_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  tenant_id TEXT,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at TEXT NOT NULL DEFAULT (datetime('now')),
  user_agent TEXT NOT NULL DEFAULT '',
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  logo TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  instagram TEXT NOT NULL DEFAULT '',
  facebook TEXT NOT NULL DEFAULT '',
  currency TEXT NOT NULL DEFAULT 'TRY',
  language TEXT NOT NULL DEFAULT 'tr',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS customer_projects (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT NOT NULL,
  business_id TEXT NOT NULL,
  project_type TEXT NOT NULL CHECK (project_type IN ('auramenu', 'quicksite')),
  source_request_id TEXT,
  domain TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'suspended')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (tenant_id, business_id, project_type),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS menu_categories (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT NOT NULL,
  business_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  emoji TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS menu_products (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT NOT NULL,
  business_id TEXT NOT NULL,
  category_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price REAL NOT NULL DEFAULT 0 CHECK (price >= 0),
  image TEXT NOT NULL DEFAULT '',
  available INTEGER NOT NULL DEFAULT 1 CHECK (available IN (0, 1)),
  featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES menu_categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS menu_settings (
  business_id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT NOT NULL,
  template TEXT NOT NULL DEFAULT 'modern',
  primary_color TEXT NOT NULL DEFAULT '#1b9aaa',
  secondary_color TEXT NOT NULL DEFAULT '#10231b',
  language TEXT NOT NULL DEFAULT 'tr',
  currency TEXT NOT NULL DEFAULT 'TRY',
  show_prices INTEGER NOT NULL DEFAULT 1 CHECK (show_prices IN (0, 1)),
  published INTEGER NOT NULL DEFAULT 1 CHECK (published IN (0, 1)),
  revision INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS websites (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT NOT NULL,
  business_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'suspended')),
  revision INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (tenant_id, business_id),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS website_content (
  website_id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT NOT NULL,
  hero_title TEXT NOT NULL DEFAULT '',
  hero_subtitle TEXT NOT NULL DEFAULT '',
  about_title TEXT NOT NULL DEFAULT '',
  about_text TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  opening_hours TEXT NOT NULL DEFAULT '',
  instagram TEXT NOT NULL DEFAULT '',
  facebook TEXT NOT NULL DEFAULT '',
  primary_cta TEXT NOT NULL DEFAULT '',
  secondary_cta TEXT NOT NULL DEFAULT '',
  primary_color TEXT NOT NULL DEFAULT '#a3ff12',
  hero_image TEXT NOT NULL DEFAULT '',
  logo_image TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS website_services (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT NOT NULL,
  website_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  price TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS website_gallery (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT NOT NULL,
  website_id TEXT NOT NULL,
  image TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (website_id) REFERENCES websites(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY NOT NULL,
  tenant_id TEXT,
  user_id TEXT,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL DEFAULT '',
  metadata_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_sessions_token_expiry ON customer_sessions(token_hash, expires_at);
CREATE INDEX IF NOT EXISTS idx_businesses_tenant ON businesses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_projects_tenant_type ON customer_projects(tenant_id, project_type, status);
CREATE INDEX IF NOT EXISTS idx_categories_tenant_business_sort ON menu_categories(tenant_id, business_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_products_tenant_business_category_sort ON menu_products(tenant_id, business_id, category_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_websites_tenant_business ON websites(tenant_id, business_id);
CREATE INDEX IF NOT EXISTS idx_website_services_owner_sort ON website_services(tenant_id, website_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_website_gallery_owner_sort ON website_gallery(tenant_id, website_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_audit_tenant_created ON audit_logs(tenant_id, created_at DESC);
