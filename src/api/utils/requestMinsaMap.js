const axios = require('axios');
const _ = require('lodash')
const getPoints = async () => {
  try {
    const response = await axios.post(
      'https://gis.minsa.gob.pe/WebApiRep2/api/Establecimiento/ListarPuntosVacunacion',
      {
        CodDisa: 0,
        CodDist: '',
        CodDpto: '',
        CodProv: '',
      },
    );
    const { data } = response;
    return _.uniqBy(data.Data, 'IdEstablecimiento');
  } catch (err) {
    throw new Error('API_ERROR');
  }
};
const getPointDetail = async (IdEstablecimiento) => {
  try {
    const response = await axios.post(
      'https://gis.minsa.gob.pe/WebApiRep2/api/Establecimiento/ObtenerDetalleVacunacion',
      {
        IdEstablecimiento,
      },
    );
    const { data } = response;
    return data.Data;
  } catch (err) {
    throw new Error('API_ERROR');
  }
};
module.exports = {
  getPoints,
  getPointDetail,
};
