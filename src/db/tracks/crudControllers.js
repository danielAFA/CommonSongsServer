const { find } = require('./model')

const getOne = model => async (req, res) => {
  try {
    const doc = await model
      .findOne({ userId: req.params.userId })
      .lean()
      .exec()

    if (!doc) {
      return res.status(400).end()
    }

    res.status(200).json({ data: doc })
  } catch (e) {
    console.error(e)
    res.status(400).end()
  }
}

const getMany = model => async (req, res) => {
  try {
    const ids = Object.keys(req.params).map(key => req.params[key])
    const doc = await model
      .find({
        userId: { $in: ids }
      })
      .lean()
      .exec()

    if (!doc) {
      return res.status(400).end()
    }

    res.status(200).json({ data: doc })
  } catch (e) {
    console.error(e)
    res.status(400).end()
  }
}

const getAllIds = model => async (req, res) => {
  try {
    const doc = await model
      .find({})
      .select('userId -_id')
      .lean()
      .exec()

    if (!doc) {
      return res.status(400).end()
    }

    res.status(200).json({ data: doc })
  } catch (e) {
    console.error(e)
    res.status(400).end()
  }
}

const findOrCreate = model => async (req, res) => {
  try {
    const updatedDoc = await model
      .findOneAndUpdate(
        {
          userId: req.body.userId
        },
        { ...req.body },
        { new: true }
      )
      .lean()
      .exec()

    if (!updatedDoc) {
      const doc = await model.create({ ...req.body })
      res.status(201).json({ data: doc })
    } else {
      res.status(201).json({ data: updatedDoc })
    }
  } catch (e) {
    console.error(e)
    res.status(400).end()
  }
}

const updateOne = model => async (req, res) => {
  try {
    const updatedDoc = await model
      .findOneAndUpdate(
        {
          createdBy: req.user._id,
          _id: req.params.id
        },
        req.body,
        { new: true }
      )
      .lean()
      .exec()

    if (!updatedDoc) {
      return res.status(400).end()
    }

    res.status(200).json({ data: updatedDoc })
  } catch (e) {
    console.error(e)
    res.status(400).end()
  }
}

const removeOne = model => async (req, res) => {
  try {
    const removed = await model.findOneAndRemove({
      createdBy: req.user._id,
      _id: req.params.id
    })

    if (!removed) {
      return res.status(400).end()
    }

    return res.status(200).json({ data: removed })
  } catch (e) {
    console.error(e)
    res.status(400).end()
  }
}

const getCount = model => async (req, res) => {
  try {
    const doc = await model.countDocuments('usertracks')

    if (!doc) {
      return res.status(400).end()
    }

    res.status(200).json({ data: doc })
  } catch (e) {
    console.error(e)
    res.status(400).end()
  }
}

const crudControllers = model => ({
  removeOne: removeOne(model),
  updateOne: updateOne(model),
  getOne: getOne(model),
  getAllIds: getAllIds(model),
  findOrCreate: findOrCreate(model),
  getCount: getCount(model),
  getMany: getMany(model)
})

exports.crudControllers = crudControllers
