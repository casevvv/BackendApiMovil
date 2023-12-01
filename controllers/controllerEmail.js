const modeloEmail = require('../models/modelEmail.js');

const nodemailer = require('nodemailer');

exports.sendEmailToUser  = async (req, res) => {
  try{
    const { to, subject, text } = req.body;

   if (!to || !subject || !text) {
     return res.status(400).send({message:'Debes llenar todos los campos para poder enviar el correo!'});
   } else {

     const transporter = nodemailer.createTransport({
       host: "smtp.gmail.com",
       port: 465,
       secure: true,
       auth: {
         user: 'laaguja1601',
         pass: 'qlknxnsdihpuexlb'
       }
     });
       // send mail with defined transport object
       const info = await transporter.sendMail({
         from: 'laaguja1601@gmail.com', // sender address 
         to: to, // list of receivers
         subject: subject, // Subject line
         text: text, // plain text body
       });      

     transporter.sendMail(info, (error) => {
       if (error) {
         console.error('Error al enviar el correo:', error);
         return res.status(500).send({message:'Error al enviar el correo'});
       } else {
         console.log('Correo enviado correctamente!');
         return res.status(200).send({message:'Correo enviado correctamente!'});
       }
     });
   }
  } catch(e) {
    console.error('Error al enviar el correo:', e);
  } 
 
};

exports.sendEmail = async (req, res) => {
  try {
   
    let {firstName, lastName, from, subject, text } = req.body;

    if (!firstName || !lastName || !from || !subject || !text) {
      return res.status(400).send('Debes llenar todos los campos para poder enviar el correo!')
    }

      const data = new modeloEmail({

          name: `${firstName} ${lastName}`,
          from: from,
          subject: subject,
          text: text
        
      });

      const newRegister = await data.save();

      res.status(201).send(newRegister);
    
  } catch (err) {
    console.error("Error al enviar el correo:", err);
    res.status(500).send("Error en el microservicio enviar correo");
  };

};

exports.getEmail = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const data = await modeloEmail.paginate({}, { page, limit });

    if (data.totalDocs === 0) {
      return res.status(404).send({ message: 'No hay correos!' });
    }

    res.status(200).send(data);

  } catch (err){
    console.error("Error en el microservicio Obtener Correos:", err);
    res.status(500).send({message:`Error en el microservicio Obtener Correos`})
  };
};

exports.deleteEmail = async (req, res)=>{
    try {
        const { id } = req.params;

        if(!id){
          return res.status(400).send({message:'Para borrar un correo debes indicar cuál con un ID'});
        }else{
          const deleteEmail = await modeloEmail.findByIdAndDelete(id);

          if(deleteEmail)res.status(200).send({message:`Se elimino el correo con ID: ${id}`});
          else
          res.status(404).send({message:`No se encontro información relacionada con el id:${id}`});
        };
    } catch (err) {
      console.error("Error en el microservicio Eliminar Correos:", err);
      res.status(500).send({message:`Error en el microservicio Eliminar Correos`})
    }
};
