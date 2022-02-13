function getCheckDigit(key)
{
    //return the check digit needed for key
    //implimented based on: https://www.gs1.org/services/how-calculate-check-digit-manually
    var total = 0
    
    function keepChecking()
    {
        if(key.length %2 ==1) multiplier = 3
        else multiplier = 1

        total += parseInt(key.substring(0,1)) * multiplier

        key = key.substring(1,key.length)
        if(key)keepChecking(key)
    }
   
    keepChecking(key)
    return 10 - total%10
}

function addCheckDigit(key)
{
    return key + getCheckDigit(key)
}

function verifyCheckDigit(key)
{
    //key should be full value including check digit
    keyWithCD = addCheckDigit(key.substring(0,key.length-1))

    //var cd = getCheckDigit(key.substring(0,key.length-1))
    if(key == keyWithCD){return true}
    else{return false}
}

module.exports.addCheckDigit=addCheckDigit;
module.exports.isValid=verifyCheckDigit;