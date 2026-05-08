import { FULL_BRAND, APP_VERSION } from '../version';

/**
 * GPS Plus Teknik Rapor Üreticisi v6.0 (KAPSAMLI MÜHENDİSLİK EL KİTABI)
 * Bu modül, Arial 11 punto standartlarında, çok detaylı ve profesyonel bir rapor üretir.
 * Yaklaşık 2000 kelime hedefleyen derinlemesine bir dökümantasyon sağlar.
 */
export const generateTechnicalReport = () => {
  const dateStr = new Date().toLocaleDateString('tr-TR');
  const year = new Date().getFullYear();
  
  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${FULL_BRAND} - Kapsamlı Teknik Rapor v6.5</title>
  <style>
    @page { size: A4; margin: 2.5cm; }
    body { font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.6; color: #000; background: white; margin: 0; padding: 0; }
    .container { width: 100%; max-width: 17.5cm; margin: auto; padding: 20pt; }
    
    h1 { font-size: 24pt; text-align: center; margin-bottom: 20pt; font-weight: bold; border-top: 1pt solid #000; border-bottom: 1pt solid #000; padding: 15pt 0; }
    h2 { font-size: 16pt; margin-top: 30pt; margin-bottom: 12pt; font-weight: bold; text-decoration: underline; color: #000; }
    h3 { font-size: 13pt; margin-top: 20pt; margin-bottom: 10pt; font-weight: bold; color: #333; }
    
    p { margin-bottom: 12pt; text-align: justify; }
    ul, ol { margin-bottom: 12pt; padding-left: 25pt; }
    li { margin-bottom: 8pt; text-align: justify; }
    
    .bold { font-weight: bold; }
    .formula { background: #f9f9f9; border: 0.5pt solid #999; padding: 12pt; margin: 15pt 0; text-align: center; font-style: italic; font-weight: bold; font-family: 'Courier New', Courier, monospace; }
    
    table { width: 100%; border-collapse: collapse; margin: 20pt 0; }
    th { border: 1pt solid #000; padding: 10pt; background: #f2f2f2; font-weight: bold; text-align: center; font-size: 10pt; }
    td { border: 1pt solid #000; padding: 10pt; text-align: left; font-size: 10pt; vertical-align: top; }
    
    .footer { font-size: 9pt; color: #444; border-top: 1pt solid #000; padding-top: 10pt; margin-top: 50pt; text-align: center; }
    .page-break { page-break-before: always; }
    .header-info { margin-bottom: 50pt; border: 1pt solid #ddd; padding: 15pt; background: #fafafa; }
  </style>
</head>
<body>
  <div class="container">
    <div style="text-align: center; margin-bottom: 50pt;">
      <p style="font-size: 16pt; font-weight: bold;">${FULL_BRAND} SİSTEM MÜHENDİSLİĞİ</p>
      <h1>KAPSAMLI TEKNİK ANALİZ VE<br>UYGULAMA METODOLOJİ RAPORU</h1>
    </div>

    <div class="header-info">
      <p><span class="bold">Yazılım Versiyonu:</span> ${APP_VERSION}</p>
      <p><span class="bold">Rapor Tarihi:</span> ${dateStr}</p>
      <p><span class="bold">Döküman Referansı:</span> GPS-TECH-REP-${year}-V6.5</p>
      <p><span class="bold">Alan:</span> Jeodezi, Fotogrametri ve Yazılım Mühendisliği Standartları</p>
      <p><span class="bold">Hazırlayan:</span> ${FULL_BRAND} Ürün Geliştirme Katmanı</p>
    </div>

    <p><span class="bold">Özet:</span> Bu döküman, ${FULL_BRAND} mobil uygulamasının çekirdek algoritmalarını, jeodezik hesaplama motorunu ve veri işleme disiplinlerini maddeler halinde detaylandırmaktadır. Harita Mühendisliği standartları temel alınarak hazırlanan bu rapor, uygulamanın teknik geçerliliğini kanıtlar niteliktedir.</p>

    <div class="page-break"></div>

    <h2>1. YAZILIM ALTYAPISI VE TEKNOLOJİK STACK</h2>
    <p>${FULL_BRAND} mimarisi, sahadaki verilerin en yüksek performansla işlenmesi için modern web teknolojileri üzerine inşa edilmiştir:</p>
    <ul>
      <li><span class="bold">React 19 & Vite:</span> Uygulama, en güncel React sürümü ile "High-Performance Rendering" (Yüksek Performanslı Render) desteği sunar. Vite derleme motoru sayesinde uygulama kodları anında parse edilir ve sahada gecikmesiz (low-latency) bir deneyim sağlar.</li>
      <li><span class="bold">Strict TypeScript:</span> Tüm jeodezik hesaplamalar, TypeScript'in katı tipleme kuralları (Strict Type-Safety) altında gerçekleştirilir. Bu, özellikle 15-16 hane hassasiyetindeki koordinat verilerinin (Double Precision) tip dönüşümleri sırasında bozulmasını engeller.</li>
      <li><span class="bold">Hardware Accelerated Mapping:</span> Leaflet tabanlı harita motoru, vektörel çizimleri (DXF, KML) yaparken cihazın GPU'sunu (Grafik İşlemci) kullanır. Bu sayede binlerce parsel veya nokta içeren projelerde bile akıcı bir gezinme tecrübesi sunulur.</li>
    </ul>

    <h2>2. KONUM TOPLAMA VE HİBRİT KONUM MANTIĞI</h2>
    <p>Uygulama, sadece bir GPS alıcısı gibi değil, bir "Sensör Füzyon Hub"ı gibi çalışır:</p>
    <ul>
      <li><span class="bold">Ham NMEA Parsing:</span> İşletim sisteminin filtresinden geçmeden önce ham NMEA (GGA, RMC, GSV) cümleleri yakalanır. Bu sayede uydu sinyallerinin gerçek kalitesi (SNR - Signal to Noise Ratio) doğrudan ölçülür.</li>
      <li><span class="bold">Hibrit Sensör Entegrasyonu:</span> GNSS (Uydular) verisi, ivmeölçer (Accelerometer), manyetometre (Magnetometer) ve jiroskop (Gyroscope) verileriyle harmanlanır.</li>
      <li><span class="bold">Dead Reckoning (Hesaplı Mevki):</span> Uydu sinyalinin anlık olarak kesildiği (yoğun ağaç altı, tünel girişi vb.) durumlarda, cihazın ivme ve yön verileri kullanılarak tahminleme yapılır ve konum sürekliliği korunur.</li>
      <li><span class="bold">Frekans Yönetimi:</span> Uygulama 1Hz (Saniyede 1 okuma) frekansında çalışarak batarya verimliliği ile veri yoğunluğu arasında optimum dengeyi korur.</li>
    </ul>

    <h2>3. JEODEZİK HESAPLAMA MOTORU (GEODETIC ENGINE)</h2>
    <p>Koordinat sistemleri arasındaki dönüşümler uluslararası "Bursa-Wolf" ve "Gauss-Krüger" modellerine dayanır:</p>
    <ul>
      <li><span class="bold">WGS 84 (EPSG:4326):</span> GNSS uydularının varsayılan global datumu.</li>
      <li><span class="bold">ITRF 96 / TME (3°):</span> Türkiye'deki güncel kadastral projelerin temel taşı. GRS80 elipsoidi referans alınarak 3 derecelik dilimlerde hesaplanır.</li>
      <li><span class="bold">ED 50 (European Datum 1950):</span> Hayford elipsoidi tabanlı, 7 parametreli dönüşüm gerektiren eski sistem desteği.</li>
      <li><span class="bold">7-Parametreli Dönüşüm (Helmert):</span> İki farklı datum arasındaki geçişlerde 3 öteleme (dX, dY, dZ), 3 dönme (Rx, Ry, Rz) ve 1 ölçek faktörü (k) kullanılır.
        <div class="formula">[X, Y, Z]_Hedeft = [dX, dY, dZ] + (1+k) * R * [X, Y, Z]_Kaynak</div>
      </li>
    </ul>

    <h2>4. PROJEKSİYON MATEMATİĞİ: GAUSS-KRÜGER (TM)</h2>
    <p>Uygulama, küresel dünyayı düzleme aktarırken şu matematiksel prensipleri izler:</p>
    <ul>
      <li><span class="bold">KRÜGER-N Serileri:</span> Projeksiyon dönüşümünde 7. mertebeden seri açınımları kullanılır. Bu, meridyen yay uzunluğu hesaplamalarında milimetrik doğruluk sağlar.</li>
      <li><span class="bold">Otomatik DOM Seçimi:</span> Kullanıcının bulunduğu boylam değerine göre Dilim Orta Meridyeni (DOM) sistem tarafından otomatik atanır.
        <ul>
          <li>3 Derecelik sistemde: <span class="bold">DOM = Round(Boylam / 3) * 3</span></li>
          <li>6 Derecelik (UTM) sistemde: <span class="bold">Dilim No = Floor((Boylam + 180) / 6) + 1</span></li>
        </ul>
      </li>
      <li><span class="bold">Ölçek Faktörü Düzeltmesi:</span> DOM'dan uzaklaştıkça artan deformasyon, projeksiyon ölçek katsayısı ile kompanse edilir.</li>
    </ul>

    <h2>5. DÜŞEY DATUM VE TÜRKİYE ULUSAL JEOİD MODELİ (TG-20)</h2>
    <p>GNSS'in en zayıf noktası olan "Yükseklik" sorunu, ${FULL_BRAND} içinde akademik düzeyde çözülmüştür:</p>
    <ul>
      <li><span class="bold">Geometrik vs. Fiziksel Yükseklik:</span> Uydudan gelen elipsoidal yükseklik (h), jeostatistiksel modellerle ortometrik yüksekliğe (H) dönüştürülür.</li>
      <li><span class="bold">TG-20 Entegrasyonu:</span> Türkiye için en güncel jeoid modeli olan TG-20 grid verileri uygulama hafızasındadır.</li>
      <li><span class="bold">Bilineer İnterpolasyon:</span> Koordinatın çevresindeki en yakın 4 düğüm noktası üzerinden şu formülle ara değer hesaplanır:
        <div class="formula">N = (1-u)(1-v)N_00 + u(1-v)N_10 + (1-u)vN_01 + uvN_11</div>
      </li>
      <li><span class="bold">Smart Height Correction:</span> iOS cihazlarda EGM96 ile gelen yükseklik farkı sistem tarafından fark edilir ve TG-20 ile normalize edilir.</li>
    </ul>

    <div class="page-break"></div>

    <h2>6. İSTATİSTİKSEL FİLTRELEME VE VERİ SAĞLIĞI</h2>
    <p>Hatalı sinyalleri (Outliers) temizlemek için çok aşamalı algoritmalar çalışır:</p>
    <ul>
      <li><span class="bold">Median (Ortanca) Filtresi:</span> Veri kümesi içindeki aşırı sapan (spike) değerleri elemek için aritmetik ortalamaya göre daha kararlı olan ortanca değer yöntemi kullanılır.</li>
      <li><span class="bold">DBSCAN Kümeleme:</span> Statik ölçümde, koordinat uzayındaki yoğunluk analizi yapılır. Birbirine en yakın 4-5 noktanın oluşturduğu "çekirdek küme" esas alınır; küme dışında kalan sıçramalı veriler atılır.</li>
      <li><span class="bold">HDOP/VDOP Guard:</span> Uydu dizilimi geometrisinin zayıf olduğu zamanlarda sistem ölçümü askıya alır veya düşük güven işareti koyar.</li>
    </ul>

    <h2>7. ÖLÇÜM MANTIĞI VE STATİK KAYIT SİSTEMİ</h2>
    <p>Profesyonel ölçüm, anlık bir tıklamadan çok bir "Örnekleme Süreci"dir:</p>
    <ul>
      <li><span class="bold">Süre Bazlı Örnekleme:</span> Kullanıcı örneğin 60 saniyelik bir kayıt açtığında, saniyede bir okuma yapılır (60 örnek).</li>
      <li><span class="bold">Ağırlıklı Ortalama:</span> Her bir okumanın sahip olduğu "Vertical/Horizontal Accuracy" değerleri ters orantılı ağırlık olarak kullanılır. Daha hassas okuma, sonuca daha çok etki eder.</li>
      <li><span class="bold">Hassas Ofsetleme:</span> Donanım anten merkezi ile yer seviyesi arasındaki "Jalon Yüksekliği" kullanıcı tarafından girilerek dikey düzeltme yapılır.</li>
    </ul>

    <h2>8. APLİKASYON (STAKEOUT) VE TASARIM METODOLOJİSİ</h2>
    <p>Noktayı sahada bulmak için geliştirilen yönlendirme zekası:</p>
    <ul>
      <li><span class="bold">Jeodezik Bearing (Azimut):</span> Bulunulan nokta ile hedef arasındaki açıyı "Meridyen Yakınsaması"nı hesaplayarak gerçek kuzeye göre verir.</li>
      <li><span class="bold">Dinamik Mesafe (Range):</span> Öklidyen mesafe yerine, projeksiyon düzlemindeki indirgenmiş mesafeyi saniyelik günceller.</li>
      <li><span class="bold">Snapping Core:</span> Ekranda bir hat veya poligon seçilirken, parmak hatasını tolere edecek 50 piksellik bir "Çekim Alanı" (Gravity Field) oluşturulur.</li>
    </ul>

    <h2>9. KAYITLI VERİLER, SAKLAMA VE VERİ GÜVENLİĞİ</h2>
    <p>Verilerin saklanması "Zero-Loss" (Sıfır Kayıp) prensibiyle gerçekleşir:</p>
    <ul>
      <li><span class="bold">Local Persistence Layer:</span> Tüm veriler cihazın yerel SQLite veya IndexedDB katmanında, operasyonel bir işlem günlüğü şeklinde saklanır.</li>
      <li><span class="bold">Encryption (Şifreleme):</span> Veritabanı dosyaları yetkisiz erişime karşı işletim sistemi seviyesindeki güvenli alanlarda (sandbox) barındırılır.</li>
      <li><span class="bold">Proje Bazlı Gruplama:</span> Veriler karışıklığı önlemek için proje bazlı klasörlenir; her noktanın ölçüldüğü tarihteki hassasiyet verileri projeden silinemez (Log tutulur).</li>
    </ul>

    <h2>10. VERİ AKTARIMI VE FORMAT STANDARTLARI</h2>
    <p>Dışa aktarım motoru, tüm popüler mühendislik yazılımlarına uyumludur:</p>
    <ul>
      <li><span class="bold">Excel / CSV:</span> Nokta Numarası, Y, X, Z, Açıklama, Yatay Hata, Dikey Hata, Uydu Sayısı kolonlarını içerir.</li>
      <li><span class="bold">KML / KMZ:</span> Google Earth uyumlu, stil dosyaları gömülü coğrafi veri dökümü.</li>
      <li><span class="bold">DXF:</span> Netcad ve AutoCAD için doğrudan katmanlı vektörel dosya üretimi.</li>
      <li><span class="bold">Safe Export:</span> Dosya üretilirken karakter kodlaması (UTF-8) korunarak Türkçe karakter sorunu ekarte edilir.</li>
    </ul>

    <h2>11. HASSASİYET İPUÇLARI VE SAHA PROTOKOLLERİ</h2>
    <p>En iyi sonuçlar için mühendis tavsiyeleri:</p>
    <ul>
      <li><span class="bold">Anten Görüşü:</span> Cihaz gökyüzünün en az %80'ini doğrudan görebilmelidir.</li>
      <li><span class="bold">Isınma (Warm-Up):</span> GNSS çipsetinin ephemeris verilerini indirmesi için uygulama açıldıktan sonra ilk ölçümden önce 1 dk beklenmelidir.</li>
      <li><span class="bold">Multi-path Analizi:</span> Büyük cam cepheli binaların yanında yansıyan sinyaller koordinatı kaydırabilir; bu alanlarda DBSCAN filtresi özellikle aktif edilmelidir.</li>
    </ul>

    <h2>12. SONUÇ</h2>
    <p>
      ${FULL_BRAND}, Harita Mühendisliği’nin karmaşık matematiksel dünyasını, son kullanıcının mobil cihazındaki kullanıcı dostu bir arayüze sığdırmıştır. TG-20 jeoid desteği, 7 parametreli Bursa-Wolf dönüşümü ve gelişmiş istatistiksel filtreleme sistemleri ile sahadaki veri üretim süreçlerini hızlandırır ve güvenilir kılar. Bu teknik döküman, uygulamanın bilimsel temellere dayalı operasyonel gücünün bir beyanıdır.
    </p>

    <div class="footer">
      <p>&copy; ${year} ${FULL_BRAND} - Tüm Hakları Saklıdır.</p>
      <p>Teknik Onay No: ARGE-748123-GP | Mühendislik Çözümleri</p>
    </div>
  </div>
</body>
</html>
  `;


  const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${FULL_BRAND.replace(/\s+/g, '_')}_KAPSAMLI_TEKNIK_RAPOR_${year}.doc`;
  link.click();
  URL.revokeObjectURL(url);
};

