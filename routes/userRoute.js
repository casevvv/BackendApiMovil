const  auth  = require('../util/auth.js');
const multer = require('../middlewares/multer.js');
const controllerFriend = require("../controllers/controllerFriend.js")
const controllerGroup = require('../controllers/controllerGroup.js')

module.exports = (app) => {
    // app.get('/modelContactUsers', auth.authenticate, contactUsersControllers.pagination, contactUsersControllers.getContactUsers);
    // app.get('/modelContactUsers/:id',validarParams, contactUsersControllers.getContactUsersForId);
    app.post('/signUp', multer.getFile,auth.signUp);
    app.post('/login', auth.authenticate, auth.login);
    // app.delete('/modelContactUsers/:id', auth.authenticate, validarParams, contactUsersControllers.deleteContactUser);
    app.get('/careers', auth.careers);
    app.post("/addFriends", controllerFriend.addFriend);
    app.get("/getFriends", controllerFriend.getFriends);
    app.delete("/deleteFriends", controllerFriend.deleteFriend)

    app.post('creatGroup/:id_creador', controllerGroup.creatGroup);
    app.post('/user/:id/group/:id', controllerGroup.addMember);
}
