const ready = new WeakSet();

// The content is deliberately limited to fields shown on the public menu.
export const revisionColumns = [
  'template_id', 'menu_language', 'business_name', 'tagline', 'description',
  'address', 'business_phone', 'whatsapp', 'opening_hours', 'currency', 'categories_json',
];
const content = revisionColumns.map(column => `'${column}', r.${column}`).join(', ');
export const livePublication = `r.status='approved' AND r.payment_status='paid' AND (
  NOT EXISTS (SELECT 1 FROM auramenu_billing b WHERE b.menu_id=r.id)
  OR EXISTS (SELECT 1 FROM auramenu_billing b WHERE b.menu_id=r.id AND julianday(b.paid_until)>julianday('now'))
)`;

export async function ensurePublications(db) {
  if (ready.has(db)) return;
  await db.prepare(`CREATE TABLE IF NOT EXISTS auramenu_design_settings (
    menu_id TEXT PRIMARY KEY NOT NULL REFERENCES auramenu_requests(id) ON DELETE CASCADE,
    presentation_json TEXT NOT NULL CHECK(json_valid(presentation_json))
  )`).run();
  await db.prepare(`CREATE TABLE IF NOT EXISTS auramenu_publications (
    menu_id TEXT NOT NULL REFERENCES auramenu_requests(id) ON DELETE CASCADE,
    revision INTEGER NOT NULL, published_at TEXT NOT NULL,
    action TEXT NOT NULL CHECK(action IN ('baseline','publish','update','restore')),
    actor_type TEXT NOT NULL CHECK(actor_type IN ('system','customer','admin','legacy-token')),
    actor_id TEXT, source_revision INTEGER,
    content_json TEXT NOT NULL CHECK(json_valid(content_json)),
    presentation_json TEXT NOT NULL CHECK(json_valid(presentation_json)),
    PRIMARY KEY (menu_id, revision)
  )`).run();
  ready.add(db);
}

export function capturePublication(db, id, revision, {
  action = 'baseline', type = 'system', actor = null, source = null, afterUpdate = false,
} = {}) {
  return db.prepare(`INSERT INTO auramenu_publications
    (menu_id, revision, published_at, action, actor_type, actor_id, source_revision, content_json, presentation_json)
    SELECT r.id, r.revision, CASE WHEN ?='baseline' THEN COALESCE(r.updated_at,r.approved_at,?) ELSE ? END,
      ?, ?, ?, ?, json_object(${content}), COALESCE(d.presentation_json,'{}')
    FROM auramenu_requests r LEFT JOIN auramenu_design_settings d ON d.menu_id=r.id
    WHERE r.id=? AND r.revision=? AND ${livePublication}
    ${afterUpdate ? 'AND changes()=1' : ''}
    ON CONFLICT(menu_id, revision) DO NOTHING`)
    .bind(action, new Date().toISOString(), new Date().toISOString(), action, type, actor, source, id, revision);
}

export function revisionPresentation(db, id, version, json, liveOnly = false) {
  return db.prepare(`INSERT INTO auramenu_design_settings(menu_id,presentation_json)
    SELECT r.id, ? FROM auramenu_requests r WHERE r.id=? AND r.revision=?
    ${liveOnly ? 'AND ' + livePublication : ''}
    ON CONFLICT(menu_id) DO UPDATE SET presentation_json=excluded.presentation_json`).bind(json,id,version);
}

export function publicationSummary(row) {
  return {
    revision: row.revision, publishedAt: row.published_at, action: row.action,
    actorType: row.actor_type, actorId: row.actor_id, sourceRevision: row.source_revision,
  };
}
