# Sheets → MSSQL Veri Göçü Rehberi

## Önkoşullar
- MSSQL Server Express kurulu ve **`ArsenProcess` database** oluşturulmuş (`server/sql/01-schema.sql` çalıştırılmış).
- **SSMS (SQL Server Management Studio)** kurulu.
- Sheets export klasörü indirilmiş (CSV'ler hazır).

## Adım 1 — Sheets'ten CSV export et

1. Apps Script editörünü aç (mevcut `apps-script-drive-backend.gs` projesi).
2. `server/migration/export-from-sheets.gs` içeriğini yeni bir dosya olarak ekle.
3. Üst menüden fonksiyon listesinden `exportAllSheets` seç → **Run** (ilk seferinde Drive erişim izni iste).
4. Çalıştığını teyit et — Logger.log'da Drive klasör URL'i görünür.
5. Drive'da **"Arsen Export YYYY-MM-DD HH-MM-SS"** klasörünü bul, sağ tık → **İndir** (zip olarak iner).
6. Zip'i şirket sunucuna kopyala, aç.

## Adım 2 — Schema'yı MSSQL'de oluştur

1. SSMS aç → MSSQL Server'a bağlan.
2. **File → Open → File** → `server/sql/01-schema.sql` aç.
3. **F5** (Execute). "Tüm tablolar oluşturuldu" mesajını gör.
4. Sol panelde `ArsenProcess` veritabanı altında 29 tablo + `AppCounters` + `Files` görünmeli.

## Adım 3 — CSV'leri SSMS Import Wizard ile yükle

Her CSV için (29 tane):

1. SSMS'te `ArsenProcess` DB'sine sağ tık → **Tasks → Import Flat File...** (SQL Server 2017+)
   - *Eski sürümlerde*: Tasks → Import Data... → Source: Flat File Source
2. **Specify Input File**: CSV dosyasını seç (örn. `Users.csv`)
   - **New Table Name**: dosya adı ile aynı (Users, Stok, Analiz, vb.)
   - Encoding: **65001 UTF-8** (Türkçe karakterler için zorunlu)
   - Text qualifier: **"** (çift tırnak)
3. **Preview**: ilk satırların doğru ayrıldığını teyit et
4. **Modify Columns**: Wizard auto-detect yapar; tüm kolonları **NVARCHAR(MAX)** olarak tut → schema ile uyumlu olur
5. **Önemli**: Çekirdek "New Table" değil de **mevcut tabloya append** etmek için: Tasks → Import Data... wizard'ını kullan, destination'da **existing table** seç. Bu sayede schema'mızla uyumlu kalır.
6. Yükle, sonra `SELECT COUNT(*) FROM dbo.Users;` ile satır sayısını kontrol et.

### Tek tek değil toplu istersen — PowerShell ile

```powershell
$db = "ArsenProcess"
$server = "localhost\SQLEXPRESS"
$csvFolder = "C:\Arsen\Export\Arsen Export 2026-06-12 14-30-00"

Get-ChildItem $csvFolder -Filter "*.csv" | Where-Object { $_.Name -notlike "00-*" } | ForEach-Object {
    $table = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
    Write-Host "→ $table"
    bcp "$db.dbo.$table" in $_.FullName -S $server -T -c -t "," -r "\n" -F 2 -E
}
```

> `-F 2` → ilk satır (header) atlanır. `-E` → identity preserve. `-c -t "," -r "\n"` → CSV formatı.

## Adım 4 — Doğrulama

```sql
-- Satır sayıları
SELECT
  (SELECT COUNT(*) FROM dbo.Users) AS Users,
  (SELECT COUNT(*) FROM dbo.Stok) AS Stok,
  (SELECT COUNT(*) FROM dbo.Syn2_Projeler) AS Syn2_Projeler,
  (SELECT COUNT(*) FROM dbo.Fuw_Siparis) AS Fuw_Siparis;

-- Örnek satır kontrolü
SELECT TOP 5 * FROM dbo.Users;
SELECT TOP 5 * FROM dbo.Syn2_Projeler;
```

## Sık karşılaşılan sorunlar

| Sorun | Çözüm |
|---|---|
| Türkçe karakterler bozuk | Wizard'da encoding mutlaka **65001 UTF-8** olmalı |
| "Cannot insert duplicate key" | Mevcut tabloda zaten satır var → `TRUNCATE TABLE dbo.X;` sonra tekrar dene |
| "String would be truncated" | NVARCHAR uzunluğunu artır (zaten MAX olmalı şemamızda) |
| Tarih kolonları bozuk | Hepsi NVARCHAR olarak duruyor; backend parse edecek, sorun değil |
| Boş satırlar yükleniyor | CSV'de boş satırı sil; Excel'de aç temizle, tekrar kaydet |

## Sıradaki

Veri MSSQL'e yüklendi → **Faz B**: ASP.NET Core API'sini kuracağız. Bu repo'nun `server/api/` klasörü altında gelecek.
