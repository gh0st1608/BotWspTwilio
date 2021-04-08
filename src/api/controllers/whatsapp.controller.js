const whatsappServices = require('../services/whatsapp.services');

exports.handleRequest = async (req, res, next) => {
  const { ProfileName: profileName, Body: body, From: from, MessageSid: messagesId, MediaContentType0: mediaContentType0, Longitude: longitude, Latitude: latitude } = req.body;
  var requestbody = req.body
  console.log(requestbody)
  try {
    console.log(`${profileName} ${body} ${from}`)
    await whatsappServices.processRequest({ profileName, body, from, messagesId, mediaContentType0, longitude, latitude });
    res.json({success: true})
  } catch (err) {
    next(err);
  }
};
