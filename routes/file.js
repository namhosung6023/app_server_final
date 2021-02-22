const express = require('express');
const router = express.Router();
const awsconfig = require('../config/awsconfig');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const verifyToken = require('../libs/verifyToken');
const moment = require('moment');

AWS.config.update({
  region: awsconfig.region,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: awsconfig.IdentityPoolId,
  }),
});

const s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {
    Bucket: awsconfig.Bucket,
  },
});
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: awsconfig.Bucket,
    key: function (req, file, callback) {
      console.log(file);
      if (file.fieldname === 'thumbnail') {
        callback(
          null,
          'images/thumbnail-' + Date.now() + '.' + file.mimetype.split('/')[1]
        );
      } else if (file.fieldname === 'image') {
        callback(
          null,
          'images/image-' + Date.now() + '.' + file.mimetype.split('/')[1]
        );
      } else {
        callback(
          null,
          'images/' +
            req.userId +
            file.originalname.split('.')[0] +
            '.' +
            file.mimetype.split('/')[1]
        );
      }
    },
    acl: 'public-read-write',
    limits: { fileSize: 2097152 * 10 }, //업로드 용량 제한 2MB*5
  }),
});

const fs = require('fs');
const path = require('path'); //이미지 저장되는 위치 설정
const UsersModel = require('../models/UsersModel');
const PremiumModel = require('../models/PremiumModel');
const HistoryModel = require('../models/HistoryModel');
const { KinesisVideoSignalingChannels } = require('aws-sdk');

//다이어리 사진 몽고디비에 저장하기
router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
  const pictureNumber = req.body.pictureNumber;
  require('moment-timezone');
  moment.tz.setDefault('Asia/Seoul');
  const startDate = moment(req.body.date, 'YYYY-MM-DD');
  const endDate = moment(startDate, 'YYYY-MM-DD').add(1, 'days');
  const filter = {
    _id: req.params.id,
    'bodyLog.date': { $gte: startDate, $lt: endDate },
  };
  try {
    const result = await PremiumModel.findOne(filter).populate('user').exec();
    let historyId = result.user.history;
    if (!result) {
      if (pictureNumber === '0')
        await PremiumModel.findOneAndUpdate(
          { _id: req.params.id },
          {
            $push: {
              bodyLog: { morningBody: req.file.location, date: startDate },
            },
          }
        );
      else if (pictureNumber === '1') {
        await PremiumModel.findOneAndUpdate(
          { _id: req.params.id },
          {
            $push: {
              bodyLog: { nightBody: req.file.location, date: startDate },
            },
          }
        );
      } else if (pictureNumber === '2') {
        await PremiumModel.findOneAndUpdate(
          { _id: req.params.id },
          {
            $push: {
              bodyLog: { morningFood: req.file.location, date: startDate },
            },
          }
        );

        // 알람추가
        let history = {
          title: 4,
          content: result.user.username,
          date: req.body.date,
        };
        await HistoryModel.findOneAndUpdate(
          { _id: historyId },
          { $push: { history: { $each: [history] } } }
        );
      } else if (pictureNumber === '3') {
        await PremiumModel.findOneAndUpdate(
          { _id: req.params.id },
          {
            $push: {
              bodyLog: { afternoonFood: req.file.location, date: startDate },
            },
          }
        );

        // 알람추가
        let history = {
          title: 5,
          content: result.user.username,
          date: req.body.date,
        };
        await HistoryModel.findOneAndUpdate(
          { _id: historyId },
          { $push: { history: { $each: [history] } } }
        );
      } else if (pictureNumber === '4') {
        await PremiumModel.findOneAndUpdate(
          { _id: req.params.id },
          {
            $push: {
              bodyLog: { nightFood: req.file.location, date: startDate },
            },
          }
        );

        // 알람추가
        let history = {
          title: 6,
          content: result.user.username,
          date: req.body.date,
        };
        await HistoryModel.findOneAndUpdate(
          { _id: historyId },
          { $push: { history: { $each: [history] } } }
        );
      } else
        await PremiumModel.findOneAndUpdate(
          { _id: req.params.id },
          { $push: { bodyLog: { snack: req.file.location, date: startDate } } }
        );

      // 알람추가
      let history = {
        title: 7,
        content: result.user.username,
        date: req.body.date,
      };
      await HistoryModel.findOneAndUpdate(
        { _id: historyId },
        { $push: { history: { $each: [history] } } }
      );
    } else {
      if (pictureNumber === '0')
        await PremiumModel.findOneAndUpdate(
          {
            _id: req.params.id,
            'bodyLog.date': { $gte: startDate, $lt: endDate },
          },
          { $push: { 'bodyLog.$[].morningBody': req.file.location } }
        );
      else if (pictureNumber === '1')
        await PremiumModel.findOneAndUpdate(
          {
            _id: req.params.id,
            'bodyLog.date': { $gte: startDate, $lt: endDate },
          },
          { $push: { 'bodyLog.$[].nightBody': req.file.location } }
        );
      else if (pictureNumber === '2')
        await PremiumModel.findOneAndUpdate(
          {
            _id: req.params.id,
            'bodyLog.date': { $gte: startDate, $lt: endDate },
          },
          { $push: { 'bodyLog.$[].morningFood': req.file.location } }
        );
      else if (pictureNumber === '3')
        await PremiumModel.findOneAndUpdate(
          {
            _id: req.params.id,
            'bodyLog.date': { $gte: startDate, $lt: endDate },
          },
          { $push: { 'bodyLog.$[].afternoonFood': req.file.location } }
        );
      else if (pictureNumber === '4')
        await PremiumModel.findOneAndUpdate(
          {
            _id: req.params.id,
            'bodyLog.date': { $gte: startDate, $lt: endDate },
          },
          { $push: { 'bodyLog.$[].nightFood': req.file.location } }
        );
      else
        await PremiumModel.findOneAndUpdate(
          {
            _id: req.params.id,
            'bodyLog.date': { $gte: startDate, $lt: endDate },
          },
          { $push: { 'bodyLog.$[].snack': req.file.location } }
        );
    }
    return res.json({ photoUrl: req.file.location });
  } catch (err) {
    console.log(`mongoDB err : ${err.message}`);
  }
});

// 사진 불러오기
router.get('/diary/user/:id', verifyToken, async (req, res, next) => {
  // console.log(req.query.date);
  try {
    let result = await PremiumModel.findOne({ _id: req.params.id }).exec();

    let bodyLog = [];
    result.bodyLog.map((item) => {
      let data = moment(item.date).format('YYYY-MM-DD');
      let selectDate = moment(req.query.date).format('YYYY-MM-DD');

      if (data === selectDate) {
        bodyLog.push(item);
      }
    });

    let data = {
      bodyLog,
    };

    // console.log(bodyLog);
    if (bodyLog) {
      return res.json({ bodyLog: data.bodyLog });
    } else {
      return res.json({ bodyLog: data.bodyLog });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: true, message: err.message });
  }
});

/* 삭제 요청 처리 */

router.get('/delete', verifyToken, (req, res) => {
  let params = {
    Bucket: awsconfig.Bucket,
    Key: req.query.path,
  };
  s3.deleteObject(params, (err) => {
    if (err) return res.status(500).json({ err: true });

    return res.status(200).json({ success: true });
  });
});

module.exports = router;
