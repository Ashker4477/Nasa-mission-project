const http = require('http');
const dotenv = require('dotenv');

dotenv.config();

const app = require('./app');
const { loadPlanetsData } = require('./models/planetsModel/planets.model');
const { mongoConnect } = require('./services/mongo');
const { loadLaunchData } = require('./models/launchesModel/launches.model');

const PORT = process.env.PORT || 8000;

async function startServer () {
    await mongoConnect();
    await loadPlanetsData();
    await loadLaunchData();
    
    http.createServer(app).listen(PORT, ()=> console.log(`Server is running on ${PORT}`))
}

startServer();