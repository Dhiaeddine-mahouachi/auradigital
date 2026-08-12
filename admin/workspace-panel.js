(() => {
  const VIEW_ID = "workspace";
  const VIEW_LABEL = "Notes & Images";

  if (!Array.isArray(NAV) || NAV.some(([id]) => id === VIEW_ID)) return;
  const overviewIndex = NAV.findIndex(([id]) => id === "overview");
  NAV.splice(overviewIndex >= 0 ? overviewIndex + 1 : 1, 0, [VIEW_ID, VIEW_LABEL]);

  const previousOpenView = openView;
  const palette = ["green", "teal", "yellow", "coral", "lavender", "slate"];
  let editingId = null;

  function prettyDate(value) {
    if (!value) return "";
    try { return new Date(value.endsWith?.("Z") ? value : `${value}Z`).toLocaleString(); }
    catch { return String(value); }
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return reject(new Error("Use JPG, PNG or WebP images."));
      if (file.size > 600 * 1024) return reject(new Error(`${file.name} is larger than 600 KB.`));
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
      reader.readAsDataURL(file);
    });
  }

  async function saveNote(event) {
    event.preventDefault();
    if (!canWrite()) return;
    const form = event.currentTarget;
    const button = form.querySelector("button[type=submit]");
    const notice = $("workspaceNotice");
    const files = [...form.elements.images.files];
    if (files.length > 6) {
      notice.className = "notice error";
      notice.textContent = "Add up to 6 images at a time.";
      return;
    }
    button.disabled = true;
    notice.className = "notice";
    notice.textContent = "Saving…";
    try {
      const images = await Promise.all(files.map(fileToDataUrl));
      const body = { title: form.elements.title.value, body: form.elements.body.value, color: form.elements.color.value, images };
      await api(`/api/admin/workspace/notes${editingId ? `/${editingId}` : ""}`, { method: editingId ? "PUT" : "POST", body: JSON.stringify(body) });
      editingId = null;
      await renderWorkspace();
    } catch (error) {
      notice.className = "notice error";
      notice.textContent = error.message;
      button.disabled = false;
    }
  }

  function beginEdit(note) {
    editingId = note.id;
    const form = $("workspaceForm");
    form.elements.title.value = note.title || "";
    form.elements.body.value = note.body || "";
    form.elements.color.value = note.color || "green";
    $("workspaceFormTitle").textContent = "Edit note";
    $("workspaceSave").textContent = "Save changes";
    $("workspaceCancel").classList.remove("hidden");
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    form.elements.title.focus();
  }

  function cancelEdit() {
    editingId = null;
    const form = $("workspaceForm");
    form.reset();
    form.elements.color.value = "green";
    $("workspaceFormTitle").textContent = "New note";
    $("workspaceSave").textContent = "Save note";
    $("workspaceCancel").classList.add("hidden");
    $("workspaceNotice").textContent = "";
  }

  async function deleteNote(id) {
    if (!canWrite() || !confirm("Delete this note and all of its images?")) return;
    await api(`/api/admin/workspace/notes/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (editingId === id) editingId = null;
    await renderWorkspace();
  }

  async function deleteImage(id) {
    if (!canWrite() || !confirm("Remove this image from the note?")) return;
    await api(`/api/admin/workspace/images/${encodeURIComponent(id)}`, { method: "DELETE" });
    await renderWorkspace();
  }

  async function renderWorkspace() {
    const data = await api("/api/admin/workspace/notes");
    const notes = Array.isArray(data.notes) ? data.notes : [];
    const imageCount = notes.reduce((sum, note) => sum + (note.images || []).length, 0);

    const cards = notes.map(note => `
      <article class="workspace-note note-${palette.includes(note.color) ? note.color : "green"}">
        <div class="workspace-note-head">
          <div><span class="workspace-dot"></span><strong>${esc(note.title || "Untitled note")}</strong></div>
          <small>${esc(prettyDate(note.updatedAt))}</small>
        </div>
        ${note.body ? `<p class="workspace-note-body">${esc(note.body).replaceAll("\n", "<br>")}</p>` : '<p class="workspace-note-body muted">No text yet.</p>'}
        ${(note.images || []).length ? `<div class="workspace-gallery">${note.images.map(image => `
          <figure>
            <img src="${esc(image.url)}" alt="" loading="lazy">
            ${canWrite() ? `<button class="workspace-image-remove" type="button" data-workspace-image="${esc(image.id)}" aria-label="Remove image">×</button>` : ""}
          </figure>`).join("")}</div>` : ""}
        <div class="workspace-note-actions">
          ${canWrite() ? `<button class="btn btn-light btn-sm" type="button" data-workspace-edit="${esc(note.id)}">Edit</button><button class="btn btn-danger btn-sm" type="button" data-workspace-delete="${esc(note.id)}">Delete</button>` : '<span class="pill">Read only</span>'}
        </div>
      </article>
    `).join("");

    $("content").innerHTML = `
      <div class="workspace-hero">
        <div><span class="workspace-kicker">YOUR PRIVATE SPACE</span><h2>Notes, ideas & visual references</h2><p>Keep client reminders, ideas, screenshots and references inside your AuraDigital admin.</p></div>
        <div class="workspace-mini-stats"><div><strong>${notes.length}</strong><span>notes</span></div><div><strong>${imageCount}</strong><span>images</span></div></div>
      </div>
      <div class="workspace-layout">
        <section class="panel workspace-compose">
          <div class="panel-head"><div><h2 id="workspaceFormTitle">New note</h2><p>Saved privately in your AuraDigital database.</p></div><span class="status">Private</span></div>
          <form id="workspaceForm" class="workspace-form">
            <label>Title<input name="title" maxlength="120" placeholder="Example: Cafe client changes"></label>
            <label>Color<select name="color"><option value="green">Aura green</option><option value="teal">Teal</option><option value="yellow">Warm yellow</option><option value="coral">Coral</option><option value="lavender">Lavender</option><option value="slate">Slate</option></select></label>
            <label class="workspace-full">Note<textarea name="body" maxlength="8000" placeholder="Write anything you need to remember…"></textarea></label>
            <label class="workspace-full">Images <small>JPG, PNG or WebP · max 600 KB each · up to 6 at a time</small><input name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple></label>
            <div class="workspace-actions workspace-full"><button id="workspaceCancel" class="btn btn-light hidden" type="button">Cancel edit</button><button id="workspaceSave" class="btn btn-dark" type="submit">Save note</button><span id="workspaceNotice" class="notice"></span></div>
          </form>
        </section>
        <section class="panel workspace-board">
          <div class="panel-head"><div><h2>Your board</h2><p>Newest updates appear first.</p></div><span class="pill">${notes.length} saved</span></div>
          <div class="workspace-grid">${cards || '<div class="empty">No notes yet. Create your first note on the left.</div>'}</div>
        </section>
      </div>`;

    $("workspaceForm").addEventListener("submit", saveNote);
    $("workspaceCancel").addEventListener("click", cancelEdit);
    document.querySelectorAll("[data-workspace-edit]").forEach(button => button.addEventListener("click", () => beginEdit(notes.find(note => note.id === button.dataset.workspaceEdit))));
    document.querySelectorAll("[data-workspace-delete]").forEach(button => button.addEventListener("click", () => deleteNote(button.dataset.workspaceDelete)));
    document.querySelectorAll("[data-workspace-image]").forEach(button => button.addEventListener("click", () => deleteImage(button.dataset.workspaceImage)));
    applyReadOnlyUi();
  }

  openView = async function(view) {
    if (view !== VIEW_ID) return previousOpenView(view);
    state.view = VIEW_ID;
    location.hash = VIEW_ID;
    buildNav();
    $("pageTitle").textContent = "Notes & Images";
    $("pageSubtitle").textContent = "Your private AuraDigital workspace for ideas, reminders and visual references.";
    $("content").innerHTML = '<section class="panel"><p>Loading workspace…</p></section>';
    try { await renderWorkspace(); }
    catch (error) {
      if (error.status === 401) return checkSession();
      $("content").innerHTML = `<section class="panel"><div class="notice error">${esc(error.message)}</div></section>`;
    }
  };

  if (!$("dashboardView").classList.contains("hidden")) buildNav();
})();
