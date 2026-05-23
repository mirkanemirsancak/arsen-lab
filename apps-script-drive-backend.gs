var SPREADSHEET_ID = '1Mx5zKqbVz3P8nqZhVc6vtpQ_Hb594k42NMoF9ascawI';
var DRIVE_ROOT_FOLDER_NAME = 'Arsen Lab Dosyalar';
var OVERTIME_SHEET_NAME = 'Mesai';
var OVERTIME_HEADERS = ['id','company','kullanici','kullaniciAd','tarih','baslangic','bitis','molaDakika','toplamSaat','aciklama','durum','olusturma','onaylayan','onayTarihi','adminNot'];
var TOKEN_TTL_MS = 12 * 60 * 60 * 1000;
var COMPANIES = ['fuwell', 'syntegra'];
var KURUMS = ['arsen', 'fuwell', 'syntegra'];
var UMBRELLA_KURUM = 'arsen';
var DEFAULT_SHEET_HEADERS = {
  Users: ['id','username','passwordHash','role','kurum','ad','email','companyAccess','defaultCompany','active','olusturma'],
  Stok: ['id','company','ad','marka','kategori','lab','dolap','raf','miktar','birim','kritikSeviye','maksimum','skt','konum','not','sonGuncelleme'],
  StokHareketleri: ['id','company','stokId','stokAd','tip','miktar','birim','oncekiMiktar','sonrakiMiktar','tarih','aciklama','kullanici'],
  Metodlar: ['id','company','baslik','tur','kategori','hammadde','kaynak','kod','adimlar','not','aktif','tarih','kullanici'],
  Cikti: ['id','company','batchId','ad','hammadde','hammaddeMiktar','hammaddeBirim','ciktiMiktar','ciktiBirim','tarih','operator','kosullar','not','kullanici'],
  Analiz: ['id','company','numuneId','numune','tur','yontem','sonuc','birim','tarih','analist','batchId','not','kullanici'],
  Ekipman: ['id','company','ad','model','seriNo','lab','konum','kalibrasyonTarihi','kalibrasyonFrekans','bakimTarihi','sorumlu','durum','not','kullanici'],
  KalibTarihce: ['id','company','ekipmanId','ekipmanAd','tarih','yapan','not','kullanici'],
  Temizlik: ['id','company','gorev','lab','sorumlu','periyot','sonYapilma','sonrakiTarih','durum','not'],
  Gorevler: ['id','company','baslik','kategori','atanan','atayan','tarih','basTarih','bitisTarih','oncelik','durum','aciklama','kullanici'],
  GunlukLog: ['id','company','kullanici','kullaniciAd','tarih','kategori','baslik','icerik','duzenlendi','duzenlemeTarihi'],
  IletisimKisileri: ['id','company','ad','kurum','unvan','telefon','email','kategori','sonGorusme','not','kullanici','guncelleme'],
  Bildirimler: ['id','company','kime','baslik','mesaj','tur','okundu','tarih','olusturan','sayfa','kayitId','emailGonderildi'],
  DuzenlemeLoglari: ['id','company','modul','kayitId','kullanici','tarih','onceki','sonraki'],
  SynProjeler: ['id','company','projeKodu','musteri','projeAdi','arsenSorumlu','syntegraSorumlu','asama','durum','oncelik','baslangic','hedefTermin','butce','gercekMaliyet','ilerleme','sartnameLink','cizimLink','sozlesmeLink','not','olusturan','guncelleme'],
  SynTimeline: ['id','company','projeId','isKalemi','asama','sorumlu','baslangic','bitis','bagimliIs','durum','ilerleme','risk','not','kullanici'],
  SynSatinalma: ['id','company','projeId','kalem','tedarikci','miktar','birim','butce','teklif','gercekMaliyet','paraBirimi','termin','durum','evrakLink','not','kullanici'],
  SynMaliyet: ['id','company','projeId','kategori','aciklama','planlanan','gerceklesen','paraBirimi','tarih','faturaLink','not','kullanici'],
  SynRaporlar: ['id','company','projeId','raporTarihi','baslik','ilerleme','tamamlanan','riskler','sonrakiAdimlar','fotoLink','sertifikaLink','paylasimDurumu','kullanici'],
  Syn2_Projeler: ['id','company','projectCode','projeAdi','musteri','musteriKisaltma','sorumlu','baslangic','termin','durum','sartnameDosyalar','tasarimDosyalar','driveFolderId','aciklama','olusturan','olusturma','guncelleme'],
  Syn2_Muhendislik: ['id','company','projectCode','durum','pidDosyalar','cizimDosyalar','revizyonNumarasi','revizyonGecmisi','sonGonderim','sonKararKullanici','sonKararTarih','satinalmaSorumlu','olusturan','olusturma','guncelleme'],
  Syn2_Ekipman: ['id','company','projectCode','body','altParca','adet','olcu','malzemeCinsi','malzemeKalitesi','amac','not','termin','uretimTermin','siraNo','kullanici','olusturma','guncelleme'],
  Syn2_Teklif: ['id','company','projectCode','ekipmanId','tedarikci','fiyat','paraBirimi','termin','odeme','teslimat','kazanan','kazanmaSebebi','onayDurumu','onayKullanici','onayTarihi','onayNot','durum','kullanici','olusturma','guncelleme'],
  Syn2_Gantt: ['id','company','projectCode','tip','body','baslik','baslangic','bitis','kullanici','olusturma','guncelleme']
};

