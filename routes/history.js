const express = require('express');
const router = express.Router();
const UsersModel = require('../models/UsersModel');
const TrainerModel = require('../models/TrainerModel');
const PremiumModel = require('../models/PremiumModel');
const HistoryModel = require('../models/HistoryModel');
const verifyToken = require('../libs/verifyToken');
const moment = require("moment");

// 알람디비 추가(유저 1 = 알람디비 1)
router.post('/register', verifyToken, async (req, res, next) => {
  let historyData = {
    user: req.userId
  }
  console.log(historyData);

  try {
    let history = await new HistoryModel(historyData);
    awaithistory.save();
    console.log("history._id", history._id);
  
    await UsersModel.update(
      { _id: user._id },
      { $push: { history: history._id }}
    );
  } catch (err) {
    return res.status(500).json({ success: false, error: true, message: err.message });
  }

})



module.exports = router