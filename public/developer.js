
const tokenKey = "rk_dev_token";

const sections = {
  homepage: {label:"Homepage", path:"settings", type:"settings", icon:"⌂", desc:"Edit the main public-facing website content."},
  competitions: {label:"Competitions", path:"competitions", type:"crud", icon:"🏆", desc:"Manage competition history, results and photos."},
  robots: {label:"Robots", path:"robots", type:"crud", icon:"▣", desc:"Manage robot profiles and specifications."},
  projects: {label:"Projects", path:"projects", type:"crud", icon:"◫", desc:"Manage robotics projects and build status."},
  achievements: {label:"Achievements", path:"achievements", type:"crud", icon:"★", desc:"Manage awards, rankings and milestones."},
  team: {label:"Team", path:"team", type:"crud", icon:"◉", desc:"Manage team members, roles and profiles."},
  gallery: {label:"Gallery", path:"gallery", type:"crud", icon:"▧", desc:"Upload and manage competition and team photos."},
  sponsors: {label:"Sponsors", path:"sponsors", type:"crud", icon:"◇", desc:"Manage sponsors, partners and their logos."},
  news: {label:"News / Updates", path:"news", type:"crud", icon:"≡", desc:"Publish team news, announcements and updates."}
};

const fieldMap = {
  competitions:[
    ["name","Competition Name","text",1],["year","Year","number"],["category","Category","text"],
    ["position","Position / Result","text"],["prize","Prize","text"],["location","Location","text"],
    ["date","Date","date"],["competition_number","Competition Number","text"],["description","Description","textarea"],
    ["cover_image","Cover Photo","image"]
  ],
  robots:[
    ["name","Robot Name","text",1],["subtitle","Subtitle","text"],["category","Category","text"],
    ["description","Description","textarea"],["specs","Specifications","textarea"],["image","Robot Image","image"],["sort_order","Display Order","number"]
  ],
  projects:[
    ["name","Project Name","text",1],["year","Year","number"],["category","Category","text"],
    ["status","Status","text"],["description","Description","textarea"],["image","Project Image","image"],["sort_order","Display Order","number"]
  ],
  achievements:[
    ["title","Achievement Title","text",1],["event","Event / Competition","text"],["year","Year","number"],
    ["result","Result","text"],["prize","Prize","text"],["description","Description","textarea"],["image","Image","image"],["sort_order","Display Order","number"]
  ],
  team:[
    ["name","Name","text",1],["role","Role","text"],["bio","Bio","textarea"],["image","Profile Photo","image"],["sort_order","Display Order","number"]
  ],
  gallery:[
    ["title","Title","text"],["image","Photo","image",1],["category","Category","text"],
    ["caption","Caption","textarea"],["sort_order","Display Order","number"]
  ],
  sponsors:[
    ["name","Sponsor Name","text",1],["website","Website","url"],["tier","Sponsor Tier","text"],
    ["logo","Logo","image"],["description","Description","textarea"],["sort_order","Display Order","number"]
  ],
  news:[
    ["title","Title","text",1],["date","Date","date"],["excerpt","Short Description","textarea"],
    ["content","Full Content","textarea"],["image","Cover Image","image"]
  ]
};

const settingsFields = [
  ["teamName","Team Name","text",1],["tagline","Tagline","text"],["heroTitle","Hero Title","text"],
  ["heroDescription","Hero Description","textarea"],["heroImage","Hero Background Image","image"],
  ["aboutTitle","About Heading","text"],["aboutText","About Text","textarea"],
  ["instagram","Instagram URL","url"],["contactEmail","Contact Email","email"],["contactText","Contact Text","textarea"]
];

let current = "homepage";
let cache = [];
let editingId = null;

const $ = id => document.getElementById(id);

function headers(json=true){
  return {
    ...(json ? {"Content-Type":"application/json"} : {}),
    "Authorization": `Bearer ${localStorage.getItem(tokenKey) || ""}`
  };
}

async function api(url, options={}){
  const response = await fetch(url, {
    ...options,
    headers: {...headers(!(options.body instanceof FormData)), ...(options.headers || {})}
  });

  if(response.status === 401){
    logout();
    throw new Error("Your session has expired. Please log in again.");
  }

  const data = await response.json().catch(()=>({}));

  if(!response.ok){
    throw new Error(data.error || "Request failed.");
  }

  return data;
}

