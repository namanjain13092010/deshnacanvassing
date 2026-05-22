# Deshna Canvassing — Production Deployment Guide

Two deployment options are included in this repo:

| File | Use it when |
|---|---|
| `/app/render.yaml` | **Recommended.** Deploys backend + frontend together on Render in one click. |
| `/app/frontend/vercel.json` | You want the frontend on Vercel and the backend on Render/Railway. |
| `/app/backend/Dockerfile` | You prefer Docker (Railway, Fly.io, Cloud Run, any container host). |

---

## OPTION A — Render Blueprint (easiest, one click) 🎯

### Step 1 — MongoDB Atlas (free, 5 minutes)
1. Go to https://www.mongodb.com/atlas → Sign up free.
2. Build a **free M0 cluster** (512 MB, plenty for a contact-form site).
3. **Database Access**: create a user (e.g. `deshna_admin`) with a password.
4. **Network Access**: add IP `0.0.0.0/0` (allow from anywhere — Render needs this).
5. Click **Connect → Drivers → Python → copy the connection string**. It looks like:
   ```
   mongodb+srv://deshna_admin:<password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   Replace `<password>` with your actual password.

### Step 2 — Push code to GitHub
```bash
cd /app
git init && git add . && git commit -m "Initial deploy"
# Create an empty repo on github.com (e.g. deshna-canvassing) then:
git remote add origin https://github.com/<your-user>/deshna-canvassing.git
git branch -M main
git push -u origin main
```

### Step 3 — Deploy on Render
1. Go to https://render.com → Sign in with GitHub.
2. **New → Blueprint** → select your repo → Render auto-detects `render.yaml`.
3. It will create **two services**: `deshna-backend` and `deshna-canvassing` (frontend).
4. Render asks you to set the **synced env vars**:
   - `MONGO_URL` → paste your Atlas connection string from Step 1.
   - `CORS_ORIGINS` → set to your frontend URL once it deploys (you can use `*` initially, then tighten after).
   - `REACT_APP_BACKEND_URL` → set to your backend URL after backend deploys (e.g. `https://deshna-backend.onrender.com`).
5. Click **Apply** → wait ~5–8 minutes for both services to build.
6. **First-deploy tip**: deploy the **backend first** so you have its URL, then update `REACT_APP_BACKEND_URL` on the frontend and trigger a redeploy.

### Step 4 — Verify
- Open the backend URL + `/api/` → should return `{"message": "Deshna Canvassing API", "status": "running"}`.
- Open the frontend URL → full site should load.
- Submit a test message via the contact form → check Atlas Collections → `contact_inquiries` should have your test row.

### Step 5 — Custom domain (optional)
- In Render dashboard → your frontend service → **Settings → Custom Domains → Add**.
- Add `deshnacanvassing.com` (or whatever you own).
- Render shows you a CNAME or A record — add it at your registrar (GoDaddy / Namecheap / etc.).
- DNS propagates in 5 minutes–24 hours. SSL is auto-issued.

---

## OPTION B — Vercel (frontend) + Render (backend)

Use this if you want Vercel's CDN for the frontend.

1. **Backend on Render**: in the Render dashboard, manually create a Web Service (not Blueprint) pointing at `/backend` with the same env vars as Option A.
2. **Frontend on Vercel**: 
   - https://vercel.com → New Project → import repo.
   - Root directory: `frontend`
   - Framework: Create React App (auto-detected from `vercel.json`).
   - Add env var: `REACT_APP_BACKEND_URL` = your Render backend URL.
   - Deploy.

---

## OPTION C — Docker (Railway / Fly.io / Cloud Run)

A `Dockerfile` is provided at `/app/backend/Dockerfile`. To deploy on Railway:
```bash
cd /app/backend
railway login && railway init && railway up
```
Then set the env vars `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS` in the Railway dashboard.

For the frontend, use Vercel/Netlify/Cloudflare Pages with `frontend/` as root and the build settings from `vercel.json`.

---

## Cost Snapshot

| Service | Plan | Cost |
|---|---|---|
| Render web service (backend) | Free | $0 (spins down after 15 min inactivity → 30s cold start). Upgrade to **Starter $7/mo** for always-on. |
| Render static site (frontend) | Free | $0 always (100 GB bandwidth/mo) |
| MongoDB Atlas | M0 Free | $0 (512 MB) |
| Custom domain | — | Whatever your registrar charges (~$10–15/yr) |
| **Total realistic monthly** | | **$0 (cold starts) or $7/mo (no cold starts)** |

The contact form will work on the free tier; the only cost-trigger is if you want the backend to respond instantly 24/7 (Render Starter $7/mo) or if traffic grows beyond Atlas M0's 512 MB.

---

## After-Deploy Checklist

- [ ] Backend health endpoint returns 200 (`/api/`)
- [ ] Frontend loads, cinematic loader plays
- [ ] All 15 brand products render in the cinema
- [ ] Contact form submits a test inquiry → appears in MongoDB Atlas
- [ ] WhatsApp button opens https://wa.me/919901112555
- [ ] Phone tel: links open dialer on mobile
- [ ] Custom domain (if set up) resolves with HTTPS

---

## Tighten CORS for production

After everything is working, replace `CORS_ORIGINS=*` on the backend with your actual frontend URL:
```
CORS_ORIGINS=https://deshna-canvassing.onrender.com,https://deshnacanvassing.com
```
Then redeploy the backend.
