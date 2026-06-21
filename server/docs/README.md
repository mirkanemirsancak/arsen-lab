# Akış Şemaları Dokümantasyonu

Bu klasör, Arşen Process sisteminin Fuwell ve Syntegra iş akışlarını LaTeX/TikZ
ile belgeler.

## Dosyalar

- `akis-semalari.tex` — kaynak LaTeX dosyası
- `akis-semalari.pdf` — derlenmiş PDF (12 sayfa)

## İçerik

1. Kapak + içindekiler
2. Giriş ve gösterim açıklaması
3. **Fuwell akış şeması** (sipariş → lot → yükleme → formülasyon → paketleme → teslim)
4. Fuwell aşama detayları (yetkili kim, ne yapar)
5. **Syntegra akış şeması** (proje → mühendislik → ekipman → satın alma → tamamlandı)
6. Syntegra aşama detayları
7. Yetki matrisi (Fuwell ve Syntegra için ayrı)
8. Sistem veri akışı (üst seviye mimari)
9. Entegrasyon noktaları (SFE → yükleme, Analiz → lot, Metodlar → yükleme)
10. Özet

## Yeniden derlemek için

Sunucuda (Windows) veya yerelde:

```bash
# Linux/Mac
pdflatex akis-semalari.tex
pdflatex akis-semalari.tex  # ikinci geçiş — TOC sayfa numaraları için

# Windows (MiKTeX kurulu ise)
pdflatex akis-semalari.tex
```

İki kez çalıştırılması gerekir çünkü ilk geçişte TOC oluşur, ikinci geçişte
sayfa numaraları doğru yerleşir.

## Notlar

- `babel-turkish` paketi TikZ'in font komutlarıyla çakışıyordu; sadece
  `inputenc` + `T1 fontenc` kullanıldı. Türkçe karakterler düzgün gösterilir,
  yalnızca Türkçe tireleme kurallarını kullanmaz (bizim için sorun değil).
- TikZ akış kutuları içinde Türkçe karakterler değil ASCII tercih edildi
  (Hayır → Hayir, Eşik → Esik, vs.); diğer metinlerde tüm Türkçe karakterler
  korundu.

## Süreç değiştiğinde

Sipariş veya proje akışında bir değişiklik olursa:
1. `akis-semalari.tex` içindeki ilgili `tikzpicture` bloğunu güncelle
2. `pdflatex` ile yeniden derle
3. PDF'i commit'le
