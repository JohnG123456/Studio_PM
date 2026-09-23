# Supabase: every new table needs explicit grants

From 30 Oct 2026 Supabase no longer grants Data API access to new tables in
`public` automatically. A table created without grants exists, but
supabase-js gets "permission denied" on it. So in the same SQL that creates a
table, straight after its `enable row level security` line, add:

```sql
grant select, insert, update, delete on public.<table> to authenticated, service_role;
```

- Don't grant `anon` (signed-out visitors) on tables. This app has no signed-out features.
- Never grant on a table without RLS enabled: the grant opens the table and RLS
  is what limits it to the right rows.
- A `bigserial`/identity column the app inserts into also needs
  `grant usage, select on sequence public.<table>_<column>_seq to authenticated, service_role;`
- Tables that already exist keep the grants they have; nothing to re-run.
