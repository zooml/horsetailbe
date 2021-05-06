const express = require('express');
const router = express.Router();
const Account = require('../models/Account')
const modelRoute = require('../controllers/model_route')
const {CastError} = require('../controllers/errors');

const toModel = o => {
  const model = {
    userId: 'joe', // TODO
    name: o.name,
    num: o.num,
    categoryId: o.categoryId,
    isCredit: o.isCredit
  };
  if (o.desc) model.desc = o.desc.trim();
  if (o.parentId) model.parentId = o.parentId.trim();
  return new Account(model); // TODO does this validate???? yes e.g. required
};

const fromModel = model => ({
  id: model._id,
  userId: 'joe', // TODO
  name: model.name,
  num: model.num,
  desc: model.desc,
  parentId: model.parentId,
  categoryId: model.categoryId,
  isCredit: model.isCredit,
  balance: model.balance,
  createdAt: model.createdAt,
  v: model.__v
});

router.get('/', modelRoute(async (req, res) => {
  // TODO page limit
  const res_models = await Account.find();
  res.send(res_models.map(fromModel));
}));

router.post('/', modelRoute(async (req, res) => {
  const req_model = toModel(req.body);
  // TODO if parentId validate exists and no documents
  const res_model =  await req_model.save();
  // TODO update parent: delete balance
  res.send(fromModel(res_model));
}));

router.patch('/:account_id', function(req, res) {
  res.send({id: req.params.account_id, name: 'Cash'});
});

module.exports = router;
