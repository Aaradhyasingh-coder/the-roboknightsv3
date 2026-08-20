require("dotenv").config();

const express = require("express");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Database = require("better-sqlite3");
const multer = require("multer");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || "change-me";

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, "public");
const UPLOAD_DIR = path.join(PUBLIC_DIR, "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

app.use(express.json({ limit: "4mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(PUBLIC_DIR));

const db = new Database(path.join(ROOT, "roboknights.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS competitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, year INTEGER, category TEXT, position TEXT, prize TEXT,
  location TEXT, date TEXT, competition_number TEXT, description TEXT,
  cover_image TEXT, published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS robots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, subtitle TEXT, category TEXT, description TEXT,
  specs TEXT, image TEXT, published INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, year INTEGER, category TEXT, description TEXT,
  status TEXT, image TEXT, published INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS team (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, role TEXT, bio TEXT, image TEXT,
  published INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL, event TEXT, year INTEGER, result TEXT, prize TEXT,
  description TEXT, image TEXT, published INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS gallery (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT, image TEXT NOT NULL, category TEXT, caption TEXT,
  published INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sponsors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, website TEXT, tier TEXT, logo TEXT, description TEXT,
  published INTEGER NOT NULL DEFAULT 1,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS news (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL, date TEXT, excerpt TEXT, content TEXT, image TEXT,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
`);

const defaults = {
  teamName: "THE ROBOKNIGHTS",
  tagline: "CHIVALRY IS NOT DEAD IT IS AUTOMATED",
  logoImage: "",
  heroKicker: "COMPETITIVE ROBOTICS TEAM",
  heroTitle: "THE ROBOKNIGHTS",
  heroDescription: "Build. Break. Rebuild. Compete. A team of young engineers turning ideas into machines.",
  heroPrimaryText: "ENTER THE ARENA",
  heroPrimaryLink: "#competitions",
  heroSecondaryText: "MEET THE TEAM",
  heroSecondaryLink: "#team",
  heroImage: "",
  instagram: "https://www.instagram.com/_theroboknights/",
  youtube: "",
  linkedin: "",
  whatsapp: "",
  contactEmail: "",
  phone: "",
  location: "",
  contactText: "For collaborations, sponsorships, competitions and partnerships.",
  aboutTitle: "WHERE ENGINEERING MEETS THE ARENA",
  aboutText: "THE ROBOKNIGHTS is a competitive robotics team building autonomous and remote-controlled machines, learning under pressure and returning to the workshop stronger after every match.",
  marqueeText: "BUILD • CODE • COMPETE • CONQUER • ROBOKNIGHTS • ",
  statOneLabel: "COMPETITIONS", statOneValue: "00+",
  statTwoLabel: "PROJECTS", statTwoValue: "00+",
  statThreeLabel: "AWARDS", statThreeValue: "00+",
  statFourLabel: "ENGINEERING HOURS", statFourValue: "0000+",
  whyTitle: "WHY WE BUILD",
  whyOneTitle: "Real Engineering", whyOneText: "Prototype, test, fail, iterate and compete.",
  whyTwoTitle: "Built Under Pressure", whyTwoText: "The arena turns designs into decisions.",
  whyThreeTitle: "Always Learning", whyThreeText: "Every robot teaches the next one something new.",
  showcaseKicker: "BUILT FOR THE ARENA",
  showcaseTitle: "DESIGN. TEST. REPEAT.",
  showcaseText: "From the first CAD sketch to the final match, every machine is shaped by testing, failure and iteration.",
  showcaseOne: "01 · CAD & FABRICATION",
  showcaseTwo: "02 · ELECTRONICS & CONTROL",
  showcaseThree: "03 · SOFTWARE & AUTONOMY",
  showcaseFour: "04 · COMPETITION READY",
  testimonialQuote: "The best part isn't the trophy. It's seeing a machine you built actually come alive.",
  testimonialName: "THE ROBOKNIGHTS", testimonialRole: "TEAM",
  faqOneQ: "What does THE ROBOKNIGHTS compete in?", faqOneA: "Robotics competitions including line following, combat, innovation and other engineering challenges.",
  faqTwoQ: "Can I collaborate with the team?", faqTwoA: "Yes. Use the contact section for sponsorships, mentorship, collaborations and event opportunities.",
  faqThreeQ: "Where can I follow the team?", faqThreeA: "Follow THE ROBOKNIGHTS on Instagram and the social links managed from the Developer CMS."
};

const insertSetting = db.prepare("INSERT OR IGNORE INTO site_settings (key,value) VALUES (?,?)");
for (const [k, v] of Object.entries(defaults)) insertSetting.run(k, v);

const adminEmail = process.env.ADMIN_EMAIL || "developer@roboknights.com";
const adminPassword = process.env.ADMIN_PASSWORD || "CHANGE_THIS_PASSWORD";
if (!db.prepare("SELECT id FROM admins WHERE email=?").get(adminEmail)) {
  db.prepare("INSERT INTO admins (email,password_hash) VALUES (?,?)")
    .run(adminEmail, bcrypt.hashSync(adminPassword, 12));
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext)
      .replace(/[^a-z0-9-_]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "image";
    cb(null, `${Date.now()}-${base}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = ["image/jpeg","image/png","image/webp","image/gif"].includes(file.mimetype);
    cb(null, ok);
  }
});

function auth(req,res,next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) return res.status(401).json({error:"Authentication required"});
  try { req.admin = jwt.verify(token, JWT_SECRET); next(); }
  catch { return res.status(401).json({error:"Session expired"}); }
}
function tokenFor(admin) {
  return jwt.sign({id:admin.id,email:admin.email}, JWT_SECRET, {expiresIn:"8h"});
}
const bool = v => v ? 1 : 0;
const mapRow = r => {
  if (!r) return r;
  const x = {...r};
  if ("published" in x) x.published = !!x.published;
  return x;
};
const getAll = (table, where="", order="id DESC") =>
  db.prepare(`SELECT * FROM ${table} ${where} ORDER BY ${order}`).all().map(mapRow);

app.post("/api/auth/login",(req,res)=>{
  const {email,password}=req.body||{};
  const a=db.prepare("SELECT * FROM admins WHERE email=?").get(email||"");
  if(!a || !bcrypt.compareSync(password||"",a.password_hash))
    return res.status(401).json({error:"Incorrect developer login"});
  res.json({token:tokenFor(a),admin:{id:a.id,email:a.email}});
});
app.get("/api/auth/me",auth,(req,res)=>res.json({admin:req.admin}));

app.get("/api/site",(req,res)=>{
  const settings=Object.fromEntries(db.prepare("SELECT key,value FROM site_settings").all().map(x=>[x.key,x.value]));
  const data = {
    settings,
    competitions:getAll("competitions","WHERE published=1","COALESCE(year,0) DESC, id DESC"),
    robots:getAll("robots","WHERE published=1","sort_order ASC, id DESC"),
    projects:getAll("projects","WHERE published=1","sort_order ASC, id DESC"),
    team:getAll("team","WHERE published=1","sort_order ASC, id DESC"),
    achievements:getAll("achievements","WHERE published=1","sort_order ASC, id DESC"),
    gallery:getAll("gallery","WHERE published=1","sort_order ASC, id DESC"),
    sponsors:getAll("sponsors","WHERE published=1","sort_order ASC, id DESC"),
    news:getAll("news","WHERE published=1","COALESCE(date,'') DESC, id DESC")
  };
  res.json(data);
});

app.get("/api/admin/settings",auth,(req,res)=>{
  res.json(Object.fromEntries(db.prepare("SELECT key,value FROM site_settings").all().map(x=>[x.key,x.value])));
});
app.put("/api/admin/settings",auth,(req,res)=>{
  const stmt=db.prepare("INSERT INTO site_settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value");
  const tx=db.transaction(obj=>{for(const [k,v] of Object.entries(obj)) stmt.run(k,String(v??""));});
  tx(req.body||{});
  res.json({ok:true});
});

const resources = {
  competitions: {
    table:"competitions",
    fields:["name","year","category","position","prize","location","date","competition_number","description","cover_image","published"]
  },
  robots: {
    table:"robots",
    fields:["name","subtitle","category","description","specs","image","published","sort_order"]
  },
  projects: {
    table:"projects",
    fields:["name","year","category","description","status","image","published","sort_order"]
  },
  team: {
    table:"team",
    fields:["name","role","bio","image","published","sort_order"]
  },
  achievements: {
    table:"achievements",
    fields:["title","event","year","result","prize","description","image","published","sort_order"]
  },
  gallery: {
    table:"gallery",
    fields:["title","image","category","caption","published","sort_order"]
  },
  sponsors: {
    table:"sponsors",
    fields:["name","website","tier","logo","description","published","sort_order"]
  },
  news: {
    table:"news",
    fields:["title","date","excerpt","content","image","published"]
  }
};

function adminCrud(name) {
  const r=resources[name], table=r.table, fields=r.fields;
  return {
    list:(req,res)=>res.json(getAll(table)),
    create:(req,res)=>{
      const data=req.body||{};
      const cols=fields;
      const vals=cols.map(k=>data[k] ?? "");
      const placeholders=cols.map(()=>"?").join(",");
      const result=db.prepare(`INSERT INTO ${table} (${cols.join(",")}) VALUES (${placeholders})`).run(...vals.map((v,i)=>fields[i]==="published"||fields[i]==="sort_order"||fields[i]==="year" ? (v===""?null:(fields[i]==="published"?bool(v):Number(v))) : v));
      res.status(201).json(mapRow(db.prepare(`SELECT * FROM ${table} WHERE id=?`).get(result.lastInsertRowid)));
    },
    update:(req,res)=>{
      const id=Number(req.params.id), data=req.body||{};
      const sets=fields.map(k=>`${k}=?`).join(",");
      const vals=fields.map(k=>data[k] ?? "").map((v,i)=>{
        const k=fields[i];
        if(k==="published") return bool(v);
        if(k==="sort_order"||k==="year") return v===""?null:Number(v);
        return v;
      });
      vals.push(id);
      const result=db.prepare(`UPDATE ${table} SET ${sets}${table!=="gallery"?", updated_at=CURRENT_TIMESTAMP":""} WHERE id=?`).run(...vals);
      if(!result.changes) return res.status(404).json({error:"Item not found"});
      res.json(mapRow(db.prepare(`SELECT * FROM ${table} WHERE id=?`).get(id)));
    },
    remove:(req,res)=>{
      const id=Number(req.params.id);
      const row=db.prepare(`SELECT * FROM ${table} WHERE id=?`).get(id);
      if(!row) return res.status(404).json({error:"Item not found"});
      db.prepare(`DELETE FROM ${table} WHERE id=?`).run(id);
      for(const k of ["image","cover_image","logo"]) if(row[k]?.startsWith("/uploads/")){
        const f=path.join(PUBLIC_DIR,row[k].replace(/^\/+/,""));
        if(fs.existsSync(f)) fs.unlinkSync(f);
      }
      res.json({ok:true});
    }
  };
}

for(const name of Object.keys(resources)){
  const c=adminCrud(name);
  app.get(`/api/admin/${name}`,auth,c.list);
  app.post(`/api/admin/${name}`,auth,c.create);
  app.put(`/api/admin/${name}/:id`,auth,c.update);
  app.delete(`/api/admin/${name}/:id`,auth,c.remove);
}

app.post("/api/admin/upload",auth,upload.single("image"),(req,res)=>{
  if(!req.file) return res.status(400).json({error:"Upload a JPG, PNG, WEBP or GIF"});
  res.json({url:`/uploads/${req.file.filename}`});
});

app.get("/developer",(req,res)=>{
  res.sendFile(path.join(PUBLIC_DIR,"developer.html"));
});

app.get("/developer/",(req,res)=>{
  res.sendFile(path.join(PUBLIC_DIR,"developer.html"));
});

app.use((req,res,next)=>{
  if(req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(PUBLIC_DIR,"index.html"));
});

app.use((err,_req,res,_next)=>{
  console.error(err);
  res.status(500).json({error:"Unexpected server error"});
});

app.listen(PORT,()=>console.log(`THE ROBOKNIGHTS: http://localhost:${PORT}`));
