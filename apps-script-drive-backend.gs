var SPREADSHEET_ID = '1Mx5zKqbVz3P8nqZhVc6vtpQ_Hb594k42NMoF9ascawI';
var DRIVE_ROOT_FOLDER_NAME = 'Arsen Lab Dosyalar';

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function ss_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function rootFolder_() {
  var folders = DriveApp.getFoldersByName(DRIVE_ROOT_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  var folder = DriveApp.createFolder(DRIVE_ROOT_FOLDER_NAME);
  folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return folder;
}

function childFolder_(name) {
  var root = rootFolder_();
  var clean = String(name || 'Genel').trim() || 'Genel';
  var folders = root.getFoldersByName(clean);
  if (folders.hasNext()) return folders.next();
  var folder = root.createFolder(clean);
  folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return folder;
}

function uploadedBy_(description) {
  var match = String(description || '').match(/Yukleyen: ([^\n]+)/);
  return match ? match[1] : '';
}

function fileInfo_(file, folderName) {
  var description = file.getDescription() || '';
  return {
    id: file.getId(),
    name: file.getName(),
    folder: folderName || 'Genel',
    mimeType: file.getMimeType(),
    size: file.getSize(),
    url: file.getUrl(),
    downloadUrl: 'https://drive.google.com/uc?export=download&id=' + file.getId(),
    created: file.getDateCreated(),
    updated: file.getLastUpdated(),
    description: description.replace(/Yukleyen: [^\n]+\n?/g, '').replace(/YuklemeTarihi: [^\n]+\n?/g, '').trim(),
    uploadedBy: uploadedBy_(description)
  };
}

function listFiles_() {
  var root = rootFolder_();
  var files = [];
  var rootFiles = root.getFiles();

  while (rootFiles.hasNext()) {
    files.push(fileInfo_(rootFiles.next(), 'Genel'));
  }

  var folders = root.getFolders();
  while (folders.hasNext()) {
    var folder = folders.next();
    var folderFiles = folder.getFiles();
    while (folderFiles.hasNext()) {
      files.push(fileInfo_(folderFiles.next(), folder.getName()));
    }
  }

  files.sort(function(a, b) {
    return new Date(b.created).getTime() - new Date(a.created).getTime();
  });
  return { ok: true, files: files };
}

function uploadFile_(data) {
  if (!data.base64 || !data.name) throw new Error('Dosya bilgisi eksik.');
  var folder = childFolder_(data.folder || 'Genel');
  var bytes = Utilities.base64Decode(data.base64);
  var blob = Utilities.newBlob(bytes, data.mimeType || 'application/octet-stream', data.name);
  var file = folder.createFile(blob);
  var descriptionParts = [];

  if (data.description) descriptionParts.push(data.description);
  descriptionParts.push('Yukleyen: ' + (data.uploadedBy || 'Bilinmiyor'));
  descriptionParts.push('YuklemeTarihi: ' + new Date().toISOString());

  file.setDescription(descriptionParts.join('\n'));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return { ok: true, file: fileInfo_(file, folder.getName()) };
}

function deleteFile_(data) {
  if (!data.id) throw new Error('Dosya id eksik.');
  DriveApp.getFileById(data.id).setTrashed(true);
  return { ok: true };
}

function readSheet_(sheetName) {
  var sheet = ss_().getSheetByName(sheetName);
  if (!sheet) throw new Error('Sheet bulunamadi: ' + sheetName);
  return { values: sheet.getDataRange().getValues() };
}

function writeSheet_(sheetName, values) {
  var sheet = ss_().getSheetByName(sheetName);
  if (!sheet) throw new Error('Sheet bulunamadi: ' + sheetName);
  sheet.clearContents();
  if (values && values.length) {
    sheet.getRange(1, 1, values.length, values[0].length).setValues(values);
  }
  return { ok: true };
}

function doGet(e) {
  try {
    var action = e.parameter.action;
    if (action === 'read') return json_(readSheet_(e.parameter.sheet));
    if (action === 'listFiles') return json_(listFiles_());
    return json_({ error: 'Bilinmeyen istek.' });
  } catch (err) {
    return json_({ error: err.message });
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents || '{}');
    if (data.action === 'write') return json_(writeSheet_(data.sheet, data.values));
    if (data.action === 'listFiles') return json_(listFiles_());
    if (data.action === 'uploadFile') return json_(uploadFile_(data));
    if (data.action === 'deleteFile') return json_(deleteFile_(data));
    return json_({ error: 'Bilinmeyen istek.' });
  } catch (err) {
    return json_({ error: err.message });
  }
}
