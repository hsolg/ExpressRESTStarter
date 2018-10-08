const program = require('commander')
const bcrypt = require('bcrypt')
const Promise = require('bluebird')
const sqlite = require('sqlite')

async function dbOperation(operation) {
    const dbPromise = sqlite.open('../../starter.db', { Promise })
    const db = await dbPromise
    return operation(db).then(() => {
        db.close()
    })
}

program.command('createuser <username>')
    .action((username) => {
        dbOperation((db) => {
            return new Promise(resolve => {
                db.run("INSERT INTO user(username) VALUES(?)", username).then(() => {
                    resolve()
                })
            })
        }).then(() => {
            console.log("User created")
        })
    })

program.command('setpassword <username> <password>')
    .action((username, password) => {
        dbOperation((db) => {
            return new Promise(resolve => {
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(password, salt, (err, hash) => {
                        db.run("UPDATE user SET password = ? WHERE username = ?", [hash, username]).then(() => {
                            resolve()
                        })
                    })
                })
            })
        }).then(() => {
            console.log("Password updated")
        })
    })

program.parse(process.argv)
