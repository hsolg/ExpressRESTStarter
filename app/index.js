const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
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
app.use(cors())

const jwtProps = { secret: jwtSecret }

app.get('/public', (req, res) => 
    res.send("This is a public endpoint")
)

app.get('/protected', jwt(jwtProps), (req, res) => {
    res.json({userId: req.user.userId})
})

app.post('/authenticate', (req, res) => {
    const username = req.body.username
    const password = req.body.password

    sqlite.open(dbPath, { Promise }).then((db) => {
        db.get("SELECT user_id, password FROM user WHERE username = ?", username).then((row) => {
            if (row) {
                new Promise(resolve => {
                    bcrypt.compare(password, row.password, (err, res) => {
                        resolve(res)
                    })
                }).then(match => {
                    if (match) {
                        const token = jsonwebtoken.sign({userId: row.user_id, username: username}, jwtSecret)
                        res.json({token: token})
                    } else {
                        // Wrong password
                        res.sendStatus(401)
                    }
                })
            } else {
                // Unknown user
                res.status(401).send()
            }
        })
    })
})

app.listen(port, () =>
    console.log(`Listening on port ${port}`)
)
