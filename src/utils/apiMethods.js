const SpotifyWebApi = require('spotify-web-api-node')
require('dotenv').config()

const serverPort = process.env.SERVER_PORT || 80

const state = 'temporary-state'
const scopes = ['user-library-read', 'user-read-private', 'user-read-email']
const redirect_uri = `http://localhost:${serverPort}/callback`

const credentials = {
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  redirectUri: redirect_uri
}

const requestTokens = async code => {
  const spotifyApi = new SpotifyWebApi(credentials)
  const { body } = await spotifyApi.authorizationCodeGrant(code)
  return {
    accessT: body['access_token'],
    refreshT: body['refresh_token'],
    expiresIn: body['expires_in']
  }
}

const generateAuthUrl = () => {
  const spotifyApi = new SpotifyWebApi(credentials)
  return spotifyApi.createAuthorizeURL(scopes, state, true)
}

const requestUserTracks = async accessT => {
  const filterFields = trackList => {
    const filterAlbum = album =>
      (({ type, name, images }) => ({
        name,
        type,
        images
      }))(album)

    const filterArtist = artist =>
      (({ name, type }) => ({
        name,
        type
      }))(artist)

    const filterTrack = track =>
      (({ album, name, artists, id, uri }) => ({
        album: filterAlbum(album),
        name,
        artists: artists.map(artist => filterArtist(artist)),
        id,
        uri
      }))(track)

    return trackList.map(elem => filterTrack(elem.track))
  }
  const spotifyApi = new SpotifyWebApi(credentials)
  spotifyApi.setAccessToken(accessT)

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

  return filterFields(tracks)
}

const requestUserId = async accessT => {
  try {
    const spotifyApi = new SpotifyWebApi(credentials)
    spotifyApi.setAccessToken(accessT)

    const {
      body: { id }
    } = await spotifyApi.getMe()
    return id
  } catch (err) {
    console.log(`something went wrong getting user id from Spotify`, err)
  }
}

const spotifyMethods = {
  requestTokens,
  requestUserId,
  requestUserTracks,
  generateAuthUrl
}

module.exports = spotifyMethods
