// Header, footer, dan tombol CTA dipakai bersama semua halaman publik (ditulis sekali di sini)
(() => {
  const NAV = [["Home", "index.html"], ["Services", "services.html"], ["How It Works", "how-it-works.html"], ["Waste Types", "waste-types.html"], ["About", "about.html"]];
  const here = location.pathname.split("/").pop() || "index.html";
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const me = users.find(u => u.id === JSON.parse(localStorage.getItem("session") || "null"));
  const go = me ? "dashboard.html" : "login.html";

  const header = document.getElementById("site-header");
  header.className = "navbar";
  header.innerHTML = `
    <a href="index.html" class="brand"><span class="logo">♻</span> Waste Collection</a>
    <nav id="menu" class="menu">${NAV.map(([t, f]) => `<a href="${f}" class="${f === here ? "active" : ""}">${t}</a>`).join("")}</nav>
    <div class="nav-right">
      <a class="user" href="${go}">${me ? `<span class="avatar">${esc(me.name.slice(0, 2).toUpperCase())}</span> ${esc(me.name)}` : "Login"}</a>
      <button class="btn btn-primary open-modal">Request Pickup</button>
      <button id="burger" class="burger" aria-label="Buka menu">☰</button>
    </div>`;

  const footer = document.getElementById("site-footer");
  footer.className = "footer";
  footer.innerHTML = `<div class="container footer-grid">
    <div><a href="index.html" class="brand"><span class="logo">♻</span> Waste Collection</a><p class="small">Cleaner Today, Greener Tomorrow</p></div>
    <div><h4>Quick Links</h4>${NAV.map(([t, f]) => `<a href="${f}">${t}</a>`).join("")}</div>
    <div><h4>Services</h4><a href="services.html">Request Pickup</a><a href="services.html">Manage Schedule</a><a href="services.html">Record Collection</a><a href="services.html">Customer Management</a><a href="services.html">Waste Type Management</a></div>
    <div><h4>Contact</h4><span>📞 +62 811 2345 6789</span><span>✉ info@wastecollection.com</span><span>📍 Jakarta, Indonesia</span></div>
  </div>`;

  const cta = document.getElementById("cta-slot");
  if (cta) cta.innerHTML = `<section class="container"><div class="cta"><div><h3>Ready to Make Waste Collection Easier?</h3><p class="muted">Submit your waste pickup request and contribute to a cleaner community.</p></div><button class="btn btn-primary open-modal">Request Pickup</button></div></section>`;

  document.querySelectorAll(".open-modal").forEach(b => b.addEventListener("click", () => (location.href = go)));
  const menu = document.getElementById("menu");
  document.getElementById("burger").addEventListener("click", () => menu.classList.toggle("open"));
  const w = document.getElementById("welcome");
  if (w && me) w.textContent = `Welcome back, ${me.name}!`;
})();
