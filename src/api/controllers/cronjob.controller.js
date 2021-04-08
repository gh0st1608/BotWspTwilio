const cronjobServices = require('../services/cronjob.services');

exports.handleCron = async (req, res, next) => {
  try {
    await cronjobServices.saveVaccinationPoints();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
