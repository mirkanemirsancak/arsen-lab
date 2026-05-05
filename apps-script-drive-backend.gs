var SPREADSHEET_ID = '1Mx5zKqbVz3P8nqZhVc6vtpQ_Hb594k42NMoF9ascawI';
var DRIVE_ROOT_FOLDER_NAME = 'Arsen Lab Dosyalar';
var OVERTIME_SHEET_NAME = 'Mesai';
var OVERTIME_HEADERS = ['id','kullanici','kullaniciAd','tarih','baslangic','bitis','molaDakika','toplamSaat','aciklama','durum','olusturma','onaylayan','onayTarihi','adminNot'];
var TOKEN_TTL_MS = 12 * 60 * 60 * 1000;

function json(result) {
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function normEmail(v) {
  return String(v || '').trim().toLowerCase();
}

function sheetByName(name) {
  var sh = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(name);
  if (!sh) throw new Error('Sheet bulunamadi: ' + name);
  return sh;
}

function rowsFromSheet(name) {
  var values = sheetByName(name).getDataRange().getValues();
  if (!values.length) return { headers: [], rows: [] };
  var headers = values[0].map(function(h) { return String(h || ''); });
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) obj[headers[j]] = values[i][j] === undefined ? '' : String(values[i][j]);
    rows.push(obj);
  }
  return { headers: headers, rows: rows };
}

function usersData() {
  return rowsFromSheet('Users').rows;
}

function activeEmails() {
  var users = usersData(), emails = [];
  for (var i = 0; i < users.length; i++) {
    if ((users[i].active === true || users[i].active === 'true') && normEmail(users[i].email)) emails.push(normEmail(users[i].email));
  }
  return emails;
}

function publicUser(user) {
  return {
    id: user.id || '',
    username: user.username || '',
    role: user.role || 'user',
    ad: user.ad || user.username || '',
    email: normEmail(user.email),
    active: user.active === true || user.active === 'true' ? 'true' : 'false',
    olusturma: user.olusturma || ''
  };
}

function authSecret() {
  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty('AUTH_SECRET');
  if (!secret) {
    secret = Utilities.getUuid() + Utilities.getUuid();
    props.setProperty('AUTH_SECRET', secret);
  }
  return secret;
}

function b64Text(text) {
  return Utilities.base64EncodeWebSafe(text).replace(/=+$/g, '');
}

function b64Bytes(bytes) {
  return Utilities.base64EncodeWebSafe(bytes).replace(/=+$/g, '');
}

function unb64Text(text) {
  var padded = text + Array((4 - text.length % 4) % 4 + 1).join('=');
  return Utilities.newBlob(Utilities.base64DecodeWebSafe(padded)).getDataAsString();
}

function sign(text) {
  return b64Bytes(Utilities.computeHmacSha256Signature(text, authSecret()));
}

function makeToken(user) {
  var payload = b64Text(JSON.stringify({ id: user.id, username: user.username, exp: Date.now() + TOKEN_TTL_MS }));
  return payload + '.' + sign(payload);
}

function requireAuth(token) {
  if (!token) throw new Error('Oturum gerekli.');
  var parts = String(token).split('.');
  if (parts.length !== 2 || sign(parts[0]) !== parts[1]) throw new Error('Oturum gecersiz.');
  var payload = JSON.parse(unb64Text(parts[0]));
  if (!payload.exp || payload.exp < Date.now()) throw new Error('Oturum suresi doldu.');
  var users = usersData();
  for (var i = 0; i < users.length; i++) {
    if (users[i].id === payload.id && users[i].username === payload.username) {
      if (!(users[i].active === true || users[i].active === 'true')) throw new Error('Kullanici pasif.');
      if (!normEmail(users[i].email)) throw new Error('Google e-posta tanimli degil.');
      return users[i];
    }
  }
  throw new Error('Kullanici bulunamadi.');
}

