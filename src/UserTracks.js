class UserTracks {
  constructor() {
    this.userData = []
    this.maxUsers = 10
    this.numberUsers = 0
    this.currentUser = null
  }

  getNumberUsers() {
    return this.numberUsers
  }

  getUserData() {
    return this.userData
  }

  getUserIds() {
    return this.userData.map(user => user.id)
  }

  getUser(id) {
    for (const user of this.userData) {
      if (user.id === id) return user
    }
    return null
  }

  getCurrentUser() {
    return this.currentUser
  }

  setCurrentUser(id) {
    this.currentUser = this.getUser(id)
  }

  isIn(id) {
    return this.userData.some(user => user.id === id)
  }

  generateIntersection(id2, id1 = this.currentUser.id) {
    const matchingUsers = this.userData.filter(
      user => user.id === id1 || user.id === id2
    )
    if (matchingUsers.length < 2) {
      console.log('not enough matching users')
      return
    }

    const [user1Tracks, user2Tracks] = matchingUsers.map(user => user.tracks)

    const instersection = user1Tracks.filter(track1 =>
      user2Tracks.some(track2 => track1.track.id === track2.track.id)
    )

    return instersection
  }

  addUser(user) {
    if (!user) {
      console.log('invalid user entered')
      return
    }

    if (this.userData.some(userIn => userIn.id === user.id)) return

    this.currentUser = user
    this.userData.push(user)
    this.numberUsers++

    if (this.numberUsers > this.maxUsers) {
      this.userData.shift()
      this.numberUsers--
    }
    console.log('user added')
  }
}

module.exports = UserTracks
