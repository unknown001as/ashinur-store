# ASHINUR STORE

A responsive static storefront for **ASHINUR STORE** — “Your Digital World, One Destination.”

## Files
- `index.html` — complete mobile-friendly storefront, sample product catalogue, cart and online service enquiry forms.

## Publish with GitHub Pages
1. Open **Settings → Pages** in this repository.
2. Under **Build and deployment**, select **Deploy from a branch**.
3. Select branch **main** and folder **/(root)**, then Save.
4. After GitHub Pages finishes deploying, the site should be available at:
   `https://unknown001as.github.io/ashinur-store/`

## Important setup before accepting enquiries
Open `index.html` and find:
`const WHATSAPP_NUMBER = "";`
Set it to the store WhatsApp number with country code, digits only (example format: `919876543210`). Commit the change.

The catalogue uses demo product names and prices. Replace them with actual products, inventory and confirmed prices before publishing to customers.

## Current limitations
This is a static demo site. It has no server, database, shared admin dashboard, customer accounts, file uploads, live stock tracking or integrated payment gateway. Cart and service requests are sent as WhatsApp messages only after a WhatsApp number has been configured. Orders are not stored by this site. Do not ask customers to submit sensitive identity documents through an unverified channel.

Government service references are descriptions of assistance only; ASHINUR STORE is not a government department and does not imply government affiliation.

## Admin login setup

The admin page is `admin.html` and the storefront footer links to it. It uses Firebase Authentication; it does **not** contain a hardcoded password.

1. Create a Firebase project at https://console.firebase.google.com/.
2. Add a Web App in Project settings and copy its Firebase web configuration.
3. In Firebase Console → Authentication → Sign-in method, enable **Email/Password**.
4. In Authentication → Users, create the admin user with the authorized email `ashinurstore@gmail.com`. Set a fresh password in Firebase Console; do not reuse a password that has been posted in chat or committed to GitHub.
5. Open `admin.html` in this repository and replace the placeholder values in `firebaseConfig` with your Firebase Web App config.
6. Commit the change and open `https://unknown001as.github.io/ashinur-store/admin.html` after GitHub Pages has deployed.

The page only allows the configured admin email through its UI. If you later connect Firestore or Storage, configure Firebase Security Rules to enforce admin authorization server-side; a client-side email check alone is not a security boundary.

The current admin page authenticates the administrator and displays a basic authenticated landing screen. It does not yet manage products, orders or customer records.
