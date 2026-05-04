var SPREADSHEET_ID = '1Mx5zKqbVz3P8nqZhVc6vtpQ_Hb594k42NMoF9ascawI';
var DRIVE_ROOT_FOLDER_NAME = 'Arsen Lab Dosyalar';
var OVERTIME_SHEET_NAME = 'Mesai';
var OVERTIME_HEADERS = ['id','kullanici','kullaniciAd','tarih','baslangic','bitis','molaDakika','toplamSaat','aciklama','durum','olusturma','onaylayan','onayTarihi','adminNot'];

function sheetByName(name) {
  var sh = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
  if (!sh) throw new Error('Sheet bulunamadi: ' + name);
  return sh;
}

function readSheet(name) {
  return { values: sheetByName(name).getDataRange().getValues() };
}

function writeSheet(name, values) {
  var sh = sheetByName(name);
  sh.clearContents();
  if (values && values.length) sh.getRange(1, 1, values.length, values[0].length).setValues(values);
  return { ok: true };
}

function rootFolder() {
  var it = DriveApp.getFoldersByName(DRIVE_ROOT_FOLDER_NAME);
  var folder = it.hasNext() ? it.next() : DriveApp.createFolder(DRIVE_ROOT_FOLDER_NAME);
  folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return folder;
}

function subFolder(name) {
  var parent = rootFolder();
  var folderName = String(name || 'Genel').trim() || 'Genel';
  var it = parent.getFoldersByName(folderName);
  var folder = it.hasNext() ? it.next() : parent.createFolder(folderName);
  folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return folder;
}

function metaValue(text, key) {
  var lines = String(text || '').split('\n');
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].indexOf(key + ': ') === 0) return lines[i].substring(key.length + 2);
  }
  return '';
}

function cleanDescription(text) {
  var lines = String(text || '').split('\n');
  var keep = [];
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].indexOf('Yukleyen: ') !== 0 && lines[i].indexOf('YuklemeTarihi: ') !== 0) keep.push(lines[i]);
  }
  return keep.join('\n').trim();
}

function info(file, folderName) {
  var desc = file.getDescription() || '';
  return {
    id: file.getId(), name: file.getName(), folder: folderName || 'Genel',
    mimeType: file.getMimeType(), size: file.getSize(), url: file.getUrl(),
    downloadUrl: 'https://drive.google.com/uc?export=download&id=' + file.getId(),
    created: file.getDateCreated(), updated: file.getLastUpdated(),
    description: cleanDescription(desc), uploadedBy: metaValue(desc, 'Yukleyen')
  };
}

function listFiles() {
  var files = [], root = rootFolder(), rootFiles = root.getFiles();
  while (rootFiles.hasNext()) files.push(info(rootFiles.next(), 'Genel'));
  var folders = root.getFolders();
  while (folders.hasNext()) {
    var folder = folders.next(), folderFiles = folder.getFiles();
    while (folderFiles.hasNext()) files.push(info(folderFiles.next(), folder.getName()));
  }
  files.sort(function(a, b) { return new Date(b.created).getTime() - new Date(a.created).getTime(); });
  return { ok: true, files: files };
}

function uploadFile(data) {
  if (!data.base64 || !data.name) throw new Error('Dosya bilgisi eksik.');
  var folder = subFolder(data.folder || 'Genel');
  var blob = Utilities.newBlob(Utilities.base64Decode(data.base64), data.mimeType || 'application/octet-stream', data.name);
  var file = folder.createFile(blob);
  var desc = (data.description || '') + '\nYukleyen: ' + (data.uploadedBy || 'Bilinmiyor') + '\nYuklemeTarihi: ' + new Date().toISOString();
  file.setDescription(desc);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return { ok: true, file: info(file, folder.getName()) };
}

function deleteFile(data) {
  if (!data.id) throw new Error('Dosya id eksik.');
  DriveApp.getFileById(data.id).setTrashed(true);
  return { ok: true };
}

