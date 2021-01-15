const QueryString = require('querystring')
const axios = require('axios')
require('dotenv').config()

const serverPort = process.env.SERVER_PORT || 80

const getUserIds = async () => {
  try {
    let {
      data: { data: userIds }
    } = await axios.get(`http://localhost:${serverPort}/tracks/ids`)

    return userIds.map(option => option.userId)
  } catch (err) {
    console.log(`something went wrong getting user ids`, err)
  }
}

const getUserCount = async () => {
  try {
    const {
      data: { data: userCount }
    } = await axios.get(`http://localhost:${serverPort}/tracks/count`)
    return userCount
  } catch (err) {
    console.log(`something went wrong getting user count`, err)
  }
}

const createUser = async user => {
  try {
    await axios.post(`http://localhost:${serverPort}/tracks/`, {
      ...user
    })
  } catch (err) {
    console.log(`something went wrong storing user`, err)
  }
}

const getUser = async id => {
  try {
    const queryId = QueryString.stringify({ id: id })
    const {
      data: { data: userTracks }
    } = await axios.get(`http://localhost:${serverPort}/tracks/${queryId}`)
    return userTracks
  } catch (err) {
    console.log(`something went wrong getting user count`, err)
  }
}

const getManyUsers = async userIds => {
  try {
    const queryIds = QueryString.stringify({ id1: userIds[0], id2: userIds[1] })
    const {
      data: { data: userTracks }
    } = await axios.get(`http://localhost:${serverPort}/tracks/${queryIds}`)
    return userTracks
  } catch (err) {
    console.log(`something went wrong getting users`, err)
  }
}

const dbMethods = {
  getUser,
  getManyUsers,
  createUser,
  getUserCount,
  getUserIds
}

module.exports = dbMethods
