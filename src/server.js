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

const credentials = {
  clientId: client_id,
  clientSecret: client_secret,
  redirectUri: redirect_uri
}

const state = 'temporary-state'
const scopes = ['user-library-read', 'user-read-private', 'user-read-email']
const spotifyApi = new SpotifyWebApi(credentials)
const userTracks = new UserTracks()

const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state, true)
let tokenExpiration = 0

spotifyApi.setAccessToken(null)

const app = express()
app
  .use(cors())
  .use(cookieParser())
  .use(json())

const getUserTracks = async () => {
  const {
    body: { id }
  } = await spotifyApi.getMe()

  //if user data has been logged, return saved tracks
  if (userTracks.isIn(id)) {
    return userTracks.getUser(id).tracks
  }

  //else, request and log id and tracks
  const tracks = []
  const tracksPerRequest = 50
  let totalTracks
  let offset = 0

  do {
    const {
      body: { items, total }
    } = await spotifyApi.getMySavedTracks({
      limit: tracksPerRequest,
      offset: offset
    })
    tracks.push(...items)
    offset += tracksPerRequest
    totalTracks = total
  } while (offset < totalTracks)

  userTracks.addUser({ id, tracks })

  console.log('current users: ' + userTracks.getUserIds().join(', '))

  return tracks
}

const resetAuthorization = () => {
  spotifyApi.resetAccessToken()
  spotifyApi.resetRefreshToken()
  tokenExpiration = 0
}

app.get('/callback', async (req, res) => {
  try {
    const data = await spotifyApi.authorizationCodeGrant(req.query.code)
    spotifyApi.setAccessToken(data.body['access_token'])
    spotifyApi.setRefreshToken(data.body['refresh_token'])
    tokenExpiration = data.body['expires_in']
    console.log('user authorized')
  } catch (err) {
    console.log('Something went wrong authenticating!', err)
  }

  res.redirect(302, `http://localhost:${clientPort}/`)
})

app.get('/auth', (req, res) => {
  if (tokenExpiration <= 0) {
    console.log('authorization url sent')
    res.status(200).json({ authorized: false, authLink: authorizeURL })
  } else res.status(200).json({ authorized: true, authLink: authorizeURL })
})

app.get('/user_tracks', async (req, res) => {
  try {
    const tracks = await getUserTracks()
    const intersectionReady = userTracks.getNumberUsers() >= 2 ? true : false
    const filteredIds = userTracks
      .getUserIds()
      .filter(id => userTracks.getCurrentUser().id !== id)
    res.status(200).json({ tracks, intersectionReady, filteredIds })
  } catch (err) {
    console.log('Something went wrong getting user tracks ', err)
  }
})

app.get('/intersection', (req, res) => {
  const { userId } = req.query
  const intersection = userTracks.generateIntersection(userId)
  res.status(200).json(intersection)
})

app.get('/reset', (req, res) => {
  console.log('tokens reseted')
  resetAuthorization()
  res.status(200).json({ authorized: false, authLink: authorizeURL })
})

const start = async () => {
  app.listen(serverPort, () => {
    console.log(`Listening on http://localhost:${serverPort}`)
  })
}

exports.start = start
