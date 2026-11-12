# ASHINUR STORE

A responsive static storefront for **ASHINUR STORE** — “Your Digital World, One Destination.”

## Files
- `index.html` — responsive storefront, sample product catalogue, cart and service enquiry forms.
- `admin.html` — links the store owner to the Cloudflare Worker admin login.
- `worker/worker.js` — GitHub OAuth backend for Cloudflare Workers.
- `worker/wrangler.toml` — Wrangler deployment configuration.

## Publish the storefront with GitHub Pages
1. Open **Settings → Pages** in this repository.
2. Select **Deploy from a branch**.
3. Choose branch **main** and folder **/(root)**, then Save.
4. Storefront URL: https://unknown001as.github.io/ashinur-store/

## Set up GitHub OAuth admin login (no Firebase)

The authorized GitHub username in the Worker defaults to `unknown001as`. Login is restricted to that exact GitHub username. The GitHub OAuth client secret and session signing secret must never be committed to this repository.

### 1. Deploy the Cloudflare Worker
1. Sign in to https://dash.cloudflare.com/ and open **Workers & Pages**.
2. Create a Worker named `ashinur-store-auth`.
3. Deploy the starter Worker, then open **Edit code**.
4. Copy the complete contents of `worker/worker.js` from this repository and replace the editor contents. Save and Deploy.
5. Open the Worker URL shown by Cloudflare. It will look like `https://ashinur-store-auth.<your-subdomain>.workers.dev`. Keep this exact URL.

You can also deploy with Wrangler from the `worker` folder using `npx wrangler deploy` after installing Wrangler and logging in to Cloudflare.

### 2. Create a GitHub OAuth App
1. Open https://github.com/settings/developers and select **OAuth Apps → New OAuth App**.
2. Application name: `ASHINUR STORE Admin`.
3. Homepage URL: your exact Cloudflare Worker URL from step 1.
4. Authorization callback URL: your Worker URL followed by `/auth/callback` (example: `https://ashinur-store-auth.<your-subdomain>.workers.dev/auth/callback`).
5. Register the app. Copy its **Client ID**, then generate a **Client Secret**.

### 3. Add Cloudflare Worker variables/secrets
In Cloudflare → Workers & Pages → `ashinur-store-auth` → **Settings → Variables and Secrets**, add:

| Name | Type | Value |
|---|---|---|
| `GITHUB_CLIENT_ID` | Secret | Client ID from your GitHub OAuth App |
| `GITHUB_CLIENT_SECRET` | Secret | Client Secret from your GitHub OAuth App |
| `SESSION_SECRET` | Secret | A newly generated random secret (at least 32 random bytes) |
| `ALLOWED_GITHUB_LOGIN` | Variable | `unknown001as` |

Save and deploy the Worker after adding the values. Do not put these secrets in GitHub files, screenshots, chats or public code. Cloudflare documents that Worker secrets are encrypted and available to the Worker through its environment: https://developers.cloudflare.com/workers/configuration/secrets/

### 4. Open the admin login
1. Open https://unknown001as.github.io/ashinur-store/admin.html
2. Paste your exact Cloudflare Worker URL into the field and click **Continue to GitHub Login**.
3. Sign in to GitHub. Only `unknown001as` is allowed.

GitHub OAuth uses a state check and PKCE; the Worker exchanges the temporary code server-side and stores a signed, HttpOnly, Secure session cookie on the Worker origin. The Worker asks only for `read:user`. GitHub OAuth callback URLs must match the registered callback URL: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app

## Important current limitations
- The Worker provides secure GitHub sign-in and a basic admin landing page only. Product, inventory, order, customer and service-request management are not implemented yet.
- The GitHub Pages storefront is static. It has no database, customer accounts, live stock tracking or integrated payment gateway.
- The sample product names/prices must be replaced with real catalogue data.
- WhatsApp order/service handoff remains disabled until a store WhatsApp number is configured in `index.html`.
- Government service references describe assistance only; ASHINUR STORE is not a government department and does not imply government affiliation.
