const Joi = require('joi');
const dayjs = require('dayjs');
const customParseFormat = require('dayjs/plugin/customParseFormat');
dayjs.extend(customParseFormat);

const JOI_DNI = Joi.string()
  .trim()
  .length(8)
  .required()
  .regex(/^[0-9]+$/);

const JOI_CE = Joi.string()
  .trim()
  .length(9)
  .required()
  .regex(/^[0-9]+$/);

const regexFecha = new RegExp(
  /^([0-9]{1,2})[\/\.\-]{0,1}([0-9]{1,2})[\/\.\-]{0,1}((19|20)[0-9]{2})$/,
);
const JOI_FECHA = Joi.string().trim().regex(regexFecha);
const JOI_DIGIT = Joi.string().regex(/^[0-9]$/);
const JOI_COMORBIDITIES = Joi.string().regex(/^[A-I]{1,8}$/);
const JOI_Y_OR_N = Joi.string().valid('A', 'B');
const JOI_EMAIL = Joi.string().email({ minDomainSegments: 2 });
const JOI_MOBILE_PHONE = Joi.string().trim().regex(/^[0-9]{6,11}$/);
const JOI_NAMES = Joi.string();
const JOI_DIGIT_FAQ = Joi.string().regex(/^[0-9]{1,2}$/);

const DNI = (payload) => {
  const { error, value } = JOI_DNI.validate(payload);
  if (error) {
    throw new Error();
  }
  return value;
};

const CE = (payload) => {
  const { error, value } = JOI_CE.validate(payload);
  if (error) {
    throw new Error();
  }
  return value;
};


const NAMES = (payload) => {
  const { error, value } = JOI_NAMES.validate(payload);
  if (error) {
    throw new Error();
  }
  return value;
};

const DATE = (payload) => {
  console.log('PAYLOAD', payload);
  const { error, value } = JOI_FECHA.validate(payload);
  if (error) {
    console.error('ERROR', error);
    throw new Error();
  }
  let [day, month, year] = value.match(regexFecha).slice(1, 4);
  day = day.padStart(2, '0');
  month = month.padStart(2, '0');
  const date = `${day}/${month}/${year}`;
  console.log('DATE parsed', date);
  if (dayjs(date, 'DD/MM/YYYY', true).isValid()) {
    return date;
  }
  throw new Error();
};
const DIGIT = (payload) => {
  const { error, value } = JOI_DIGIT.validate(payload);
  if (error) {
    throw new Error();
  }
  return value;
};

const DIGIT_FAQ = (payload) => {
  const { error, value } = JOI_DIGIT_FAQ.validate(payload);
  if (error) {
    throw new Error();
  }
  return value;
};

const COMORBIDITIES = (payload) => {
  const { error, value } = JOI_COMORBIDITIES.validate(payload);
  if (error) {
    throw new Error();
  }
  return value;
};
const Y_OR_N = (payload) => {
  const { error, value } = JOI_Y_OR_N.validate(payload);
  if (error) {
    throw new Error();
  }
  return value;
};

const M_OR_F = (payload) => {
  const { error, value } = JOI_Y_OR_N.validate(payload);
  if (error) {
    throw new Error();
  }
  return value;
};

const EMAIL = (payload) => {
  if(payload == 'ninguno'){
    return payload
  }
  const { error, value } = JOI_EMAIL.validate(payload);
  if (error) {
    throw new Error();
  }
  return value;
}

const MOBILE_PHONE = (payload) => {
  const { error, value } = JOI_MOBILE_PHONE.validate(payload);
  if (error) {
    throw new Error();
  }
  return value;
}

module.exports = {
  DNI,
  CE,
  NAMES,
  DATE,
  DIGIT,
  DIGIT_FAQ,
  COMORBIDITIES,
  Y_OR_N,
  M_OR_F,
  EMAIL,
  MOBILE_PHONE,
};
