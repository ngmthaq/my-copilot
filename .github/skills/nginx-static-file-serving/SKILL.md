---
name: nginx-static-file-serving
description: "Nginx static file serving — root vs alias, try_files, expires, gzip, directory listing, and SPA routing. Use when: serving static files; configuring asset delivery; setting up SPA. DO NOT USE FOR: caching upstream responses (use nginx-caching-strategies); reverse proxy (use nginx-reverse-proxy)."
---

# Nginx Static File Serving

## 1. Root vs Alias

```nginx
server {
    # root — appends location to path
    location /images/ {
        root /var/www;
        # /images/logo.png → /var/www/images/logo.png
    }

    # alias — replaces location with path
    location /images/ {
        alias /var/www/assets/img/;
        # /images/logo.png → /var/www/assets/img/logo.png
    }

    # Common mistake: missing trailing slash with alias
    location /images/ {
        alias /var/www/assets/img;    # WRONG — missing trailing /
        alias /var/www/assets/img/;   # CORRECT
    }
}
```

---

## 2. try_files

```nginx
server {
    root /var/www/html;

    # Try file, then directory, then fallback
    location / {
        try_files $uri $uri/ =404;
    }

    # SPA routing — fallback to index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Try file, then proxy to backend
    location / {
        try_files $uri @backend;
    }
    location @backend {
        proxy_pass http://127.0.0.1:3000;
    }
}
```

---

## 3. Cache Headers for Assets

```nginx
server {
    # Fingerprinted assets — long cache
    location ~* \.(css|js)$ {
        root /var/www/html;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Images and fonts
    location ~* \.(png|jpg|jpeg|gif|ico|svg|woff2|woff|ttf)$ {
        root /var/www/html;
        expires 30d;
        add_header Cache-Control "public";
        access_log off;
    }

    # HTML — don't cache (so new deploys take effect)
    location ~* \.html$ {
        root /var/www/html;
        expires -1;
        add_header Cache-Control "no-cache";
    }
}
```

---

## 4. Gzip & Precompressed Files

```nginx
http {
    # Dynamic gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 256;
    gzip_comp_level 4;
    gzip_types
        text/plain text/css text/javascript
        application/json application/javascript
        application/xml image/svg+xml;

    # Serve pre-compressed files (built at deploy time)
    gzip_static on;
    # Looks for .gz version first: style.css.gz before compressing style.css

    # Brotli (requires ngx_brotli module)
    brotli on;
    brotli_comp_level 4;
    brotli_static on;
    brotli_types text/plain text/css application/json application/javascript image/svg+xml;
}
```

---

## 5. Directory Listing

```nginx
server {
    # Enable directory listing
    location /downloads/ {
        alias /var/www/files/;
        autoindex on;
        autoindex_exact_size off;   # Show human-readable sizes
        autoindex_localtime on;     # Show local time
        autoindex_format html;      # html | json | xml
    }

    # Disable globally (default)
    autoindex off;
}
```

---

## 6. File Download Headers

```nginx
location /downloads/ {
    alias /var/www/files/;

    # Force download instead of inline display
    if ($request_filename ~* \.(pdf|zip|tar\.gz)$) {
        add_header Content-Disposition "attachment";
    }

    # Limit download speed
    limit_rate 1m;           # 1 MB/s per connection
    limit_rate_after 10m;    # Full speed for first 10MB
}
```

---

## 7. SPA (Single Page Application) Setup

```nginx
server {
    listen 80;
    server_name app.example.com;
    root /var/www/app/dist;

    # All routes → index.html (let frontend router handle it)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets aggressively
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API calls → backend
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
    }

    # Don't cache index.html
    location = /index.html {
        expires -1;
        add_header Cache-Control "no-cache";
    }
}
```

---

## 8. Performance Optimizations

```nginx
http {
    # Kernel-level file transfer
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;

    # Cache file metadata
    open_file_cache max=10000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;

    # MIME types
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
}
```

---

## 9. Best Practices

- **Use `alias`** when the URL path doesn't match the filesystem path
- **Use `try_files`** for SPAs — `$uri $uri/ /index.html`
- **Set long `expires`** on fingerprinted assets, no-cache on HTML
- **Enable `gzip_static`** — serve pre-built `.gz` files to avoid CPU overhead
- **Enable `sendfile`** — bypasses user-space for static files
- **Enable `open_file_cache`** for directories with many files
- **Turn off `access_log`** for static assets to reduce I/O
- **Use `add_header Cache-Control "immutable"`** for versioned assets
- **Always include proper MIME types** — browsers rely on Content-Type
