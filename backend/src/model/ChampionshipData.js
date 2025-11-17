import mongoose from 'mongoose';

const championshipDataSchema = mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
      unique: true,
    },
    rounds: {
      type: Array,
      required: true,
    },
    fixtures: {
      type: Array,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ChampionshipData = mongoose.model('ChampionshipData', championshipDataSchema);

export default ChampionshipData;
