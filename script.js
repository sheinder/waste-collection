// Data konten halaman publik + render ke halaman (hanya mengisi elemen yang ada di halaman tsb)
const fill = (id, html) => { const el = document.getElementById(id); if (el) el.innerHTML = html; };

const services = [
  { icon: "👥", title: "Manage Customer", desc: "Manage and organize customer information." },
  { icon: "🗑", title: "Manage Waste Types", desc: "Manage different types of waste collected by the company." },
  { icon: "🚚", title: "Request Waste Pickup", desc: "Customers can request waste collection easily." },
  { icon: "📅", title: "Manage Pickup Schedule", desc: "Admin can organize and manage pickup schedules." },
  { icon: "📝", title: "Record Waste Collection", desc: "Record the collected waste and its weight." },
];
const detail = [
  { icon: "🚚", title: "Request Pickup", desc: "Customers submit a pickup request in a few taps, choosing waste type and preferred date.", points: ["Simple request form", "Status updates", "Pickup history saved"] },
  { icon: "📅", title: "Manage Schedule", desc: "Admins review incoming requests and organize pickup dates for collection.", points: ["Approve or reject requests", "Available date list", "Schedule per area"] },
  { icon: "📝", title: "Record Collection", desc: "Once waste is collected, admins log what was picked up and its weight.", points: ["Weight logging per pickup", "Automatic history", "Linked to the customer"] },
  { icon: "👥", title: "Customer Management", desc: "Keep customer details, addresses, and areas organized in a single directory.", points: ["Customer list", "Saved addresses", "Area (kelurahan/RW)"] },
  { icon: "🗑", title: "Waste Type Management", desc: "Define the categories of waste your service accepts and mark which can be recycled.", points: ["Custom waste categories", "Recyclable flag", "Handling guidelines"] },
  { icon: "📊", title: "Reporting & Insights", desc: "See how much waste is collected, by type and by area, and how much is recycled.", points: ["Total weight collected", "Recycling share", "Exportable CSV report"] },
];
const steps = [
  { icon: "📨", title: "Request Pickup", desc: "The customer logs in, selects a waste type and a pickup date, and submits the request.", who: "Customer action" },
  { icon: "📅", title: "Schedule Pickup", desc: "An admin reviews the incoming request and approves it for the chosen date.", who: "Admin action" },
  { icon: "🚛", title: "Waste Collection", desc: "On the scheduled day, the collection team picks up the waste at the customer's location.", who: "Collection team" },
  { icon: "⚖", title: "Record Collection", desc: "The admin logs the collected waste type and total weight into the customer's record.", who: "Admin action" },
  { icon: "📊", title: "Track Data", desc: "Collection history and totals become visible in the dashboard, so progress can be monitored.", who: "Everyone" },
];
const types = [
  { icon: "🍂", name: "Organic Waste", c: "g", desc: "Food scraps, garden trimmings, and other biodegradable material collected for composting.", tags: ["Compostable", "Weekly pickup"] },
  { icon: "♻", name: "Recyclable Waste", c: "b", desc: "Paper, cardboard, glass, plastic, and metal that can be sorted and processed for reuse.", tags: ["Sortable", "Bi-weekly pickup"] },
  { icon: "⚠", name: "Hazardous Waste", c: "r", desc: "Batteries, chemicals, and other materials that require special handling and safe disposal.", tags: ["Special handling", "By request"] },
  { icon: "🗑", name: "General Waste", c: "n", desc: "Everyday household waste that doesn't fall into another category, sent for standard disposal.", tags: ["Residual", "Weekly pickup"] },
  { icon: "🔌", name: "Electronic Waste", c: "o", desc: "Old devices, cables, and appliances collected separately for proper recycling of components.", tags: ["E-waste", "By request"] },
  { icon: "🛋", name: "Bulky Waste", c: "p", desc: "Furniture, large appliances, and oversized items that need a scheduled, dedicated pickup.", tags: ["Oversized", "By request"] },
];
const team = [
  { name: "Bryant Miroslavy Limoel", photo: "images/bryant.jpg" },
  { name: "Celsea Lorencia", photo: "images/celsea.jpg" },
  { name: "Poretto Aurelia Chandra", photo: "images/poretto.jpg" },
];

fill("serviceList", services.map(s => `<article class="card"><div class="icon">${s.icon}</div><h4>${s.title}</h4><p>${s.desc}</p></article>`).join(""));
fill("serviceDetail", detail.map(s => `<article class="feat"><div class="icon">${s.icon}</div><h3>${s.title}</h3><p>${s.desc}</p><ul class="checks">${s.points.map(p => `<li>${p}</li>`).join("")}</ul></article>`).join(""));
fill("stepList", steps.map(s => `<li class="step"><div class="icon">${s.icon}</div><b>${s.title}</b><span>${s.desc}</span></li>`).join(""));
fill("timeline", steps.map((s, i) => `<li><small>Step ${i + 1}</small><h3>${s.title}</h3><p>${s.desc}</p><span class="tag g">${s.who}</span></li>`).join(""));
fill("typeList", types.map(t => `<li>${t.name}</li>`).join(""));
fill("typeCards", types.map(t => `<article class="feat"><h3>${t.icon} ${t.name}</h3><p>${t.desc}</p><div>${t.tags.map(x => `<span class="tag ${t.c}">${x}</span>`).join(" ")}</div></article>`).join(""));
fill("team", team.map(m => `<figure class="member"><img src="${m.photo}" alt="Foto ${m.name}" loading="lazy" /><figcaption>${m.name}</figcaption></figure>`).join(""));

// Statistik nyata dari data aplikasi (bukan angka karangan)
const ls = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const done = ls("requests", []).filter(r => r.status === "Collected");
const kg = done.reduce((a, r) => a + Number(r.weight || 0), 0);
const rec = ls("types", []).filter(t => t.recycle).map(t => t.name);
const recKg = done.filter(r => rec.includes(r.type)).reduce((a, r) => a + Number(r.weight || 0), 0);
const stat = [[done.length, "Pickups completed"], [ls("users", []).filter(u => u.role === "customer").length, "Registered customers"], [kg.toFixed(1) + " kg", "Waste collected"], [kg ? Math.round((recKg / kg) * 100) + "%" : "-", "Recycled or composted"]];
fill("liveStats", stat.map(s => `<div class="stat"><b>${s[0]}</b><span>${s[1]}</span></div>`).join(""));
