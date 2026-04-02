---
name: nginx-security-hardening
description: "Nginx security hardening — headers, rate limiting, access control, request filtering, and DDoS mitigation. Use when: securing Nginx deployments; adding security headers; restricting access. DO NOT USE FOR: SSL/TLS config (use nginx-ssl-tls-setup); basic config (use nginx-basic-configuration)."
---

# Nginx Security Hardening

## 1. Security Headers

```nginx
server {
    # Prevent clickjacking
    add_header X-Frame-Options "SAMEORIGIN" always;

    # Prevent MIME type sniffing
    add_header X-Content-Type-Options "nosniff" always;

    # XSS protection (legacy browsers)
    add_header X-XSS-Protection "1; mode=block" always;

    # Referrer policy
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Permissions policy
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # Content Security Policy
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';" always;

    # HSTS (only with SSL)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
}
```

---

## 2. Hide Server Information

```nginx
http {
    # Hide Nginx version
    server_tokens off;

    # Remove Server header entirely (requires headers-more module)
    more_clear_headers Server;

    # Hide upstream technology headers
    proxy_hide_header X-Powered-By;
    proxy_hide_header X-AspNet-Version;
    proxy_hide_header Server;
}
```

---

## 3. Rate Limiting

```nginx
http {
    # Rate limit zones
    limit_req_zone $binary_remote_addr zone=general:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
    limit_req_zone $binary_remote_addr zone=api:10m rate=30r/s;

    # Connection limit
    limit_conn_zone $binary_remote_addr zone=addr:10m;

    server {
        # General rate limit
        limit_req zone=general burst=20 nodelay;
        limit_conn addr 20;

        # Strict limit on login
        location /login {
            limit_req zone=login burst=3 nodelay;
            limit_req_status 429;
            proxy_pass http://backend;
        }

        # Higher limit for API
        location /api/ {
            limit_req zone=api burst=50 nodelay;
            proxy_pass http://backend;
        }
    }
}
```

---

## 4. Access Control

```nginx
server {
    # IP-based access
    location /admin/ {
        allow 10.0.0.0/8;
        allow 192.168.1.0/24;
        deny all;
        proxy_pass http://backend;
    }

    # Basic authentication
    location /admin/ {
        auth_basic "Admin Area";
        auth_basic_user_file /etc/nginx/.htpasswd;
        proxy_pass http://backend;
    }

    # Combined: IP + auth
    location /admin/ {
        satisfy any;          # any = IP OR auth; all = IP AND auth
        allow 10.0.0.0/8;
        deny all;
        auth_basic "Admin Area";
        auth_basic_user_file /etc/nginx/.htpasswd;
        proxy_pass http://backend;
    }
}
```

Generate htpasswd: `htpasswd -c /etc/nginx/.htpasswd admin`

---

## 5. Request Filtering

```nginx
server {
    # Block by user agent
    if ($http_user_agent ~* (curl|wget|scrapy|bot)) {
        return 403;
    }

    # Block specific methods
    if ($request_method !~ ^(GET|HEAD|POST|PUT|DELETE)$) {
        return 405;
    }

    # Limit request body size
    client_max_body_size 10m;

    # Block hidden files (except .well-known for ACME)
    location ~ /\.(?!well-known) {
        deny all;
        return 404;
    }

    # Block sensitive files
    location ~* \.(env|git|sql|bak|swp|log)$ {
        deny all;
        return 404;
    }

    # Block directory listing
    autoindex off;
}
```

---

## 6. DDoS Mitigation

```nginx
http {
    # Connection limits
    limit_conn_zone $binary_remote_addr zone=conn_per_ip:10m;
    limit_req_zone $binary_remote_addr zone=req_per_ip:10m rate=20r/s;

    server {
        limit_conn conn_per_ip 30;
        limit_req zone=req_per_ip burst=40 nodelay;

        # Aggressive timeouts for slow attacks (Slowloris)
        client_body_timeout   5s;
        client_header_timeout 5s;
        send_timeout          5s;
        keepalive_timeout     15s;

        # Limit request size
        client_max_body_size      1m;
        client_body_buffer_size   1k;
        client_header_buffer_size 1k;
        large_client_header_buffers 2 1k;
    }
}
```

---

## 7. Geo-Blocking

```nginx
http {
    # Block by country (requires GeoIP2 module)
    geoip2 /usr/share/GeoIP/GeoLite2-Country.mmdb {
        auto_reload 60m;
        $geoip2_data_country_iso_code country iso_code;
    }

    map $geoip2_data_country_iso_code $blocked_country {
        default 0;
        XX      1;    # Replace with country codes to block
        YY      1;
    }

    server {
        if ($blocked_country) {
            return 403;
        }
    }
}
```

---

## 8. Best Practices

- **Always add security headers** — they're free protection
- **Set `server_tokens off`** — don't leak version info
- **Rate limit login/auth endpoints** more aggressively than general traffic
- **Block access to hidden files** (`.env`, `.git`, etc.)
- **Use `client_max_body_size`** to prevent large payload attacks
- **Set short timeouts** to mitigate slow HTTP attacks
- **Use `deny all` as default** for admin endpoints, then allowlist
- **Combine rate + connection limits** for effective DDoS mitigation
- **Review `add_header` placement** — child blocks inherit only if they don't define their own headers
