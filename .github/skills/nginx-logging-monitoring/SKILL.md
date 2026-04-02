---
name: nginx-logging-monitoring
description: "Nginx logging and monitoring — access logs, error logs, custom log formats, conditional logging, log rotation, and status monitoring. Use when: setting up logging; debugging requests; monitoring Nginx health. DO NOT USE FOR: general config (use nginx-basic-configuration); performance (use nginx-performance-tuning)."
---

# Nginx Logging & Monitoring

## 1. Access Log

```nginx
http {
    # Default combined format
    access_log /var/log/nginx/access.log;

    # Disable for specific locations
    location /health {
        access_log off;
        return 200 "OK";
    }

    # Per-server logs
    server {
        access_log /var/log/nginx/example.access.log;
    }
}
```

---

## 2. Custom Log Formats

```nginx
http {
    # JSON format — easy to parse with ELK/Loki
    log_format json escape=json
        '{'
            '"time":"$time_iso8601",'
            '"remote_addr":"$remote_addr",'
            '"method":"$request_method",'
            '"uri":"$uri",'
            '"status":$status,'
            '"body_bytes_sent":$body_bytes_sent,'
            '"request_time":$request_time,'
            '"upstream_response_time":"$upstream_response_time",'
            '"http_referer":"$http_referer",'
            '"http_user_agent":"$http_user_agent",'
            '"request_id":"$request_id"'
        '}';

    access_log /var/log/nginx/access.json.log json;

    # Detailed format with upstream timing
    log_format detailed '$remote_addr - $remote_user [$time_local] '
                        '"$request" $status $body_bytes_sent '
                        'rt=$request_time uct=$upstream_connect_time '
                        'urt=$upstream_response_time';
}
```

**Key variables:**
| Variable | Description |
|---|---|
| `$request_time` | Total time (client → nginx → upstream → client) |
| `$upstream_response_time` | Time waiting for upstream |
| `$upstream_connect_time` | Time to connect to upstream |
| `$request_id` | Unique request identifier |

---

## 3. Error Log

```nginx
# Global error log with severity level
error_log /var/log/nginx/error.log warn;

# Levels: debug, info, notice, warn, error, crit, alert, emerg

# Per-server error logs
server {
    error_log /var/log/nginx/example.error.log error;
}

# Debug for specific IPs only (requires --with-debug)
events {
    debug_connection 192.168.1.0/24;
}
```

---

## 4. Conditional Logging

```nginx
http {
    # Log only errors (4xx/5xx)
    map $status $log_errors_only {
        ~^[23] 0;
        default 1;
    }
    access_log /var/log/nginx/errors.log combined if=$log_errors_only;

    # Log slow requests (> 1 second)
    map $request_time $log_slow {
        ~^[0]\. 0;
        default 1;
    }
    access_log /var/log/nginx/slow.log detailed if=$log_slow;

    # Skip health checks
    map $uri $log_skip_health {
        /health 0;
        /ready  0;
        default 1;
    }
    access_log /var/log/nginx/access.log combined if=$log_skip_health;
}
```

---

## 5. Request Tracing

```nginx
server {
    # Use incoming trace ID or generate one
    map $http_x_request_id $trace_id {
        default $http_x_request_id;
        ""      $request_id;
    }

    # Pass to upstream
    proxy_set_header X-Request-ID $trace_id;

    # Include in response for debugging
    add_header X-Request-ID $trace_id;
}
```

---

## 6. Stub Status (Built-in Monitoring)

```nginx
server {
    location /nginx_status {
        stub_status;
        allow 127.0.0.1;
        allow 10.0.0.0/8;
        deny all;
    }
}
# Output:
# Active connections: 291
# server accepts handled requests
#  16630948 16630948 31070465
# Reading: 6 Writing: 179 Waiting: 106
```

- **Active connections** — current client connections including idle
- **Reading** — reading request headers
- **Writing** — sending response
- **Waiting** — idle keep-alive connections

---

## 7. Log Rotation

```bash
# /etc/logrotate.d/nginx
/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        [ -f /var/run/nginx.pid ] && kill -USR1 $(cat /var/run/nginx.pid)
    endscript
}
```

`kill -USR1` tells Nginx to reopen log files without restart.

---

## 8. Best Practices

- **Use JSON log format** — much easier to query in ELK/Loki
- **Log `$request_time` and `$upstream_response_time`** — essential for latency debugging
- **Use `$request_id`** for distributed tracing across services
- **Disable access logs** on health check endpoints to reduce noise
- **Use conditional logging** to separate error and slow request logs
- **Set up log rotation** — Nginx won't rotate logs by itself
- **Restrict `/nginx_status`** to internal IPs only
- **Use `error_log warn`** in production — `debug` is extremely verbose
