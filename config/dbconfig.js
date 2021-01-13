require('dotenv').config()

const username = process.env.DB_USER;
const password = process.env.DB_PASSWORD;

const dbconfig= {
    secret: 'secret',
    database: `mongodb+srv://${username}:${password}@cluster0.yckys.mongodb.net/app?retryWrites=true&w=majority`
    
}

module.exports = dbconfig