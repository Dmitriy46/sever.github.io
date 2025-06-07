
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Диспетчер грузоперевозок')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Получить список листов
function getSheetNames() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheets().map(sheet => sheet.getName());
}

/// Получить данные листа
function getSheetData(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  const data = sheet.getRange('A2:F' + sheet.getLastRow()).getValues(); // Теперь 6 столбцов (A-F)
  return { data, sheetName };
}

// Сохранить данные
function saveToSheet(sheetName, data) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  sheet.getRange(2, 1, data.length, 6).setValues(data); // Теперь 6 столбцов
  return `Данные сохранены в "${sheetName}"`;
}

// Создать новый лист
function addNewSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const newSheet = ss.insertSheet(sheetName);
  newSheet.getRange("A1:F1").setValues([["Машина", "Груз", "Откуда", "Куда", "Заказчик", "Примечание"]]); // 6 заголовков
  return `Создан новый лист "${sheetName}"`;
}

// Удалить лист
function deleteSheet(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  ss.deleteSheet(sheet);
  return `Лист "${sheetName}" удален`;
}

// Переименовать лист
function renameSheet(oldName, newName) {
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(oldName).setName(newName);
  return `Лист переименован в "${newName}"`;
}

// Отправить в Telegram
function sendToTelegram(sheetName, message) {
 
  const botToken = "8095969906:AAFiVwky_-A_eWQWR6ybBdQfxi12ld4SqYI";
  const chatId = "-4752821134";
  
  const response = UrlFetchApp.fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({
      chat_id: chatId,
      text: `📅 ${sheetName}\n\n${message}`,
      parse_mode: "HTML"
    })
  });
  
  return "Данные отправлены в Telegram!";
}