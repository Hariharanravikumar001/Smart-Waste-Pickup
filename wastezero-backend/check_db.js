const fs = require('fs');
const mongoose = require('mongoose');
const User = require('./models/User');

const mongoURI = "mongodb://admin:admin123@ac-fft6zbl-shard-00-00.kasfsbc.mongodb.net:27017,ac-fft6zbl-shard-00-01.kasfsbc.mongodb.net:27017,ac-fft6zbl-shard-00-02.kasfsbc.mongodb.net:27017/wastezero?ssl=true&replicaSet=atlas-ggz0rh-shard-0&authSource=admin&retryWrites=true&w=majority&appName=hariharan";

mongoose.connect(mongoURI)
.then(async () => {
    console.log('Connected to DB');
    const users = await User.find({}, 'email username role');
    fs.writeFileSync('db_output.txt', JSON.stringify(users, null, 2));
    console.log('Users written to db_output.txt');
    mongoose.disconnect();
})
.catch(err => console.error(err));
