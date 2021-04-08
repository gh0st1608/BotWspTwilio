const User = require('../models/user.model');
const Sender = require('../utils/Sender');
const { STATES, STATE_MESSAGES } = require('../utils/FLOW_GRAPH');
const validators = require('../utils/validators');
const levelDetail = require('../utils/badgeLevel.constant');
const checkToSendBadge = (registeredPeople) => {
  for (let level in levelDetail) {
    if (String(registeredPeople) === levelDetail[level].number) {
      return level;
    }
  }
  return false;
};
const sleep = async (ms) => {
  return new Promise((res) => setTimeout(res, ms));
};

exports.processRequest = async ({
  profileName,
  body,
  from,
  messagesId,
  mediaContentType0,
  longitude,
  latitude,
}) => {
  const phoneNumber = from.split(':')[1].replace('+', '');
  const command = body.trim().toUpperCase();

  const sender = new Sender({ phoneNumber });
  let user = await User.getUser({ phoneNumber });
  if (!user) {
    console.log('Creating user');
    user = await User.createUser({ phoneNumber, profileName });
  }

  const state = user.state;

  if (state == STATES.INITIAL_MESSAGE) {
    await sender.initialMessage();
    await sleep(5000)
    await sender.sendMenu();
    await user.changeState({ type: 'NEXT', newState: 'MENU' });
  } else {
    if (command === 'REGRESAR') {
      await user.changeState({ type: 'BACK' });
      if (user.state in STATE_MESSAGES) {
        await STATE_MESSAGES[user.state](sender);
      } else {
        // Estado sin retorno
      }
      return;
    }
    if (command === 'MENU') {
      await user.changeState({ newState: 'MENU', force: true });
      await sender.returningToMenu();
      await STATE_MESSAGES.MENU(sender);
      return;
    }
    if (state == STATES.MENU) {
      if (command == 'A' || command == 'A)') {
        await sender.termsAndConditions();
        await user.changeState({ type: 'NEXT', newState: 'A_TYC' });
      } else if (command == 'B' || command == 'B)') {
        await sender.askLocalization();
        await user.changeState({ type: 'NEXT', newState: 'LOCALIZATION_2' });
      } else if (command == 'C' || command == 'C)') {
        await sender.sendFaqMenu();
        await user.changeState({ type: 'NEXT', newState: 'FAQ' });
      } else {
        console.log('MULTIPLE CHOICE?');
        await sender.sendMultipleChoiceError('MENU');
      }
    } else if (state == STATES.A_TYC) {
      if (command == 'SI') {
        await sender.sendWarning();
        await user.createTemporalForm();
        await user.changeState({ type: 'NEXT' });
      } else {
        await sender.sendMenu();
        await user.changeState({ type: 'BACK' });
      }
    } else if (state == STATES.FAQ) {
      try {
        if (command == 'MENU' || command == 'PREGUNTAS') {
          switch (command) {
            case 'MENU':
              await sender.sendMenu();
              await user.changeState({ type: 'BACK' });
              break;
            case 'PREGUNTAS':
              await sender.sendFaqMenu();
              break;
          }
        } else {
          const parsedInput = validators.DIGIT_FAQ(command);
          await sender.sendFaqOption(parsedInput);
        }
      } catch {
        await sender.sendErrorInput();
      }
    } else if (state == STATES.A_DOCU_TYPE) {
      if (command == 'A' || command == 'A)') {
        await sender.askDocumentType('DNI');
        user.updateTemporalForm('documentType', 'DNI');
        await user.changeState({ type: 'NEXT', newState: 'A_DNI' });
      } else if (command == 'B' || command == 'B)') {
        await sender.askDocumentType('CE');
        user.updateTemporalForm('documentType', 'CE');
        await user.changeState({ type: 'NEXT', newState: 'B_CE' });
      } else if (command == 'C' || command == 'C)') {
        await sender.askDocumentType('OTHER');
        user.updateTemporalForm('documentType', 'OTHER');
        await user.changeState({ type: 'NEXT', newState: 'C_OTHER' });
      } else {
        await sender.sendMultipleChoiceError('DOCU_TYPE');
      }
    } else if (state == STATES.A_DNI) {
      try {
        const parsedInput = validators.DNI(command);
        console.log('PARSED', parsedInput);
        user.updateTemporalForm('documentValue', parsedInput);
        await sender.askDateOfBirth();
        await user.changeState({ type: 'NEXT' });
      } catch (err) {
        await sender.sendErrorInput();
        await sender.askDocumentType('DNI');
      }
    } else if (state == STATES.A_DNI_DATE_OF_BIRTH) {
      try {
        const parsedInput = validators.DATE(command);
        await sender.askDNIIssueDate();
        await user.updateTemporalForm('dateOfBirth', parsedInput);
        await user.changeState({ type: 'NEXT' });
      } catch (err) {
        await sender.sendErrorInput();
        await sender.askDateOfBirth();
      }
    } else if (state == STATES.A_DNI_ISSUE_DATE) {
      try {
        const parsedInput = validators.DATE(command);
        await sender.askVerificationDigit();
        await user.updateTemporalForm('issueDate', parsedInput);
        await user.changeState({ type: 'NEXT' });
      } catch (err) {
        await sender.sendErrorInput();
        await sender.askDNIIssueDate();
      }
    } else if (state == STATES.A_VERIFICATION_DIGIT) {
      try {
        const parsedInput = validators.DIGIT(command);
        await sender.sendWaitForValidation();
        await user.updateTemporalForm('verificationDigit', parsedInput);
        /* MINSA VALIDATION*/
        try {
          const response = await user.validateTempForm();
          console.log('RESPONSE MINSA', response);
          await sender.minsaValidation('OK');
          await user.updateTemporalForm('validData', true);
          await user.updateTemporalForm('firstName', response.firstName);
          await user.updateTemporalForm('firstSurname', response.firstSurname);
          await user.updateTemporalForm('secondSurname', response.secondSurname);
          await sender.minsaSendInfoUser(response)
          await user.changeState({ type: 'NEXT' });
          await sender.askPersonalAddress();
        } catch (err) {
          /* Delete temporal form*/
          await sender.minsaValidation('ERROR');
          await user.changeState({ newState: 'MENU', force: true });
          await sender.returningToMenu();
          await STATE_MESSAGES.MENU(sender);
        }
      } catch (err) {
        await sender.sendErrorInput();
        await sender.askVerificationDigit();
      }
    } else if (state == STATES.B_CE) {
      try {
        const parsedInput = validators.CE(command);
        console.log('PARSED', parsedInput);
        user.updateTemporalForm('documentValue', parsedInput);
        await sender.askName();
        await user.changeState({ type: 'NEXT' });
      } catch (err) {
        await sender.sendErrorInput();
        await sender.askDocumentType('B_CE');
      }
    } else if (state == STATES.C_OTHER) {
      try {
        //const parsedInput = validators.DNI(command);
        //console.log('PARSED', parsedInput);
        user.updateTemporalForm('documentValue', command);
        await sender.askName();
        await user.changeState({ type: 'NEXT' });
      } catch (err) {
        await sender.sendErrorInput();
        await sender.askDocumentType('C_OTHER');
      }
    } else if (state == STATES.FIRST_NAME) {
      try {
        const parsedInput = validators.NAMES(command);
        console.log('PARSED', parsedInput);
        user.updateTemporalForm('Name', parsedInput);
        await sender.askLastName();
        await user.changeState({ type: 'NEXT' });
      } catch (err) {
        await sender.sendErrorInput();
        await sender.askName();
      }
    } else if (state == STATES.LAST_NAME) {
      try {
        const parsedInput = validators.NAMES(command);
        console.log('PARSED', parsedInput);
        user.updateTemporalForm('LastName', parsedInput);
        await sender.askGender();
        await user.changeState({ type: 'NEXT' });
      } catch (err) {
        await sender.sendErrorInput();
        await sender.askLastName();
      }
    } else if (state == STATES.GENDER) {
      try {
        const parsedInput = validators.M_OR_F(command);
        console.log('PARSED', parsedInput);
        user.updateTemporalForm('gender', parsedInput);
        await sender.askDateOfBirth();
        await user.changeState({ type: 'NEXT' });
      } catch (err) {
        await sender.sendErrorInput();
        await sender.askGender();
      }
    } else if (state == STATES.DATE_OF_BIRTH) {
      try {
        const parsedInput = validators.DATE(command);
        console.log('PARSED', parsedInput);
        user.updateTemporalForm('dateOfBirth', parsedInput);
        await sender.askCountryOfOrigin();
        await user.changeState({ type: 'NEXT' });
      } catch (err) {
        await sender.sendErrorInput();
        await sender.askDateOfBirth();
      }
    } else if (state == STATES.COUNTRY_OF_ORIGIN) {
      try {
        const parsedInput = validators.NAMES(command);
        console.log('PARSED', parsedInput);
        user.updateTemporalForm('CountryOfOrigin', parsedInput);
        await sender.askPersonalAddress();
        await user.changeState({ type: 'NEXT' });
      } catch (err) {
        await sender.sendErrorInput();
        await sender.askCountryOfOrigin();
      }
    } else if (state == STATES.PERSONAL_ADDRESS) {
      try {
        await user.updateTemporalForm('personalAddress', command);
        await user.changeState({ type: 'NEXT' });
        await sender.sendMenuDiagnosis();
      } catch (err) {
        await sender.sendErrorInput();
        await sender.askPersonalAddress();
      }
    } else if (state == STATES.MENU_DIAGNOSIS) {
      if (command == 'A' || command == 'A)') {
        await sender.askTestDate();
        await user.changeState({ type: 'NEXT', newState: 'TEST_DATE' });
      } else if (command == 'B' || command == 'B)') {
        await sender.askSymptomsDate();
        await user.changeState({ type: 'NEXT', newState: 'SYMPTOMS_DATE' });
      } else if (command == 'C' || command == 'C)') {
        await sender.askComorbidities();
        await user.changeState({ type: 'NEXT', newState: 'COMORBIDITIES' });
      } else {
        await sender.sendMenuDiagnosis();
      }
    } else if (state == STATES.TEST_DATE) {
      try {
        const parsedInput = validators.DATE(command);
        console.log('PARSED', parsedInput);
        user.updateTemporalForm('DateOfTest', parsedInput);
        await user.changeState({ type: 'NEXT' });
        await sender.askComorbidities();
      } catch (err) {
        await sender.sendErrorInput();
        await sender.askTestDate();
      }
    } else if (state == STATES.SYMPTOMS_DATE) {
      try {
        const parsedInput = validators.DATE(command);
        console.log('PARSED', parsedInput);
        user.updateTemporalForm('dateOfSymptoms', parsedInput);
        await user.changeState({ type: 'NEXT' });
        await sender.askComorbidities();
      } catch (err) {
        await sender.sendErrorInput();
        await sender.askSymptomsDate();
      }
    } else if (state == STATES.COMORBIDITIES) {
      try {
        if (command.indexOf('I') != -1) {
          await sender.askComorbiditiesAdditional();
          user.updateTemporalForm('comorbidities', command);
          await user.changeState({ type: 'NEXT', newState: 'COMORBIDITIES_ADDITIONAL' });
        } else {
          const parsedInput = validators.COMORBIDITIES(command);
          console.log('PARSED', parsedInput);
          user.updateTemporalForm('comorbidities', command);
          await sender.askMobilization();
          await user.changeState({ type: 'NEXT', newState: 'MOBILIZATION' });
        }
      } catch (err) {
        await sender.sendErrorInput();
        await sender.askComorbidities();
      }
    } else if (state == STATES.COMORBIDITIES_ADDITIONAL) {
      try {
        user.updateTemporalForm('comorbiditiesAdditional', command);
        await user.changeState({ type: 'NEXT' });
        await sender.askMobilization();
      } catch (err) {
        await sender.sendErrorInput();
        await sender.askComorbidities();
      }
    } else if (state == STATES.MOBILIZATION) {
      try {
        const parsedInput = validators.Y_OR_N(command);
        console.log('PARSED MOB', parsedInput);
        user.updateTemporalForm('mobilization', command);
        console.log('Asking contact phone');
        await sender.askContactPhone();
        await user.changeState({ type: 'NEXT' });
      } catch (err) {
        console.error(err);
        await sender.sendErrorInput();
        await sender.askMobilization();
      }
    } else if (state == STATES.CONTACT_PHONE) {
      try {
        const parsedInput = validators.MOBILE_PHONE(command);
        //const parsedInput = validators.HOME_PHONE(command);
        console.log('PARSED', parsedInput);
        user.updateTemporalForm('contactPhone', command);
        await sender.askContactEmail();
        await user.changeState({ type: 'NEXT' });
      } catch (err) {
        await sender.sendErrorInput();
        await sender.askContactPhone();
      }
    } else if (state == STATES.CONTACT_EMAIL) {
      try {
        if (command == 'NINGUNO') {
          user.updateTemporalForm('contactEmail', command);
          await sender.askLocalization();
          await user.changeState({ type: 'NEXT' });
        } else {
          const parsedInput = validators.EMAIL(command);
          console.log('PARSED', parsedInput);
          user.updateTemporalForm('contactEmail', command);
          await sender.askLocalization();
          await user.changeState({ type: 'NEXT' });
        }
      } catch (err) {
        await sender.sendErrorInput();
        await sender.askContactEmail();
      }
    } else if (state == STATES.LOCALIZATION) {
      try {
        console.log('entro antes del if de ayuda');
        if (command === 'AYUDA') {
          console.log('entro al if');
          await sender.sendTutorialLocalization();
          await sender.askLocalization();
        } else {
          //console.log('PARSED', parsedInput);
          await user.updateTemporalForm('latitude', latitude);
          await user.updateTemporalForm('longitude', longitude);
          const closestPoints = await user.calculateClosestsPoints();
          await sender.sendWaitVaccinationCenter();
          await sender.sendLocationClosest(closestPoints, '');
          await sender.sedHelpVaccinationCenter();
          await user.changeState({ type: 'NEXT' });
        }
      } catch (err) {
        await sender.sendErrorInput();
        await sender.askLocalization();
      } 
    } else if (state == STATES.LOCALIZATION_2) {
      try {
        console.log('entro antes del if de ayuda');
        if (command === 'AYUDA') {
          console.log('entro al if');
          await sender.sendTutorialLocalization();
          await sender.askLocalization();
        } else {
          //console.log('PARSED', parsedInput);
          if (latitude != '' || longitude != ''){
          await user.updateTemporalForm('latitude', latitude);
          await user.updateTemporalForm('longitude', longitude);
          const closestPoints = await user.calculateClosestsPoints();
          await sender.sendWaitVaccinationCenter();
          await sender.sendLocationClosest(closestPoints, '');
          await sender.sendHelpVaccinationCenter();
          await user.changeState({ type: 'NEXT' ,newState: 'VACCINATION_CENTER_2'});
          }else{
            await sender.askLocalization();
          }
        }
      } catch (err) {
        await sender.sendErrorInput();
        await sender.askLocalization();
      } 
    }else if (state == STATES.VACCINATION_CENTER) {
      try {
        const closestPoints = await user.calculateClosestsPoints();
        user.updateTemporalForm('particularCenter', command);
        await sender.sendLocationClosest(closestPoints, command);
        await user.changeState({ type: 'NEXT', newState: 'MENU' });
        await sleep(2000);
        await sender.sendGracias();
        
        await user.saveValidTemporalForm();
        const registeredPeopleCounter = await user.getRegisteredPeople();
        console.log('registeredPeopleCounter', registeredPeopleCounter);
        const badgeLevel = checkToSendBadge(Object.keys(registeredPeopleCounter).length);
        console.log('BADGE', badgeLevel);
        if (badgeLevel) {
          await sleep(2000);
          await sender.sendBadge(badgeLevel, user.profileName || 'Peruano X');
        }
      } catch (err) {
        console.error('error vaccination center', err);
        await sender.sendErrorInput();
        await sender.askLocalization();
      }
    } else if (state == STATES.VACCINATION_CENTER_2) {
      try {
        const closestPoints = await user.calculateClosestsPoints();
        user.updateTemporalForm('particularCenter', command);
        await sender.sendLocationClosest(closestPoints, command);
        await user.changeState({ type: 'NEXT', newState: 'MENU' });
        await sleep(2000);
        await sender.sendGracias();
        
        await user.saveValidTemporalForm();
        const registeredPeopleCounter = await user.getRegisteredPeople();
        console.log('registeredPeopleCounter', registeredPeopleCounter);
        const badgeLevel = checkToSendBadge(Object.keys(registeredPeopleCounter).length);
        console.log('BADGE', badgeLevel);
        if (badgeLevel) {
          await sleep(2000);
          await sender.sendBadge(badgeLevel, user.profileName || 'Peruano X');
        }
      } catch (err) {
        console.error('error vaccination center', err);
        await sender.sendErrorInput();
        await sender.askLocalization();
      }
    } 
  }
};
/*
        Response.writeResponse(objresponse)
        console.log(Response.getState())
        var state = await Response.getState();
        if(state == 0){
            console.log('entro a getstate 0')
            //Response.writeResponse(objresponse)

            if(Response.getLevel() == 1){
                objresponse.level = Response.getLevel() + 1;
                Response.writeResponse(objresponse)
                Sender.sendMsg('INGRESE DNI')
            }
    
            if(Response.getLevel() == 2){
                objresponse.level = Response.getLevel() + 1;
                Response.writeResponse(objresponse)
                Sender.sendMsg('INGRESE FECHA DE NACIMIENTO')
            }
    
            if(Response.getLevel() == 3){
                objresponse.level = Response.getLevel() + 1;
                Response.writeResponse(objresponse)
                Sender.sendMsg('INGRESE FECHA DE EMISION')
            }

        }

        if(Response.getState() == 1){
            console.log('entro al estado 1')

        }

        

                    
    }

    
    handleValidateTypeMsg(body,messagesid,mediacontenttype0);
    handleRegister(body);
    */
