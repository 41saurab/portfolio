# Portfolio (React + Vite)

    npm install
    npm run dev       # http://localhost:5173
    npm run build     # outputs dist/
    npm run preview   # serve the production build

- Page text: `src/data/content.json`
- Scroll feel and routes: `src/data/config.json`
- Optional local font: put `FakeReceipt.woff2` in `public/fonts/`

Deploy on Netlify: push to GitHub, "Add new site" > "Import an existing project".
Build settings come from `netlify.toml`; `public/_redirects` makes /projects and /about work on refresh.
