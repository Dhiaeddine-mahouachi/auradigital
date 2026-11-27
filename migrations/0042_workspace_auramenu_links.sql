CREATE TABLE IF NOT EXISTS auramenu_menu_owners (
  menu_id TEXT PRIMARY KEY NOT NULL,
  customer_id TEXT NOT NULL,
  linked_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS auramenu_menu_owners_customer ON auramenu_menu_owners(customer_id);

CREATE TABLE IF NOT EXISTS workspace_auramenu_menus (
  menu_id TEXT PRIMARY KEY NOT NULL REFERENCES auramenu_requests(id) ON DELETE CASCADE,
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  linked_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS workspace_auramenu_menus_organization ON workspace_auramenu_menus(organization_id);
