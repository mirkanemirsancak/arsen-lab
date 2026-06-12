-- ============================================================================
-- Arşen Process · MSSQL Şema
-- ============================================================================
-- Hedef: SQL Server Express (free).
-- Tüm alanlar NVARCHAR(MAX) — Google Sheets'ten geçişin sürtünmesiz olması için.
-- Backend C# katmanı sayısal/tarih parse'ı yapar.
-- Primary key: id (NVARCHAR(50)). Çoğu sheet'te 'company' kolonu var → index.
-- Çalıştırma: SSMS'te DB'ye bağlan, bu dosyayı aç, F5 (Execute).
-- ============================================================================

IF DB_ID('ArsenProcess') IS NULL CREATE DATABASE ArsenProcess;
GO
USE ArsenProcess;
GO

-- ── Çekirdek tablolar ───────────────────────────────────────────────────────

IF OBJECT_ID('dbo.Users','U') IS NULL
CREATE TABLE dbo.Users (
  id NVARCHAR(50) NOT NULL PRIMARY KEY,
  username NVARCHAR(100) NOT NULL,
  passwordHash NVARCHAR(200) NULL,
  role NVARCHAR(20) NOT NULL DEFAULT 'user',
  kurum NVARCHAR(20) NULL,
  ad NVARCHAR(200) NULL,
  email NVARCHAR(200) NULL,
  companyAccess NVARCHAR(200) NULL,
  defaultCompany NVARCHAR(20) NULL,
  active NVARCHAR(10) NOT NULL DEFAULT 'true',
  olusturma NVARCHAR(50) NULL,
  roller NVARCHAR(500) NULL,
  CONSTRAINT UX_Users_username UNIQUE (username)
);
CREATE INDEX IX_Users_email ON dbo.Users(email);
GO

IF OBJECT_ID('dbo.Stok','U') IS NULL
CREATE TABLE dbo.Stok (
  id NVARCHAR(50) NOT NULL PRIMARY KEY, company NVARCHAR(20) NOT NULL,
  ad NVARCHAR(500) NULL, marka NVARCHAR(200) NULL, kategori NVARCHAR(100) NULL,
  lab NVARCHAR(100) NULL, dolap NVARCHAR(100) NULL, raf NVARCHAR(100) NULL,
  miktar NVARCHAR(50) NULL, birim NVARCHAR(50) NULL,
  kritikSeviye NVARCHAR(50) NULL, maksimum NVARCHAR(50) NULL,
  skt NVARCHAR(50) NULL, konum NVARCHAR(200) NULL, [not] NVARCHAR(MAX) NULL,
  sonGuncelleme NVARCHAR(50) NULL
);
CREATE INDEX IX_Stok_company ON dbo.Stok(company);
GO

IF OBJECT_ID('dbo.StokHareketleri','U') IS NULL
CREATE TABLE dbo.StokHareketleri (
  id NVARCHAR(50) NOT NULL PRIMARY KEY, company NVARCHAR(20) NOT NULL,
  stokId NVARCHAR(50) NULL, stokAd NVARCHAR(500) NULL,
  tip NVARCHAR(20) NULL, miktar NVARCHAR(50) NULL, birim NVARCHAR(50) NULL,
  oncekiMiktar NVARCHAR(50) NULL, sonrakiMiktar NVARCHAR(50) NULL,
  tarih NVARCHAR(50) NULL, aciklama NVARCHAR(MAX) NULL, kullanici NVARCHAR(100) NULL
);
CREATE INDEX IX_StokHareketleri_company ON dbo.StokHareketleri(company);
CREATE INDEX IX_StokHareketleri_stokId ON dbo.StokHareketleri(stokId);
GO

IF OBJECT_ID('dbo.Metodlar','U') IS NULL
CREATE TABLE dbo.Metodlar (
  id NVARCHAR(50) NOT NULL PRIMARY KEY, company NVARCHAR(20) NOT NULL,
  baslik NVARCHAR(500) NULL, tur NVARCHAR(100) NULL, kategori NVARCHAR(100) NULL,
  hammadde NVARCHAR(500) NULL, kaynak NVARCHAR(500) NULL, kod NVARCHAR(100) NULL,
  adimlar NVARCHAR(MAX) NULL, [not] NVARCHAR(MAX) NULL,
  aktif NVARCHAR(10) NULL, tarih NVARCHAR(50) NULL, kullanici NVARCHAR(100) NULL
);
CREATE INDEX IX_Metodlar_company ON dbo.Metodlar(company);
GO

