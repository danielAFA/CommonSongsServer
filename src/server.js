const QueryString = require('querystring')
const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const { json, urlencoded } = require('body-parser')
const { connect } = require('./db/db')
const apiMethods = require('./utils/apiMethods')
const dbMethods = require('./utils/dbMethods')
const tracksRouter = require('./db/tracks/router')

require('dotenv').config()

const serverPort = process.env.SERVER_PORT || 80
const clientPort = process.env.CLIENT_PORT || 3000

const app = express()

app
  .use(cors())
  .use(cookieParser())
  .use(json({ limit: '50mb', extended: true }))
  .use(urlencoded({ parameterLimit: 100000, limit: '50mb', extended: true }))

const getUserTracks = async accessT => {
  try {
    const id = await apiMethods.requestUserId(accessT)
    const { data: userTracks } = await dbMethods.getUser(id)

    return userTracks
      ? userTracks
      : { id, tracks: await apiMethods.requestUserTracks(accessT) }
  } catch (err) {
    console.log(`something went wrong getting user tracks`, err)
  }
}

const generateIntersection = ({ user1Tracks, user2Tracks }) => {
  try {
    const intersection = user1Tracks.filter(track1 =>
      user2Tracks.some(track2 => track1.track.id === track2.track.id)
    )
    return intersection
  } catch (err) {
    console.log(`something went wrong generating intersection`, err)
  }
}

app.use('/tracks', tracksRouter)

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
    console.log('user authorized')
    res.redirect(302, `http://localhost:${clientPort}/?${query}`)
  } catch (err) {
    console.log('Something went wrong authenticating!', err)
  }
})

app.get('/users', async (req, res) => {
  try {
    const userIds = await dbMethods.getUserIds()
    res.status(200).json({ userIds })
  } catch (err) {
    console.log('Something went wrong getting user tracks ', err)
  }
})

app.get('/my_tracks', async (req, res) => {
  try {
    const { accessT } = req.params
    const { userData } = await getUserTracks(accessT)
    const userIds = await dbMethods.getUserIds()

    const availableUsers = userIds.filter(id => id !== userData.userId)

    res.status(200).json({ userData, availableUsers })
  } catch (err) {
    console.log('Something went wrong getting user tracks ', err)
  }
})

app.get('/user_tracks', async (req, res) => {
  try {
    const { accessT } = req.params
    const { userData } = await getUserTracks(accessT)
    const userIds = await dbMethods.getUserIds()

    const availableUsers = userIds.filter(id => id !== userData.userId)

    res.status(200).json({ userData, availableUsers })
  } catch (err) {
    console.log('Something went wrong getting user tracks ', err)
  }
})

app.get('/intersection', async (req, res) => {
  const { userId1, userId2 } = req.query
  const userTracks = await dbMethods.getManyUsers([userId1, userId2])
  const intersection = generateIntersection(userTracks)
  res.status(200).json({ intersection })
})

const start = async () => {
  try {
    connect()
    app.listen(serverPort, () => {
      console.log(`Listening on http://localhost:${serverPort}`)
    })
  } catch (err) {
    console.error(err)
  }
}

exports.start = start
