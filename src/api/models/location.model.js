const db = require('../../config/firebase');

class Location {
  static async getVaccinationPoints() {
    try {
      const snapshot = await db.ref('/vaccinationPoints').get();
      if (snapshot.exists()) {
        const vaccinationPoints = snapshot.val();
        return vaccinationPoints;
      } else {
        return {};
      }
    } catch (err) {
      console.error(`Error getting vaccinationPoints`, err);
      return null;
    }
  }
  static async setVaccinationPoint(payload) {
    console.log('INSERTING ID', payload.IdEstablecimiento);
    const ref = db.ref('/vaccinationPoints/' + payload.IdEstablecimiento);
    return ref
      .set(payload)
      .then(() => {
        return ref.once('value');
      })
      .then((snapshot) => {
        const vaccinationPoint = snapshot.val();
        return vaccinationPoint;
      });
  }
  static async deleteVaccinationPoint(IdEstablecimiento) {
    const ref = db.ref('/vaccinationPoints/' + IdEstablecimiento);
    return ref.remove();
  }
  static calcDistance(lat1, lon1, lat2, lon2, unit) {
    const radlat1 = (Math.PI * lat1) / 180;
    const radlat2 = (Math.PI * lat2) / 180;
    const theta = lon1 - lon2;
    const radtheta = (Math.PI * theta) / 180;
    let dist =
      Math.sin(radlat1) * Math.sin(radlat2) +
      Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);

    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    if (unit == 'K') {
      dist = dist * 1.609344;
    }
    if (unit == 'N') {
      dist = dist * 0.8684;
    }
    return dist;
  }
  static async getNClosestsToVaccineCenter(secondPoint, N) {
    try {
      console.log('CALCULATING', secondPoint, N);
      const points = await Location.getVaccinationPoints();
      console.log('POINTS', typeof points);
      const distances = [];
      for (let i in points) {
        let distance = Location.calcDistance(
          points[i].Latitud,
          points[i].Longitud,
          secondPoint.lat,
          secondPoint.lng,
        );
        distances.push({ i, distance });
      }
      console.log(distances.slice(0,5))
      distances.sort((a, b) => {
        return a.distance - b.distance;
      });
      console.log(distances.slice(0,5))
      const closestPoints = distances.map((e) => points[e.i]).slice(0, N);
      console.log("ga?", closestPoints)
      return closestPoints;
    } catch (err) {
      console.error(err);
      return [];
    }
  }
}

module.exports = Location;
