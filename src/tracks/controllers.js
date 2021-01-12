const { crudControllers } = require('../db/crudControllers')
const Tracks = require('./model')

module.exports = crudControllers(Tracks)
