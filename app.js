const express = require('express');

const userRoute = require('./routes/userRoute');

const app = express();
app.use(express.json());
                                       
userRoute(app);

app.listen(3000, ()=>{
    console.log('El servidor inicio en el puerto 3000');
});