const COOKIE_NAME = "as_store_session";
const STATE_COOKIE = "as_store_oauth_state";
const SESSION_SECONDS = 8 * 60 * 60;

function response(body, status = 200, headers = {}) {
  return new Response(body, { status, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", ...headers } });
}
function redirect(url, headers = {}) {
  return new Response(null, { status: 302, headers: { Location: url, "Cache-Control": "no-store", ...headers } });
}
function cookie(request, name) {
  const raw = request.headers.get("Cookie") || "";
  const item = raw.split(";").map(v => v.trim()).find(v => v.startsWith(name + "="));
  return item ? item.slice(name.length + 1) : "";
}
function cookieHeader(name, value, maxAge) {
  return name + "=" + value + "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=" + maxAge;
}
function clearCookie(name) {
  return name + "=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0";
}
function b64url(bytes) {
  let binary = "";
  for (const b of new Uint8Array(bytes)) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}
function fromB64url(value) {
  const s = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = s + "=".repeat((4 - s.length % 4) % 4);
  return Uint8Array.from(atob(padded), c => c.charCodeAt(0));
}
async function hmac(value, secret) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
  return new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value)));
}
async function makeSession(user, secret) {
  const payload = b64url(new TextEncoder().encode(JSON.stringify({ login: user.login, id: user.id, avatar: user.avatar_url, exp: Math.floor(Date.now()/1000) + SESSION_SECONDS })));
  return payload + "." + b64url(await hmac(payload, secret));
}
async function readSession(token, secret) {
  try {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return null;
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const valid = await crypto.subtle.verify("HMAC", key, fromB64url(signature), new TextEncoder().encode(payload));
    if (!valid) return null;
    const data = JSON.parse(new TextDecoder().decode(fromB64url(payload)));
    if (!data.exp || data.exp < Math.floor(Date.now()/1000)) return null;
    return data;
  } catch { return null; }
}
function page(title, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#101b35"><title>${title} | ASHINUR STORE</title><style>
  *{box-sizing:border-box}body{margin:0;min-height:100vh;background:radial-gradient(circle at 15% 15%,#294777,transparent 35%),linear-gradient(135deg,#0b1429,#18294c);font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;color:#18243c;display:grid;place-items:center;padding:22px}.wrap{width:min(520px,100%)}.brand{display:flex;align-items:center;gap:11px;color:white;font-weight:850;letter-spacing:.5px;margin-bottom:22px}.mark{width:43px;height:43px;border-radius:13px;background:#203c76;border:1px solid #ffffff40;color:#e8bb63;display:grid;place-items:center}.brand small{display:block;color:#aebbd0;font-size:10px;letter-spacing:1.5px;margin-top:3px}.card{background:white;border-radius:23px;padding:30px;box-shadow:0 25px 80px #050b1c70}.eyebrow{font-size:10px;letter-spacing:2px;color:#3769d6;font-weight:850}.card h1{font-size:27px;margin:9px 0 7px;letter-spacing:-.8px}.sub{color:#6c7890;font-size:13px;line-height:1.6;margin:0 0 22px}.btn{display:inline-flex;justify-content:center;align-items:center;width:100%;border:0;border-radius:11px;padding:14px;background:#18243c;color:white;font-weight:800;font-size:14px;text-decoration:none;cursor:pointer}.btn.gold{background:#e8bb63;color:#17233c}.muted{font-size:11px;color:#71809a;line-height:1.6;margin-top:17px}.profile{display:flex;gap:14px;align-items:center;margin:20px 0}.profile img{width:54px;height:54px;border-radius:50%}.status{padding:12px;border-radius:11px;background:#edf9f0;color:#176b35;font-size:12px;line-height:1.5}.back{display:block;text-align:center;color:#aebbd0;font-size:12px;margin-top:19px}
  </style></head><body><main class="wrap"><div class="brand"><span class="mark">AS</span><span>ASHINUR STORE<small>ADMIN CONTROL PANEL</small></span></div>${body}<a class="back" href="https://unknown001as.github.io/ashinur-store/">← Back to Store</a></main></body></html>`;
}
function loginPage(error = "") {
  return page("Admin Login", `<section class="card"><div class="eyebrow">RESTRICTED ACCESS</div><h1>Admin Login</h1><p class="sub">Sign in using your authorized GitHub account. Your GitHub password is entered only on GitHub.</p>${error ? '<p style="color:#a42b2b;font-size:12px">' + error + '</p>' : ''}<a class="btn" href="/auth/login">Continue with GitHub ↗</a><p class="muted">Only the GitHub account configured as the store administrator is allowed. Sessions expire after 8 hours.</p></section>`);
}
function adminPage(user) {
  const login = String(user.login).replace(/[&<>"']/g, "");
  const avatar = String(user.avatar || "").startsWith("https://avatars.githubusercontent.com/") ? user.avatar : "";
  return page("Admin Dashboard", `<section class="card"><div class="eyebrow">AUTHORIZED ADMIN</div><h1>Welcome to Admin</h1><div class="profile">${avatar ? '<img src="' + avatar + '" alt="GitHub avatar">' : ''}<div><b>${login}</b><div class="sub" style="margin:4px 0 0">Signed in with GitHub</div></div></div><div class="status">GitHub authentication is active. Your admin session is protected by an HttpOnly, signed cookie.</div><p class="sub" style="margin-top:18px">This is the secure login foundation. Product, stock, orders and customer-management modules are not connected yet.</p><form method="post" action="/auth/logout"><button class="btn gold" type="submit">Sign out</button></form><p class="muted">If this is not your account, sign out immediately.</p></section>`);
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const allowedLogin = (env.ALLOWED_GITHUB_LOGIN || "unknown001as").toLowerCase();
    if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET || !env.SESSION_SECRET) {
      return response(page("Setup Required", '<section class="card"><div class="eyebrow">SETUP REQUIRED</div><h1>Admin login is not configured</h1><p class="sub">Add GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET and SESSION_SECRET as Worker secrets in Cloudflare, then try again.</p></section>'), 503);
    }
    if (url.pathname === "/") return redirect("/admin");
    if (url.pathname === "/admin") {
      const session = await readSession(cookie(request, COOKIE_NAME), env.SESSION_SECRET);
      if (!session || session.login.toLowerCase() !== allowedLogin) return response(loginPage());
      return response(adminPage(session));
    }
    if (url.pathname === "/auth/login") {
      const state = b64url(crypto.getRandomValues(new Uint8Array(32)));
      const verifier = b64url(crypto.getRandomValues(new Uint8Array(48)));
      const challenge = b64url(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier)));
      const callback = url.origin + "/auth/callback";
      const authorize = new URL("https://github.com/login/oauth/authorize");
      authorize.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
      authorize.searchParams.set("redirect_uri", callback);
      authorize.searchParams.set("scope", "read:user");
      authorize.searchParams.set("allow_signup", "false");
      authorize.searchParams.set("state", state);
      authorize.searchParams.set("code_challenge", challenge);
      authorize.searchParams.set("code_challenge_method", "S256");
      return redirect(authorize.toString(), { "Set-Cookie": cookieHeader(STATE_COOKIE, state + "." + verifier, 600) });
    }
    if (url.pathname === "/auth/callback" && request.method === "GET") {
      const state = url.searchParams.get("state") || "";
      const stateCookie = cookie(request, STATE_COOKIE);
      const [savedState, verifier] = stateCookie.split(".");
      const clearState = clearCookie(STATE_COOKIE);
      if (!state || !savedState || !verifier || state !== savedState) return response(loginPage("Login session expired or invalid. Please try again."), 400, { "Set-Cookie": clearState });
      const code = url.searchParams.get("code");
      if (!code) return response(loginPage("GitHub did not return an authorization code."), 400, { "Set-Cookie": clearState });
      const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: env.GITHUB_CLIENT_ID, client_secret: env.GITHUB_CLIENT_SECRET, code, redirect_uri: url.origin + "/auth/callback", code_verifier: verifier })
      });
      const tokenData = await tokenResponse.json();
      if (!tokenResponse.ok || !tokenData.access_token) return response(loginPage("GitHub sign-in could not be completed. Please try again."), 401, { "Set-Cookie": clearState });
      const userResponse = await fetch("https://api.github.com/user", { headers: { "Authorization": "Bearer " + tokenData.access_token, "Accept": "application/vnd.github+json", "User-Agent": "ashinur-store-admin" } });
      const user = await userResponse.json();
      if (!userResponse.ok || !user.login || user.login.toLowerCase() !== allowedLogin) {
        return response(loginPage("This GitHub account is not authorized for ASHINUR STORE administration."), 403, { "Set-Cookie": clearState });
      }
      const session = await makeSession(user, env.SESSION_SECRET);
      return redirect("/admin", { "Set-Cookie": cookieHeader(COOKIE_NAME, session, SESSION_SECONDS) });
    }
    if (url.pathname === "/auth/logout" && request.method === "POST") {
      return redirect("/admin", { "Set-Cookie": clearCookie(COOKIE_NAME) });
    }
    return response(page("Not Found", '<section class="card"><h1>Page not found</h1><a href="/admin">Go to admin login</a></section>'), 404);
  }
};
