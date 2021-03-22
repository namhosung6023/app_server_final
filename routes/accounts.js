const express = require('express');
const router = express.Router();
const UsersModel = require('../models/UsersModel');
const HistoryModel = require('../models/HistoryModel');
const { request } = require('express');
const jwt = require('jsonwebtoken');
const { JWT_SecretKey } = require('../config/env.js');
const verifyToken = require('../libs/verifyToken');

router.post('/join', async (req, res, next) => {
  if (!req.body.username || !req.body.password || !req.body.email) {
    console.log(req.body);
    return res.json({ success: false, message: '모두 필수 입력란 입니다.' });
  }

  let jsonWebToken;

  await UsersModel.findOne({ email: req.body.email }, async (err, user) => {
    if (err) {
      return res.json({ error: false, message: err.message });
    } else if (user) {
      console.log('이미 회원 가입 하였습니다.');
      return res.json({
        success: false,
        message: '이미 회원 가입 하였습니다.',
      });
    } else {
      let userInfo = new UsersModel({
        email: req.body.email,
        loginType: 'EMAIL',
        password: req.body.password,
        username: req.body.username,
      });

      await userInfo.save((err) => {
        if (err) {
          console.log(err);
          return res.json({ error: true, message: err.message });
        }
      });
      let tokenInfo;
      await UsersModel.findOne({ email: req.body.email }, async (err, user) => {
        if (err) return console.log(err.message);
        console.log(user);
        tokenInfo = {
          _id: user._id,
          email: user.email,
        };
        console.log(tokenInfo);
        jsonWebToken = jwt.sign(tokenInfo, JWT_SecretKey, {
          expiresIn: '300d',
        });

        return res.json({
          success: true,
          message: '회원가입을 진심으로 감사드립니다.',
          accesstoken: jsonWebToken,
        });
      });
    }
  });
});

//valuedata랑 trim적용하세요
router.post('/login', (req, res) => {
  if (!req.body.password || !req.body.email) {
    return res.json({ success: false, message: '모두 필수 입력란 입니다.' });
  }

  let jsonWebToken;

  UsersModel.findOne({ email: req.body.email }, (err, user) => {
    console.log(user);
    if (!user) {
      res.json({
        success: false,
        message: '회원가입이 되어 있지 않습니다',
      });
    } else if (user) {
      UsersModel.findOne(
        { email: req.body.email, password: req.body.password },
        (err, user) => {
          if (err) {
            return res.json({ error: true, message: err.message });
          }
          if (!user) {
            return res.json({
              success: false,
              message: '비밀번호를 다시 확인해 주세요.',
            });
          } else if (user) {
            let userInfo = {
              _id: user._id,
              email: user.email,
            };

            jsonWebToken = jwt.sign(userInfo, JWT_SecretKey, {
              expiresIn: '300d',
            });

            res.json({ success: true, accesstoken: jsonWebToken });
          }
        }
      );
    }
  });
});

/**
 * 회원 기본정보 확인
 */

router.get('/profile', verifyToken, async (req, res) => {
  console.log('_id', req.userId);
  try {
    let data = await UsersModel.findOne({ _id: req.userId }, { password: 0 })
      .populate('premiumTrainer')
      .exec();
    res.json({ success: true, data });
  } catch (err) {
    console.log('err', err);
    return res.json({ error: true, message: err.message });
  }
});

// 에러 내줌
router.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({
    message,
    data,
  });
});

// //@desc Authenticate a user
// //@route POST /authenticate
// router.post('/authenticate', actions.authenticate)

// //@desc Get info on a user
// //@route GET /getinfo
// router.get('/getinfo', actions.getinfo)

module.exports = router;
