const express = require('express')
const cookieParser = require('cookie-parser')
const { json } = require('body-parser')
const path = require('path')
const cors = require('cors')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const SpotifyWebApi = require('spotify-web-api-node')

const serverPort = require('../../localdata/local_ports').SERVER_PORT || 8888
const clientPort = require('../../localdata/local_ports').CLIENT_PORT || 3000
const client_id = process.env.CLIENT_ID
const client_secret = process.env.CLIENT_SECRET
const redirect_uri = `http://localhost:${serverPort}/callback`

// credentials are optional
const credentials = {
  clientId: client_id,
  clientSecret: client_secret,
  redirectUri: redirect_uri
}

const state = 'temporary-state'
const scopes = ['user-library-read', 'user-read-private', 'user-read-email']

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
const spotifyApi = new SpotifyWebApi(credentials)

//if token has been obtained previously, this is how it can beset
spotifyApi.setAccessToken(null)
// Create the authorization URL
var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state, true)
let tokenExpiration = 0
const app = express()

const resetAuthorization = () => {
  spotifyApi.resetAccessToken()
  spotifyApi.resetRefreshToken()
}

app
  .use(cors())
  .use(cookieParser())
  .use(json())

app.get('/callback', (req, res) => {
  spotifyApi
    .authorizationCodeGrant(req.query.code)
    .then(data => {
      spotifyApi.setAccessToken(data.body['access_token'])
      spotifyApi.setRefreshToken(data.body['refresh_token'])
      tokenExpiration = data.body['expires_in']
    })
    .catch(err => {
      console.log('Something went wrong authenticating!', err)
    })
  res.redirect(302, `http://localhost:${clientPort}/`)
})

app.get('/auth', (req, res) => {
  console.log('authorization url sent')
  if (tokenExpiration <= 0)
    res.status(200).json({ authorized: false, authLink: authorizeURL })
  else res.status(200).json({ authorized: true, authLink: authorizeURL })
})

app.get('/recent_tracks', (req, res) => {
  spotifyApi
    .getMySavedTracks({
      limit: 50,
      offset: 0
    })
    .then(
      data => {
        console.log('user tracks sent')
        res.status(200).json(data)
      },
      function(err) {
        console.log('Something went wrong getting tracks!', err)
      }
    )
})

app.get('/reset', (req, res) => {
  console.log('reset')
  resetAuthorization()
  res.status(200).json({ authorized: false, authLink: authorizeURL })
})

const start = async () => {
  app.listen(serverPort, () => {
    console.log(`Listening on http://localhost:${serverPort}`)
  })
}

exports.start = start
