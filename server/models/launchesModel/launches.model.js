const launch = require("./launches.mongo");
const planets = require("../planetsModel/planets.mongo");
const axios = require("axios");

const DEFAULT_FLIGHT_NUMBER = 100;

const SPACEX_API_URL = 'https://api.spacexdata.com/v4/launches/query';

async function populateLaunches(){
  console.log('Downloading launch data...');

  const response = await axios.post(SPACEX_API_URL, {
    query : {},
    options : {
      pagination : false,
      populate : [
        {
          path: "rocket",
          select : {
            name : 1
          }
        },
        {
          path : "payloads",
          select: {
            "customers" : 1,
          }
        }
      ]
    }
  });

  if (response.status !== 200){
    console.error('Problem downloading launch data');
    throw new Error ('Launch data download failed');
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs ){
    const payloads = launchDoc['payloads'];
    const customers = payloads.flatMap((payload) => {
      return payload['customers'];
    });

    const launchData = {
      flightNumber: launchDoc['flight_number'],
      mission: launchDoc['name'],
      rocket: launchDoc['rocket']['name'],
      launchDate: launchDoc['date_local'],
      upcoming: launchDoc['upcoming'],
      success: launchDoc['success'],
      customers,
    }

    console.log(`${launchData.flightNumber} ${launchData.mission}`);

    saveLaunch(launchData);
  }
}

async function loadLaunchData() {
  const firstLaunch = await findLaunch({
    flightNumber: 1,
    rocket: 'Falcon 1',
    mission: 'FalconSat',
  });
  if (firstLaunch) {
    console.log('Launch data already loaded!');
  } else {
    await populateLaunches();
  }
}

async function findLaunch(filter) {
  return await launch.findOne(filter);
}

async function getAllLaunches() {
    return await launch.find({}, { '_id': 0, '__v': 0 });
}

async function getLatestFlightNumber() {
    const latestLaunch = await launch
      .findOne()
      .sort('-flightNumber');
  
    if (!latestLaunch) {
      return DEFAULT_FLIGHT_NUMBER;
    }
  
    return latestLaunch.flightNumber;
}

async function existsLaunchWithId(launchId) {
  return await findLaunch({
    flightNumber: launchId,
  });
}

async function saveLaunch(launch_mission) {
    await launch.findOneAndUpdate({
      flightNumber: launch_mission.flightNumber,
    }, launch_mission, {
      upsert: true,
    });
  }

async function scheduleNewLaunch(launch_mission) {
    const planet = await planets.findOne({
        keplerName: launch_mission.target,
      });
    
      if (!planet) {
        throw new Error('No matching planet found');
      }
    
      const newFlightNumber = await getLatestFlightNumber() + 1;
    
      const newLaunch = Object.assign(launch_mission, {
        success: true,
        upcoming: true,
        customers: ['Zero to Mastery', 'NASA'],
        flightNumber: newFlightNumber,
      });
    
      await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
  const aborted = await launch.updateOne({
    flightNumber: launchId,
  }, {
    upcoming: false,
    success: false,
  });

  return aborted.modifiedCount === 1;
}

module.exports = {
    getAllLaunches,
    scheduleNewLaunch,
    loadLaunchData,
    existsLaunchWithId,
    abortLaunchById,
}