### Auth
- salt/hash (was it sha256 or sha512?)
- bcrypt (wasnt there some vulnerability?)
- jwt things
- tokens are valid for 1 minute, then have to be refreshed (theoretical max of 192 requests)
- sessions (refresh tokens) are valid for 28days after the last login
- could be improved: refresh tokens should only be usable once
- password reset is valid for 6hours

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

### testing

### todo
- different signing keys local & prod
- validate inputs
- sanitize uploads