function showLogin(){
  $("loginView").classList.remove("hidden");
  $("panelView").classList.add("hidden");
}

function showPanel(){
  $("loginView").classList.add("hidden");
  $("panelView").classList.remove("hidden");
}

function logout(){
  localStorage.removeItem(tokenKey);
  showLogin();
}

$("logoutBtn").addEventListener("click", logout);

$("mobileMenu").addEventListener("click", ()=>{
  $("sidebar").classList.toggle("open");
});

$("loginForm").addEventListener("submit", async (event)=>{
  event.preventDefault();
  $("loginError").textContent = "";

  try{
    const response = await fetch("/api/auth/login",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        email:$("email").value.trim(),
        password:$("password").value
      })
    });

    const data = await response.json();

    if(!response.ok){
      throw new Error(data.error || "Login failed");
    }

    localStorage.setItem(tokenKey,data.token);
    $("adminEmail").textContent = data.admin.email;
    showPanel();
    buildSidebar();
    renderDashboard();
  }catch(error){
    $("loginError").textContent = error.message;
  }
});

function buildSidebar(){
  $("sidebar").innerHTML = `
    <div class="sidebar-label">CONTENT</div>
    <button type="button" class="side-item ${current==="dashboard"?"active":""}" data-key="dashboard">
      <span class="side-icon">⌁</span><span>Dashboard</span>
    </button>
    ${Object.entries(sections).map(([key,section])=>`
      <button type="button" class="side-item ${current===key?"active":""}" data-key="${key}">
        <span class="side-icon">${section.icon}</span><span>${section.label}</span>
      </button>
    `).join("")}
    <div class="sidebar-spacer"></div>
    <div class="sidebar-footer">
      <div class="secure-label">SECURE CMS</div>
      <div>THE ROBOKNIGHTS</div>
    </div>
  `;

  $("sidebar").querySelectorAll("[data-key]").forEach(button=>{
    button.addEventListener("click",()=>{
      current = button.dataset.key;
      $("sidebar").classList.remove("open");
      buildSidebar();
      if(current==="dashboard") renderDashboard();
      else renderContentSection();
    });
  });
}

async function renderDashboard(){
  $("dashboardView").classList.remove("hidden");
  $("contentView").classList.add("hidden");

  const [competitions,robots,projects,achievements,team,gallery,sponsors,news] =
    await Promise.all([
      api("/api/admin/competitions"),
      api("/api/admin/robots"),
      api("/api/admin/projects"),
      api("/api/admin/achievements"),
      api("/api/admin/team"),
      api("/api/admin/gallery"),
      api("/api/admin/sponsors"),
      api("/api/admin/news")
    ]);

  const counts = [
    ["Competitions", competitions.length, "competitions"],
    ["Robots", robots.length, "robots"],
    ["Projects", projects.length, "projects"],
    ["Achievements", achievements.length, "achievements"],
    ["Team Members", team.length, "team"],
    ["Gallery Photos", gallery.length, "gallery"],
    ["Sponsors", sponsors.length, "sponsors"],
    ["News Posts", news.length, "news"]
  ];

  $("statsGrid").innerHTML = counts.map(([label,count,key])=>`
    <button class="stat-card" data-stat="${key}">
      <span>${label}</span>
      <strong>${count}</strong>
      <small>Manage →</small>
    </button>
  `).join("");

  $("statsGrid").querySelectorAll("[data-stat]").forEach(btn=>{
    btn.onclick=()=>{
      current=btn.dataset.stat;
      buildSidebar();
      renderContentSection();
    };
  });

  $("quickActions").innerHTML = [
    ["competitions","Add Competition","🏆"],
    ["robots","Add Robot","▣"],
    ["team","Add Team Member","◉"],
    ["gallery","Upload Photo","▧"],
    ["news","Publish Update","≡"]
  ].map(([key,label,icon])=>`
    <button class="quick-action" data-quick="${key}">
      <span>${icon}</span>${label}<b>+</b>
    </button>
  `).join("");

  $("quickActions").querySelectorAll("[data-quick]").forEach(btn=>{
    btn.onclick=async()=>{
      current=btn.dataset.quick;
      buildSidebar();
      renderContentSection();
      setTimeout(()=>openEditor(null),80);
    };
  });
}

