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

    cd = 10 - total%10
    if(cd==10)cd=0 //if total%0 is 0 then when end up with 10 but we just need the 1 digit
    return cd
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