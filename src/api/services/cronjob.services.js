const Location = require('../models/location.model');
const { getPoints, getPointDetail } = require('../utils/requestMinsaMap');
const hash = require('object-hash');

const getPointsDetail = async (IdEstablecimiento) => {
  const pointDetail = await getPointDetail(IdEstablecimiento);
  if(pointDetail == null){
    return {}
  }
  return {
    EstNombre: pointDetail.EstNombre || null,
    Disa: pointDetail.Disa || null,
    Red: pointDetail.Red || null,
    Microred: pointDetail.Microred || null,
    Codunico: pointDetail.Codunico || null,
    Ruc: pointDetail.Ruc || null,
    Direccion: pointDetail.Direccion || null,
    Departamento: pointDetail.Departamento || null,
    Provincia: pointDetail.Provincia || null,
    Distrito: pointDetail.Distrito || null,
    CategoriaNivel1: pointDetail.CategoriaNivel1 || null,
    ClasificacionNivel1: pointDetail.ClasificacionNivel1 || null,
  };
};
const getPointData = (vaccinationPoint) => {
  return {
    IdEstablecimiento: vaccinationPoint.IdEstablecimiento,
    Latitud: vaccinationPoint.Latitud,
    Longitud: vaccinationPoint.Longitud,
  };
};
const getDifference = (newVaccinationPoints, vaccinationPoints) => {
  const insertPoints = [];
  const updatePoints = [];
  const pointsMap = new Map();
  const hashPointsMap = new Map();
  for (const key in vaccinationPoints) {
    const vP = getPointData(vaccinationPoints[key]);
    pointsMap.set(vP.IdEstablecimiento, vP);
    hashPointsMap.set(vP.IdEstablecimiento, hash(vP));
  }
  newVaccinationPoints = newVaccinationPoints.map(getPointData);
  for (const vP of newVaccinationPoints) {
    if (pointsMap.has(vP.IdEstablecimiento)) {
      const vPHash = hash(vP);
      if (vPHash !== hashPointsMap.get(vP.IdEstablecimiento)) {
        updatePoints.push(vP);
      }
      pointsMap.delete(vP.IdEstablecimiento);
      hashPointsMap.delete(vP.IdEstablecimiento);
    } else {
      insertPoints.push(vP);
    }
  }
  const deletePoints = Array.from(pointsMap.keys());
  return { insertPoints, updatePoints, deletePoints };
};
const saveVaccinationPoints = async () => {
  console.log('Init vaccination points');
  console.log('Retrieving points');
  console.time('gp');
  const newVaccinationPoints = await getPoints();

  console.log('Points retrieved');
  console.timeEnd('gp');
  const vaccinationPoints = await Location.getVaccinationPoints();
  //console.log('VACCINATION POINTS', vaccinationPoints);
  console.time('gdifference');
  console.log('Getting difference');
  let { insertPoints, updatePoints, deletePoints } = getDifference(
    newVaccinationPoints,
    vaccinationPoints,
  );
  const setPoints = [...insertPoints, ...updatePoints];
  
  const batchSize = 500;
  let promises = [];
  for (let i = 0; i < setPoints.length; i++) {
    console.log('i', i);
    promises.push(
      (async () => {
        const pointDetail = await getPointsDetail(setPoints[i].IdEstablecimiento);
        const newPoint = { ...setPoints[i], ...pointDetail };
        return await Location.setVaccinationPoint(newPoint);
      })(),
    );
    console.log('---', promises.length, batchSize);
    if (promises.length % batchSize == 0) {
      await Promise.all(promises);
      promises = [];
    }
  }
  if (promises.length) {
    await Promise.all(promises);
    promises = [];
  }
  for (let i = 0; i < deletePoints.length; i++) {
    await Location.deleteVaccinationPoint(deletePoints[i]);
  }
};
module.exports = {
  saveVaccinationPoints,
};
