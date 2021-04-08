const STATE_MESSAGES = {
  MENU: async (sender) => {
    await sender.sendMenu();
  },
  A_TYC: async (sender) => {
    await sender.termsAndConditions();
  },
  A_DOCU_TYPE: async(sender)=>{
    await sender.sendWarning();
  },
  A_DNI: async(sender)=>{
    await sender.askDocumentType('DNI');
  },
  A_DNI_DATE_OF_BIRTH: async(sender)=>{
    await sender.askDateOfBirth();
  },
  A_DNI_ISSUE_DATE: async(sender)=>{
    await sender.askDNIIssueDate();
  },
  A_VERIFICATION_DIGIT: async(sender)=>{
    await sender.askVerificationDigit();
  },
  FIRST_NAME: async(sender)=>{
    await sender.askName();
  },
  LAST_NAME: async(sender)=>{
    await sender.askLastName();
  },
  GENDER: async(sender)=>{
    await sender.askGender();
  },
  DATE_OF_BIRTH: async(sender)=>{
    await sender.askDateOfBirth();
  },
  COUNTRY_OF_ORIGIN: async(sender)=>{
    await sender.askPersonalAddress();
  },
  PERSONAL_ADDRESS: async(sender)=>{
    await sender.askCountryOfOrigin();
  },
  MENU_DIAGNOSIS: async(sender)=>{
    await sender.sendMenuDiagnosis();
  },
  TEST_DATE: async(sender)=>{
    await sender.askTestDate();
  },
  SYMPTOMS_DATE: async(sender)=>{
    await sender.askSymptomsDate();
  },
  COMORBIDITIES: async(sender)=>{
    await sender.askComorbidities();
  },
  MOBILIZATION: async(sender)=>{
    await sender.askMobilization();
  },
  CONTACT_PHONE:async(sender)=>{
    await sender.askContactPhone();
  },
  CONTACT_EMAIL: async(sender)=>{
    await sender.askContactEmail();
  },
  LOCALIZATION: async(sender)=>{
    await sender.askLocalization();
  },
};


