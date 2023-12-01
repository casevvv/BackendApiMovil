const jwt = require('jsonwebtoken');
const MASTER_KEY = 'm38_$56/*d2hhv';

exports.authRoleActionSendEmail = (req, res, next)=>{
    try {
        const headers = req.headers.authorization;
        if(!headers){
            return res.status(401).send('Es necesario estar registrado para enviar correos!');
        };
        const [type, token] = headers.split(' ');
        if(!type == 'Bearer'){
            return res.status(401).send('El token no es compatible!');
        }else{
            const decoded = jwt.verify(token, MASTER_KEY);
            if(decoded.role === 'common user' || decoded.role === 'administrator' || decoded.role === 'regular user'){
                next();
            }else{
                return res.status(401).send({message:'No tienes los permisos para realizar está acción!'});
            };
        };
     
    } catch (err) {
        console.error(`Ocurrio un error en envíar correo ${err}`);
        res.status(500).send(`Ocurrio un error en el servidor!`);
    };
};

exports.authRoleActionGetAndDeleteEmail = (req, res, next)=>{
    try {
        const headers = req.headers.authorization;
        if(!headers){
            return res.status(401).send('Es necesario estar registrado para obtener correos!');
        };
        const [type, token] = headers.split(' ');
        if(!type == 'Bearer'){
            return res.status(401).send('El token no es compatible!');
        }else{
            const decoded = jwt.verify(token, MASTER_KEY);
            if(decoded.role === 'regular user' || decoded.role === 'administrator'){
                next();
            }else{
                return res.status(401).send('No tienes los permisos para realizar está acción!');
            };
        };
     
    } catch (err) {
        console.error(`Ocurrio un error en obtener el correo: ${err}`);
        res.status(500).send(`Ocurrio un error en el servidor!`);
    };
};

exports.authRoleActionAdmin = (req, res, next)=>{
    try {
        const headers = req.headers.authorization;
        if(!headers){
            return res.status(401).send('Es necesario estar registrado para ver!');
        };
        const [type, token] = headers.split(' ');
        if(!type == 'Bearer'){
            return res.status(401).send('El token no es compatible!');
        }else{
            const decoded = jwt.verify(token, MASTER_KEY);
            if(decoded.role === 'administrator'){
                next();
            }else{
                return res.status(401).send('No tienes los permisos para realizar está acción!');
            };
        };
        
    } catch (err) {
        console.error(`Ocurrio un error en autorizar rol de gestion de usuarios: ${err}`);
        res.status(500).send(`Ocurrio un error en el servidor!`);
    };
};

exports.authRoleActionServices = (req, res, next)=>{
    try {
        const headers = req.headers.authorization;
        if(!headers){
            return res.status(401).send('Es necesario estar registrado para gestionar los servicios!');
        };
        const [type, token] = headers.split(' ');
        if(!type == 'Bearer'){
            return res.status(401).send('El token no es compatible!');
        }else{
            const decoded = jwt.verify(token, MASTER_KEY);
            if(decoded.role === 'administrator' || decoded.role === 'regular user'){
                next();
            }else{
                return res.status(401).send('No tienes los permisos para realizar está acción!');
            };
        };
        
    } catch (err) {
        console.error(`Ocurrio un error en autorizar rol de gestionar servicios: ${err}`);
        res.status(500).send(`Ocurrio un error en el servidor!`);
    };
};

exports.authRoleActionGallery = (req, res, next)=>{
    try {
        const headers = req.headers.authorization;
        if(!headers){
            return res.status(401).send('Es necesario estar registrado para gestionar la galeria!');
        };
        const [type, token] = headers.split(' ');
        if(!type == 'Bearer'){
            return res.status(401).send('El token no es compatible!');
        }else{
            const decoded = jwt.verify(token, MASTER_KEY);
            if(decoded.role === 'administrator' || decoded.role === 'regular user'){
                next();
            }else{
                return res.status(401).send('No tienes los permisos para realizar está acción!');
            };
        };
        
    } catch (err) {
        console.error(`Ocurrio un error en autorizar el rol de gestionar galeria: ${err}`);
        res.status(500).send(`Ocurrio un error en el servidor!`);
    };
};