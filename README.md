# arsen-lab

Arsen Lab Takip sistemi tek dosyalik statik bir laboratuvar takip panelidir. Ana uygulama `index.html` icindedir ve veri kaynagi Google Sheets / Apps Script entegrasyonudur.

## Yerel yedek

Guncelleme oncesi ana dosyalar bu lokal calisma alaninda `backups/` klasorune kopyalandi. Bu klasor GitHub Pages yayini icin repoya eklenmez.

- `backups/index.original-20260503-235646.html`
- `backups/README.original-20260503-235646.md`

## Son guncellemeler

- Stok takip ekrani kategori bazli acilir/kapanir basliklara ayrildi.
- Her kategori altinda dolap ve raf kirilimi gosteriliyor.
- Stok formuna `Dolap` alani eklendi.
- Stok ve cikti arama alanlari yazdikca filtreleyecek sekilde duzeltildi.
- `Lab-2` yerine `Ek Lab` eklendi.
- Girdi kayitlari Stok'a aktarildi ve Girdi sekmesi arayuzden kaldirildi.
- Kullanici yonetimine `Google E-posta` alani eklendi. Bu alan, Google Sheets ve Drive izinleriyle ekip hesabi eslestirmek icin kullanilacak.

## Not

Stok sheet semasina `dolap` kolonu eklendi. Uygulama ilk stok kaydinda/yaziminda Google Sheets tarafindaki Stok basligini yeni sirayla yazacaktir.

Girdi -> Stok aktarimi oncesi canli verinin yedegi lokal olarak `backups/girdi-stok-backup-2026-05-03T21-34-16-085Z.json` dosyasina alindi.

## Restricted erisim gecis notu

Bu repo tarafinda kullanici kaydina `email` kolonu eklendi. Uygulamada admin panelinden her ekip uyesinin Google e-postasi kaydedilebilir.

Restricted modele gecmek icin yarin izlenecek kisa siralama:

1. `Users` sheet basliginda `email` kolonu oldugunu dogrula.
2. Admin panelinden her kullanicinin Google e-postasini gir.
3. Google Sheets paylasimini `Restricted` yap ve sadece ekip maillerini ekle.
4. Drive ana klasorunu `Restricted` yap ve ayni mailleri ekle.
5. Apps Script deployment erisim ayarlarini gozden gecir.

Not: Bu degisiklik kullanici-mail eslesmesini hazirlar; tek basina tam erisim kontrolu saglamaz. Google tarafindaki paylasim ve deployment ayarlari birlikte uygulanmalidir.
