const express = require('express');
const router = express.Router();
const UsersModel = require('../models/UsersModel');
const TrainerModel = require('../models/TrainerModel');
const PremiumModel = require('../models/PremiumModel');
const HistoryModel = require('../models/HistoryModel');
const verifyToken = require('../libs/verifyToken');
const moment = require('moment');

// 회원이 프리미엄 신청
router.post('/apply/:id', verifyToken, async (req, res, next) => {
  console.log(req.body);
  let data = {
    user: req.userId,
    trainer: req.params.id,
    startDate: Date.now(),
    endDate: moment().add(3, 'months'),
  };

  try {
    let trainer = await TrainerModel.findOne({ _id: req.params.id }).exec();
    let result = trainer.premiumUser.indexOf(req.userId);
    if (result >= 0) {
      return res.json({
        success: false,
        message: '이미 수강 신청을 하였습니다.',
      });
    } else {
      let premium = await new PremiumModel(data);
      await premium.save();
      console.log('premium._id', premium._id);

      let trainerData = {
        user: req.userId,
        premium: premium._id,
      };

      let userData = {
        trainer: req.params.id,
        premium: premium._id,
      };

      await TrainerModel.update(
        { _id: req.params.id },
        { $push: { premiumUser: { $each: [trainerData] } } }
      );

      await UsersModel.update(
        { _id: req.userId },
        { $push: { premiumTrainer: { $each: [userData] } } }
      );

      res.json({ success: true, premiumId: premium._id });
    }
  } catch (err) {
    return res.json({ error: true, message: err.message });
  }
});

/*
 * 트레이너 회원 관리 > 회원 리스트
 * TrainerModel 트레이너 정보 제공
 */
router.get('/userlist/:id', async (req, res) => {
  try {
    const trainer = await TrainerModel.findOne({ _id: req.params.id })
      .populate({
        path: 'premiumUser',
        populate: {
          path: 'user premium',
          select: '_id profileImages username age gender startDate endDate',
        },
      })
      // .sort({ 'premiumUser.premium.createdAt': -1 })
      .exec();

    let user = await UsersModel.findOne({ _id: trainer.user }).exec();

    let history = await HistoryModel.findOne({ _id: user.history }).exec();

    if (!history.history) {
      return res.json({ success: true, memberList, message: '알람없음' });
    }

    let alarm = [];

    // console.log('username', trainer.premiumUser.user);
    history.history.map((item) => {
      if (!item.isCheck) {
        alarm.push(item.content);
      } else {
        console.log('알람없음');
        return res.json({ success: true, memberList, message: '알람없음' });
      }
    });
    console.log(alarm);

    let memberList = trainer.premiumUser;

    // let alarmuser = [];
    // for (let i = 0; i <= data.length; i++) {
    //   for (let j = 0; j <= alarm.length; j++) {
    //     // console.log('username', username);
    //     // console.log('alarm', alarm);
    //     if (data[i].user.username == alarm[j]) {
    //       return alarmuser.push(data[i].user.username);
    //     }
    //   }
    // }

    // alarmuser = alarmuser.filter(
    //   (item, index) => alarmuser.indexOf(item) === index
    // );
    let count = {};

    alarm.forEach((value, index) => {
      count[value] = (count[value] || 0) + 1;
    });
    console.log('alarmuser', count);

    if (memberList)
      res.json({
        success: true,
        memberList,
        count,
      });
  } catch (err) {
    res.status(500).json({ error: true, message: err.message });
  }
});

