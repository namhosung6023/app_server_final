const express = require('express');
const router = express.Router();
const awsconfig = require('../config/awsconfig');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const verifyToken = require('../libs/verifyToken');
const moment = require("moment");

AWS.config.update({
    region: awsconfig.region,
    credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: awsconfig.IdentityPoolId,
    })
});

const s3 = new AWS.S3({
    apiVersion: '2006-03-01',
    params: {
        Bucket: awsconfig.Bucket
    }
});
const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: awsconfig.Bucket,
        key: function (req, file, callback) {
            if (file.fieldname === 'thumbnail') {
                callback(null, 'images/thumbnail-' + Date.now() + '.' + file.mimetype.split('/')[1])
            } else if (file.fieldname === 'image') {
                callback(null, 'images/image-' + Date.now() + '.' + file.mimetype.split('/')[1])
            } else {
                callback(null, 'images/image-' + Date.now() + '.' + file.mimetype.split('/')[1])
            }
        },
        acl: 'public-read-write',
        limits: { fileSize: 2097152 * 10 }, //업로드 용량 제한 2MB*5
    })
});

const fs = require('fs');
const path = require('path');//이미지 저장되는 위치 설정
const UsersModel = require('../models/UsersModel');
const { KinesisVideoSignalingChannels } = require('aws-sdk');


router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
    console.log(req.userId);

    let path;
    path = req.file.location;

    await UsersModel.findOneAndUpdate({ _id: req.userId },
        { $push: { "bodyLog": {
        "morningBody": req.file.location
      }}})

    return res.status(200).json({ path: path });
});

// 사진 불러오기 
router.get('/diary/user/:id', verifyToken, async (req,res, next) => {
    console.log(req.query.date);
    try{
    let result = await UsersModel.findOne({_id: req.params.id}).exec();

    let bodyLog=[]
    result.bodyLog.map((item) => {
        let data = moment(item.data).format('YYYY-MM-DD');
        let selectDate = moment(req.query.date).format('YYYY-MM-DD');

        if(data === selectDate) {
            bodyLog.push(item)
        }
    })

    let data = {
        bodyLog
    }

    console.log(bodyLog);
    if(bodyLog){
        return res.json({ bodyLog: data.bodyLog});
    }else {
        return res.json({ bodyLog: data.bodyLog});
    }
    
    }catch (err) {
        console.log(err)
        return res.status(500).json({error: true, message: err.message})
      } 

});



/* 삭제 요청 처리 */

router.get("/delete", verifyToken, (req, res) => {

    let params = {
        Bucket: awsconfig.Bucket,
        Key: req.query.path
    }
    s3.deleteObject(params, err => {

        if (err) return res.status(500).json({ err: true })

        return res.status(200).json({ success: true })
    })

});

module.exports = router;
