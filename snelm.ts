import { Snelm } from "https://deno.land/x/snelm@1.3.0/mod.ts";

// crossDomain config
const crossDomainConfig = {
    permittedPolicies: 'none',
};

// csp config
const cspConfig = { 
    // Specify directives as normal.
    directives: {
    defaultSrc: ["'self'", 'default.com'],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ['style.com'],
        fontSrc: ["'self'", 'fonts.com'],
        imgSrc: ['img.com', 'data:'],
        sandbox: ['allow-forms', 'allow-scripts'],
        reportUri: '/report-violation',
        objectSrc: ["'none'"],
        upgradeInsecureRequests: true,
        workerSrc: false  // This is not set.
    },
 
    // This module will detect common mistakes in your directives and throw errors
    // if it finds any. To disable this, enable "loose mode".
    loose: false,
 
    // Set to true if you only want browsers to report errors, not block them.
    // You may also set this to a function(req, res) in order to decide dynamically
    // whether to use reportOnly mode, e.g., to allow for a dynamic kill switch.
    reportOnly: false,
 
    // Set to true if you want to blindly set all headers: Content-Security-Policy,
    // X-WebKit-CSP, and X-Content-Security-Policy.
    setAllHeaders: false,
 
    // Set to true if you want to disable CSP on Android where it can be buggy.
    disableAndroid: false,
 
    // Set to false if you want to completely disable any user-agent sniffing.
    // This may make the headers less compatible but it will be much faster.
    // This defaults to `true`.
    browserSniff: true
};

// dnsPrefetchControl config
const dnsPrefetchControlConfig = {
    allow: true,
};

// todo dontSniffMimetype

// expectCt config
const expectCtConfig = {
    enforce: true,
    maxAge: 30,
    reportUri: 'https://example.com/report'
};

// featurePolicy config
const featurePolicyConfig = {
    features: {
        fullscreen: ["'self'"],
        vibrate: ["'none'"],
        payment: ['example.com'],
        syncXhr: ["'none'"]
    }
};

// frameguard config
const frameguardConfig = {
    action: 'allow-from',
    domain: 'https://example.com'
};

// hidePoweredBy config
const hidePoweredByConfig = {
    setTo: 'PHP 4.2.0',
};

// hsts config
const hstsConfig = {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
};

// todo ieNoOpen

// referrerPolicy config
const referrerPolicyConfig = {
    policy: 'same-origin',
};

// xssProtection config
const xssProtectionConfig = {
    setOnOldIE: true,
    reportUri: '/report-xss-violation',
    mode: null,
};

// Adding configuration to snelm
export const snelm = new Snelm("oak", { 
    crossDomain: crossDomainConfig,
    csp: cspConfig,
    dnsPrefetchControl: dnsPrefetchControlConfig,
    expectCt: expectCtConfig,
    featurePolicy: featurePolicyConfig,
    frameguard: frameguardConfig,
    hidePoweredBy: hidePoweredByConfig,
    hsts: hstsConfig,
    referrerPolicy: referrerPolicyConfig,
    xssProtection: xssProtectionConfig,
});