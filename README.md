# HTML Deployer

Simple project to upload HTML and get a public URL. Server stores sites in /sites folder (filesystem). Use NODE to run.

Run locally:
- pnpm install (or npm install)
- pnpm --filter client install
- pnpm start

API:
- POST /api/create { html }
- POST /api/upload form file=@index.html
- GET /s/:id
