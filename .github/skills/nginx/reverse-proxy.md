---
name: nginx-reverse-proxy
description: "Nginx reverse proxy — proxy_pass, header forwarding, WebSocket proxying, buffering, and upstream configuration. Use when: proxying requests to backend services; setting up API gateways. DO NOT USE FOR: load balancing algorithms (use nginx-load-balancing); SSL termination (use nginx-ssl-tls-setup)."
---

# Nginx Reverse Proxy

## 1. Basic Proxy

```nginx
server {
    listen 80;
    server_name app.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
    }

    # Trailing slash matters!
    location /api/ {
        proxy_pass http://127.0.0.1:8080/;
        # /api/users → http://127.0.0.1:8080/users (strips /api)
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        # /api/users → http://127.0.0.1:8080/api/users (keeps /api)
    }
}
```

---

## 2. Header Forwarding

```nginx
location / {
    proxy_pass http://backend;

    # Forward real client info to backend
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-Host  $host;
    proxy_set_header X-Forwarded-Port  $server_port;
}

# Reusable snippet — include in each location
# /etc/nginx/snippets/proxy-headers.conf
proxy_set_header Host              $host;
proxy_set_header X-Real-IP         $remote_addr;
proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;

# Usage
location / {
    proxy_pass http://backend;
    include snippets/proxy-headers.conf;
}
```

---

## 3. WebSocket Proxy

```nginx
# WebSocket requires HTTP/1.1 and Connection: Upgrade
location /ws/ {
    proxy_pass http://127.0.0.1:3000;

    proxy_http_version 1.1;
    proxy_set_header Upgrade    $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host       $host;

    # Longer timeouts for persistent connections
    proxy_read_timeout  86400s;
    proxy_send_timeout  86400s;
}

# Map-based approach (handles both WS and HTTP)
map $http_upgrade $connection_upgrade {
    default upgrade;
    ""      close;
}

server {
    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade    $http_upgrade;
        proxy_set_header Connection $connection_upgrade;
    }
}
```

---

## 4. Buffering & Timeouts

```nginx
location / {
    proxy_pass http://backend;

    # Buffering (on by default — frees upstream faster)
    proxy_buffering on;
    proxy_buffer_size 4k;
    proxy_buffers 8 16k;

    # Disable for streaming / SSE
    location /events {
        proxy_pass http://backend;
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 86400s;
    }

    # Timeouts
    proxy_connect_timeout 5s;
    proxy_send_timeout    10s;
    proxy_read_timeout    30s;
}
```

---

## 5. Path Rewriting

```nginx
# Strip prefix
location /api/v1/ {
    proxy_pass http://backend/;
    # /api/v1/users → /users
}

# Rewrite before proxying
location /old-api/ {
    rewrite ^/old-api/(.*) /v2/$1 break;
    proxy_pass http://backend;
    # /old-api/users → /v2/users
}

# Regex-based location
location ~ ^/service/(\w+)/(.*) {
    proxy_pass http://$1.internal:8080/$2$is_args$args;
    # /service/auth/login → http://auth.internal:8080/login
}
```

---

## 6. Multiple Backends

```nginx
server {
    listen 80;
    server_name app.example.com;

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
    }

    # API
    location /api/ {
        proxy_pass http://127.0.0.1:8080/;
        include snippets/proxy-headers.conf;
    }

    # Static files from disk
    location /static/ {
        alias /var/www/static/;
        expires 30d;
    }

    # WebSocket
    location /ws {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 7. Error Handling & Custom Errors

```nginx
location / {
    proxy_pass http://backend;

    # Intercept upstream errors
    proxy_intercept_errors on;
    error_page 502 503 504 /custom_50x.html;

    location = /custom_50x.html {
        root /usr/share/nginx/html;
        internal;
    }
}
```

---

## 8. Best Practices

- **Always set `Host` header** — backends often need it for routing
- **Forward `X-Real-IP` and `X-Forwarded-For`** — backends need the real client IP
- **Use `proxy_http_version 1.1`** with keepalive upstreams
- **Use `include` for common proxy headers** — avoid repeating in every location
- **Mind the trailing slash** on `proxy_pass` — it controls path stripping
- **Disable buffering** only for streaming/SSE — buffering improves performance
- **Set reasonable timeouts** — don't let slow backends hold connections forever
- **Use `proxy_intercept_errors`** to show custom error pages for upstream failures
