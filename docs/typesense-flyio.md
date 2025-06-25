# Deploying Typesense on Fly.io

This guide shows how to run a self-hosted Typesense instance for development on Fly.io without relying on Puppeteer, Chrome or other browser binaries.

## Setup Steps

1. **Initialize** a Fly project (answers can be defaults):
   ```bash
   flyctl launch --no-deploy
   ```
2. **Create a volume** for persistent data:
   ```bash
   flyctl volumes create typesense_data --size 1 --region <your-region>
   ```
3. **Create a Dockerfile** in the project root:
   ```Dockerfile
   FROM typesense/typesense:0.25.1
   CMD ["--data-dir", "/data", "--api-key", "xyz123", "--enable-cors"]
   ```
4. **Update `fly.toml`** with the mount and port configuration:

   ```toml
   [[mounts]]
     source = "typesense_data"
     destination = "/data"

   [[services]]
     internal_port = 8108
     protocol = "tcp"
     [[services.ports]]
       port = 80
   ```

5. **Store the API key** as a Fly secret:
   ```bash
   flyctl secrets set TYPESENSE_API_KEY=xyz123
   ```
6. **Deploy** the app:
   ```bash
   flyctl deploy
   ```

## Validation

Check the health endpoint:

```bash
curl https://<your-app>.fly.dev/health
```

Test the API:

```bash
curl https://<your-app>.fly.dev/collections \
  -H "X-TYPESENSE-API-KEY: xyz123"
```

The instance now runs without any browser dependencies and exposes a CORS-enabled API suitable for development.
