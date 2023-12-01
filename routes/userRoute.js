const  auth  = require('../util/auth.js');
const multer = require('../middlewares/multer.js');

module.exports = (app) => {
    // app.get('/modelContactUsers', auth.authenticate, contactUsersControllers.pagination, contactUsersControllers.getContactUsers);
    // app.get('/modelContactUsers/:id',validarParams, contactUsersControllers.getContactUsersForId);
    app.post('/signUp', multer.getFile,auth.signUp);
    app.post('/login', auth.authenticate, auth.login);
    // app.delete('/modelContactUsers/:id', auth.authenticate, validarParams, contactUsersControllers.deleteContactUser);

}