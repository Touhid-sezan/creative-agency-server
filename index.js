const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mcyg9.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('servicesFile'));
app.use(fileUpload());

const port = 5000

app.get('/', (req, res) => {
    res.send('Hello Database')
})



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const services = client.db("creativeAgency").collection("services");
    const reviews = client.db("creativeAgency").collection("reviews");
    const serviceOrders = client.db("creativeAgency").collection("ServiceOrders");
    const admins = client.db("creativeAgency").collection("admins");


    app.post('/addService', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const description = req.body.description;
        console.log(name, description, file);
    })

    app.post('/reviews', (req, res) => {
        const review = req.body;
        reviews.insertOne(review)
            .then(result => {
                console.log(result.insertedCount);
                res.send(result.insertedCount);
            })
    })

    app.post('/serviceOrders', (req, res) => {
        const order = req.body;
        serviceOrders.insertOne(order)
            .then(result => {
                console.log(result.insertedCount);
                res.send(result.insertedCount);
            })
    })

    app.post('/serviceOrdersByEmail', (req, res) => {
        const email = req.body.email;
        admins.find({ email: email })
            .toArray((err, admins) => {
                const filter = {}
                if (admins.length === 0) {
                    filter.email = email;
                }

                serviceOrders.find(filter)
                    .toArray((err, documents) => {
                        res.send(documents);
                    })
            })
    });

    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        admins.find({ email: email })
            .toArray((err, admins) => {
                res.send(admins.length > 0);
            })
    })

    app.post('/admins', (req, res) => {
        const admin = req.body;
        admins.insertOne(admin)
            .then(result => {
                console.log(result.insertedCount);
                res.send(result.insertedCount);
            })
    })
    app.get('/serviceOrders', (req, res) => {
        serviceOrders.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/admins', (req, res) => {
        admins.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

    app.get('/services', (req, res) => {
        services.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })
    app.get('/reviews', (req, res) => {
        reviews.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })

});


app.listen(process.env.PORT || port)