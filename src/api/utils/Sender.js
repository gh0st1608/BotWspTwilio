const { Console } = require('winston/lib/winston/transports');
const { TWILIO } = require('../../config/vars');
const client = require('twilio')(TWILIO.ACCOUNT_SID_TWILIO, TWILIO.AUTH_TOKEN_TWILIO);
const templateReponses = require('../utils/template-responses');
const urlVideo = 'https://i.giphy.com/media/ROvblJ07u41GXYpWOe/giphy.mp4';

const renderBadge = require('../utils/renderBadge');
class Sender {
  constructor({ phoneNumber }) {
    if (phoneNumber[0] !== '+') phoneNumber = '+' + phoneNumber;
    this.phoneNumber = 'whatsapp:' + phoneNumber;
  }
  async sendMessage(messages) {
    for (let message of messages) {
      if (message.type == 'TEXT') {
        await this.sendText({ textMessage: message.text });
      } else if (message.type == 'MULTIMEDIA') {
        await this.sendMultimedia({ textMessage: message.text, multimedia: message.multimedia });
      }
    }
  }
  async sendText({ textMessage }) {
    console.log('SENding', textMessage);
    const message = await client.messages.create({
      from: TWILIO.FROM_NUMBER,
      body: textMessage,
      to: this.phoneNumber,
    });
    return message;
  }
  async sendMultimedia({ textMessage, multimedia }) {
    const message = await client.messages.create({
      from: TWILIO.FROM_NUMBER,
      body: textMessage,
      to: this.phoneNumber,
      mediaUrl: multimedia,
    });
  }
  async sendLocation({ toNumber, name, dist, lat, lon }) {
    loc = 'geo:' + lat + ',' + lon;
    msg = name + ' a ' + dist.toFixed(2) + ' km';
    console.log(loc);
    client.messages
      .create({
        from: TWILIO.FROM_NUMBER,
        persistentAction: [loc],
        body: msg,
        to: toNumber,
      })
      .then((message) => {
        console.log(message.sid);
      });
  }
  async initialMessage() {
    const messages = [{ type: 'TEXT', text: templateReponses.WELCOME_MESSAGE }];
    await this.sendMessage(messages);
  }
  async sendMenu() {
    const messages = [{ type: 'TEXT', text: templateReponses.MENU }];
    await this.sendMessage(messages);
  }

  async sendFaqMenu() {
    const messages = [{ type: 'TEXT', text: templateReponses.C1_FAQ_MENU }];
    await this.sendMessage(messages);
  }

  async sendFaqOption(option) {
    const messages = [{ type: 'TEXT', text: templateReponses.C1_FAQ[option - 1] }];
    await this.sendMessage(messages);
  }

  async returningToMenu() {
    const messages = [{ type: 'TEXT', text: templateReponses.RETURNING_MENU }];
    await this.sendMessage(messages);
  }
  async termsAndConditions() {
    const messages = [{ type: 'TEXT', text: templateReponses.A1_TERMS_CONDITIONS }];
    await this.sendMessage(messages);
  }
  async sendWarning() {
    const messages = [{ type: 'TEXT', text: templateReponses.A2_WARNING }];
    await this.sendMessage(messages);
  }
  async askDocumentType(type) {
    const messages = [{ type: 'TEXT', text: templateReponses.A3_DOCUMENT_TYPE[type] }];
    await this.sendMessage(messages);
  }

  async askDateOfBirth() {
    const messages = [{ type: 'TEXT', text: templateReponses.A4_DATES.DATE_OF_BIRTH }];
    await this.sendMessage(messages);
  }

  async askDNIIssueDate() {
    const messages = [{ type: 'TEXT', text: templateReponses.A4_DATES.ISSUE_DATE }];
    await this.sendMessage(messages);
  }

  async askVerificationDigit() {
    const messages = [{ type: 'TEXT', text: templateReponses.A5_VERIFICATION_DIGIT }];
    await this.sendMessage(messages);
  }

  async askName() {
    const messages = [{ type: 'TEXT', text: templateReponses.A31_PERSONAL_INFO.QUESTION_NAME }];
    await this.sendMessage(messages);
  }

  async askLastName() {
    const messages = [
      { type: 'TEXT', text: templateReponses.A31_PERSONAL_INFO.QUESTION_LAST_NAME },
    ];
    await this.sendMessage(messages);
  }

  async askGender() {
    const messages = [{ type: 'TEXT', text: templateReponses.A31_PERSONAL_INFO.QUESTION_GENDER }];
    await this.sendMessage(messages);
  }

  async askCountryOfOrigin() {
    const messages = [
      { type: 'TEXT', text: templateReponses.A31_PERSONAL_INFO.QUESTION_COUNTRY_OF_ORIGIN },
    ];
    await this.sendMessage(messages);
  }

  async sendWaitForValidation() {
    const messages = [{ type: 'TEXT', text: templateReponses.A_WAIT_FOR_MINSA_VALIDATION }];
    await this.sendMessage(messages);
  }

  async minsaValidation(status) {
    if (status === 'OK') {
      const messages = [{ type: 'TEXT', text: templateReponses.A_MINSA_ANSWER.OK }];
      await this.sendMessage(messages);
    } else {
      const messages = [{ type: 'TEXT', text: templateReponses.A_MINSA_ANSWER.ERROR }];
      await this.sendMessage(messages);
    }
  }

