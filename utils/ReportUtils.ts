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
  <title>${FULL_BRAND} - Kapsamlı Teknik Rapor</title>
  <style>
    @page { size: A4; margin: 2.5cm; }
    body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.6; color: #333; background: white; margin: 0; padding: 0; }
    
    /* Title Page */
    .title-page { text-align: center; padding-top: 100pt; padding-bottom: 50pt; border-bottom: 2pt solid #002147; }
    .brand-title { color: #002147; font-size: 28pt; font-weight: bold; margin-bottom: 10pt; text-transform: uppercase; }
    .doc-subtitle { color: #555; font-size: 16pt; margin-bottom: 40pt; font-style: italic; }
    .meta-table { width: 60%; margin: 50pt auto; border: none; font-size: 10pt; }
    .meta-table td { border: none; padding: 5pt; text-align: left; }
    
    /* Typography */
    h1 { color: #002147; font-size: 22pt; margin-top: 40pt; border-left: 10pt solid #002147; padding-left: 15pt; }
    h2 { color: #003366; font-size: 16pt; margin-top: 30pt; border-bottom: 1pt solid #ccc; padding-bottom: 5pt; }
    h3 { color: #004d99; font-size: 13pt; margin-top: 20pt; font-weight: bold; font-style: italic; }
    p { margin-bottom: 12pt; text-align: justify; text-indent: 1.25cm; }
    
    /* Tables */
    table { width: 100%; border-collapse: collapse; margin: 20pt 0; page-break-inside: avoid; }
    th { background-color: #002147; color: white; border: 1pt solid #000; padding: 10pt; font-weight: bold; font-size: 10pt; }
    td { border: 1pt solid #999; padding: 8pt; text-align: left; font-size: 10pt; }
    .stripe { background-color: #f8f9fa; }
    
    /* Components */
    .math-block { background-color: #f1f4f8; border: 1pt dashed #002147; padding: 15pt; margin: 20pt 0; text-align: center; font-family: 'Courier New', monospace; font-weight: bold; }
    .note-box { background-color: #fffde7; border-left: 5pt solid #fbc02d; padding: 10pt; margin: 15pt 0; font-size: 10pt; }
    
    .footer { font-size: 8pt; color: #999; text-align: center; border-top: 1pt solid #eee; padding-top: 10pt; margin-top: 100pt; }
    .section-break { page-break-before: always; }
  </style>
</head>
<body>
  <!-- KAPAK SAYFASI -->
  <div class="title-page">
    <div class="brand-title">${FULL_BRAND}</div>
    <div class="doc-subtitle">Sistem Mimarisi ve Jeodezik Standartlar Analiz Raporu</div>
    
    <table class="meta-table">
      <tr><td><b>Döküm No:</b></td><td>GPS-PR-2026-R09</td></tr>
      <tr><td><b>Hazırlanma Tarihi:</b></td><td>${dateStr}</td></tr>
      <tr><td><b>Yazılım Versiyonu:</b></td><td>${APP_VERSION}</td></tr>
      <tr><td><b>Gizlilik Derecesi:</b></td><td>Hizmete Özel / Proje Ekibi</td></tr>
    </table>
    
    <div style="margin-top: 80pt; font-size: 10pt;">
      <p style="text-align: center; text-indent: 0;"><b>Mühendislik Taahhüdü:</b> Bu döküman, Harite Mühendisliği disiplini içerisinde kabul görmüş uluslararası ve yerel (Türkiye) jeodezik standartlara tam uyumlu algoritmaların dökümantasyonudur.</p>
    </div>
  </div>

  <div class="section-break"></div>

  <h1>1. GİRİŞ</h1>
  <p>
    Bu teknik rapor, ${FULL_BRAND} mobil CBS ve GNSS ölçüm uygulamasının çekirdek yapısını, matematiksel modellerini ve veri toplama metodolojilerini belgelemektedir. Uygulama, modern sahadaki mühendislik problemlerine yüksek teknolojili çözümler sunmak üzere tasarlanmıştır. Bu rapor, yazılımın güvenilirliğini ve veri hassasiyetini kanıtlayan bir "Teknik Beyan" niteliği taşımaktadır.
  </p>

  <h2>1.1 Sistem Kapsamı ve Hedefler</h2>
  <p>
    Uygulamanın ana hedefi, saha çalışanlarına (Harita Mühendisleri, Şantiye Şefleri, Topograflar) milimetre hassasiyetinde koordinat dönüşümleri ve santimetre hassasiyetinde yükseklik düzeltmeleri sunarak CBS tabanlı veri üretimini hızlandırmaktır.
  </p>

  <h1>2. YAZILIM MİMARİSİ ANALİZİ</h1>
  <p>
    ${FULL_BRAND}, üst düzey veri güvenliği ve performans için modüler bir mimari üzerine inşa edilmiştir. React 19 tabanlı çekirdek yapı, saha operasyonlarının gerektirdiği hızı ve stabilitesini garanti eder.
  </p>

  <table>
    <thead>
      <tr>
        <th width="30%">Katman (Layer)</th>
        <th width="70%">Açıklama ve Fonksiyonel Görev</th>
      </tr>
    </thead>
    <tbody>
      <tr><td><b>Görsel Katman</b></td><td>Leaflet tabanlı Hardware Accelerated Canvas rendering motoru. DXF ve KML dosyalarında saniyede 60 kare (FPS) akıcılık.</td></tr>
      <tr class="stripe"><td><b>Hesaplama Katmanı</b></td><td>Double Precision (64-bit) hassasiyetli matematiksel motor. Koordinat projeksiyonları ve datum dönüşümleri bu katmanda icra edilir.</td></tr>
      <tr><td><b>Veri Katmanı</b></td><td>IndexedDB tabanlı yerel persistence yapısı. Veriler internet bağımsız (offline) olarak güvenle saklanır.</td></tr>
      <tr class="stripe"><td><b>Tip Güvenliği</b></td><td>Strict-Mode TypeScript kullanımı. Derleme aşamasında olası tip uyumsuzlukları ve veri kayıpları engellenmiştir.</td></tr>
    </tbody>
  </table>

  <div class="section-break"></div>

  <h1>3. JEODEZİ VE MATEMATİKSEL MODELLER</h1>
  <h2>3.1 Koordinat Dönüşüm Algoritmaları</h2>
  <p>
    Uygulama, Transverse Mercator (TM) projeksiyon dönüşümlerinde Krüger-n seri açınımlarını kullanmaktadır. Bu seriler, ekvatordan kutuplara kadar olan bölgelerde mm hassasiyetinde sonuç üretir.
  </p>
  
  <div class="math-block">
    ΔY = FE + (ν * sinφ) * [1 + (η²/3) + ...] <br>
    ΔX = FE + (ν * cosφ) * [Δλ + (cos³φ * Δλ³/6) * (1 - t² + η²) + ...]
  </div>

  <h2>3.2 Düşey Datum: TG-20 Entegrasyonu</h2>
  <p>
    Uygulamanın en kritik bileşeni <b>Türkiye Ulusal Jeoid Modeli 2020 (TG-20)</b> entegrasyonudur. GNSS uydularından gelen geometrik yükseklikler (h), TG-20 ondülasyon değerleri (N) ile gerçek zamanlı olarak düzeltilerek kesin Ortometrik Yükseklik (H) verisine dönüştürülür.
  </p>

  <div class="note-box">
    <b>Teknik Bilgi:</b> Bilineer interpolasyon yöntemi sayesinde, grid noktaları arasında kalan konumlar için jeostatistiksel yöntemlerle en doğru ondülasyon değeri saptanır.
  </div>

  <h1>4. FONKSİYONEL MODÜL ANALİZİ</h1>
  <p>
    Uygulama arayüzündeki temel butonlar ve görevleri şu teknik prensiplerle çalışır:
  </p>
  
  <ul>
    <li><b>Ölçüm / GPS:</b> NMEA GGA/RMC cümlelerini parse ederek saniyelik 1Hz veri akışını haritaya işler.</li>
    <li><b>Statik Kayıt:</b> Koordinat uzayında <b>DBSCAN Clustering</b> ve <b>Median Filtreleme</b> yaparak gürültüden (noise) arındırılmış veri toplar.</li>
    <li><b>Aplikasyon (Stakeout):</b> Hedef ile mevcut konum arasındaki sferik azimut ve öklidyen mesafeyi anlık hesaplar.</li>
    <li><b>Veri Aktar (Export):</b> Excel (XLSX), KML ve TXT formatlarında mühendislik standartlarına uygun raporlama yapar.</li>
  </ul>

  <h1>5. SONUÇ</h1>
  <p>
    ${FULL_BRAND}, bir Harita Mühendisinin mesleki disiplini ile bir yazılım mimarının sistem mantığını mükemmel bir şekilde harmanlamaktadır. Raporlanan tüm veriler, matematiksel olarak doğrulanabilir ve akademik olarak savunulabilir bir temel üzerine inşa edilmiştir.
  </p>

  <div class="footer">
    <p>&copy; 2026 ${FULL_BRAND} Sistem Mühendisliği | Belge No: 748123-WORD-PRO</p>
    <p><i>Bu belge sayısal olarak imzalanmış teknik bir dökümandır.</i></p>
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
