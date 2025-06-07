const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());

app.use(express.static('public')); // Теперь сервер будет отдавать файлы из папки public
app.use(bodyParser.json());

// Имитация базы данных
let database = {
  sheets: ['10.06.2024', '11.06.2024'],
  data: {
    '10.06.2024': [
      ['Газель', 'Мебель', 'Москва', 'Санкт-Петербург', 'Иванов И.И.', 'Хрупкий груз'],
      ['Фура', 'Овощи', 'Краснодар', 'Москва', 'Петров П.П.', 'Срочно']
    ],
    '11.06.2024': [
      ['Камаз', 'Песок', 'Карьер', 'Стройка', 'Сидоров С.С.', '10 тонн']
    ]
  }
};

// API эндпоинты
app.get('/api/sheets', (req, res) => {
  res.json(database.sheets);
});

app.get('/api/sheets/:name', (req, res) => {
  const sheetName = req.params.name;
  res.json(database.data[sheetName] || []);
});

app.post('/api/sheets/:name', (req, res) => {
  const sheetName = req.params.name;
  database.data[sheetName] = req.body;
  res.json({ success: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});