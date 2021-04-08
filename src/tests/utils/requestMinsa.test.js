const requestMinsa = require('../../api/utils/requestMinsa');

const run = async () => {
  try {
    const docType = 1;
    const numberDoc = '73356945';
    const dateOfBirth = '21/12/1993';
    const issueDate = '31/12/2010';
    const verificationNumber = '5';
    const response = await requestMinsa({
      docType,
      numberDoc,
      dateOfBirth,
      issueDate,
      verificationNumber,
    });
    console.log(response);
  } catch (err) {
    console.error(err);
  }
};
run();
