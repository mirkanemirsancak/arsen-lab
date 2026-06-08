var SPREADSHEET_ID = '1Mx5zKqbVz3P8nqZhVc6vtpQ_Hb594k42NMoF9ascawI';
var DRIVE_ROOT_FOLDER_NAME = 'Arsen Lab Dosyalar';
var OVERTIME_SHEET_NAME = 'Mesai';
var OVERTIME_HEADERS = ['id','company','kullanici','kullaniciAd','tarih','baslangic','bitis','molaDakika','toplamSaat','aciklama','durum','olusturma','onaylayan','onayTarihi','adminNot'];
var TOKEN_TTL_MS = 12 * 60 * 60 * 1000;
var COMPANIES = ['fuwell', 'syntegra'];
var KURUMS = ['arsen', 'fuwell', 'syntegra'];
var UMBRELLA_KURUM = 'arsen';
var DEFAULT_SHEET_HEADERS = {
  Users: ['id','username','passwordHash','role','kurum','ad','email','companyAccess','defaultCompany','active','olusturma','roller'],
  Stok: ['id','company','ad','marka','kategori','lab','dolap','raf','miktar','birim','kritikSeviye','maksimum','skt','konum','not','sonGuncelleme'],
  StokHareketleri: ['id','company','stokId','stokAd','tip','miktar','birim','oncekiMiktar','sonrakiMiktar','tarih','aciklama','kullanici'],
  Metodlar: ['id','company','baslik','tur','kategori','hammadde','kaynak','kod','adimlar','not','aktif','tarih','kullanici'],
  Cikti: ['id','company','batchId','ad','hammadde','hammaddeMiktar','hammaddeBirim','ciktiMiktar','ciktiBirim','tarih','operator','kosullar','not','kullanici'],
  Analiz: ['id','company','numuneId','numune','tur','yontem','sonuc','birim','tarih','analist','batchId','not','kullanici','siparisKodu','lotId'],
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
  Syn2_Gantt: ['id','company','projectCode','tip','body','baslik','baslangic','bitis','kullanici','olusturma','guncelleme'],
  // Fuwell üretim takibi (Sipariş → Lot → Yükleme/Analiz → Formülasyon → Paketleme → Çizelge)
  Fuw_Siparis: ['id','company','orderCode','musteri','musteriKisaltma','urun','hedefMiktar','birim','hedefSpek','baslangic','termin','durum','sorumlu','sartnameDosyalar','etiketDosyalar','driveFolderId','aciklama','olusturan','olusturma','guncelleme'],
  Fuw_Lot: ['id','company','orderCode','lotNo','lotAdi','planlananMiktar','gerceklesenMiktar','birim','durum','sorumlu','baslangic','bitis','not','olusturan','olusturma','guncelleme'],
  Fuw_Yukleme: ['id','company','orderCode','lotId','yuklemeNo','methodId','methodAd','sicaklik','basinc','co2Akis','sure','hammadKutle','ciktiKutle','verim','sfeSnapshot','operator','baslangic','bitis','not','olusturma','guncelleme'],
  Fuw_Formulasyon: ['id','company','orderCode','tarih','lotIds','oranlar','hedefSpek','gerceklesenSpek','notalar','sorumlu','planlananBitis','onayDurumu','onayKullanici','onayTarihi','onayNot','olusturma','guncelleme'],
  Fuw_Paketleme: ['id','company','orderCode','sku','siseTipi','hacim','adet','batchId','etiketDosya','sevkiyatTermini','gonderim','not','olusturan','olusturma','guncelleme'],
  Fuw_Gantt: ['id','company','orderCode','tip','body','baslik','baslangic','bitis','kullanici','olusturma','guncelleme']
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
function isAdmin(user) { return user && user.role === 'admin'; }
// Only the Arşen (umbrella) admin manages users and approves overtime; sub-firm
// admins are full admins inside their own company but cannot do these.
function isArsenAdmin(user) { return isAdmin(user) && isUmbrella(user); }

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
    olusturma: user.olusturma || '',
    roller: user.roller || ''
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
      row.push(key === 'passwordHash' ? (isArsenAdmin(user) ? (data.rows[i][key] || '') : '') : (data.rows[i][key] || ''));
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

// Read-only weekly-schedule rows across ALL companies, so every user's dashboard
// can show the whole team's task planning regardless of their own company.
var SCHEDULE_MARKERS = ['__CIZELGE_META__', '__CIZELGE_PERSON__', '__CIZELGE_TASK__'];
function scheduleOverview(user) {
  var sh = sheetByName('Gorevler');
  var values = sh.getDataRange().getValues();
  if (!values.length) return { ok: true, rows: [] };
  var headers = values[0].map(function(h) { return String(h || ''); });
  var bIdx = headers.indexOf('baslik'), aIdx = headers.indexOf('aciklama');
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var baslik = bIdx >= 0 ? String(values[i][bIdx] || '') : '';
    var acik = aIdx >= 0 ? String(values[i][aIdx] || '') : '';
    var isSchedule = SCHEDULE_MARKERS.indexOf(baslik) >= 0 || acik.indexOf('__CIZELGE_TASK__') >= 0;
    if (!isSchedule) continue;
    var obj = {};
    for (var j = 0; j < headers.length; j++) obj[headers[j]] = values[i][j] === undefined ? '' : String(values[i][j]);
    rows.push(obj);
  }
  return { ok: true, rows: rows };
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
  if (name === 'Users' && !isArsenAdmin(user)) throw new Error('Kullanici yonetimi icin Arşen admin yetkisi gerekli.');
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

// Assignment notifications: any authenticated user may trigger one when they
// assign/select someone in any tab. There is no manual "broadcast to all" any
// more — recipients must be explicit usernames. A sender who is not umbrella can
// only notify users who share access to the current company.
function createNotification(data, user) {
  var company = requireCompany(user, data.company);
  if (!data.baslik || !data.mesaj) throw new Error('Bildirim basligi ve mesaji gerekli.');
  var sender_isUmbrella = isUmbrella(user);
  var recipients = (data.recipients || []).filter(function(r) { return r && r !== 'all'; });
  var seen = {}, targets = [];
  for (var i = 0; i < recipients.length; i++) {
    if (seen[recipients[i]]) continue;
    seen[recipients[i]] = true;
    var target = findUser(recipients[i]);
    if (!target || !(target.active === true || target.active === 'true')) continue;
    if (!sender_isUmbrella && companyAccess(target).indexOf(company) < 0) continue;
    targets.push(target);
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
// ── Fuwell order helpers (FUW-YYYY-NNN-X numbering + per-order Drive folder) ──
function _orderCounterKey(year) { return 'FUW_ORD_CTR_' + year; }
function nextOrderCodePreview(customer) {
  var initial = String(customer || 'X').trim().toUpperCase().replace(/[^A-ZÇĞİÖŞÜ]/g, '').charAt(0) || 'X';
  var year = new Date().getFullYear();
  var props = PropertiesService.getScriptProperties();
  var cur = parseInt(props.getProperty(_orderCounterKey(year)) || '0', 10) + 1;
  return { code: 'FUW-' + year + '-' + ('000' + cur).slice(-3) + '-' + initial, year: year, counter: cur, initial: initial };
}
function nextOrderCode(customer) {
  var initial = String(customer || 'X').trim().toUpperCase().replace(/[^A-ZÇĞİÖŞÜ]/g, '').charAt(0) || 'X';
  var year = new Date().getFullYear();
  var lock = LockService.getScriptLock();
  try { lock.waitLock(8000); } catch (e) { throw new Error('Sistem yogun, lütfen tekrar deneyin.'); }
  try {
    var props = PropertiesService.getScriptProperties();
    var key = _orderCounterKey(year);
    var cur = parseInt(props.getProperty(key) || '0', 10) + 1;
    props.setProperty(key, String(cur));
    return { code: 'FUW-' + year + '-' + ('000' + cur).slice(-3) + '-' + initial, year: year, counter: cur, initial: initial };
  } finally { lock.releaseLock(); }
}
function getOrCreateOrderFolder(orderCode) {
  var root = rootFolder();
  var ex = root.getFoldersByName(orderCode);
  if (ex.hasNext()) return ex.next();
  var f = root.createFolder(orderCode);
  try { f.setDescription('Arsen Lab sipariş klasörü\nOrderCode: ' + orderCode + '\nOlusturma: ' + new Date().toISOString()); } catch (ignored) {}
  return f;
}
function uploadOrderFile(data, user) {
  if (!data.orderCode || !data.base64 || !data.name) throw new Error('Sipariş dosya bilgisi eksik.');
  var pf = getOrCreateOrderFolder(data.orderCode);
  var target = data.subfolder ? getOrCreateSubfolder(pf, data.subfolder) : pf;
  var blob = Utilities.newBlob(Utilities.base64Decode(data.base64), data.mimeType || 'application/octet-stream', data.name);
  var file = target.createFile(blob);
  var desc = 'OrderCode: ' + data.orderCode + '\nSubfolder: ' + (data.subfolder || '-') + '\nYukleyen: ' + (user.ad || user.username || 'Bilinmiyor') + '\nYuklemeTarihi: ' + new Date().toISOString();
  file.setDescription(desc);
  return { ok: true, file: { id: file.getId(), name: file.getName(), url: file.getUrl(), downloadUrl: 'https://drive.google.com/uc?export=download&id=' + file.getId(), folder: target.getName(), size: file.getSize(), mimeType: file.getMimeType(), uploadedAt: new Date().toISOString(), uploadedBy: user.ad || user.username || '' } };
}
function deleteOrderFile(data, user) {
  if (!data.fileId) throw new Error('Dosya kimligi eksik.');
  try { DriveApp.getFileById(data.fileId).setTrashed(true); } catch (e) { throw new Error('Dosya silinemedi: ' + e.message); }
  return { ok: true };
}
function deleteOrderFolder(data, user) {
  if (!data.orderCode) throw new Error('Sipariş kodu eksik.');
  if (!isArsenAdmin(user)) throw new Error('Sipariş klasörü silmek için Arşen admin yetkisi gerekli.');
  try {
    var root = rootFolder();
    var ex = root.getFoldersByName(data.orderCode);
    if (ex.hasNext()) ex.next().setTrashed(true);
  } catch (e) { throw new Error('Klasör silinemedi: ' + e.message); }
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

// ── DRIVE FOLDER TREE (ortak kök, dosya-bazlı şirket görünürlük etiketleri) ──
// Klasörler tüm şirketlere ortak görünür; her DOSYA için "Visibility" etiketi
// (fuwell / syntegra / fuwell,syntegra) ile hangi şirketin gördüğü belirlenir.
// Umbrella (Arşen admin) her dosyayı görür. Etiketsiz eski dosyalar herkese
// görünür (geriye uyumluluk).
function folderIsWithin(folder, ancestorId) {
  var cur = folder;
  for (var g = 0; g < 60; g++) {
    if (cur.getId() === ancestorId) return true;
    var ps = cur.getParents();
    if (!ps.hasNext()) return false;
    cur = ps.next();
  }
  return false;
}
function resolveTreeFolder(user, folderId) {
  var croot = rootFolder();
  if (!folderId || folderId === 'root') return croot;
  var f;
  try { f = DriveApp.getFolderById(folderId); } catch (e) { throw new Error('Klasor bulunamadi.'); }
  if (f.getId() !== croot.getId() && !folderIsWithin(f, croot.getId())) throw new Error('Bu klasore erisim yetkiniz yok.');
  return f;
}
function fileVisibilityList(file) {
  var raw = metaValue(file.getDescription() || '', 'Visibility');
  if (!raw) return null;
  return raw.split(',').map(function(s) { return s.trim().toLowerCase(); }).filter(Boolean);
}
function userCanSeeFile(user, file, currentCompany) {
  if (isUmbrella(user)) return true;
  var vis = fileVisibilityList(file);
  if (!vis || !vis.length) return true;
  return vis.indexOf(currentCompany) >= 0;
}
function treeFileInfo(file) {
  var desc = file.getDescription() || '';
  var vis = fileVisibilityList(file);
  return { id: file.getId(), name: file.getName(), type: 'file', mimeType: file.getMimeType(), size: file.getSize(), url: file.getUrl(), downloadUrl: 'https://drive.google.com/uc?export=download&id=' + file.getId(), created: file.getDateCreated(), updated: file.getLastUpdated(), uploadedBy: metaValue(desc, 'Yukleyen'), description: cleanDescription(desc), visibility: vis ? vis.join(',') : '' };
}
function listFolder(user, company, folderId) {
  company = requireCompany(user, company);
  var croot = rootFolder();
  var folder = resolveTreeFolder(user, folderId);
  var crumbs = [], cur = folder;
  for (var g = 0; g < 60; g++) {
    crumbs.unshift({ id: cur.getId(), name: cur.getId() === croot.getId() ? DRIVE_ROOT_FOLDER_NAME : cur.getName() });
    if (cur.getId() === croot.getId()) break;
    var ps = cur.getParents();
    if (!ps.hasNext()) break;
    cur = ps.next();
  }
  var folders = [], it = folder.getFolders();
  while (it.hasNext()) { var sf = it.next(); folders.push({ id: sf.getId(), name: sf.getName(), type: 'folder', created: sf.getDateCreated(), updated: sf.getLastUpdated() }); }
  var files = [], fit = folder.getFiles();
  while (fit.hasNext()) {
    var fl = fit.next();
    if (userCanSeeFile(user, fl, company)) files.push(treeFileInfo(fl));
  }
  folders.sort(function(a, b) { return String(a.name).localeCompare(String(b.name)); });
  files.sort(function(a, b) { return new Date(b.created).getTime() - new Date(a.created).getTime(); });
  return { ok: true, rootId: croot.getId(), folderId: folder.getId(), breadcrumb: crumbs, folders: folders, files: files };
}
function createTreeFolder(user, company, parentId, name) {
  company = requireCompany(user, company);
  var parent = resolveTreeFolder(user, parentId);
  var safe = String(name || '').replace(/[\\/]/g, '-').trim();
  if (!safe) throw new Error('Klasor adi gerekli.');
  if (parent.getFoldersByName(safe).hasNext()) throw new Error('Bu isimde klasor zaten var.');
  var f = parent.createFolder(safe);
  return { ok: true, folder: { id: f.getId(), name: f.getName(), type: 'folder', created: f.getDateCreated(), updated: f.getLastUpdated() } };
}
function uploadTreeFile(user, company, folderId, name, base64, mimeType, description, visibility) {
  company = requireCompany(user, company);
  if (!base64 || !name) throw new Error('Dosya bilgisi eksik.');
  var folder = resolveTreeFolder(user, folderId);
  var blob = Utilities.newBlob(Utilities.base64Decode(base64), mimeType || 'application/octet-stream', name);
  var file = folder.createFile(blob);
  var visMeta = '';
  if (visibility) {
    var visList = String(visibility).split(',').map(function(s) { return s.trim().toLowerCase(); }).filter(function(s) { return COMPANIES.indexOf(s) >= 0; });
    if (visList.length) visMeta = '\nVisibility: ' + visList.join(',');
  }
  file.setDescription((description || '') + visMeta + '\nYukleyen: ' + (user.ad || user.username || '') + '\nYuklemeTarihi: ' + new Date().toISOString());
  return { ok: true, file: treeFileInfo(file) };
}
function updateFileVisibility(user, data) {
  if (!data.fileId) throw new Error('Dosya kimligi eksik.');
  var file;
  try { file = DriveApp.getFileById(data.fileId); } catch (e) { throw new Error('Dosya bulunamadi.'); }
  var ps = file.getParents();
  if (!ps.hasNext() || !folderIsWithin(ps.next(), rootFolder().getId())) throw new Error('Bu dosyaya erisim yetkiniz yok.');
  var visList = String(data.visibility || '').split(',').map(function(s) { return s.trim().toLowerCase(); }).filter(function(s) { return COMPANIES.indexOf(s) >= 0; });
  var desc = file.getDescription() || '';
  var lines = desc.split('\n').filter(function(line) { return line.indexOf('Visibility:') !== 0; });
  if (visList.length) lines.push('Visibility: ' + visList.join(','));
  file.setDescription(lines.join('\n'));
  return { ok: true, file: treeFileInfo(file) };
}
function deleteTreeItem(user, company, id, isFolder) {
  company = requireCompany(user, company);
  if (!id) throw new Error('Kimlik eksik.');
  var croot = rootFolder();
  if (isFolder === true || isFolder === 'true') {
    var folder;
    try { folder = DriveApp.getFolderById(id); } catch (e) { throw new Error('Klasor bulunamadi.'); }
    if (folder.getId() === croot.getId()) throw new Error('Ana klasor silinemez.');
    if (!folderIsWithin(folder, croot.getId())) throw new Error('Bu klasore erisim yetkiniz yok.');
    folder.setTrashed(true);
    return { ok: true };
  }
  var file;
  try { file = DriveApp.getFileById(id); } catch (e) { throw new Error('Dosya bulunamadi.'); }
  var ps = file.getParents(), within = false;
  while (ps.hasNext()) { if (folderIsWithin(ps.next(), croot.getId())) { within = true; break; } }
  if (!within) throw new Error('Bu dosyaya erisim yetkiniz yok.');
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
  if (!isArsenAdmin(user)) throw new Error('Ekstra mesai onayi yalnizca Arşen admin tarafindan yapilabilir.');
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

// ── DAILY LOG REMINDER (time-driven trigger) ───────────────────────────────
// Reminds every active user (in-app + email) to enter their daily log.
// Runs weekdays only, from 1 June onward. Users who already logged today are skipped.
function dailyLogReminder() {
  var tz = Session.getScriptTimeZone() || 'Europe/Istanbul';
  var now = new Date();
  var day = now.getDay();              // 0=Sun … 6=Sat
  if (day === 0 || day === 6) return;  // weekdays only
  var startDate = new Date(now.getFullYear(), 5, 1); // 1 June (month index 5)
  if (now < startDate) return;
  var today = Utilities.formatDate(now, tz, 'yyyy-MM-dd');
  var loggedToday = {};
  try {
    var logs = rowsFromSheet('GunlukLog').rows;
    for (var j = 0; j < logs.length; j++) {
      if (String(logs[j].tarih || '').slice(0, 10) === today) loggedToday[logs[j].kullanici] = true;
    }
  } catch (e) {}
  var users = activeUsers(), sent = 0;
  var sys = { ad: 'Sistem', username: 'system' };
  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    if (loggedToday[u.username]) continue; // already logged today
    appendNotification(u, {
      company: normalizeCompany(u.defaultCompany || 'fuwell'),
      baslik: 'Günlük log hatırlatması',
      mesaj: 'Bugünün günlük logunu girmeyi unutma. Günlük Log sayfasından bugün yaptığın çalışmaları kaydet.',
      tur: 'Hatırlatma',
      sayfa: 'gunluk',
      sendEmail: true
    }, sys);
    sent++;
  }
  return { ok: true, sent: sent, date: today };
}
// Run this ONCE from the Apps Script editor to (re)install the 16:00 daily trigger.
function setupDailyLogTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'dailyLogReminder') ScriptApp.deleteTrigger(triggers[i]);
  }
  ScriptApp.newTrigger('dailyLogReminder').timeBased().atHour(16).nearMinute(0).everyDays(1).create();
  return 'Günlük log hatırlatıcı kuruldu: her gün ~16:00 (hafta sonu ve 1 Haziran öncesi atlanır).';
}

// ── WEEKLY SCHEDULE REMINDER (Sunday morning) ───────────────────────────────
// Reminds every active user to enter their weekly tasks into the calendar.
function weeklyScheduleReminder() {
  var users = activeUsers(), sent = 0;
  var sys = { ad: 'Sistem', username: 'system' };
  for (var i = 0; i < users.length; i++) {
    appendNotification(users[i], {
      company: normalizeCompany(users[i].defaultCompany || 'fuwell'),
      baslik: 'Haftalık görev planı',
      mesaj: 'Yeni hafta başlıyor. Lütfen bu haftaki görevlerinizi Görev Takvimi sayfasından çizelgeye giriniz.',
      tur: 'Hatırlatma',
      sayfa: 'takvim',
      sendEmail: true
    }, sys);
    sent++;
  }
  return { ok: true, sent: sent };
}
// Run this ONCE from the Apps Script editor to install the Sunday ~08:00 trigger.
function setupWeeklyScheduleTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'weeklyScheduleReminder') ScriptApp.deleteTrigger(triggers[i]);
  }
  ScriptApp.newTrigger('weeklyScheduleReminder').timeBased().onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(8).nearMinute(0).create();
  return 'Haftalık görev hatırlatıcı kuruldu: her Pazar ~08:00.';
}

