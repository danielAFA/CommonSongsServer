const { Router } = require('express')
const controllers = require('./controllers')

const router = Router()

// /tracks/
router
  .route('/')
  .get(controllers.getOne)
  .post(controllers.findOrCreate)

// /tracks/count
router.route('/count').get(controllers.getCount)

// /tracks/ids
router.route('/ids').get(controllers.getAllIds)

// /tracks/:id
router
  .route('/:id')
  .get(controllers.getOne)
  .put(controllers.updateOne)
  .delete(controllers.removeOne)
// /tracks/:id1/id2
router.route('/:id1/id2').get(controllers.getMany)

module.exports = router