function json(result) {
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function normEmail(v) {
  return String(v || '').trim().toLowerCase();
}

function normalizeCompany(company) {
  company = String(company || 'fuwell').trim().toLowerCase();
  return COMPANIES.indexOf(company) >= 0 ? company : 'fuwell';
}

function normalizeKurum(kurum) {
  kurum = String(kurum || '').trim().toLowerCase();
  return KURUMS.indexOf(kurum) >= 0 ? kurum : '';
}

function userKurum(user) {
  var k = normalizeKurum(user.kurum);
  if (k) return k;
  // Backwards-compat: if kurum not set, infer from role + companyAccess.
  // admin without explicit kurum → Arşen şemsiyesi (oversight); regular user → defaultCompany or first allowed company.
  if (user.role === 'admin') return UMBRELLA_KURUM;
  var raw = String(user.companyAccess || '').trim().toLowerCase();
  if (raw.indexOf(',') >= 0) return UMBRELLA_KURUM; // had multi-company access
  var def = normalizeCompany(user.defaultCompany || raw || 'fuwell');
  return def;
}

function isUmbrella(user) { return userKurum(user) === UMBRELLA_KURUM; }

function companyAccess(user) {
  if (isUmbrella(user)) return COMPANIES.slice();
  var k = userKurum(user);
  return COMPANIES.indexOf(k) >= 0 ? [k] : ['fuwell'];
}

function requireCompany(user, company) {
  company = normalizeCompany(company);
  if (companyAccess(user).indexOf(company) < 0) throw new Error('Bu operasyon alanina erisim yetkiniz yok: ' + company);
  return company;
}

// ── Request-scoped caching (module level, re-used by V8 isolate when possible) ──
var __SS = null;
var __SHEETS = {};
var __HDR_VERIFIED = {};

function _ss() {
  if (!__SS) __SS = SpreadsheetApp.openById(SPREADSHEET_ID);
  return __SS;
}

function ensureHeaders(sh, headers) {
  if (!headers || !headers.length) return;
  var name = sh.getName();
  if (__HDR_VERIFIED[name]) return;
  // Cross-request flag in CacheService — once verified we don't re-check for an hour
  try {
    var c = CacheService.getScriptCache();
    if (c.get('hdr_' + name)) { __HDR_VERIFIED[name] = true; return; }
  } catch (e) {}
  if (sh.getLastRow() === 0 || !sh.getRange(1, 1).getValue()) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    var current = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), 1)).getValues()[0].map(function(h) { return String(h || ''); });
    var changed = false;
    for (var i = 0; i < headers.length; i++) {
      if (current.indexOf(headers[i]) < 0) { current.push(headers[i]); changed = true; }
    }
    if (changed) sh.getRange(1, 1, 1, current.length).setValues([current]);
  }
  __HDR_VERIFIED[name] = true;
  try { CacheService.getScriptCache().put('hdr_' + name, '1', 3600); } catch (e) {}
}