IF OBJECT_ID('dbo.Analiz','U') IS NULL
CREATE TABLE dbo.Analiz (
  id NVARCHAR(50) NOT NULL PRIMARY KEY, company NVARCHAR(20) NOT NULL,
  numuneId NVARCHAR(100) NULL, numune NVARCHAR(500) NULL,
  tur NVARCHAR(100) NULL, yontem NVARCHAR(200) NULL,
  sonuc NVARCHAR(200) NULL, birim NVARCHAR(50) NULL,
  tarih NVARCHAR(50) NULL, analist NVARCHAR(200) NULL,
  batchId NVARCHAR(100) NULL, [not] NVARCHAR(MAX) NULL,
  kullanici NVARCHAR(100) NULL,
  siparisKodu NVARCHAR(50) NULL, lotId NVARCHAR(50) NULL
);
CREATE INDEX IX_Analiz_company ON dbo.Analiz(company);
CREATE INDEX IX_Analiz_siparisKodu ON dbo.Analiz(siparisKodu);
GO

IF OBJECT_ID('dbo.Ekipman','U') IS NULL
CREATE TABLE dbo.Ekipman (
  id NVARCHAR(50) NOT NULL PRIMARY KEY, company NVARCHAR(20) NOT NULL,
  ad NVARCHAR(500) NULL, model NVARCHAR(200) NULL, seriNo NVARCHAR(200) NULL,
  lab NVARCHAR(100) NULL, konum NVARCHAR(200) NULL,
  kalibrasyonTarihi NVARCHAR(50) NULL, kalibrasyonFrekans NVARCHAR(50) NULL,
  bakimTarihi NVARCHAR(50) NULL, sorumlu NVARCHAR(100) NULL,
  durum NVARCHAR(50) NULL, [not] NVARCHAR(MAX) NULL, kullanici NVARCHAR(100) NULL
);
CREATE INDEX IX_Ekipman_company ON dbo.Ekipman(company);
GO

-- ── Eski/arşiv tablolar (UI artık kullanmıyor ama Excel'deki geçmiş veriler
--    kaybolmasın diye şemada tutuyoruz; ileride istersen DROP edebilirsin). ──

IF OBJECT_ID('dbo.Cikti','U') IS NULL
CREATE TABLE dbo.Cikti (
  id NVARCHAR(50) NOT NULL PRIMARY KEY,
  batchId NVARCHAR(100) NULL, ad NVARCHAR(500) NULL,
  hammadde NVARCHAR(500) NULL, hammaddeMiktar NVARCHAR(50) NULL,
  hammaddeBirim NVARCHAR(50) NULL, ciktiMiktar NVARCHAR(50) NULL,
  ciktiBirim NVARCHAR(50) NULL, tarih NVARCHAR(50) NULL,
  operator NVARCHAR(200) NULL, kosullar NVARCHAR(MAX) NULL,
  [not] NVARCHAR(MAX) NULL, kullanici NVARCHAR(100) NULL
);
GO

IF OBJECT_ID('dbo.Girdi','U') IS NULL
CREATE TABLE dbo.Girdi (
  id NVARCHAR(50) NOT NULL PRIMARY KEY,
  ad NVARCHAR(500) NULL, marka NVARCHAR(200) NULL, kategori NVARCHAR(100) NULL,
  lab NVARCHAR(100) NULL, miktar NVARCHAR(50) NULL, birim NVARCHAR(50) NULL,
  lotNo NVARCHAR(100) NULL, tedarikci NVARCHAR(300) NULL,
  tarih NVARCHAR(50) NULL, skt NVARCHAR(50) NULL, fatura NVARCHAR(200) NULL,
  [not] NVARCHAR(MAX) NULL, kullanici NVARCHAR(100) NULL
);
GO

