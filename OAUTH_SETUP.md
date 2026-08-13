# Setting up your Admin Panel (Decap CMS) login

Your site now has an admin panel at **`/admin/`** where you can add/remove
photos, edit bio text, resume details, and the accent color — all through
forms, no code.

Before it works, GitHub login needs to be wired up. This takes about
10 minutes and only needs to be done **once**. These two steps must be done
by you directly (I can't create accounts or OAuth apps on your behalf) —
everything else is already built and in the repo.

---

## Step 1 — Create a GitHub OAuth App

1. Go to **https://github.com/settings/developers** (make sure you're logged
   in as `vizz-bob`)
2. Click **"New OAuth App"**
3. Fill in:
   - **Application name:** `Vijayendra Actor Portfolio CMS`
   - **Homepage URL:** `https://vizz-bob.github.io/vijayendra-actor/`
   - **Authorization callback URL:** `https://vijayendra-cms-auth.<your-subdomain>.workers.dev/callback`
     (you'll get the exact `<your-subdomain>` part in Step 2 — come back and
     fill this in after, or use a placeholder now and edit it later in the
     OAuth App settings page)
4. Click **"Register application"**
5. Click **"Generate a new client secret"** — copy both the **Client ID**
   and the **Client Secret** somewhere safe. The secret is shown only once.

## Step 2 — Deploy the login proxy (Cloudflare Worker)

This is the small server that holds your Client Secret and completes the
GitHub login handshake. The code is already written for you at
`oauth-worker/worker.js` in this repo.

1. Go to **https://dash.cloudflare.com** and sign up free if you don't have
   an account
2. Go to **Workers & Pages → Create → Create Worker**
3. Give it a name, e.g. `vijayendra-cms-auth` — note the URL it gives you,
   e.g. `https://vijayendra-cms-auth.yourname.workers.dev`
4. Click **Edit code**, delete the default sample code, and paste in the
   entire contents of `oauth-worker/worker.js` from this repo. Click
   **Deploy**.
5. Go to the Worker's **Settings → Variables and Secrets**, and add two
   **encrypted** secrets:
   - `GITHUB_CLIENT_ID` = (the Client ID from Step 1)
   - `GITHUB_CLIENT_SECRET` = (the Client Secret from Step 1)
6. Go back to your GitHub OAuth App (Step 1) and make sure the
   **Authorization callback URL** matches exactly:
   `https://<your-worker-subdomain>.workers.dev/callback`

## Step 3 — Point the CMS at your worker

Tell me your worker's URL once it's deployed (e.g.
`https://vijayendra-cms-auth.yourname.workers.dev`) and I'll update
`admin/config.yml`'s `base_url` to match and push it — or you can edit that
one line yourself directly on GitHub (open `admin/config.yml` → edit →
replace `https://REPLACE-ME.workers.dev` with your worker URL → commit).

## Step 4 — Log in

Visit **`https://vizz-bob.github.io/vijayendra-actor/admin/`**, click
**"Login with GitHub"**, authorize the app, and you'll see the editing
panel — Site Content on the left, with photos, bio, resume, and contact
info all editable through forms. Every save commits directly to the repo
and your live site updates within a minute or two.

---

**Security note:** the Client Secret only ever lives in Cloudflare's
encrypted secret storage — never in this repo, never visible in your
browser. Only you (logged into `vizz-bob` on GitHub) can authorize the CMS
to make changes.
