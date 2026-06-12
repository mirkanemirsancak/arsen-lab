// ============================================================================
// Arşen Process · Sheets → CSV Export Aracı
// ============================================================================
// Bu kodu Apps Script editörüne ek bir .gs dosyası olarak yapıştır
// (mevcut apps-script-drive-backend.gs ile birlikte aynı projede dursun).
// Sonra menü çubuğundan exportAllSheets() seç ve Run.
//
// Çıktı: Drive'da "Arsen Export YYYY-MM-DD HH-MM-SS" klasörü, içinde her
// sheet için ayrı .csv dosyası. Bu klasörü zip indir → şirket sunucuna at →
// SSMS Import Wizard ile MSSQL'e yükle (REHBER: IMPORT-GUIDE.md).
// ============================================================================

function exportAllSheets() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);  // SPREADSHEET_ID arsen-lab .gs'inde tanımlı
  var sheets = ss.getSheets();
  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Europe/Istanbul', 'yyyy-MM-dd HH-mm-ss');
  var folder = DriveApp.createFolder('Arsen Export ' + stamp);
  var summary = [];

  sheets.forEach(function(sh) {
    var name = sh.getName();
    var values = sh.getDataRange().getValues();
    if (values.length < 1) {
      summary.push(name + ' → boş, atlandı');
      return;
    }
    var csv = values.map(function(row) {
      return row.map(function(c) {
        var s = c == null ? '' : (c instanceof Date ? c.toISOString() : String(c));
        if (s.indexOf(',') >= 0 || s.indexOf('"') >= 0 || s.indexOf('\n') >= 0 || s.indexOf('\r') >= 0) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      }).join(',');
    }).join('\n');
    folder.createFile(name + '.csv', csv, 'text/csv');
    summary.push(name + ' → ' + (values.length - 1) + ' satır');
  });

  // Özet dosyası
  folder.createFile('00-EXPORT-SUMMARY.txt',
    'Arşen Process · Sheets Export\n' +
    'Tarih: ' + new Date().toISOString() + '\n' +
    'Spreadsheet ID: ' + SPREADSHEET_ID + '\n\n' +
    'Sheets:\n  - ' + summary.join('\n  - ') + '\n\n' +
    'Sıradaki: bu klasörü indir, SSMS Import Wizard ile MSSQL\'e yükle.\n' +
    'Detay: server/migration/IMPORT-GUIDE.md',
    'text/plain'
  );

  Logger.log('Export tamam: ' + folder.getUrl());
  return folder.getUrl();
}

// İsteğe bağlı: belirli bir sheet'i export et (debug için)
function exportOneSheet(sheetName) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sh = ss.getSheetByName(sheetName);
  if (!sh) throw new Error('Sheet bulunamadı: ' + sheetName);
  var values = sh.getDataRange().getValues();
  var csv = values.map(function(row) {
    return row.map(function(c) {
      var s = c == null ? '' : (c instanceof Date ? c.toISOString() : String(c));
      return (s.indexOf(',') >= 0 || s.indexOf('"') >= 0 || s.indexOf('\n') >= 0) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }).join(',');
  }).join('\n');
  var blob = Utilities.newBlob(csv, 'text/csv', sheetName + '.csv');
  var file = DriveApp.createFile(blob);
  Logger.log(sheetName + ' → ' + file.getUrl());
  return file.getUrl();
}
