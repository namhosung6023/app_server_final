const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const HistorySchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  // content: {
  //   // 1.체크리스트 100%, 2.공복, 3.자기 전, 4.아침, 5.점심, 6.저녁, 7.간식,
  //   // 8.체크리스트 등록(운동), 9.체크리스트 등록(식단) 10.체크리스트 수정(운동), 11.체크리스트 수정(식단) 12.코멘트 등록, 13.코멘트 수정
  //   type: String,
  //   default: ""
  // },
  history: [
    {
      title: {
        type: String,
        default: '',
      },
      content: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
      },
      date: {
        type: Date,
      },
      isCheck: {
        type: Boolean,
        default: false,
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
