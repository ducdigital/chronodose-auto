const fetch = require('node-fetch');
const open = require("open");

const zonesArgs = process.argv.slice(2);

const updatedCache = new Map();

const fetchData = async (zone = 75) => {
  const url = `https://vitemadose.gitlab.io/vitemadose/${zone}.json`;
  const data = await fetch(url);
  return data.json();
}

const findChronodose = (json) => {
  return json.centres_disponibles.filter(c => {
    const cdose = c.appointment_schedules.find(a => a.name === 'chronodose');
    return cdose.total > 0;
  });
};

const getChronodose = async (zones = [75, 92, 93, 94]) => {
  let foundDoses = [];
  for (let i = 0; i < zones.length; i++) {
    const zone = zones[i];
      const json = await fetchData(zone);
      const lastUpdated = json.last_updated;
      const found = findChronodose(json);
      
      foundDoses = foundDoses.concat(found);
      
      const previousUpdatedAt = updatedCache.get(zone);
      if (!previousUpdatedAt || new Date(lastUpdated) > new Date(previousUpdatedAt)) {
        found.forEach(foundCenter => {
          console.log(foundCenter.url);
          open(foundCenter.url);
        });
      }
 
      updatedCache.set(zone, lastUpdated);
  }
  console.log(updatedCache);
};

setInterval(() => {
  console.log(`Getting doses for zones: ${zonesArgs}`);
  getChronodose(zonesArgs);
}, 5000);

console.log('Usage: chronodose 75 92 93 94');