async function renderContentSection(){
  $("dashboardView").classList.add("hidden");
  $("contentView").classList.remove("hidden");

  const section = sections[current];

  $("sectionKicker").textContent = section.label.toUpperCase();
  $("sectionTitle").textContent = section.label;
  $("sectionSub").textContent = section.desc;

  $("addBtn").textContent = `+ Add ${section.label.replace(" / Updates","")}`;

  $("searchInput").value = "";

  if(section.type==="settings"){
    $("addBtn").classList.add("hidden");
    $("toolbar").classList.add("hidden");
    await renderSettings();
  }else{
    $("addBtn").classList.remove("hidden");
    $("toolbar").classList.remove("hidden");
    await renderTable();
  }
}

async function renderSettings(){
  const settings = await api("/api/admin/settings");

  $("sectionCount").textContent = "Site configuration";

  $("tableWrap").innerHTML = `
    <div class="settings-page">
      <div class="settings-intro">
        <div class="settings-title">Homepage controls</div>
        <div class="settings-desc">These values appear directly on the public website.</div>
      </div>

      <div class="settings-form">
        ${settingsFields.map(field => fieldHtmlForSettings(field, settings[field[0]] || "")).join("")}
      </div>

      <div class="settings-save">
        <button id="saveSettings" class="primary-btn">Save Homepage Settings</button>
      </div>
    </div>
  `;

  $("saveSettings").onclick = async ()=>{
    const values = {};
    settingsFields.forEach(field=>{
      values[field[0]] = valueOf(field[0]);
    });

    await api("/api/admin/settings",{
      method:"PUT",
      body:JSON.stringify(values)
    });

    showToast("Homepage settings saved.");
  };
}

function fieldHtmlForSettings(field, value=""){
  return fieldHtml(field, value);
}

async function renderTable(){
  cache = await api(`/api/admin/${sections[current].path}`);

  const query = $("searchInput").value.trim().toLowerCase();

  const filtered = cache.filter(item=>{
    if(!query) return true;
    return JSON.stringify(item).toLowerCase().includes(query);
  });

  $("sectionCount").textContent =
    `${filtered.length} item${filtered.length===1?"":"s"}`;

  if(!filtered.length){
    $("tableWrap").innerHTML = `
      <div class="empty-state">
        <div class="empty-symbol">+</div>
        <h3>No ${sections[current].label.toLowerCase()} yet</h3>
        <p>Use the button above to add the first item.</p>
        <button id="emptyAdd" class="secondary-btn">Add ${sections[current].singular || sections[current].label}</button>
      </div>
    `;
    $("emptyAdd").onclick=()=>openEditor(null);
    return;
  }

  $("tableWrap").innerHTML = `
    <div class="table-head-row">
      <div>ITEM</div>
      <div>DETAIL</div>
      <div>STATUS</div>
      <div>ACTIONS</div>
    </div>
    ${filtered.map(item=>tableRow(item)).join("")}
  `;

  document.querySelectorAll("[data-edit-id]").forEach(btn=>{
    btn.onclick=()=>openEditor(Number(btn.dataset.editId));
  });

  document.querySelectorAll("[data-delete-id]").forEach(btn=>{
    btn.onclick=()=>deleteItem(Number(btn.dataset.deleteId));
  });
}

function tableRow(item){
  const title = item.name || item.title || "Untitled";
  const img = item.image || item.cover_image || item.logo;
  const detail = [
    item.category,
    item.role,
    item.position,
    item.result,
    item.year,
    item.tier,
    item.status
  ].filter(Boolean).join(" · ");

  return `
    <div class="table-row">
      <div class="item-main">
        ${img ? `<img src="${esc(img)}" alt="">` : `<div class="item-thumb-fallback">RK</div>`}
        <div>
          <strong>${esc(title)}</strong>
          <span>${esc(item.description || item.caption || item.excerpt || "")}</span>
        </div>
      </div>
      <div class="item-detail">${esc(detail || "—")}</div>
      <div>
        <span class="status ${item.published ? "published":"draft"}">
          <i></i>${item.published ? "Published":"Draft"}
        </span>
      </div>
      <div class="row-actions">
        <button class="row-btn" data-edit-id="${item.id}">Edit</button>
        <button class="row-btn danger" data-delete-id="${item.id}">Delete</button>
      </div>
    </div>
  `;
}

$("addBtn").onclick=()=>openEditor(null);
$("searchInput").addEventListener("input",()=>{
  if(current!=="homepage") renderTable();
});