IF OBJECT_ID('dbo.KalibTarihce','U') IS NULL
CREATE TABLE dbo.KalibTarihce (
  id NVARCHAR(50) NOT NULL PRIMARY KEY, company NVARCHAR(20) NOT NULL,
  ekipmanId NVARCHAR(50) NULL, ekipmanAd NVARCHAR(500) NULL,
  tarih NVARCHAR(50) NULL, yapan NVARCHAR(200) NULL,
  [not] NVARCHAR(MAX) NULL, kullanici NVARCHAR(100) NULL
);
CREATE INDEX IX_KalibTarihce_company ON dbo.KalibTarihce(company);
GO

IF OBJECT_ID('dbo.Temizlik','U') IS NULL
CREATE TABLE dbo.Temizlik (
  id NVARCHAR(50) NOT NULL PRIMARY KEY, company NVARCHAR(20) NOT NULL,
  gorev NVARCHAR(500) NULL, lab NVARCHAR(100) NULL, sorumlu NVARCHAR(100) NULL,
  periyot NVARCHAR(50) NULL, sonYapilma NVARCHAR(50) NULL,
  sonrakiTarih NVARCHAR(50) NULL, durum NVARCHAR(50) NULL,
  [not] NVARCHAR(MAX) NULL
);
CREATE INDEX IX_Temizlik_company ON dbo.Temizlik(company);
GO

IF OBJECT_ID('dbo.Gorevler','U') IS NULL
CREATE TABLE dbo.Gorevler (
  id NVARCHAR(50) NOT NULL PRIMARY KEY, company NVARCHAR(20) NOT NULL,
  baslik NVARCHAR(500) NULL, kategori NVARCHAR(100) NULL,
  atanan NVARCHAR(200) NULL, atayan NVARCHAR(200) NULL,
  tarih NVARCHAR(50) NULL, basTarih NVARCHAR(50) NULL, bitisTarih NVARCHAR(50) NULL,
  oncelik NVARCHAR(50) NULL, durum NVARCHAR(50) NULL,
  aciklama NVARCHAR(MAX) NULL, kullanici NVARCHAR(100) NULL
);
CREATE INDEX IX_Gorevler_company ON dbo.Gorevler(company);
GO

IF OBJECT_ID('dbo.GunlukLog','U') IS NULL
CREATE TABLE dbo.GunlukLog (
  id NVARCHAR(50) NOT NULL PRIMARY KEY, company NVARCHAR(20) NOT NULL,
  kullanici NVARCHAR(100) NULL, kullaniciAd NVARCHAR(200) NULL,
  tarih NVARCHAR(50) NULL, kategori NVARCHAR(100) NULL,
  baslik NVARCHAR(500) NULL, icerik NVARCHAR(MAX) NULL,
  duzenlendi NVARCHAR(10) NULL, duzenlemeTarihi NVARCHAR(50) NULL
);
CREATE INDEX IX_GunlukLog_company ON dbo.GunlukLog(company);
CREATE INDEX IX_GunlukLog_tarih ON dbo.GunlukLog(tarih);
GO

IF OBJECT_ID('dbo.IletisimKisileri','U') IS NULL
CREATE TABLE dbo.IletisimKisileri (
  id NVARCHAR(50) NOT NULL PRIMARY KEY, company NVARCHAR(20) NOT NULL,
  ad NVARCHAR(200) NULL, kurum NVARCHAR(200) NULL, unvan NVARCHAR(200) NULL,
  telefon NVARCHAR(50) NULL, email NVARCHAR(200) NULL, kategori NVARCHAR(100) NULL,
  sonGorusme NVARCHAR(50) NULL, [not] NVARCHAR(MAX) NULL,
  kullanici NVARCHAR(100) NULL, guncelleme NVARCHAR(50) NULL
);
CREATE INDEX IX_IletisimKisileri_company ON dbo.IletisimKisileri(company);
GO

