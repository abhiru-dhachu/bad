const { Sequelize, DataTypes } = require('sequelize');
const config = require('../../config');


const Mode = config.DATABASE.define('mode', {
  IsPrivate: {
    type: DataTypes.BOOLEAN,
    defaultValue: true, // Assume the default mode is private 
    allowNull: false,
  },
});

async function getMode() {
  let mode = await Mode.findOne();
  if (!mode) {
    mode = await Mode.create({ isPrivate: true }); // Default to private if no mode record exists
  }
  return mode;
}

async function updateMode(value = true) {
  let mode = await Mode.create({ isPrivate: value });
  await mode.save();
  return mode;
}

module.exports = {
  Mode : Mode,
  getMode : getMode,
  updateMode : updateMode
};


