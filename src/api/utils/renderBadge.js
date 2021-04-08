const Jimp = require('jimp');
const { v4: uuidv4 } = require('uuid');
const levelDetail = require('../utils/badgeLevel.constant');
const path = require('path')
const {uploadBadge} = require('../utils/s3-upload');
const clearName = (text)=>{
  return text.normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^\x00-\x7F]/g, '').trim();
}
const renderBadge = async (level, name) => {
  name = (clearName(name) || "Peruan@").substring(0,15);
  const selectedLevel = levelDetail[level];
  let picture = await Jimp.read(path.resolve(__dirname, `badges/${selectedLevel.filename}`));
  
  const font1 = await Jimp.loadFont(path.resolve(__dirname, `fonts/Nunito-ExtraBold.ttf.fnt`))
  const font2 = await Jimp.loadFont(path.resolve(__dirname, `fonts/Nunito-Black.ttf.fnt`))
  picture.print(
    font1,
    130,
    450,
    {
      text: name,
      alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: Jimp.VERTICAL_ALIGN_TOP,
    },
    750,
    500,
  );
  picture.print(font2, 640, 726, selectedLevel.number);
  const buffer = await picture.getBufferAsync(Jimp.MIME_JPEG);
  const filename = uuidv4();
  const upload = await uploadBadge({file: buffer, mimetype: 'image/jpeg', extension: '.jpeg', filename})
  return upload.Location
  
};
module.exports = renderBadge;