IF OBJECT_ID('dbo.Bildirimler','U') IS NULL
CREATE TABLE dbo.Bildirimler (
  id NVARCHAR(50) NOT NULL PRIMARY KEY, company NVARCHAR(20) NULL,
  kime NVARCHAR(100) NULL, baslik NVARCHAR(500) NULL,
  mesaj NVARCHAR(MAX) NULL, tur NVARCHAR(100) NULL,
  okundu NVARCHAR(10) NULL, tarih NVARCHAR(50) NULL,
  olusturan NVARCHAR(200) NULL, sayfa NVARCHAR(100) NULL,
  kayitId NVARCHAR(50) NULL, emailGonderildi NVARCHAR(10) NULL
);
CREATE INDEX IX_Bildirimler_kime ON dbo.Bildirimler(kime);
GO

IF OBJECT_ID('dbo.DuzenlemeLoglari','U') IS NULL
CREATE TABLE dbo.DuzenlemeLoglari (
  id NVARCHAR(50) NOT NULL PRIMARY KEY, company NVARCHAR(20) NOT NULL,
  modul NVARCHAR(100) NULL, kayitId NVARCHAR(50) NULL,
  kullanici NVARCHAR(100) NULL, tarih NVARCHAR(50) NULL,
  onceki NVARCHAR(MAX) NULL, sonraki NVARCHAR(MAX) NULL
);
CREATE INDEX IX_DuzenlemeLoglari_company ON dbo.DuzenlemeLoglari(company);
GO

-- ── Syntegra V2 (proje takibi) ──────────────────────────────────────────────

IF OBJECT_ID('dbo.Syn2_Projeler','U') IS NULL
CREATE TABLE dbo.Syn2_Projeler (
  id NVARCHAR(50) NOT NULL PRIMARY KEY, company NVARCHAR(20) NOT NULL,
  projectCode NVARCHAR(50) NULL, projeAdi NVARCHAR(500) NULL,
  musteri NVARCHAR(300) NULL, musteriKisaltma NVARCHAR(10) NULL,
  sorumlu NVARCHAR(100) NULL, baslangic NVARCHAR(50) NULL, termin NVARCHAR(50) NULL,
  durum NVARCHAR(50) NULL,
  sartnameDosyalar NVARCHAR(MAX) NULL, tasarimDosyalar NVARCHAR(MAX) NULL,
  driveFolderId NVARCHAR(100) NULL, aciklama NVARCHAR(MAX) NULL,
  olusturan NVARCHAR(100) NULL, olusturma NVARCHAR(50) NULL, guncelleme NVARCHAR(50) NULL
);
CREATE INDEX IX_Syn2_Projeler_company ON dbo.Syn2_Projeler(company);
CREATE INDEX IX_Syn2_Projeler_projectCode ON dbo.Syn2_Projeler(projectCode);
GO

IF OBJECT_ID('dbo.Syn2_Muhendislik','U') IS NULL
CREATE TABLE dbo.Syn2_Muhendislik (
  id NVARCHAR(50) NOT NULL PRIMARY KEY, company NVARCHAR(20) NOT NULL,
  projectCode NVARCHAR(50) NULL, durum NVARCHAR(50) NULL,
  pidDosyalar NVARCHAR(MAX) NULL, cizimDosyalar NVARCHAR(MAX) NULL,
  revizyonNumarasi NVARCHAR(20) NULL, revizyonGecmisi NVARCHAR(MAX) NULL,
  sonGonderim NVARCHAR(50) NULL, sonKararKullanici NVARCHAR(100) NULL,
  sonKararTarih NVARCHAR(50) NULL, satinalmaSorumlu NVARCHAR(100) NULL,
  olusturan NVARCHAR(100) NULL, olusturma NVARCHAR(50) NULL, guncelleme NVARCHAR(50) NULL
);
CREATE INDEX IX_Syn2_Muhendislik_projectCode ON dbo.Syn2_Muhendislik(projectCode);
GO

