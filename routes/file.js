const express = require('express');
const router = express.Router();
const awsconfig = require('../config/awsconfig');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const verifyToken = require('../libs/verifyToken');

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


router.post('/upload', verifyToken, upload.single('file'), (req, res) => {

    let path;
    path = req.file.location;

    return res.status(200).json({ path: path });
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
