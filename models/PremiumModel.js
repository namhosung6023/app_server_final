const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PremiumSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  trainer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'trainer',
  },
  trainerComment: [
    {
      comment: {
        type: String,
        default: '',
      },
      date: {
        type: Date,
      },
      createdAt: {
        type: Date,
      },
    },
  ],
  checklist: [
    {
      workoutlist: [
        {
          name: {
            type: String,
            default: '',
          },
          contents: {
            type: String,
            default: '',
          },
          isEditable: {
            type: Boolean,
            default: false,
          },
          checkDate: {
            type: Date,
            default: '',
          },
        },
      ],
      dietlist: [
        {
          time: {
            type: Number,
            default: 0,
          },
          name: {
            type: String,
            default: '',
          },
          contents: {
            type: String,
            default: '',
          },
          isEditable: {
            type: Boolean,
            default: false,
          },
          checkDate: {
            type: Date,
            default: '',
          },
        },
      ],
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  bodyLog: [
    {
      morningBody: [],
      morningWeight: {
        type: Number,
        default: '',
      },
      nightBody: [],
      nightWeight: {
        type: Number,
        default: '',
      },
      morningFood: [],
      morningFoodTitle: {
        type: String,
        default: '',
      },
      afternoonFood: [],
      afternoonFoodTitle: {
        type: String,
        default: '',
      },
      nightFood: [],
      nightFoodTitle: {
        type: String,
        default: '',
      },
      snack: [],
      snackTitle: {
        type: String,
        default: '',
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('premium', PremiumSchema);
