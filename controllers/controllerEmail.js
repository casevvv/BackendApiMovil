
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const conn = require("../config/db.js");
const jwt = require('jsonwebtoken');

const MASTER_KEY = 'm38_$56/*d2hhv';

// Función para enviar el correo de recuperación con el código generado
async function enviarCorreoRecuperacion(email, recoveryCode) {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'lopezcaste266@gmail.com', // 
        pass: 'eqqbcdmwepbtjszu' //eqqb cdmw epbt jszu
      }
    });

    const mailOptions = {
      from: 'lopezcaste266@gmail.com', // Cambia esto por tu correo
      to: email,
      subject: 'Recuperación de contraseña',
      text: `Tu código de recuperación es: ${recoveryCode}`
      // Puedes personalizar el mensaje del correo con el código de recuperación
    };

    // Enviar el correo con el código de recuperación
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw error;
  }
}

// Endpoint para recuperación de contraseña
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Debes proporcionar un correo electrónico' });
  }

  try {
    // Verificar si el correo electrónico existe en la base de datos
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'Correo electrónico no registrado' });
    }

    // Generar un código de recuperación al azar
    const recoveryCode = crypto.randomBytes(6).toString('hex'); // Generar un código hexadecimal de 6 dígitos

     // Almacenar el código de recuperación en la base de datos
    await updateRecoveryCodeInDB(email, recoveryCode);

    // Enviar correo electrónico con el código de recuperación
    await enviarCorreoRecuperacion(email, recoveryCode);

    return res.status(200).json({ message: 'Se ha enviado un correo de recuperación' });
  } catch (error) {
    console.error('Error al solicitar recuperación de contraseña:', error);
    return res.status(500).json({ message: 'Error al solicitar recuperación de contraseña' });
  }
};

// Endpoint para restablecer contraseña con código de recuperación
exports.resetPassword  = async (req, res) => {
  const { email, recoveryCode, newPassword } = req.body;

  if (!email || !recoveryCode || !newPassword) {
    return res.status(400).json({ message: 'Todos los campos son requeridos' });
  }

  try {
    // Verificar si el correo electrónico existe en la base de datos
    const user = await getUserByEmail(email);

    if (!user) {
      return res.status(404).json({ message: 'Correo electrónico no registrado' });
    }

    // Verificar si el código de recuperación coincide con el almacenado en el usuario
    if (recoveryCode !== user.codigoRecuperacion) {
      return res.status(400).json({ message: 'Código de recuperación inválido' });
    }

    // Actualizar la contraseña del usuario
    await actualizarContraseña(email, newPassword);
    // Eliminar el código de recuperación almacenado en la base de datos
    await clearRecoveryCodeInDB(email);

    // Obtener la información actualizada del usuario
    const updatedUser = await getUserByEmail(email);

    if (!updatedUser) {
      return res.status(404).json({ message: 'Correo electrónico no registrado' });
    }


    // Generar un nuevo token con la información actualizada del usuario
    const newPayload = {
      id: user.id,
      email: user.email,
    };

    const newToken = jwt.sign(newPayload, MASTER_KEY);

    // Enviar correo de confirmación de recuperación de contraseña
    await enviarCorreoConfirmacion(email);

    return res.status(200).json({  token: newToken, message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    return res.status(500).json({ message: 'Error al restablecer contraseña' });
  }
}

// Función para enviar correo de confirmación de recuperación de contraseña
async function enviarCorreoConfirmacion(email) {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'lopezcaste266@gmail.com', 
        pass: 'eqqbcdmwepbtjszu' //  eqqb cdmw epbt jszu
      }
    });

    const mailOptions = {
      from: 'lopezcaste266@gmail.com', 
      to: email,
      subject: 'Recuperación de contraseña exitosa',
      text: 'Tu contraseña ha sido actualizada exitosamente.'
      // Puedes personalizar el mensaje del correo de confirmación aquí
    };

    // Enviar el correo de confirmación de recuperación de contraseña
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw error;
  }
}

// Función para obtener usuario por correo electrónico desde MySQL
async function getUserByEmail(email) {
  return new Promise((resolve, reject) => {
    conn.query('SELECT * FROM usuarios WHERE email = ?', [email], (error, results) => {
      if (error) {
        reject(error);
      } else if (results.length > 0) {
        resolve(results[0]);
      } else {
        resolve(null);
      }
    });
  });
}

// Función para actualizar la contraseña en la base de datos
async function actualizarContraseña(email, newPassword) {
  return new Promise((resolve, reject) => {
    conn.query('UPDATE usuarios SET password = ? WHERE email = ?', [newPassword, email], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

// Función para almacenar el código de recuperación en la tabla usuarios
async function updateRecoveryCodeInDB(email, recoveryCode) {
  return new Promise((resolve, reject) => {
    conn.query(
      'UPDATE usuarios SET codigoRecuperacion = ? WHERE email = ?',
      [recoveryCode, email],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          resolve(results);
        }
      }
    );
  });
}

// Función para eliminar el código de recuperación de la tabla usuarios
async function clearRecoveryCodeInDB(email) {
  return new Promise((resolve, reject) => {
    conn.query('UPDATE usuarios SET codigoRecuperacion = NULL WHERE email = ?', [email], (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}
