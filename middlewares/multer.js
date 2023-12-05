const multer = require("multer");

const storage = multer.diskStorage({
  destination: 'imagenes',
  filename: function (req, file, cb) {
    let extension = file.originalname.slice(file.originalname.lastIndexOf('.'));

    cb(null, Date.now() + extension);
  }
  
});
const fileFilter = (req, file, callback) => {
  // Aquí puedes definir tu lógica de filtrado de archivos
  if (file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg') {
    // Aceptar el archivo

    callback(null, true);

  } else {
    // Rechazar el archivo
    callback(new Error('El tipo de archivo no es válido. Solo se permiten imágenes JPEG o PNG.'));
  }
};
// Middleware para el manejo de errores de multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Error relacionado con multer (por ejemplo, tamaño de archivo excedido)
    return res.status(400).send('Error en la subida de archivos: ' + err.message);
  } else if (err) {
    // Otro tipo de error
    return res.status(500).send('Error en el servidor: ' + err.message);
  }
  next();
};

  const getFile = (req, res, next) => {
    const uploads = multer({
      storage: storage,
      fileFilter: fileFilter,
      limits: {
        fileSize: 5 * 1024 * 1024 // Límite de 5 MB (en bytes)
      }
    }).single('foto');
  //dwedwede
    uploads(req, res, (err) => {
      if (err) {
        // Manejar el error en caso de fallo en la subida del archivo
        handleMulterError(err, req, res, next);
      } else {
      // Verificar si se envió un archivo en la solicitud
      if (req.file && Object.keys(req.file).length > 0) {
        console.log(req.file)
        // Obtener el archivo subido y asignarlo a req.fileName(agregar un parametro a req.files para enviar los archivos a otro middleware)
        req.filePath = req.file.path;
        next();
      } else {
        // Si no se envió un archivo, asignar un valor vacío a req.file
        req.filePath = [];
        next();
      }
      }
    });
    
  };

module.exports.getFile = getFile;