const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const HistorySchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  // content: {
  //   // 1.체크리스트 100%, 2.사진(체중관리), 3.몸무게(체중관리), 4.식단, 5.아침, 6.점심, 7.저녁, 8.간식,
  //   // 9.체크리스트 등록, 10.체크리스트 수정, 11.코멘트 등록
  //   type: String,
  //   default: ""
  // },
  history: [
    {
      content: {
        type: String,
        default: '',
      },
      date: {
        type: Date,
      },
      isCheck: {
        type: String,
        default: '',
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('history', HistorySchema);
