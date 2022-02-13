const config = require('./config');
const gs1 = require('./gs1.js');
const checksum = require('./checksum');
const express = require('express');
const Logger = require('./logger');
const app = express();
const EventEmitter = require('events');
const logger = new Logger();

app.use(express.json()); //enable json parsing in request body   

//get - /reloadConfig
app.get(`${config.api.basePath}/reloadConfig`,(req,res)=>{
    $err = config.reloadGS1Config()
    if($err) res.status(500).send($err)
    else{res.status(200).send("config reloaded")}
});

//get - /parse
app.get(`${config.api.basePath}/parse`,(req,res)=>{
    if(!req.query.data) return res.status(400).send('query param "data" required')
    res.send(gs1.parse(req.query.data,req.query.fnc1))
});

//get - /validateCheckDigit
app.get(`${config.api.basePath}/validateCheckDigit`,(req,res)=>{
    if(!req.query.key) return res.status(400).send('query param "key" required')
    if(checksum.isValid(req.query.key)) res.send('true')
    else res.send('false')
})

//get - /addCheckDigit
app.get(`${config.api.basePath}/addCheckDigit`,(req,res)=>{
    if(!req.query.key) return res.status(400).send('query param "key" required')
   res.send(checksum.addCheckDigit(req.query.key))
})

//get - /generateSSCC
app.get(`${config.api.basePath}/generateSSCC`,(req,res)=>{
   res.send(gs1.generateSSCC(req.name))
})

//start listening
app.listen(config.api.port,()=> console.log('listening on port: '+config.api.port));