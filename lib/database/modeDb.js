const { Sequelize, DataTypes } = require('sequelize');
const config = require('../../config');

const sequelize = new Sequelize(config.DATABASE_URL);

const Mode = sequelize.define('mode', {
  isPrivate: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // Assume the default mode is private 
    allowNull: false,
  },
}, {
  timestamps: true,
});

async function getMode() {
  let mode = await Mode.findOne();
  if (!mode) {
    mode = await Mode.create({ isPrivate: true }); // Default to private if no mode record exists
  }
  return mode;
}

async function updateMode(isPrivate) {
  let mode = await getMode();
  mode.isPrivate = isPrivate;
  await mode.save();
  return mode;
}

module.exports = {
  Mode,
  getMode,
  updateMode,
};