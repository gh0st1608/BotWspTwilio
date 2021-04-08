const userServices = require('../services/user.services');

exports.handleRequest = async (req, res, next) => {
  const { body } = req.body;
  try {
    const { response } = await userServices.addUser(objUserTest.body);
    res.json({ success: true, ...response });
  } catch (err) {
    next(err);
  }
};
