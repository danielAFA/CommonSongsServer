class UserTracks {
  constructor() {
    this.userData = []
    this.maxUsers = 2
    this.currentUsers = 0
    this.intersection = null
  }

  getCurrentUsers() {
    return this.currentUsers
  }

  getUserData() {
    let users = {}
    for (const elem of this.userData) {
      users = { ...users, ...elem }
    }
    return users
  }

  getIntersection() {
    if (this.currentUsers !== 2) return null
    return this.intersection
  }

  createIntersection() {
    if (this.currentUsers < 2) {
      return
    }

    const [user1Tracks, user2Tracks] = this.userData.map(
      (el, i) => this.userData[i][Object.keys(el)[0]]
    )

    const instersection = user1Tracks.filter(x =>
      user2Tracks.some(y => x.track.id === y.track.id)
    )

    this.intersection = instersection
  }

  setUser(user) {
    if (!user) {
      console.log('invalid user entered')
      return
    }

    this.userData.push(user)
    if (this.currentUsers >= this.maxUsers) {
      this.userData.shift()
    } else if (this.currentUsers < this.maxUsers) this.currentUsers++
    this.createIntersection()
  }
}

module.exports = UserTracks