router.post('/checklist/update/:id', verifyToken, async (req, res, next) => {
  console.log(req.body);

  const startDate = moment(req.body.date).startOf('day');
  const endDate = moment(req.body.date).endOf('day');

  console.log(`startDate: ${startDate}`);
  console.log(`endDate: ${endDate}`);

  try {
    const premium = await PremiumModel.findOne(filter);
    if (premium) {
      console.log(`${startDate}: checklist 있음`);
      if (req.body.id === null) {
        console.log('id 없음 => 리스트에 추가');

        // const data = {
        //   name: req.body.data.name,
        //   contents: req.body.data.contents,
        // };
        // const query = {
        //   _id: req.params.id,
        //   'checklist.date': { $gte: startDate, $lte: endDate },
        // };
        // const update = { $push: { 'checklist.$.workoutlist': data } };

        // await PremiumModel.updateOne(query, update);
        // return res.json({ success: true });
      } else {
        console.log(`id 있음 => ${req.body.id}`);

        // query문 작성
        // const query = {_id: req.params.id, 'checklist.date': { $gte: startDate, $lte: endDate }};
        // options문 작성 (체크박스 put 참고)
        // await PremiumModel.updateOne(query, {
        //   $push: { 'checklist.$.workoutlist': data },
        // });
      }
    } else {
      console.log(`${startDate}: checklist 없음`);
    }
  } catch (err) {
    console.log(err);
  }
});

// 트레이너가 회원의 체크리스트 추가(운동)
router.post(
  '/checklist/workoutlist/trainer/:id',
  verifyToken,
  async (req, res, next) => {
    let data = {
      workoutlist: JSON.parse(req.body.workoutlist),
      date: req.body.date,
    };
    console.log(JSON.parse(req.body.workoutlist));

    const selectDate = moment(data.date).startOf('day');
    const endDate = moment(data.date).endOf('day');

    try {
      let premium = await PremiumModel.findOne({
        _id: req.params.id,
        checklist: {
          $elemMatch: {
            date: {
              $gte: selectDate,
              $lte: endDate,
            },
          },
        },
      })
        .populate('trainer')
        .exec();
      if (premium) {
        console.log('찾음');
        await PremiumModel.findOneAndUpdate(
          {
            _id: req.params.id,
            checklist: {
              $elemMatch: {
                date: {
                  $gte: selectDate,
                  $lte: endDate,
                },
              },
            },
          },
          {
            $set: {
              'checklist.$.workoutlist': data.workoutlist,
            },
          }
        ).exec();

        // 알람 추가
        let user = await PremiumModel.findOne({ _id: req.params.id })
          .populate('user')
          .exec();
        let historyId = user.user.history;
        console.log(historyId);

        // let trainer = await UsersModel.findOne({
        //   _id: premium.trainer.user,
        // }).exec();

        let history = {
          title: 10,
          content: premium.trainer.user,
          date: req.body.date,
        };

        await HistoryModel.findOneAndUpdate(
          { _id: historyId },
          { $push: { history: { $each: [history] } } }
        );

        return res.json({ success: true, message: 'update' });
      } else {
        console.log('못찾음');
        await PremiumModel.updateOne(
          { _id: req.params.id },
          { $push: { checklist: { $each: [data] } } }
        ).exec();

        let premium = await PremiumModel.findOne({
          _id: req.params.id,
        })
          .populate('trainer')
          .exec();

        // 알람 추가
        let user = await PremiumModel.findOne({ _id: req.params.id })
          .populate('user')
          .exec();
        let historyId = user.user.history;
        console.log(historyId);

        // let trainer = await UsersModel.findOne({
        //   _id: premium.trainer.user,
        // }).exec();

        let history = {
          title: 8,
          content: premium.trainer.user,
          date: req.body.date,
        };

        await HistoryModel.findOneAndUpdate(
          { _id: historyId },
          { $push: { history: { $each: [history] } } }
        );

        return res.json({ success: true, message: 'post' });
      }
    } catch (err) {
      console.log(err);
      return res.json({ error: true, message: err.message });
    }
  }
);

