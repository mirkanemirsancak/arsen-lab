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
- `Cikti Takibi` sekmesi arayuzden kaldirildi; stok girdi/cikti islemleri artik dogrudan `Stok Takibi` icindeki Girdi ve Cikti butonlariyla yapilir.
- `StokHareketleri` sayfasi eklendi. Her stok girdi/cikti islemi onceki miktar, sonraki miktar, tarih, aciklama ve kullanici bilgisiyle kaydedilir.
- `Metodlar` sayfasi eklendi. `Metodlar ve Izlekler` sekmesinde izlekler, hammadde surecleri ve standart bilimsel metodlar filtrelenebilir ve duzenlenebilir.
- Gorev takviminde aylik/haftalik takvim gorunumleri kaldirildi; yalnizca haftalik cizelge kaldi.
- Haftalik cizelgeye admin tarafindan girilen ana hedefler, secilebilir renkler ve surukle-birak gorev tasima eklendi.
- `IletisimKisileri` sayfasi eklendi. Rehber kayitlarini herkes ekleyip duzenleyebilir, silme yetkisi yalnizca admindedir.
- Tarih alanlari yerel saatle hesaplanacak sekilde duzeltildi; gunluk loglarda UTC kaynakli yanlis gun sorunu giderildi.
- Ilk baglanti ve periyodik senkronizasyon hizlandirildi. Uygulama artik sheet'leri tek tek ardarda okumak yerine token kontrollu `batchRead` ile tek istekte toplu okur.
- Mesai rozeti gibi ikincil bilgiler giris ekranini bekletmeden arka planda yuklenir; otomatik senkronizasyon acik modal varken ekrani yeniden cizmez.
- `Bildirimler` sayfasi eklendi. Kullanici bazli uygulama ici popup/rozet bildirimleri tutulur.
- Admin panelden ekibe veya kisiye bildirim gonderebilir; istege bagli olarak kullanicinin kurumsal e-posta adresine Apps Script uzerinden mail gider.
- Cizelgeye yeni gorev eklenirken atanan kisiye popup ve opsiyonel e-posta bildirimi gonderilir. Ekstra mesai onay/red islemlerinde de kullanici bilgilendirilir.
- Bildirimler backend tarafinda kullaniciya gore filtrelenir; kullanici yalnizca kendi bildirimlerini okundu yapabilir.
- Kayit islemleri ekrani bekletmeden arka planda siraya alinir; acik sheet yazimi bitene kadar otomatik senkronizasyon o modulu ezmez. Bu, ozellikle cizelgede kisi/gorev silme ve ekleme islemlerini anlik hale getirir.
- Cizelgede gorev ekleme, silme, duzenleme ve tasima tum giris yapmis kullanicilara acildi; kisi/gun/ana hedef yapisini yonetme yetkisi adminde kalir.
- Ana hedefler `Haftalik`, `Aylik`, `3 Aylik`, `6 Aylik` ve `Yillik` donemlerine ayrildi ve cizelge uzerinden filtrelenebilir hale getirildi.
- `Superkritik CO2` hesaplayici sekmesi eklendi. CO2 kritik bolge kontrolu, CO2 tuketimi, solvent/hammadde orani, tahmini ekstrakt, co-solvent ve residence time hesaplari yapilir.

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

## E-posta zorunlu oturum modeli

Apps Script backend'i `login` disindaki tum okuma/yazma/Drive/Mesai islemleri icin oturum token'i ister. Token yalnizca aktif ve `email` alani dolu kullanicilara verilir.

- E-postasi bos kullanici sisteme giris yapamaz.
- Drive dosyalari `Anyone with link` yerine aktif kullanici e-postalarina viewer olarak paylasilacak sekilde ayarlanir.
- `Users` sheet yazimi yalnizca admin token'i ile yapilabilir.
- Apps Script kodu guncellendikten sonra mutlaka yeni deployment versiyonu alinmalidir.
- Dosya listesi okunurken veya dosya yuklenirken Apps Script artik dosya/klasor bazli tekrar tekrar viewer eklemez. Drive erisimi, ana `Arsen Lab Dosyalar` klasorunun Google Drive paylasimindan yonetilir; boylece ekibe surekli erisim bildirimi gitmez.

## Apps Script sayfa basliklari

`apps-script-drive-backend.gs`, `StokHareketleri`, `Metodlar`, `IletisimKisileri` ve `Bildirimler` sheet'leri yoksa ilk okumada otomatik olusturur ve baslik satirlarini yazar. Backend ayrica guvenli toplu okuma icin `batchRead`, bildirim/e-posta icin `createNotification`, okundu islemi icin `markNotificationsRead` destekler. Bu nedenle bu guncellemeden sonra Apps Script kodu tekrar yapistirilip yeni deployment alinmalidir.
