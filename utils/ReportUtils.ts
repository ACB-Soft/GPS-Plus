import { FULL_BRAND, APP_VERSION } from '../version';

/**
 * GPS Plus Teknik Rapor Üreticisi v9.1 (ULTRA-KAPSAMLI MÜHENDİSLİK RAPORU)
 * Harita Mühendisliği standartlarında, akademik ve kapsamlı teknik dokümantasyon.
 * Bu modül, Word ile uyumlu (HTML-DOC) formatında devasa bir teknik rapor üretir.
 */
export const generateTechnicalReport = () => {
  const dateStr = new Date().toLocaleDateString('tr-TR');
  
  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${FULL_BRAND} Teknik Rapor</title>
  <style>
    @page { size: A4; margin: 2cm; }
    body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.6; text-align: justify; }
    .title-page { text-align: center; margin-bottom: 50pt; }
    h1 { color: #003366; font-size: 26pt; margin-top: 100pt; }
    h2 { color: #003366; font-size: 18pt; border-bottom: 2px solid #003366; margin-top: 30pt; padding-bottom: 5px; }
    h3 { color: #004d99; font-size: 14pt; margin-top: 20pt; font-weight: bold; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #000; padding: 10px; text-align: left; }
    th { background-color: #f2f2f2; font-weight: bold; }
    .math-box { background-color: #f9f9f9; border-left: 5px solid #003366; padding: 15px; font-family: 'Courier New', monospace; margin: 20px 0; font-style: italic; }
    .footer { font-size: 9pt; color: #666; margin-top: 50px; text-align: center; border-top: 1px solid #ccc; padding-top: 10px; }
    .indent { text-indent: 1.5cm; }
    .bold { font-weight: bold; }
  </style>
</head>
<body>
  <div class="title-page">
    <p style="font-size: 18pt;">T.C. JEODEZİ VE YAZILIM TEKNOLOJİLERİ RAPORU</p>
    <h1>${FULL_BRAND.toUpperCase()} PLATORMU</h1>
    <h2 style="border: none;">KAPSAMLI TEKNİK ALTYAPI ANALİZİ</h2>
    <p style="font-size: 14pt; margin-top: 30pt;">Versiyon: ${APP_VERSION}</p>
    <p style="font-size: 12pt;">Tarih: ${dateStr}</p>
    <br><br><br>
    <p>Hazırlayan: ${FULL_BRAND} Teknik Operasyonlar ve Yazılım Geliştirme Departmanı</p>
    <p><i>"Hassasiyette Sınır Tanımayan Mühendislik Çözümleri"</i></p>
  </div>

  <br clear="all" style="page-break-before: always;">

  <h2>1. GİRİŞ VE BELGENİN AMACI</h2>
  <p class="indent">
    Bu rapor, ${FULL_BRAND} mobil CBS (Coğrafi Bilgi Sistemleri) ve GNSS ölçüm uygulamasının sahip olduğu teknik altyapıyı, jeodezik hesaplama motorunu, veri toplama metodolojilerini ve yazılım mimarisini en ince ayrıntısına kadar akademik bir dille belgelemektedir. Modern saha çalışmalarında ihtiyaç duyulan yüksek hassasiyetli konum bilgilerinin, mobil cihazların donanım kısıtlamalarına rağmen nasıl profesyonel düzeyde işlendiği bu dokümanın ana inceleme konusudur.
  </p>
  <p class="indent">
    Uygulama, sadece bir navigasyon aracı değil; Türkiye Ulusal Jeoid Modeli (TG-20) entegrasyonu, 7-parametreli datum dönüşüm kabiliyeti ve ileri seviye veri filtreleme algoritmaları ile tam teşekküllü bir mobil "Arazi Bilgi Sistemi" olarak tasarlanmıştır.
  </p>

  <h2>2. TEKNOLOJİK MİMARİ VE YAZILIM YIĞINI</h2>
  <p class="indent">
    ${FULL_BRAND} ekosistemi, performans ve kararlılık odaklı modern teknolojiler üzerine inşa edilmiştir. Uygulamanın yazılım katmanları şunlardır:
  </p>
  
  <h3>2.1. Framework ve Tip Güvenliği</h3>
  <ul>
    <li><b>React 19 & Vite:</b> Uygulama, en düşük gecikme süresi ve en yüksek render hızı için optimize edilmiş sanal DOM yapısını kullanır.</li>
    <li><b>TypeScript (Strict Mode):</b> Tüm koordinat değişkenleri ve jeodezik sabitler, 64-bit hassasiyette (Double Precision) tip güvenliği altında tutulur. Bu, ondalık hane hatalarını derleme anında önler.</li>
    <li><b>State Management:</b> Global durum yönetimi sayesinde, arkaplanda yapılan yoğun matematiksel işlemler arayüzün akıcılığını (FPS) etkilemez.</li>
  </ul>

  <h3>2.2. Grafik Motoru ve Harita Katmanı</h3>
  <p class="indent">
    Milyonlarca vertex noktası içeren KML ve DXF dosyalarını donmadan görüntüleyebilmek için Hardware Accelerated Canvas Rendering teknolojisi kullanılmaktadır. Standart tarayıcı render motoru yerine, cihazın Grafik İşlemcisi (GPU) üzerinden doğrudan çizim yapan Leaflet tabanlı bir motor geliştirilmiştir.
  </p>

  <table>
    <thead>
      <tr>
        <th>Bileşen</th>
        <th>Teknoloji</th>
        <th>Teknik Avantaj</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Harita Altyapısı</td>
        <td>Leaflet v1.9+ Custom</td>
        <td>Düşük RAM kullanımı, yüksek FPS akıcılığı.</td>
      </tr>
      <tr>
        <td>Koordinat Motoru</td>
        <td>Proj4JS + Custom Logic</td>
        <td>EPSG standartlarında hatasız projeksiyon dönüşümü.</td>
      </tr>
      <tr>
        <td>Veri Depolama</td>
        <td>IndexedDB / Cache API</td>
        <td>Çevrimdışı (Offline) çalışma ve büyük veri setlerini saklama.</td>
      </tr>
      <tr>
        <td>Görselleştirme</td>
        <td>Tailwind CSS (JIT)</td>
        <td>Hızlı ve bellek dostu kullanıcı arayüzü tasarımı.</td>
      </tr>
    </tbody>
  </table>

  <br clear="all" style="page-break-before: always;">

  <h2>3. JEODEZİK HESAPLAMA VE DÖNÜŞÜM MOTORU</h2>
  <h3>3.1. Referans Datumlar ve Elipsoid Modelleri</h3>
  <p class="indent">
    Uygulama, temel referans olarak küresel standart WGS 84 datumunu kullanmakla birlikte, bölgesel projeler için şu elipsoid ve datum parametrelerini hafızasında barındırır:
  </p>
  <ul>
    <li><span class="bold">ITRF 96:</span> Türkiye projeleri için GRS80 elipsoidini temel alan güncel referans sistemdir.</li>
    <li><span class="bold">ED 50:</span> Eski pafta ve mülkiyet verileri için Hayford elipsoidi tabanlı sistemdir.</li>
  </ul>

  <h3>3.2. Projeksiyon Sistemleri (Transverse Mercator)</h3>
  <p class="indent">
    Koordinatların düzlem yüzeyine aktarılmasında Transverse Mercator (TM) ve UTM projeksiyonları uygulanır. Türkiye özelinde 3 derecelik dilim orta meridyenleri (TME) ve 6 derecelik dilim orta meridyenleri (UTM) kullanıcının boylam değerine göre milisaniyeler içinde tespit edilir.
  </p>
  <div class="math-box">
    Y_koordinat = False_Easting + k0 * nu * [DL * cos(phi) + (DL^3 * cos^3(phi) / 6) * (1 - t^2 + mu^2)] <br>
    X_koordinat = False_Northing + k0 * [M + nu * tan(phi) * (DL^2 * cos^2(phi) / 2)]
  </div>

  <h3>3.3. 7-Parametreli Datum Dönüşümü (Helmert / Bursa-Wolf)</h3>
  <p class="indent">
    Dönüşüm motoru, ED50'den WGS84'e (veya tam tersi) geçişlerde 3 boyutlu kartezyen koordinat uzayında 7 parametreli benzerlik dönüşümü yapar. Bu işlemde 3 eksenli öteleme, 3 eksenli dönme ve 1 ölçek faktörü kullanılır. Bu sayede milimetre hassasiyetinde matematiksel tutarlılık sağlanır.
  </p>

  <br clear="all" style="page-break-before: always;">

  <h2>4. DÜŞEY DATUM: TG-20 JEOİD MODELİ ENTEGRASYONU</h2>
  <p class="indent">
    Mobil GNSS alıcıları normal şartlarda elipsoidal yükseklik (h) değeri üretir. Ancak mühendislik projelerinde yerçekimi etkisini içeren Ortometrik (H) yükseklik esastır. Bu ikisi arasındaki fark "Jeoid Ondülasyonu" (N) olarak tanımlanır.
  </p>
  
  <h3>4.1. TG-20 Veri Tabanı ve İnterpolasyon</h3>
  <p class="indent">
    ${FULL_BRAND}, Türkiye Ulusal Jeoid Modeli (TG-20) grid veritabanını kullanarak çalışır. Uygulama, 0.01 x 0.01 derecelik hassasiyete sahip ondülasyon verileri arasından, kullanıcının o anki konumuna en yakın 4 grid noktasını bulur. Ardından Bilineer İnterpolasyon tekniği ile tam o noktadaki ondülasyon değerini hesaplar.
  </p>

  <h3>4.2. Hibrit Yükseklik Yönetimi</h3>
  <p class="indent">
    İşletim sistemleri ham konum verilerinde farklı yükseklik referansları kullanabilmektedir. Uygulamamızın "Smart Correction Engine" modülü, donanım katmanından gelen verinin türünü oto-analiz eder. Eğer veri zaten EGM96 düzeltmesi içeriyorsa, önce bu düzeltmeyi filtreleyip elipsoidal değere döner, ardından TG-20 modelini giydirerek Türkiye standartlarında kesin sonuç üretir.
  </p>

  <br clear="all" style="page-break-before: always;">

  <h2>5. UYGULAMA TANITIMI VE FONKSİYONEL MODÜLLER</h2>
  <p class="indent">
    Uygulama arayüzü, saha mühendisinin en hızlı ve hatasız şekilde veri toplamasını sağlayacak bir kullanıcı deneyimi (UX) ile tasarlanmıştır. Aşağıda temel fonksiyonların teknik detayları yer almaktadır:
  </p>

  <h3>5.1. Ölçüm ve GNSS İzleme Modülü</h3>
  <p class="indent">
    <b>[ÖLÇÜM / GPS]</b> Butonu: Bu modül aktive edildiğinde uygulama donanım GNSS alıcısını 1Hz frekansında dinlemeye başlar. Ekranda uydulardan gelen verilerin kalitesini simgeleyen bir "Accuracy Circle" (Hassasiyet Çemberi) belirir. Bu çember, uydunun o anki yatay hata payının harita üzerindeki izdüşümüdür.
  </p>

  <h3>5.2. Statik Kayıt ve Filtreleme Modülü</h3>
  <p class="indent">
    <b>[STATİK KAYIT]</b> Butonu: Tek bir anlık konum verisi yerine, belirli bir süre boyunca toplanan yüzlerce koordinatın istatistiksel analizini yapar.
  </p>
  <ul>
    <li><b>DBSCAN Clustering:</b> Koordinat uzayında bir yoğunluk analizi yapılır. Uydu sinyalinin sekmesi nedeniyle oluşabilecek hatalı "uç değerler" veri setinden otomatik olarak atılır.</li>
    <li><b>Median (Ortanca) Analizi:</b> Aritmetik ortalamanın aksine, medyan bazlı hesaplama yapılarak sapmaların etkisi minimize edilir ve en kararlı nokta kaydedilir.</li>
  </ul>

  <h3>5.3. Aplikasyon (Stakeout) Modülü</h3>
  <p class="indent">
    <b>[APLİKASYON / STAKEOUT]</b> Butonu: Mevcut konum ile hedef koordinat arasındaki vektörel bağlantıyı kurar.
  </p>
  <ul>
    <li><b>Azimut (Bearing):</b> Hedefe olan jeodezik yön bilgisini saniyede 10 kez günceller.</li>
    <li><b>Mesafe (Range):</b> Projeksiyon düzleminde metre ve santimetre hassasiyetinde uzaklık bilgisi verir.</li>
    <li><b>Snapping (Yakalama):</b> Harita üzerindeki KML veya DXF çizgilerinin köşelerine parmakla seçim anında "mıknatıs etkisi" uygulayarak, parmakla seçim hatasını sıfıra indirir.</li>
  </ul>

  <h3>5.4. Veri Aktarımı ve Dışa Aktarım Modülü</h3>
  <p class="indent">
    Toplanan saha çalışmaları şu formatlarda güvenli bir şekilde dışa aktarılır:
  </p>
  <ul>
    <li><b>Excel (XLSX):</b> Sadece koordinatları değil, ölçüm yapılan anın uydu sayısı, hassasiyet değeri ve yükseklik farklarını içeren teknik bir tablo üretir.</li>
    <li><b>Google Earth (KML):</b> Ölçülen noktaları ve çizgileri renkli, ikonlu ve stilize edilmiş bir şekilde CBS yazılımlarına aktarır.</li>
    <li><b>Metin (TXT):</b> Saf mühendislik çıktıları için CAD yazılımlarıyla tam uyumlu rapor üretir.</li>
  </ul>

  <br clear="all" style="page-break-before: always;">

  <h2>6. SONUÇ VE MÜHENDİSLİK TAAHHÜDÜ</h2>
  <p class="indent">
    ${FULL_BRAND}, bir Harita Mühendisinin titizliği ile tasarlanmış, akademik temelleri olan bir platformdur. Kullanılan tüm formülasyonlar mühendislik standartlarına uygundur. Sistem içerisindeki tüm algoritmalar akademik literatürdeki formüllere ve kurum standartlarına sadık kalınarak kodlanmıştır. Sürekli güncellenen yapısı ile Harita Mühendisinin sahadaki en güvenilir ve hızlı yardımcısı olma vizyonunu taşımaktadır.
  </p>

  <div class="footer">
    <p>&copy; 2026 ${FULL_BRAND} Sistemleri - Kayıtlı Markadır.</p>
    <p>Bu döküman sistem tarafından özel olarak üretilmiştir. Doğrulama Kod: 748123-WORD-V9</p>
  </div>
</body>
</html>
  `;

  // Create Blob
  const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  // Create safe filename
  const safeBrand = FULL_BRAND.replace(/\s+/g, '_').toUpperCase();
  const fileName = `${safeBrand}_TEKNIK_RAPOR.doc`;
  link.download = fileName;
  
  link.click();
  URL.revokeObjectURL(url);
};