// 트레이너가 회원의 체크리스트 추가(식단)
router.post(
  '/checklist/dietlist/trainer/:id',
  verifyToken,
  async (req, res, next) => {
    let data = {
      dietlist: JSON.parse(req.body.dietlist),
      date: req.body.date,
    };
    console.log(JSON.parse(req.body.dietlist));

    const selectDate = moment(data.date).startOf('day');
    const endDate = moment(data.date).endOf('day');

    try {
      let premium = await PremiumModel.findOne({
        _id: req.params.id,
        checklist: {
          $elemMatch: {
            date: {
              $gte: selectDate,
              $lte: endDate,
            },
          },
        },
      })
        .populate('trainer')
        .exec();
      if (premium) {
        console.log('찾음');
        await PremiumModel.findOneAndUpdate(
          {
            _id: req.params.id,
            checklist: {
              $elemMatch: {
                date: {
                  $gte: selectDate,
                  $lte: endDate,
                },
              },
            },
          },
          {
            $set: {
              'checklist.$.dietlist': data.dietlist,
            },
          }
        ).exec();

        // 알람 추가
        let user = await PremiumModel.findOne({ _id: req.params.id })
          .populate('user')
          .exec();
        let historyId = user.user.history;
        console.log(historyId);

        // let trainer = await UsersModel.findOne({
        //   _id: premium.trainer.user,
        // }).exec();

        let history = {
          title: 11,
          content: premium.trainer.user,
          date: req.body.date,
        };

        await HistoryModel.findOneAndUpdate(
          { _id: historyId },
          { $push: { history: { $each: [history] } } }
        );

        return res.json({ success: true, message: 'update' });
      } else {
        console.log('못찾음');
        await PremiumModel.updateOne(
          { _id: req.params.id },
          { $push: { checklist: { $each: [data] } } }
        ).exec();

        let premium = await PremiumModel.findOne({
          _id: req.params.id,
        })
          .populate('trainer')
          .exec();

        // 알람 추가
        let user = await PremiumModel.findOne({ _id: req.params.id })
          .populate('user')
          .exec();
        let historyId = user.user.history;
        console.log(historyId);

        // let trainer = await UsersModel.findOne({
        //   _id: premium.trainer.user,
        // }).exec();

        let history = {
          title: 9,
          content: premium.trainer.user,
          date: req.body.date,
        };

        await HistoryModel.findOneAndUpdate(
          { _id: historyId },
          { $push: { history: { $each: [history] } } }
        );

        return res.json({ success: true, message: 'post' });
      }
    } catch (err) {
      console.log(err);
      return res.json({ error: true, message: err.message });
    }
  }
);

// 체크리스트 삭제(운동)
// body = checklistId, workoutId, params = premiumId
router.delete(
  '/checklist/workoutlist/delete/:id',
  verifyToken,
  async (req, res, next) => {
    try {
      await PremiumModel.findOneAndUpdate(
        { _id: req.params.id },
        {
          $pull: {
            'checklist.$[outer].workoutlist': { _id: req.body.workoutId },
          },
        },
        {
          arrayFilters: [{ 'outer._id': req.body.checklistId }],
        }
      );

      return res.json({ success: true });
    } catch (err) {
      console.log(err);
      return res.json({ error: true, message: err.message });
    }
  }
);

// 체크리스트 삭제(식단)
// body = checklistId, dietId, params = premiumId
router.delete(
  '/checklist/dietlist/delete/:id',
  verifyToken,
  async (req, res, next) => {
    try {
      await PremiumModel.findOneAndUpdate(
        { _id: req.params.id },
        {
          $pull: {
            'checklist.$[outer].dietlist': { _id: req.body.dietId },
          },
        },
        {
          arrayFilters: [{ 'outer._id': req.body.checklistId }],
        }
      );

      return res.json({ success: true });
    } catch (err) {
      console.log(err);
      return res.json({ error: true, message: err.message });
    }
  }
);

