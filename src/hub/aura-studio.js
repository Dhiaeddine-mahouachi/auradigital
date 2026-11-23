// Aura Studio — "Manage the work". The customer's operational workspace.
// Pipeline data is the workspace's own leads (src/hub-leads.js). Delivery,
// website and menu views read the existing service, request and menu-draft
// APIs. Channels and analytics that are not integrated say so plainly.
import { osCopy } from './os-copy.js';
import { icon, pill, emptyState, loading, relative, shortDate, parseDate, number, money, TONE, deliveryStage } from './os-ui.js';
import { dashCopy } from './dashboard-view.js';
import { serviceItems } from './aura-command.js';

// Minimal RFC 4180 CSV parser (quoted fields, escaped quotes, newlines in quotes).
function parseCsv(text) {
 const rows = []; let row = [], field = '', quoted = false;
 text = text.replace(/^\ufeff/, '');
 for (let i = 0; i < text.length; i++) {
  const ch = text[i];
  if (quoted) { if (ch === '"' && text[i + 1] === '"') { field += '"'; i++; } else if (ch === '"') quoted = false; else field += ch; }
  else if (ch === '"') quoted = true;
  else if (ch === ',' || ch === ';') { row.push(field); field = ''; }
  else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(field); rows.push(row); row = []; field = ''; }
  else field += ch;
 }
 if (field || row.length) { row.push(field); rows.push(row); }
 return rows.filter(r => r.some(x => x.trim()));
}
export const STUDIO_VIEWS = ['pipeline', 'delivery', 'website', 'menu', 'inbox', 'analytics'];
const TAB_ICON = { pipeline: 'studio', delivery: 'services', website: 'site', menu: 'menu', inbox: 'chat', analytics: 'analytics' };
let analyticsDays = 30;
let showArchived = false, filters = { q: '', source: '', person: '' };
// Filters sit behind a button on phones and are always shown on wider screens.
let filtersOpen = typeof matchMedia === 'function' ? matchMedia('(min-width: 701px)').matches : true;

export function renderAuraStudio(ctx) {
 const { host, lang, esc, link, view } = ctx;
 const c = osCopy(lang), s = c.studio;
 const current = STUDIO_VIEWS.includes(view) ? view : 'pipeline';
 const canWrite = ctx.workspace.permissions.includes('roadmap:write');
 host.innerHTML = `<div class="os-studio">
  <header class="os-studio-head"><div><p class="os-eyebrow">${esc(c.sections.studio)} · ${esc(c.sections.studioTag)}</p><h1>${esc(s.tabs[current])}</h1><p class="os-muted">${esc(s.intro)}</p></div></header>
  <label class="os-studio-select"><span class="sr-only">${esc(s.title)}</span><select data-studio-select>${STUDIO_VIEWS.map(v => `<option value="${esc(link('studio', { view: v }))}" ${v === current ? 'selected' : ''}>${esc(s.tabs[v])}</option>`).join('')}</select></label>
  <nav class="os-studio-tabs" aria-label="${esc(s.title)}">${STUDIO_VIEWS.map(v => `<a href="${esc(link('studio', { view: v }))}" ${v === current ? 'aria-current="page"' : ''} data-studio-tab="${v}">${icon(TAB_ICON[v], 16)}<span>${esc(s.tabs[v])}</span></a>`).join('')}</nav>
  ${canWrite ? '' : `<p class="os-notice">${icon('lock', 16)}<span>${esc(s.readOnly)}</span></p>`}
  <div class="os-studio-body" data-studio-body>${loading(c.state.loading, esc)}</div></div>`;
 host.querySelector('[data-studio-tab][aria-current]')?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
 host.querySelector('[data-studio-select]')?.addEventListener('change', e => { const a = Object.assign(document.createElement('a'), { href: e.target.value }); host.append(a); a.click(); a.remove(); });
 const body = host.querySelector('[data-studio-body]');
 const run = { pipeline, delivery, website, menu, inbox, analytics }[current];
 return run({ ...ctx, body, c, s, canWrite }).catch(error => {
  if (!body.isConnected) return;
  body.innerHTML = emptyState({ esc, iconName: 'alert', tone: 'bad', title: c.state.error, text: error.message, actions: `<button type="button" class="os-btn is-quiet is-sm" data-retry>${esc(c.state.retry)}</button>` });
  body.querySelector('[data-retry]').onclick = () => renderAuraStudio(ctx);
 });
}

