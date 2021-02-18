const express = require('express');
const router = express.Router();
const UsersModel = require('../models/UsersModel');
const TrainerModel = require('../models/TrainerModel');
const PremiumModel = require('../models/PremiumModel');
const verifyToken = require('../libs/verifyToken');
const moment = require("moment");

// 회원이 프리미엄 신청
router.post('/apply/:id', verifyToken, async (req, res, next) => {
  console.log(req.body);
  let data = {
    user: req.userId,
    trainer: req.params.id,
    createdAt: Date.now()
  };

  try {
    let trainer = await TrainerModel.findOne({ _id: req.params.id }).exec();
    let result = trainer.premiumUser.indexOf(req.userId);
    if (result >= 0) {
      return res
        .status(200)
        .json({ status: 409, message: "이미 수강 신청을 하였습니다." });
    }

    let premium = await new PremiumModel(data);
    await premium.save();
    console.log("premium._id", premium._id);

    let trainerData = {
      user: req.userId,
      premium: premium._id
    }

    await TrainerModel.update(
      { _id: req.params.id },
      { $push: {premiumUser: { $each: [trainerData] } } }
    );
    
    await UsersModel.update(
      { _id: req.userId },
      { $push: { premiumTrainer: req.params.id, premium: premium._id} }
    );

    res.status(200).json({ message: "success", premiumId: premium._id });
  } catch (err) {
    return res.status(500).json({ error: true, message: err.message });
  }
});

/*
 * 트레이너 회원 관리 > 회원 리스트
 * TrainerModel 트레이너 정보 제공
 */
router.get("/userlist/:id", async (req, res) => {
  try {
    // const count = await TrainerModel.find().count();
    // console.log("count", count);
    // console.log("limit", limit);
    // console.log("page", page);
    const trainer = await TrainerModel.findOne({ _id: req.params.id })
      // .populate({ 
      //   path: "premium",
      //   populate: { path: "user", select: "profileImages username age gender"}
      // })

      .populate({ 
        path: "premiumUser",
        populate: { path: "user premium", select: "profileImages username age gender createdAt"}
      })
      .sort({ createdAt: -1 })
      .exec();
    let data = trainer.premiumUser;

    console.log("data > ", data);

    res.status(200).json({ status: 200, data, success: true });
  } catch (err) {
    res.status(500).json({ error: true, message: err });
  }
});

// 트레이너가 회원의 체크리스트 추가
router.post('/checklist/trainer/:id', verifyToken, async (req, res, next) => {
  let data = {
    workoutlist: req.body.workoutlist,
    date: req.body.date
  };
  console.log(req.body);

  selectDate = moment(req.body.date).format("YYYY-MM-DD");
  endDate = moment(req.body.date).add(1, 'days').format("YYYY-MM-DD");

  try {
    let premium = await PremiumModel.findOne({ _id: req.params.id, "checklist.date":  {"$gte": selectDate, "$lt": endDate}}).exec();
    if (premium) {
      console.log("이미 존재함");
      return res.status(500).json({ success: false, message: "이미 존재함" })
    }
    
    await PremiumModel.update(
      { _id: req.params.id },
      { $push: { checklist: { $each: [data] } } }
    ).exec();
    return res.status(200).json({ status: 200, message: "success" })
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: true, message: err })
  }
});

// 트레이너가 회원의 체크리스트 수정(추가, 삭제)
router.put('/checklist/update/:id', verifyToken, async (req, res, next) => {
  let data = {
    workoutlist: req.body.workoutlist,
    date: req.body.date
  };
  console.log(req.body);
  // console.log("req.body.workoutlist",req.body.workoutlist);
  try {
    // console.log(data)
    await PremiumModel.update(
      { _id: req.params.id, "checklist.date": req.body.date },
      { $set: { checklist: data } }
    ).exec();
    return res.status(200).json({ status: 200, message: "success" })
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: true, message: err })
  }
});

