const express = require('express');
const router = express.Router();
const UsersModel = require('../models/UsersModel');
const TrainerModel = require('../models/TrainerModel');
const verifyToken = require('../libs/verifyToken');
const moment = require("moment");

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
  try {
    let result = await UsersModel.findOne({ _id: req.params.id }).exec();
  
    let checklist=[]
    result.checklist.map((item) => {
      let date = moment(item.date).format('YYYY-MM-DD');
      let selectDate = moment(req.query.date).format('YYYY-MM-DD');
      // console.log(date);

      if(date === selectDate){
        checklist.push(item)
      }
  
    })

    let data = {
      checklist
    }

    // console.log(checklist);
    if(checklist){
      return res.json({ checklist: data.checklist , success: true});
    } else{
      return res.json({ checklist: data.checklist , success: false })
    }
  

  } catch (err) {
    console.log(err)
    return res.status(500).json({error: true, message: err.message})
  }
});

// 회원 관리일지 출력
router.get('/bodylog/user/:id',verifyToken, async (req, res, next) => {
  try {
    let result = await UsersModel.findOne({ _id: req.params.id }).exec();
  
    let bodyLog=[]
    result.bodyLog.map((item) => {
      let date = moment(item.date).format('YYYY-MM-DD');
      let selectDate = moment(req.body.date).format('YYYY-MM-DD');

      if(date === selectDate){
        bodyLog.push(item)
      }else {
        res.status(200).json({ success: false })
      }
  
    })

    let data = {
      bodyLog
    }
  
    res.status(200).json({ bodyLog: data.bodyLog , success: true});

  } catch (err) {
    console.log(err)
    return res.status(500).json({error: true, message: err.message})
  }
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

//몸무게 몽고 디비에 저장하는 서버 
router.post('/diary/weight/:id', verifyToken, async (req, res) => {
  const pictureNumber = req.body.pictureNumber;
  require('moment-timezone');
  moment.tz.setDefault("Asia/Seoul");
  const startDate = moment(req.body.date, ' YYY-MM-DD');
  const endDate = moment(startDate, "YYYY-MM-DD").add(1, 'days');
  const filter = {_id: req.userId, "bodyLog.date": {"$gte": startDate, "$lt": endDate}};
  try {
    const result = await UserModel.findOne(filter);
    if(!result){
      if (pictureNumeber === '0') await UserModel.findOneAndUpdate({_id: req.userId}, {$push:{"bodyLog": {"morningWeight": Number, "date" : startDate}}});
      else (pictureNumber === '1') {
        await UserModel.findOneAndUpdate({_id: req.userId}, {$push: {"bodyLog": {"nightWeight": Number, "date": startDate}}});
      }
    }
    else{
      if(pictureNumber === '0') await UserModel.findOneAndUpdate({_id: req.userId, "bodyLog.date" : {"$gte": startDate, "$lt": endDate}}, {$push: {"bodyLog.$[].morningWeight": Number}});
    }
  }
})

module.exports = router