const WELCOME_MESSAGE = require('./welcome');
const MENU = require('./menu');
const RETURNING_MENU = require('./returning-menu.js');
const INPUT_ERROR = require('./input-error');
const MULTIPLE_CHOICE_ERROR = require('./multiple-choice-error');
/* A */
const A1_TERMS_CONDITIONS = require('./A1.terms-conditions');
const A2_WARNING = require('./A2.warning');
const A3_DOCUMENT_TYPE = require('./A3.document-type');
const A31_PERSONAL_INFO = require('./A3.1.personal-info');
const A4_DATES = require('./A4.dates');
const A5_VERIFICATION_DIGIT = require('./A5.verification-digit');
const A6_CONFIRMATION = require('./A6.confirmation');
const A_WAIT_FOR_MINSA_VALIDATION = require('./A.wait-for-validation');
const A_MINSA_ANSWER = require('./A.minsa-answer');
const A7_PERSONAL_ADDRESS = require('./A7.personal-address');
const A8_MENU_DIAGNOSIS = require('./A8.menu-diagnosis');
const A9_COMORBILIDADES = require('./A9.comorbilidades');
const A10_MOVILIZACION = require('./A10.movilizacion');
const A11_CONTACT = require('./A11.contacto');
const A12_LOCALIZATION = require('./A12.localization');
const A13_VACCINATION = require('./A13.vaccination-center');
const A14_GRACIAS = require('./A14.gracias');

/* C */
const C1_FAQ = require('./C1.faq');
const C1_FAQ_MENU = require('./C1.faq-menu');

module.exports = {
  WELCOME_MESSAGE,
  MENU,
  RETURNING_MENU,
  INPUT_ERROR,
  MULTIPLE_CHOICE_ERROR,
  A1_TERMS_CONDITIONS,
  A2_WARNING,
  A3_DOCUMENT_TYPE,
  A31_PERSONAL_INFO,
  A4_DATES,
  A5_VERIFICATION_DIGIT,
  A6_CONFIRMATION,
  A_WAIT_FOR_MINSA_VALIDATION,
  A_MINSA_ANSWER,
  A7_PERSONAL_ADDRESS,
  A8_MENU_DIAGNOSIS,
  A9_COMORBILIDADES,
  A10_MOVILIZACION,
  A11_CONTACT,
  A12_LOCALIZATION,
  A13_VACCINATION,
  A14_GRACIAS,
  C1_FAQ,
  C1_FAQ_MENU,
};
