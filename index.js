require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 5151;
const botToken = process.env.botToken
const chatId = process.env.chatId
const url = process.env.MONGODB_URI
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname + "/public"));
app.use(cors({
    origin: process.env.cors,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));


// const uri = process.env.MONGODB_URI;
const uri = 'mongodb+srv://mavlyaan:Heliang3477@cluster0.dnblmkj.mongodb.net/test?retryWrites=true&w=majority'
console.log('connect to mongoDB...');
mongoose.connect(uri, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.log('Error connecting to MongoDB:', error);
    });

    const packageSchema = new mongoose.Schema({
        trackCode: {
            type: String,
            unique: true,
            index: true,
        },
        date: {
            type: String,
            index: true, // Индекс для ускорения запросов по дате
        },
        deliveryDate: String,
        status: String
    });

const Package = mongoose.model('Package', packageSchema);

app.post('/package_data', async (req, res) => {
    try {
        const newPackageData = req.body.data;
        // Вставка данных в базу данных
        const chunkSize = 100; // Размер порции данных
        for (let i = 0; i < newPackageData.length; i += chunkSize) {
            const chunk = newPackageData.slice(i, i + chunkSize);
            
            try {
                // Попытка вставки с обработкой дубликатов
                await Package.insertMany(chunk, { ordered: false, writeConcern: { wtimeout: 0 } });
            } catch (error) {
                // Обработка ошибки дубликата ключа
                if (error.code === 11000) {
                    console.error('Duplicate key error. Skipping duplicates.');
                } else {
                    throw error; // Перевыбросить другие ошибки
                }
            }
        }

        console.log('Data successfully added to MongoDB');
        res.json({ message: 'Data successfully added' });
    } catch (error) {
        console.error('Error saving data to MongoDB:', error);
        res.status(500).json({ message: 'Error saving data to MongoDB', error: error.message });
    }
});

app.get('/package_data', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const pageSize = 50;
        const filterDate = req.query.date;

        let query = {};

        if (filterDate) {
            // Если указана дата, добавляем условие фильтрации
            query.date = filterDate;
        }

        const data = await Package.find(query)
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .lean();

        res.json(data);
    } catch (error) {
        console.error('Error reading data from MongoDB:', error);
        res.status(500).json({ message: 'Error reading data' });
    }
});

app.get('/package_data/all', async (req, res) => {
    try {
        const filterDate = req.query.date;
        let query = {};

        if (filterDate) {
            // Если указана дата, добавляем условие фильтрации
            query.date = filterDate;
        }

        const data = await Package.find(query).lean();
        res.json(data);
    } catch (error) {
        console.error('Error reading all data from MongoDB:', error);
        res.status(500).json({ message: 'Error reading all data' });
    }
});

app.get('/package_data/pages', async (req, res) => {
    try {
        const pageSize = 10; // Размер страницы
        const totalCount = await Package.countDocuments();
        const totalPages = Math.ceil(totalCount / pageSize);
        res.json({ totalPages });
    } catch (error) {
        console.error('Error counting pages:', error);
        res.status(500).json({ message: 'Error counting pages' });
    }
});

app.post('/submit_form', async(req, res) => {
    const { name, phone, feedBackMessage } = req.body
    const message = `
Новая заявка:
Имя: ${name}
Номер: ${phone}
Сообщение: ${feedBackMessage}
    `
    try{
        const telegramResponse = await fetch (`${url}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message
            })
        })
        const telegramData = await telegramResponse.json();
        if (!telegramData.ok) {
            throw new Error('Ошибка при отправке в Telegram');
          }
          res.json({ success: true, message: 'Заявка успешно отправлена' });

    } catch(error){
        console.log(error);
    }
})

app.put('/update_status', async (req, res) => {
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
