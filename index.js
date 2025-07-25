require('dotenv').config();
const path = require('path');
const routes = require('./src/routes'); // your custom routes if any

const lti = require('ltijs').Provider;

// Setup LTI provider
lti.setup(
  process.env.LTI_KEY,
  {
    url: `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}/${process.env.DB_NAME}?authSource=admin`
  },
  {
    staticPath: path.join(__dirname, './public'),
    cookies: {
      secure: false,   // true if using HTTPS and cross-domain
      sameSite: ''     // 'None' if cross-domain and HTTPS
    },
    devMode: true,      // true for testing without HTTPS or cross-domain
    dynRegRoute: '/register',
    dynReg: {
      url: 'https://lti.csbasics.in',           // Your tool provider domain
      name: 'My LTI Tool',
      logo: 'https://lti.csbasics.in/assets/logo.svg',
      description: 'An LTI tool for testing',
      redirectUris: ['https://lti.csbasics.in/launch'],
      customParameters: { exampleKey: 'exampleValue' },
      autoActivate: false
    }
  }
);

// On successful LTI launch redirect to index.html
lti.onConnect(async (token, req, res) => {
  return res.sendFile(path.join(__dirname, './public/index.html'));
});

// On deep linking request redirect to deep linking page
lti.onDeepLinking(async (token, req, res) => {
  return lti.redirect(res, '/deeplink', { newResource: true });
});

// Use your custom routes
lti.app.use(routes);

// Start server
const setup = async () => {
  await lti.deploy({ port: process.env.PORT || 3000 });

  // Example of registering a platform manually (optional)
  /*
  await lti.registerPlatform({
    url: 'https://your.moodle.instance',
    name: 'Moodle',
    clientId: 'your-client-id',
    authenticationEndpoint: 'https://your.moodle.instance/mod/lti/auth.php',
    accesstokenEndpoint: 'https://your.moodle.instance/mod/lti/token.php',
    authConfig: { method: 'JWK_SET', key: 'https://your.moodle.instance/mod/lti/certs.php' }
  });
  */
};

setup();