IF OBJECT_ID('dbo.Syn2_Ekipman','U') IS NULL
CREATE TABLE dbo.Syn2_Ekipman (
  id NVARCHAR(50) NOT NULL PRIMARY KEY, company NVARCHAR(20) NOT NULL,
  projectCode NVARCHAR(50) NULL, body NVARCHAR(200) NULL,
  altParca NVARCHAR(500) NULL, adet NVARCHAR(50) NULL,
  olcu NVARCHAR(200) NULL, malzemeCinsi NVARCHAR(200) NULL,
  malzemeKalitesi NVARCHAR(200) NULL, amac NVARCHAR(MAX) NULL,
  [not] NVARCHAR(MAX) NULL, termin NVARCHAR(50) NULL,
  uretimTermin NVARCHAR(50) NULL, siraNo NVARCHAR(20) NULL,
  kullanici NVARCHAR(100) NULL, olusturma NVARCHAR(50) NULL, guncelleme NVARCHAR(50) NULL
);
CREATE INDEX IX_Syn2_Ekipman_projectCode ON dbo.Syn2_Ekipman(projectCode);
CREATE INDEX IX_Syn2_Ekipman_body ON dbo.Syn2_Ekipman(body);
GO

IF OBJECT_ID('dbo.Syn2_Teklif','U') IS NULL
CREATE TABLE dbo.Syn2_Teklif (
  id NVARCHAR(50) NOT NULL PRIMARY KEY, company NVARCHAR(20) NOT NULL,
  projectCode NVARCHAR(50) NULL, ekipmanId NVARCHAR(50) NULL,
  tedarikci NVARCHAR(300) NULL, fiyat NVARCHAR(50) NULL,
  paraBirimi NVARCHAR(10) NULL, termin NVARCHAR(50) NULL,
  odeme NVARCHAR(MAX) NULL, teslimat NVARCHAR(MAX) NULL,
  kazanan NVARCHAR(10) NULL, kazanmaSebebi NVARCHAR(MAX) NULL,
  onayDurumu NVARCHAR(20) NULL, onayKullanici NVARCHAR(100) NULL,
  onayTarihi NVARCHAR(50) NULL, onayNot NVARCHAR(MAX) NULL,
  durum NVARCHAR(50) NULL, kullanici NVARCHAR(100) NULL,
  olusturma NVARCHAR(50) NULL, guncelleme NVARCHAR(50) NULL
);
CREATE INDEX IX_Syn2_Teklif_projectCode ON dbo.Syn2_Teklif(projectCode);
CREATE INDEX IX_Syn2_Teklif_ekipmanId ON dbo.Syn2_Teklif(ekipmanId);
GO

IF OBJECT_ID('dbo.Syn2_Gantt','U') IS NULL
CREATE TABLE dbo.Syn2_Gantt (
  id NVARCHAR(50) NOT NULL PRIMARY KEY, company NVARCHAR(20) NOT NULL,
  projectCode NVARCHAR(50) NULL, tip NVARCHAR(20) NULL,
  body NVARCHAR(200) NULL, baslik NVARCHAR(500) NULL,
  baslangic NVARCHAR(50) NULL, bitis NVARCHAR(50) NULL,
  kullanici NVARCHAR(100) NULL,
  olusturma NVARCHAR(50) NULL, guncelleme NVARCHAR(50) NULL
);
CREATE INDEX IX_Syn2_Gantt_projectCode ON dbo.Syn2_Gantt(projectCode);
GO

-- ── Fuwell sipariş takibi ───────────────────────────────────────────────────

IF OBJECT_ID('dbo.Fuw_Siparis','U') IS NULL
CREATE TABLE dbo.Fuw_Siparis (
  id NVARCHAR(50) NOT NULL PRIMARY KEY, company NVARCHAR(20) NOT NULL,
  orderCode NVARCHAR(50) NULL, musteri NVARCHAR(300) NULL,
  musteriKisaltma NVARCHAR(10) NULL, urun NVARCHAR(300) NULL,
  hedefMiktar NVARCHAR(50) NULL, birim NVARCHAR(20) NULL,
  hedefSpek NVARCHAR(MAX) NULL,
  baslangic NVARCHAR(50) NULL, termin NVARCHAR(50) NULL,
  durum NVARCHAR(50) NULL, sorumlu NVARCHAR(100) NULL,
  sartnameDosyalar NVARCHAR(MAX) NULL, etiketDosyalar NVARCHAR(MAX) NULL,
  driveFolderId NVARCHAR(100) NULL, aciklama NVARCHAR(MAX) NULL,
  olusturan NVARCHAR(100) NULL, olusturma NVARCHAR(50) NULL, guncelleme NVARCHAR(50) NULL
);
CREATE INDEX IX_Fuw_Siparis_company ON dbo.Fuw_Siparis(company);
CREATE INDEX IX_Fuw_Siparis_orderCode ON dbo.Fuw_Siparis(orderCode);
GO

