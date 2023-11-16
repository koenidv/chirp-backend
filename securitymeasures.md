# Security Measures Implemented in Chirp's Backend

### Security Contact

A security contact is implemented following the [security.txt](https://securitytxt.org) standard. It is signed to verify authenticity.  
The security contact is available at [https://api.thechirp.de/.well-known/security.txt](https://api.thechirp.de/.well-known/security.txt).

### JWT Access Token / Refesh Token

JWT access tokens are used to authenticate users. Refresh tokens are bound to session, whose existence is only checked on access token refresh. Thus, a deactivated session might still be valid until the access token expires.

1. Access tokes are signed using a secret key that is only known to the backend (can only be read via exporting the env from code)
2. These tokens include the (public) user id of the authenticated user
3. Access tokens are valid for 1 minute - on a single ip, this means a maximum of 192 requests per token
4. Refresh tokens are automatically invalided after 28 days of inactivity
5. Sessions can be invalidated by the user
6. Possible improvements: Refresh tokens should only be usable once, and access tokens could be bound to an ip address (which would be mean even more frequent refreshes for mobile users though). Access tokens could probably be valid for a bit longer.

### Email/Password Auth

Users can register and sing in using an email / password combination. Ideally, a second factor would be required, but that's not implemented yet.

1. Passwords are salted & hashed using bcrypt
2. Passwords are required to be at least 8 characters long
3. Passwords are checked against the [haveibeenpwned](https://haveibeenpwned.com) database using k-anonymity
4. Passwords can be reset via email, each reset token is valid for 6 hours
5. Failed login attempts are logged but currently no action is taken if there are many
6. Logins are affected by the 8 requests per 2.5 seconds per ip rate limit

### Security-Relevant Events

1. Users receive email notifications when they register and when they sign in (and when they try to reset their password)
2. Registers, successful and failed logins, and a few other things are logged to Sentry
3. Events like register, login, deactivating a session, changing the username, ... are logged to the database. Users can review these events and potentially invalidate associated sessions.

### Pagination

To prevent server overload and make responses more manageable, posts are paginated at 20 posts per page. Data exfiltration is not a concern here as posts are public anyway.

### Input validation

1. File uploads (currently only profile image) are limited to 15MB
2. All other requests are limited to 10MiB
3. No operations are performed on media but only transferred to ImageKit (they're more competent in safely handling that)
4. Many inputs are length checked (username, biography, ...) but usually rely on the 10MiB constraint
5. Non-freeform inputs are checked to be of that type (email addresses, numbers, ...)
6. Usernames are checked against a list of reserved names (admin, root, chirp, ...)

### SQL Injection Prevention

1. Prepared and parameterized statements  
    Even though the statements look like regular JS template strings, the [deno postgres drive](https://deno-postgres.com/#/?id=template-strings) parses them as prepared SQL statements with arguments.
2. Disallow inserting unescaped characters
3. I'm not using an ORM unfortunately because there's no proper ORM for Deno yet.

### Security-Relevant Headers

1. CORS Headers  
    Asks browsers to only evaluate the request if it's from our frontend domain.
2. X-Permitted-Cross-Domain-Policies  
    Prevents Adobe Flash and Adobe Acrobat from loading content.
3. X-Content-Type-Options  
    Prevents browsers from trying to guess the content type of a response. This can prevent XSS attacks.
4. Cross-Origin-Resource-Policy  
    Prevents browsers from loading resources from other domains. This can prevent XSS attacks.
5. X-Powered-By  
    Removes the "Powered by Deno Deploy" header which could in theory make it easier to find vulnerabilities. Also fun when the API is powered by caffeine :\)
6. Some other headers that only really apply to frontends
    - *X-DNS-Prefetch-Control*
        Can prevent browsers from prefetching link domains when you don't hover them.
    - *Feature-Policy*
        can tell the browser which features are allowed to be used
    - *X-Frame-Options*
        can prevent the site from being loaded in an iframe
    - *X-Download-Options*
        can prevent the Internet Explorer from executing downloads in the context of the site
    - *Referrer-Policy*
        can prevent the browser from sending the referrer header to other sites for privacy reasons
    - *XSS-Protection*
        XSS protection is disabled in newer browsers and broken in many older versions. The header explicitly disables it.

### HTTPS / HSTS

1. Deno Deploy enforces HTTPS
2. HSTS header makes browsers only connect via HTTPS for a year

### Rate Limiting

Each ip is rate-limited to 8 requests per 2.5 seconds. This is a nice balance between preventing abuse and not annoying users.  
This could be improved by having different limits for anonymous / signed in / possibly administrator users.

### Environments & Keys

1. All sensitive data is stored in environment variables (.env on dev machines, deno deploy's env variables on prod, and not commited to git)
2. Deno Deploy doesn't allow reading env variables as admin, only through deploying code that exposes them
3. Production, Sandbox, and local machines use different keys for signing JWTs
4. Production, Sandbox, and local machines use different API keys for ImageKit, MailerSend, and the database
5. API keys are only allowed to perform specific actions (i.e. manage emails, or upload images)
6. API keys can be reset quickly

### Dependencies

1. All non-test dependencies are pinned to a specific version and listed in deps.ts
2. [Denopendabot](https://github.com/hasundue/denopendabot) checks for outdated dependencies
3. Additionally, Snyk checks for vulnerabilities in dependencies
4. Continuous deployment allows for quick updates

### Testing

1. Automated static code analysis with Snyk
2. Some functionality (e.g. validating JWTs) is tested  
    *This should cover a lot more and be continously integrated, but isn't yet*

### Observability

1. A canary user is registered via [canarytokens.org](https://canarytokens.org)
2. Registration, successful and failed logins, and a few other things are logged to Sentry  
    *Proper observability was very difficult to implement in Deno back when I built this, which is why only so few events are logged*
3. Basic performance metrics and logs are measured on Deno Deploy
4. Security-relevant events are logged and visible to users, as well as email notifications

### Database Backups

1. The database is backed up hourly, but not with every change  
    *This is automatically handles by cockroachdb*
2. Restoring works  
    *This is tested, though not by free will*

### Development Environment

1. The release branch (main) is protected and requires a pull request to be merged  
    *If I wasn't the sole backend developer, requiring PR reviews would make sense*
2. Physical security of the development machine could be improved




### todo
- general
  - validate numbers
  - paramterized queries, not just prepared statements
- analysis
  - test owasp / portswigger automated tests against api - because hackers are lazy and will autoscan 