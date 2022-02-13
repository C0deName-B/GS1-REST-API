const { match } = require('assert');
const config = require('./config');
const checksum = require('./checksum.js');

function parse(data)
{
    parse(data,'');
}

function parse(data,fnc1)
{
    if(!fnc1)fnc1=config.gs1.fnc1;
    result = {"data": data, results:[]}

    
    function keepParsing(data)
    {
        var val=null
        var fnc_pos

        function fixedLengthParse()
        {
            /*check if value has fnc at the the end of it and remove it if so*/
            if(fnc_pos==id.ai.length+id.maxLength)
            {
                val = data.substring(id.ai.length,id.maxLength+id.ai.length)
                data = data.substring(id.ai.length+val.length+fnc1.length)
            }
            else
            {
                /*fnc not at the end, parse normally*/
                val = data.substring(id.ai.length,id.maxLength+id.ai.length)
                data = data.substring(id.ai.length+val.length)
            }
        }

        fnc_pos = data.indexOf(fnc1);
        for (id of config.gs1.applicationIdentifiers)
        {
            if(id.ai == data.substring(0,id.ai.length))
            {
                if(id.fixedLength)
                {
                    fixedLengthParse();
                }
                else{
                    //parse using function code
                    if(fnc_pos!=-1 && fnc_pos <= id.maxLength)
                    {
                        val = data.substring(0,fnc_pos)
                        val = val.replace(fnc_pos,id.fnc_pos+fnc1.length)
                        data = data.substring(fnc_pos+fnc1.length)
                    }
                    //parse remaining string
                    else if(data.length < id.maxLength)
                    {
                        val = data
                        data=''
                    }
                    //variable length but is the full length so can be parse the same as fixed length fields
                    else
                    {
                        fixedLengthParse();
                    }
                }

                /***********
                *validation*
                ***********/
                var valid = true
                var onlyNumbers=/^\d*$/
                var reason=''
                if(id.checkDigitValidation)
                {
                    if(!checksum.isValid(val))
                    {
                        valid=false
                        reason="invalid check digit"
                    }
                }
                if(id.fixedLength && val.length != id.maxLength)
                {
                    valid=false
                    reason = 'incorrect length'
                }
                if(id.numeric && !onlyNumbers.test(val))
                {
                    valid = false
                    reason = 'value should only contain numbers'
                }           

                var match = {ai:id.ai, name:id.name, value: val}
                if(!valid)
                {
                    match.error="invalid value: " + reason;
                }

                result.results.push(match);
                if(data){keepParsing(data)}
                break //no need to check the rest since we found a match
            }
        }
    }
    
    keepParsing(data)
    if(result.results.length ==0 )result.error='invalid GS1 data string'
    return result
}

function generateSSCC(name)
{
    //find the generator that matches the name provided
    var generator = config.keyGen.ssccGenerators.find(gen =>{
        return gen.name===name
    })

    //if a name wasn't provided then use the default
    if(!generator) generator = config.keyGen.ssccGenerators.find(gen =>{
        return gen.name==='default'
    })

    //increment current value
    var nextInt = parseInt(generator.serialCurrentValue)+1
    var nextVal = nextInt.toString().padStart(generator.serialCurrentValue.length,'0')

    //if we've passed the max value then start back over
    if(nextVal == parseInt(generator.serialEndValue)+1)
    {
        nextVal=generator.serialStartValue;

        //roll the extension digit if enabled
        if(generator.incrementExtDigit)
        {
            generator.extensionDigit = (generator.extensionDigit + 1)%10
        }
    }

    sscc = generator.extensionDigit.toString() + generator.prefix + nextVal
    sscc = checksum.addCheckDigit(sscc)
    
    generator.serialCurrentValue = nextVal

    return sscc
}

module.exports.parse = parse;
module.exports.generateSSCC = generateSSCC;