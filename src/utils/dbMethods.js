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
    } = await axios.get(`http://localhost:${serverPort}/tracks/user_count`)
    return userCount
  } catch (err) {
    console.log(`something went wrong getting user count`, err)
  }
}

const getUser = async id => {
  try {
    const {
      data: { data: userTracks }
    } = await axios.get(`http://localhost:${serverPort}/tracks/`, {
      params: id
    })
    return userTracks
  } catch (err) {
    console.log(`something went wrong getting user`, err)
  }
}

const getManyUsers = async userIds => {
  try {
    const {
      data: { data: userTracks }
    } = await axios.get(`http://localhost:${serverPort}/tracks/users`, {
      params: { id1: userIds[0], id2: userIds[1] }
    })
    return userTracks
  } catch (err) {
    console.log(`something went wrong getting users`, err)
  }
}
const storeUser = async user => {
  try {
    await axios.post(`http://localhost:${serverPort}/tracks/store_user`, user)
  } catch (err) {
    console.log(`something went wrong storing user`, err)
  }
}

const removeUser = async userId => {
  try {
    await axios.delete(`http://localhost:${serverPort}/tracks/user`, {
      params: { userId }
    })
  } catch (err) {
    console.log(`something went wrong removing user`, err)
  }
}

const dbMethods = {
  getUser,
  getManyUsers,
  storeUser,
  getUserCount,
  getUserIds,
  removeUser
}

module.exports = dbMethods
