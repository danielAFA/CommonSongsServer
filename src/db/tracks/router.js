const { Router } = require('express')
const controllers = require('./controllers')

const router = Router()

// /tracks/
router.route('/store_user').post(controllers.findOrCreate)

// /tracks/count
router.route('/user_count').get(controllers.getCount)

// /tracks/ids
router.route('/ids').get(controllers.getAllIds)

// /tracks/:id
router
  .route('/user')
  .get(controllers.getOne)
  .delete(controllers.removeOne)

// /tracks/:id1/id2
router.route('/users').get(controllers.getMany)

module.exports = router
