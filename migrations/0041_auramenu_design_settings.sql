-- Additive. Legacy menus are read without consulting this table.
CREATE TABLE IF NOT EXISTS auramenu_design_settings (
  menu_id TEXT PRIMARY KEY NOT NULL REFERENCES auramenu_requests(id) ON DELETE CASCADE,
  presentation_json TEXT NOT NULL CHECK(json_valid(presentation_json))
);
