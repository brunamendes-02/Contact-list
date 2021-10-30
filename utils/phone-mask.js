module.exports = function(phone) {
    const splittedPhone = phone.split('');
    const begging = `${splittedPhone[0]}${splittedPhone[1]}${splittedPhone[2]}${splittedPhone[3]}${splittedPhone[4]}${splittedPhone[5]}${splittedPhone[6]}${splittedPhone[7]}${splittedPhone[8]}`
    const firstCaracteres = `${splittedPhone[9]}${splittedPhone[10]}${splittedPhone[11]}${splittedPhone[12]}${splittedPhone[13]}`
    const middle = `${splittedPhone[14]}`
    const secondCaracteres = `${splittedPhone[15]}${splittedPhone[16]}${splittedPhone[17]}${splittedPhone[18]}`
    const isJustNumbers = /^\d+$/.test(firstCaracteres);
    const isJustNumbers2 = /^\d+$/.test(secondCaracteres);
    if(phone.length === 19 
        && begging === '+55 (41) ' 
        && isJustNumbers 
        && middle === '-' 
        && isJustNumbers2)
        return true

        return false
}