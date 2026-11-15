# Cup Tasters backend (PHP + MySQL API)

The admin UI is React and lives at **`/admin`** on the site (`src/admin/`).
This folder is only the JSON API it talks to.

| Endpoint | What it does |
|---|---|
| `POST /api/register.php` | Website registration form. Saves the entry as **interested**. Public. |
| `GET/POST /api/auth.php` | Session check, login, logout. |
| `GET /api/participants.php` | List with `status`, `q` and `page` filters, plus counts. Superadmin only. |
| `GET/POST /api/participant.php?id=` | One participant. POST sets `status` and `notes`. Superadmin only. |
| `GET /api/photo.php?id=` | Participant photo. Superadmin only. |

When someone has paid, a team member opens their record in `/admin` and sets it to **Registered**.

## Development

```sh
# 1. once: database + first superadmin (fill in server/.env first)
php server/setup.php you@example.com 'a-strong-password' 'Your Name'

# 2. API on :8080 (router.php blocks .env / storage on the built-in server)
php -d opcache.revalidate_freq=0 -S localhost:8080 -t server server/router.php

# 3. the site on :5173. Vite proxies /api to :8080
npm run dev
```

Open http://localhost:5173/admin.
The site's `.env.local` has `VITE_REGISTER_ENDPOINT=/api/register.php`.

## Production (Apache / cPanel)

1. Run `npm run build`.
2. Upload the contents of `dist/` and of `server/` into the **same** web root, so `api/` sits next to `index.html`.
3. Fill in `.env` on the server.
4. Run `php setup.php email password` once.
5. Make sure `storage/photos/` is writable.

`dist/.htaccess` (from `public/.htaccess`) sends `/admin` to the React app and blocks `.env`, `storage/` and the PHP include files.
On Nginx, set up the same rules yourself.
