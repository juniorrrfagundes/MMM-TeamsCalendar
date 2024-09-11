const express = require('express');
const msal = require('@azure/msal-node');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

// Function to generate the PKCE code_verifier
function generateCodeVerifier() {
    return crypto.randomBytes(32).toString('base64url'); // 43-128 characters
}

// Function to generate the PKCE code_challenge based on the code_verifier
function generateCodeChallenge(codeVerifier) {
    return crypto.createHash('sha256').update(codeVerifier).digest('base64url');
}

// Global variables for PKCE
let codeVerifier = generateCodeVerifier();
let codeChallenge = generateCodeChallenge(codeVerifier);

// MSAL configuration - MAGIC MIRROR APP
const msalConfig = {
    auth: {
        clientId: '', // Replace with your registered application's ID
        authority: 'https://login.microsoftonline.com/{your_tenant_id}', // Or 'common' for multi-tenant
        // Remove clientSecret for public apps
        clientSecret: '',
    },
    system: {
        loggerOptions: {
            loggerCallback(loglevel, message, containsPii) {
                console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: msal.LogLevel.Verbose,
        },
    },
};

// Use PublicClientApplication instead of ConfidentialClientApplication for public applications
const pca = new msal.ConfidentialClientApplication(msalConfig);

// Redirect URL for authentication
app.get('/auth', (req, res) => {
    const authCodeUrlParameters = {
        scopes: ['Calendars.Read', 'offline_access'], // Permissions
        redirectUri: 'http://localhost:3000/auth/callback',
        codeChallenge: codeChallenge, // Add the PKCE challenge
        codeChallengeMethod: 'S256', // Encoding method
    };

    // Redirect to Microsoft's login page
    pca.getAuthCodeUrl(authCodeUrlParameters)
        .then((response) => {
            res.redirect(response);
        })
        .catch((error) => {
            console.error('Error generating authentication URL:', error);
            res.status(500).send('Error generating authentication URL');
        });
});

// Callback after login
app.get('/auth/callback', (req, res) => {
    const code = req.query.code;

    if (!code) {
        return res.status(400).send('Authorization code not found');
    }

    const tokenRequest = {
        code: code, // Authorization code returned
        scopes: ['Calendars.Read', 'offline_access'], // Permissions
        redirectUri: 'http://localhost:3000/auth/callback',
        codeVerifier: codeVerifier, // Pass the code_verifier corresponding to the code_challenge
    };

    // Exchange the authorization code for an access token
    pca.acquireTokenByCode(tokenRequest)
        .then((response) => {

            // Display the access token
            res.send(`${response.accessToken}`);
            console.log(response);
            console.log('Refresh Token:', response.refreshToken);
        })
        .catch((error) => {
            console.error('Error acquiring access token:', error);
            res.status(500).send('Error acquiring access token');
        });
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
