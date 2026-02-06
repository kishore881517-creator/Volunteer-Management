## Backend: MongoDB setup

The backend expects a MongoDB instance reachable at `MONGO_URI` (defaults to `mongodb://127.0.0.1:27017/y`). If you get `ECONNREFUSED 127.0.0.1:27017`, start MongoDB locally or set `MONGO_URI` to a running instance.

Options:

- Start MongoDB service on Windows (if installed as a service named `MongoDB`):

```powershell
net start MongoDB
```

- Run `mongod` directly (if MongoDB Server is installed):

```powershell
# create data dir if needed
mkdir C:\data\db -Force
mongod --dbpath C:\data\db
```

- Run MongoDB with Docker (requires Docker installed):

```bash
docker volume create vmp-mongo-data
docker run -d -p 27017:27017 --name vmp-mongo -v vmp-mongo-data:/data/db mongo:6.0
```

- Use MongoDB Atlas or other hosted MongoDB and set `MONGO_URI` before starting the backend:

```powershell
$env:MONGO_URI = "mongodb+srv://<user>:<pass>@cluster0.example.mongodb.net/mydb?retryWrites=true&w=majority"
node server.js
```

Environment variables:
- `MONGO_URI`: override connection string.
- `MONGO_MAX_RETRIES`: number of connection attempts (default 5).

If you want the server to run without MongoDB (for UI-only development), tell me and I can add a temporary fallback mode.
