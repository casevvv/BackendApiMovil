const  auth  = require('../util/auth.js');
const multer = require('../middlewares/multer.js');
const controllerFriend = require("../controllers/controllerFriend.js")
const controllerGroup = require('../controllers/controllerGroup.js')
const controllerEmail = require("../controllers/controllerEmail.js")


module.exports = (app) => {
  
    app.post('/signUp', auth.signUp);
    app.post('/login', auth.login);

    app.get('/careers', auth.careers);
    app.get('/userByCareer', controllerGroup.getUsersByCareer);

    app.post("/addFriends", auth.authenticate, controllerFriend.addFriend);
    app.get("/getFriends", auth.authenticate, controllerFriend.getFriends);
    app.delete("/deleteFriends", auth.authenticate, controllerFriend.deleteFriend)
    app.delete("/getAllUser", auth.authenticate, controllerFriend.getAllUsersWithCarrera)

    app.post('/creatGroup',auth.authenticate, controllerGroup.createGroup);
    app.delete('/deletGroup', auth.authenticate, controllerGroup.deleteGroup);
    app.post('/addMember',auth.authenticate, controllerGroup.addMember);
    app.post('/deletUserGroup', auth.authenticate, controllerGroup.deleteUserGroup);
    app.get('/getUserGroups',auth.authenticate, controllerGroup.getUserGroups);

    app.post('/forgot-password', controllerEmail.forgotPassword);
    app.post('/reset-password', controllerEmail.resetPassword);
}
