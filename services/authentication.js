const JWT = require("jsonwebtoken");


const secrate = "$uperman@1234"

function createTokenForUser(user) {
    const payload = {
        _id : user._id,
        fullname : user.fullname,
        email : user.email,
        profileImageURL : user.profileImageURL,
        role: user.role, 
    } ;
    
    const token = JWT.sign(payload, secrate);
    return token;
}

function validateToken(token){
    const payload = JWT.verify(token, secrate);
    return payload;
}

module.exports = {
    createTokenForUser,
    validateToken,
}