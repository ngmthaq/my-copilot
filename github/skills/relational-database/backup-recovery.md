---
name: backup-recovery
description: pg_dump, pg_restore, mysqldump, backup strategies, point-in-time recovery, and restoration steps.
---

# Backup & Recovery

## Overview

Backups protect against data loss from hardware failure, accidental deletion, or corruption. Always test your restore process — an untested backup is not a backup.

---

## 1. PostgreSQL — pg_dump / pg_restore

### Backup a single database

```bash
# Plain SQL format (human-readable, easy to inspect)
pg_dump -U postgres -d mydb -f mydb_backup.sql

# Custom format (compressed, supports partial restore)
pg_dump -U postgres -d mydb -F c -f mydb_backup.dump

# Options:
# -U  database user
# -d  database name
# -F c  custom compressed format
# -f  output file
```

### Backup all databases

```bash
pg_dumpall -U postgres -f all_databases.sql
```

### Backup only specific tables

```bash
pg_dump -U postgres -d mydb -t users -t orders -f partial_backup.sql
```

### Restore from SQL file

```bash
psql -U postgres -d mydb -f mydb_backup.sql
```

### Restore from custom format

```bash
# Recreate the database first if it doesn't exist
createdb -U postgres mydb

# Restore
pg_restore -U postgres -d mydb mydb_backup.dump

# Restore in parallel (faster for large databases)
pg_restore -U postgres -d mydb -j 4 mydb_backup.dump
# -j 4 = use 4 parallel workers
```

### Restore only specific tables

```bash
pg_restore -U postgres -d mydb -t users mydb_backup.dump
```

---

## 2. MySQL — mysqldump

### Backup a single database

```bash
mysqldump -u root -p mydb > mydb_backup.sql

# With stored procedures and triggers
mysqldump -u root -p --routines --triggers mydb > mydb_backup.sql
```

### Backup all databases

```bash
mysqldump -u root -p --all-databases > all_databases.sql
```

### Backup only specific tables

```bash
mysqldump -u root -p mydb users orders > partial_backup.sql
```

### Restore

```bash
mysql -u root -p mydb < mydb_backup.sql

# If restoring all databases
mysql -u root -p < all_databases.sql
```

---

## 3. Backup Formats Comparison

| Format         | Tool                   | Pros                        | Cons                     |
| -------------- | ---------------------- | --------------------------- | ------------------------ |
| Plain SQL      | `pg_dump`, `mysqldump` | Human-readable, portable    | Large file, slow restore |
| Custom (pg)    | `pg_dump -F c`         | Compressed, partial restore | PostgreSQL only          |
| Directory (pg) | `pg_dump -F d`         | Parallel backup/restore     | Multiple files           |
| Binary log     | MySQL binlog           | Point-in-time recovery      | Complex setup            |
| WAL archiving  | PostgreSQL WAL         | Point-in-time recovery      | Requires setup           |

---

## 4. Backup Strategies

### Full backup

A complete snapshot of the entire database. Simple but slow for large databases.

```bash
# PostgreSQL — schedule with cron (daily at 2am)
0 2 * * * pg_dump -U postgres -d mydb -F c -f /backups/mydb_$(date +\%Y\%m\%d).dump

# MySQL — schedule with cron (daily at 2am)
0 2 * * * mysqldump -u root -p'password' --single-transaction mydb > /backups/mydb_$(date +%Y%m%d).sql
# --single-transaction: consistent snapshot without locking tables (InnoDB only)
```

### Incremental backup

Only backs up changes since the last backup. Requires WAL archiving (PostgreSQL) or binary logs (MySQL). More complex but much faster and smaller.

### 3-2-1 Rule

- **3** copies of the data
- **2** different storage media (e.g., local disk + cloud)
- **1** copy offsite (e.g., S3, Google Cloud Storage)

---

## 5. Point-in-Time Recovery (PITR)

Recover the database to any specific moment in time — useful for recovering from accidental deletes.

### PostgreSQL PITR (with WAL archiving)

```bash
# In postgresql.conf — enable WAL archiving
wal_level = replica
archive_mode = on
archive_command = 'cp %p /mnt/wal_archive/%f'

# Restore to a specific time
# 1. Restore a full base backup
# 2. Create recovery.conf (or recovery settings in postgresql.conf)
restore_command = 'cp /mnt/wal_archive/%f %p'
recovery_target_time = '2024-06-15 14:30:00'
```

### MySQL PITR (with binary logs)

```bash
# Enable binary logging in MySQL config
log_bin = /var/log/mysql/mysql-bin.log

# Restore: apply full backup, then replay binary logs up to the target time
mysqlbinlog --stop-datetime="2024-06-15 14:30:00" /var/log/mysql/mysql-bin.* | mysql -u root -p
```

---

## 6. Restore Checklist

Before restoring in production:

1. Stop application traffic to the database
2. Rename or snapshot the current database (don't drop yet)
3. Create a fresh target database
4. Run the restore command
5. Verify data integrity (row counts, spot checks)
6. Point the application to the restored database
7. Monitor for errors

```bash
# Quick row count check after restore
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM orders;
SELECT MAX(created_at) FROM orders;   -- latest record sanity check
```

---

## 7. Testing Backups

Run a restore drill regularly (monthly or after major schema changes):

```bash
# PostgreSQL: restore to a staging/test database
pg_restore -U postgres -d mydb_test mydb_backup.dump

# Verify
psql -U postgres -d mydb_test -c "SELECT COUNT(*) FROM users;"

# MySQL: restore to a test database
mysql -u root -p mydb_test < mydb_backup.sql

# MySQL: verify table integrity after restore
mysqlcheck -u root -p --all-databases
```

If the restore fails, fix the backup process immediately.

---

## Key Rules

- Always store backups off the same server (S3, GCS, separate NAS, etc.)
- Test restores regularly — never assume a backup works until you've tested it
- Use the custom (`-F c`) or directory (`-F d`) format for PostgreSQL — enables parallel restore and partial restores
- Automate backups with cron or a managed service; don't rely on manual runs
- Follow the 3-2-1 rule: 3 copies, 2 media types, 1 offsite
- Keep backups long enough for your recovery window (e.g., 30 days daily + 12 months monthly)
- Encrypt backups if they contain sensitive data
