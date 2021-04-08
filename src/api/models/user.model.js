const db = require('../../config/firebase');
const FLOW_GRAPH = require('../utils/FLOW_GRAPH');
const validateMinsa = require('../utils/requestMinsa');
const Location = require('./location.model');
const INITIAL_STATE = FLOW_GRAPH.STATES.INITIAL_MESSAGE;
class User {
  constructor({ state, phoneNumber, registeredPeople, profileName } = {}) {
    this.state = state;
    this.stateObject = FLOW_GRAPH.GRAPH[state];
    this.phoneNumber = phoneNumber;
    this.registeredPeople = registeredPeople;
    this.profileName = profileName;
  }

  static async getUser({ phoneNumber }) {
    try {
      const snapshot = await db.ref('/users/' + phoneNumber).get();
      if (snapshot.exists()) {
        const userValues = snapshot.val();
        return new User(userValues);
      } else {
        return null;
      }
    } catch (err) {
      console.error(`Error getting user`, err);
      return null;
    }
  }

  static async createUser({ phoneNumber, profileName }) {
    const ref = db.ref('/users/' + phoneNumber);
    return ref
      .set({
        state: INITIAL_STATE,
        phoneNumber: phoneNumber,
        profileName,
        registeredPeople: [],
        createdAt: new Date(),
      })
      .then(() => {
        return ref.once('value');
      })
      .then((snapshot) => {
        const userValues = snapshot.val();
        return new User(userValues);
      });
  }
  async changeState({ type, newState, force = false }) {
    if (force) {
      this.stateObject = FLOW_GRAPH.GRAPH[newState];
      this.state = newState;
    } else {
      if (type == 'NEXT') {
        const { node, name } = FLOW_GRAPH.next(this.state, newState);
        this.stateObject = node;
        this.state = name;
      } else {
        const { node, name } = FLOW_GRAPH.back(this.state);
        this.stateObject = node;
        this.state = name;
      }
    }
    const updates = {
      ['/users/' + this.phoneNumber + '/state']: this.state,
    };
    await db.ref().update(updates);
  }

  async createTemporalForm() {
    this.temporalForm = {};
    await db.ref().update({
      ['/users/' + this.phoneNumber + '/temporalForm']: {},
    });
  }

  async getTemporalForm() {
    const snapshot = await db.ref('/users/' + this.phoneNumber + '/temporalForm/').get();
    const temporalForm = snapshot.val();
    return temporalForm;
  }

  async saveValidTemporalForm() {
    const temporalForm = await this.getTemporalForm();
    const userListRef = db.ref('/users/' + this.phoneNumber + '/registeredPeople/');
    const newRegisteredPeople = userListRef.push();
    await newRegisteredPeople.set(temporalForm);
  }
  async getRegisteredPeople(){
    const snapshot = await db.ref('/users/' + this.phoneNumber + '/registeredPeople/').get();
    const registeredPeople = snapshot.val();
    return registeredPeople;
  }

  async updateTemporalForm(type, value) {
    await db.ref().update({
      ['/users/' + this.phoneNumber + '/temporalForm/' + type]: value,
    });
    this.temporalForm = await this.getTemporalForm();
  }

  async validateTempForm() {
    const tempForm = await this.getTemporalForm();
    console.log('VALIDATING TEMP FORM', tempForm);
    const responseMinsa = await validateMinsa({
      docType: tempForm.documentType === 'DNI' ? 1 : 0,
      documentNumber: tempForm.documentValue,
      dateOfBirth: tempForm.dateOfBirth,
      issueDate: tempForm.issueDate,
      verificationNumber: tempForm.verificationDigit,
    });
    return responseMinsa;
  }
  async calculateClosestsPoints() {
    const temporalForm = await this.getTemporalForm();
    console.log('TEMPORAL FORM', temporalForm);
    const secondPoint = {
      lat: temporalForm.latitude,
      lng: temporalForm.longitude,
    };
    const closestPoints = await Location.getNClosestsToVaccineCenter(secondPoint, 5);

    return closestPoints;
  }
  static async validateUser(dni, fecha_nacimiento, fecha_emision) {
    let blnVal1 = true;
    let blnVal2 = true;
    let blnVal3 = true;

    if (8 == dni.length) {
    } else {
      blnVal1 = false;
    }

    if (10 == fecha_nacimiento.length) {
    } else {
      blnVal2 = false;
    }

    if (10 == fecha_emision.length) {
    } else {
      blnVal3 = false;
    }

    blnVal = blnVal1 && blnVal2 && blnVal3;

    return blnVal; // true
  }
}

module.exports = User;