//트레이너 코멘트 수정(추가, 삭제)
router.post('/comment/update/:id', verifyToken, async (req, res, next) => {
  let data = {
    comment: req.body.comment,
    date: req.body.date,
    createdAt: new Date(),
  };
  console.log(req.body.comment);
  console.log(req.body.date);

  const selectDate = moment(data.date).startOf('day');
  const endDate = moment(data.date).endOf('day');

  try {
    let premium = await PremiumModel.findOne({
      _id: req.params.id,
      trainerComment: {
        $elemMatch: {
          date: {
            $gte: selectDate,
            $lte: endDate,
          },
        },
      },
    })
      .populate('trainer')
      .exec();
    if (!premium) {
      if (data.comment.length <= 0) {
        return res.json({ success: false });
      } else {
        console.log('코멘트 날짜를 찾지 못함');
        await PremiumModel.update(
          { _id: req.params.id },
          { $push: { trainerComment: { $each: [data] } } }
        ).exec();

        // 알람 추가
        let user = await PremiumModel.findOne({ _id: req.params.id })
          .populate('user')
          .exec();
        let historyId = user.user.history;
        console.log(historyId);

        // let trainer = await UsersModel.findOne({
        //   _id: premium.trainer.user,
        // }).exec();

        let premium = await PremiumModel.findOne({
          _id: req.params.id,
        })
          .populate('trainer')
          .exec();

        let history = {
          title: 12,
          content: premium.trainer.user,
          date: req.body.date,
        };

        await HistoryModel.findOneAndUpdate(
          { _id: historyId },
          { $push: { history: { $each: [history] } } }
        );

        return res.json({ success: true, message: 'post' });
      }
    } else {
      // 코멘트 삭제
      if (data.comment.length <= 0) {
        await PremiumModel.update(
          { _id: req.params.id },
          {
            $pull: {
              trainerComment: { date: { $gte: selectDate, $lte: endDate } },
            },
          }
        ).exec();
        return res.json({ success: true, message: 'delete' });
      } else {
        // 코멘트 수정
        console.log('여기서 실행');
        await PremiumModel.updateOne(
          {
            _id: req.params.id,
            trainerComment: {
              $elemMatch: {
                date: {
                  $gte: selectDate,
                  $lte: endDate,
                },
              },
            },
          },
          // { $set: { trainerComment : data }}
          {
            $set: {
              'trainerComment.$.comment': data.comment,
              'trainerComment.$.createdAt': data.createdAt,
            },
          }
        ).exec();

        // 알람 추가
        let user = await PremiumModel.findOne({ _id: req.params.id })
          .populate('user')
          .exec();
        let historyId = user.user.history;
        console.log(historyId);

        // let trainer = await UsersModel.findOne({
        //   _id: premium.trainer.user,
        // }).exec();

        let history = {
          title: 13,
          content: premium.trainer.user,
          date: req.body.date,
        };

        await HistoryModel.findOneAndUpdate(
          { _id: historyId },
          { $push: { history: { $each: [history] } } }
        );

        return res.json({ success: true, message: 'update' });
      }
    }
  } catch (err) {
    console.log(err);
    return res.json({ error: true, message: err.message });
  }
});

// 코멘트 보기 (회원)
router.get('/comment/user/:id', verifyToken, async (req, res, next) => {
  try {
    let result = await PremiumModel.findOne({ _id: req.params.id })
      .populate({
        path: 'trainer',
        populate: { path: 'user', select: 'username' },
      })
      .exec();

    let comment = [];
    result.trainerComment.map((item) => {
      let date = moment(item.date).format('YYYY-MM-DD');
      let selectDate = moment(req.query.date).format('YYYY-MM-DD');

      if (date === selectDate) {
        comment.push(item);
      }
    });

    if (comment) {
      return res.json({
        success: true,
        comment: comment,
        trainerName: result.trainer.user.username,
      });
    } else {
      return res.json({
        success: false,
        comment: comment,
        trainerName: result.trainer.user.username,
      });
    }
  } catch (err) {
    console.log(err);
    return res.json({ error: true, message: err.message });
  }
});

/*
 * 회원 체트리스트, 관리일지 모두 출력 - 토큰, 날짜로 premium data 검색(query)
 * Flutter User Provider Model에 한번에 저장
 */
