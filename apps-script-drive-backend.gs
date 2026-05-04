var SPREADSHEET_ID = '1Mx5zKqbVz3P8nqZhVc6vtpQ_Hb594k42NMoF9ascawI';
var DRIVE_ROOT_FOLDER_NAME = 'Arsen Lab Dosyalar';

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

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

function doGet(e) {
  try {
    if (e.parameter.action === 'read') return out(readSheet(e.parameter.sheet));
    if (e.parameter.action === 'listFiles') return out(listFiles());
    return out({ error: 'Bilinmeyen istek.' });
  } catch (err) {
    return out({ error: err.message });
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents || '{}');
    if (data.action === 'write') return out(writeSheet(data.sheet, data.values));
    if (data.action === 'listFiles') return out(listFiles());
    if (data.action === 'uploadFile') return out(uploadFile(data));
    if (data.action === 'deleteFile') return out(deleteFile(data));
    return out({ error: 'Bilinmeyen istek.' });
  } catch (err) {
    return out({ error: err.message });
  }
}
