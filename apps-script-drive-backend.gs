const SPREADSHEET_ID = '1Mx5zKqbVz3P8nqZhVc6vtpQ_Hb594k42NMoF9ascawI';
const DRIVE_ROOT_FOLDER_NAME = 'Arsen Lab Dosyalar';

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function ss_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function rootFolder_() {
  const folders = DriveApp.getFoldersByName(DRIVE_ROOT_FOLDER_NAME);
  if (folders.hasNext()) return folders.next();
  const folder = DriveApp.createFolder(DRIVE_ROOT_FOLDER_NAME);
  folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return folder;
}

function childFolder_(name) {
  const root = rootFolder_();
  const clean = String(name || 'Genel').trim() || 'Genel';
  const folders = root.getFoldersByName(clean);
  if (folders.hasNext()) return folders.next();
  const folder = root.createFolder(clean);
  folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return folder;
}

function fileInfo_(file, folderName) {
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
    description: file.getDescription() || '',
    uploadedBy: (file.getDescription().match(/Yukleyen: ([^\n]+)/) || [])[1] || ''
  };
}

function listFiles_() {
  const root = rootFolder_();
  const files = [];

  const rootFiles = root.getFiles();
  while (rootFiles.hasNext()) files.push(fileInfo_(rootFiles.next(), 'Genel'));

  const folders = root.getFolders();
  while (folders.hasNext()) {
    const folder = folders.next();
    const folderFiles = folder.getFiles();
    while (folderFiles.hasNext()) files.push(fileInfo_(folderFiles.next(), folder.getName()));
  }

  files.sort((a, b) => new Date(b.created) - new Date(a.created));
  return { ok: true, files };
}

function uploadFile_(data) {
  if (!data.base64 || !data.name) throw new Error('Dosya bilgisi eksik.');
  const folder = childFolder_(data.folder || 'Genel');
  const bytes = Utilities.base64Decode(data.base64);
  const blob = Utilities.newBlob(bytes, data.mimeType || 'application/octet-stream', data.name);
  const file = folder.createFile(blob);
  const description = [
    data.description || '',
    'Yukleyen: ' + (data.uploadedBy || 'Bilinmiyor'),
    'YuklemeTarihi: ' + new Date().toISOString()
  ].filter(Boolean).join('\n');
  file.setDescription(description);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return { ok: true, file: fileInfo_(file, folder.getName()) };
}

function deleteFile_(data) {
  if (!data.id) throw new Error('Dosya id eksik.');
  DriveApp.getFileById(data.id).setTrashed(true);
  return { ok: true };
}

function readSheet_(sheetName) {
  const sheet = ss_().getSheetByName(sheetName);
  if (!sheet) throw new Error('Sheet bulunamadı: ' + sheetName);
  return { values: sheet.getDataRange().getValues() };
}

function writeSheet_(sheetName, values) {
  const sheet = ss_().getSheetByName(sheetName);
  if (!sheet) throw new Error('Sheet bulunamadı: ' + sheetName);
  sheet.clearContents();
  if (values && values.length) {
    sheet.getRange(1, 1, values.length, values[0].length).setValues(values);
  }
  return { ok: true };
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    if (action === 'read') return json_(readSheet_(e.parameter.sheet));
    if (action === 'listFiles') return json_(listFiles_());
    return json_({ error: 'Bilinmeyen istek.' });
  } catch (err) {
    return json_({ error: err.message });
  }
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    if (data.action === 'write') return json_(writeSheet_(data.sheet, data.values));
    if (data.action === 'listFiles') return json_(listFiles_());
    if (data.action === 'uploadFile') return json_(uploadFile_(data));
    if (data.action === 'deleteFile') return json_(deleteFile_(data));
    return json_({ error: 'Bilinmeyen istek.' });
  } catch (err) {
    return json_({ error: err.message });
  }
}
