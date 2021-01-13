const express = require('express');
const router = express.Router();
const UsersModel = require('../models/UsersModel');
const { request } = require('express');
const jwt = require('jsonwebtoken');
const { JWT_SecretKey } = require('../config/env.js');
const verifyToken = require('../libs/verifyToken');

router.post('/join', async (req, res, next) => {
    if ((!req.body.username) || (!req.body.password) || (!req.body.email)) {
        console.log(req.body);
        return res.json({success: false, message: '모두 필수 입력란 입니다.'});
    }
    UsersModel.findOne({ email: req.body.email }, (err, user) => {
        if(err) {
            return res.status(500).json({ error: true, message: "Server error" });
        } else if (user) {
            console.log("이미 회원 가입 하였습니다.");
            return res.status(200).json({
                status: 409,
                error: true,
                message: "이미 회원 가입 하였습니다.",
              });
        }else{
            let userInfo = new UsersModel({
                email: req.body.email,
                loginType: "EMAIL",
                password: req.body.password,
                username: req.body.username,
              });
        
              userInfo.save((err) => {
                if(err){
                    return res.json({success: false, msg: 'mongodb저장 실패'});
                    console.log(err);
                }
            });
              return res.status(200).json({
                success: true,
                message: "회원가입을 진심으로 감사드립니다.",
              });
        }
    });
})

//valuedata랑 trim적용하세요 
router.post("/login", (req, res) => {
    if ((!req.body.password) || (!req.body.email)) {
        return res.json({success: false, message: '모두 필수 입력란 입니다.'});
    }

    let jsonWebToken;
  
    UsersModel.findOne({ email: req.body.email }, (err, user) => {
        console.log(user);
      if (!user) {
        res.status(200).json({
          success: false,
          message: "가입부터 하세요",
        });
      } else if (user) {
        UsersModel.findOne(
          { email: req.body.email, password: req.body.password },
          (err, user) => {
            if (err) {
                return res.status(500).json({ error: true, message: "Server error" });
            }
            if (!user) {
              return res.status(200).json({
                status: 409,
                success: false,
                message: "비밀번호를 다시 확인해 주세요.",
              });
            } else if (user) {
              let userInfo = {
                _id: user._id,
                email: user.email,
              };
  
              jsonWebToken = jwt.sign(userInfo, JWT_SecretKey, {
                expiresIn: "300d",
              });
  
              res.status(200).json({ status: 200, success: true, accesstoken: jsonWebToken });
            }
          }
        );
      }
    });
  });

// 에러 내줌
router.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({
      message, data
    })
  });

// //@desc Authenticate a user
// //@route POST /authenticate
// router.post('/authenticate', actions.authenticate)

// //@desc Get info on a user
// //@route GET /getinfo
// router.get('/getinfo', actions.getinfo)

module.exports = router