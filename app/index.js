const express = require('express')
const bodyParser = require('body-parser')
const bcrypt = require('bcrypt')
const jwt = require('express-jwt')
const jsonwebtoken = require('jsonwebtoken')
const Promise = require('bluebird')
const sqlite = require('sqlite')

const port = process.env.PORT_NUMBER || 3000
const jwtSecret = process.env.JWT_SECRET || "default_secret"
const dbPath = process.env.DB_PATH || "../starter.db"

const app = express()
app.use(bodyParser.json())

const jwtProps = { secret: jwtSecret }

app.get('/public', (req, res) => 
    res.send("This is a public endpoint")
)

app.get('/protected', jwt(jwtProps), (req, res) => {
    // TODO Validate the access token.
    res.send("This is a protected endpoint")
})

app.post('/authenticate', (req, res) => {
    const username = req.body.username
    const password = req.body.password

    sqlite.open(dbPath, { Promise }).then((db) => {
        db.get("SELECT user_id, password FROM user WHERE username = ?", [username]).then((row) => {
            new Promise(resolve => {
                bcrypt.compare(password, row.password, (err, res) => {
                    resolve(res)
                })
            }).then(match => {
                if (match) {
                    const token = jsonwebtoken.sign({userId: row.user_id, username: username}, jwtSecret)
                    res.json({token: token})
                } else {
                    res.sendStatus(401)
                }
            })
        })
    })
})

app.listen(port, () =>
    console.log(`Listening on port ${port}`)
)