//트레이너 코멘트 작성
router.post('/comment/trainer/:id', verifyToken, async (req, res, next) => {
  let data = {
    comment: req.body.comment,
    date: req.body.date
  }

  selectDate = moment(req.body.date).format("YYYY-MM-DD");
  endDate = moment(req.body.date).add(1, 'days').format("YYYY-MM-DD");

  try {
    let premium = await PremiumModel.findOne({ _id: req.params.id, "trainerComment.date":  {"$gte": selectDate, "$lt": endDate}}).exec();
    if (premium) {
      console.log("이미 존재함");
      return res.status(500).json({ success: false, message: "이미 존재함" })
    }

    await PremiumModel.update(
      { _id: req.params.id },
      { $push: { trainerComment: { $each: [data] } } }
    ).exec();
    return res.status(200).json({ status: 200, message: "success" })
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: true, message: err })
  }
})

//트레이너 코멘트 수정(추가, 삭제)
router.put('/comment/update/:id', verifyToken, async (req, res, next) => {
  let data = {
    comment: req.body.comment,
    date: req.body.date
  }

  require('moment-timezone');
  moment.tz.setDefault("Asia/Seoul");
  const selectDate = moment(req.body.date, "YYYY-MM-DD");
  const endDate = moment(selectDate,  "YYYY-MM-DD" ).add(1, 'days');
  console.log(selectDate);
  console.log(endDate);

  try {
    let premium = await PremiumModel.findOne({ _id: req.params.id, "trainerComment.date":  {"$gte": selectDate, "$lt": endDate}}).exec();
    if (!premium) {
      return res.status(500).json({ success: false, message: "존재하지않음" })
    }else {
      // 코멘트 삭제
      if(req.body.comment.length <= 0) {
        await PremiumModel.update(
          { _id: req.params.id },
          { $pull: {trainerComment: { date :{"$gte": selectDate, "$lt": endDate}} } }
        ).exec();
        return res.status(200).json({ status: 200, success: true, message: "delete" })
      }else { // 코멘트 수정
        await PremiumModel.findOneAndUpdate(
          { _id: req.params.id, "trainerComment.date":  {"$gte": selectDate, "$lt": endDate} },
          { $set: { trainerComment: { $each: [data] } } }
        );
        return res.status(200).json({ status: 200, success: true, message: "success" })
      }
      // await PremiumModel.update(
      //   { _id: req.params.id },
      //   { $push: { trainerComment: { $each: [data] } } }
      // ).exec();
      // return res.status(200).json({ status: 200, message: "post" })
    }
  
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: true, message: err })
  }
})

//트레이너 코멘트 수정(추가, 삭제) ex2
// router.put('/comment/update/:id', verifyToken, async (req, res, next) => {
//   try {
//     let premium = await PremiumModel.find({ _id: req.params.id }).exec();
    
//     console.log(premium);
    
//     premium.trainerComment.map((item) => {
//       const selectDate = moment(req.body.date, "YYYY-MM-DD");
//       const dbDate = moment(item.date,  "YYYY-MM-DD");  

//       if(selectDate === dbDate) {

//       }else {

//       }
      
//     })
    
//   } catch (err) {
    
//   }
// })

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
router.post('/diary/weight/:id', verifyToken, async (req, res, next) => {
  const weightNumber = req.body.weightNumber;
  require('moment-timezone');
  moment.tz.setDefault("Asia/Seoul");
  const startDate = moment(req.body.date, 'YYYY-MM-DD');
  const endDate = moment(startDate, "YYYY-MM-DD").add(1, 'days');
  const filter = {_id: req.userId, "bodyLog.date": {"$gte": startDate, "$lt": endDate}};
  const morningWeight = req.body.morningWeight;  // const morningWeight = req.body.morningWeight;
  const nightWeight = req.body.nightWeight;
  console.log(req.userId);
  console.log(req.body.morningWeight);
  console.log(req.body.nightWeight);
  try {
    const result = await UsersModel.findOne(filter);
    if(!result){
      console.log('검색경과없음');

      if (weightNumber === 0) await UsersModel.findOneAndUpdate({_id: req.userId}, {$push:{"bodyLog": {"morningWeight": req.body.morningWeight, "date" : startDate}}});
      else if(weightNumber === 1) 
        await UsersModel.findOneAndUpdate({_id: req.userId}, {$push: {"bodyLog": {"nightWeight": req.body.nightWeight, "date": startDate}}});
    }
    else {
      console.log('검색결과 있으면 실행');
      if(weightNumber === 0) {
         await UsersModel.findOneAndUpdate({_id: req.userId, "bodyLog.date" : {"$gte": startDate, "$lt": endDate}}, { $set :{ "bodyLog.$[].morningWeight" : req.body.morningWeight}},
      {new : true}).exec(); }
      else if (weightNumber === 1) await UsersModel.findOneAndUpdate({_id: req.userId, "bodyLog.date" : {"$gte" : startDate, "$lt": endDate}}, {$set :  {"bodyLog.$[].nightWeight": req.body.nightWeight}});
    }
    return res.json({"success": true});


  } catch (err){
    console.log(`mongoDB err : ${err.message}`);
  }
});

