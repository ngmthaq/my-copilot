---
name: nginx-basic-configuration
description: "Nginx basic configuration — file structure, directives, contexts (main/events/http/server/location), virtual hosts, and common settings. Use when: setting up Nginx from scratch; understanding config structure; configuring server blocks. DO NOT USE FOR: SSL (use nginx-ssl-tls-setup); reverse proxy (use nginx-reverse-proxy); caching (use nginx-caching-strategies)."
---

# Nginx Basic Configuration

## 1. Config File Structure

```nginx
# Main context — global settings
worker_processes auto;          # Match CPU cores
pid /run/nginx.pid;

# Events context — connection handling
events {
    worker_connections 1024;    # Max connections per worker
    multi_accept on;            # Accept multiple connections at once
}

# HTTP context — web server settings
http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    sendfile    on;
    keepalive_timeout 65;

    # Include site configs
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
```

---

## 2. Server Blocks (Virtual Hosts)

```nginx
# /etc/nginx/sites-available/example.com
server {
    listen 80;
    listen [::]:80;                   # IPv6
    server_name example.com www.example.com;

    root /var/www/example.com/html;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }
}

# Multiple sites on same server
server {
    listen 80;
    server_name api.example.com;
    root /var/www/api;
}

server {
    listen 80;
    server_name docs.example.com;
    root /var/www/docs;
}
```

**Enable a site:**

```bash
ln -s /etc/nginx/sites-available/example.com /etc/nginx/sites-enabled/
nginx -t          # Test config
nginx -s reload   # Apply changes
```

---

## 3. Location Blocks

```nginx
server {
    # Exact match (highest priority)
    location = /health {
        return 200 "OK";
        add_header Content-Type text/plain;
    }

    # Prefix match (preferential)
    location ^~ /static/ {
        root /var/www;
        # Stops searching after this match
    }

    # Regex match (case-sensitive)
    location ~ \.php$ {
        fastcgi_pass 127.0.0.1:9000;
    }

    # Regex match (case-insensitive)
    location ~* \.(jpg|jpeg|png|gif)$ {
        expires 30d;
    }

    # Standard prefix match (lowest priority)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Priority order:** `=` > `^~` > `~`/`~*` > prefix

---

## 4. Common Directives

```nginx
http {
    # Logging
    access_log /var/log/nginx/access.log;
    error_log  /var/log/nginx/error.log warn;

    # File handling
    sendfile           on;
    tcp_nopush         on;
    tcp_nodelay        on;

    # Timeouts
    keepalive_timeout  65;
    client_body_timeout 12;
    send_timeout       10;

    # Buffers
    client_body_buffer_size 10K;
    client_max_body_size    8m;

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 256;
}
```

---

## 5. Variables & Conditionals

```nginx
server {
    # Built-in variables
    # $host, $uri, $args, $request_method, $remote_addr,
    # $http_user_agent, $scheme, $request_uri

    # Custom variables
    set $backend "http://127.0.0.1:3000";

    # Conditionals (use sparingly — "if is evil" in location context)
    if ($request_method = POST) {
        return 405;
    }

    # Map — preferred over if for variable mapping
    map $uri $new_uri {
        /old-page  /new-page;
        /blog      /articles;
        default    "";
    }
}
```

---

## 6. Error Pages & Redirects

```nginx
server {
    # Custom error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;

    location = /50x.html {
        root /usr/share/nginx/html;
        internal;          # Only accessible via error_page
    }

    # Redirects
    location /old-path {
        return 301 /new-path;
    }

    # Force www
    server_name example.com;
    return 301 $scheme://www.example.com$request_uri;
}
```

---

## 7. Essential Commands

```bash
nginx -t                 # Test configuration
nginx -T                 # Test and dump full config
nginx -s reload          # Graceful reload
nginx -s stop            # Fast shutdown
nginx -s quit            # Graceful shutdown
nginx -V                 # Show version and compile options
systemctl status nginx   # Check service status
```

---

## 8. Best Practices

- **Always `nginx -t`** before reloading — catches syntax errors
- **Use `include`** to split config into manageable files
- **Use `sites-available/sites-enabled`** pattern for virtual hosts
- **Prefer `map`** over `if` for conditional logic
- **Use `try_files`** instead of `if (-f ...)` for file existence checks
- **Set `server_tokens off`** to hide Nginx version in responses
- **Use meaningful `server_name`** — avoid catch-all `_` in production
- **Keep `worker_processes auto`** — Nginx auto-detects CPU cores
