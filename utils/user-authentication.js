

const db = require('../db');
const jwt = require('jsonwebtoken');
function decodeSession(tokenString) {
    try {
        return jwt.verify(tokenString, 'SECRET');
    } catch (error) {
      if (error.message.indexOf("Unexpected token") === 0) return "sessão inválida!";

      if (error) return "sessão expirada!";

      return "token inválido!";
    }
  }

module.exports = async function(req) {
    const headerToken = req.header("X-JWT-Token");
    try {
       const conn = await db.connect();
       if (!headerToken) return "Token obrigatório";
  
        const decodedToken = decodeSession(headerToken);
        
        if(!decodedToken.authenticatedUser.email) return decodedToken
        const [rows] = await conn.query(`select * from users where email='${decodedToken.authenticatedUser.email}';`);

        if(rows.length < 1) return "Ocorreu um erro na autenticação";
        
        return true;
    } catch (error) {
        console.log(error);
        return "Erro de autenticação";
    }
}