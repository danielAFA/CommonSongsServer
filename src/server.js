const QueryString = require('querystring')
const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const { json, urlencoded } = require('body-parser')
const connect = require('./db/connect')
const apiMethods = require('./utils/apiMethods')
const dbMethods = require('./utils/dbMethods')
const router = require('./db/tracks/router')

require('dotenv').config()

const serverPort = process.env.SERVER_PORT || 80
const clientPort = process.env.CLIENT_PORT || 3000

const app = express()

app
  .use(cors())
  .use(cookieParser())
  .use(json({ limit: '50mb', extended: true }))
  .use(urlencoded({ parameterLimit: 100000, limit: '50mb', extended: true }))

app.use('/tracks', router)

app.get('/auth', (req, res) => {
  console.log('authorization url requested')
  res.status(200).json({ authUrl: apiMethods.generateAuthUrl() })
})

app.get('/callback', async (req, res) => {
  try {
    const { accessT, refreshT } = await apiMethods.requestTokens(req.query.code)
    const query = QueryString.stringify({
      aT: accessT,
      rT: refreshT
    })
    res.redirect(302, `http://localhost:${clientPort}/?${query}`)
  } catch (err) {
    console.log('Something went wrong authenticating', err)
    res.redirect(302, `http://localhost:${clientPort}/`)
  }
})

app.get('/user_ids', async (req, res) => {
  try {
    const userIds = await dbMethods.getUserIds()
    res.status(200).json({ userIds })
    console.log(`requested all user ids`)
  } catch (err) {
    console.log('Something went wrong getting user tracks ', err)
  }
})

app.get('/user_id', async (req, res) => {
  try {
    const { accessT } = req.query
    const userId = await apiMethods.requestUserId(accessT)
    res.status(200).json({ userId })
  } catch (err) {
    console.log('Something went wrong creating storing tracks ', err)
  }
})

app.get('/store', async (req, res) => {
  try {
    const { accessT } = req.query
    const userId = await apiMethods.requestUserId(accessT)
    const tracks = await apiMethods.requestUserTracks(accessT)
    await dbMethods.storeUser({ userId, tracks })
    res.status(200).json({ userId })
  } catch (err) {
    console.log('Something went wrong storing user tracks ', err)
  }
})

app.get('/intersection', async (req, res) => {
  try {
    const { id1, id2 } = req.query
    const userTracks = (await dbMethods.getManyUsers([id1, id2])).map(
      data => data.tracks
    )
    const intersection = userTracks[0].filter(track1 =>
      userTracks[1].some(track2 => track1.id === track2.id)
    )
    res.status(200).json({ intersection })
  } catch (err) {
    console.log('Something went wrong getting intersection ', err)
  }
})

app.get('/playlist', async (req, res) => {
  try {
    const { spotify: spotifyUrl } = await apiMethods.createPlaylist(req.query)
    res.status(200).json({ spotifyUrl })
  } catch (err) {
    console.log('Something went wrong requesting playlist creation ', err)
  }
})

app.delete('/remove', async (req, res) => {
  try {
    await dbMethods.removeUser(req.query.userId)
    res.status(200).send()
  } catch (err) {
    console.log(`Something went wrong removing user ${req.query.userId}`, err)
  }
})

const start = async () => {
  try {
    app.listen(serverPort, () => {
      connect()
      console.log(`Listening on http://localhost:${serverPort}`)
    })
  } catch (err) {
    console.error(err)
  }
}

exports.start = start
