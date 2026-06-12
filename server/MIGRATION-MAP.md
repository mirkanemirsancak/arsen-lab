# Geçişin Görsel Özeti

## Şu an (Google Apps Script + Sheets)

```
┌─────────────────┐      HTTPS       ┌──────────────────────┐
│ Browser / PWA   │ ───────────────▶ │ GitHub Pages         │
│ (Mac/PC/Phone)  │                  │ (index.html, sw.js)  │
└─────────────────┘                  └──────────────────────┘
        │                                     │
        │ fetch (POST/GET)                    │ static
        ▼                                     │
┌─────────────────────────┐                   │
│ Google Apps Script      │                   │
│ (doGet/doPost endpoints)│                   │
└─────────────────────────┘                   │
        │                                     │
        ├──▶ Google Sheets (ArsenLabDB.xlsx, 32 sayfa)
        │
        └──▶ Google Drive (dosyalar)
```

## Geçiş sonrası (Windows Server + MSSQL)

```
┌─────────────────┐  HTTPS (VPN içi) ┌──────────────────────┐
│ Browser / PWA   │ ───────────────▶ │ IIS                  │
│ (Mac/PC/Phone)  │                  │ index.html (statik)  │
└─────────────────┘                  └──────────────────────┘
        │                                     │
        │ fetch /api/...                      │
        ▼                                     │
┌─────────────────────────┐                   │
│ ASP.NET Core 8 API      │                   │
│ (Controllers)           │                   │
└─────────────────────────┘                   │
        │                                     │
        ├──▶ MSSQL Express (ArsenProcess DB, 34 tablo)
        │
        └──▶ Yerel disk (D:\Arsen\Files\)
```

## Excel → MSSQL eşleşmesi (sıfır veri kaybı)

| Excel Sheet | MSSQL Tablo | Aktif kullanılıyor mu? |
|---|---|---|
| Users | dbo.Users | ✅ Tüm kullanıcılar |
| Stok, StokHareketleri | dbo.Stok, dbo.StokHareketleri | ✅ Stok takibi |
| Metodlar | dbo.Metodlar | ✅ Metodlar/İzlekler |
| Analiz | dbo.Analiz | ✅ Analiz sonuçları |
| Ekipman, KalibTarihce, Temizlik | aynı | ✅ Ekipman+kalibrasyon |
| Gorevler, GunlukLog | aynı | ✅ Görevler, log |
| IletisimKisileri, Bildirimler | aynı | ✅ Kişiler, bildirimler |
| Syn2_Projeler / Muhendislik / Ekipman / Teklif / Gantt | aynı | ✅ Syntegra proje takibi |
| Fuw_Siparis / Lot / Yukleme / Formulasyon / Paketleme / Gantt | aynı | ✅ Fuwell sipariş takibi |
| Mesai | dbo.Mesai | ✅ Ekstra mesai |
| DuzenlemeLoglari | aynı | ✅ Audit log |
| **Cikti** | dbo.Cikti | ⚠ Arşiv — UI yok ama veri korunur |
| **Girdi** | dbo.Girdi | ⚠ Arşiv — UI yok ama veri korunur |
| SynProjeler / Timeline / Satinalma / Maliyet / Raporlar (V1) | aynı | ⚠ Eski Syntegra V1 — geçmiş veri için |
| **(yeni)** AppCounters | dbo.AppCounters | 🆕 Sipariş/proje sayaçları (FUW-NNN, ARS-NNN) |
| **(yeni)** Files | dbo.Files | 🆕 Dosya metadata (Drive yerine MSSQL'de) |

**Sonuç**: Excel'deki 32 sayfa → **30 aktif tablo + 2 arşiv + 2 backend yardımcı = 34 SQL tablo.** Kolon adları birebir aynı (kolon sırası farklı olabilir ama SSMS Import Wizard isimle eşleştirir).

## Pratikte ne demek

- **Arayüz aynı** — kullanıcılar fark etmez (sadece URL değişir)
- **Veriler güvende** — eski Excel/Sheets de yedek olarak kalır; MSSQL'e tam kopya gider
- **Geri dönüş mümkün** — frontend'in `SCRIPT_URL`'ini eski Apps Script'e çevirirsen eski sistem aynen çalışır
- **Hız artar** — yerel sunucu + MSSQL, Apps Script'in 1-3 sn gecikmesini ortadan kaldırır
- **Kontrol sende** — şirket içi sunucu, internete açık değil, yedek senin elinde

## Doğru gidiyor muyuz?

✅ **Evet.** Şu an Faz A'dayız — SQL şemasını hazırladık, Excel→CSV→MSSQL göçü için araçlar tamam. Sırada **Faz B** (ASP.NET Core API). Sen SSMS'te schema'yı çalıştırıp Excel'i import ettiğinde "Faz A OK" de, ben backend'i yazmaya başlarım.
