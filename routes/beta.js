const express = require('express');
const router = express.Router();
const verifyToken = require('../libs/verifyToken');
const BetaServiceModel = require('../models/BetaServiceModel');
const UsersModel = require('../models/UsersModel');

/*
  글 작성(버그신고 or 요구사항 or 사용후기)
*/
router.post('/register', verifyToken, async (req, res) => {
  try {
    let data = {
      user: req.userId,
      title: req.body.title,
      contents: req.body.contents,
      type: req.body.type,
    };

    let betaService = await new BetaServiceModel(data);
    await betaService.save();
    return res.json({ success: true });
  } catch (err) {
    return res.json({ error: true, messeage: err.messeage });
  }
});

/*
  베타 리스트
*/
router.get('/list', async (req, res) => {
  console.log('type', req.query);
  try {
    let data;
    if (req.query.type != '전체') {
      data = await BetaServiceModel.find({ type: req.query.type })
        .populate('user', 'username')
        .exec();
    } else {
      data = await BetaServiceModel.find().populate('user', 'username').exec();
    }

    return res.json({ success: true, data });
  } catch (err) {
    return res.json({ error: true, messeage: err.messeage });
  }
});

/*
  베타 글 상세보기
*/
router.get('/detail/:id', async (req, res) => {
  try {
    const data = await BetaServiceModel.find({ _id: req.params.id })
      .populate('user', 'avatar username')
      .exec();

    return res.json({ success: true, data });
  } catch (err) {
    return res.json({ error: true, messeage: err.messeage });
  }
});

/*
  베타 글 삭제하기 (본인이)
*/
router.delete('/delete/:id', verifyToken, async (req, res) => {
  try {
    await BetaServiceModel.deleteOne({ _id: req.params.id });
    return res.json({ success: true });
  } catch (err) {
    return res.json({ error: true, messeage: err.messeage });
  }
});

module.exports = router;
