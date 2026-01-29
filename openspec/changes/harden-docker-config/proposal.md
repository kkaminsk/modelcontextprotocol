# Change: Harden Docker Configuration

## Why

The code audit identified security and operational gaps in the Docker configuration:
1. Container runs as root user (security risk)
2. No health check instruction (container orchestration cannot detect unhealthy state)
3. Missing security best practices for production deployment

## What Changes

- Add `USER node` to run container as non-root user
- Add `HEALTHCHECK` instruction for container health monitoring
- Ensure proper file permissions for non-root execution
- Document the security improvements

## Impact

- Affected specs: container-security (new)
- Affected code: `Dockerfile`
- **No breaking changes** for standard usage
- **Potential breaking change** if users mount volumes requiring root access
- Improved security posture for production deployments
- Better integration with Kubernetes and Docker Swarm health checks
