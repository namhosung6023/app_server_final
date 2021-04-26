const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BetaServiceSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  title: {
    type: String,
    default: '',
  },
  contents: {
    type: String,
    default: '',
  },
  type: {
    // 버그신고, 요구사항, 사용후기
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('betaService', BetaServiceSchema);
