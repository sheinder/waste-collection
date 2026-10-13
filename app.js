// ===== Helper & "database" sederhana (localStorage) =====
const $ = s => document.querySelector(s);
const get = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const day = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

// Data awal (hanya dibuat sekali)
if (get("ver") !== 2) {
  localStorage.clear();
  set("ver", 2);
  set("users", [
    { id: 1, name: "Admin", username: "admin", password: "admin123", role: "admin", address: "-", active: true },
    { id: 2, name: "John Doe", username: "john", password: "john123", role: "customer", address: "Jl. Mawar 12, Medan", area: "Medan Baru", active: true },
  ]);
  set("types", [{ name: "Organic", recycle: true }, { name: "Recyclable", recycle: true }, { name: "Hazardous", recycle: false }, { name: "General", recycle: false }, { name: "Electronic", recycle: true }, { name: "Bulky", recycle: false }]);
  set("dates", [day(2), day(5), day(9)]);
  set("requests", []);
}

const page = document.body.dataset.page;

// ===== LOGIN (use case: Login, untuk Customer & Admin) =====
if (page === "login") {
  if (get("users").some(u => u.id === get("session"))) location.href = "dashboard.html";
  $("#loginForm").onsubmit = e => {
    e.preventDefault();
    const u = get("users").find(x => x.username === $("#user").value.trim() && x.password === $("#pass").value);
    if (!u) return ($("#err").textContent = "Username atau password salah.");
    if (!u.active) return ($("#err").textContent = "Akun dinonaktifkan. Hubungi admin.");
    set("session", u.id);
    location.href = "dashboard.html";
  };
}

// ===== DASHBOARD =====
if (page === "dash") {
  const me = get("users").find(u => u.id === get("session") && u.active);
  if (!me) { localStorage.removeItem("session"); location.href = "login.html"; }
  else initDash(me);
}

