const express = require('express');
const router = express.Router();
const Account = require('../models/Account')
const modelRoute = require('../controllers/model_route')
const {CastError} = require('../controllers/errors');

const to_model = body => {
  const model = {
    userId: 'joe', // TODO
    name: body.name,
    number: body.number
  };
  if (body.credit === 1 || body.credit === true) model.credit = true;
  else if (body.credit === 0 || body.credit === false) model.credit = false;
  else if (body.credit !== undefined) throw new CastError({path: 'credit', value: body.credit});
  if (body.desc) model.desc = body.desc.trim();
  if (body.parentId) model.parentId = body.parentId.trim();
  return new Account(model); // TODO does this validate???? yes e.g. required
};

const to_body = model => ({
  id: model._id,
  userId: 'joe', // TODO
  name: model.name,
  number: model.number,
  credit: model.credit,
  parentId: model.parentId,
  amount: model.amount,
  desc: model.desc,
  v: model.__v
});

router.get('/', modelRoute(async (req, res) => {
  // TODO page limit
  const res_models = await Account.find();
  res.send(res_models.map(to_body));
}));

router.post('/', modelRoute(async (req, res) => {
  const req_model = to_model(req.body);
  // TODO if parentId validate exists and no documents
  const res_model =  await req_model.save();
  // TODO update parent: delete amount
  res.send(to_body(res_model));
}));

router.patch('/:account_id', function(req, res) {
  res.send({id: req.params.account_id, name: 'Cash'});
});

module.exports = router;
