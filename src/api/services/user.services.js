const User = require('../models/user.model');
const ResponseTwilio = require('../models/response.model');

exports.addUser = async (User) => {
  const isValid = User.validateUser(User);
  if (isValid) {
    User.addUser();
    ResponseTwilio.sendmsg();
  } else {
    ResponseTwilio.sendmsg({ number, invalid });
  }
};
