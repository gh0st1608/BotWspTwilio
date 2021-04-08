const axios = require('axios');
const jwt = require('jsonwebtoken');

const getUser = async ({ docType, documentNumber, dateOfBirth, issueDate, verificationNumber }) => {
  try {
    const response = await axios.post(
      'https://analitica.minsa.gob.pe/WebApiValidarDocumento/api/Login/ValidarDocumentoExterno',
      {
        TipDocumento: docType,
        NumDocumento: documentNumber,
        FecNacimiento: dateOfBirth,
        FecExpedicion: issueDate,
        DigVerificacion: verificationNumber,
      },
    );
    const objresponse = response.data;
    try {
      const { payload } = jwt.decode(objresponse.Token, {
        complete: true,
      });
      return {
        //payload
        firstName: payload.full_name,
        firstSurname: payload.fisrt_name,
        secondSurname: payload.last_name,
        documentNumber,
      };
    } catch (err) {
      throw new Error('INVALID_DATA');
    }
  } catch (err) {
    if (err.error && err.error === 'INVALID_DATA') {
      throw new Error('INVALID_DATA');
    }
    throw new Error('API_ERROR');
  }
};

module.exports = getUser;
