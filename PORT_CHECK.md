# 🔍 Port Conflict Check Report

## Current Port Usage on Server

### Ports in Use (from existing containers):
- **3000** → `sbts_frontend` (icbmtraining-frontend)
- **3001** → `sbts_backend` (icbmtraining-backend)
- **5000** → `aribacopilot-frontend` (aipromarket-frontend)
- **5432** → `sbts_postgres` (PostgreSQL database)
- **3002** → `traveldesk247-backend-1`
- **3004** → `traveldesk247-frontend-1`
- **3006** → `courtesyhs_frontend`
- **3010** → `taskbridge-frontend`
- **3011** → `taskbridge-backend`
- **4000** → `c1wt_backend`
- **8071** → `courtesyhs_backend`
- **13005** → `c1wt_frontend`
- **43017** → `sbtsgroup-web`

### ✅ Ports Selected for Interview App:
- **3012** → `interviewapp_frontend` ✅ **AVAILABLE**
- **3013** → `interviewapp_backend` ✅ **AVAILABLE**

## Port Mapping

```
Host Port    Container Port    Service
---------    --------------    -------
3012        80                Frontend (Nginx)
3013        5000              Backend (Node.js)
```

## Database Connection

- **Database Container**: `sbts_postgres` (existing)
- **Network**: `icbmtraining_sbts_network` (existing)
- **Port**: 5432 (internal Docker network)
- **Connection**: Backend connects via Docker network (container name: `sbts_postgres`)

## Verification Commands

### Check if ports are available:
```bash
netstat -tuln | grep -E ':(3012|3013)'
# or
ss -tuln | grep -E ':(3012|3013)'
```

### Check running containers:
```bash
docker ps --format "table {{.Names}}\t{{.Ports}}" | grep interviewapp
```

### Check network connectivity:
```bash
docker network inspect icbmtraining_sbts_network | grep interviewapp
```

## No Conflicts Detected! ✅

Both ports 3012 and 3013 are available and will not conflict with existing containers.

