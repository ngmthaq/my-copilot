---
name: secret-scanner
description: "Secret Scanner — Detects and prevents hardcoded secrets in code, configuration, and documentation. Enforces security best practices and integrates with CI/CD pipelines for proactive secret management."
---

# Secret Scanner

## When to Use

- During code reviews to identify hardcoded secrets
- As part of CI/CD pipelines to prevent secret leaks
- When auditing existing codebases for security risks

## Detection Capabilities

Follow these patterns to identify hardcoded secrets:

### Cloud provider credentials

```
"AWS*ACCESS_KEY|critical|AKIA[0-9A-Z]{16}"
"AWS_SECRET_KEY|critical|aws_secret_access_key[[:space:]]*[:=][:space:]]_['\"]?[A-Za-z0-9/+=]{40}"
"GCP_SERVICE_ACCOUNT|critical|\"type\"[[:space:]]_:[[:space:]]_\"service_account\""
"GCP_API_KEY|high|AIza[0-9A-Za-z_-]{35}"
"AZURE*CLIENT_SECRET|critical|azure[*-]?client[_-]?secret[[:space:]]_[:=][:space:]]_['\"]?[A-Za-z0-9_~.-]{34,}"
```

### GitHub tokens

```
"GITHUB*PAT|critical|ghp*[0-9A-Za-z]{36}"
"GITHUB*OAUTH|critical|gho*[0-9A-Za-z]{36}"
"GITHUB*APP_TOKEN|critical|ghs*[0-9A-Za-z]{36}"
"GITHUB*REFRESH_TOKEN|critical|ghr*[0-9A-Za-z]{36}"
"GITHUB*FINE_GRAINED_PAT|critical|github_pat*[0-9A-Za-z_]{82}"
```

### Private keys

```
"PRIVATE_KEY|critical|-----BEGIN (RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----"
"PGP_PRIVATE_BLOCK|critical|-----BEGIN PGP PRIVATE KEY BLOCK-----"
```

### Generic secrets and tokens

```
"GENERIC*SECRET|high|(secret|token|password|passwd|pwd|api[*-]?key|apikey|access[_-]?key|auth[_-]?token|client[_-]?secret)[[:space:]]_[:=][:space:]]_['\"]?[A-Za-z0-9_/+=~.-]{8,}"
"CONNECTION*STRING|high|(mongodb(\\+srv)?|postgres(ql)?|mysql|redis|amqp|mssql)://[^[:space:]'\"]{10,}"
"BEARER_TOKEN|medium|[Bb]earer[[:space:]]+[A-Za-z0-9*-]{20,}\.[A-Za-z0-9_-]{20,}"
```

### Messaging and SaaS tokens

```
"SLACK*TOKEN|high|xox[baprs]-[0-9]{10,}-[0-9A-Za-z-]+"
"SLACK_WEBHOOK|high|https://hooks\.slack\.com/services/T[0-9A-Z]{8,}/B[0-9A-Z]{8,}/[0-9A-Za-z]{24}"
"DISCORD_TOKEN|high|[MN][A-Za-z0-9]{23,}\.[A-Za-z0-9*-]{6}\.[A-Za-z0-9_-]{27,}"
"TWILIO*API_KEY|high|SK[0-9a-fA-F]{32}"
"SENDGRID_API_KEY|high|SG\.[0-9A-Za-z*-]{22}\.[0-9A-Za-z_-]{43}"
"STRIPE*SECRET_KEY|critical|sk_live*[0-9A-Za-z]{24,}"
"STRIPE*RESTRICTED_KEY|high|rk_live*[0-9A-Za-z]{24,}"
```

### npm tokens

```
"NPM*TOKEN|high|npm*[0-9A-Za-z]{36}"
```

### JWT (long, structured tokens)

```
"JWT*TOKEN|medium|eyJ[A-Za-z0-9*-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}"
```

### IP addresses with ports (possible internal services)

```
"INTERNAL_IP_PORT|medium|(^|[^.0-9])(10\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}|172\.(1[6-9]|2[0-9]|3[01])\.[0-9]{1,3}\.[0-9]{1,3}|192\.168\.[0-9]{1,3}\.[0-9]{1,3}):[0-9]{2,5}([^0-9]|$)"
```

## Enforcement Rules

- Any detected secret MUST be treated as a critical security issue
- The output MUST include:
  - Type of secret (e.g., AWS Access Key, GitHub PAT)
  - Location (file path and line number)
  - Severity level (critical, high, medium)
  - Recommended remediation steps (e.g., "Remove hardcoded secret and use environment variables or secret management service")
- The agent MUST NOT mark the code as secure until all critical and high-severity secrets are removed and proper secret management practices are implemented
- The agent MUST provide guidance on integrating secret scanning into CI/CD pipelines for ongoing security enforcement