  async minsaSendInfoUser(response) {
    console.log('entro');
    console.log(response);
    const strUserInfo =
      `Su nombre es: \n` +
      response.firstName +
      `\n` +
      `y sus apellidos son:\n` +
      response.firstSurname +
      ' ' +
      response.secondSurname;
    const messages = [{ type: 'TEXT', text: strUserInfo }];
    await this.sendMessage(messages);
  }

  async askPersonalAddress() {
    const messages = [{ type: 'TEXT', text: templateReponses.A7_PERSONAL_ADDRESS }];
    await this.sendMessage(messages);
  }

  async sendMenuDiagnosis() {
    const messages = [{ type: 'TEXT', text: templateReponses.A8_MENU_DIAGNOSIS }];
    await this.sendMessage(messages);
  }

  async askTestDate() {
    const messages = [{ type: 'TEXT', text: templateReponses.A4_DATES.TEST_DATE }];
    await this.sendMessage(messages);
  }

  async askSymptomsDate() {
    const messages = [{ type: 'TEXT', text: templateReponses.A4_DATES.SYMPTOMS_DATE }];
    await this.sendMessage(messages);
  }

  async askComorbidities() {
    const messages = [
      { type: 'TEXT', text: templateReponses.A9_COMORBILIDADES.QUESTION_COMMORBIDITIES },
    ];
    await this.sendMessage(messages);
  }

  async askComorbiditiesAdditional() {
    const messages = [
      { type: 'TEXT', text: templateReponses.A9_COMORBILIDADES.QUESTION_COMMORBIDITIES_ADD },
    ];
    await this.sendMessage(messages);
  }

  async askMobilization() {
    const messages = [{ type: 'TEXT', text: templateReponses.A10_MOVILIZACION }];
    console.log('MOBI', messages);
    await this.sendMessage(messages);
  }

  async askContactPhone() {
    const messages = [{ type: 'TEXT', text: templateReponses.A11_CONTACT.CONTACT_TEL }];
    await this.sendMessage(messages);
  }

  async askContactEmail() {
    const messages = [{ type: 'TEXT', text: templateReponses.A11_CONTACT.CONTACT_EMAIL }];
    await this.sendMessage(messages);
  }

  async askLocalization() {
    const messages = [{ type: 'TEXT', text: templateReponses.A12_LOCALIZATION }];
    await this.sendMessage(messages);
  }

  async sendTutorialLocalization() {
    const messages = [
      { type: 'MULTIMEDIA', multimedia: [urlVideo] },
      { type: 'TEXT', text: 'Video de ayuda' },
    ];
    await this.sendMessage(messages);
  }

  async sendWaitVaccinationCenter() {
    const messages = [
      { type: 'TEXT', text: templateReponses.A13_VACCINATION.waitVaccinationCenter },
    ];
    await this.sendMessage(messages);
  }

  async sendLocationClosest(closestPoints, option) {
    let strVaccineCenterTotal = '';
    try {
      if (option != '') {
        const locationDetail =
          `*Nombre*: ` +
          closestPoints[option - 1].EstNombre +
          `\n*Provincia*: ` +
          closestPoints[option - 1].Provincia +
          `\n*Distrito*: ` +
          closestPoints[option - 1].Distrito +
          `\n*Ruc*: ` +
          closestPoints[option - 1].Ruc +
          `\n*Dirección*: ` +
          closestPoints[option - 1].Direccion.trimEnd();
        const messages = [
          { type: 'TEXT', text: `Detalle del centro de vacunación: \n` + locationDetail },
        ];

        await this.sendMessage(messages);
      } else {
        console.log('entro al else');
        for (var i = 0; i < 5; i++) {
          var strVaccineCenter = `${i + 1}` + `) ` + closestPoints[i].EstNombre + `\n`;
          strVaccineCenterTotal = strVaccineCenterTotal + strVaccineCenter;
        }
        const messages = [
          { type: 'TEXT', text: `Centros de vacunacion cercanas: \n` + strVaccineCenterTotal },
        ];
        await this.sendMessage(messages);
      }
    } catch (err) {
      console.log(err);
    }
  }

  async sendHelpVaccinationCenter() {
    const messages = [
      { type: 'TEXT', text: templateReponses.A13_VACCINATION.helpVaccinationCenter },
    ];
    await this.sendMessage(messages);
  }

  async sendGracias() {
    const messages = [{ type: 'TEXT', text: templateReponses.A14_GRACIAS }];
    await this.sendMessage(messages);
  }

  async sendErrorInput() {
    const messages = [{ type: 'TEXT', text: templateReponses.INPUT_ERROR }];
    await this.sendMessage(messages);
  }
  async sendMultipleChoiceError(type) {
    const messages = [{ type: 'TEXT', text: '' }];
    let options = '';
    if (type === 'MENU' || type === 'DOC_TYPE') {
      options = 'A, B, C';
    }
    messages[0].text = templateReponses.MULTIPLE_CHOICE_ERROR(options);
    console.log('OPTIONS', messages);
    await this.sendMessage(messages);
  }
  async sendFAQ() {
    const messages = templateReponses.C1_FAQ.map((e) => ({
      type: 'TEXT',
      text: e,
    }));
    await this.sendMessage(messages);
  }
  async sendBadge(badgeLevel, name) {
    console.log('[sendBadge]', badgeLevel, name);
    const urlBadge = await renderBadge(badgeLevel, name);
    const messages = [
      { type: 'MULTIMEDIA', text: 'Recibiste tu insignia!', multimedia: [urlBadge] },
    ];
    await this.sendMessage(messages);
  }
}

module.exports = Sender;
