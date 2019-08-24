const lodash = require('lodash');
const helper = require('../helper/Helper.js');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
const token = require('../models/Token.js');
const redis = require('redis');
const client = redis.createClient();
const ArrayList = require('arraylist');

class User {
    constructor(app) {
        this.app = app;
    }

    checkUser(user, callback = () => {}) {
        const username = lodash.get(user, 'username', '');
        const password = lodash.get(user, 'password', '');

        let check = true;

        if (!helper.isUserNameAndPassword(username) || username.length < 1 || username.length > 20) check = false;

        if (!helper.isUserNameAndPassword(password) || password.length < 1 || password.length > 20) check = false;

        if (!check) {
            const err = "Invalid value";
            return callback({err: err}, null);
        }

        this.app.db.collection('users').findOne({"username": username}, (err, result) => {
            if (err || result) {
                const err = "Username is already exist";
                return callback({err: err}, null);
            }
            const hashedPassword = bcrypt.hashSync(password, 10);
            const userFormat = {
                username: username,
                password: hashedPassword,
                win_game: 0,
                total_game: 0,
                point: 100
            }
            return callback(null, userFormat);
        });
    }

    createUser(user) {
        const db = this.app.db;
        return new Promise((resolve, reject) => {
            this.checkUser(user, (err, user) => {
                if (err) {
                    reject(err);
                }
                db.collection('users').insertOne(user, (err, info) => {
                    if (err) {
                        reject({error: "Do not save user."});
                    }
                    // create token
                    token.createToken(lodash.get(user, 'username')).then((token) => {
                        let data = {};
                        lodash.unset(user, 'password');
                        data.token = token;
                        data.user = user;
                        resolve(data);
                    }).catch((err) => {
                        reject({err: err});
                    })
                });
            });
        });
    }

    findUserByUsername(username, callback = () => {}) {
        this.app.db.collection('users').findOne({username: username}, (err, result) => {
            if (err || !result) {
                const err = "User not found";
                return callback({err: err}, null);
            }
            return callback(null, result);
        });
    }

    findUser(username) {
        return new Promise((resolve, reject) => {
            this.app.db.collection('users').findOne({username: username}, (err, result) => {
                if (err || !result) {
                    reject(err);
                }
                resolve(result);
            });
        });
    }

    login(user) {
        const username = lodash.get(user, 'username');
        const password = lodash.get(user, 'password');
        return new Promise((resolve, reject) => {
            if (!username || !password || !helper.isUserNameAndPassword(username) || !helper.isUserNameAndPassword(password)) {
                const err = "Invalid value";
                reject({err: err});
            }

            this.findUserByUsername(username, (err, result) => {
                if (err) {
                    reject({err: "Login failed"});
                }
                const hashedPassword = lodash.get(result, 'password');
                const check = bcrypt.compareSync(password, hashedPassword);
                if (!check) {
                    reject({err: "Login failed"});
                }
                // create token
                token.createToken(lodash.get(result, 'username')).then((token) => {
                    let data = {};
                    lodash.unset(result, 'password');
                    data.token = token;
                    data.user = result;
                    resolve(data);
                }).catch((err) => {
                    reject({err: err});
                })
            });
        })
    }

    findUserById(id) {
        return new Promise((resolve, reject) => {
            if (!id) {
                const err = "User not found";
                reject({err: err});
            }
            const userId = new ObjectId(id);
            this.app.db.collection('users').findOne({_id: userId}, (err, result) => {
                if (err || !result) {
                    const err = "User not found";
                    reject({err: err});
                }
                resolve(result);
            });
        });
    }

    updateUser(id, result, room) {
        return new Promise( async (resolve, reject) => {
            const db = this.app.db;
            let user = await this.findUserById(id);
            let winGame = parseInt(user.win_game);
            let point = parseInt(user.point);
            let totalGame = parseInt(user.total_game);
            totalGame++;
            if(result === 'win') {
                winGame++;
                point += parseInt(room.bet_point);
            } else if(result === 'lose') {
                point -= parseInt(room.bet_point);
            }
            var query = {username: user.username};
            var value = { $set: { total_game: totalGame, point: point, win_game: winGame } };
            db.collection("users").updateOne(query, value, function(err, res){
                if(err) {
                    reject({err: 'update user failed'});
                }
                resolve({message: 'updated user'});
            });
        });
    }

    // mongo db
    getTop() {
        const db = this.app.db;
        let data = new ArrayList;
        return new Promise((resolve, reject) => {
            db.collection('users').find().sort({point: -1, username: 1}).limit(5).toArray(function(err, result) {
                if (err) reject(err);
                for(let i = 0; i < result.length; i++) {
                    let rankInfo = {
                        username: result[i].username,
                        point: result[i].point
                    }
                    data.add(rankInfo);
                }
                resolve(data);
            });
        });
    }

    // redis cache
    checkListTopPlayer() {
        return new Promise((resolve, reject) => {
            client.exists('top', function(err, reply) {
                if(err) reject(err);
                resolve(reply);
            });
        });
    }

    getListTopPlayer() {
        let data = new ArrayList;
        return new Promise((resolve, reject) => {
            client.zrevrange('top', 0, -1, 'withscores', function(err, reply) {
                if(err) reject(err);
                for(let i = 0; i < reply.length; i++) {
                    let rankInfo = {
                        username: reply[i],
                        point: reply[i + 1]
                    }
                    i++;
                    data.add(rankInfo);
                }
                resolve(data);
            })
        })
    }

    savePlayerInRedis(point, username) {
        return new Promise((resolve, reject) => {
            client.zadd('top', 'NX', point, username, function(err, reply) {
                if(err) reject(err);
                resolve(reply);
            });
        });
    }

    saveListTopPlayer(listTopPlayer) {
        for(let i = 0; i < listTopPlayer.length; i++) {
            this.savePlayerInRedis(listTopPlayer[i].point, listTopPlayer[i].username);
        }
    }

    deleteCache() {
        return new Promise((resolve, reject) => {
            client.del('top', function(err, reply) {
                if(err) reject(err);
                resolve(reply);
            });
        });
    }

}

module.exports = User