const express = require('express')
const cookieParser = require('cookie-parser')
const { json } = require('body-parser')
const path = require('path')
const cors = require('cors')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const SpotifyWebApi = require('spotify-web-api-node')

const serverPort = 8888
const clientPort = 3000
const client_id = process.env.CLIENT_ID
const client_secret = process.env.CLIENT_SECRET
const redirect_uri = `http://localhost:${serverPort}/callback`

// credentials are optional
var credentials = {
  clientId: client_id,
  clientSecret: client_secret,
  redirectUri: redirect_uri
}

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
const spotifyApi = new SpotifyWebApi(credentials)

//if token has been obtained previously, this is how it can beset
spotifyApi.setAccessToken(null)

const state = 'temporary-state'
const scopes = ['user-library-read', 'user-read-private', 'user-read-email']
const app = express()

app
  .use(cors())
  .use(cookieParser())
  .use(json())

// Create the authorization URL
var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state)

app.get('/', (req, res) => {
  if (spotifyApi.getAccessToken()) {
    console.log('current token: ' + spotifyApi.getAccessToken())
    spotifyApi
      .getMySavedTracks({
        limit: 50,
        offset: 0
      })
      .then(
        data => {
          res.status(200).json(data)
        },
        function(err) {
          console.log('Something went wrong getting tracks!', err)
        }
      )
  } else {
    console.log('sent authorization url')
    res.status(200).json({ authLink: authorizeURL })
  }
})

app.get('/callback', (req, res) => {
  console.log('callback:')
  const code = req.query.code
  spotifyApi
    .authorizationCodeGrant(code)
    .then(data => {
      // Set the access token on the API object to use it in later calls
      spotifyApi.setAccessToken(data.body['access_token'])
      spotifyApi.setRefreshToken(data.body['refresh_token'])
    })
    .catch(err => {
      console.log('Something went wrong authenticating!', err)
    })

  res.redirect(302, `http://localhost:${clientPort}`)
})

export const start = async () => {
  app.listen(serverPort, () => {
    console.log(`Listening on http://localhost:${serverPort}`)
  })
}
