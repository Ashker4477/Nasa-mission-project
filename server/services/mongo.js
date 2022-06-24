const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/nasa-project'

mongoose.connection.once('open', ()=>{
    console.log(`DB Connection Ready`);
});

mongoose.connection.once('error', (err)=>{
    console.error(err);
});

async function mongoConnect (){
    await mongoose.connect(MONGO_URL)
}

async function mongoDisConnect (){
    await mongoose.disconnect()
}

module.exports = {
    mongoConnect,
    mongoDisConnect
}