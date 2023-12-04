const mysql = require("mysql2");
const fs = require('fs');

const conn = new mysql.createConnection({
    host: "proyectomovil.mysql.database.azure.com",
    user: "Jairo",
    password: "Tars1605@23",
    database: "bdproyectofinal",
    port: 3306,
    ssl: {
      ca: fs.readFileSync("config/DigiCertGlobalRootCA.crt.pem")
    }
  });
  
  conn.connect(
    function (err) {
      if (err) {
        console.log("!!! Cannot connect !!! Error:");
        throw err;
      }
      else {
        console.log("Connection established.");
  
      }
    });

module.exports = conn;