function login(data) {
  var username = String(data.username || '').trim();
  var passwordHash = String(data.passwordHash || '');
  var users = usersData();
  for (var i = 0; i < users.length; i++) {
    if (users[i].username === username && users[i].passwordHash === passwordHash && (users[i].active === true || users[i].active === 'true')) {
      if (!normEmail(users[i].email)) throw new Error('Bu kullanici icin Google e-posta tanimli degil. Admin e-posta eklemeden sisteme erisim verilemez.');
      return { ok: true, token: makeToken(users[i]), user: publicUser(users[i]) };
    }
  }
  throw new Error('Kullanici adi veya sifre hatali.');
}

function valuesForUsers(user) {
  var data = rowsFromSheet('Users');
  var headers = data.headers;
  var values = [headers];
  for (var i = 0; i < data.rows.length; i++) {
    var row = [];
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j];
      row.push(user.role === 'admin' ? (data.rows[i][key] || '') : (key === 'passwordHash' ? '' : (data.rows[i][key] || '')));
    }
    values.push(row);
  }
  return { values: values };
}

function readSheet(name, user) {
  if (name === 'Users') return valuesForUsers(user);
  return { values: sheetByName(name).getDataRange().getValues() };
}

function writeSheet(name, values, user) {
  if (name === 'Users' && user.role !== 'admin') throw new Error('Kullanici yonetimi icin admin yetkisi gerekli.');
  var sh = sheetByName(name);
  sh.clearContents();
  if (values && values.length) sh.getRange(1, 1, values.length, values[0].length).setValues(values);
  return { ok: true };
}

function restrictItem(item) {
  try {
    item.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.NONE);
  } catch (err) {
    try { item.setSharing(DriveApp.Access.PRIVATE, DriveApp.Permission.VIEW); } catch (ignored) {}
  }
}

function shareWithActiveUsers(item) {
  restrictItem(item);
  var emails = activeEmails();
  for (var i = 0; i < emails.length; i++) {
    try { item.addViewer(emails[i]); } catch (ignored) {}
  }
}

function rootFolder() {
  var it = DriveApp.getFoldersByName(DRIVE_ROOT_FOLDER_NAME);
  var folder = it.hasNext() ? it.next() : DriveApp.createFolder(DRIVE_ROOT_FOLDER_NAME);
  shareWithActiveUsers(folder);
  return folder;
}

function subFolder(name) {
  var parent = rootFolder();
  var folderName = String(name || 'Genel').trim() || 'Genel';
  var it = parent.getFoldersByName(folderName);
  var folder = it.hasNext() ? it.next() : parent.createFolder(folderName);
  shareWithActiveUsers(folder);
  return folder;
}

function metaValue(text, key) {
  var lines = String(text || '').split('\n');
  for (var i = 0; i < lines.length; i++) if (lines[i].indexOf(key + ': ') === 0) return lines[i].substring(key.length + 2);
  return '';
}

function cleanDescription(text) {
  var lines = String(text || '').split('\n'), keep = [];
  for (var i = 0; i < lines.length; i++) if (lines[i].indexOf('Yukleyen: ') !== 0 && lines[i].indexOf('YuklemeTarihi: ') !== 0) keep.push(lines[i]);
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
  while (rootFiles.hasNext()) {
    var rootFile = rootFiles.next();
    shareWithActiveUsers(rootFile);
    files.push(info(rootFile, 'Genel'));
  }
  var folders = root.getFolders();
  while (folders.hasNext()) {
    var folder = folders.next(), folderFiles = folder.getFiles();
    shareWithActiveUsers(folder);
    while (folderFiles.hasNext()) {
      var file = folderFiles.next();
      shareWithActiveUsers(file);
      files.push(info(file, folder.getName()));
    }
  }
  files.sort(function(a, b) { return new Date(b.created).getTime() - new Date(a.created).getTime(); });
  return { ok: true, files: files };
}

