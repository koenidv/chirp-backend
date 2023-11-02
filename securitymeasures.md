### Auth


### Header things


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

### env

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

### todo
- rate-limiting
- hsts & force-https
- other headers
- different signing keys local & prod
- (long) ttl for sessions
- remember last session use time (on refresh)
- shorter key validity (til refresh)