// ----- Lead pipeline -------------------------------------------------------
async function pipeline(ctx) {
 const { body, c, s, esc, lang, api, endpoint, canWrite, query, link, toast, workspace } = ctx;
 const data = await api(endpoint('leads') + (showArchived ? '?archived=1' : ''));
 if (!body.isConnected) return;
 const { stages, assignees, sources } = data;
 let leads = data.leads;
 const people = new Map(assignees.map(p => [p.id, p.name]));
 const currency = workspace.profile?.currency || 'USD';
 const initials = name => String(name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
 const visible = () => leads.filter(l => (!filters.source || l.source === filters.source)
  && (!filters.person || (filters.person === '-' ? !l.assigneeId : l.assigneeId === filters.person))
  && (!filters.q || [l.name, l.contact, l.interest].join(' ').toLowerCase().includes(filters.q.toLowerCase())));
 const card = l => `<li class="os-lead" data-lead="${esc(l.id)}" ${canWrite && !showArchived ? 'draggable="true"' : ''}>
  <button type="button" class="os-lead-open" data-open="${esc(l.id)}"><strong>${esc(l.name)}</strong>${l.interest ? `<span>${esc(l.interest)}</span>` : ''}</button>
  <div class="os-lead-meta">${pill(s.sources[l.source] || l.source, '', esc)}${l.value !== null ? `<span class="os-lead-value">${esc(money(lang, l.value, currency))}</span>` : ''}
   ${l.followUpAt ? `<span class="os-followup ${Date.parse(l.followUpAt) < Date.now() - 86400000 ? 'is-late' : ''}" title="${esc(c.studio.lead.followUp)}">${icon('calendar', 13)}${esc(shortDate(lang, l.followUpAt))}</span>` : ''}
   ${l.notes ? `<span class="os-lead-notes" title="${esc(c.studio.lead.notes)}">${icon('note', 13)}${l.notes}</span>` : ''}
   ${l.assigneeId ? `<span class="os-avatar is-xs" title="${esc(people.get(l.assigneeId) || '')}">${esc(initials(people.get(l.assigneeId)))}</span>` : ''}</div>
  <div class="os-lead-foot"><time datetime="${esc(parseDate(l.updatedAt)?.toISOString() || '')}">${esc(relative(lang, l.updatedAt))}</time>
   ${canWrite && !showArchived ? `<label class="os-move"><span class="sr-only">${esc(s.pipeline.moveTo)} — ${esc(l.name)}</span><select data-move="${esc(l.id)}" aria-label="${esc(s.pipeline.moveTo)}: ${esc(l.name)}">${stages.map(st => `<option value="${esc(st.id)}" ${st.id === l.stage ? 'selected' : ''}>${esc(st.label)}</option>`).join('')}</select></label>` : ''}</div></li>`;
 const draw = () => {
  const list = visible();
  const board = showArchived
   ? (list.length ? `<ul class="os-lead-grid">${list.map(card).join('')}</ul>` : emptyState({ esc, iconName: 'archive', title: s.pipeline.none }))
   : !leads.length ? emptyState({ esc, iconName: 'chat', title: s.pipeline.empty, text: s.pipeline.emptyText, actions: canWrite ? `<button type="button" class="os-btn is-primary is-sm" data-new>${icon('plus', 16)}<span>${esc(s.pipeline.add)}</span></button>` : '' })
   : `<div class="os-board" role="list" aria-label="${esc(s.tabs.pipeline)}">${stages.map(st => {
     const items = list.filter(l => l.stage === st.id);
     const total = items.reduce((sum, l) => sum + (l.value || 0), 0);
     return `<section class="os-column" role="listitem" data-column="${esc(st.id)}" aria-labelledby="col-${esc(st.id)}"><header><h3 id="col-${esc(st.id)}">${esc(st.label)}</h3><span class="os-count">${items.length}</span>${total ? `<small>${esc(money(lang, total, currency))}</small>` : ''}</header>
      <ul class="os-column-list">${items.map(card).join('') || `<li class="os-column-empty">${esc(s.pipeline.stageEmpty)}</li>`}</ul></section>`;
    }).join('')}</div>`;
  body.innerHTML = `<div class="os-toolbar">
   <label class="os-search">${icon('search', 16)}<span class="sr-only">${esc(s.pipeline.search)}</span><input type="search" data-filter="q" value="${esc(filters.q)}" placeholder="${esc(s.pipeline.search)}" maxlength="80"></label>
   <details class="os-filters" ${filtersOpen ? 'open' : ''} data-filters><summary class="os-btn is-quiet is-sm">${icon('filter', 16)}<span>${esc(s.pipeline.filters)}</span>${filters.source || filters.person ? '<b class="os-dot is-on"></b>' : ''}</summary><div class="os-filters-body">
   <label><span class="sr-only">${esc(c.studio.lead.source)}</span><select data-filter="source"><option value="">${esc(s.pipeline.allSources)}</option>${sources.map(x => `<option value="${x}" ${filters.source === x ? 'selected' : ''}>${esc(s.sources[x] || x)}</option>`).join('')}</select></label>
   <label><span class="sr-only">${esc(c.studio.lead.assignee)}</span><select data-filter="person"><option value="">${esc(s.pipeline.allPeople)}</option><option value="-" ${filters.person === '-' ? 'selected' : ''}>${esc(s.pipeline.unassigned)}</option>${assignees.map(p => `<option value="${esc(p.id)}" ${filters.person === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></label>
   <button type="button" class="os-btn is-quiet is-sm" data-archived aria-pressed="${showArchived}">${icon('archive', 16)}<span>${esc(showArchived ? s.pipeline.hideArchived : s.pipeline.showArchived)}</span></button>
   ${canWrite && !showArchived ? `<button type="button" class="os-btn is-quiet is-sm" data-stages>${esc(s.pipeline.configure)}</button>` : ''}<button type="button" class="os-btn is-quiet is-sm" data-export>${icon('archive', 16)}<span>${esc(s.pipeline.exportCsv)}</span></button>${canWrite && !showArchived ? `<label class="os-btn is-quiet is-sm">${icon('plus', 16)}<span>${esc(s.pipeline.importCsv)}</span><input type="file" accept=".csv,text/csv" class="sr-only" data-import></label>` : ''}</div></details>
   <span class="os-toolbar-spacer"></span>
   <span class="os-muted os-toolbar-count" role="status">${esc(s.pipeline.count(list.length))}</span>
   ${canWrite && !showArchived ? `<button type="button" class="os-btn is-primary is-sm" data-new>${icon('plus', 16)}<span>${esc(s.pipeline.add)}</span></button>` : ''}
  </div>${leads.length && !list.length && !showArchived ? emptyState({ esc, iconName: 'filter', title: s.pipeline.none }) : board}<dialog class="os-dialog" data-dialog></dialog>`;
  bind();
 };
 const refresh = async () => { const next = await api(endpoint('leads') + (showArchived ? '?archived=1' : '')); leads = next.leads; if (body.isConnected) draw(); };
 const patch = async (lead, changes) => {
  try { const { lead: saved } = await api(endpoint('leads/' + lead.id), 'PATCH', { version: lead.version, ...changes }); leads = leads.map(l => l.id === saved.id ? saved : l).filter(l => l.archived === showArchived); return saved; }
  catch (error) { toast(error.message); if (error.status === 409) await refresh(); throw error; }
 };
 function bind() {
  body.querySelectorAll('[data-filter]').forEach(input => input.addEventListener(input.tagName === 'INPUT' ? 'input' : 'change', () => {
   filters[input.dataset.filter] = input.value;
   const focus = input.dataset.filter, pos = input.selectionStart;
   draw();
   const again = body.querySelector(`[data-filter="${focus}"]`); again?.focus(); if (again?.setSelectionRange && pos !== undefined) again.setSelectionRange(pos, pos);
  }));
  body.querySelector('[data-filters]')?.addEventListener('toggle', e => { filtersOpen = e.currentTarget.open; });
  body.querySelector('[data-export]')?.addEventListener('click', () => {
   const cell = v => { const t = String(v ?? ''); return /[",\n]/.test(t) || /^[=+\-@]/.test(t) ? '"' + (/^[=+\-@]/.test(t) ? "'" : '') + t.replace(/"/g, '""') + '"' : t; };
   const head = ['name', 'contact', 'source', 'interest', 'value', 'stage', 'assignee', 'followUpAt', 'lastContactedAt', 'createdAt', 'updatedAt'];
   const rows = visible().map(l => [l.name, l.contact, l.source, l.interest, l.value, stages.find(x => x.id === l.stage)?.label || l.stage, people.get(l.assigneeId) || '', l.followUpAt, l.lastContactedAt, l.createdAt, l.updatedAt]);
   const blob = new Blob(['\ufeff' + [head, ...rows].map(r => r.map(cell).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
   const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'aura-studio-leads.csv' });
   a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  body.querySelector('[data-import]')?.addEventListener('change', async e => {
   const file = e.target.files[0]; if (!file) return;
   if (file.size > 200000) { toast(s.pipeline.importTooBig); return; }
   const rows = parseCsv(await file.text());
   const header = rows.shift()?.map(h => h.trim().toLowerCase()) || [];
   const col = name => header.findIndex(h => h === name || (name === 'name' && h === 'ad'));
   if (col('name') < 0) { toast(s.pipeline.importNeedsName); return; }
   let added = 0, failed = 0;
   for (const r of rows.slice(0, 200)) {
    const v = name => col(name) >= 0 ? String(r[col(name)] || '').trim() : '';
    if (v('name').length < 2) continue;
    const source = sources.includes(v('source')) ? v('source') : 'other';
    try { const { lead } = await api(endpoint('leads'), 'POST', { name: v('name').slice(0, 120), contact: v('contact').slice(0, 200), interest: v('interest').slice(0, 160), source }); leads = [lead, ...leads]; added++; }
    catch { failed++; }
   }
   toast(s.pipeline.imported(added, failed)); draw();
  });
  body.querySelector('[data-archived]')?.addEventListener('click', async () => { showArchived = !showArchived; body.innerHTML = loading(c.state.loading, esc); await refresh(); });
  body.querySelectorAll('[data-new]').forEach(b => b.addEventListener('click', () => openForm()));
  body.querySelector('[data-stages]')?.addEventListener('click', openStages);
  body.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => openLead(b.dataset.open)));
  body.querySelectorAll('[data-move]').forEach(sel => sel.addEventListener('change', async () => {
   const lead = leads.find(l => l.id === sel.dataset.move);
   sel.disabled = true;
   try { await patch(lead, { stage: sel.value }); draw(); body.querySelector(`[data-move="${lead.id}"]`)?.focus(); } catch { sel.disabled = false; sel.value = lead.stage; }
  }));
  // Pointer drag-and-drop; the "Move to" select is the keyboard/touch path.
  let dragged = null;
  body.querySelectorAll('.os-lead[draggable]').forEach(el => {
   el.addEventListener('dragstart', e => { dragged = el.dataset.lead; el.classList.add('is-dragging'); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragged); });
   el.addEventListener('dragend', () => { el.classList.remove('is-dragging'); body.querySelectorAll('.is-drop').forEach(x => x.classList.remove('is-drop')); });
  });
  body.querySelectorAll('[data-column]').forEach(col => {
   col.addEventListener('dragover', e => { if (!dragged) return; e.preventDefault(); col.classList.add('is-drop'); });
   col.addEventListener('dragleave', () => col.classList.remove('is-drop'));
   col.addEventListener('drop', async e => {
    e.preventDefault(); col.classList.remove('is-drop');
    const lead = leads.find(l => l.id === dragged); dragged = null;
    if (!lead || lead.stage === col.dataset.column) return;
    try { await patch(lead, { stage: col.dataset.column }); draw(); } catch {}
   });
  });
 }
 const dialog = () => body.querySelector('[data-dialog]');
 const field = (name, label, value = '', attrs = '') => `<label class="os-field"><span>${esc(label)}</span><input name="${name}" value="${esc(value)}" ${attrs}></label>`;
 const formFields = (l = {}) => `${field('name', c.studio.lead.name, l.name, 'required minlength="2" maxlength="120" autocomplete="off"')}
  ${field('contact', c.studio.lead.contact, l.contact, 'maxlength="200" autocomplete="off"')}
  <div class="os-field-row"><label class="os-field"><span>${esc(c.studio.lead.source)}</span><select name="source">${sources.map(x => `<option value="${x}" ${(l.source || 'other') === x ? 'selected' : ''}>${esc(s.sources[x])}</option>`).join('')}</select></label>
  <label class="os-field"><span>${esc(c.studio.lead.stage)}</span><select name="stage">${stages.map(st => `<option value="${esc(st.id)}" ${(l.stage || stages[0].id) === st.id ? 'selected' : ''}>${esc(st.label)}</option>`).join('')}</select></label></div>
  ${field('interest', c.studio.lead.interest, l.interest, 'maxlength="160"')}
  <div class="os-field-row">${field('value', `${c.studio.lead.value} (${currency})`, l.value ?? '', 'type="number" min="0" step="any" inputmode="decimal"')}
  <div class="os-field-row">${field('followUpAt', c.studio.lead.followUp, l.followUpAt || '', 'type="date"')}${field('lastContactedAt', c.studio.lead.lastContact, l.lastContactedAt || '', 'type="date"')}</div>
  <label class="os-field"><span>${esc(c.studio.lead.assignee)}</span><select name="assigneeId"><option value="">${esc(s.pipeline.unassigned)}</option>${assignees.map(p => `<option value="${esc(p.id)}" ${l.assigneeId === p.id ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></label></div>`;
 const formValues = form => { const f = new FormData(form); return { name: f.get('name'), contact: f.get('contact'), source: f.get('source'), stage: f.get('stage'), interest: f.get('interest'), value: f.get('value') === '' ? null : Number(f.get('value')), assigneeId: f.get('assigneeId') || null, followUpAt: f.get('followUpAt') || null, lastContactedAt: f.get('lastContactedAt') || null }; };
 function openForm() {
  const d = dialog();
  d.innerHTML = `<form method="dialog" class="os-dialog-body" data-create><header><h2>${esc(s.pipeline.add)}</h2><button type="button" class="os-icon-btn" data-close aria-label="${esc(c.studio.lead.close)}">${icon('close')}</button></header>
   ${formFields()}<label class="os-field"><span>${esc(c.studio.lead.note)}</span><textarea name="note" rows="3" maxlength="2000"></textarea></label>
   <p class="os-error" role="alert"></p><footer><button type="button" class="os-btn is-quiet" data-close>${esc(c.studio.lead.cancel)}</button><button class="os-btn is-primary" value="save">${esc(c.studio.lead.create)}</button></footer></form>`;
  d.showModal(); d.querySelector('[name=name]').focus();
  d.querySelectorAll('[data-close]').forEach(b => b.onclick = () => d.close());
  d.querySelector('[data-create]').onsubmit = async e => {
   e.preventDefault();
   const form = e.currentTarget, submit = form.querySelector('[value=save]'), error = form.querySelector('[role=alert]');
   if (!form.reportValidity()) return;
   submit.disabled = true; error.textContent = '';
   try { const { lead } = await api(endpoint('leads'), 'POST', { ...formValues(form), note: new FormData(form).get('note') }); leads = [lead, ...leads]; d.close(); toast(c.studio.lead.saved); draw(); }
   catch (err) { error.textContent = err.message; submit.disabled = false; }
  };
 }
 async function openLead(id) {
  const d = dialog();
  d.innerHTML = `<div class="os-dialog-body">${loading(c.state.loading, esc)}</div>`;
  if (!d.open) d.showModal();
  let detail;
  try { detail = await api(endpoint('leads/' + id)); } catch (err) { d.innerHTML = `<div class="os-dialog-body">${emptyState({ esc, iconName: 'alert', tone: 'bad', title: err.message })}<footer><button type="button" class="os-btn is-quiet" data-close>${esc(c.studio.lead.close)}</button></footer></div>`; d.querySelector('[data-close]').onclick = () => d.close(); return; }
  const l = detail.lead;
  history.replaceState(null, '', link('studio', { view: 'pipeline', lead: l.id }));
  d.innerHTML = `<div class="os-dialog-body"><header><div><h2>${esc(l.name)}</h2><p class="os-muted">${esc(c.studio.lead.created)} ${esc(shortDate(lang, l.createdAt))} · ${esc(c.studio.lead.updated)} ${esc(relative(lang, l.updatedAt))}</p></div><button type="button" class="os-icon-btn" data-close aria-label="${esc(c.studio.lead.close)}">${icon('close')}</button></header>
   ${canWrite && !l.archived ? `<form data-edit>${formFields(l)}<p class="os-error" role="alert"></p><footer><button class="os-btn is-primary is-sm">${esc(c.studio.lead.save)}</button></footer></form>`
    : `<dl class="os-lead-facts">${[[c.studio.lead.contact, l.contact], [c.studio.lead.source, s.sources[l.source]], [c.studio.lead.stage, stages.find(x => x.id === l.stage)?.label || l.stage], [c.studio.lead.interest, l.interest], [c.studio.lead.value, l.value !== null ? money(lang, l.value, currency) : ''], [c.studio.lead.assignee, people.get(l.assigneeId) || s.pipeline.unassigned]].filter(([, v]) => v).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>`}
   <section class="os-notes"><h3>${esc(c.studio.lead.notes)}</h3>
    ${canWrite && !l.archived ? `<form data-note class="os-note-form"><label class="sr-only" for="os-note">${esc(c.studio.lead.addNote)}</label><textarea id="os-note" name="note" rows="2" maxlength="2000" required placeholder="${esc(c.studio.lead.addNote)}"></textarea><button class="os-btn is-quiet is-sm">${esc(c.studio.lead.addNote)}</button></form>` : ''}
    ${detail.notes.length ? `<ol>${detail.notes.map(n => `<li><p>${esc(n.body)}</p><small>${esc(n.author || '')} · ${esc(relative(lang, n.createdAt))}</small></li>`).join('')}</ol>` : `<p class="os-muted">${esc(c.studio.lead.noNotes)}</p>`}</section>
   ${detail.history?.length ? `<details class="os-lead-history"><summary>${esc(c.studio.lead.history)}</summary><ol>${detail.history.map(h => `<li><strong>${esc(c.studio.lead.actions[h.action] || h.action)}</strong><small>${esc(h.actor || '')} · ${esc(relative(lang, h.at))}</small></li>`).join('')}</ol></details>` : ''}
   ${canWrite ? `<footer class="os-dialog-foot"><button type="button" class="os-btn is-quiet is-sm" data-archive>${icon('archive', 16)}<span>${esc(l.archived ? s.pipeline.restore : s.pipeline.archive)}</span></button></footer>` : ''}</div>`;
  const close = () => { d.close(); };
  d.onclose = () => { if (new URLSearchParams(location.search).get('lead')) history.replaceState(null, '', link('studio', { view: 'pipeline' })); };
  d.querySelector('[data-close]').onclick = close;
  d.querySelector('[data-edit]')?.addEventListener('submit', async e => {
   e.preventDefault();
   const form = e.currentTarget, error = form.querySelector('[role=alert]'), submit = form.querySelector('button');
   if (!form.reportValidity()) return;
   submit.disabled = true; error.textContent = '';
   try { await patch(l, formValues(form)); toast(c.studio.lead.saved); close(); draw(); } catch (err) { error.textContent = err.message; submit.disabled = false; }
  });
  d.querySelector('[data-note]')?.addEventListener('submit', async e => {
   e.preventDefault();
   const note = new FormData(e.currentTarget).get('note').trim(); if (!note) return;
   e.currentTarget.querySelector('button').disabled = true;
   try { await patch(l, { note }); draw(); await openLead(l.id); } catch { e.currentTarget.querySelector('button').disabled = false; }
  });
  d.querySelector('[data-archive]')?.addEventListener('click', async () => {
   if (!l.archived && !confirm(s.pipeline.confirmArchive)) return;
   try { await patch(l, { archived: !l.archived }); close(); draw(); } catch {}
  });
 }
 function openStages() {
  const d = dialog();
  let list = stages.map(x => ({ ...x }));
  const paint = () => {
   d.innerHTML = `<form class="os-dialog-body" data-stage-form><header><div><h2>${esc(s.stagesEditor.title)}</h2><p class="os-muted">${esc(s.stagesEditor.hint)}</p></div><button type="button" class="os-icon-btn" data-close aria-label="${esc(c.studio.lead.close)}">${icon('close')}</button></header>
    <ol class="os-stage-editor">${list.map((x, i) => `<li><label class="os-field"><span class="sr-only">${esc(s.stagesEditor.name)} ${i + 1}</span><input name="label" data-i="${i}" value="${esc(x.label)}" required maxlength="40"></label>${list.length > 2 ? `<button type="button" class="os-btn is-quiet is-sm" data-remove="${i}">${esc(s.stagesEditor.remove)}</button>` : ''}</li>`).join('')}</ol>
    ${list.length < 8 ? `<button type="button" class="os-btn is-quiet is-sm" data-add>${icon('plus', 16)}<span>${esc(s.stagesEditor.add)}</span></button>` : ''}
    <p class="os-error" role="alert"></p><footer><button type="button" class="os-btn is-quiet" data-close>${esc(c.studio.lead.cancel)}</button><button class="os-btn is-primary">${esc(s.stagesEditor.save)}</button></footer></form>`;
   d.querySelectorAll('[data-close]').forEach(b => b.onclick = () => d.close());
   d.querySelectorAll('[data-i]').forEach(input => input.oninput = () => { list[Number(input.dataset.i)].label = input.value; });
   d.querySelectorAll('[data-remove]').forEach(b => b.onclick = () => { list.splice(Number(b.dataset.remove), 1); paint(); });
   d.querySelector('[data-add]')?.addEventListener('click', () => { let n = list.length + 1; while (list.some(x => x.id === 'stage_' + n)) n++; list.push({ id: 'stage_' + n, label: '' }); paint(); d.querySelector('[data-i]:last-of-type')?.focus(); d.querySelectorAll('[data-i]')[list.length - 1]?.focus(); });
   d.querySelector('[data-stage-form]').onsubmit = async e => {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;
    const error = d.querySelector('[role=alert]');
    try { await api(endpoint('lead-stages'), 'PUT', { version: data.stagesVersion, stages: list }); d.close(); toast(c.studio.lead.saved); await pipeline(ctx); }
    catch (err) { error.textContent = err.message; }
   };
  };
  paint(); if (!d.open) d.showModal();
 }
 draw();
 if (query.get('new') === '1' && canWrite) { history.replaceState(null, '', link('studio', { view: 'pipeline' })); openForm(); }
 else if (query.get('lead')) openLead(query.get('lead'));
}

// ----- Services & delivery -------------------------------------------------
async function delivery(ctx) {
 const { body, s, esc, lang, link, requestLink, canWrite, loadSnapshot, loadConnected } = ctx;
 const [snapshot, connected] = await Promise.all([loadSnapshot(), loadConnected()]);
 if (!body.isConnected) return;
 const d = dashCopy(lang), c = osCopy(lang);
 const items = serviceItems({ snapshot, connected, link, lang });
 const active = items.filter(i => !i.terminal), done = items.filter(i => i.terminal);
 const now = Date.now();
 const deadlines = active.filter(i => parseDate(i.due)).sort((a, b) => parseDate(a.due) - parseDate(b.due));
 const approvals = snapshot.attention || [];
 const revisions = (snapshot.requests || []).filter(r => /revision/.test(String(r.productionStatus || r.status)));
 const row = i => `<li class="os-row"><span class="os-row-icon">${icon(i.kind === 'subscription' ? 'clock' : 'services', 16)}</span><span class="os-row-main"><strong>${esc(i.title)}</strong><small>${esc([d.kinds[i.kind] || '', c.services.stages[i.stage]].filter(Boolean).join(' · '))}</small></span>
  ${pill(d.status[i.status] || String(i.status || '').replace(/[_-]/g, ' '), TONE[i.status] || '', esc)}<a class="os-link" href="${esc(i.href)}">${esc(s.delivery.open)}</a></li>`;
 const block = (title, content, count) => `<section class="os-card"><header class="os-card-head"><div><h2>${esc(title)}</h2></div>${count !== undefined ? `<span class="os-count">${count}</span>` : ''}</header>${content}</section>`;
 body.innerHTML = `<div class="os-split">
  <div class="os-col">
   ${block(s.delivery.approvals, approvals.length ? `<ul class="os-rows">${approvals.map(a => `<li class="os-row is-attention"><span class="os-row-icon">${icon('alert', 16)}</span><span class="os-row-main"><strong>${esc(a.name)}</strong><small>${esc(a.kind === 'menu' ? s.delivery.reviewMenu : d.status[a.status] || a.status)}</small></span><a class="os-btn is-primary is-sm" href="${esc(a.kind === 'menu' ? link('menuDrafts', { draft: a.id }) : link('requests', { request: a.id }))}">${esc(a.kind === 'menu' ? s.delivery.reviewMenu : s.delivery.open)}</a></li>`).join('')}</ul>` : `<p class="os-muted">${esc(s.delivery.none)}</p>`, approvals.length)}
   ${block(s.delivery.active, active.length ? `<ul class="os-rows">${active.map(row).join('')}</ul>` : `<p class="os-muted">${esc(s.delivery.none)}</p>`, active.length)}
   ${block(s.delivery.completed, done.length ? `<ul class="os-rows">${done.map(row).join('')}</ul>` : `<p class="os-muted">${esc(s.delivery.none)}</p>`, done.length)}
  </div>
  <aside class="os-col">
   ${block(s.delivery.deadlines, deadlines.length ? `<ul class="os-deadlines">${deadlines.map(i => { const late = parseDate(i.due).getTime() < now; return `<li class="${late ? 'is-late' : ''}"><time datetime="${esc(parseDate(i.due).toISOString())}"><b>${esc(parseDate(i.due).toLocaleDateString(lang, { day: 'numeric' }))}</b>${esc(parseDate(i.due).toLocaleDateString(lang, { month: 'short' }))}</time><span><strong>${esc(i.title)}</strong>${late ? `<small class="os-bad">${esc(s.delivery.overdue)}</small>` : `<small>${esc(relative(lang, i.due))}</small>`}</span></li>`; }).join('')}</ul>` : `<p class="os-muted">${esc(s.delivery.none)}</p>`)}
   ${block(s.delivery.revisions, revisions.length ? `<ul class="os-rows">${revisions.map(r => `<li class="os-row"><span class="os-row-main"><strong>${esc(r.name)}</strong></span><a class="os-link" href="${esc(link('requests', { request: r.id }))}">${esc(s.delivery.open)}</a></li>`).join('')}</ul>` : `<p class="os-muted">${esc(s.delivery.revisionsNone)}</p>`)}
   ${block(s.delivery.messages, `<p class="os-muted">${esc(s.delivery.messagesNone)}</p><div class="os-inline-actions"><a class="os-btn is-quiet is-sm" href="${esc(link('requests'))}">${esc(c.nav.requests)}</a>${canWrite ? `<a class="os-btn is-primary is-sm" href="${esc(requestLink())}">${esc(s.delivery.requestChange)}</a>` : ''}</div>`)}
  </aside></div>`;
}

// ----- Website management --------------------------------------------------
async function website(ctx) {
 const { body, s, esc, lang, link, requestLink, canWrite, workspace, loadConnected, loadSnapshot } = ctx;
 const [connected, snapshot] = await Promise.all([loadConnected(), loadSnapshot()]);
 if (!body.isConnected) return;
 const w = s.website, d = dashCopy(lang);
 let url = null;
 try { if (workspace.profile?.website) url = new URL(/^https?:\/\//i.test(workspace.profile.website) ? workspace.profile.website : 'https://' + workspace.profile.website); } catch {}
 const sites = (connected?.requests || []).filter(r => r.kind === 'quicksite');
 const siteServices = serviceItems({ snapshot, connected, link, lang }).filter(i => /web|site|hosting|domain/i.test(i.title || '') && i.kind !== 'quicksite');
 if (!url && !sites.length && !siteServices.length) {
  body.innerHTML = emptyState({ esc, iconName: 'site', title: w.none, text: w.noneText, actions: [
   workspace.permissions.includes('profile:write') ? `<a class="os-btn is-quiet is-sm" href="${esc(link('profile'))}">${esc(w.addSite)}</a>` : '',
   canWrite ? `<a class="os-btn is-primary is-sm" href="${esc(requestLink('Web Design'))}">${esc(w.build)}</a>` : ''].join('') }) + `<p class="os-source">${esc(w.notOwned)}</p>`;
  return;
 }
 const published = sites.some(r => r.status === 'approved') || Boolean(url);
 const building = sites.some(r => r.status === 'pending') || siteServices.some(i => i.stage < 3 && !i.terminal);
 body.innerHTML = `<div class="os-split">
  <section class="os-card os-site">
   <div class="os-browser" aria-hidden="true"><span></span><span></span><span></span><b>${esc(url ? url.host : sites[0]?.slug || w.title)}</b></div>
   <div class="os-site-body"><span class="os-site-mark">${icon('globe', 28)}</span><div><h2>${esc(url ? url.host : sites[0]?.name || w.title)}</h2>
    <p>${pill(published ? w.published : building ? w.inProgress : w.unknown, published ? 'good' : building ? 'info' : '', esc)}</p></div>
    ${url ? `<a class="os-btn is-primary is-sm" href="${esc(url.href)}" target="_blank" rel="noopener noreferrer">${esc(w.preview)} ${icon('external', 14)}</a>` : ''}</div>
   <dl class="os-facts">
    <div><dt>${esc(w.domain)}</dt><dd>${esc(url ? url.host : sites[0]?.slug || '—')}</dd></div>
    <div><dt>${esc(w.secure)}</dt><dd>${url ? (url.protocol === 'https:' ? '✓' : '—') : '—'}</dd></div>
    <div><dt>${esc(w.status)}</dt><dd>${esc(published ? w.published : building ? w.inProgress : w.unknown)}</dd></div>
   </dl>
   ${[...sites.map(r => ({ title: r.name, meta: d.kinds.quicksite + (r.slug ? ' · ' + r.slug : ''), status: r.status, at: r.updatedAt })), ...siteServices.map(i => ({ title: i.title, meta: d.kinds[i.kind] || '', status: i.status, at: i.at }))].map(r => `<div class="os-row"><span class="os-row-main"><strong>${esc(r.title)}</strong><small>${esc(r.meta)} · ${esc(relative(lang, r.at))}</small></span>${pill(d.status[r.status] || r.status, TONE[r.status] || '', esc)}</div>`).join('')}
  </section>
  <aside class="os-card"><header class="os-card-head"><div><h2>${esc(w.actions)}</h2></div></header>
   ${canWrite ? `<ul class="os-action-list">
    <li><a href="${esc(requestLink('Website Care'))}">${icon('note', 16)}<span>${esc(w.change)}</span>${icon('arrow', 14)}</a></li>
    <li><a href="${esc(requestLink('Web Design'))}">${icon('plus', 16)}<span>${esc(w.newPage)}</span>${icon('arrow', 14)}</a></li>
    <li><a href="${esc(requestLink('SEO / Google Maps'))}">${icon('search', 16)}<span>${esc(w.seo)}</span>${icon('arrow', 14)}</a></li></ul>` : `<p class="os-muted">${esc(s.readOnly)}</p>`}
   <p class="os-source">${esc(w.notOwned)}</p></aside></div>`;
}

// ----- AuraMenu ------------------------------------------------------------
async function menu(ctx) {
 const { body, s, esc, lang, link, requestLink, canWrite, workspace, api, endpoint, loadConnected } = ctx;
 const [connected, drafts] = await Promise.all([loadConnected(), api(endpoint('menu-drafts')).then(r => r.drafts || []).catch(e => { if (e.status === 503 || e.status === 404) return null; throw e; })]);
 if (!body.isConnected) return;
 const m = s.menu, d = dashCopy(lang);
 const menus = (connected?.requests || []).filter(r => r.kind === 'auramenu');
 const list = (drafts || []).filter(x => x.state !== 'archived');
 const restaurant = workspace.profile?.industry === 'restaurant';
 if (!menus.length && !list.length) {
  body.innerHTML = emptyState({ esc, iconName: 'menu', title: m.none, text: restaurant ? m.noneText : m.notRestaurant, actions: [
   drafts !== null && canWrite ? `<a class="os-btn is-quiet is-sm" href="${esc(link('menuDrafts'))}">${esc(m.start)}</a>` : '',
   canWrite ? `<a class="os-btn is-primary is-sm" href="${esc(requestLink('AuraMenu'))}">${esc(m.request)}</a>` : ''].join('') });
  return;
 }
 body.innerHTML = `<div class="os-split">
  <section class="os-card"><header class="os-card-head"><div><h2>${esc(m.live)}</h2></div><span class="os-count">${menus.length}</span></header>
   ${menus.length ? `<ul class="os-rows">${menus.map(r => `<li class="os-row"><span class="os-row-icon">${icon('menu', 16)}</span><span class="os-row-main"><strong>${esc(r.name)}</strong><small>${esc(r.slug || d.kinds.auramenu)} · ${esc(relative(lang, r.updatedAt || r.createdAt))}</small></span>${pill(d.status[r.status] || r.status, TONE[r.status] || '', esc)}${r.payment === 'unpaid' ? pill(d.status.unpaid, 'warn', esc) : ''}</li>`).join('')}</ul>` : `<p class="os-muted">${esc(s.delivery.none)}</p>`}
  </section>
  <section class="os-card"><header class="os-card-head"><div><h2>${esc(m.drafts)}</h2></div>${drafts !== null ? `<a class="os-link" href="${esc(link('menuDrafts'))}">${esc(m.open)}</a>` : ''}</header>
   ${list.length ? `<ul class="os-rows">${list.map(x => `<li class="os-row"><span class="os-row-icon">${icon('menuDrafts', 16)}</span><span class="os-row-main"><strong>${esc(x.draft?.fields?.businessName || x.name || 'AuraMenu')}</strong><small>${esc(x.state)}</small></span><a class="os-link" href="${esc(link('menuDrafts', { draft: x.id }))}">${esc(m.manage)}</a></li>`).join('')}</ul>` : `<p class="os-muted">${esc(s.delivery.none)}</p>`}
  </section></div>`;
}

// ----- Inbox ---------------------------------------------------------------
async function inbox(ctx) {
 const { body, s, esc, lang, link, api, endpoint, loadSnapshot, onAsk, workspace } = ctx;
 const [snapshot, leads] = await Promise.all([loadSnapshot(), api(endpoint('leads')).then(r => r.leads).catch(() => [])]);
 if (!body.isConnected) return;
 const i = s.inbox;
 // No messaging channel is integrated with AuraHub today; each is listed as
 // not connected rather than simulated.
 const channels = [['whatsapp', 'WhatsApp'], ['instagram', 'Instagram'], ['mail', 'Email'], ['globe', s.sources.website]];
 const recent = leads.filter(l => l.notes > 0).slice(0, 8);
 body.innerHTML = `<p class="os-muted os-lead-in">${esc(i.lead)}</p><div class="os-split">
  <div class="os-col">
   <section class="os-card"><header class="os-card-head"><div><h2>${esc(i.teamRequests)}</h2></div></header>
    ${(snapshot.requests || []).length ? `<ul class="os-rows">${snapshot.requests.slice(0, 10).map(r => `<li class="os-row"><span class="os-row-icon">${icon('requests', 16)}</span><span class="os-row-main"><strong>${esc(r.name)}</strong><small>${esc(relative(lang, r.createdAt))}</small></span><a class="os-link" href="${esc(link('requests', { request: r.id }))}">${esc(s.delivery.open)}</a></li>`).join('')}</ul>` : `<p class="os-muted">${esc(i.empty)}</p>`}
   </section>
   <section class="os-card"><header class="os-card-head"><div><h2>${esc(i.fromPipeline)}</h2></div></header>
    ${recent.length ? `<ul class="os-rows">${recent.map(l => `<li class="os-row"><span class="os-row-icon">${icon('note', 16)}</span><span class="os-row-main"><strong>${esc(l.name)}</strong><small>${esc(s.sources[l.source])} · ${esc(relative(lang, l.updatedAt))}</small></span><a class="os-link" href="${esc(link('studio', { view: 'pipeline', lead: l.id }))}">${esc(s.delivery.open)}</a></li>`).join('')}</ul>` : `<p class="os-muted">${esc(i.empty)}</p>`}
   </section>
  </div>
  <aside class="os-col">
   <section class="os-card"><header class="os-card-head"><div><h2>${esc(i.channels)}</h2></div></header>
    <ul class="os-channels">${channels.map(([ic, name]) => `<li><span class="os-row-icon">${icon(ic, 16)}</span><span class="os-row-main"><strong>${esc(name)}</strong><small>${esc(i.connectHint)}</small></span>${pill(i.notConnected, '', esc)}</li>`).join('')}</ul>
   </section>
   ${workspace.permissions.includes('auri:use') ? `<section class="os-card"><header class="os-card-head"><div><h2>${esc(i.auri)}</h2></div></header><button type="button" class="os-btn is-quiet is-sm" data-inbox-auri>${icon('auri', 16)}<span>${esc(osCopy(lang).auri.more)}</span></button></section>` : ''}
  </aside></div>`;
 body.querySelector('[data-inbox-auri]')?.addEventListener('click', () => onAsk(null));
}

// ----- Analytics -----------------------------------------------------------
async function analytics(ctx) {
 const { body, s, esc, lang, link, api, endpoint, workspace, loadSnapshot, loadConnected } = ctx;
 const [active, archived, snapshot, connected] = await Promise.all([
  api(endpoint('leads')), api(endpoint('leads') + '?archived=1').catch(() => ({ leads: [] })), loadSnapshot(), loadConnected()]);
 if (!body.isConnected) return;
 const a = s.analytics, c = osCopy(lang);
 const days = analyticsDays, rangeText = a.rangeDays(days);
 const since = Date.now() - days * 86400000;
 const all = [...active.leads, ...archived.leads];
 const recent = all.filter(l => parseDate(l.createdAt)?.getTime() >= since);
 const wonStage = active.stages.find(x => x.id === 'won')?.id || active.stages.at(-1).id;
 const won = recent.filter(l => l.stage === wonStage).length;
 const bySource = Object.entries(recent.reduce((m, l) => (m[l.source] = (m[l.source] || 0) + 1, m), {})).sort((x, y) => y[1] - x[1]);
 const openByStage = active.stages.map(st => [st.label, active.leads.filter(l => l.stage === st.id).length]);
 const missions = workspace.missions || [];
 const doneMissions = missions.filter(m => m.status === 'done').length;
 const items = serviceItems({ snapshot, connected, link, lang });
 const bars = (rows, total) => `<ul class="os-bars">${rows.map(([label, n]) => `<li><span>${esc(label)}</span><span class="os-bar"><i style="width:${total ? Math.round(n / total * 100) : 0}%"></i></span><b>${number(lang, n)}</b></li>`).join('')}</ul>`;
 const stat = (label, value, source) => `<div class="os-stat"><dt>${esc(label)}</dt><dd>${esc(value)}</dd><small>${esc(source)}</small></div>`;
 body.innerHTML = `<div class="os-analytics-bar"><p class="os-muted os-lead-in">${esc(a.lead)}</p><div class="os-segment" role="group" aria-label="${esc(rangeText)}">${[7, 30, 90].map(d => `<button type="button" data-days="${d}" aria-pressed="${d === days}">${esc(a.rangeShort(d))}</button>`).join('')}</div><button type="button" class="os-btn is-quiet is-sm" data-analytics-export>${icon('archive', 16)}<span>${esc(s.pipeline.exportCsv)}</span></button></div>
  <dl class="os-stats">
   ${stat(c.kpi.inquiries, number(lang, recent.length), rangeText)}
   ${stat(a.conversion, recent.length ? Math.round(won / recent.length * 100) + '%' : '—', rangeText)}
   ${stat(a.roadmap, missions.length ? Math.round(doneMissions / missions.length * 100) + '%' : '—', `${doneMissions}/${missions.length}`)}
   ${stat(a.services, number(lang, items.filter(i => !i.terminal).length), c.kpi.live)}
  </dl>
  <div class="os-split">
   <section class="os-card"><header class="os-card-head"><div><h2>${esc(a.bySource)}</h2><p>${esc(rangeText)}</p></div></header>
    ${recent.length ? bars(bySource.map(([k, n]) => [s.sources[k] || k, n]), recent.length) : emptyState({ esc, iconName: 'chat', title: a.noLeads, actions: `<a class="os-btn is-quiet is-sm" href="${esc(link('studio', { view: 'pipeline' }))}">${esc(s.tabs.pipeline)}</a>` })}
    <p class="os-source">${esc(a.srcLeads)}</p></section>
   <section class="os-card"><header class="os-card-head"><div><h2>${esc(a.byStage)}</h2></div></header>
    ${active.leads.length ? bars(openByStage, active.leads.length) : `<p class="os-muted">${esc(a.noLeads)}</p>`}
    <p class="os-source">${esc(a.srcLeads)}</p></section>
   <section class="os-card"><header class="os-card-head"><div><h2>${esc(a.site)}</h2></div>${pill(c.kpi.notConnected, '', esc)}</header>
    ${emptyState({ esc, iconName: 'plug', title: c.kpi.notConnected, text: a.siteNone })}<p class="os-source">${esc(c.kpi.srcNone)}</p></section>
   <section class="os-card"><header class="os-card-head"><div><h2>${esc(a.roadmap)}</h2></div></header>
    ${bars(c.journey.stages.map((name, i) => { const list = missions.filter(m => Math.max(1, Math.min(5, Number(m.level) || 1)) === i + 1); return [name, list.filter(m => m.status === 'done').length, list.length]; }).map(([n, d, t]) => [`${n} (${d}/${t})`, d]), Math.max(1, ...c.journey.stages.map((_, i) => missions.filter(m => Math.max(1, Math.min(5, Number(m.level) || 1)) === i + 1).length)))}
    <p class="os-source">${esc(a.srcRoadmap)}</p></section>
   <section class="os-card"><header class="os-card-head"><div><h2>${esc(a.simulator)}</h2><p>${esc(a.simulatorNote)}</p></div></header><a class="os-btn is-quiet is-sm" href="${esc(link('simulator'))}">${icon('analytics', 16)}<span>${esc(a.simulator)}</span></a></section>
  </div>`;
 body.querySelectorAll('[data-days]').forEach(b => b.addEventListener('click', () => { analyticsDays = Number(b.dataset.days); analytics(ctx); }));
 body.querySelector('[data-analytics-export]')?.addEventListener('click', () => {
  const rows = [['metric', 'value', 'range'], [c.kpi.inquiries, recent.length, rangeText], [a.conversion, recent.length ? Math.round(won / recent.length * 100) + '%' : '', rangeText],
   ...bySource.map(([k, n]) => [a.bySource + ': ' + (s.sources[k] || k), n, rangeText]), ...openByStage.map(([k, n]) => [a.byStage + ': ' + k, n, 'now']),
   [a.roadmap, missions.length ? Math.round(doneMissions / missions.length * 100) + '%' : '', 'now']];
  const blob = new Blob(['\ufeff' + rows.map(r => r.map(v => /[",\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : v).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
  const link = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `aura-studio-analytics-${days}d.csv` });
  link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 1000);
 });
}
