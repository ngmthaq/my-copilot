---
name: nginx-url-rewriting
description: "Nginx URL rewriting — rewrite directive, return, map, regex captures, and common rewrite patterns. Use when: redirecting URLs; rewriting paths; migrating URL structures. DO NOT USE FOR: reverse proxy path stripping (use nginx-reverse-proxy); basic location matching (use nginx-basic-configuration)."
---

# Nginx URL Rewriting

## 1. return vs rewrite

```nginx
server {
    # return — simple redirects (preferred for redirects)
    location /old {
        return 301 /new;
    }
    location /gone {
        return 410;
    }
    location / {
        return 301 https://$host$request_uri;  # HTTP → HTTPS
    }

    # rewrite — regex-based URL transformation
    rewrite ^/blog/(\d+)$ /articles/$1 permanent;   # 301
    rewrite ^/blog/(\d+)$ /articles/$1 redirect;     # 302
    rewrite ^/blog/(\d+)$ /articles/$1 last;          # Internal rewrite, restart matching
    rewrite ^/blog/(\d+)$ /articles/$1 break;         # Internal rewrite, stop matching
}
```

**Flags:**
| Flag | Code | Behavior |
|---|---|---|
| `permanent` | 301 | External redirect, cached by browser |
| `redirect` | 302 | External redirect, not cached |
| `last` | — | Internal rewrite, restarts location matching |
| `break` | — | Internal rewrite, stops processing |

---

## 2. Regex Captures

```nginx
server {
    # Named captures
    rewrite ^/user/(?<username>\w+)/profile$ /profiles/$username last;

    # Numbered captures
    rewrite ^/(\w+)/(\d+)$ /view?type=$1&id=$2 last;
    # /product/42 → /view?type=product&id=42

    # Preserve query string (automatic with rewrite)
    rewrite ^/search$ /find last;
    # /search?q=nginx → /find?q=nginx

    # Replace query string
    rewrite ^/search$ /find?engine=v2 last;
    # /search?q=nginx → /find?engine=v2 (original args dropped)

    # Append to query string
    rewrite ^/search$ /find?engine=v2&$args last;
    # /search?q=nginx → /find?engine=v2&q=nginx
}
```

---

## 3. map Directive

```nginx
http {
    # Map old URLs to new URLs
    map $uri $redirect_uri {
        /old-about    /about;
        /old-contact  /contact;
        /old-blog     /articles;
        default       "";
    }

    server {
        if ($redirect_uri) {
            return 301 $redirect_uri;
        }
    }

    # Map with regex
    map $uri $new_uri {
        ~^/blog/(\d{4})/(\d{2})/(.+)$  /articles/$1-$2-$3;
        ~^/user/(.+)/settings$          /account/$1/preferences;
        default                          "";
    }

    # Map for A/B testing
    map $cookie_ab_test $backend {
        "B"     http://127.0.0.1:3001;
        default http://127.0.0.1:3000;
    }
}
```

---

## 4. Common Redirect Patterns

```nginx
server {
    # Non-www → www
    server_name example.com;
    return 301 $scheme://www.example.com$request_uri;
}

server {
    # www → non-www
    server_name www.example.com;
    return 301 $scheme://example.com$request_uri;
}

server {
    # Remove trailing slash
    rewrite ^/(.*)/$ /$1 permanent;

    # Add trailing slash
    rewrite ^(.*[^/])$ $1/ permanent;

    # Force lowercase URLs
    location ~ [A-Z] {
        rewrite ^(.*)$ $scheme://$host$uri_lowercase permanent;
    }

    # Remove .html extension
    rewrite ^(/.+)\.html$ $1 permanent;

    # Add .html internally
    location / {
        try_files $uri $uri.html $uri/ =404;
    }
}
```

---

## 5. Path Prefix Operations

```nginx
server {
    # Add prefix
    rewrite ^/(.*)$ /v2/$1 last;
    # /users → /v2/users

    # Remove prefix
    rewrite ^/api/v1/(.*)$ /$1 last;
    # /api/v1/users → /users

    # Swap prefix
    rewrite ^/api/v1/(.*)$ /api/v2/$1 permanent;

    # Versioned API routing
    location /api/ {
        rewrite ^/api/v(\d+)/(.*)$ /internal/v$1/$2 break;
        proxy_pass http://backend;
    }
}
```

---

## 6. Conditional Rewrites

```nginx
server {
    # Rewrite based on query parameter
    if ($arg_format = "json") {
        rewrite ^/(.*)$ /api/$1.json last;
    }

    # Rewrite based on user agent (mobile redirect)
    set $mobile 0;
    if ($http_user_agent ~* "mobile|android|iphone") {
        set $mobile 1;
    }
    if ($mobile = 1) {
        rewrite ^/(.*)$ /m/$1 last;
    }

    # Maintenance mode
    set $maintenance 0;
    # set $maintenance 1;  # Uncomment to enable
    if ($maintenance = 1) {
        return 503;
    }
    error_page 503 @maintenance;
    location @maintenance {
        root /var/www;
        rewrite ^(.*)$ /maintenance.html break;
    }
}
```

---

## 7. Bulk Redirects with map

```nginx
http {
    # Load redirects from file
    map $request_uri $redirect_target {
        include /etc/nginx/redirects.map;
        default "";
    }

    server {
        if ($redirect_target) {
            return 301 $redirect_target;
        }
    }
}

# /etc/nginx/redirects.map
# /old-url-1  /new-url-1;
# /old-url-2  /new-url-2;
# ~^/category/(\d+)$  /c/$1;
```

---

## 8. Best Practices

- **Prefer `return` over `rewrite`** for simple redirects — faster and clearer
- **Prefer `map` over `if`** for complex conditional logic
- **Use `last`** when rewriting within Nginx, `permanent`/`redirect` for client-facing
- **Use `break`** inside `location` blocks to stop rewriting
- **Avoid rewrite chains** — each rewrite restarts processing with `last`
- **Use `map` + include** for bulk redirects — keeps config clean
- **Test with `curl -I`** to verify redirect chains
- **Avoid `if` in location context** — use `map` or `try_files` when possible
- **Always preserve query strings** when needed — append `&$args` or use `$request_uri`
