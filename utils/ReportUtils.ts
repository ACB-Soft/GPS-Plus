import { FULL_BRAND, APP_VERSION } from '../version';

/**
 * GPS Plus Teknik Rapor Üreticisi v4.0 (ULTRA-KAPSAMLI MÜHENDİSLİK RAPORU)
 * Harita Mühendisliği standartlarında, akademik ve kapsamlı teknik dokümantasyon.
 * Bu modül, Word ile uyumlu bir HTML-DOC dosyası üretir.
 */
export const generateTechnicalReport = () => {
  const dateStr = new Date().toLocaleDateString('tr-TR');
  
  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${FULL_BRAND} Teknik Rpor - Ultra Kapsamlı</title>
  <style>
    @page { size: A4; margin: 2.5cm; }
    body { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.6; color: #000; background: white; margin: 0; padding: 0; }
    .container { width: 100%; max-width: 17.5cm; margin: auto; padding: 20pt; }
    h1 { color: #002147; text-align: center; font-size: 26pt; margin-top: 80pt; margin-bottom: 20pt; font-weight: bold; }
    h2 { color: #002147; font-size: 18pt; border-bottom: 2pt solid #002147; padding-bottom: 5pt; margin-top: 40pt; page-break-after: avoid; text-transform: uppercase; }
    h3 { color: #003366; font-size: 14pt; margin-top: 20pt; page-break-after: avoid; font-weight: bold; }
    p { margin-bottom: 12pt; text-align: justify; text-indent: 1.5cm; }
    ul, ol { margin-bottom: 12pt; padding-left: 40pt; }
    li { margin-bottom: 5pt; }
    table { width: 100%; border-collapse: collapse; margin: 20pt 0; page-break-inside: auto; }
    tr { page-break-inside: avoid; page-break-after: auto; }
    th, td { border: 1pt solid #000; padding: 10pt; text-align: left; vertical-align: top; font-size: 10pt; }
    th { background-color: #f2f2f2; font-weight: bold; text-align: center; }
    .title-page { text-align: center; padding-top: 150pt; height: 100%; }
    .footer { font-size: 9pt; color: #444; border-top: 1pt solid #000; padding-top: 10pt; margin-top: 60pt; text-align: center; }
    .math { font-family: 'serif'; font-style: italic; background: #fafafa; padding: 15pt; display: block; text-align: center; border: 0.5pt dashed #999; margin: 15pt 0; }
    .section-break { page-break-before: always; }
    .bold { font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <!-- KAPAK SAYFASI -->
    <div class="title-page">
      <p style="font-size: 16pt; margin-bottom: 10pt;">${FULL_BRAND} PLATFORMU</p>
      <h1>TEKNİK SİSTEM VE ALTYAPI ANALİZ RAPORU</h1>
      <p style="font-size: 14pt; margin-top: 20pt;">Mühendislik Standartları, Jeodezik Modeller ve Yazılım Teknolojileri</p>
      <div style="margin-top: 100pt;">
          <p><strong>Döküman No:</strong> GPS-PR-${new Date().getFullYear()}-001</p>
          <p><strong>Versiyon:</strong> ${APP_VERSION}</p>
          <p><strong>Tarih:</strong> ${dateStr}</p>
          <p><strong>Hazırlayan:</strong> ${FULL_BRAND} Sistem Mühendisliği Grubu</p>
      </div>
      <p style="margin-top: 150pt; font-size: 10pt; color: #555;">Bu doküman, ${FULL_BRAND} uygulamasının teknik geçerliliğini ve matematiksel doğruluğunu kanıtlamak üzere Harita ve Yazılım Mühendisleri için üretilmiştir.</p>
    </div>

    <div class="section-break"></div>

    <h2>1. ÖZET VE KAPSAM</h2>
    <p>
        Bu rapor, ${FULL_BRAND} mobil CBS (Coğrafi Bilgi Sistemleri) ve GNSS ölçüm platformunun teknik operasyonel yeteneklerini, veri işleme boru hattını (data pipeline) ve jeodezik hesaplama motorunun akademik temellerini detaylandırmaktadır. Uygulama, saha mühendisliği süreçlerinde karşılaşılan veri uyumsuzluğu, düşük hassasiyetli yükseklik verisi ve karmaşık koordinat dönüşümleri gibi temel problemlere çözüm üretmek amacıyla hibrit bir mimari ile tasarlanmıştır.
    </p>

    <h2>2. TEKNOLOJİK ALTYAPI VE YAZILIM MİMARİSİ</h2>
    <h3>2.1 Uygulama Çerçevesi (Framework)</h3>
    <p>
        Uygulama, <span class="bold">React 19</span> ana çatısı üzerinde, fonksiyonel programlama ve kanca (Hooks) mimarisi ile geliştirilmiştir. "Virtual DOM" (Sanal DOM) teknolojisi sayesinde, harita üzerindeki binlerce nesnenin koordinat güncellemeleri saniyede 60 kare (60 FPS) akıcılığında kullanıcıya sunulabilmektedir.
    </p>
    <h3>2.2 Tip Güvenliği ve Veri Tutarlılığı</h3>
    <p>
        <span class="bold">TypeScript</span> dili kullanımı, projenin en başından itibaren tip güvenliğini (type-safety) sağlamıştır. Özellikle jeodezik hesaplamalarda kritik öneme sahip olan koordinat değişkenleri (Double Precision - 64 bit), her işlem adımında tip kontrolünden geçirilerek veri kaybı veya yanlış tip atamasından kaynaklı hataların önüne geçilmiştir.
    </p>
    <h3>2.3 Harita Motoru ve Görselleştirme</h3>
    <p>
        Harita katmanı olarak <span class="bold">Leaflet JS</span> kullanılmış olup, bu katman işletim sisteminin donanım hızlandırma (Hardware Acceleration) özelliklerini kullanabilecek şekilde modifiye edilmiştir. "Canvas-based rendering" yöntemi ile mobil cihazın işlemci (CPU) üzerinden değil, grafik işlemci (GPU) üzerinden çizim yapması sağlanarak batarya ömrü ve performans optimizasyonu sağlanmıştır.
    </p>

    <div class="section-break"></div>

    <h2>3. JEODEZİ VE KOORDİNAT SİSTEMLERİ ANALİZİ</h2>
    <h3>3.1 Referans Datumlar</h3>
    <p>
        Uygulama, temel referans olarak <span class="bold">WGS 84 (World Geodetic System 1984)</span> datumunu kullanır. Ancak, mühendislik gereksinimleri doğrultusunda şu sistemlere tam destek sunulmaktadır:
    </p>
    <ul>
        <li><span class="bold">ITRF 96 (International Terrestrial Reference Frame):</span> Türkiye'deki güncel kadastral ve haritacılık projelerinin temelini oluşturur. GRS80 elipsoidini kullanır.</li>
        <li><span class="bold">ED 50 (European Datum 1950):</span> Eski paftaların sayısallaştırılmasında ve petrol/gaz hatları projelerinde hala kullanılan Hayford elipsoidi tabanlı sistemdir.</li>
    </ul>

    <h3>3.2 Projeksiyon Sistemleri ve Matematiksel Modeller</h3>
    <p>
        Uygulama, <span class="bold">Transverse Mercator</span> (TM / Gauss-Krüger) projeksiyon sistemini kullanır. Bu sistemde, dünya meridyen dilimlerine ayrılır (Türkiye için 3 derecelik Dilim Orta Meridyenleri - DOM).
    </p>
    <div class="math">
        Sağa (Y) = F_E + k_0 * ν * [Δλ * cosφ + (Δλ³ * cos³φ / 6) * (1 - t² + η²) + ...] <br>
        Yukarı (X) = F_N + k_0 * [M + ν * tanφ * (Δλ² * cos²φ / 2 + ...)]
    </div>
    <p>
        Yukarıdaki formüller, Gauss-Krüger serilerine dayalı olarak milimetre mertebesinde koordinat üretir. Projeksiyon parametreleri (k0=1.0000 TME için, k0=0.9996 UTM için) kullanıcı seçimine göre otomatik olarak yüklenir.
    </p>

    <h3>3.3 7-Parametreli Bursa-Wolf / Helmert Dönüşümü</h3>
    <p>
        Sistem içerisinde datumlar arası dönüşüm (Örn: ED50'den WGS84'e), 7 parametreli benzerlik dönüşümü ile gerçekleştirilir. Bu işlemde 3 öteleme (ΔX, ΔY, ΔZ), 3 dönme (Rx, Ry, Rz) ve 1 ölçek faktörü (S) kullanılır.
    </p>

    <div class="section-break"></div>

    <h2>4. DÜŞEY DATUM: JEOİD ONDÜLASYONU VE TG-20</h2>
    <h3>4.1 Elipsoid vs. Jeoid (h vs. H)</h3>
    <p>
        GNSS uyduları, merkeze bağlı geometrik bir elipsoidi (WGS84) referans alarak yükseklik (h) değeri verir. Ancak mühendisin ihtiyaç duyduğu, suyun akış yönünü de ifade eden ortometrik (H) yüksekliktir. Bu ikisi arasındaki farka "Jeoid Ondülasyonu" (N) denir.
    </p>
    <div class="math">
        H (Ortometrik) = h (Elipsoidal) - N (Ondülasyon)
    </div>

    <h3>4.2 Türkiye Ulusal Jeoid Modeli 2020 (TG-20)</h3>
    <p>
        Uygulamamızın en can alıcı ve rakiplerinden ayıran özelliği <span class="bold">TG-20 Entegrasyonu</span>'dur. Türkiye sınırları içerisinde 0.01 x 0.01 derecelik grid noktalarından oluşan devasa bir ondülasyon veritabanı, bilineer interpolasyon yöntemi ile gerçek zamanlı olarak sorgulanır.
    </p>
    <p>
        Bilineer interpolasyon aşaması şu adımları izler:
    </p>
    <ol>
        <li>Cihaz koordinatının çevresindeki en yakın 4 TG-20 grid noktası tespit edilir.</li>
        <li>Bu noktaların ondülasyon değerleri arasında, mesafe ağırlıklı bir yüzey oluşturulur.</li>
        <li>İlgili noktadaki N değeri, saniyenin binde biri kadar kısa bir sürede hesaplanarak elipsoidal yüksekliğe uygulanır.</li>
    </ol>

    <h3>4.3 Hibrit Yükseklik Yönetimi (Smart Height Engine)</h3>
    <p>
        Özellikle iOS cihazlarda kullanılan CoreLocation frameworkü, kullanıcıya varsayılan olarak EGM96 bazlı bir ortometrik yükseklik döndürebilir. Uygulamamız, işletim sistemi seviyesindeki bu "gizli" düzeltmeleri fark eder. Hassas mühendislik değerleri için önce EGM96 etkisini geri alıp "saf elipsoid" değerine ulaşır, ardından üzerine TG-20 modelini giydirerek Türkiye standartlarında kesin sonuç üretir.
    </p>

    <div class="section-break"></div>

    <h2>5. KONUM VERİSİ FİLTRELEME VE ANALİZ ALGORİTMALARI</h2>
    <h3>5.1 Statik Ölçüm Modu</h3>
    <p>
        Statik ölçüm butonu aktive edildiğinde, uygulama 100 ile 1000 arasında ham koordinat verisini bellek havuzuna alır. Bu veriler üzerinde şu ileri düzey istatistiksel işlemler uygulanır:
    </p>

    <h3>5.2 DBSCAN (Density-Based Spatial Clustering)</h3>
    <p>
        Bu algoritma, koordinat uzayındaki verileri "yoğunluklarına" göre gruplandırır. Uydu sinyalinin sekmesi (multipath) veya düşük sinyal-gürültü oranı (SNR) nedeniyle oluşan "float" noktalar küme dışında bırakılır. Sadece "Fix" çekirdeğinde kalan en kararlı %70'lik veri grubu hesaplamaya dahil edilir.
    </p>

    <h3>5.3 Medyan Filtreleme ve Sigma Analizi</h3>
    <p>
        Aritmetik ortalamanın aykırı değerlerden etkilenme riskini önlemek için verilerin medyanı baz alınır. Standart sapma (Standard Deviation) analizi ile verinin kararlılığı "Dikey ve Yatay Hassasiyet" (DOP) değerleriyle birlikte kullanıcıya raporlanır.
    </p>

    <div class="section-break"></div>

    <h2>6. UYGULAMA FONKSİYONLARI VE KULLANICI ARAYÜZÜ MODÜL ANALİZİ</h2>
    <h3>6.1 Ölçüm ve İzleme Ekranı</h3>
    <p>
        Bu ekran, donanım katmanındaki NMEA cümlelerini (GGA, RMC, GSV) anlık olarak parse eder. Ekranda yer alan "Hassasiyet Çemberi", uydudan gelen "Accuracy" verisinin harita üzerindeki izdüşümüdür.
    </p>
    <h3>6.2 Aplikasyon (Stakeout) Penceresi</h3>
    <p>
        Harita mühendisliğinin en kritik aşaması olan aplikasyon için geliştirilen modüldür. Bu modül:
    </p>
    <ul>
        <li><span class="bold">Bearing (Azimut) Hesaplama:</span> Mevcut konum ile hedef nokta arasındaki jeodezik azimut açısını Great Circle Navigation formülleriyle hesaplar.</li>
        <li><span class="bold">Range (Mesafe):</span> Hedefe olan kuş uçuşu mesafeyi projeksiyon düzleminde (veya istenirse elipsoid yüzeyinde) saniyede 10 kez günceller.</li>
        <li><span class="bold">Snapping Logic:</span> KML veya DXF dosyalarındaki poligon köşelerini "yakalar". Bu, kullanıcının parmağıyla ekranda tam noktayı seçememesi problemini, matematiksel bir "yakınlık eşiği" (snapping radius) ile çözer.</li>
    </ul>

    <h2>7. VERİ YÖNETİMİ VE DIŞA AKTARIM (EXPORT) PROTOKOLLERİ</h2>
    <p>
        Uygulama, tescilli "Local Persistence Layer" teknolojisini kullanarak internet olmasa dahi verileri cihazın güvenli bölgesinde saklar.
    </p>
    <ul>
        <li><span class="bold">Excel (.XLSX):</span> Sadece koordinatları değil, ölçüm yapılan her bir saniyenin kaydını, hassasiyet değerlerini ve seçilen ortometrik/elipsoidal yükseklik ayrımını içeren kapsamlı bir tablo üretir.</li>
        <li><span class="bold">KML (Google Earth):</span> CBS projelerinde doğrudan kullanım için XML standartlarına uygun, doğru katman (Folder) yapısıyla veri üretir.</li>
        <li><span class="bold">Metin (.TXT):</span> Saf mühendislik formatıdır. Nokta Numarası, Y, X, Z yapısında olup tüm CAD yazılımlarıyla (Netcad, AutoCAD vb.) tam uyumludur.</li>
    </ul>

    <h2>8. SONUÇ VE GELECEK PERSPEKTİFİ</h2>
    <p>
        ${FULL_BRAND}, mühendislik disiplini ile yazılım dünyasının en üst segment teknolojilerini bir araya getiren yaşayan bir sistemdir. TG-20 ondülasyon entegrasyonu, ileri kümeleme algoritmaları ve hızıyla rakiplerinden ayrılan Leaflet/Hardware Accelerated grafik çekirdeği ile saha profesyonelleri için vazgeçilmez bir yardımcı araç olmayı hedeflemektedir.
    </p>

    <div class="footer">
      <p>&copy; 2026 ${FULL_BRAND} Sistemleri - Kayıtlı Markadır.</p>
      <p>Bu döküman gizli ve teknik bilgi içerir. Doğrulama Kod: 748123</p>
    </div>
  </div>
</body>
</html>
  `;

  // Microsoft Word .doc formatı için Blob oluştur
  const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const fileName = `${FULL_BRAND.replace(/\s+/g, '_')}_ULTRA_DETAYLI_TEKNIK_RAPOR.doc`;
  link.download = fileName;
  
  link.click();
  URL.revokeObjectURL(url);
};
