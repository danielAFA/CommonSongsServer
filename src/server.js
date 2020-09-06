const express = require('express')
const cookieParser = require('cookie-parser')
const { json } = require('body-parser')
const path = require('path')
const cors = require('cors')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
const SpotifyWebApi = require('spotify-web-api-node')
const UserTracks = require('./UserTracks')

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
const spotifyApi = new SpotifyWebApi(credentials)
const userTracks = new UserTracks()
const approveOnEach = true

let authorizeURL = spotifyApi.createAuthorizeURL(scopes, state, approveOnEach)
let tokenExpiration = 0

spotifyApi.setAccessToken(null)

const app = express()
app
  .use(cors())
  .use(cookieParser())
  .use(json())

const getUserTracks = async () => {
  let totalTracks
  let likedTracks = []
  let limit = 50
  let offset = 0
  let user = {}
  let userId

  try {
    if (!userId) {
      const { body } = await spotifyApi.getMe()
      userId = body.id
    }
  } catch (err) {
    console.log('Something went wrong getting user!', err)
  }

  do {
    try {
      const { body } = await spotifyApi.getMySavedTracks({
        limit: limit,
        offset: offset
      })
      if (!totalTracks) totalTracks = body.total
      likedTracks = likedTracks.concat(body.items)
      offset += limit
    } catch (err) {
      console.log('Something went wrong getting tracks!', err)
    }
  } while (offset < totalTracks)

  user[userId] = likedTracks
  userTracks.setUser(user)
  console.log('all set for ')
  console.log(Object.keys(userTracks.getUserData()))

  return likedTracks
}

const resetAuthorization = () => {
  spotifyApi.resetAccessToken()
  spotifyApi.resetRefreshToken()
  tokenExpiration = 0
}

app.get('/callback', (req, res) => {
  spotifyApi
    .authorizationCodeGrant(req.query.code)
    .then(data => {
      spotifyApi.setAccessToken(data.body['access_token'])
      spotifyApi.setRefreshToken(data.body['refresh_token'])
      tokenExpiration = data.body['expires_in']
      console.log('user authorized')
    })
    .catch(err => {
      console.log('Something went wrong authenticating!', err)
    })
  res.redirect(302, `http://localhost:${clientPort}/`)
})

app.get('/auth', (req, res) => {
  if (tokenExpiration <= 0) {
    console.log('authorization url sent')
    res.status(200).json({ authorized: false, authLink: authorizeURL })
  } else res.status(200).json({ authorized: true, authLink: authorizeURL })
})

app.get('/all_tracks', async (req, res) => {
  const tracks = await getUserTracks()
  const intersectionReady = userTracks.getCurrentUsers() === 2 ? true : false
  res.status(200).json({ tracks, intersectionReady })
})

app.get('/intersection', (req, res) => {
  res.status(200).json(userTracks.getIntersection())
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
