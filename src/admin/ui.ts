export function renderAdminPage(): string {
  return `<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sawasdee Bot — Admin</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: sans-serif; background: #f5f5f5; color: #333; padding: 24px 16px; }

    .card { background: #fff; border-radius: 12px; padding: 24px; max-width: 600px; margin: 0 auto; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    h1 { font-size: 20px; margin-bottom: 20px; }

    /* Tabs */
    .tabs { display: flex; gap: 4px; margin-bottom: 24px; border-bottom: 2px solid #eee; }
    .tab { padding: 10px 20px; cursor: pointer; border: none; background: none; font-size: 15px; color: #888; border-bottom: 3px solid transparent; margin-bottom: -2px; }
    .tab.active { color: #06C755; border-bottom-color: #06C755; font-weight: 600; }
    .tab-panel { display: none; }
    .tab-panel.active { display: block; }

    /* Form */
    label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 6px; margin-top: 16px; }
    select { width: 100%; padding: 10px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 15px; background: #fafafa; }
    .sub-select { display: none; }

    /* Dropzone */
    .dropzone { margin-top: 16px; border: 2px dashed #ccc; border-radius: 10px; padding: 32px 16px; text-align: center; cursor: pointer; transition: border-color 0.2s, background 0.2s; background: #fafafa; }
    .dropzone.dragover { border-color: #06C755; background: #f0fff4; }
    .dropzone input[type=file] { display: none; }
    .dropzone p { font-size: 14px; color: #888; margin-top: 6px; }

    /* Preview grid */
    .preview { display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 8px; margin-top: 12px; }
    .preview-item { position: relative; }
    .preview-item img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 6px; border: 1px solid #eee; display: block; }
    .remove-btn { position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.55); color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 11px; cursor: pointer; }

    /* Buttons */
    .btn { width: 100%; padding: 14px; border: none; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; margin-top: 20px; }
    .btn-green { background: #06C755; color: #fff; }
    .btn-green:disabled { background: #aaa; cursor: not-allowed; }

    /* Result */
    .result { margin-top: 14px; font-size: 14px; padding: 10px 14px; border-radius: 8px; display: none; }
    .result.success { display: block; background: #f0fff4; color: #1a7f3c; }
    .result.error { display: block; background: #fff0f0; color: #c62828; }

    /* Template list */
    .category-header { font-size: 16px; font-weight: 700; color: #333; margin: 20px 0 8px; padding-bottom: 8px; border-bottom: 2px solid #eee; display: flex; align-items: center; gap: 8px; }
    .cat-count { font-size: 12px; font-weight: 400; color: #999; }
    .group-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border: 1px solid #eee; border-radius: 10px; margin-bottom: 8px; cursor: pointer; background: #fafafa; transition: background 0.15s; }
    .group-row:hover { background: #f0fff4; border-color: #06C755; }
    .group-row-left { display: flex; align-items: center; gap: 10px; }
    .group-row-thumb { display: flex; gap: 4px; }
    .group-row-thumb img { width: 36px; height: 36px; object-fit: cover; border-radius: 5px; border: 1px solid #eee; background: #eee; }
    .group-row-label { font-size: 15px; font-weight: 600; }
    .group-row-count { font-size: 13px; color: #999; }
    .group-row-arrow { color: #ccc; font-size: 18px; }
    /* Gallery view */
    .gallery-header { display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
    .back-btn { background: none; border: none; font-size: 22px; cursor: pointer; padding: 0 4px; color: #333; }
    .gallery-title { font-size: 17px; font-weight: 700; }
    .gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; }
    .gallery-card { border: 1px solid #eee; border-radius: 8px; overflow: hidden; background: #fafafa; }
    .gallery-card img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; background: #eee; }
    .gallery-card .del-btn { width: 100%; padding: 7px; background: #fff0f0; color: #c62828; border: none; border-top: 1px solid #fdd; font-size: 12px; cursor: pointer; }
    .gallery-card .del-btn:hover { background: #fdd; }
    .loading { text-align: center; color: #888; font-size: 14px; padding: 40px 0; }
    .empty { text-align: center; color: #aaa; font-size: 14px; padding: 32px 0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🌸 Sawasdee Bot Admin</h1>

    <div class="tabs">
      <button class="tab active" data-tab="upload">📤 อัปโหลด</button>
      <button class="tab" data-tab="manage">🗂️ จัดการรูป</button>
    </div>

    <!-- UPLOAD TAB -->
    <div class="tab-panel active" id="tab-upload">
      <label>หมวดหมู่</label>
      <select id="category">
        <option value="">— เลือกหมวด —</option>
        <option value="daily">รูปสวัสดีรายวัน</option>
        <option value="occasion">รูปอวยพรโอกาสพิเศษ</option>
      </select>

      <div class="sub-select" id="daily-options">
        <label>วัน</label>
        <select id="day-of-week">
          <option value="0">วันอาทิตย์</option>
          <option value="1">วันจันทร์</option>
          <option value="2">วันอังคาร</option>
          <option value="3">วันพุธ</option>
          <option value="4">วันพฤหัสบดี</option>
          <option value="5">วันศุกร์</option>
          <option value="6">วันเสาร์</option>
        </select>
      </div>

      <div class="sub-select" id="occasion-options">
        <label>โอกาส</label>
        <select id="occasion-key">
          <option value="birthday">วันเกิด 🎂</option>
          <option value="rich">ร่ำรวย 💰</option>
          <option value="health">สุขภาพ 💪</option>
        </select>
      </div>

      <label>รูปภาพ</label>
      <div class="dropzone" id="dropzone">
        <div style="font-size:36px">🖼️</div>
        <strong>ลากรูปมาวางที่นี่</strong>
        <p>หรือคลิกเพื่อเลือกรูป (เลือกได้หลายรูป)</p>
        <input type="file" id="file-input" accept="image/*" multiple>
      </div>
      <div class="preview" id="preview"></div>

      <button class="btn btn-green" id="upload-btn" disabled>อัปโหลด</button>
      <div class="result" id="upload-result"></div>
    </div>

    <!-- MANAGE TAB -->
    <div class="tab-panel" id="tab-manage">
      <div id="template-list"><div class="loading">กำลังโหลด...</div></div>
    </div>
  </div>

  <script>
    // ── Tabs ──────────────────────────────────────────────
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
        if (tab.dataset.tab === 'manage') loadTemplates();
      });
    });

    // ── Upload Tab ────────────────────────────────────────
    const categoryEl = document.getElementById('category');
    const dailyOpts = document.getElementById('daily-options');
    const occasionOpts = document.getElementById('occasion-options');
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');
    const previewEl = document.getElementById('preview');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadResult = document.getElementById('upload-result');
    let selectedFiles = [];

    function checkReady() {
      uploadBtn.disabled = !categoryEl.value || selectedFiles.length === 0;
    }

    function renderPreviews() {
      previewEl.innerHTML = '';
      selectedFiles.forEach((file, i) => {
        const item = document.createElement('div');
        item.className = 'preview-item';
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        const btn = document.createElement('button');
        btn.className = 'remove-btn';
        btn.textContent = '✕';
        btn.onclick = () => { selectedFiles.splice(i, 1); renderPreviews(); };
        item.appendChild(img);
        item.appendChild(btn);
        previewEl.appendChild(item);
      });
      checkReady();
    }

    function addFiles(files) {
      selectedFiles = [...selectedFiles, ...Array.from(files).filter(f => f.type.startsWith('image/'))];
      renderPreviews();
    }

    categoryEl.addEventListener('change', () => {
      dailyOpts.style.display = categoryEl.value === 'daily' ? 'block' : 'none';
      occasionOpts.style.display = categoryEl.value === 'occasion' ? 'block' : 'none';
      checkReady();
    });

    dropzone.addEventListener('click', () => fileInput.click());
    dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('dragover'); });
    dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
    dropzone.addEventListener('drop', e => { e.preventDefault(); dropzone.classList.remove('dragover'); addFiles(e.dataTransfer.files); });
    fileInput.addEventListener('change', () => { addFiles(fileInput.files); fileInput.value = ''; });

    uploadBtn.addEventListener('click', async () => {
      const category = categoryEl.value;
      const formData = new FormData();
      formData.append('category', category);
      if (category === 'daily') formData.append('dayOfWeek', document.getElementById('day-of-week').value);
      else formData.append('occasionKey', document.getElementById('occasion-key').value);
      selectedFiles.forEach(f => formData.append('images', f));

      uploadBtn.disabled = true;
      uploadBtn.textContent = 'กำลังอัปโหลด...';
      uploadResult.className = 'result';

      try {
        const res = await fetch('/admin/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (res.ok) {
          uploadResult.className = 'result success';
          uploadResult.textContent = '✅ อัปโหลดสำเร็จ ' + data.uploaded + ' รูป';
          selectedFiles = [];
          renderPreviews();
        } else {
          uploadResult.className = 'result error';
          uploadResult.textContent = '❌ ' + (data.error ?? 'เกิดข้อผิดพลาด');
        }
      } catch {
        uploadResult.className = 'result error';
        uploadResult.textContent = '❌ ไม่สามารถเชื่อมต่อ server ได้';
      } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'อัปโหลด';
        checkReady();
      }
    });

    // ── Manage Tab ────────────────────────────────────────
    const DAY_NAMES = ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'];
    const OCCASION_NAMES = { birthday: 'วันเกิด 🎂', rich: 'ร่ำรวย 💰', health: 'สุขภาพ 💪' };
    let allTemplates = [];

    async function loadTemplates() {
      const listEl = document.getElementById('template-list');
      listEl.innerHTML = '<div class="loading">กำลังโหลด...</div>';
      try {
        const res = await fetch('/admin/templates');
        const data = await res.json();
        allTemplates = data.templates;
        renderList();
      } catch {
        listEl.innerHTML = '<div class="empty">โหลดข้อมูลไม่ได้</div>';
      }
    }

    function thumbsHtml(items) {
      return items.slice(0, 3).map(t =>
        \`<img src="\${t.imageUrl}" onerror="this.style.background='#ddd'" loading="lazy">\`
      ).join('');
    }

    function renderList() {
      const listEl = document.getElementById('template-list');
      const templates = allTemplates;
      if (!templates.length) { listEl.innerHTML = '<div class="empty">ยังไม่มีรูป</div>'; return; }

      const daily = templates.filter(t => t.category === 'daily');
      const occasion = templates.filter(t => t.category === 'occasion');
      let html = '';

      if (daily.length) {
        html += \`<div class="category-header">🌅 รูปสวัสดีรายวัน <span class="cat-count">\${daily.length} รูป</span></div>\`;
        for (let d = 0; d <= 6; d++) {
          const items = daily.filter(t => t.dayOfWeek === d);
          if (!items.length) continue;
          html += \`
            <div class="group-row" onclick="renderGallery('วัน\${DAY_NAMES[d]}', \${d}, 'daily')">
              <div class="group-row-left">
                <div class="group-row-thumb">\${thumbsHtml(items)}</div>
                <div>
                  <div class="group-row-label">วัน\${DAY_NAMES[d]}</div>
                  <div class="group-row-count">\${items.length} รูป</div>
                </div>
              </div>
              <span class="group-row-arrow">›</span>
            </div>\`;
        }
      }

      if (occasion.length) {
        html += \`<div class="category-header" style="margin-top:24px">🙏 รูปอวยพรโอกาสพิเศษ <span class="cat-count">\${occasion.length} รูป</span></div>\`;
        const keys = [...new Set(occasion.map(t => t.occasionKey))];
        keys.forEach(key => {
          const items = occasion.filter(t => t.occasionKey === key);
          const label = OCCASION_NAMES[key] ?? key;
          html += \`
            <div class="group-row" onclick="renderGallery('\${label}', '\${key}', 'occasion')">
              <div class="group-row-left">
                <div class="group-row-thumb">\${thumbsHtml(items)}</div>
                <div>
                  <div class="group-row-label">\${label}</div>
                  <div class="group-row-count">\${items.length} รูป</div>
                </div>
              </div>
              <span class="group-row-arrow">›</span>
            </div>\`;
        });
      }

      listEl.innerHTML = html;
    }

    function renderGallery(label, key, category) {
      const listEl = document.getElementById('template-list');
      const items = category === 'daily'
        ? allTemplates.filter(t => t.category === 'daily' && t.dayOfWeek === key)
        : allTemplates.filter(t => t.category === 'occasion' && t.occasionKey === key);

      listEl.innerHTML = \`
        <div class="gallery-header">
          <button class="back-btn" onclick="renderList()">←</button>
          <span class="gallery-title">\${label}</span>
          <span class="cat-count" style="margin-left:6px">\${items.length} รูป</span>
        </div>
        <div class="gallery-grid">
          \${items.map(t => \`
            <div class="gallery-card" id="card-\${t.id}">
              <img src="\${t.imageUrl}" onerror="this.style.background='#ddd'" loading="lazy">
              <button class="del-btn" onclick="deleteTemplate('\${t.id}', '\${t.imageUrl}', '\${label}', \${JSON.stringify(key)}, '\${category}')">🗑️ ลบ</button>
            </div>
          \`).join('')}
        </div>
      \`;
    }

    async function deleteTemplate(id, imageUrl, label, key, category) {
      if (!confirm('ลบรูปนี้?')) return;
      try {
        const res = await fetch('/admin/templates/' + id, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl }),
        });
        if (res.ok) {
          allTemplates = allTemplates.filter(t => t.id !== id);
          renderGallery(label, key, category);
        } else {
          alert('ลบไม่สำเร็จ');
        }
      } catch {
        alert('ไม่สามารถเชื่อมต่อ server ได้');
      }
    }
  </script>
</body>
</html>`;
}
