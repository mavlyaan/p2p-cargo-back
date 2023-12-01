require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5151;


app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname + "/public"));

app.use(cors({
    origin: 'https://p2p-cargo-7ab22fcf62bb.herokuapp.com',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

const uri = process.env.MONGODB_URI;

mongoose.connect(uri, { 
    
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

const packageSchema = new mongoose.Schema({
    trackCode: {
        type: String,
        unique: true, // Гарантирует уникальность значений
        index: true,
    },
    date: String,
    deliveryDate: String,
    status: String
});

const Package = mongoose.model('Package', packageSchema);

app.post('/package_data', async (req, res) => {
    try {
        const newPackageData = req.body.data;
        console.log('Received data on the server:', newPackageData);

        const savedPackages = await Package.insertMany(newPackageData);
        console.log('Data successfully added to MongoDB');
        res.json({ message: 'Data successfully added', savedPackages });
    } catch (error) {
        console.error('Error saving data to MongoDB:', error);
        res.status(500).json({ message: 'Error saving data to MongoDB', error: error.message });
    }
});


app.get('/package_data', async (req, res) => {
    try {
        const data = await Package.find().lean();
        res.json(data);
    } catch (error) {
        console.error('Error reading data from MongoDB:', error);
        res.status(500).json({ message: 'Error reading data' });
    }
});

app.put('/package_data', async (req, res) => {
    const updatedData = req.body;

    if (!updatedData || !Array.isArray(updatedData) || updatedData.length === 0) {
        res.status(400).json({ message: 'Please provide valid data for update.' });
        return;
    }

    try {
        const existingData = await Package.find();

        updatedData.forEach((update) => {
            const packageToUpdate = existingData.find((package) => package.trackCode === update.trackCode);

            if (packageToUpdate) {
                packageToUpdate.status = update.status;
            }
        });

        await Promise.all(existingData.map((package) => package.save()));

        console.log('Data successfully updated in MongoDB');
        res.json({ message: 'Data successfully updated' });
    } catch (error) {
        console.error('Error updating data in MongoDB:', error);
        res.status(500).json({ message: 'Error updating data' });
    }
});

app.delete('/delete_package_data', async (req, res) => {
    const trackCodesToDelete = req.body;

    try {
        await Package.deleteMany({ trackCode: { $in: trackCodesToDelete } });

        console.log('Data successfully deleted in MongoDB');
        res.json({ message: 'Data successfully deleted' });
    } catch (error) {
        console.error('Error deleting data from MongoDB:', error);
        res.status(500).json({ message: 'Error deleting data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
