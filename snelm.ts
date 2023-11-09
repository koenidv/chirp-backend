import { Snelm } from "./deps.ts";

// X-Permitted-Cross-Domain-Policies - https://owasp.org/www-project-secure-headers/#x-permitted-cross-domain-policies
const crossDomainConfig = {
    permittedPolicies: 'none', // don't allow any cross-domain policy files
};

// Content-Security-Policy - little to no advantage on a backend api, but it's also basically free
const cspConfig = {
    // Specify directives as normal.
    directives: {
        defaultSrc: ["'none'"],
        scriptSrc: ["'none'"],
        styleSrc: ["'none'"],
        fontSrc: ["'none'"],
        imgSrc: ["'none'"],
        sandbox: true,
        objectSrc: ["'none'"],
        upgradeInsecureRequests: true,
        blockAllMixedContent: true,
        manifestSrc: ["'none'"]
    },
    // Set to true if you only want browsers to report errors, not block them.
    // You may also set this to a function(req, res) in order to decide dynamically
    // whether to use reportOnly mode, e.g., to allow for a dynamic kill switch.
    reportOnly: false, // also set reportUri
    setAllHeaders: true, // set csp, webkit-csp, x-csp
    disableAndroid: false, // csp can be buggy on old android versions, don't care
    browserSniff: false // disable different headers for different user agents
};

// X-DNS-Prefetch-Control - will not make a difference in the backend
const dnsPrefetchControlConfig = {
    allow: true,
};

// X-Content-Type-Options - Prevent browsers from sniffing the mime type; prevents non-script from being run
const dontSniffMimetypeConfig = true;

// Expect-CT is deprecated - https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Expect-CT
const expectCtConfig = null;

// Feature-Policy - replaced by Permissions-Policy and irrelevant for the backend
const featurePolicyConfig = null;

// X-Frame-Options - irrelevant for a json-based api but doesn't hurt either
const frameguardConfig = {
    action: 'deny'
};

// Hides the Oak X-Powered-By header - only interesting if we're using an outdated/vulnerable oak version lol
const hidePoweredByConfig = {
    setTo: 'caffeine',
};

// HSTS - asks browsers to enforce HTTPS for a year (only the api domain)
const hstsConfig = {
    maxAge: 31536000,
    includeSubDomains: false,
    preload: true,
};

// Referrer-Policy - irrelevant for the backend
const referrerPolicyConfig = null;

// X-XSS-Protection should be disabled - https://github.com/OWASP/CheatSheetSeries/issues/376
const xssProtectionConfig = null;

// Adding configuration to snelm
export const snelm = new Snelm("oak", {
    crossDomain: crossDomainConfig,
    csp: cspConfig,
    dnsPrefetchControl: dnsPrefetchControlConfig,
    dontSniffMimetype: dontSniffMimetypeConfig,
    expectCt: expectCtConfig,
    featurePolicy: featurePolicyConfig,
    frameguard: frameguardConfig,
    hidePoweredBy: hidePoweredByConfig,
    hsts: hstsConfig,
    referrerPolicy: referrerPolicyConfig,
    xssProtection: xssProtectionConfig,
});