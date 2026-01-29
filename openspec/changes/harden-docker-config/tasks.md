# Tasks: Harden Docker Configuration

## 1. Add Non-Root User
- [ ] 1.1 Add `USER node` instruction after file copy in Dockerfile
- [ ] 1.2 Ensure /app directory has correct ownership with `chown`
- [ ] 1.3 Verify node user exists in node:22-alpine image (it should by default)

## 2. Add Health Check
- [ ] 2.1 Add HEALTHCHECK instruction to Dockerfile
- [ ] 2.2 Use simple node process check: `node -e "process.exit(0)"`
- [ ] 2.3 Configure appropriate intervals (30s check, 3s timeout, 3 retries)

## 3. Security Hardening
- [ ] 3.1 Add `--no-cache` to apk commands if any are added
- [ ] 3.2 Remove any unnecessary files from final image
- [ ] 3.3 Set explicit file permissions where needed

## 4. Validation
- [ ] 4.1 Build image: `docker build -t perplexity-mcp:test .`
- [ ] 4.2 Verify container runs as non-root: `docker run --rm perplexity-mcp:test whoami`
- [ ] 4.3 Verify health check works: `docker inspect --format='{{.State.Health.Status}}' <container>`
- [ ] 4.4 Test with actual API key to ensure functionality unchanged
- [ ] 4.5 Document any volume mount considerations in README
