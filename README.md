# Beraat Yetkin • Portfolio & Enterprise Projects Showcase 🚀
> **Full-Stack Web Geliştirici • Unreal Engine C++ Oyun Geliştiricisi • 3D Sanatçısı**

[![Portfolio Canlı Demo](https://img.shields.io/badge/Portfolyo-Canl%C4%B1_Yayın-4a9eff?style=for-the-badge&logo=google-chrome&logoColor=white)](https://github.com/kubrvk/portfolio)
[![Lisans](https://img.shields.io/badge/Lisans-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![Unreal Engine](https://img.shields.io/badge/Unreal_Engine-5.x_%7C_C%2B%2B-black?style=for-the-badge&logo=unrealengine)](https://unrealengine.com)
[![Full-Stack Web](https://img.shields.io/badge/Web-JavaScript_%7C_React_%7C_Node-yellow?style=for-the-badge&logo=javascript)](https://developer.mozilla.org)
[![3D Graphics](https://img.shields.io/badge/3D-Three.js_%7C_WebGL_%7C_Blender-purple?style=for-the-badge&logo=three.js)](https://threejs.org)

---

## 📸 Portfolyo Önizleme (Previews)

### 1. Karşılama Alanı & Geliştirici Profili (Hero Section)
Unreal Engine Blueprint estetiğinde tasarlanmış interaktif profil kartı, yetkinlikler ve dinamik arka plan ağı:
![Beraat Yetkin Portfolyo Hero Önizleme](docs/preview-hero.png)

### 2. Canlı Projeler Vitrini (Projects Showcase)
Geliştirilen kurumsal SaaS platformları, 3D WebGL stüdyoları ve Unreal Engine C++ oyun projelerinin canlı vitrini:
![Beraat Yetkin Projeler Önizleme](docs/preview-projects.png)

---

## 🌟 Canlı Kurumsal SaaS & 3D Proje Ekosistemi

Bu portfolyoda sergilenen ve her biri sektörel ihtiyaçlara göre bağımsız mimarilerle geliştirilip Firebase üzerinde canlıya alınan 6 ana proje:

| Proje | Sektörel Kimlik & Mimari | Öne Çıkan Yetenekler | Canlı Demo | Kaynak Kod |
| :--- | :--- | :--- | :---: | :---: |
| **TaskFlow.Ops** | **Agile & DevOps Görev Masası** (Linear / Jira) | 4 kolonlu Kanban, belirgin görev silme (`promptDeleteTask`), dinamik sprint yüzdesi, PostgreSQL audit log simülasyonu, oturum kalıcılığı. | [taskflowops.web.app](https://taskflowops.web.app) | [GitHub](https://github.com/kubrvk/TaskFlow) |
| **FieldOps** | **Endüstriyel Dispatcher Konsolu** (Saha Sevk) | İki kolonlu saha konsolu (split-screen), canlı GPS telemetrisi, ISO-9001 muayene kriterleri, iş emri silme, SQLite kuyruğu. | [fieldopsapp.web.app](https://fieldopsapp.web.app) | [GitHub](https://github.com/kubrvk/FieldOps) |
| **FinFlow ERP** | **Kurumsal E-Fatura & Mizan Terminali** (SAP / NetSuite) | İki panelli Wall Street kurumsal giriş, TCMB canlı döviz kurları, fatura satırı silme, KDV ve genel mizan bakiye dengelemesi. | [finflow-erp.web.app](https://finflow-erp.web.app) | [GitHub](https://github.com/kubrvk/FinFlow-ERP) |
| **DocVault DMS** | **Kriptografik Bulut Arşivi** (Google Drive / Box) | Sıfır bilgi (Zero-Knowledge) siber geçit, S3 canlı depolama kotası, SHA-256 bütünlük kontrolü, kasa belgesi silme ve kota indirgeme. | [docvaultdms.web.app](https://docvaultdms.web.app) | [GitHub](https://github.com/kubrvk/DocVault-DMS) |
| **ServisPort** | **Kamu Hizmet Masası & Randevu** (GovTech E-Devlet) | T.C. Akıllı Belediyecilik bandı, Redis 7.2 dağıtık kilit havuzu (`SETNX`), 4 adımlı randevu sihirbazı, başvuru iptali ve slot iadesi. | [servisport.web.app](https://servisport.web.app) | [GitHub](https://github.com/kubrvk/ServisPort) |
| **3DInteractJS** | **PBR 3D Materyal Stüdyosu** (WebGL 2.0 / CAD) | Doğrudan açılan karanlık CAD çalışma tezgahı, Three.js fizik tabanlı render (PBR), 6 geometri, HDR ışık atmosferleri, saf beyaz HUD. | [3dinteract.web.app](https://3dinteract.web.app) | [GitHub](https://github.com/kubrvk/3DInteractJsScript) |

---

## 🛠️ Teknik Yetkinlikler

- **Oyun Geliştirme**: Unreal Engine 5, C++, Blueprint Scripting, Gameplay Framework, AI Controller, Animation Blueprint, Network Replay.
- **Web Teknolojileri**: Modern ES6+ JavaScript, TypeScript, React, React Native, Node.js, HTML5 Canvas, CSS3 Grid/Flexbox.
- **3D & Render Motorları**: Three.js, WebGL 2.0, Blender, PBR Shading, Real-time Lighting, CAD Tools.
- **Bulut & Veritabanı**: Firebase Hosting, Redis Distributed Locks, PostgreSQL, SQLite, AWS S3 simülasyonları.
- **Mimari Disiplin**: Sıfır dış bağımlılık (Zero-Dependency), reaktif yerel durum yönetimi (`localStorage`), iki dilli (`TR / EN`) modüler tasarım.

---

## 📁 Proje Dizin Yapısı

```
portfolio/
├── index.html              # Portfolyo ana sayfası (Hero, Yetkinlikler, Projeler, Galeri)
├── docs/                   # Yüksek çözünürlüklü tanıtım görselleri
│   ├── preview-hero.png    # Hero bölümü ekran görüntüsü
│   └── preview-projects.png # Projeler vitrini ekran görüntüsü
└── README.md               # Portfolyo ve ekosistem dokümantasyonu
```

---

## ⚡ Hızlı Başlangıç (Local Setup)

1. Depoyu klonlayın:
   ```bash
   git clone https://github.com/kubrvk/portfolio.git
   cd portfolio
   ```
2. `index.html` dosyasını tarayıcınızda açın:
   ```bash
   start index.html
   ```
3. Alternatif yerel HTTP sunucusu ile çalıştırmak için:
   ```bash
   npx serve .
   ```

---

## 👤 Geliştirici & İletişim

**Beraat Yetkin**
- **GitHub**: [@kubrvk](https://github.com/kubrvk)
- **LinkedIn / Portfolyo**: [Beraat Yetkin Portfolio](https://github.com/kubrvk/portfolio)
