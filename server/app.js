const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const express = require('express');
const api = require('./routers/api');

const app = express();

app.use(cors({
    origin: 'http://localhost:3000'
}));
app.use(morgan('combined'));

app.use(express.json());

app.use('/v1', api);

app.use(express.static(path.join(__dirname, "..", "client", "build")));

app.get('/*', (req, res)=>{
    res.sendFile(path.join(__dirname, "..", "client", "build", "index.html"));
})

module.exports = app;