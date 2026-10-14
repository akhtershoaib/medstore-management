# Medical Store Management - React frontend

## Run
1. Start the Spring Boot backend first (port 8080).
2. In this folder:

       npm install
       npm run dev

3. Open http://localhost:5173 and sign in (default admin / admin123).

`vite.config.js` proxies `/api` to http://localhost:8080, so no CORS setup is needed in development.

## Pages
- Dashboard: today's sales (admin), low stock, expiring and expired counts
- Billing: search medicines, build a bill, discount, generate and print invoice
- Medicines: list and search; admin can add, edit, delete and add stock batches
- Alerts: low stock, expiring soon (adjustable days), expired stock
- Reports (admin): daily and monthly sales
- Users (admin): create staff or admin accounts

## Production
`npm run build` creates `dist/`. Serve it from any web server, or copy it into the Spring Boot
`src/main/resources/static` folder. If the frontend is hosted on a different origin than the API,
add a CORS configuration to the backend.
