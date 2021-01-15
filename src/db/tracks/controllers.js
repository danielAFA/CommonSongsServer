const { crudControllers } = require('./crudControllers')
const Tracks = require('./model')

module.exports = crudControllers(Tracks)