IF OBJECT_ID('dbo.Fuw_Lot','U') IS NULL
CREATE TABLE dbo.Fuw_Lot (
  id NVARCHAR(50) NOT NULL PRIMARY KEY, company NVARCHAR(20) NOT NULL,
  orderCode NVARCHAR(50) NULL, lotNo NVARCHAR(20) NULL,
  lotAdi NVARCHAR(300) NULL, planlananMiktar NVARCHAR(50) NULL,
  gerceklesenMiktar NVARCHAR(50) NULL, birim NVARCHAR(20) NULL,
  durum NVARCHAR(50) NULL, sorumlu NVARCHAR(100) NULL,
  baslangic NVARCHAR(50) NULL, bitis NVARCHAR(50) NULL,
  [not] NVARCHAR(MAX) NULL, olusturan NVARCHAR(100) NULL,
  olusturma NVARCHAR(50) NULL, guncelleme NVARCHAR(50) NULL
);
CREATE INDEX IX_Fuw_Lot_orderCode ON dbo.Fuw_Lot(orderCode);
GO

IF OBJECT_ID('dbo.Fuw_Yukleme','U') IS NULL
CREATE TABLE dbo.Fuw_Yukleme (
  id NVARCHAR(50) NOT NULL PRIMARY KEY, company NVARCHAR(20) NOT NULL,
  orderCode NVARCHAR(50) NULL, lotId NVARCHAR(50) NULL,
  yuklemeNo NVARCHAR(20) NULL, methodId NVARCHAR(50) NULL, methodAd NVARCHAR(500) NULL,
  sicaklik NVARCHAR(20) NULL, basinc NVARCHAR(20) NULL,
  co2Akis NVARCHAR(20) NULL, sure NVARCHAR(20) NULL,
  hammadKutle NVARCHAR(20) NULL, ciktiKutle NVARCHAR(20) NULL,
  verim NVARCHAR(20) NULL, sfeSnapshot NVARCHAR(MAX) NULL,
  operator NVARCHAR(100) NULL, baslangic NVARCHAR(50) NULL, bitis NVARCHAR(50) NULL,
  [not] NVARCHAR(MAX) NULL,
  olusturma NVARCHAR(50) NULL, guncelleme NVARCHAR(50) NULL
);
CREATE INDEX IX_Fuw_Yukleme_lotId ON dbo.Fuw_Yukleme(lotId);
CREATE INDEX IX_Fuw_Yukleme_methodId ON dbo.Fuw_Yukleme(methodId);
GO

IF OBJECT_ID('dbo.Fuw_Formulasyon','U') IS NULL
CREATE TABLE dbo.Fuw_Formulasyon (
  id NVARCHAR(50) NOT NULL PRIMARY KEY, company NVARCHAR(20) NOT NULL,
  orderCode NVARCHAR(50) NULL, tarih NVARCHAR(50) NULL,
  lotIds NVARCHAR(MAX) NULL, oranlar NVARCHAR(MAX) NULL,
  hedefSpek NVARCHAR(MAX) NULL, gerceklesenSpek NVARCHAR(MAX) NULL,
  notalar NVARCHAR(MAX) NULL, sorumlu NVARCHAR(100) NULL,
  planlananBitis NVARCHAR(50) NULL,
  onayDurumu NVARCHAR(20) NULL, onayKullanici NVARCHAR(100) NULL,
  onayTarihi NVARCHAR(50) NULL, onayNot NVARCHAR(MAX) NULL,
  olusturma NVARCHAR(50) NULL, guncelleme NVARCHAR(50) NULL
);
CREATE INDEX IX_Fuw_Formulasyon_orderCode ON dbo.Fuw_Formulasyon(orderCode);
GO

