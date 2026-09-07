# Android Release Pipeline

> Bu klasör AI Studio dışa aktarımında yoktur. Lokal/masaüstü kopyasında
> `npx cap add android` ile üretilir. Adımlar:

## 1. Platform ekleme
```bash
npm run build && npx cap add android
npx cap sync android
```

## 2. Sürüm stratejisi
- `versionName`: semver (`1.0.0`)
- `versionCode`: `major*10000 + minor*100 + patch` (örn. 1.0.0 → 10000)
  - `android/app/build.gradle` içinde elle güncellenir

## 3. Keystore üretimi (bir kez, ASLA repo'ya eklenmez)
```bash
keytool -genkey -v -keystore iprint-release.keystore \
  -alias iprint -keyalg RSA -keysize 2048 -validity 10000
```
`android/key.properties` oluşturun (.gitignore'a ekleyin):
```
storeFile=../../iprint-release.keystore
storePassword=***
keyAlias=iprint
keyPassword=***
```

## 4. İmzalı AAB
`android/app/build.gradle` sonuna:
```gradle
def keystoreProperties = new Properties()
keystoreProperties.load(new FileInputStream(rootProject.file("key.properties")))
android {
    signingConfigs {
        release {
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
        }
    }
    buildTypes { release { signingConfig signingConfigs.release } }
}
```
Derleme: `cd android && ./gradlew bundleRelease` → `app/build/outputs/bundle/release/app-release.aab`

## 5. BLE izinleri (Android 12+)
AndroidManifest'te bulunmalı:
```xml
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" android:usesPermissionFlags="neverForLocation" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
<uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" android:maxSdkVersion="30" />
```

## 6. Play Store kontrol listesi
- [ ] Gizlilik politikası URL'si (BLE + lokal veri kullanımı açıklaması)
- [ ] Data safety formu: "Bluetooth cihaz bilgisi — cihazda işlenir, sunucuya gitmez"
- [ ] İçerik derecelendirme: Everyone
- [ ] Ekran görüntüleri (telefon + tablet)
