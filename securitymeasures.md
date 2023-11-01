### Prepared SQL queries
Prepared SQL queries are a way to prevent SQL injection attacks.
Even though the statements look like regular JS template strings, the [postgres library](https://deno-postgres.com/#/?id=template-strings) parses them as SQL statements with arguments.