const express = require('express');
const router = express.Router();
const UsersModel = require('../models/UsersModel');
const TrainerModel = require('../models/TrainerModel');
const verifyToken = require('../libs/verifyToken');

/*
 * 트레이너 상세정보 입력
 * TrainerModel 트레이너 정보 제공
 */
router.post("/register", verifyToken, async (req, res) => {
  console.log("body", req.body);

  if (!req.userId) {
    return res
      .status(200)
      .json({ status: 409, message: "로그인 후 이용해주세요." });
  }

  let data = {
    user: req.userId,
    mobileNo: req.body.mobileNo,
    address: req.body.address,
    postcode: req.body.postcode,
    mainFields: req.body.mainFields,
    etcField: req.body.etcField,
    profileImages: req.body.profileImages,
    trainerIntro: req.body.trainerIntro,
    // 자격사항 전 버전
    careers: req.body.careers,
    certificates: req.body.certificates,
    certFiles: req.body.certFiles,
    // 자격사항 새 버전
    licenses: req.body.licenses,
    awards: req.body.awards,
    careers: req.body.careers,
    status: "HOLD", //HOLD시 일반 유저들이 볼수 없음.관리자 페이지에서 PUBLIC으로 변경 1. HOLD  2.PUBLIC 3.RETURN
    privateLegalAggree: req.body.privateLegalAggree,
  };
  try {
    let trainer = await new TrainerModel(data);
    await trainer.save();
    await UsersModel.update(
      { _id: req.userId },
      { trainer: trainer._id, type: "2" }
    );
    res.status(200).json({ status: 200, success: true });
  } catch (err) {
    console.log(err);
    if (err) res.status(500).json({ error: true, message: err });
  }
});

module.exports = router