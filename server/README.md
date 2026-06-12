# Arşen Process · Kendi Sunucu Kurulumu

Bu klasör Google Apps Script + Sheets backend'inin **Windows Server + MSSQL** ortamına taşınması için gereken tüm dosyaları içerir.

## Stack özeti

| Katman | Seçim | Notlar |
|---|---|---|
| OS | Windows Server 2019+ | IIS, Task Scheduler, .NET Hosting Bundle gerekir |
| Web Sunucu | IIS | Statik HTML + ASP.NET Core reverse proxy |
| Backend API | ASP.NET Core 8 (LTS) | C# |
| Veritabanı | **MS SQL Server Express** | 10 GB DB limiti — fazlasıyla yeter |
| Dosyalar | Sunucu diski | `D:\Arsen\Files\` (yapılandırılabilir) |
| Auth | JWT (Bearer token) | Mevcut HMAC mantığının modern karşılığı |
| Cron | Windows Task Scheduler | Günlük 16:00 + Pazar 08:00 hatırlatma |
| Erişim | Yalnız iç ağ / VPN | İnternete açık değil |

## Faz planı

| Faz | İçerik | Klasör | Durum |
|---|---|---|---|
| **A** | SQL şema + Sheets export aracı + import rehberi | `sql/`, `migration/` | ✅ Hazır |
| **B** | ASP.NET Core API iskeleti (proje, entity'ler, auth, file service) | `api/` | ⏳ Sıradaki |
| **C** | Tüm endpoint'lerin C# implementasyonu | `api/Controllers/` | ⏳ |
| **D** | Frontend `SCRIPT_URL` değişimi + IIS deploy rehberi + Task Scheduler kurulumu | `deploy/` | ⏳ |

## Faz A — Adım adım (şimdi yapacakların)

### 1. Sunucu hazırlığı
- [ ] Windows Server 2019+ kurulu
- [ ] IIS rolü etkin (`Server Manager → Add Roles → Web Server (IIS)`)
- [ ] [.NET 8 Hosting Bundle](https://dotnet.microsoft.com/download/dotnet/8.0) indir, kur
- [ ] [SQL Server 2022 Express](https://www.microsoft.com/sql-server/sql-server-downloads) indir, kur
  - Authentication: **Mixed Mode** (SQL Auth + Windows Auth)
  - Instance Name: `SQLEXPRESS` (varsayılan)
- [ ] [SSMS](https://aka.ms/ssmsfullsetup) indir, kur

### 2. Veritabanını oluştur
- [ ] SSMS aç → `localhost\SQLEXPRESS` bağlan
- [ ] `server/sql/01-schema.sql` aç → **F5** çalıştır
- [ ] "Tüm tablolar oluşturuldu" mesajı görmelisin

### 3. Sheets'ten veri export et
- [ ] Apps Script editöründe yeni dosya: `server/migration/export-from-sheets.gs` yapıştır
- [ ] `exportAllSheets` fonksiyonunu çalıştır
- [ ] Drive'da oluşan klasörü indir (zip)

### 4. CSV'leri MSSQL'e yükle
- [ ] `server/migration/IMPORT-GUIDE.md` rehberini takip et
- [ ] SSMS Import Wizard veya `bcp` PowerShell scripti ile her CSV'yi ilgili tabloya yükle
- [ ] Doğrulama sorgularıyla satır sayılarını kontrol et

### 5. Sıradaki için hazır ol
- [ ] **Faz B** PR'ı geldiğinde `server/api/` klasörü hazır olacak
- [ ] Bana şu bilgileri ileteceksin:
  - MSSQL bağlantı string'i: `Server=localhost\SQLEXPRESS;Database=ArsenProcess;Trusted_Connection=True;`
  - Dosya kök yolu: `D:\Arsen\Files\` (sunucu diskinde nerede tutmak istersin?)
  - JWT secret için 32+ karakter rastgele bir string (`openssl rand -hex 32` veya benzeri)

## Sırada ne var

Faz A tamamlandığında "Faz A OK" de — **Faz B**'yi (ASP.NET Core projesi) açmaya başlayayım. Senin işin sadece sunucu kurulumu + veri yüklemesi.

## Geri alma rotası

Bu geçiş **eski sistemi devre dışı bırakmaz**. Hem Apps Script hem yeni MSSQL backend bir süre paralel çalışabilir. Frontend `SCRIPT_URL`'i değiştirene kadar eski sistem aktif kalır. Beğenmezsen tek satır değişiklikle eski Apps Script'e dönersin.