function openEditor(id){
  editingId=id;

  const item = id
    ? cache.find(x=>x.id===id)
    : {};

  $("modalTitle").textContent =
    id ? `Edit ${sections[current].label.replace(" / Updates","").slice(0,-1) || "Item"}`
       : `Add ${sections[current].label.replace(" / Updates","").replace(/s$/,"")}`;

  $("fields").innerHTML = `
    ${fieldMap[current].map(field=>{
      const [key,label,type,required] = field;
      return fieldHtml(field,item[key] || "");
    }).join("")}

    <div class="field-full publish-field">
      <label class="check-label">
        <input id="f_published" type="checkbox" ${item.published!==false ? "checked":""}>
        <span>Publish this item on the public website</span>
      </label>
    </div>
  `;

  $("formError").textContent="";
  $("modal").classList.remove("hidden");
}

$("closeModal").onclick=closeModal;
$("cancelBtn").onclick=closeModal;

function closeModal(){
  $("modal").classList.add("hidden");
}

$("editorForm").onsubmit=async event=>{
  event.preventDefault();

  try{
    const payload={};

    fieldMap[current].forEach(field=>{
      payload[field[0]]=valueOf(field[0]);
    });

    payload.published=$("f_published").checked;

    await api(
      editingId
        ? `/api/admin/${sections[current].path}/${editingId}`
        : `/api/admin/${sections[current].path}`,
      {
        method:editingId ? "PUT":"POST",
        body:JSON.stringify(payload)
      }
    );

    closeModal();
    await renderTable();
    showToast("Saved successfully.");
  }catch(error){
    $("formError").textContent=error.message;
  }
};

async function uploadTo(key){
  const fileInput = document.getElementById(`u_${key}`);

  if(!fileInput || !fileInput.files[0]){
    alert("Choose an image first.");
    return;
  }

  const data = new FormData();
  data.append("image",fileInput.files[0]);

  try{
    const result = await api("/api/admin/upload",{
      method:"POST",
      body:data
    });

    document.getElementById(`f_${key}`).value=result.url;
    document.getElementById(`preview_${key}`).src=result.url;
    document.getElementById(`preview_${key}`).classList.remove("hidden");
  }catch(error){
    alert(error.message);
  }
}

function fieldHtml(field,value=""){
  const [key,label,type,required] = field;

  if(type==="textarea"){
    return `
      <div class="field field-full">
        <label>${label}${required?" *":""}</label>
        <textarea id="f_${key}" rows="5" ${required?"required":""}>${esc(value)}</textarea>
      </div>
    `;
  }

  if(type==="image"){
    return `
      <div class="field field-full">
        <label>${label}${required?" *":""}</label>
        <input id="f_${key}" type="text" value="${esc(value)}" ${required?"required":""} placeholder="/uploads/...">
        <div class="upload-line">
          <input id="u_${key}" type="file" accept="image/*">
          <button type="button" class="secondary-btn" onclick="uploadTo('${key}')">Upload Image</button>
        </div>
        <img id="preview_${key}" class="upload-preview ${value?"":"hidden"}" src="${esc(value)}" alt="">
      </div>
    `;
  }

  return `
    <div class="field">
      <label>${label}${required?" *":""}</label>
      <input id="f_${key}" type="${type}" value="${esc(value)}" ${required?"required":""}>
    </div>
  `;
}

function valueOf(key){
  const el=$(`f_${key}`);
  return el ? el.value : "";
}

async function deleteItem(id){
  if(!confirm("Delete this item permanently?")) return;

  try{
    await api(`/api/admin/${sections[current].path}/${id}`,{
      method:"DELETE"
    });

    await renderTable();
    showToast("Item deleted.");
  }catch(error){
    alert(error.message);
  }
}

function showToast(message){
  let toast=document.getElementById("toast");

  if(!toast){
    toast=document.createElement("div");
    toast.id="toast";
    toast.className="toast";
    document.body.appendChild(toast);
  }

  toast.textContent=message;
  toast.classList.add("show");

  setTimeout(()=>toast.classList.remove("show"),2200);
}

function esc(value){
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#039;"
  })[char]);
}

(async()=>{
  const token=localStorage.getItem(tokenKey);

  if(!token){
    showLogin();
    return;
  }

  try{
    const data=await api("/api/auth/me");
    $("adminEmail").textContent=data.admin.email;
    showPanel();
    buildSidebar();
    renderDashboard();
  }catch{
    showLogin();
  }
})();
