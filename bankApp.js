const express = require('express');
var cors = require('cors')
const app = express();
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
// const jwt = require('jsonwebtoken');
const expressjwt = require('express-jwt');
const bodyParser = require('body-parser');
const port = 3004;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());

const url = "mongodb://root:password@localhost:27017";

// const jwtCheck = expressjwt({
//     secret: 'secretkey',
//     algorithms: ['HS256']
// });

// const accountHolders = [
//     {username: 'marsha', password: 'pass'},
//     {username: 'hendricks', password: 'pass'},
//     {username: 'joseph', password: 'pass'}
// ];

let getData = (db, callback) => {
    let collection = db.collection('accounts');
    collection.find({}).toArray((error, docs) => {
        console.log('there you go');
        callback(docs);
    })
}

let getAccountId = (db, accountId, callback) => {
    let collection = db.collection('accounts');
    collection.findOne({_id: accountId}, (error, docs) => {
        callback(docs);
    });
}

let addAccount = (db, newAccount) => {
    let collection = db.collection('accounts');
    collection.insertOne(newAccount);
}

let updateBalance = (db, accountName, newBalance) => {
    let collection = db.collection('accounts');
    collection.updateOne({name: accountName}, {$inc: {balance: newBalance}});
}

let deleteAccount = (db, accountId) => {
    let collection = db.collection('accounts');
    collection.deleteOne({_id: accountId});
}

let transferCoinsFrom = (db, accountName, newBalance) => {
    let collection = db.collection('accounts');
    collection.updateOne({name: accountName}, {$inc: {balance: - newBalance}});
}

let transferCoinsTo = (db, accountName, newBalance) => {
    let collection = db.collection('accounts');
    collection.updateOne({name: accountName}, {$inc: {balance: newBalance}});
}



// app.post('/login', (req, res) => {
//     if (!req.body.username || !req.body.password) {
//         return res.send('you did not provide username or password, you fool!');
//     }
//
//     let accountHolder = accountHolders.find((u) => {
//         return u.username === req.body.username && u.password === req.body.password;
//     })
//
//     if (!accountHolder) {
//         return res.send('looooser!');
//     }
//
//     let token = jwt.sign({
//         username: accountHolder.username
//     }, 'secretkey', {expiresIn: "3 hours"});
//
//     res.json({access_token: token});
// })


app.put('/accounts', (req, res) => {
    const senderName = req.body.senderName;
    const receiverName = req.body.receiverName;
    const newBalance = parseInt(req.body.balance);
    MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, (error, client) => {
        console.log('connected to Mongo');
        let db = client.db('coin4u');
        transferCoinsFrom(db, senderName, newBalance);
        transferCoinsTo(db, receiverName, newBalance);
    });
    res.json('charity work');
})


app.get('/accounts/:id', (req, res) => {
    MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, (error, client) => {
        console.log('yes, you are connected');
        let id = ObjectId(req.params.id);
        let db = client.db('coin4u');
        getAccountId(db, id, function (docs) {
            res.json(docs);
        });
})})

app.delete('/accounts/:id', (req, res) => {
    let id = ObjectId(req.params.id);
    MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, (error, client) => {
        console.log('connected to Mongo!');
        let db = client.db('coin4u');
        deleteAccount(db, id);
    })
    res.json({message: "this person is no longer with us. yay!"});
})

app.put('/accounts', (req, res) => {
    const accountName = req.body.name;
    const newBalance = parseInt(req.body.balance);
    MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, (error, client) => {
        console.log('connected to Mongo');
        let db = client.db('coin4u');
        updateBalance(db, accountName, newBalance);
    });
    res.json('someone just got lucky or broke!');
})

app.get('/accounts', async (req, res) => {
    MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, (error, client) => {
        console.log('yes, you are connected');
        let db = client.db('coin4u');
        getData(db, (documentsReturned) => {
            console.log(documentsReturned);
            res.json(documentsReturned);
        })
    })
})

app.post('/accounts', (req, res) => {
    let newAccountName = req.body.name;
    let newAccountAddress = req.body.address;
    let newAccountBalance = req.body.balance;

    let newAccount = {
        name: newAccountName,
        address: newAccountAddress,
        balance: newAccountBalance
    }
    MongoClient.connect(url, {useNewUrlParser: true, useUnifiedTopology: true}, (error, client) => {
        console.log('connected to Mongo');
        let db = client.db('coin4u');
        addAccount(db, newAccount);
    });
    res.json('new creature joined your funny bank');
})


app.listen(port, () => {console.log(`Listening on http://localhost:${port}`)})