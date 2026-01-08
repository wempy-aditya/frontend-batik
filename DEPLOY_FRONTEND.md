Front-end deployment (Docker)

This file explains how to build and run the Next.js frontend container and how to connect it to your backend's Docker Compose network (the backend is packaged separately).

1. Build & run (standalone):

```
docker compose -f docker-compose.frontend.yml up -d --build

# View logs
docker compose -f docker-compose.frontend.yml logs -f

# Stop and remove
docker compose -f docker-compose.frontend.yml down
```

2. Connecting to an existing backend docker-compose network (Network Bridge scenario):

If your backend docker-compose uses a network named e.g. `backend_default`, you have two options:

a) Use the same external network name in `docker-compose.frontend.yml` (set `backend_network` to the backend network name). Example change:

```yaml
networks:
  backend_network:
    external: true
    name: backend_default
```

b) Or attach the running frontend container to the backend network after starting it:

```
# 1. Start the frontend
docker compose -f docker-compose.frontend.yml up -d --build

# 2. Find the running frontend container name
docker ps --filter "ancestor=my-app-frontend:latest"

# 3. Connect frontend container to backend network (replace names accordingly)
docker network connect <BACKEND_NETWORK_NAME> <FRONTEND_CONTAINER_NAME>

# Example
docker network connect backend_default my-app-frontend-1
```

3. Environment variable for API URL

The frontend uses `NEXT_PUBLIC_BACKEND_URL` (read by client code). You can set this in the environment before running compose, or pass into the compose file:

```
# Windows PowerShell
$env:NEXT_PUBLIC_BACKEND_URL = 'http://backend:8000'
docker compose -f docker-compose.frontend.yml up -d --build
```

4. Notes & troubleshooting

- If your backend service is named `backend` inside its compose stack and exposes port `8000`, then when both containers share the same Docker network you can use `http://backend:8000` as the URL.
- If your backend is exposed on the host or behind a reverse proxy, use the host URL (example: `https://api.example.com`).
- Check container logs with `docker logs <container>` or `docker compose -f docker-compose.frontend.yml logs -f`.

5. Kubernetes migration (next step)

Once you feel comfortable with a Docker Compose setup, I can scaffold `k8s/` manifests (Deployment, Service, Ingress) for both frontend and backend.