function initDash(me) {
  const isAdmin = me.role === "admin";
  $("#who").textContent = `${me.name} (${me.role})`;
  $("#av").textContent = me.name.slice(0, 2).toUpperCase();

  // --- helper tampilan ---
  const uname = id => (get("users").find(u => u.id === id) || {}).name || "-";
  const badge = s => `<span class="badge ${s}">${s}</span>`;
  const table = (h, rows) => `<div class="tw"><table><thead><tr>${h.map(x => `<th>${x}</th>`).join("")}</tr></thead><tbody>` +
    (rows.length ? rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join("")}</tr>`).join("") : `<tr><td colspan="${h.length}" class="empty">Belum ada data.</td></tr>`) +
    `</tbody></table></div>`;
  const btn = (act, id, label, cls = "btn-outline") => `<button class="btn ${cls} btn-sm" data-act="${act}" data-id="${id}">${label}</button>`;
  const mine = () => get("requests").filter(r => r.uid === me.id);
  const upd = (id, patch) => set("requests", get("requests").map(r => (r.id === id ? { ...r, ...patch } : r)));
  const collected = () => get("requests").filter(r => r.status === "Collected");
  const reportHTML = list => {
    const rec = get("types").filter(t => t.recycle).map(t => t.name);
    const t = {}, ar = {};
    list.forEach(r => {
      const w = Number(r.weight || 0), area = (get("users").find(u => u.id === r.uid) || {}).area || "-";
      t[r.type] = (t[r.type] || 0) + w;
      ar[area] = (ar[area] || 0) + w;
    });
    const total = Object.values(t).reduce((x, y) => x + y, 0);
    const rc = Object.entries(t).filter(([k]) => rec.includes(k)).reduce((x, [, v]) => x + v, 0);
    const pct = total ? Math.round((rc / total) * 100) : 0;
    return `<div class="panel"><h4>Laporan dampak (SDG 11.6)</h4>
      <p><b>Total terkumpul:</b> ${total.toFixed(1)} kg | <b>Didaur ulang/dikompos:</b> ${rc.toFixed(1)} kg (${pct}%)</p>
      ${table(["Jenis sampah", "Total (kg)"], Object.entries(t).map(([k, v]) => [esc(k), v.toFixed(1)]))}
      ${table(["Wilayah", "Total (kg)"], Object.entries(ar).map(([k, v]) => [esc(k), v.toFixed(1)]))}</div>`;
  };
  const reqRow = r => [esc(uname(r.uid)), esc(r.type), r.date, esc(r.notes || "-"), badge(r.status)];

  let view = isAdmin ? "customers" : "request";
  let note = "";
  let showReport = false;

  // --- daftar halaman per role (sesuai use case) ---
  const views = isAdmin ? {
    customers: ["Manage Customer", () => `<h3>Manage Customer</h3>
      <form data-form="customer" class="form">
        <label>Nama <input name="name" required /></label>
        <label>Username <input name="username" required /></label>
        <label>Password <input name="password" required /></label>
        <label>Alamat <input name="address" required /></label>
        <label>Wilayah (kelurahan/RW) <input name="area" required /></label>
        <button class="btn btn-primary">Tambah customer</button></form>
      ${table(["Nama", "Username", "Alamat", "Wilayah", "Aksi"], get("users").filter(u => u.role === "customer").map(u => [esc(u.name), esc(u.username), esc(u.address), esc(u.area || "-"), btn("delUser", u.id, "Hapus")]))}`],
    types: ["Manage Waste Types", () => `<h3>Manage Waste Types</h3>
      <form data-form="type" class="inline"><label>Jenis sampah baru <input name="name" required /></label><label class="chk"><input type="checkbox" name="recycle" /> Bisa didaur ulang/dikompos</label><button class="btn btn-primary">Tambah</button></form>
      ${table(["Jenis sampah", "Daur ulang", "Aksi"], get("types").map((t, i) => [esc(t.name), t.recycle ? "Ya" : "Tidak", btn("delType", i, "Hapus")]))}`],
    requests: ["Pickup Requests", () => {
      const dates = get("dates").slice().sort();
      return `<h3>Manage Pickup Request</h3>
      ${table(["Customer", "Jenis", "Jadwal", "Catatan", "Status", "Aksi"], get("requests").map(r => [...reqRow(r), r.status === "Pending" ? btn("approve", r.id, "Setujui", "btn-primary") + btn("reject", r.id, "Tolak") : "-"]))}
      <h3>Manage Pickup Schedule</h3>
      <form data-form="date" class="inline"><label>Tanggal baru <input type="date" name="date" min="${day(0)}" required /></label><button class="btn btn-primary">Tambah jadwal</button></form>
      ${table(["Tanggal", "Aksi"], dates.map(d => [d, btn("delDate", d, "Hapus")]))}`;
    }],
    record: ["Record Collection", () => {
      const list = get("requests").filter(r => r.status === "Approved");
      return `<h3>Record Waste Collection</h3><p class="muted">Isi berat sampah (kg) untuk permintaan yang sudah disetujui.</p>
      ${table(["Customer", "Jenis", "Jadwal", "Berat (kg)", "Aksi"], list.map(r => [esc(uname(r.uid)), esc(r.type), r.date, `<input type="number" min="0.1" step="0.1" id="w${r.id}" />`, btn("record", r.id, "Simpan", "btn-primary")]))}`;
    }],
    data: ["Collection Data", () => `<h3>View Collection Data</h3>
      ${table(["Customer", "Jenis", "Tanggal", "Berat (kg)"], collected().map(r => [esc(uname(r.uid)), esc(r.type), r.date, r.weight]))}
      <div class="inline"><button class="btn btn-primary" data-act="report">Generate Report</button><button class="btn btn-outline" data-act="csv">Download CSV</button></div>
      ${showReport ? reportHTML(collected()) : ""}`],
    accounts: ["User Accounts", () => `<h3>Manage User Account</h3>
      ${table(["Nama", "Username", "Role", "Status", "Aksi"], get("users").map(u => [esc(u.name), esc(u.username), u.role, u.active ? "Aktif" : "Nonaktif", u.id === me.id ? "-" : btn("toggle", u.id, u.active ? "Nonaktifkan" : "Aktifkan")]))}`],
  } : {
    request: ["Request Pickup", () => {
      const ds = get("dates").filter(d => d >= day(0)).sort();
      return `<h3>Request Waste Pickup</h3><p class="muted">Jadwal penjemputan tersedia: ${ds.join(", ") || "belum ada"}</p>
      <form data-form="request" class="form">
        <label>Jenis sampah <select name="type" required><option value="">Pilih jenis</option>${get("types").map(t => `<option>${esc(t.name)}</option>`).join("")}</select></label>
        <label>Jadwal penjemputan <select name="date" required><option value="">Pilih jadwal</option>${ds.map(d => `<option>${d}</option>`).join("")}</select></label>
        <label>Catatan / permintaan khusus (opsional) <textarea name="notes" rows="3"></textarea></label>
        <button class="btn btn-primary">Kirim permintaan</button></form>`;
    }],
    status: ["Pickup Status", () => `<h3>View Pickup Status</h3>${table(["Jenis", "Jadwal", "Catatan", "Status"], mine().filter(r => r.status !== "Collected").map(r => reqRow(r).slice(1)))}`],
    result: ["Collection Result", () => `<h3>View Collection Result</h3>${table(["Jenis", "Tanggal", "Berat (kg)"], mine().filter(r => r.status === "Collected").map(r => [esc(r.type), r.date, r.weight]))}`],
    history: ["Collection History", () => `<h3>View Collection History</h3>${table(["Jenis", "Jadwal", "Catatan", "Status"], mine().map(r => reqRow(r).slice(1)))}
      <div><button class="btn btn-outline" data-act="report">View Report</button></div>${showReport ? reportHTML(mine().filter(r => r.status === "Collected")) : ""}`],
  };

  // --- render ---
  function render() {
    $("#side").innerHTML = Object.entries(views).map(([k, v]) => `<button data-act="nav" data-id="${k}" class="${k === view ? "active" : ""}">${v[0]}</button>`).join("");
    $("#content").innerHTML = (note ? `<p class="msg" role="status">${note}</p>` : "") + views[view][1]();
    note = "";
  }

  // --- aksi tombol ---
  const acts = {
    nav: d => { view = d.id; showReport = false; },
    logout: () => { localStorage.removeItem("session"); location.href = "login.html"; },
    approve: d => upd(+d.id, { status: "Approved" }),
    reject: d => upd(+d.id, { status: "Rejected" }),
    record: d => {
      const w = parseFloat($("#w" + d.id).value);
      if (!(w > 0)) return (note = "Isi berat lebih dari 0.");
      upd(+d.id, { status: "Collected", weight: w });
      note = "Berat tersimpan, status menjadi Collected.";
    },
    delType: d => set("types", get("types").filter((_, i) => i !== +d.id)),
    delDate: d => set("dates", get("dates").filter(x => x !== d.id)),
    delUser: d => set("users", get("users").filter(u => u.id !== +d.id)),
    toggle: d => set("users", get("users").map(u => (u.id === +d.id ? { ...u, active: !u.active } : u))),
    report: () => (showReport = true),
    csv: () => {
      const rows = [["Customer", "Jenis", "Tanggal", "Berat_kg"], ...collected().map(r => [uname(r.uid), r.type, r.date, r.weight])];
      const url = URL.createObjectURL(new Blob([rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n")], { type: "text/csv" }));
      Object.assign(document.createElement("a"), { href: url, download: "laporan-pengumpulan.csv" }).click();
    },
  };
  document.addEventListener("click", e => {
    const a = e.target.closest("[data-act]");
    if (!a) return;
    acts[a.dataset.act](a.dataset);
    if (a.dataset.act !== "logout") render();
  });

  // --- form submit ---
  const forms = {
    request: d => {
      set("requests", [{ id: Date.now(), uid: me.id, type: d.type, date: d.date, notes: d.notes.trim(), status: "Pending", weight: null }, ...get("requests")]);
      view = "status"; note = "Permintaan terkirim. Pantau statusnya di sini.";
    },
    customer: d => {
      if (get("users").some(u => u.username === d.username)) return (note = "Username sudah dipakai.");
      set("users", [...get("users"), { id: Date.now(), ...d, role: "customer", active: true }]);
      note = "Customer ditambahkan.";
    },
    type: d => { if (!get("types").some(t => t.name === d.name.trim())) set("types", [...get("types"), { name: d.name.trim(), recycle: d.recycle === "on" }]); },
    date: d => { if (!get("dates").includes(d.date)) set("dates", [...get("dates"), d.date]); },
  };
  document.addEventListener("submit", e => {
    const f = e.target.dataset.form;
    if (!f) return;
    e.preventDefault();
    forms[f](Object.fromEntries(new FormData(e.target)));
    render();
  });

  render();
}