const STATES = {
  INITIAL_MESSAGE: 'INITIAL_MESSAGE',
  MENU: 'MENU',
  FAQ: 'FAQ',
  A_TYC: 'A_TYC',
  A_DOCU_TYPE: 'A_DOCU_TYPE',
  A_DNI: 'A_DNI',
  A_DNI_DATE_OF_BIRTH: 'A_DNI_DATE_OF_BIRTH',
  A_DNI_ISSUE_DATE: 'A_DNI_ISSUE_DATE',
  A_VERIFICATION_DIGIT: 'A_VERIFICATION_DIGIT',
  B_CE: 'B_CE',
  C_OTHER: 'C_OTHER',
  FIRST_NAME: 'FIRST_NAME',
  LAST_NAME: 'LAST_NAME',
  GENDER: 'GENDER',
  DATE_OF_BIRTH: 'DATE_OF_BIRTH',
  COUNTRY_OF_ORIGIN: 'COUNTRY_OF_ORIGIN',
  PERSONAL_ADDRESS: 'PERSONAL_ADDRESS',
  MENU_DIAGNOSIS: 'MENU_DIAGNOSIS',
  TEST_DATE: 'TEST_DATE',
  SYMPTOMS_DATE: 'SYMPTOMS_DATE',
  COMORBIDITIES: 'COMORBIDITIES',
  COMORBIDITIES_ADDITIONAL: 'COMORBIDITIES_ADDITIONAL',
  MOBILIZATION: 'MOBILIZATION',
  CONTACT_PHONE: 'CONTACT_PHONE',
  CONTACT_EMAIL: 'CONTACT_EMAIL',
  LOCALIZATION : 'LOCALIZATION',
  LOCALIZATION_2 : 'LOCALIZATION_2',
  VACCINATION_CENTER: 'VACCINATION_CENTER',
  VACCINATION_CENTER_2: 'VACCINATION_CENTER_2',
};
const GRAPH = {
  INITIAL_MESSAGE: {
    next: ['MENU'],
    back: null,
  },
  MENU: {
    next: ['A', 'B', 'C'],
    back: 'MENU',
  },
  FAQ: {
    next: ['FAQ'],
    back: 'MENU',
  },
  A_TYC: {
    next: ['A_DOCU_TYPE'],
    back: 'MENU',
  },
  A_DOCU_TYPE: {
    next: ['A_DNI', 'B_CE', 'C_OTHER'],
    back: 'A_TYC',
  },
  A_DNI: {
    next: ['A_DNI_DATE_OF_BIRTH'],
    back: 'A_DOCU_TYPE',
  },
  A_DNI_DATE_OF_BIRTH: {
    next: ['A_DNI_ISSUE_DATE'],
    back: 'A_DNI',
  },
  A_DNI_ISSUE_DATE: {
    next: ['A_VERIFICATION_DIGIT'],
    back: 'A_DNI_DATE_OF_BIRTH',
  },
  A_VERIFICATION_DIGIT:{
    next: ['PERSONAL_ADDRESS'],
    back: 'A_DNI_ISSUE_DATE',
  },
  B_CE: {
    next: ['FIRST_NAME'],
    back: 'A_DOCU_TYPE',
  },
  C_OTHER: {
    next: ['FIRST_NAME'],
    back: 'A_DOCU_TYPE',
  },
  FIRST_NAME: {
    next: ['LAST_NAME'],
    back: 'A_DOCU_TYPE',
  },
  LAST_NAME: {
    next: ['GENDER'],
    back: 'FIRST_NAME',
  },
  GENDER: {
    next: ['DATE_OF_BIRTH'],
    back: 'LAST_NAME',
  },
  DATE_OF_BIRTH: {
    next: ['COUNTRY_OF_ORIGIN'],
    back: 'GENDER',
  },
  COUNTRY_OF_ORIGIN: {
    next: ['PERSONAL_ADDRESS'],
    back: 'DATE_OF_BIRTH',
  },
  PERSONAL_ADDRESS: {
    next: ['MENU_DIAGNOSIS'],
    back: 'COUNTRY_OF_ORIGIN',
  },
  MENU_DIAGNOSIS: {
    next: ['TEST_DATE', 'SYMPTOMS_DATE', 'COMORBIDITIES'],
    back: 'PERSONAL_ADDRESS',
  },
  TEST_DATE: {
    next: ['COMORBIDITIES'],
    back: 'MENU_DIAGNOSIS',
  },
  SYMPTOMS_DATE: {
    next: ['COMORBIDITIES'],
    back: 'MENU_DIAGNOSIS',
  },
  COMORBIDITIES: {
    next: ['COMORBIDITIES_ADDITIONAL','MOBILIZATION'],
    back: 'MENU_DIAGNOSIS',
  },
  COMORBIDITIES_ADDITIONAL: {
    next: ['MOBILIZATION'],
    back: 'MENU_DIAGNOSIS',
  },
  MOBILIZATION: {
    next: ['CONTACT_PHONE'],
    back: 'COMORBIDITIES',
  },
  CONTACT_PHONE: {
    next: ['CONTACT_EMAIL'],
    back: 'MOBILIZATION',
  },
  CONTACT_EMAIL: {
    next: ['LOCALIZATION'],
    back: 'CONTACT_PHONE',
  },
  LOCALIZATION: {
    next: ['VACCINATION_CENTER'],
    back: 'CONTACT_EMAIL',
  },
  LOCALIZATION_2 :{
    next: ['VACCINATION_CENTER_2'],
    back: 'MENU',
  },
  VACCINATION_CENTER: {
    next: ['MENU'],
    back: 'LOCALIZATION',
  },
  VACCINATION_CENTER_2: {
    next: ['MENU'],
    back: 'LOCALIZATION_2',
  },
};

const next = (state, newState) => {
  if (GRAPH[state].next.length == 1) {
    return { node: GRAPH[GRAPH[state].next[0]], name: GRAPH[state].next[0] };
  } else {
    return { node: GRAPH[newState], name: newState };
  }
};

const back = (state) => {
  return { node: GRAPH[GRAPH[state].back], name: GRAPH[state].back };
};

module.exports = { GRAPH, STATES, next, back, STATE_MESSAGES };
