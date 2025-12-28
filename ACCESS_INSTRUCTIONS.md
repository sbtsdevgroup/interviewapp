# 🌐 How to Access the Application

## The Issue
You're getting `ERR_CONNECTION_REFUSED` because the browser is trying to connect to `localhost:3013`, but if you're accessing the frontend from a different machine, `localhost` refers to your local machine, not the server.

## Solution
The API URL now automatically uses the **same hostname** as the frontend. So:
- If you access frontend via `http://localhost:3012` → API uses `http://localhost:3013`
- If you access frontend via `http://SERVER_IP:3012` → API uses `http://SERVER_IP:3013`

## How to Access

### Option 1: From the Server Itself
```bash
# Open in browser on the server
http://localhost:3012
```

### Option 2: From Another Machine
```bash
# Replace SERVER_IP with your server's IP address
http://SERVER_IP:3012
```

To find your server IP:
```bash
hostname -I
# or
ip addr show | grep "inet "
```

## Ports
- **Frontend**: 3012
- **Backend API**: 3013
- **Database**: 5432 (internal)

## Testing

### Test Backend from Server:
```bash
curl http://localhost:3013/api/health
```

### Test Backend from Another Machine:
```bash
curl http://SERVER_IP:3013/api/health
```

## Important Notes

1. **Firewall**: Make sure ports 3012 and 3013 are open in your firewall
2. **Same Hostname**: Always use the same hostname/IP for both frontend and backend
3. **Browser Cache**: Clear browser cache (Ctrl+Shift+R) after changes

## Firewall Commands (if needed)

```bash
# Ubuntu/Debian
sudo ufw allow 3012/tcp
sudo ufw allow 3013/tcp

# CentOS/RHEL
sudo firewall-cmd --add-port=3012/tcp --permanent
sudo firewall-cmd --add-port=3013/tcp --permanent
sudo firewall-cmd --reload
```

---

**After rebuilding, access the frontend using the SAME hostname/IP you see in your browser address bar!**

