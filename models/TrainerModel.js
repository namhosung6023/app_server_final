let mongoose = require("mongoose");
let Schema = mongoose.Schema;
//let autoIncrement = require("mongoose-auto-increment-fix");

let TrainerSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
  },
  projects: [
    {
      //내가 등록한 프로젝트
      type: mongoose.Schema.Types.ObjectId,
      ref: "project",
    },
  ],
  mainFields: [], //주요 트레이닝 분야
  etcField: {
    //기타 트레이닝 분야
    type: String,
    default: "",
  },
  gender: {
    //성별
    type: String,
    default: "",
  },
  mobileNo: {
    type: String,
    default: "",
  },
  address: {
    //활동 지역
    type: String,
    default: "",
  },
  postcode: {
    //활동 지역 우편번호
    type: String,
    default: "",
  },
  careers: [],
  certificates: [],
  certFiles: [], //자격증 이미지
  profileImages: [], // 프로필 이미지
  // profileImages: [
  //   {
  //     image: {
  //       type: String,
  //       default: "",
  //     },
  //     descript: {
  //       type: String,
  //       default: "",
  //     },
  //     createdAt: {
  //       type: String,
  //       default: "",
  //     },
  //   },
  // ],
  premiumUser: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],
  privateLegalAggree: {
    type: Boolean,
    default: false,
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: "" },
});

// TrainerSchema.plugin(autoIncrement.plugin, {
//   model: "trainer",
//   field: "id",
//   startAt: 1,
// });
module.exports = mongoose.model("trainer", TrainerSchema);