### Auth
- salted & hashed
- bcrypt (wasnt there some vulnerability?)
- jwt things
- tokens are valid for 1 minute, then have to be refreshed (theoretical max of 192 requests)
- sessions (refresh tokens) are valid for 28days after the last login
- could be improved: refresh tokens should only be usable once
- password reset is valid for 6hours
- jwt could theoretically be bound to an ip, but difficult for mobile users if it's invalid right after creating the token

### Password requirements
- min 8 characters
- checked against haveibeenpwned

### Pagination
- posts are paginated at 20 posts per page

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

### env & keys
- env variables are used for sensitive data (deno deploy's env variables are write-only for users)
- uses different jwt signing for test deploy, prod deploy, and local machines
- uses different api keys for each env (mailersend, database, imagekit)
- api keys can be quickly reset
- api keys only allow for specific actions (mailersend: manage emails, imagekit: read/write images)

### Protected Branch
- cannot push directly to main, but a pull request must be created
- if i wasnt the sole backend developer it would make sense to require pr reviews

### testing

### dependency management
- deps are listed in deps.ts and pinned to a specific version
- checked for outdated dependencies using [denopendabot](https://github.com/hasundue/denopendabot)

### todo
- validate inputs (especially media upload)
- sanitize uploads
- security contact (is there a standard?)
- database backups (potientally incremental?)
- monitoring (accounts created, sign in requests ...) - (sentry, sonarqube, grafana, prometheus, datadog, new relic, logz.io, loggly, logr)
- generate new refresh token after using it
- hardware token for accessing the system
- how are admin devices secured?
- test owasp / portswigger automated tests against api - because hackers are lazy and will autoscan things
- canary tokens, "fake user" - if this user ever shows up, there was a breach. tools to get notified about this (canarytokens.org)
- tools to keep dependencies up to date (dependabot, snyk, greenkeeper) - in CI pipeline!
- testing
- describe how i tested restoring a database backup lol
- understand how a request flows, including the (osi) layers and checks that are performed
- other emails (signup, username changed)
- gpt4 turbo check entire project haha