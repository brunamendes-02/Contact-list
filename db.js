async function connect() {
    if(global.connection && global.connection.state !== 'disconnected')
    return global.connection;

    const mysql = require("mysql2/promise");
    const connection = await mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'password',
        database : 'teste_full_stack'
    });
    global.connection = connection;
    return connection;
}
connect();
 

module.exports = {connect}