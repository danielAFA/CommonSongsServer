const mongoose = require('mongoose')
require('dotenv').config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.2odux.azure.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
module.exports = () =>
  mongoose.connect(uri, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false
  })
