const  auth  = require('../util/auth.js');
const multer = require('../middlewares/multer.js');
const controllerFriend = require("../controllers/controllerFriend.js")
const controllerGroup = require('../controllers/controllerGroup.js')

module.exports = (app) => {
  
    app.post('/signUp', multer.getFile,auth.signUp);
    app.post('/login', auth.authenticate, auth.login);

    app.get('/careers', auth.careers);
    app.post("/addFriends", auth.authenticate, controllerFriend.addFriend);
    app.get("/getFriends", auth.authenticate, controllerFriend.getFriends);
    app.delete("/deleteFriends", auth.authenticate, controllerFriend.deleteFriend)

    app.post('/creatGroup',auth.authenticate, controllerGroup.creatGroup);
    app.delete('/deletGroup', auth.authenticate, controllerGroup.deleteGroup);
    app.post('/addMember',auth.authenticate, controllerGroup.addMember);
    app.post('/deletUserGroup', auth.authenticate, controllerGroup.deleteUserGroup);
    app.get('/getUserGroups',auth.authenticate, controllerGroup.getUserGroups);
}
