# 🐳 Docker Setup Guide - Student Portal

## ✅ Port Configuration

To avoid conflicts with existing containers, the following ports are used:

- **Frontend**: Port `3012` (mapped to container port 80)
- **Backend**: Port `3013` (mapped to container port 5000)
- **Database**: Uses existing `sbts_postgres` container (port 5432)

### Current Port Usage Check

**Ports Already in Use:**
- 3000 → sbts_frontend
- 3001 → sbts_backend  
- 5000 → aribacopilot-frontend
- 5432 → sbts_postgres

**Our Application Uses:**
- 3012 → interviewapp_frontend ✅ Available
- 3013 → interviewapp_backend ✅ Available

## 🚀 Quick Start with Docker

### Step 1: Build and Start Containers

```bash
cd /root/interviewapp
docker-compose up -d --build
```

This will:
- Build the backend and frontend images
- Start both containers
- Connect to the existing `sbts_postgres` database
- Use the `icbmtraining_sbts_network` network

### Step 2: Access the Application

- **Frontend**: http://localhost:3012
- **Backend API**: http://localhost:3013
- **Health Check**: http://localhost:3013/health

### Step 3: View Logs

```bash
# View all logs
docker-compose logs -f

# View backend logs only
docker-compose logs -f interviewapp-backend

# View frontend logs only
docker-compose logs -f interviewapp-frontend
```

## 🔧 Container Management

### Stop Containers
```bash
docker-compose down
```

### Stop and Remove Volumes
```bash
docker-compose down -v
```

### Restart Containers
```bash
docker-compose restart
```

### Rebuild After Code Changes
```bash
docker-compose up -d --build
```

## 📋 Container Details

### Backend Container
- **Name**: `interviewapp_backend`
- **Port**: 3013:5000
- **Network**: `icbmtraining_sbts_network`
- **Database**: Connects to `sbts_postgres` container

### Frontend Container
- **Name**: `interviewapp_frontend`
- **Port**: 3012:80
- **Network**: Default + sbts_network
- **API URL**: Configured to use backend on port 3013

## 🔍 Verify Setup

### Check Containers are Running
```bash
docker ps | grep interviewapp
```

### Check Network Connection
```bash
docker network inspect icbmtraining_sbts_network | grep interviewapp
```

### Test Backend API
```bash
curl http://localhost:3013/health
```

### Test Frontend
```bash
curl http://localhost:3012
```

## 🐛 Troubleshooting

### Port Already in Use
If ports 3012 or 3013 are already in use, edit `docker-compose.yml`:
```yaml
ports:
  - "NEW_PORT:5000"  # Change NEW_PORT to available port
```

### Database Connection Issues
1. Verify `sbts_postgres` is running:
   ```bash
   docker ps | grep sbts_postgres
   ```

2. Check network connectivity:
   ```bash
   docker exec interviewapp_backend ping -c 2 sbts_postgres
   ```

3. Verify database credentials in `docker-compose.yml`

### Frontend Can't Reach Backend
1. Check API URL in frontend environment
2. Verify both containers are on the same network
3. Check backend logs for errors:
   ```bash
   docker-compose logs interviewapp-backend
   ```

### Rebuild After Code Changes
```bash
# Stop containers
docker-compose down

# Rebuild and start
docker-compose up -d --build
```

## 📝 Environment Variables

### Backend Environment (in docker-compose.yml)
- `DB_HOST=sbts_postgres` - Database container name
- `DB_PORT=5432` - Database port
- `DB_NAME=sbts_db` - Database name
- `DB_USER=sbts_user` - Database user
- `DB_PASSWORD=...` - Database password
- `JWT_SECRET=...` - JWT secret key

### Frontend Environment
- `REACT_APP_API_URL=http://localhost:3013/api` - Backend API URL

## 🔐 Security Notes

1. **JWT Secret**: Change the default JWT_SECRET in production
2. **Database Password**: Ensure secure password in production
3. **Network**: Containers are on internal Docker network
4. **Ports**: Only necessary ports are exposed

## 📊 Container Health

Health checks are configured for both containers:
- Backend: Checks `/health` endpoint
- Frontend: Checks nginx availability

View health status:
```bash
docker ps --format "table {{.Names}}\t{{.Status}}"
```

## 🎯 Next Steps

1. Build and start: `docker-compose up -d --build`
2. Access: http://localhost:3012
3. Test login with Application ID
4. Monitor logs: `docker-compose logs -f`

---

**All set! Your containers are configured with non-conflicting ports! 🎉**

