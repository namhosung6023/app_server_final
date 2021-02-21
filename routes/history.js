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
      return res.status(409).json({ success: false, message: '알람디비 있음' });
    }
    let history = await new HistoryModel({ user: req.userId });
    await history.save();
    console.log('history._id', history._id);

    await UsersModel.update({ _id: req.userId }, { history: history._id });

    return res.status(500).json({ success: true, message: '알람디비 생성' });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: true, message: err.message });
  }
});

// 알람 불러오기
router.get('/', verifyToken, async (req, res, next) => {
  try {
    let history = await HistoryModel.findOne({ user: req.userId }).exec();
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: true, message: err.message });
  }
});

module.exports = router;
