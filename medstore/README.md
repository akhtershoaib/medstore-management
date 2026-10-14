# Medical Store Management - Spring Boot backend

## Requirements
- Java 17+, Maven 3.9+, MySQL 8 running on localhost:3306

## Run
    export DB_USER=root DB_PASS=yourpassword
    mvn spring-boot:run

The `medstore` database and all tables are created automatically.
Default login: admin / admin123 (change it).

## Quick test
    curl -X POST localhost:8080/api/auth/login -H "Content-Type: application/json" \
         -d '{"username":"admin","password":"admin123"}'

    TOKEN=<paste token>

    # add medicine
    curl -X POST localhost:8080/api/medicines -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
         -d '{"name":"Paracetamol 500mg","category":"Tablet","manufacturer":"Cipla","mrp":30.00,"gstPercent":12,"reorderLevel":20}'

    # stock in (new batch)
    curl -X POST localhost:8080/api/medicines/1/batches -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
         -d '{"batchNo":"B101","expiryDate":"2027-12-31","quantity":100,"purchasePrice":20.00}'

    # sell
    curl -X POST localhost:8080/api/sales -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
         -d '{"customerName":"Ravi","discount":0,"items":[{"medicineId":1,"quantity":5}]}'

## Endpoints
| Method | Path | Role |
|---|---|---|
| POST | /api/auth/login | public |
| POST | /api/users | ADMIN |
| GET | /api/medicines?search= | any |
| POST, PUT, DELETE | /api/medicines[/{id}] | ADMIN |
| GET | /api/medicines/{id}/batches | any |
| POST | /api/medicines/{id}/batches | ADMIN |
| POST | /api/sales | any |
| GET | /api/sales/{id} | any |
| GET | /api/alerts/low-stock, /expiring?days=60, /expired | any |
| GET | /api/reports/daily?date=, /monthly?year=&month= | ADMIN |