router.get('/user/:id', verifyToken, async (req, res, next) => {
  let trainerName = '';
  let trainerProfile = '';
  let trainerComment = [];
  let checklist = [];
  let bodyLog = [];

  try {
    let result = await PremiumModel.findOne({ _id: req.params.id })
      .populate({
        path: 'trainer',
        populate: { path: 'user', select: 'username' },
      })
      .exec();

    trainerName = result.trainer.user.username;
    trainerProfile = result.trainer.profileImages[0];

    result.trainerComment.map((item) => {
      let date = moment(item.date).format('YYYY-MM-DD');
      let selectDate = moment(req.query.date).format('YYYY-MM-DD');
      if (date === selectDate) trainerComment.push(item);
    });

    result.checklist.map((item) => {
      let date = moment(item.date).format('YYYY-MM-DD');
      let selectDate = moment(req.query.date).format('YYYY-MM-DD');
      if (date === selectDate) checklist.push(item);
    });

    result.bodyLog.map((item) => {
      let date = moment(item.date).format('YYYY-MM-DD');
      let selectDate = moment(req.query.date).format('YYYY-MM-DD');
      if (date === selectDate) bodyLog.push(item);
    });

    let data = { trainerName, trainerComment, checklist, bodyLog };
    return data
      ? res.json({ data, success: true })
      : res.json({ data, success: false });
  } catch (err) {
    return res.json({ error: true, message: err.message });
  }
});

//체크박스 서버
router.put(
  '/checklist/user/checkbox/:id',
  verifyToken,
  async (req, res, next) => {
    console.log(req.body);
    try {
      await PremiumModel.findOneAndUpdate(
        { _id: req.params.id },
        {
          $set: {
            'checklist.$[outer].workoutlist.$[inner].isEditable':
              req.body.isEditable,
            'checklist.$[outer].dietlist.$[diet].isEditable':
              req.body.isEditable,
            'checklist.$[outer].workoutlist.$[inner].checkDate': Date.now(),
            'checklist.$[outer].dietlist.$[diet].checkDate': Date.now(),
          },
        },
        {
          arrayFilters: [
            { 'outer._id': req.body.checklistId },
            { 'inner._id': req.body.workoutId },
            { 'diet._id': req.body.dietId },
          ],
        }
      );
    } catch (err) {
      return res.json({ error: true, message: err.message });
    }
  }
);

// 유저 코멘트
router.post('/comment/user/:id', verifyToken, async (req, res, next) => {
  console.log(req.body);
  await UsersModel.update(
    { _id: req.params.id },
    { $push: { 'checklist.$[index].userComment': req.body.userComment } },
    {
      arrayFilters: [
        {
          'index._id': req.body.checklistId,
        },
      ],
    }
  );
});

// 몸무게 업로드
router.post('/diary/weight/:id', verifyToken, async (req, res, next) => {
  const startDate = moment(req.body.date, 'YYYY-MM-DD');
  const endDate = moment(startDate, 'YYYY-MM-DD').add(1, 'days');
  const weightName = req.body.weightName;
  const weightPath = `bodyLog.$[].${weightName}`;
  const filter = {
    _id: req.params.id,
    'bodyLog.date': { $gte: startDate, $lt: endDate },
  };

  try {
    const result = await PremiumModel.findOne(filter);
    if (!result) {
      await PremiumModel.findOneAndUpdate(
        { _id: req.params.id },
        {
          $push: {
            bodyLog: {
              [weightName]: req.body.weight,
              date: startDate,
            },
          },
        }
      );
    } else {
      await PremiumModel.findOneAndUpdate(
        {
          _id: req.params.id,
          'bodyLog.date': { $gte: startDate, $lt: endDate },
        },
        { $set: { [weightPath]: req.body.weight } },
        { new: true }
      ).exec();
    }
    return res.json({ success: true });
  } catch (err) {
    console.log(`mongoDB err : ${err.message}`);
    return res.json({ error: true, message: err.message });
  }
});

