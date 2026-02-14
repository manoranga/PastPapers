# Render Deployment

## Option A: Use Blueprint (recommended)

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. **New** → **Blueprint**
3. Connect your GitHub repo
4. Render will detect `render.yaml` and create the service with correct settings
5. Deploy

## Option B: Manual service – set these exactly

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click your web service → **Settings** → **Build & Deploy**
3. **Build Command:** `pip install -r requirements.txt`
4. **Start Command:** `python -m gunicorn app:app --bind 0.0.0.0:$PORT`
5. **Save** → **Manual Deploy** → **Deploy latest commit**

---

**Important:** Using `python -m gunicorn` avoids PATH issues on Render. Do NOT use:
- `gunicorn>=21.0.0` (that's a package name for requirements.txt)
- `start.sh` (no script – use the command directly)
