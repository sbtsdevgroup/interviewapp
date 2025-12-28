# 🚀 Quick Start - Docker Containers

## ✅ Port Status Check

**Ports Selected (No Conflicts):**
- ✅ **3012** - Frontend (Available)
- ✅ **3013** - Backend (Available)

**Existing Ports (Avoided):**
- 3000, 3001, 5000, 5432 - Already in use by other containers

## 🐳 Start the Application

### Single Command to Build and Run:
```bash
cd /root/interviewapp
docker-compose up -d --build
```

### What This Does:
1. ✅ Builds backend Docker image
2. ✅ Builds frontend Docker image  
3. ✅ Connects to existing `sbts_postgres` database
4. ✅ Uses network `icbmtraining_sbts_network`
5. ✅ Starts both containers

### Access the Application:
- **Frontend**: http://localhost:3012
- **Backend API**: http://localhost:3013
- **Health Check**: http://localhost:3013/health

## 📊 Check Container Status

```bash
# View running containers
docker ps | grep interviewapp

# View logs
docker-compose logs -f

# Check health
docker ps --format "table {{.Names}}\t{{.Status}}"
```

## 🔧 Common Commands

```bash
# Stop containers
docker-compose down

# Restart containers
docker-compose restart

# Rebuild after code changes
docker-compose up -d --build

# View backend logs
docker-compose logs -f interviewapp-backend

# View frontend logs
docker-compose logs -f interviewapp-frontend
```

## 🔍 Verify Setup

### 1. Check Containers are Running:
```bash
docker ps | grep interviewapp
```

Expected output:
```
interviewapp_backend    ... Up ... 0.0.0.0:3013->5000/tcp
interviewapp_frontend   ... Up ... 0.0.0.0:3012->80/tcp
```

### 2. Test Backend:
```bash
curl http://localhost:3013/health
```

Expected: `{"status":"ok","message":"Student Portal API is running"}`

### 3. Test Frontend:
```bash
curl http://localhost:3012
```

Expected: HTML content

### 4. Check Database Connection:
```bash
docker exec interviewapp_backend node -e "const pool = require('./config/database'); pool.query('SELECT 1', (err, res) => { console.log(err ? 'Error' : 'Connected'); process.exit(0); });"
```

## 🐛 Troubleshooting

### Port Already in Use?
Edit `docker-compose.yml` and change ports:
```yaml
ports:
  - "NEW_PORT:5000"  # Change to available port
```

### Database Connection Failed?
1. Verify `sbts_postgres` is running:
   ```bash
   docker ps | grep sbts_postgres
   ```

2. Check network:
   ```bash
   docker network inspect icbmtraining_sbts_network
   ```

### Frontend Can't Reach Backend?
- Check API URL is correct in browser console
- Verify backend is running: `curl http://localhost:3013/health`
- Check CORS settings in backend

## 📝 Next Steps

1. ✅ Run: `docker-compose up -d --build`
2. ✅ Open: http://localhost:3012
3. ✅ Login with Application ID
4. ✅ View student dashboard

---

**Ready to go! Just run the docker-compose command above! 🎉**

