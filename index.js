const express = require('express')
const cors = require('cors');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@nnabi-hospital.metbw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
    try {
        await client.connect()
        console.log("DB Connected")

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

