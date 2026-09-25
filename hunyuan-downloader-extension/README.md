# Hunyuan 3D Toplu Model İndirici (Batch Downloader)

Bu araç, **Tencent Hunyuan 3D** (`https://3d.hunyuan.tencent.com/assets`) üzerinde ürettiğiniz tüm 3D modelleri (`.glb`, PBR kaplamaları dahil) tek tek tıklamak zorunda kalmadan **toplu olarak veya tek bir ZIP arşivinde** indirmenizi sağlar.

---

## 🚀 1. Yöntem: En Hızlı Yol (Kurulum Gerektirmez - Konsol)

Tarayıcınıza hiçbir şey yüklemeden anında kullanabilirsiniz:

1. Chrome'da **`https://3d.hunyuan.tencent.com/assets`** sayfasına gidin (giriş yapılmış olmalıdır).
2. Klavyeden **`F12`** tuşuna basarak (veya sağ tıklayıp *İncele* diyerek) Geliştirici Araçları'nı açın.
3. Üstteki sekmelerden **`Console`** (Konsol) sekmesine tıklayın.
4. **`content.js`** dosyasının tüm içeriğini kopyalayıp konsola yapıştırın ve **`Enter`** tuşuna basın.
5. Sayfanın sağ alt köşesinde mor bir **`Toplu İndir`** butonu belirecektir!
6. Butona tıklayın:
   * **📦 Hepsini Tek ZIP Olarak İndir (Önerilen)**: Tüm modelleri arka planda indirip tek bir `.zip` dosyası halinde verir.
   * **⚡ Tek Tek İndir**: Modelleri tarayıcı indirme yöneticisi üzerinden tek tek indirir.
   * **📋 Linkleri Kopyala**: IDM veya JDownloader ile topluca çekmek için linkleri panoya kopyalar.

---

## 🧩 2. Yöntem: Kalıcı Chrome Eklentisi (Extension) Olarak Yükleme

Her seferinde kod yapıştırmak istemiyorsanız 30 saniyede kalıcı eklenti yapabilirsiniz:

1. Google Chrome adres çubuğuna şunu yazın ve Enter'a basın:
   ```text
   chrome://extensions
   ```
2. Sağ üst köşedeki **"Geliştirici modu" (Developer mode)** anahtarını açın.
3. Sol üstte beliren **"Paketlenmemiş öğe yükle" (Load unpacked)** butonuna tıklayın.
4. Açılan dosya seçim penceresinde şu klasörü seçin:
   ```text
   D:\UE_Games\Github\portfolio\hunyuan-downloader-extension
   ```
5. Artık `https://3d.hunyuan.tencent.com/assets` sayfasına her girdiğinizde sağ altta otomatik olarak **"Toplu İndir"** butonu hazır olacaktır!