function uploadFile(data, user) {
  if (!data.base64 || !data.name) throw new Error('Dosya bilgisi eksik.');
  var folder = subFolder(data.folder || 'Genel');
  var blob = Utilities.newBlob(Utilities.base64Decode(data.base64), data.mimeType || 'application/octet-stream', data.name);
  var file = folder.createFile(blob);
  var desc = (data.description || '') + '\nYukleyen: ' + (user.ad || user.username || 'Bilinmiyor') + '\nYuklemeTarihi: ' + new Date().toISOString();
  file.setDescription(desc);
  shareWithActiveUsers(file);
  return { ok: true, file: info(file, folder.getName()) };
}

function deleteFile(data, user) {
  if (user.role !== 'admin') throw new Error('Dosya silmek icin admin yetkisi gerekli.');
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
  var values = overtimeSheet().getDataRange().getValues(), rows = [];
  for (var i = 1; i < values.length; i++) {
    var obj = {};
    for (var j = 0; j < OVERTIME_HEADERS.length; j++) obj[OVERTIME_HEADERS[j]] = values[i][j] === undefined ? '' : String(values[i][j]);
    if (obj.id) rows.push(obj);
  }
  return rows;
}

function writeOvertimeRows(rows) {
  var values = [OVERTIME_HEADERS];
  for (var i = 0; i < rows.length; i++) {
    var row = [];
    for (var j = 0; j < OVERTIME_HEADERS.length; j++) row.push(rows[i][OVERTIME_HEADERS[j]] || '');
    values.push(row);
  }
  var sh = overtimeSheet();
  sh.clearContents();
  sh.getRange(1, 1, values.length, OVERTIME_HEADERS.length).setValues(values);
}

function listOvertime(user) {
  var rows = overtimeRows();
  if (user.role !== 'admin') rows = rows.filter(function(r) { return r.kullanici === user.username; });
  return { ok: true, records: rows };
}

function createOvertime(data, user) {
  if (!data.tarih || !data.baslangic || !data.bitis) throw new Error('Mesai bilgisi eksik.');
  var rows = overtimeRows();
  rows.push({
    id: Utilities.getUuid().replace(/-/g, '').substring(0, 14),
    kullanici: user.username,
    kullaniciAd: user.ad || user.username,
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

function updateOvertimeStatus(data, user) {
  if (user.role !== 'admin') throw new Error('Mesai onayi icin admin yetkisi gerekli.');
  if (!data.id || !data.durum) throw new Error('Onay bilgisi eksik.');
  var rows = overtimeRows(), found = false;
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].id === data.id) {
      rows[i].durum = data.durum;
      rows[i].onaylayan = user.ad || user.username;
      rows[i].onayTarihi = new Date().toISOString();
      rows[i].adminNot = data.adminNot || '';
      found = true;
      break;
    }
  }
  if (!found) throw new Error('Mesai kaydi bulunamadi.');
  writeOvertimeRows(rows);
  return { ok: true };
}

function doGet(e) {
  var result;
  try {
    var user = requireAuth(e.parameter.token);
    if (e.parameter.action === 'read') result = readSheet(e.parameter.sheet, user);
    else if (e.parameter.action === 'listFiles') result = listFiles(user);
    else if (e.parameter.action === 'listOvertime') result = listOvertime(user);
    else result = { error: 'Bilinmeyen istek.' };
  } catch (err) {
    result = { error: err.message };
  }
  return json(result);
}

function doPost(e) {
  var result;
  try {
    var data = JSON.parse(e.postData.contents || '{}');
    if (data.action === 'login') result = login(data);
    else {
      var user = requireAuth(data.token);
      if (data.action === 'write') result = writeSheet(data.sheet, data.values, user);
      else if (data.action === 'listFiles') result = listFiles(user);
      else if (data.action === 'uploadFile') result = uploadFile(data, user);
      else if (data.action === 'deleteFile') result = deleteFile(data, user);
      else if (data.action === 'listOvertime') result = listOvertime(user);
      else if (data.action === 'createOvertime') result = createOvertime(data, user);
      else if (data.action === 'updateOvertimeStatus') result = updateOvertimeStatus(data, user);
      else result = { error: 'Bilinmeyen istek.' };
    }
  } catch (err) {
    result = { error: err.message };
  }
  return json(result);
}