function overtimeSheet() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sh = ss.getSheetByName(OVERTIME_SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(OVERTIME_SHEET_NAME);
    sh.getRange(1, 1, 1, OVERTIME_HEADERS.length).setValues([OVERTIME_HEADERS]);
    return sh;
  }
  if (sh.getLastRow() === 0 || sh.getRange(1, 1).getValue() !== 'id') {
    sh.clearContents();
    sh.getRange(1, 1, 1, OVERTIME_HEADERS.length).setValues([OVERTIME_HEADERS]);
  }
  return sh;
}

function overtimeRows() {
  var sh = overtimeSheet();
  var values = sh.getDataRange().getValues();
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var obj = {};
    for (var j = 0; j < OVERTIME_HEADERS.length; j++) obj[OVERTIME_HEADERS[j]] = values[i][j] === undefined ? '' : String(values[i][j]);
    if (obj.id) rows.push(obj);
  }
  return rows;
}

function writeOvertimeRows(rows) {
  var sh = overtimeSheet();
  var values = [OVERTIME_HEADERS];
  for (var i = 0; i < rows.length; i++) {
    var row = [];
    for (var j = 0; j < OVERTIME_HEADERS.length; j++) row.push(rows[i][OVERTIME_HEADERS[j]] || '');
    values.push(row);
  }
  sh.clearContents();
  sh.getRange(1, 1, values.length, OVERTIME_HEADERS.length).setValues(values);
}

function newId() {
  return Utilities.getUuid().replace(/-/g, '').substring(0, 14);
}

function listOvertime() {
  return { ok: true, records: overtimeRows() };
}

function createOvertime(data) {
  if (!data.kullanici || !data.tarih || !data.baslangic || !data.bitis) throw new Error('Mesai bilgisi eksik.');
  var rows = overtimeRows();
  rows.push({
    id: newId(),
    kullanici: data.kullanici,
    kullaniciAd: data.kullaniciAd || data.kullanici,
    tarih: data.tarih,
    baslangic: data.baslangic,
    bitis: data.bitis,
    molaDakika: data.molaDakika || '0',
    toplamSaat: data.toplamSaat || '0',
    aciklama: data.aciklama || '',
    durum: 'Bekliyor',
    olusturma: new Date().toISOString(),
    onaylayan: '',
    onayTarihi: '',
    adminNot: ''
  });
  writeOvertimeRows(rows);
  return { ok: true, record: rows[rows.length - 1] };
}

function updateOvertimeStatus(data) {
  if (!data.id || !data.durum) throw new Error('Onay bilgisi eksik.');
  var rows = overtimeRows();
  var found = false;
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].id === data.id) {
      rows[i].durum = data.durum;
      rows[i].onaylayan = data.onaylayan || '';
      rows[i].onayTarihi = new Date().toISOString();
      rows[i].adminNot = data.adminNot || '';
      found = true;
      break;
    }
  }
  if (!found) throw new Error('Mesai kaydı bulunamadı.');
  writeOvertimeRows(rows);
  return { ok: true };
}

function doGet(e) {
  var result;
  try {
    if (e.parameter.action === 'read') result = readSheet(e.parameter.sheet);
    else if (e.parameter.action === 'listFiles') result = listFiles();
    else if (e.parameter.action === 'listOvertime') result = listOvertime();
    else result = { error: 'Bilinmeyen istek.' };
  } catch (err) {
    result = { error: err.message };
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var result;
  try {
    var data = JSON.parse(e.postData.contents || '{}');
    if (data.action === 'write') result = writeSheet(data.sheet, data.values);
    else if (data.action === 'listFiles') result = listFiles();
    else if (data.action === 'uploadFile') result = uploadFile(data);
    else if (data.action === 'deleteFile') result = deleteFile(data);
    else if (data.action === 'listOvertime') result = listOvertime();
    else if (data.action === 'createOvertime') result = createOvertime(data);
    else if (data.action === 'updateOvertimeStatus') result = updateOvertimeStatus(data);
    else result = { error: 'Bilinmeyen istek.' };
  } catch (err) {
    result = { error: err.message };
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}
