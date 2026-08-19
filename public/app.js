const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const imageOr = (url, alt="") => url ? `<img src="${esc(url)}" alt="${esc(alt)}">` : `<div class="image-fallback">RK</div>`;

function cards(data){
  document.getElementById("robotsGrid").innerHTML = data.robots.map(x=>`
    <article class="content-card">
      <div class="card-image">${imageOr(x.image,x.name)}</div>
      <div class="card-body"><p class="eyebrow">${esc(x.category||"ROBOT")}</p><h3>${esc(x.name)}</h3>
      <p>${esc(x.subtitle||"")}</p><p class="muted">${esc(x.description||"")}</p></div>
    </article>`).join("") || `<div class="empty-card">Robots will be added from the Developer Panel.</div>`;

  document.getElementById("competitionsGrid").innerHTML = data.competitions.map(x=>`
    <article class="content-card">
      <div class="card-image">${imageOr(x.cover_image,x.name)}</div>
      <div class="card-body"><div class="card-meta"><span>${esc(x.category||"ROBOTICS")}</span><span>${esc(x.year||"")}</span></div>
      <h3>${esc(x.name)}</h3><p class="result">${esc(x.position||"")}</p><p class="muted">${esc(x.prize||"")}</p><p class="muted">${esc(x.location||"")}</p></div>
    </article>`).join("") || `<div class="empty-card">Competition history will appear here.</div>`;

  document.getElementById("projectsGrid").innerHTML = data.projects.map(x=>`
    <article class="content-card">
      <div class="card-image">${imageOr(x.image,x.name)}</div>
      <div class="card-body"><p class="eyebrow">${esc(x.category||"PROJECT")}</p><h3>${esc(x.name)}</h3>
      <p class="result">${esc(x.status||"")}</p><p class="muted">${esc(x.description||"")}</p></div>
    </article>`).join("") || `<div class="empty-card">Projects will appear here.</div>`;

  document.getElementById("achievementsGrid").innerHTML = data.achievements.map(x=>`
    <article class="achievement"><span>${esc(x.year||"")}</span><h3>${esc(x.title)}</h3><strong>${esc(x.result||"")}</strong><p>${esc(x.event||"")}</p></article>`).join("") || `<div class="empty-card">Achievements will appear here.</div>`;

  document.getElementById("teamGrid").innerHTML = data.team.map(x=>`
    <article class="content-card"><div class="card-image">${imageOr(x.image,x.name)}</div>
    <div class="card-body"><p class="eyebrow">${esc(x.role||"TEAM")}</p><h3>${esc(x.name)}</h3><p class="muted">${esc(x.bio||"")}</p></div></article>`).join("") || `<div class="empty-card">Team profiles will appear here.</div>`;

  document.getElementById("galleryGrid").innerHTML = data.gallery.map(x=>`
    <figure class="gallery-item"><img src="${esc(x.image)}" alt="${esc(x.title||"THE ROBOKNIGHTS")}"><figcaption>${esc(x.caption||x.title||"")}</figcaption></figure>`).join("") || `<div class="empty-card">Upload your stage and competition photos in Developer → Gallery.</div>`;

  document.getElementById("sponsorsGrid").innerHTML = data.sponsors.map(x=>`
    <a class="sponsor" href="${esc(x.website||"#")}" ${x.website?'target="_blank" rel="noopener"':''}>
      ${x.logo?`<img src="${esc(x.logo)}" alt="${esc(x.name)}">`:`<span>${esc(x.name)}</span>`}
      <small>${esc(x.tier||"PARTNER")}</small>
    </a>`).join("") || `<div class="empty-card">Sponsors will appear here.</div>`;

  document.getElementById("newsGrid").innerHTML = data.news.map(x=>`
    <article class="news-card">${x.image?`<img src="${esc(x.image)}" alt="">`:""}
      <div><p class="eyebrow">${esc(x.date||"UPDATE")}</p><h3>${esc(x.title)}</h3><p>${esc(x.excerpt||"")}</p></div></article>`).join("") || `<div class="empty-card">Updates will appear here.</div>`;
}

fetch("/api/site").then(r=>r.json()).then(data=>{
  const s=data.settings||{};
  document.getElementById("brandName").textContent=s.teamName||"THE ROBOKNIGHTS";
  document.getElementById("heroTitle").innerHTML=esc(s.heroTitle||s.teamName||"THE ROBOKNIGHTS").replace(" ","<br>");
  document.getElementById("tagline").textContent=s.tagline||"OOOOOOOH BIGGG LOSSS";
  document.getElementById("heroDescription").textContent=s.heroDescription||"";
  document.getElementById("aboutTitle").textContent=s.aboutTitle||"Engineering under pressure.";
  document.getElementById("aboutText").textContent=s.aboutText||"";
  document.getElementById("instagramLink").href=s.instagram||"#";
  document.getElementById("footerName").textContent=s.teamName||"THE ROBOKNIGHTS";
  document.getElementById("footerTagline").textContent=s.tagline||"OOOOOOOH BIGGG LOSSS";
  document.getElementById("footerInstagram").href=s.instagram||"#";
  if(s.heroImage) document.getElementById("heroImage").style.backgroundImage=`url("${s.heroImage}")`;
  cards(data);
}).catch(err=>console.error(err));

window.addEventListener("scroll",()=>document.querySelector(".site-header")?.classList.toggle("scrolled",window.scrollY>24));