IF OBJECT_ID('dbo.Fuw_Paketleme','U') IS NULL
CREATE TABLE dbo.Fuw_Paketleme (
  id NVARCHAR(50) NOT NULL PRIMARY KEY, company NVARCHAR(20) NOT NULL,
  orderCode NVARCHAR(50) NULL, sku NVARCHAR(100) NULL,
  siseTipi NVARCHAR(50) NULL, hacim NVARCHAR(20) NULL, adet NVARCHAR(20) NULL,
  batchId NVARCHAR(100) NULL, etiketDosya NVARCHAR(MAX) NULL,
  sevkiyatTermini NVARCHAR(50) NULL, gonderim NVARCHAR(50) NULL,
  [not] NVARCHAR(MAX) NULL, olusturan NVARCHAR(100) NULL,
  olusturma NVARCHAR(50) NULL, guncelleme NVARCHAR(50) NULL
);
CREATE INDEX IX_Fuw_Paketleme_orderCode ON dbo.Fuw_Paketleme(orderCode);
GO

IF OBJECT_ID('dbo.Fuw_Gantt','U') IS NULL
CREATE TABLE dbo.Fuw_Gantt (
  id NVARCHAR(50) NOT NULL PRIMARY KEY, company NVARCHAR(20) NOT NULL,
  orderCode NVARCHAR(50) NULL, tip NVARCHAR(20) NULL,
  body NVARCHAR(200) NULL, baslik NVARCHAR(500) NULL,
  baslangic NVARCHAR(50) NULL, bitis NVARCHAR(50) NULL,
  kullanici NVARCHAR(100) NULL,
  olusturma NVARCHAR(50) NULL, guncelleme NVARCHAR(50) NULL
);
CREATE INDEX IX_Fuw_Gantt_orderCode ON dbo.Fuw_Gantt(orderCode);
GO

-- ── Mesai (Apps Script eski OVERTIME_HEADERS) ──────────────────────────────

IF OBJECT_ID('dbo.Mesai','U') IS NULL
CREATE TABLE dbo.Mesai (
  id NVARCHAR(50) NOT NULL PRIMARY KEY, company NVARCHAR(20) NOT NULL,
  kullanici NVARCHAR(100) NULL, kullaniciAd NVARCHAR(200) NULL,
  tarih NVARCHAR(50) NULL, baslangic NVARCHAR(20) NULL, bitis NVARCHAR(20) NULL,
  molaDakika NVARCHAR(20) NULL, toplamSaat NVARCHAR(20) NULL,
  aciklama NVARCHAR(MAX) NULL, durum NVARCHAR(50) NULL,
  olusturma NVARCHAR(50) NULL, onaylayan NVARCHAR(200) NULL,
  onayTarihi NVARCHAR(50) NULL, adminNot NVARCHAR(MAX) NULL
);
CREATE INDEX IX_Mesai_kullanici ON dbo.Mesai(kullanici);
GO

-- ── Backend yardımcı tablo (sipariş/proje counter, vb.) ────────────────────

IF OBJECT_ID('dbo.AppCounters','U') IS NULL
CREATE TABLE dbo.AppCounters (
  [key] NVARCHAR(100) NOT NULL PRIMARY KEY,
  value INT NOT NULL DEFAULT 0,
  updatedAt DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
GO

-- ── Dosya görünürlüğü (Drive yerine SQL'de tutuyoruz) ──────────────────────

IF OBJECT_ID('dbo.Files','U') IS NULL
CREATE TABLE dbo.Files (
  id NVARCHAR(50) NOT NULL PRIMARY KEY,        -- ulu uuid
  parentFolderId NVARCHAR(50) NULL,            -- klasörler için
  isFolder BIT NOT NULL DEFAULT 0,
  name NVARCHAR(500) NOT NULL,
  mimeType NVARCHAR(200) NULL,
  size BIGINT NULL,
  diskPath NVARCHAR(MAX) NULL,                 -- sunucu diskindeki tam yol
  uploadedBy NVARCHAR(100) NULL,
  visibility NVARCHAR(50) NULL,                -- 'fuwell' / 'syntegra' / 'fuwell,syntegra' / NULL
  description NVARCHAR(MAX) NULL,
  created DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_Files_parent ON dbo.Files(parentFolderId);
GO

PRINT '✓ Tüm tablolar oluşturuldu. (30 aktif + 2 arşiv + 2 backend yardımcı = 34)';
GO
