const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');
const multer = require('../middlewares/multer.js');
const fs = require('fs');

const MASTER_KEY = 'm38_$56/*d2hhv';

let conn = new mysql.createConnection({
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

exports.recoveryPassword = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: 'Se requiere un token' });
  }

  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer') {
    return res.status(401).send({ message: 'El tipo de autorización no es válido' });
  }

  try {
    const decoded = jwt.verify(token, MASTER_KEY);
    const { password, newPassword } = req.body;

    if (!password || !newPassword) {
      return res.status(400).send({ message: 'Los datos están incompletos. Por favor, rellénalos.' });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).send({ message: 'Usuario no encontrado' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).send({ message: 'Contraseña actual incorrecta' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;

    const savedUser = await user.save();

    const newPayload = {
      id: savedUser.id,
      firstName: savedUser.firstName,
      lastName: savedUser.lastName,
      email: savedUser.email,
      password: savedUser.password,
      role: savedUser.role
    };

    const newToken = jwt.sign(newPayload, MASTER_KEY);

    return res.status(200).json({ token: newToken });
  } catch (err) {
    console.error(`Ocurrió un error en la autenticación: ${err}`);
    return res.status(401).send({ message: 'Token inválido' });
  }
};


exports.authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  console.log(authHeader)
  if (!authHeader) {
    return res.status(401).send({ message: 'Es necesario un Token' });
  }

  const [type, token] = authHeader.split(' ');

  if (type !== 'Bearer') {
    return res.status(401).send({ message: 'El tipo de autorizacion no es valida' });

  };

  try {
    const decoded = jwt.verify(token, MASTER_KEY);

    req.email = decoded;

    next();

  } catch (err) {
    console.error(`Ocurrio un error en la autenticación: ${err}`);
    return res.status(401).send({ message: 'Token invalido' });

  };

};
exports.signUp = async (req, res) => {
  try {
    const {
      nombre,
      apellidos,
      identidad,
      telefono,
      password,
      email,
      carrera
    } = req.body;
    console.log(req.body)
    console.log(req.file.path)
    const foto = req.file.path;

    if (!nombre || !apellidos || !identidad || !email || !telefono ||  !foto || !password || !carrera) {
      return res.status(500).send({ message: 'Los datos no están completos!' });
    } else {
      conn.query('SELECT * FROM usuarios WHERE email = ?', [email], async (error, results) => {
        if (error) {
          res.status(500).json({ error: error.message });
        } else if (results.length > 0) {
          res.status(400).send({ message: 'Ya existe una cuenta!' });
        } else {

          if(password < 8)
            return res.status(400).send({message: "La cantidad de la contraseña es corta, minimo 8 carácteres!"});

          const newRegister = {
            nombre: nombre,
            apellidos: apellidos,
            identidad: identidad,
            telefono: telefono,
            password: password,
            email: email,
            foto: foto,
            carrera: carrera
          };

          conn.query('INSERT INTO usuarios (nombre,apellidos,identidad,telefono,password,email,foto,carrera) VALUES (?, ?, ?, ?, ?, ?, ?, ?);', [nombre,
            apellidos,
            identidad,
            telefono,
            password,
            email,
            foto,
            carrera], async (error, result) => {
              if (error) {
                res.status(500).json({ error });
              } else {
                const savedUser = { newRegister };

                // Generación del token JWT
                const jwtPayload = {
                  email: savedUser.newRegister.email,
                  password: savedUser.newRegister.password
                };

                const token = jwt.sign(jwtPayload, MASTER_KEY);

                res.status(200).json({ message: 'Registro exitoso', savedUser, token });
                // conn.end(function (err) {
                //   if (err) throw err;
                //   else console.log('Done.')
                // });
              }
            });
        }
      });
    }
  } catch (err) {
    console.error(`Ocurrió un error al registrar usuario: ${err}`);
    res.status(500).send(err);
  }
};


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body)
    if (!email || !password) {
      return res.status(401).send({ message: 'Los datos no están completos!, llenalos!' });
    } else {
      //buscar usuario en la colecion de usuarios por email  para saber si ya existe o no se ha registrado
      conn.query('SELECT * FROM usuarios WHERE email = ?', [email], async (error, results) => {
        if (error) {
          return res.status(401).send({ message: 'No existe esa cuenta!' });

        } else if(results.length > 0) {
          console.log(results)
          const user = results[0];

          if (user.password === password) {
            const payload = {
              email: user.email,
              password: user.password
            };
            const token = jwt.sign(payload, MASTER_KEY);
            res.json({ user, token });
          } else {
            return res.status(401).send({ message: 'Correo o contraseña incorrecta!' })
          };
        }
      }
      )
    };
  } catch (err) {
    console.error(`Ocurrio un error en el login: ${err}`);
    res.status(500).send({ message: 'Ocurrio un error en el Servidor!' });
  };
};

exports.getUser = async (req, res) => {
  try {
    const dato = await User.paginate({}, { page: 1, limit: 5 });

    res.send(dato);
  } catch (err) {
    console.error(`Ocurrio un error en obtener los usuarios: ${err}`);
    res.status(500).send({ message: 'Ocurrio un error en el Servidor!' });
  };
};

exports.deletUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send('Debes indicar el ID para eliminar un usuario!');
    } else {
      const deleteById = await User.findByIdAndDelete(id);

      if (deleteById)
        res.status(200).send({
          message: `Se elimino el usuario ${deleteById.firstName} ${deleteById.lastName}
                                      con role de usuario: ${deleteById.role}`
        });
      else
        res.status(404).send({ message: `No se encontro información relacionada con el id:${id}` });
    };
  } catch (err) {
    console.error(`Ocurrio un error en eliminar un usuario: ${err}`);
    res.status(500).send({ message: 'Ocurrio un error en el Servidor!' });
  };
};