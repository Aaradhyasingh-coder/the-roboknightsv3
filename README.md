
# THE ROBOKNIGHTS V3.5

A polished robotics-team website with a separate professional CMS.

## Frontend
- Premium grey / graphite / silver visual system
- Glass-style navigation
- Cinematic hero
- Advanced cards and hover motion
- Responsive mobile layout
- Robotics team sections

## Developer CMS
- Completely different UI from the public site
- Dashboard with content statistics
- Homepage editor
- Competitions
- Robots
- Projects
- Achievements
- Team
- Gallery
- Sponsors
- News / Updates
- Search
- Add / Edit / Delete
- Publish / Draft
- Image uploads
- Public-site preview link

## Local setup

```cmd
cd C:\Users\2011a\Desktop\the-roboknights-v3.5
npm install
```

Create `.env`:

```env
PORT=3000
JWT_SECRET=YOUR_LONG_RANDOM_SECRET
ADMIN_EMAIL=AARADHYA
ADMIN_PASSWORD=YOUR_PASSWORD
```

Then:

```cmd
npm start
```

Public:
http://localhost:3000

Developer:
http://localhost:3000/developer

Keep `.env` private.


## Important route

Developer CMS is explicitly routed to:

`/developer`

If you change server routing, keep this route before the public frontend fallback.
