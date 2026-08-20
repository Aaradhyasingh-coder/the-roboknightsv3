
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const imageOr=(url,alt="")=>url?`<img src="${esc(url)}" alt="${esc(alt)}">`:`<div class="image-fallback">RK</div>`;

function render(data){
 const s=data.settings||{};
 const set=(id,v)=>{const e=document.getElementById(id);if(e&&v!==undefined)e.textContent=v};
 set("brandName",s.teamName||"THE ROBOKNIGHTS");
 const brandLogo=document.getElementById("brandLogo");
 const heroLogo=document.getElementById("heroLogo");

 if(s.logoImage){
   if(brandLogo){
     brandLogo.src=s.logoImage;
     brandLogo.classList.remove("hidden");
   }
   if(heroLogo){
     heroLogo.src=s.logoImage;
     heroLogo.classList.remove("hidden");
   }
 }

 set("heroKicker",s.heroKicker||"COMPETITIVE ROBOTICS TEAM");
 set("heroTitle",s.heroTitle||s.teamName||"THE ROBOKNIGHTS");
 set("tagline",s.tagline||"CHIVALRY IS NOT DEAD IT IS AUTOMATED");
 set("heroDescription",s.heroDescription||"");
 set("heroPrimary",s.heroPrimaryText||"ENTER THE ARENA"); document.getElementById("heroPrimary").href=s.heroPrimaryLink||"#competitions";
 set("heroSecondary",s.heroSecondaryText||"MEET THE TEAM"); document.getElementById("heroSecondary").href=s.heroSecondaryLink||"#team";
 ["One","Two","Three","Four"].forEach(n=>{set("stat"+n+"Value",s["stat"+n+"Value"]||"00+");set("stat"+n+"Label",s["stat"+n+"Label"]||"")});
 set("aboutTitle",s.aboutTitle||"WHERE ENGINEERING MEETS THE ARENA"); set("aboutText",s.aboutText||"");
 set("whyTitle",s.whyTitle||"WHY WE BUILD");
 set("showcaseKicker",s.showcaseKicker||"BUILT FOR THE ARENA");set("showcaseTitle",s.showcaseTitle||"DESIGN. TEST. REPEAT.");set("showcaseText",s.showcaseText||"");set("showcaseOne",s.showcaseOne||"");set("showcaseTwo",s.showcaseTwo||"");set("showcaseThree",s.showcaseThree||"");set("showcaseFour",s.showcaseFour||"");
   set("testimonialQuote",`“${s.testimonialQuote||"The best part isn't the trophy. It's seeing a machine you built actually come alive."}”`);
 set("testimonialName",s.testimonialName||"THE ROBOKNIGHTS");set("testimonialRole",s.testimonialRole||"TEAM");
 set("contactText",s.contactText||""); set("locationText",s.location||"");
 document.getElementById("contactEmailLink").href=s.contactEmail?`mailto:${s.contactEmail}`:"#";
 document.getElementById("contactEmailLink").innerHTML=`EMAIL <span>↗</span>${s.contactEmail?`<small>${esc(s.contactEmail)}</small>`:""}`;
 document.getElementById("contactPhoneLink").href=s.phone?`tel:${s.phone.replace(/\s+/g,"")}`:"#";
 document.getElementById("contactPhoneLink").innerHTML=`PHONE <span>↗</span>${s.phone?`<small>${esc(s.phone)}</small>`:""}`;
 [["instagramLink","instagram"],["youtubeLink","youtube"],["linkedinLink","linkedin"]].forEach(([id,k])=>{const e=document.getElementById(id);e.href=s[k]||"#"});
 if(s.heroImage)document.getElementById("heroImage").style.backgroundImage=`url("${s.heroImage}")`;
 const marquee=(s.marqueeText||"BUILD • CODE • COMPETE • CONQUER • ROBOKNIGHTS • ");set("marqueeText",marquee);set("marqueeTextClone",marquee);
 document.getElementById("competitionGrid").innerHTML=data.competitions.length?data.competitions.map(x=>`
  <article class="event-card"><div class="event-image">${imageOr(x.cover_image,x.name)}<span class="event-number">${String(x.competition_number||"01").padStart(2,"0")}</span></div>
   <div class="event-body"><div class="event-top"><span>${esc(x.category||"COMPETITION")}</span><span>${esc(x.year||"")}</span></div><h3>${esc(x.name)}</h3><p>${esc(x.description||"Build. Code. Compete.")}</p><div class="event-bottom"><strong>${esc(x.position||"RESULT")}</strong><span>${esc(x.location||"")}</span></div></div></article>`).join(""):`<div class="empty">Competition history will appear here.</div>`;
 document.getElementById("robotsGrid").innerHTML=data.robots.length?data.robots.map(x=>`<article class="machine"><div class="machine-img">${imageOr(x.image,x.name)}</div><div class="machine-meta"><span>${esc(x.category||"MACHINE")}</span><span>${esc(x.sort_order||"01")}</span></div><h3>${esc(x.name)}</h3><p>${esc(x.subtitle||x.description||"")}</p></article>`).join(""):`<div class="empty">Robot profiles will appear here.</div>`;
 document.getElementById("whyGrid").innerHTML=[
  [s.whyOneTitle,s.whyOneText,"01"],[s.whyTwoTitle,s.whyTwoText,"02"],[s.whyThreeTitle,s.whyThreeText,"03"]
 ].map(x=>`<article class="why-card"><span>${x[2]}</span><h3>${esc(x[0]||"")}</h3><p>${esc(x[1]||"")}</p></article>`).join("");
 document.getElementById("projectGrid").innerHTML=data.projects.length?data.projects.map(x=>`<article class="project-card"><div class="project-img">${imageOr(x.image,x.name)}</div><div class="project-copy"><span>${esc(x.category||"PROJECT")} · ${esc(x.year||"")}</span><h3>${esc(x.name)}</h3><p>${esc(x.description||"")}</p><strong>${esc(x.status||"ACTIVE")}</strong></div></article>`).join(""):`<div class="empty">Projects will appear here.</div>`;
 document.getElementById("achievementGrid").innerHTML=data.achievements.length?data.achievements.map(x=>`<article class="achievement-card"><span>${esc(x.year||"")}</span><h3>${esc(x.title)}</h3><strong>${esc(x.result||"")}</strong><p>${esc(x.event||"")}</p></article>`).join(""):`<div class="empty">Achievements will appear here.</div>`;
 document.getElementById("teamGrid").innerHTML=data.team.length?data.team.map(x=>`<article class="member"><div class="member-img">${imageOr(x.image,x.name)}</div><div class="member-copy"><span>${esc(x.role||"TEAM")}</span><h3>${esc(x.name)}</h3><p>${esc(x.bio||"")}</p></div></article>`).join(""):`<div class="empty">Team members will appear here.</div>`;
 document.getElementById("galleryGrid").innerHTML=data.gallery.length?data.gallery.map(x=>`<figure><img src="${esc(x.image)}" alt="${esc(x.title||"THE ROBOKNIGHTS")}"><figcaption>${esc(x.caption||x.title||"")}</figcaption></figure>`).join(""):`<div class="empty">Upload your real competition photographs from the Developer CMS.</div>`;
 document.getElementById("sponsorGrid").innerHTML=data.sponsors.length?data.sponsors.map(x=>`<a class="partner" href="${esc(x.website||"#")}" ${x.website?'target="_blank" rel="noopener"':''}>${x.logo?`<img src="${esc(x.logo)}" alt="${esc(x.name)}">`:`<b>${esc(x.name)}</b>`}<small>${esc(x.tier||"PARTNER")}</small></a>`).join(""):`<div class="empty">Sponsors will appear here.</div>`;
 const faqs=[["faqOneQ","faqOneA"],["faqTwoQ","faqTwoA"],["faqThreeQ","faqThreeA"]];
 document.getElementById("faqGrid").innerHTML=faqs.map(([q,a],i)=>`<details ${i===0?"open":""}><summary>${esc(s[q]||"Question")}</summary><p>${esc(s[a]||"")}</p></details>`).join("");
 document.getElementById("yearNow").textContent=new Date().getFullYear();
}
fetch("/api/site").then(r=>r.json()).then(render).catch(console.error);
const header=document.querySelector(".site-header");window.addEventListener("scroll",()=>header?.classList.toggle("scrolled",scrollY>20));

const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("is-visible");}),{threshold:.16});
document.querySelectorAll("section").forEach(s=>{s.classList.add("reveal");revealObserver.observe(s)});
const navLinks=[...document.querySelectorAll("header nav a[href^='#']")];
const navObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){navLinks.forEach(a=>a.classList.toggle("active",a.getAttribute("href")===`#${e.target.id}`));}}),{rootMargin:"-35% 0px -55% 0px"});
document.querySelectorAll("section[id]").forEach(s=>navObserver.observe(s));