function doGet(e) {
  var result;
  try {
    var user = requireAuth(e.parameter.token);
    if (e.parameter.action === 'read') result = readSheet(e.parameter.sheet, user, e.parameter.company);
    else if (e.parameter.action === 'batchRead') result = readSheets(String(e.parameter.sheets || '').split(','), user, e.parameter.company);
    else if (e.parameter.action === 'listFiles') result = listFiles(user, e.parameter.company);
    else if (e.parameter.action === 'listOvertime') result = listOvertime(user, e.parameter.company);
    else if (e.parameter.action === 'scheduleOverview') result = scheduleOverview(user);
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
      else if (data.action === 'scheduleOverview') result = scheduleOverview(user);
      else if (data.action === 'listFolder') result = listFolder(user, data.company, data.folderId);
      else if (data.action === 'createTreeFolder') result = createTreeFolder(user, data.company, data.parentId, data.name);
      else if (data.action === 'uploadTreeFile') result = uploadTreeFile(user, data.company, data.folderId, data.name, data.base64, data.mimeType, data.description);
      else if (data.action === 'deleteTreeItem') result = deleteTreeItem(user, data.company, data.id, data.isFolder);
      else if (data.action === 'updateFileVisibility') result = updateFileVisibility(user, data);
      else if (data.action === 'nextOrderCode') result = nextOrderCode(data.customer);
      else if (data.action === 'previewOrderCode') result = nextOrderCodePreview(data.customer);
      else if (data.action === 'uploadOrderFile') result = uploadOrderFile(data, user);
      else if (data.action === 'deleteOrderFile') result = deleteOrderFile(data, user);
      else if (data.action === 'deleteOrderFolder') result = deleteOrderFolder(data, user);
      else result = { error: 'Bilinmeyen istek.' };
    }
  } catch (err) {
    result = { error: err.message };
  }
  return json(result);
}
