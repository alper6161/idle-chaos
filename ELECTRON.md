# Idle Chaos - Electron Desktop App

Bu proje artık hem web tarayıcısında hem de masaüstü uygulaması olarak çalışabilmektedir.

## Geliştirme

### Web Tarayıcısında Çalıştırma
```bash
npm run dev
```
Uygulama http://localhost:5173 adresinde açılacaktır.

### Masaüstü Uygulaması Olarak Çalıştırma
```bash
npm run electron-dev
```
Bu komut hem Vite dev server'ını hem de Electron uygulamasını başlatacaktır.

### Sadece Electron Uygulamasını Çalıştırma (Build Edilmiş)
```bash
npm run build
npm run electron
```

## Üretim Buildleri

### Tüm Platformlar için Build
```bash
npm run dist
```

### Sadece Mevcut Platform için Build
```bash
npm run electron-pack
```

Bu komutlar `release/` klasöründe platform-spesifik yükleyiciler oluşturacaktır:
- **Windows**: `.exe` installer
- **macOS**: `.dmg` disk image
- **Linux**: `.AppImage` executable

## Klasör Yapısı

```
idle-chaos/
├── electron/          # Electron main process dosyaları
│   ├── main.js        # Ana Electron process
│   ├── preload.js     # Güvenli API bridge
│   └── package.json   # CommonJS konfigürasyonu
├── src/               # React uygulaması
├── dist/              # Build edilmiş web uygulaması
└── release/           # Electron build çıktıları
```

## Özellikler

- ✅ Web ve masaüstü uyumluluğu
- ✅ Hot reload desteği (geliştirme modunda)
- ✅ Güvenli Electron entegrasyonu (context isolation)
- ✅ Cross-platform build desteği
- ✅ Auto-updater hazır (gelecekte eklenebilir)

## Troubleshooting

### Electron açılmıyor
- `npm install` komutu ile bağımlılıkların yüklendiğinden emin olun
- Port 5173'ün kullanılabilir olduğunu kontrol edin

### Build hataları
- Node.js versiyonunun 16+ olduğunu kontrol edin
- `npm run build` komutunun başarılı olduğunu doğrulayın

### Platform-spesifik build sorunları
- macOS: Xcode command line tools gerekli
- Windows: Visual Studio Build Tools gerekli
- Linux: Genellikle ek gereksinim yok 