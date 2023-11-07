### Auth
- salted & hashed
- bcrypt (wasnt there some vulnerability?)
- jwt things
- tokens are valid for 1 minute, then have to be refreshed (theoretical max of 192 requests)
- sessions (refresh tokens) are valid for 28days after the last login
- could be improved: refresh tokens should only be usable once
- password reset is valid for 6hours
- jwt could theoretically be bound to an ip, but difficult for mobile users if it's invalid right after creating the token

### Header things
- many only relevant for froentend
- x-permitted-cross-domain-policies
- x-content-type-options
- x-powered-by (vorfahrt example)
- cross-origin-resource-policy

### CORS
- asks browsers to only allow requests from out front-end

### SQL injection

### Prepared SQL queries
Prepared SQL queries are a way to prevent SQL injection attacks.
Even though the statements look like regular JS template strings, the [postgres library](https://deno-postgres.com/#/?id=template-strings) parses them as SQL statements with arguments.

#### Why not an ORM?
Deno, explain please.

### XSS

### CSRF

### HTTPS / HSTS
- enforced https (via deno deploy)
- hsts requires https for a year

### Snelm
- crossDomain
- dnsPrefetchControl
- expectCt
- featurePolicy
- frameguard
- hidePoweredBy
- hsts
- ieNoOpen
- referrerPolicy
- xssProtection

### rate limit
- 8 requests per 2.5 seconds seem like a nice balance
- could be improved with different limits for anonymous / signed in / possibly administrator

### env

### Protected Branch
- cannot push directly to main, but a pull request must be created
- if i wasnt the sole backend developer it would make sense to require pr reviews

### testing

### todo
- different signing keys local & prod
- validate inputs (especially media upload)
- sanitize uploads
- limited key for database connection (mailersend implemented, cdn?)
- paginate logs & sessions
- deps file
- check password requirements
- check passwords against haveibeenpwned
- security contact (is there a standard?)
- consider append client-generated secret to refresh token (can the refresh token be stolen without the secret?)
- database backups (potientally incremental?)
- monitoring (accounts created, sign in requests ...) - (sentry, sonarqube, grafana, prometheus, datadog, new relic, logz.io, loggly, logr)
- generate new refresh token after using it
- hardware token for accessing the system
- how are admin devices secured?
- different mailersend & cdn keys for local & prod
- test owasp / portswigger automated tests against api - because hackers are lazy and will autoscan things
- canary tokens, "fake user" - if this user ever shows up, there was a breach. tools to get notified about this (canarytokens.org)
- tools to keep dependencies up to date (dependabot, snyk, greenkeeper) - in CI pipeline!
- testing
- describe how i tested restoring a database backup lol