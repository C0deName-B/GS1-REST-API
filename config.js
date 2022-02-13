const Joi = require('joi');
const fs = require('fs');
const Logger = require('./logger');
const { join } = require('path/posix');
const logger = new Logger();

var gs1 = null;
var api = null;

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

function loadGS1Config()
{
    //read gs1config, parse, and validate the json schema
    logger.log('reading ./config/gs1Config.json')
    gs1 = JSON.parse(fs.readFileSync("./config/gs1Config.json"));
    logger.log(' -parsing gs1Config.json')
    var result = validateGS1Config(gs1);
    if(result.error) logger.log(result.error.message);
    else{logger.log(' -gs2Config.json validation success')}
}

function reloadGS1Config()
{
        //read gs1config, parse, and validate the json schema
        logger.log('reading ./config/gs1Config.json')
        gs1 = JSON.parse(fs.readFileSync("./config/gs1Config.json"));
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
    logger.log('reading ./config/apiConfig.json')
    api = JSON.parse(fs.readFileSync("./config/apiConfig.json"));
    logger.log(' -parsing apiconfig.json')
    var result = validateApiConfig(api);
    if(result.error) logger.log(result.error);
    else{logger.log(' -apiConfig.json validation success')}
}

loadGS1Config();
loadAPIConfig();
module.exports.gs1 = gs1;
module.exports.api = api;
module.exports.loadGS1Config = loadGS1Config;
module.exports.loadAPIConfig = loadAPIConfig;
module.exports.reloadGS1Config = reloadGS1Config;