// 음식 타이틀 몽고DB에 저장하는 서버
router.post('/diary/foodtitle/:id', verifyToken, async (req, res, next) => {
  const foodTitleNumber = req.body.foodTitleNumber;
  require('moment-timezone');
  moment.tz.setDefault("Asia/Seoul");
  const startDate = moment(req.body.date, 'YYYY-MM-DD');
  const endDate = moment(startDate, "YYYY-MM-DD").add(1, 'days');
  const filter = {_id: req.userId, "bodyLog.date": {"$gte": startDate, "$lt": endDate}};
  const morningFoodTitle = req.body.morningFoodTitle;  
  const afternoonFoodTitle = req.body.afternoonFoodTitle;
  const nightFoodTitle = req.body.nightFoodTitle;
  const snackTitle = req.body.snackTitle;
  console.log('-------------------------------------------------------------------------------------------------------------------------');
  console.log(req.userId);
  console.log(req.body.morningFoodTitle);
  console.log(req.body.afternoonFoodTitle);
  console.log(req.body.nightFoodTitle);
  console.log(req.body.snackTitle);
  console.log('-------------------------------------------------------------------------------------------------------------------------');
  try {
    const result = await UsersModel.findOne(filter);
    if(!result) {
      console.log('날짜가 없으면 실행');

      if (foodTitleNumber === 0) await UsersModel.findOneAndUpdate({_id: req.userId}, {$push:{"bodyLog": {"morningFoodTitle": req.body.morningFoodTitle, "date" : startDate}}});
      else if(foodTitleNumber === 1) await UsersModel.findOneAndUpdate({_id: req.userId}, {$push: {"bodyLog": {"afternoonFoodTitle": req.body.afternoonFoodTitle, "date": startDate}}});
    else if(foodTitleNumber === 2) await UsersModel.findOneAndUpdate({_id: req.userId}, {$push: {"bodyLog": {"nightFoodTitle": req.body.nightFoodTitle, "date": startDate}}});
    else  await UsersModel.findOneAndUpdate({_id: req.userId}, {$push: {"bodyLog": {"snackTitle": req.body.snackTitle, "date": startDate}}});
    }
    else {
      console.log('날짜가 있으면 실행');
      if(foodTitleNumber === 0) { await UsersModel.findOneAndUpdate({_id: req.userId, "bodyLog.date" : {"$gte": startDate, "$lt": endDate}}, { $set :{ "bodyLog.$[].morningFoodTitle" : req.body.morningFoodTitle}},
      {new : true}).exec(); }
      else if (foodTitleNumber === 1) await UsersModel.findOneAndUpdate({_id: req.userId, "bodyLog.date" : {"$gte" : startDate, "$lt": endDate}}, {$set :  {"bodyLog.$[].afternoonFoodTitle": req.body.afternoonFoodTitle}});
      else if (foodTitleNumber === 2) await UsersModel.findOneAndUpdate({_id: req.userId, "bodyLog.date" : {"$gte" : startDate, "$lt": endDate}}, {$set :  {"bodyLog.$[].nightFoodTitle": req.body.nightFoodTitle}});
      else  await UsersModel.findOneAndUpdate({_id: req.userId, "bodyLog.date" : {"$gte" : startDate, "$lt": endDate}}, {$set :  {"bodyLog.$[].snackTitle": req.body.snackTitle}});
    }
    return res.json({"success": true});


  } catch (err){
    console.log(`mongoDB err : ${err.message}`);
  }
});


module.exports = router