# BandFlow Web

The browser version of the BandFlow app: the same boss and worker features as the phone app, laid out for bigger screens.

It has no database of its own. It talks to the Node API in the sibling `Naprock-BandFlow` workspace (`server/index.mjs`), so accounts, tasks, and profile photos are shared with the phone app.

## Start it

You need two terminals.

1. **Terminal 1, in `Naprock-BandFlow`:** start the API server.

   ```powershell
   npm run server
   ```

2. **Terminal 2, in `BandFlow-Web`:** start the website.

   ```powershell
   npm install   # first time only
   npm run dev
   ```

3. Open **<http://localhost:5173>** on this computer.

   Other devices on the same Wi-Fi can use the "Network" address Vite prints, e.g. `http://192.168.1.5:5173`.

## Server address

You don't need to configure anything while the API runs on the same computer as the website. The site connects to port 8787 on whatever address you opened it from, so it keeps working when you change Wi-Fi networks.

When the API runs somewhere else, such as the Pi, copy `.env.example` to `.env.local` and set the address:

```env
VITE_API_URL=http://bandflow.local:8787
```

Restart `npm run dev` after changing it.

## Pages

| Page | Who | Address |
| --- | --- | --- |
| Log in / Create account | everyone | `/login`, `/signup` |
| Dashboard | boss or worker | `/` |
| All tasks | worker | `/tasks` |
| Task details | both | `/tasks/:id` |
| Create work | boss | `/work/new` |
| Assign work | boss | `/work/assign` |
| Work progress | boss | `/progress` |
| Manage workers | boss | `/workers` |
| Profile | both | `/profile` |
| Settings | both | `/settings` |

Open the side menu with the ☰ button in the top-left corner.

## Scripts

- `npm run dev`: development server with live reload.
- `npm run build`: type-check and build the site into `dist/`.
- `npm run preview`: serve the built `dist/` folder.
- `npm run lint`: run oxlint.
