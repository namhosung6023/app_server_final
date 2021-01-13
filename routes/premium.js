const express = require('express');
const router = express.Router();
const UsersModel = require('../models/UsersModel');
const TrainerModel = require('../models/TrainerModel');
const verifyToken = require('../libs/verifyToken');

// 트레이너가 회원의 체크리스트 추가
router.put('/checklist/trainer/:id', verifyToken, async (req, res, next) => {
  let data = {
    trainerComment: req.body.trainerComment,
    workoutlist: req.body.workoutlist,
    date: Date.now()
  };
  console.log(req.body);
  // console.log("req.body.workoutlist",req.body.workoutlist);
  try {
    // console.log(data)
    await UsersModel.update(
      { _id: req.params.id },
      { $push: { checklist: { $each: [data] } } }
    ).exec();
    return res.status(200).json({ status: 200, message: "success" })
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: true, message: err })
  }
});

// 회원 체크리스트 출력
router.get('/checklist/user/:id',verifyToken, async (req, res, next) => {
  let result = await UsersModel.findOne({ _id: req.params.id }).exec();
  let data = {
    checklist: result.checklist
  };
  res.status(200).json({checklist: data.checklist, success: true});
});

//체크박스 서버 
router.put('/checklist/user/checkbox/:id', verifyToken, async (req, res, next) =>{
  console.log(req.body);
  await UsersModel.findOneAndUpdate(
    {  _id: req.params.id },
    { $set: { "checklist.$[outer].workoutlist.$[inner]": {
      "name": req.body.name,
      "contents": req.body.contents,
      "isEditable": req.body.isChecked
    }}},
    { "arrayFilters": [
      {"outer._id": req.body.checklistId},
      {"inner.name": req.body.name}
    ]}
  );
})

router.post('/comment/user/:id', verifyToken, async (req, res, next) =>{
  console.log(req.body);
  await UsersModel.update(
    { _id: req.params.id },
    {$push: {"checklist.$[index].userComment": req.body.userComment}},
    {"arrayFilters": [{
      "index._id": req.body.checklistId
    }]}
  )
})

module.exports = router