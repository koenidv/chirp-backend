### Security Contact
- implemented using the [security.txt](https://securitytxt.org) standard
- at [https://api.thechirp.de/.well-known/security.txt](https://api.thechirp.de/.well-known/security.txt)
- signed to verify authenticity

### Auth
- salted & hashed
- bcrypt (wasnt there some vulnerability?)
- jwt things
- tokens are valid for 1 minute, then have to be refreshed (theoretical max of 192 requests)
- sessions (refresh tokens) are valid for 28days after the last login
- could be improved: refresh tokens should only be usable once
- password reset is valid for 6hours
- jwt could theoretically be bound to an ip, but difficult for mobile users if it's invalid right after creating the token
- email notifications when registering and for new sign ins

### Password requirements
- min 8 characters
- checked against haveibeenpwned

### Pagination
- posts are paginated at 20 posts per page

### Input validation
- file uploads (profile images) are limited to 15MB
- no operations are performed on the file, it is transferred to imagekit (they're more competent)
- all other requests are limited to 10MiB
- many inputs are length checked (username, biography, ...) but usually rely on the 10MiB constraint

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
- some things are tested but most not haha
- automated code analysis with Snyk 

### dependency management
- deps are listed in deps.ts and pinned to a specific version
- checked for outdated dependencies using [denopendabot](https://github.com/hasundue/denopendabot)

# observability
- canary user via canarytokens.org
- observability was difficult to implement proper observability half a year ago (no opentelemetry etc)
- now basic implementation with sentry, but only error reporting so far
- super basic deno deploy metrics and logs

### todo
- general
  - validate numbers
  - paramterized queries, not just prepared statements
- backups
  - database backups (potientally incremental?)
  - describe how i tested restoring a database backup lol
- devsec
  - hardware token for accessing the system
  - how are admin devices secured?
- observability
  - monitoring (accounts created, sign in requests ...) - (sentry, sonarqube, grafana, prometheus, datadog, new relic, logz.io, loggly, logr)
- analysis
  - test owasp / portswigger automated tests against api - because hackers are lazy and will autoscan things
  - understand how a request flows, including the (osi) layers and checks that are performed
  - gpt4 turbo check entire project haha
- concepts
  - xss
  - csrf
  - sqli
