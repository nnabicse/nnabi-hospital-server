const express = require('express')
const cors = require('cors');
require('dotenv').config();
const app = express()
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@nnabi-hospital.metbw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect()
        const serviceCollection = client.db('nnabi-hospital').collection('services');
        const bookingCollection = client.db('nnabi-hospital').collection('bookings');
        const usersCollection = client.db('nnabi-hospital').collection('users');



        app.get('/service', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const user = req.body;
            const options = { upsert: true };
            const updateDoc = {
                $set: user
            };

            const result = await usersCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, token });

        })

        app.get('/available', async (req, res) => {
            const date = req.query.date;

            const services = await serviceCollection.find().toArray()

            const query = { date: date };
            const bookings = await bookingCollection.find(query).toArray();

            services.forEach(service => {
                const serviceBookings = bookings.filter(booking => booking.treatment === service.name);
                const booked = serviceBookings.map(service => service.slot);
                const available = service.slots.filter(slot => !booked.includes(slot));
                service.slots = available;
            })
            res.send(services);
        })



        app.get('/booking', async (req, res) => {
            const patient = req.query.patient;
            const query = { patient: patient }
            const bookings = await bookingCollection.find(query).toArray();
            res.send(bookings)
        })


        app.post('/booking', async (req, res) => {
            const booking = req.body;
            const query = { treatment: booking.treatment, date: booking.date, patient: booking.patient }
            const exist = await bookingCollection.findOne(query);
            if (exist) {
                return res.send({ success: false, booking: exist })
            }
            const result = await bookingCollection.insertOne(booking);
            res.send(result);
        })





    }
    finally {

    }

}

run().catch(console.dir)


app.get('/', (req, res) => {
    res.send('Hello From NNABI Hospital')
})

app.listen(port, () => {
    console.log(`listening on port ${port}`)
})

