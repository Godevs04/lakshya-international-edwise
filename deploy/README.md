# Deployment

Docker and platform configs live here so the repo root stays focused on application code.

## Local Docker

From the repository root:

```bash
cp .env.example .env.local
# fill in secrets, then:
docker compose -f deploy/docker-compose.yml up -d --build
# or
bash scripts/docker-run.sh
```

## Platforms

| Platform | Config |
|----------|--------|
| **Render** | Blueprint: `deploy/render.yaml` |
| **Fly.io** | Root `fly.toml` → `deploy/Dockerfile` |
| **VPS / GHCR** | `docker compose -f deploy/docker-compose.prod.yml up -d` |
| **Railway** | Point Dockerfile to `deploy/Dockerfile`, build context = repo root |

The Docker build context is always the **repository root** (`COPY . .` in `Dockerfile`).
