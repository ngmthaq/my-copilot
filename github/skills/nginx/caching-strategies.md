---
name: nginx-caching-strategies
description: "Nginx caching — proxy cache, browser cache, cache keys, purging, bypass, and microcaching. Use when: configuring response caching; improving backend performance; setting cache headers. DO NOT USE FOR: static file serving (use nginx-static-file-serving); performance tuning beyond caching (use nginx-performance-tuning)."
---

# Nginx Caching Strategies

## 1. Proxy Cache Setup

```nginx
http {
    # Define cache zone
    proxy_cache_path /var/cache/nginx
        levels=1:2              # Directory structure depth
        keys_zone=my_cache:10m  # 10MB shared memory for keys
        max_size=1g             # Max disk usage
        inactive=60m            # Remove items not accessed in 60m
        use_temp_path=off;      # Write directly to cache dir

    server {
        location /api/ {
            proxy_pass http://backend;

            proxy_cache my_cache;
            proxy_cache_valid 200 30m;       # Cache 200s for 30 min
            proxy_cache_valid 404 1m;        # Cache 404s for 1 min
            proxy_cache_valid any 5m;        # Everything else 5 min

            # Show cache status in response header
            add_header X-Cache-Status $upstream_cache_status;
        }
    }
}
```

`$upstream_cache_status` values: `MISS`, `HIT`, `EXPIRED`, `STALE`, `BYPASS`, `REVALIDATED`

---

## 2. Cache Key Configuration

```nginx
# Default key
proxy_cache_key $scheme$proxy_host$request_uri;

# Include query string and cookies
proxy_cache_key "$scheme$request_method$host$request_uri$cookie_session";

# Per-user caching (careful with memory)
proxy_cache_key "$scheme$host$request_uri$http_authorization";

# Ignore query params for cache matching
location ~* \.(css|js|png|jpg)$ {
    proxy_cache_key "$scheme$host$uri";  # $uri instead of $request_uri
    proxy_cache my_cache;
    proxy_cache_valid 200 7d;
}
```

---

## 3. Browser Cache (Cache-Control Headers)

```nginx
# Static assets — long cache with fingerprinted URLs
location ~* \.(css|js|woff2|png|jpg|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# HTML — short or no cache
location ~* \.html$ {
    expires -1;
    add_header Cache-Control "no-cache";
}

# API responses — no caching
location /api/ {
    add_header Cache-Control "no-store, no-cache, must-revalidate";
    add_header Pragma "no-cache";
}

# ETag and Last-Modified (enabled by default)
etag on;
if_modified_since exact;
```

---

## 4. Cache Bypass & Purging

```nginx
server {
    location /api/ {
        proxy_pass http://backend;
        proxy_cache my_cache;

        # Bypass cache on specific conditions
        proxy_cache_bypass $http_cache_control;   # Client sends Cache-Control
        proxy_cache_bypass $cookie_nocache;        # Cookie-based bypass
        proxy_cache_bypass $arg_nocache;           # ?nocache=1

        # Don't cache POST or authenticated requests
        proxy_no_cache $request_method_is_post $http_authorization;

        # Map to detect POST
        set $request_method_is_post 0;
        if ($request_method = POST) {
            set $request_method_is_post 1;
        }
    }

    # Manual purge (requires ngx_cache_purge module)
    location ~ /purge(/.*) {
        allow 127.0.0.1;
        deny all;
        proxy_cache_purge my_cache "$scheme$request_method$host$1";
    }
}
```

---

## 5. Stale Cache (Serve Old Content on Errors)

```nginx
location /api/ {
    proxy_pass http://backend;
    proxy_cache my_cache;

    # Serve stale content when backend is down
    proxy_cache_use_stale error timeout updating
                          http_500 http_502 http_503 http_504;

    # Background update — serve stale while refreshing
    proxy_cache_background_update on;

    # Lock — only one request refreshes, others get stale
    proxy_cache_lock on;
    proxy_cache_lock_timeout 5s;

    # Revalidate with If-Modified-Since / If-None-Match
    proxy_cache_revalidate on;
}
```

---

## 6. Microcaching (Cache for Very Short Periods)

```nginx
# Great for high-traffic APIs — even 1s cache helps
proxy_cache_path /var/cache/nginx/micro
    keys_zone=micro:5m max_size=100m;

server {
    location /api/ {
        proxy_pass http://backend;
        proxy_cache micro;
        proxy_cache_valid 200 1s;

        proxy_cache_use_stale updating;
        proxy_cache_background_update on;
        proxy_cache_lock on;
    }
}
```

---

## 7. FastCGI Cache (PHP / Dynamic Content)

```nginx
http {
    fastcgi_cache_path /var/cache/nginx/fcgi
        keys_zone=fcgi_cache:10m max_size=512m inactive=30m;

    server {
        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php-fpm.sock;

            fastcgi_cache fcgi_cache;
            fastcgi_cache_valid 200 10m;
            fastcgi_cache_key "$scheme$request_method$host$request_uri";

            # Skip cache for logged-in users
            set $skip_cache 0;
            if ($http_cookie ~* "session") {
                set $skip_cache 1;
            }
            fastcgi_cache_bypass $skip_cache;
            fastcgi_no_cache $skip_cache;
        }
    }
}
```

---

## 8. Best Practices

- **Start with browser caching** — `expires` and `Cache-Control` are free performance
- **Use `immutable`** for fingerprinted/versioned assets (e.g., `app.a1b2c3.js`)
- **Enable stale serving** — better to show old data than an error page
- **Use `proxy_cache_lock`** to prevent cache stampedes
- **Add `X-Cache-Status`** header for debugging
- **Monitor cache hit ratio** — low ratio means cache key or TTL needs adjustment
- **Microcache high-traffic endpoints** — even 1s TTL dramatically reduces backend load
- **Never cache responses with `Set-Cookie`** unless intentional
