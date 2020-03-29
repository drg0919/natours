const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({path: './config.env'});
const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);
const app = require('./app');

process.on('unhandledRejection' , (reason,promise) => {
    console.log(reason.name,reason.message);
    console.table('Server shutting down due to uncaught rejection');
    server.close(() => {
        process.exit(1);
    });
});

process.on('uncaughtException', (err,origin) => {
    console.log(err.name,err.message);
    console.table('Server shutting down due to uncaught exception');
    server.close(() => {
        process.exit(1);
    });
});

mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false,
    useUnifiedTopology:true
}).then(() => {
    console.log("Connection to database established");
}).catch(err => console.log(err.name));

const port = process.env.PORT||3000;
const server = app.listen(port,() => {
    console.log(`Server up on port ${port}`);
});