require('dotenv').config()
const path = require('path')
const routes = require('./src/routes')
const lti = require('ltijs').Provider

// Build MongoDB connection URL with auth
const dbUrl = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:27017/${process.env.DB_NAME}?authSource=admin`

// Setup LTI provider
lti.setup(process.env.LTI_KEY, 
  {
    url: dbUrl,
    connection: { user: process.env.DB_USER, pass: process.env.DB_PASS }
  }, 
  {
    staticPath: path.join(__dirname, './public'),
    cookies: {
      secure: false,      // Change to true if using https in production
      sameSite: ''        // Set to 'None' with secure=true if cross-domain + https
    },
    devMode: true,
    dynRegRoute: '/register',
    dynReg: {
      url: 'http://lti.csbasics.in',    // Your LTI Tool URL (domain must match Traefik)
      name: 'CSBasics LTI Tool',
      logo: 'http://lti.csbasics.in/assets/logo.svg', // Update your logo URL
      description: 'CSBasics LTI Tool Provider',
      redirectUris: ['http://lti.csbasics.in/launch'],
      customParameters: { exampleParam: 'exampleValue' },
      autoActivate: false
    }
  }
)

// Successful LTI launch - serve your main app page
lti.onConnect(async (token, req, res) => {
  return res.sendFile(path.join(__dirname, './public/index.html'))
})

// Deep Linking route
lti.onDeepLinking(async (token, req, res) => {
  return lti.redirect(res, '/deeplink', { newResource: true })
})

// Use your custom routes
lti.app.use(routes)

// Deploy server on configured port
const setup = async () => {
  await lti.deploy({ port: process.env.PORT || 3000 })
}

setup()
