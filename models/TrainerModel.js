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
  status: {
    //HOLD시 일반 유저들이 볼수 없음.관리자 페이지에서 PUBLIC으로 변경 1. HOLD  2.PUBLIC 3.RETURN
    type: String,
    default: "HOLD",
  },
  mainFields: [], //주요 트레이닝 분야
  etcField: {
    //기타 트레이닝 분야
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
  detailAddress: {
    //상세 주소
    type: String,
    default: "",
  },
  postcode: {
    //활동 지역 우편번호
    type: String,
    default: "",
  },

  // careers: [],
  // certificates: [],
  // certFiles: [], //자격증 이미지
  licenses: [], // 자격증/면허증
  awards: [], // 수상내역
  careers: [], // 경력사항
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
  trainerIntro: "",
  premiumUser: [
    {
      user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
      },
      premium: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "premium",
      },
    },
  ],
  // premium: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "premium",
  //   }
  // ],
  isConsulting: { //온라인상담 동의 여부
    type: Boolean,
    default: false,
  },
  privateLegalAggree: {
    type: Boolean,
    default: false,
  },
  returnReason: {
    type: String,
    default: "",
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