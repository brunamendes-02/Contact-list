module.exports = function(phone) {
    const myPhoneRegex =  /\(\d{2,}\) \d{4,}\-\d{4}/

    if (myPhoneRegex.test(phone)) return true;
    return false;
}