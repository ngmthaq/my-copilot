---
name: nginx-ssl-tls-setup
description: "Nginx SSL/TLS setup — certificates, HTTPS redirect, cipher suites, OCSP stapling, Let's Encrypt, and HTTP/2. Use when: configuring HTTPS; setting up certificates; hardening TLS. DO NOT USE FOR: general security headers (use nginx-security-hardening); basic config (use nginx-basic-configuration)."
---

# Nginx SSL/TLS Setup

## 1. Basic HTTPS Configuration

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name example.com www.example.com;

    ssl_certificate     /etc/ssl/certs/example.com.crt;
    ssl_certificate_key /etc/ssl/private/example.com.key;

    root /var/www/example.com;
    index index.html;
}

# HTTP → HTTPS redirect
server {
    listen 80;
    listen [::]:80;
    server_name example.com www.example.com;
    return 301 https://$host$request_uri;
}
```

---

## 2. Strong TLS Configuration

```nginx
http {
    # TLS versions — TLS 1.2 and 1.3 only
    ssl_protocols TLSv1.2 TLSv1.3;

    # Cipher suites
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;   # Let client choose (modern recommendation)

    # DH parameters (generate: openssl dhparam -out /etc/ssl/dhparam.pem 2048)
    ssl_dhparam /etc/ssl/dhparam.pem;

    # Session caching
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;
    ssl_session_tickets off;         # Disable for forward secrecy

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
}
```

---

## 3. Let's Encrypt with Certbot

```bash
# Install certbot
apt install certbot python3-certbot-nginx

# Obtain certificate
certbot --nginx -d example.com -d www.example.com

# Auto-renewal (certbot installs a systemd timer)
certbot renew --dry-run    # Test renewal

# Manual: standalone mode
certbot certonly --standalone -d example.com
```

```nginx
# ACME challenge location (if not using --nginx plugin)
server {
    listen 80;
    server_name example.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}
```

Certificate paths: `/etc/letsencrypt/live/example.com/{fullchain.pem,privkey.pem}`

---

## 4. OCSP Stapling

```nginx
server {
    ssl_stapling on;
    ssl_stapling_verify on;

    # Trusted CA chain for OCSP verification
    ssl_trusted_certificate /etc/ssl/certs/ca-bundle.crt;

    # DNS resolver for OCSP
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;
}
```

OCSP stapling lets Nginx fetch and cache certificate revocation status, avoiding client-side OCSP lookups.

---

## 5. Client Certificate Authentication (mTLS)

```nginx
server {
    listen 443 ssl;

    ssl_certificate     /etc/ssl/server.crt;
    ssl_certificate_key /etc/ssl/server.key;

    # Require client certificate
    ssl_client_certificate /etc/ssl/ca.crt;   # CA that signed client certs
    ssl_verify_client on;                       # on | optional | optional_no_ca

    # Pass client cert info to backend
    proxy_set_header X-Client-Cert-DN  $ssl_client_s_dn;
    proxy_set_header X-Client-Cert-Verify $ssl_client_verify;

    # Optional: verify depth
    ssl_verify_depth 2;
}
```

---

## 6. SSL for Reverse Proxy (Backend HTTPS)

```nginx
upstream backend {
    server 10.0.0.1:443;
}

server {
    location / {
        proxy_pass https://backend;

        # Verify upstream certificate
        proxy_ssl_verify on;
        proxy_ssl_trusted_certificate /etc/ssl/certs/backend-ca.crt;
        proxy_ssl_server_name on;
        proxy_ssl_name backend.internal;

        # Client cert for upstream (mTLS to backend)
        proxy_ssl_certificate     /etc/ssl/client.crt;
        proxy_ssl_certificate_key /etc/ssl/client.key;
    }
}
```

---

## 7. HTTP/2 & HTTP/3

```nginx
# HTTP/2 (widely supported)
server {
    listen 443 ssl http2;
    # HTTP/2 is automatic with ssl + http2 flag
}

# HTTP/3 / QUIC (Nginx 1.25+)
server {
    listen 443 ssl;
    listen 443 quic reuseport;
    http2 on;
    http3 on;

    # Advertise HTTP/3 support
    add_header Alt-Svc 'h3=":443"; ma=86400' always;

    # QUIC requires TLS 1.3
    ssl_protocols TLSv1.2 TLSv1.3;
}
```

---

## 8. Testing & Verification

```bash
# Test SSL configuration
openssl s_client -connect example.com:443 -servername example.com

# Check certificate expiry
openssl s_client -connect example.com:443 2>/dev/null | openssl x509 -noout -dates

# Check TLS version and cipher
curl -vI https://example.com 2>&1 | grep -E "SSL|TLS|cipher"

# Online: ssllabs.com/ssltest
```

---

## 9. Best Practices

- **Use TLS 1.2+ only** — disable TLS 1.0 and 1.1
- **Enable HSTS** with `includeSubDomains` — prevents downgrade attacks
- **Use `ssl_session_tickets off`** for forward secrecy
- **Enable OCSP stapling** — faster TLS handshakes for clients
- **Auto-renew certificates** — Let's Encrypt certs expire in 90 days
- **Generate strong DH parameters** — `openssl dhparam -out dhparam.pem 2048`
- **Enable HTTP/2** — better performance with multiplexing
- **Test with SSL Labs** — aim for an A+ rating
- **Use separate cert per domain** — SNI is universally supported now