function sheetByName(name) {
  if (__SHEETS[name]) return __SHEETS[name];
  var ss = _ss();
  var sh = ss.getSheetByName(name);
  var headers = DEFAULT_SHEET_HEADERS[name];
  if (!sh && headers) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    __SHEETS[name] = sh;
    __HDR_VERIFIED[name] = true;
    return sh;
  }
  if (!sh) throw new Error('Sheet bulunamadi: ' + name);
  ensureHeaders(sh, headers);
  __SHEETS[name] = sh;
  return sh;
}

// ── Cross-request batch cache (CacheService, invalidated on writes) ──
function _batchVersion() {
  try {
    var c = CacheService.getScriptCache();
    var v = c.get('bv');
    if (!v) { v = '1'; c.put('bv', v, 21600); }
    return v;
  } catch (e) { return '0'; }
}
function _bumpBatchVersion() {
  try {
    var c = CacheService.getScriptCache();
    var cur = parseInt(c.get('bv') || '0', 10) + 1;
    c.put('bv', String(cur), 21600);
  } catch (e) {}
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
  var kurum = userKurum(user);
  var accessList = (kurum === UMBRELLA_KURUM) ? COMPANIES.slice() : [(COMPANIES.indexOf(kurum) >= 0 ? kurum : 'fuwell')];
  var def = normalizeCompany(user.defaultCompany || accessList[0]);
  if (accessList.indexOf(def) < 0) def = accessList[0];
  return {
    id: user.id || '',
    username: user.username || '',
    role: user.role || 'user',
    kurum: kurum,
    ad: user.ad || user.username || '',
    email: normEmail(user.email),
    companyAccess: accessList.join(','),
    defaultCompany: def,
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

function valuesForNotifications(user) {
  var data = rowsFromSheet('Bildirimler');
  var headers = data.headers.length ? data.headers : DEFAULT_SHEET_HEADERS.Bildirimler;
  var values = [headers];
  for (var i = 0; i < data.rows.length; i++) {
    if (data.rows[i].kime !== user.username) continue;
    var row = [];
    for (var j = 0; j < headers.length; j++) row.push(data.rows[i][headers[j]] || '');
    values.push(row);
  }
  return { values: values };
}

function valuesForCompany(name, user, company) {
  company = requireCompany(user, company);
  var sh = sheetByName(name);
  var values = sh.getDataRange().getValues();
  if (!values.length) return { values: [] };
  var headers = values[0].map(function(h) { return String(h || ''); });
  var cIdx = headers.indexOf('company');
  if (cIdx < 0) return { values: values };
  var out = [headers];
  for (var i = 1; i < values.length; i++) {
    var rowCompany = normalizeCompany(values[i][cIdx] || 'fuwell');
    if (rowCompany === company) out.push(values[i]);
  }
  return { values: out };
}

function readSheet(name, user, company) {
  if (name === 'Users') return valuesForUsers(user);
  if (name === 'Bildirimler') return valuesForNotifications(user);
  return valuesForCompany(name, user, company);
}

function readSheets(names, user, company) {
  var normCompany = normalizeCompany(company);
  var key = 'br_' + (user.username || '') + '_' + normCompany + '_' + _batchVersion() + '_' + names.length;
  var cache = null;
  try { cache = CacheService.getUserCache(); } catch (e) {}
  if (cache) {
    var hit = cache.get(key);
    if (hit) {
      try { return JSON.parse(hit); } catch (e) {}
    }
  }
  var result = {};
  for (var i = 0; i < names.length; i++) {
    var name = String(names[i] || '');
    if (!name) continue;
    try {
      result[name] = readSheet(name, user, company).values;
    } catch (perSheetErr) {
      // Missing sheet (e.g. newly added in a frontend release that hasn't been backend-deployed yet) or
      // any other per-sheet failure: return empty so the rest of the batch still succeeds. The client
      // will see [] for this sheet and recover next sync when the sheet is created.
      result[name] = [];
    }
  }
  var out = { valuesBySheet: result };
  if (cache) {
    try {
      var s = JSON.stringify(out);
      if (s.length < 95000) cache.put(key, s, 25);
    } catch (e) {}
  }
  return out;
}

function writeSheet(name, values, user, company) {
  if (name === 'Users' && user.role !== 'admin') throw new Error('Kullanici yonetimi icin admin yetkisi gerekli.');
  if (name === 'Bildirimler') throw new Error('Bildirimler icin bildirim aksiyonlarini kullanin.');
  company = requireCompany(user, company);
  var sh = sheetByName(name);
  var headers = values && values.length ? values[0].map(function(h) { return String(h || ''); }) : [];
  var cIdx = headers.indexOf('company');
  if (name !== 'Users' && cIdx >= 0) {
    for (var v = 1; v < values.length; v++) values[v][cIdx] = company;
    var existing = sh.getDataRange().getValues();
    if (existing.length) {
      var existingHeaders = existing[0].map(function(h) { return String(h || ''); });
      var existingCompanyIdx = existingHeaders.indexOf('company');
      var merged = [headers];
      for (var i = 1; i < existing.length; i++) {
        var rowCompany = existingCompanyIdx >= 0 ? normalizeCompany(existing[i][existingCompanyIdx] || 'fuwell') : 'fuwell';
        if (rowCompany !== company) {
          var mapped = [];
          for (var j = 0; j < headers.length; j++) {
            var oldIdx = existingHeaders.indexOf(headers[j]);
            mapped.push(oldIdx >= 0 ? existing[i][oldIdx] : '');
          }
          merged.push(mapped);
        }
      }
      for (var r = 1; r < values.length; r++) merged.push(values[r]);
      values = merged;
    }
  }
  sh.clearContents();
  if (values && values.length) sh.getRange(1, 1, values.length, values[0].length).setValues(values);
  _bumpBatchVersion();
  return { ok: true };
}

function markNotificationsRead(data, user) {
  var sheetData = rowsFromSheet('Bildirimler');
  var headers = sheetData.headers.length ? sheetData.headers : DEFAULT_SHEET_HEADERS.Bildirimler;
  var ids = data.ids || [];
  var markAll = data.all === true || data.all === 'true';
  for (var i = 0; i < sheetData.rows.length; i++) {
    var row = sheetData.rows[i];
    if (row.kime !== user.username) continue;
    if (markAll || ids.indexOf(row.id) >= 0) row.okundu = 'true';
  }
  var values = [headers];
  for (var r = 0; r < sheetData.rows.length; r++) {
    var out = [];
    for (var c = 0; c < headers.length; c++) out.push(sheetData.rows[r][headers[c]] || '');
    values.push(out);
  }
  var sh = sheetByName('Bildirimler');
  sh.clearContents();
  if (values.length) sh.getRange(1, 1, values.length, headers.length).setValues(values);
  _bumpBatchVersion();
  return { ok: true };
}

function activeUsers() {
  return usersData().filter(function(u) { return (u.active === true || u.active === 'true') && normEmail(u.email); });
}

function findUser(username) {
  var users = usersData();
  for (var i = 0; i < users.length; i++) if (users[i].username === username) return users[i];
  return null;
}

function appendNotification(target, data, user) {
  var headers = DEFAULT_SHEET_HEADERS.Bildirimler;
  var emailSent = 'false';
  if (data.sendEmail && normEmail(target.email)) {
    try {
      MailApp.sendEmail({
        to: normEmail(target.email),
        subject: '[Arsen Lab] ' + (data.baslik || 'Bildirim'),
        body: (data.mesaj || '') + '\n\nGönderen: ' + (user.ad || user.username || 'Sistem') + '\nArsen Lab Takip Sistemi'
      });
      emailSent = 'true';
    } catch (ignored) {}
  }
  var row = {
    id: Utilities.getUuid().replace(/-/g, '').substring(0, 14),
    company: normalizeCompany(data.company || 'fuwell'),
    kime: target.username,
    baslik: data.baslik || 'Bildirim',
    mesaj: data.mesaj || '',
    tur: data.tur || 'Sistem',
    okundu: 'false',
    tarih: new Date().toISOString(),
    olusturan: user.ad || user.username || 'Sistem',
    sayfa: data.sayfa || '',
    kayitId: data.kayitId || '',
    emailGonderildi: emailSent
  };
  sheetByName('Bildirimler').appendRow(headers.map(function(h) { return row[h] || ''; }));
  _bumpBatchVersion();
  return row;
}

function createNotification(data, user) {
  if (user.role !== 'admin') throw new Error('Bildirim gondermek icin admin yetkisi gerekli.');
  var company = requireCompany(user, data.company);
  if (!data.baslik || !data.mesaj) throw new Error('Bildirim basligi ve mesaji gerekli.');
  var sender_isUmbrella = isUmbrella(user);
  var recipients = data.recipients || [];
  var targets = [];
  if (recipients.indexOf('all') >= 0) targets = activeUsers().filter(function(u) { return companyAccess(u).indexOf(company) >= 0; });
  else {
    for (var i = 0; i < recipients.length; i++) {
      var target = findUser(recipients[i]);
      if (!target || !(target.active === true || target.active === 'true')) continue;
      // Sub-firm admin can only message users who have access to this company.
      if (!sender_isUmbrella && companyAccess(target).indexOf(company) < 0) continue;
      targets.push(target);
    }
  }
  if (!targets.length) throw new Error('Gecerli alici bulunamadi.');
  var created = [];
  for (var j = 0; j < targets.length; j++) created.push(appendNotification(targets[j], { company: company, baslik: data.baslik, mesaj: data.mesaj, tur: data.tur, sayfa: data.sayfa, kayitId: data.kayitId, sendEmail: data.sendEmail }, user));
  return { ok: true, created: created.length };
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
  return folder;
}

function subFolder(name) {
  var parent = rootFolder();
  var folderName = String(name || 'Genel').trim() || 'Genel';
  var it = parent.getFoldersByName(folderName);
  var folder = it.hasNext() ? it.next() : parent.createFolder(folderName);
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

function listFiles(user, company) {
  company = requireCompany(user, company);
  var files = [], root = rootFolder(), rootFiles = root.getFiles();
  while (rootFiles.hasNext()) {
    var rootFile = rootFiles.next();
    if (normalizeCompany(metaValue(rootFile.getDescription() || '', 'Company') || 'fuwell') === company) files.push(info(rootFile, 'Genel'));
  }
  var folders = root.getFolders();
  while (folders.hasNext()) {
    var folder = folders.next(), folderFiles = folder.getFiles();
    while (folderFiles.hasNext()) {
      var file = folderFiles.next();
      if (normalizeCompany(metaValue(file.getDescription() || '', 'Company') || 'fuwell') === company) files.push(info(file, folder.getName()));
    }
  }
  files.sort(function(a, b) { return new Date(b.created).getTime() - new Date(a.created).getTime(); });
  return { ok: true, files: files };
}

function uploadFile(data, user) {
  var company = requireCompany(user, data.company);
  if (!data.base64 || !data.name) throw new Error('Dosya bilgisi eksik.');
  var folder = subFolder(data.folder || 'Genel');
  var blob = Utilities.newBlob(Utilities.base64Decode(data.base64), data.mimeType || 'application/octet-stream', data.name);
  var file = folder.createFile(blob);
  var desc = (data.description || '') + '\nCompany: ' + company + '\nYukleyen: ' + (user.ad || user.username || 'Bilinmiyor') + '\nYuklemeTarihi: ' + new Date().toISOString();
  file.setDescription(desc);
  return { ok: true, file: info(file, folder.getName()) };
}

// ── Syn2 project helpers (umbrella project intake → engineering → purchasing) ──
function _projectCounterKey(year) { return 'PROJ_CTR_' + year; }
function nextProjectCodePreview(customer) {
  var initial = String(customer || 'X').trim().toUpperCase().replace(/[^A-ZÇĞİÖŞÜ]/g, '').charAt(0) || 'X';
  var year = new Date().getFullYear();
  var props = PropertiesService.getScriptProperties();
  var cur = parseInt(props.getProperty(_projectCounterKey(year)) || '0', 10) + 1;
  return { code: 'ARS-' + year + '-' + ('000' + cur).slice(-3) + '-' + initial, year: year, counter: cur, initial: initial };
}
function nextProjectCode(customer) {
  var initial = String(customer || 'X').trim().toUpperCase().replace(/[^A-ZÇĞİÖŞÜ]/g, '').charAt(0) || 'X';
  var year = new Date().getFullYear();
  var lock = LockService.getScriptLock();
  try { lock.waitLock(8000); } catch (e) { throw new Error('Sistem yogun, lütfen tekrar deneyin.'); }
  try {
    var props = PropertiesService.getScriptProperties();
    var key = _projectCounterKey(year);
    var cur = parseInt(props.getProperty(key) || '0', 10) + 1;
    props.setProperty(key, String(cur));
    return { code: 'ARS-' + year + '-' + ('000' + cur).slice(-3) + '-' + initial, year: year, counter: cur, initial: initial };
  } finally { lock.releaseLock(); }
}
function getOrCreateProjectFolder(projectCode) {
  var root = rootFolder();
  var ex = root.getFoldersByName(projectCode);
  if (ex.hasNext()) return ex.next();
  var f = root.createFolder(projectCode);
  try { f.setDescription('Arsen Lab proje klasoru\nProjectCode: ' + projectCode + '\nOlusturma: ' + new Date().toISOString()); } catch (ignored) {}
  return f;
}
function getOrCreateSubfolder(parent, name) {
  var safe = String(name || 'Genel').replace(/[\\/]/g, '-').trim() || 'Genel';
  var ex = parent.getFoldersByName(safe);
  if (ex.hasNext()) return ex.next();
  return parent.createFolder(safe);
}
function uploadProjectFile(data, user) {
  if (!data.projectCode || !data.base64 || !data.name) throw new Error('Proje dosya bilgisi eksik.');
  var pf = getOrCreateProjectFolder(data.projectCode);
  var target = data.subfolder ? getOrCreateSubfolder(pf, data.subfolder) : pf;
  var blob = Utilities.newBlob(Utilities.base64Decode(data.base64), data.mimeType || 'application/octet-stream', data.name);
  var file = target.createFile(blob);
  var desc = 'ProjectCode: ' + data.projectCode + '\nSubfolder: ' + (data.subfolder || '-') + '\nYukleyen: ' + (user.ad || user.username || 'Bilinmiyor') + '\nYuklemeTarihi: ' + new Date().toISOString();
  file.setDescription(desc);
  return { ok: true, file: { id: file.getId(), name: file.getName(), url: file.getUrl(), downloadUrl: 'https://drive.google.com/uc?export=download&id=' + file.getId(), folder: target.getName(), size: file.getSize(), mimeType: file.getMimeType(), uploadedAt: new Date().toISOString(), uploadedBy: user.ad || user.username || '' } };
}
function deleteProjectFile(data, user) {
  if (!data.fileId) throw new Error('Dosya kimligi eksik.');
  try { DriveApp.getFileById(data.fileId).setTrashed(true); } catch (e) { throw new Error('Dosya silinemedi: ' + e.message); }
  return { ok: true };
}
function deleteProjectFolder(data, user) {
  if (!data.projectCode) throw new Error('Proje kodu eksik.');
  if (user.role !== 'admin') throw new Error('Klasor silmek icin admin yetkisi gerekli.');
  try {
    var root = rootFolder();
    var ex = root.getFoldersByName(data.projectCode);
    if (ex.hasNext()) ex.next().setTrashed(true);
  } catch (e) { throw new Error('Klasor silinemedi: ' + e.message); }
  return { ok: true };
}

function deleteFile(data, user) {
  if (user.role !== 'admin') throw new Error('Dosya silmek icin admin yetkisi gerekli.');
  var company = requireCompany(user, data.company);
  if (!data.id) throw new Error('Dosya id eksik.');
  var file = DriveApp.getFileById(data.id);
  if (normalizeCompany(metaValue(file.getDescription() || '', 'Company') || 'fuwell') !== company) throw new Error('Bu dosya secili operasyon alanina ait degil.');
  file.setTrashed(true);
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
  _bumpBatchVersion();
}

function listOvertime(user, company) {
  company = requireCompany(user, company);
  var rows = overtimeRows();
  rows = rows.filter(function(r) { return normalizeCompany(r.company || 'fuwell') === company; });
  if (user.role !== 'admin') rows = rows.filter(function(r) { return r.kullanici === user.username; });
  return { ok: true, records: rows };
}

function createOvertime(data, user) {
  var company = requireCompany(user, data.company);
  if (!data.tarih || !data.baslangic || !data.bitis) throw new Error('Mesai bilgisi eksik.');
  var rows = overtimeRows();
  rows.push({
    id: Utilities.getUuid().replace(/-/g, '').substring(0, 14),
    company: company,
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
  var company = requireCompany(user, data.company);
  if (!data.id || !data.durum) throw new Error('Onay bilgisi eksik.');
  var rows = overtimeRows(), found = false, targetUsername = '';
  for (var i = 0; i < rows.length; i++) {
    if (rows[i].id === data.id && normalizeCompany(rows[i].company || 'fuwell') === company) {
      targetUsername = rows[i].kullanici;
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
  var target = findUser(targetUsername);
  if (target) appendNotification(target, {
    baslik: 'Ekstra mesai ' + data.durum,
    mesaj: 'Ekstra mesai kaydınız ' + data.durum + '.\n' + (data.adminNot ? 'Admin notu: ' + data.adminNot : ''),
    tur: 'Mesai',
    sayfa: 'mesai',
    kayitId: data.id,
    sendEmail: true
  }, user);
  return { ok: true };
}

function doGet(e) {
  var result;
  try {
    var user = requireAuth(e.parameter.token);
    if (e.parameter.action === 'read') result = readSheet(e.parameter.sheet, user, e.parameter.company);
    else if (e.parameter.action === 'batchRead') result = readSheets(String(e.parameter.sheets || '').split(','), user, e.parameter.company);
    else if (e.parameter.action === 'listFiles') result = listFiles(user, e.parameter.company);
    else if (e.parameter.action === 'listOvertime') result = listOvertime(user, e.parameter.company);
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
      if (data.action === 'write') result = writeSheet(data.sheet, data.values, user, data.company);
      else if (data.action === 'batchRead') result = readSheets(data.sheets || [], user, data.company);
      else if (data.action === 'createNotification') result = createNotification(data, user);
      else if (data.action === 'markNotificationsRead') result = markNotificationsRead(data, user);
      else if (data.action === 'listFiles') result = listFiles(user, data.company);
      else if (data.action === 'uploadFile') result = uploadFile(data, user);
      else if (data.action === 'deleteFile') result = deleteFile(data, user);
      else if (data.action === 'nextProjectCode') result = nextProjectCode(data.customer);
      else if (data.action === 'previewProjectCode') result = nextProjectCodePreview(data.customer);
      else if (data.action === 'uploadProjectFile') result = uploadProjectFile(data, user);
      else if (data.action === 'deleteProjectFile') result = deleteProjectFile(data, user);
      else if (data.action === 'deleteProjectFolder') result = deleteProjectFolder(data, user);
      else if (data.action === 'listOvertime') result = listOvertime(user, data.company);
      else if (data.action === 'createOvertime') result = createOvertime(data, user);
      else if (data.action === 'updateOvertimeStatus') result = updateOvertimeStatus(data, user);
      else result = { error: 'Bilinmeyen istek.' };
    }
  } catch (err) {
    result = { error: err.message };
  }
  return json(result);
}
