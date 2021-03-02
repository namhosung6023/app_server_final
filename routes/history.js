const express = require('express');
const router = express.Router();
const UsersModel = require('../models/UsersModel');
const TrainerModel = require('../models/TrainerModel');
const PremiumModel = require('../models/PremiumModel');
const HistoryModel = require('../models/HistoryModel');
const verifyToken = require('../libs/verifyToken');
const moment = require('moment');

// 알람디비 추가(유저 1 = 알람디비 1)
router.post('/register', verifyToken, async (req, res, next) => {
  console.log(req.userId);

  try {
    let user = await HistoryModel.findOne({ user: req.userId }).exec();
    if (user) {
      return res.json({
        success: false,
        message: '이미 알람디비가 존재합니다.',
      });
    }
    let history = await new HistoryModel({ user: req.userId });
    await history.save();
    console.log('history._id', history._id);

    await UsersModel.update({ _id: req.userId }, { history: history._id });

    return res.json({ success: true, message: '알람디비 생성' });
  } catch (err) {
    return res.json({ error: true, message: err.message });
  }
});

// 바디로그 알람추가
router.post('/bodylog/:id', verifyToken, async (req, res, next) => {
  console.log(req.userId);
  let data = req.body.data;

  try {
    let premium = await PremiumModel.findOne({
      _id: req.params.id,
    })
      .populate('user trainer')
      .exec();

    console.log(premium);

    let trainer = await UsersModel.findOne({
      _id: premium.trainer.user,
    }).exec();
    let historyId = trainer.history;
    console.log(historyId);

    if (data === 0) {
      let history = {
        title: 2,
        content: req.userId,
        date: req.body.date,
      };
      await HistoryModel.findOneAndUpdate(
        { _id: historyId },
        { $push: { history: { $each: [history] } } }
      );
      return res.json({ success: true, message: '공복' });
    } else {
      let history = {
        title: 3,
        content: req.userId,
        date: req.body.date,
      };
      await HistoryModel.findOneAndUpdate(
        { _id: historyId },
        { $push: { history: { $each: [history] } } }
      );
      return res.json({ success: true, message: '자기 전' });
    }
  } catch (err) {
    return res.json({ error: true, message: err.message });
  }
});

// 체크리스트 100%
router.post('/checklist/:id', verifyToken, async (req, res, next) => {
  const selectDate = moment(req.body.date).startOf('day');
  const endDate = moment(req.body.date).endOf('day');
  let checklist = [];
  let complete = false;

  try {
    let premium = await PremiumModel.findOne({
      _id: req.params.id,
      'checklist.date': { $gte: selectDate, $lte: endDate },
    })
      .populate('user')
      .exec();

    premium.checklist.map((item) => {
      let date = moment(item.date).format('YYYY-MM-DD');
      let selectDate = moment(req.body.date).format('YYYY-MM-DD');
      if (date === selectDate) checklist.push(item);
    });

    console.log(premium.checklist[0]);

    for (let i = 0; i < premium.checklist[0].workoutlist.length; i++) {
      console.log(checklist[0].workoutlist[i].isEditable);
      if (checklist[0].workoutlist[i].isEditable === true) {
        console.log('체크리스트 100%');
        complete = true;
      } else {
        complete = false;
        return res.json({
          success: false,
          message: '체크리스트가 100%가 아닙니다.',
        });
      }
    }

    if (complete === true) {
      let user = await PremiumModel.findOne({ _id: req.params.id })
        .populate('trainer')
        .exec();
      let trainer = await UsersModel.findOne({
        _id: user.trainer.user,
      }).exec();
      let historyId = trainer.history;
      console.log(historyId);
      let history = {
        title: 1,
        content: req.userId,
        date: req.body.date,
      };
      await HistoryModel.findOneAndUpdate(
        { _id: historyId },
        { $push: { history: { $each: [history] } } }
      );
    }

    return res.json({ success: true, premium });
  } catch (err) {
    return res.json({ error: true, message: err.message });
  }
});

// 알람 불러오기
router.get('/', verifyToken, async (req, res, next) => {
  try {
    let history = await HistoryModel.findOne({ user: req.userId })
      .sort({ createdAt: -1 })
      .exec();

    return res.json({ success: true, history: history.history });
  } catch (err) {
    return res.json({ error: true, message: err.message });
  }
});

module.exports = router;
