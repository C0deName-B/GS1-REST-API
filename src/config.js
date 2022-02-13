const Joi = require('joi');
const fs = require('fs');
const path = require('path');
const Logger = require('./logger');
const { join } = require('path/posix');
const logger = new Logger();

var gs1 = null;
var api = null;
var keyGen = null;

//config files are in [project folder]\config. code is in [project folder]\src
//get parant folder path and set to config folder
const configDir = path.parse(__dirname).dir+"\\config"

function validateKeyGenConfig(config)
{
    let sscc = Joi.object().keys({
        name: Joi.string().required(),
        prefix: Joi.string().min(7).max(10).required(),
        extensionDigit: Joi.number().integer().less(10).required(),
        incrementExtDigit: Joi.boolean().required(),
        serialStartValue: Joi.string().min(6).max(9).required(),
        serialCurrentValue: Joi.string().min(6).max(9).required(),
        serialEndValue: Joi.string().min(6).max(9).required(),
    })

    const schema = Joi.object({
        ssccGenerators: Joi.array().items(sscc).optional()
    })

    //additional validations
    for(gens of config.ssccGenerators){
        if(gens.prefix.length + gens.serialCurrentValue.length != 16 )
            logger.log(`Invalid SSCC generator "${gens.name}". The combined length of prefix and serial should be 16.`)
      
        if(gens.serialCurrentValue.length != gens.serialStartValue.length || gens.serialCurrentValue.length != gens.serialEndValue.length)
            logger.log(`Invalid SSCC generator "${gens.name}". The serial start,current, and end values should be the same length`)
    }

    return schema.validate(config);
}

function validateGS1Config(config)
{
    let ai = Joi.object().keys({
        ai: Joi.number().required(),
        name: Joi.string().required(),
        maxLength: Joi.number().required(),
        fixedLength: Joi.boolean().required(),
        numeric: Joi.boolean().required(),
        checkDigitValidation: Joi.boolean().optional()
    })

const schema = Joi.object({
    fnc1: Joi.string().required(),
    applicationIdentifiers: Joi.array().items(ai).required()
})

return schema.validate(config);
}

function validateApiConfig(config){
    const schema = Joi.object({
        basePath: Joi.string().required(),
        port: Joi.number().required()
    })
    return schema.validate(config);
}

function loadKeyGenConfig(){
        //read keygenerator config, parse, and validate the json schema
        logger.log(`reading ${configDir}/keyGenerators.json`)
        keyGen = JSON.parse(fs.readFileSync(`${configDir}/keyGenerators.json`));
        logger.log(' -parsing keyGenerators.json')
        var result = validateKeyGenConfig(keyGen);
        if(result.error) logger.log(result.error.message);
        else{logger.log(' -keyGenerators.json validation success')}
}

function loadGS1Config()
{
    //read gs1config, parse, and validate the json schema
    logger.log(`reading ${configDir}/gs1Config.json`)
    gs1 = JSON.parse(fs.readFileSync(`${configDir}/gs1Config.json`));
    logger.log(' -parsing gs1Config.json')
    var result = validateGS1Config(gs1);
    if(result.error) logger.log(result.error.message);
    else{logger.log(' -gs1Config.json validation success')}
}

function reloadGS1Config()
{
        //read gs1config, parse, and validate the json schema
        logger.log(`reading ${configDir}/gs1Config.json`)
        gs1 = JSON.parse(fs.readFileSync(`${configDir}/gs1Config.json`));
        logger.log(' -parsing gs1Config.json')
        var result = validateGS1Config(gs1);
        if(result.error)
        {
            logger.log(result.error.message);
            return result.error.message
        }
        else{logger.log(' -gs2Config.json validation success')}

}

function loadAPIConfig()
{
    //read apiConfig, parse, and validate the json schema
    logger.log(`reading ${configDir}/apiConfig.json`)
    api = JSON.parse(fs.readFileSync(`${configDir}/apiConfig.json`));
    logger.log(' -parsing apiconfig.json')
    var result = validateApiConfig(api);
    if(result.error) logger.log(result.error);
    else{logger.log(' -apiConfig.json validation success')}
}

//load in all configs at startup
loadGS1Config();
loadAPIConfig();
loadKeyGenConfig();

module.exports.gs1 = gs1;
module.exports.api = api;
module.exports.keyGen = keyGen;
module.exports.reloadGS1Config = reloadGS1Config;