//몸무게 몽고 디비에 저장하는 서버
// router.post('/diary/weight/:id', verifyToken, async (req, res, next) => {
//   const weightNumber = req.body.weightNumber;
//   require('moment-timezone');
//   moment.tz.setDefault('Asia/Seoul');
//   const startDate = moment(req.body.date, 'YYYY-MM-DD');
//   const endDate = moment(startDate, 'YYYY-MM-DD').add(1, 'days');
//   const filter = {
//     _id: req.params.id,
//     'bodyLog.date': { $gte: startDate, $lt: endDate },
//   };
//   const morningWeight = req.body.morningWeight; // const morningWeight = req.body.morningWeight;
//   const nightWeight = req.body.nightWeight;
//   console.log(req.userId);
//   console.log(req.body.morningWeight);
//   console.log(req.body.nightWeight);
//   try {
//     const result = await PremiumModel.findOne(filter);
//     if (!result) {
//       console.log('검색경과없음');

//       if (weightNumber === 0)
//         await PremiumModel.findOneAndUpdate(
//           { _id: req.params.id },
//           {
//             $push: {
//               bodyLog: {
//                 morningWeight: req.body.morningWeight,
//                 date: startDate,
//               },
//             },
//           }
//         );
//       else if (weightNumber === 1)
//         await PremiumModel.findOneAndUpdate(
//           { _id: req.params.id },
//           {
//             $push: {
//               bodyLog: { nightWeight: req.body.nightWeight, date: startDate },
//             },
//           }
//         );
//     } else {
//       console.log('검색결과 있으면 실행');
//       if (weightNumber === 0) {
//         await PremiumModel.findOneAndUpdate(
//           {
//             _id: req.params.id,
//             'bodyLog.date': { $gte: startDate, $lt: endDate },
//           },
//           { $set: { 'bodyLog.$[].morningWeight': req.body.morningWeight } },
//           { new: true }
//         ).exec();
//       } else if (weightNumber === 1)
//         await PremiumModel.findOneAndUpdate(
//           {
//             _id: req.params.id,
//             'bodyLog.date': { $gte: startDate, $lt: endDate },
//           },
//           { $set: { 'bodyLog.$[].nightWeight': req.body.nightWeight } }
//         );
//     }
//     return res.json({ success: true });
//   } catch (err) {
//     console.log(`mongoDB err : ${err.message}`);
//     return res.json({ error: true, message: err.message });
//   }
// });

// 음식 제목 업로드
router.post('/diary/foodtitle/:id', verifyToken, async (req, res, next) => {
  const startDate = moment(req.body.date, 'YYYY-MM-DD');
  const endDate = moment(startDate, 'YYYY-MM-DD').add(1, 'days');
  const foodName = req.body.foodName;
  const foodNamePath = `bodyLog.$[].${foodName}`;
  const filter = {
    _id: req.params.id,
    'bodyLog.date': { $gte: startDate, $lt: endDate },
  };

  try {
    const result = await PremiumModel.findOne(filter);
    if (!result) {
      await PremiumModel.findOneAndUpdate(
        { _id: req.params.id },
        {
          $push: {
            bodyLog: {
              [foodName]: req.body.title,
              date: startDate,
            },
          },
        }
      );
    } else {
      await PremiumModel.findOneAndUpdate(
        {
          _id: req.params.id,
          'bodyLog.date': { $gte: startDate, $lt: endDate },
        },
        {
          $set: { [foodNamePath]: req.body.title },
        },
        { new: true }
      ).exec();
    }
    return res.json({ success: true });
  } catch (err) {
    console.log(`mongoDB err : ${err.message}`);
    return res.json({ error: true, message: err.message });
  }
});

