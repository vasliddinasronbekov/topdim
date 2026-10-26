# Topdim API

Standalone REST backend for the Topdim frontend. It uses a single SQLite file, which makes the first production deployment on a Windows server simple and durable.

## Local run

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

Set a unique `JWT_SECRET` in `.env` before any real deployment. The API starts at `http://localhost:4000`; confirm it with `GET /health`.

## API surface

- `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, `GET /api/v1/auth/me`
- `GET /api/v1/universities`
- `GET /api/v1/items` with `q`, `kind`, `category`, `status`, `universityId`, `spotId`, `page`, `limit`
- `POST /api/v1/items`, `GET /api/v1/items/:id`, `GET /api/v1/items/:id/matches`, `PATCH /api/v1/items/:id/status`
- `GET /api/v1/me/items`
- `POST /api/v1/items/:id/claims`, `GET /api/v1/items/:id/claims`, `PATCH /api/v1/claims/:id`
- `GET /api/v1/threads`, `GET /api/v1/threads/:id`, `POST /api/v1/threads/:id/messages`

Protected requests use `Authorization: Bearer <token>`. Login and registration return the token plus the public user profile. The API intentionally never returns password hashes or secret-answer values.

## Windows deployment

1. Install Node.js 20 LTS and Git on the server. Clone this project somewhere persistent, such as `C:\apps\topdim`.
2. In `C:\apps\topdim\backend`, copy `.env.example` to `.env`. Generate and set a long `JWT_SECRET`; set `CLIENT_ORIGINS` to the exact Vercel domain, for example `https://topdim.vercel.app`.
3. Run `npm install --omit=dev` and then `npm start` to verify `http://localhost:4000/health`.
4. Install PM2 globally (`npm install -g pm2`) and run `pm2 start src/server.js --name topdim-api`, then `pm2 save`. Configure PM2 startup for Windows using a service wrapper such as `pm2-windows-service`.
5. Put IIS, Caddy, or nginx in front of port 4000 for HTTPS. Expose only ports 80/443 publicly; leave SQLite and port 4000 private behind the proxy.

The SQLite database is stored at `backend/data/topdim.db`. Back up that file while the API is stopped, or use SQLite's `.backup` command. Do not place it in a folder synced by a cloud drive.

For a first connectivity check on your server (`52.65.192.133`), allow inbound TCP `4000` temporarily in Windows Firewall and visit `http://52.65.192.133:4000/health`. Once a reverse proxy and HTTPS domain are configured, close public port `4000` and point Vercel at `https://api.your-domain.com/api/v1` instead. An IP-only HTTP API is useful for a test, not for production authentication.

## Topdim domain setup

The production topology is:

- `topdim.wwww.uz` -> Vercel frontend
- `api.topdim.wwww.uz` -> `52.65.192.133` Windows API

At the DNS provider, add a `CNAME` record from `topdim` to `cname.vercel-dns.com`, then add an `A` record from `api.topdim` to `52.65.192.133`. Add `topdim.wwww.uz` as a production domain in the Vercel project.

On AWS, allow inbound TCP ports `80` and `443` to the EC2 instance. Install Caddy on the server and run it with the included `Caddyfile`; it will obtain and renew the certificate for `api.topdim.wwww.uz` automatically once the A record resolves. Set `HOST=127.0.0.1` in the backend `.env` and remove the Windows Firewall rule for port `4000` after Caddy is healthy.

## Vercel handoff

Set `TOPDIM_API_ORIGIN=https://api.topdim.wwww.uz` in the Vercel project, then redeploy. The Vercel rewrite keeps browser API calls same-origin at `/api/v1`; do not put `JWT_SECRET` in Vercel.
