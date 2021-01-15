const mongoose = require('mongoose')

const userTracksSchema = new mongoose.Schema({
  userId: { type: String },
  tracks: { type: [] },
  date: { type: Date, default: Date.now }
})

const Tracks = mongoose.model('userTracks', userTracksSchema)
module.exports = Tracks