// 음식 타이틀 몽고DB에 저장하는 서버
// router.post('/diary/foodtitle/:id', verifyToken, async (req, res, next) => {
//   const foodTitleNumber = req.body.foodTitleNumber;
//   require('moment-timezone');
//   moment.tz.setDefault('Asia/Seoul');
//   const startDate = moment(req.body.date, 'YYYY-MM-DD');
//   const endDate = moment(startDate, 'YYYY-MM-DD').add(1, 'days');
//   const filter = {
//     _id: req.params.id,
//     'bodyLog.date': { $gte: startDate, $lt: endDate },
//   };
//   const morningFoodTitle = req.body.morningFoodTitle;
//   const afternoonFoodTitle = req.body.afternoonFoodTitle;
//   const nightFoodTitle = req.body.nightFoodTitle;
//   const snackTitle = req.body.snackTitle;
//   console.log(
//     '-------------------------------------------------------------------------------------------------------------------------'
//   );
//   console.log(req.params.id);
//   console.log(req.body.morningFoodTitle);
//   console.log(req.body.afternoonFoodTitle);
//   console.log(req.body.nightFoodTitle);
//   console.log(req.body.snackTitle);
//   console.log(
//     '-------------------------------------------------------------------------------------------------------------------------'
//   );
//   try {
//     const result = await PremiumModel.findOne(filter);
//     if (!result) {
//       console.log('날짜가 없으면 실행');

//       if (foodTitleNumber === 0)
//         await PremiumModel.findOneAndUpdate(
//           { _id: req.params.id },
//           {
//             $push: {
//               bodyLog: {
//                 morningFoodTitle: req.body.morningFoodTitle,
//                 date: startDate,
//               },
//             },
//           }
//         );
//       else if (foodTitleNumber === 1)
//         await PremiumModel.findOneAndUpdate(
//           { _id: req.params.id },
//           {
//             $push: {
//               bodyLog: {
//                 afternoonFoodTitle: req.body.afternoonFoodTitle,
//                 date: startDate,
//               },
//             },
//           }
//         );
//       else if (foodTitleNumber === 2)
//         await PremiumModel.findOneAndUpdate(
//           { _id: req.params.id },
//           {
//             $push: {
//               bodyLog: {
//                 nightFoodTitle: req.body.nightFoodTitle,
//                 date: startDate,
//               },
//             },
//           }
//         );
//       else
//         await PremiumModel.findOneAndUpdate(
//           { _id: req.params.id },
//           {
//             $push: {
//               bodyLog: { snackTitle: req.body.snackTitle, date: startDate },
//             },
//           }
//         );
//     } else {
//       console.log('날짜가 있으면 실행');
//       if (foodTitleNumber === 0) {
//         await PremiumModel.findOneAndUpdate(
//           {
//             _id: req.params.id,
//             'bodyLog.date': { $gte: startDate, $lt: endDate },
//           },
//           {
//             $set: { 'bodyLog.$[].morningFoodTitle': req.body.morningFoodTitle },
//           },
//           { new: true }
//         ).exec();
//       } else if (foodTitleNumber === 1)
//         await PremiumModel.findOneAndUpdate(
//           {
//             _id: req.params.id,
//             'bodyLog.date': { $gte: startDate, $lt: endDate },
//           },
//           {
//             $set: {
//               'bodyLog.$[].afternoonFoodTitle': req.body.afternoonFoodTitle,
//             },
//           }
//         );
//       else if (foodTitleNumber === 2)
//         await PremiumModel.findOneAndUpdate(
//           {
//             _id: req.params.id,
//             'bodyLog.date': { $gte: startDate, $lt: endDate },
//           },
//           { $set: { 'bodyLog.$[].nightFoodTitle': req.body.nightFoodTitle } }
//         );
//       else
//         await PremiumModel.findOneAndUpdate(
//           {
//             _id: req.params.id,
//             'bodyLog.date': { $gte: startDate, $lt: endDate },
//           },
//           { $set: { 'bodyLog.$[].snackTitle': req.body.snackTitle } }
//         );
//     }
//     return res.json({ success: true });
//   } catch (err) {
//     console.log(`mongoDB err : ${err.message}`);
//     return res.json({ error: true, message: err.message });
//   }
// });

module.exports = router;
