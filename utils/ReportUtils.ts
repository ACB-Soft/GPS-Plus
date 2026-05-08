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
  <div class='container'>
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
      <li><span class="bold">Tailwind CSS & Ergonomik UI:</span> Uygulama arayüzü, Tailwind CSS motoru kullanılarak "Utility-First" prensibiyle tasarlanmıştır. Bu, sahadaki farklı ışık ve hava koşullarında (yüksek güneş ışığı, yağmurlu hava vb.) kullanıcı arayüzünün (UI) kontrast ve okunabilirlik standartlarını korumasını sağlar.</li>
      <li><span class="bold">Offline-First PWA Mimarisi:</span> Şebeke kapsama alanı dışındaki çalışma sahaları için "Service Worker" katmanı entegre edilmiştir. Uygulama, internet bağlantısı olmasa dahi tüm çekirdek fonksiyonlarını (Ölçüm, Aplikasyon, Veri Kaydı) cihazın yerel önbelleği üzerinden kesintisiz sürdürebilir.</li>
      <li><span class="bold">IndexedDB Veri Katmanı:</span> Toplanan büyük ölçekli jeodezik veriler, tarayıcının standart depolama limitlerini aşan durumlarda "IndexedDB" asenkron veritabanı motoruyla saklanır. Bu, on binlerce noktanın bile performans kaybı yaşatmadan sorgulanabilmesini sağlar.</li>
      <li><span class="bold">Google AI Studio Desteği:</span> Uygulamanın geliştirme ve optimizasyon süreçlerinde Google AI Studio platformu, yapay zeka destekli mimari tasarım ve hata analizi aşamalarında aktif rol oynamıştır. Bu sayede karmaşık matematiksel modellerin (Jeoid ondülasyonu vb.) sisteme entegrasyonu akademik bir titizlikle tamamlanmıştır.</li>
      <li><span class="bold">GitHub & Continuous Integration (CI):</span> Sistem, GitHub altyapısında versiyonlanmakta ve GitHub Actions kullanılarak otomatik derleme (Build) süreçlerinden geçmektedir. Bu CI/CD boru hattı, her güncellemenin teknik standartlara uygunluğunu otomatik olarak doğrular.</li>
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

    <h2>6. İSTATİSTİKSEL ANALİZ VE VERİ AYIKLAMA METODOLOJİLERİ</h2>
    <p>Hatalı sinyalleri (Outliers) temizlemek ve en doğru sonucu üretmek için ${FULL_BRAND}, kullanıcıya 5 farklı ileri düzey istatistiksel yöntem sunar:</p>
    <ul>
      <li><span class="bold">1. Aritmetik Ortalama:</span> Veri kümesindeki düşük hassasiyetli veriler elendikten sonra, kalan tüm verilerin matematiksel ortalaması alınarak nihai koordinat hesaplanır.</li>
      <li><span class="bold">2. Ağırlıklı En Küçük Kareler (Weighted Least Squares):</span> Her bir GNSS örneği, kendi anlık hassasiyet değerinin karesiyle ters orantılı olarak ağırlıklandırılır (W = 1/σ²). Bu sayede daha düşük hata payına sahip "kaliteli" sinyaller, hesaplama sonucuna matematiksel olarak daha fazla etki eder.</li>
      <li><span class="bold">3. Robust Yöntem (M-Estimators):</span> Huber ağırlık fonksiyonu kullanılarak gerçekleştirilen bu yöntemde, sapan değerlerin etkisi doğrusal değil, belirli bir eşikten sonra sınırlı hale getirilir. Yinelemeli (iterative) hesaplama ile sapan verilere rağmen en kararlı konum kestirimi yapılır.</li>
      <li><span class="bold">4. Mahalanobis Uzaklık Analizi:</span> Koordinatların kovaryans matrisi üzerinden çok boyutlu uzaklık analizi yapılır. Korelasyonu bozan ve gürültü içeren veriler, koordinat sisteminin geometrik yapısına göre tespit edilerek elenir.</li>
      <li><span class="bold">5. DBSCAN (Density-Based Clustering):</span> Koordinat uzayındaki yoğunluk analizi yapılarak ana "çekirdek küme" tespit edilir. Yansıma (multi-path) nedeniyle oluşan küme dışı sıçramalı veriler "gürültü" (noise) olarak işaretlenerek hesaba katılmaz.</li>
    </ul>

    <h2>7. ÖLÇÜM MANTIĞI VE VERİ İŞLEME DİSİPLİNLERİ</h2>
    <p>Profesyonel ölçüm, anlık bir koordinat yakalamaktan ziyade, seçilen analiz yöntemiyle gerçekleştirilen bir "Sinyal İşleme" sürecidir:</p>
    <ul>
      <li><span class="bold">Düşük Hassasiyet Eliminasyonu:</span> Seçilen analiz yönteminden bağımsız olarak, öncelikle kullanıcının belirlediği "Hassasiyet Limiti" dışındaki tüm ham veriler veri kümesinden derhal çıkartılır.</li>
      <li><span class="bold">Hibrit Sinyal Kontrolü:</span> Saniyelik örnekleme sırasında GPS çipsetinin bildirdiği hata payları (HDOP/VDOP) sürekli izlenir; limit aşımı durumunda analiz duraklatılarak veri bütünlüğü korunur.</li>
      <li><span class="bold">Matematiksel Ofset Uygulama:</span> Elde edilen hassas koordinat, jeoid interpolasyonu ve varsa jalon yüksekliği düzeltmeleri ile millimetrik seviyede nihai hale getirilir.</li>
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

    <h2>12. TEKNİK GÖRSEL ARAYÜZ VE OPERASYONEL EKRAN ANALİZİ</h2>
    <p>Uygulamanın kullanıcı arayüzü, karmaşık jeodezik verileri sahada anlaşılır kılmak için "Bilgi Hiyerarşisi" prensibiyle tasarlanmıştır. Aşağıda ana operasyonel ekranların teknik açıklamaları ve görsel yerleşimleri sunulmuştur:</p>

    <h3>12.1 Onboarding ve Hazırlık Ekranı</h3>
    <table style="border: none;">
      <tr>
        <td style="border: 2pt dashed #ccc; width: 40%; text-align: center; vertical-align: middle; height: 300pt;">
          <br><br><br>
          <span style="color: #999;">[BURAYA ONBOARDING EKRAN GÖRÜNTÜSÜ GELECEK]</span>
          <br><br><br>
        </td>
        <td style="border: none; padding-left: 20pt;">
          <span class="bold">Teknik Betimleme:</span>
          <ul>
            <li><span class="bold">Sistem İzinleri:</span> Hassas konum ve dosya erişim izinlerinin "Mühendislik Modu" için neden gerekli olduğunu kullanıcıya açıklar.</li>
            <li><span class="bold">Initial Sync:</span> TG-20 jeoid grid verilerinin yerel veritabanına ilk senkronizasyon sürecini yönetir.</li>
            <li><span class="bold">UI/UX Hedefi:</span> Sahaya çıkmadan önce cihazın jeodezik hesaplamalara hazır olduğunu (Ready to Measure) teyit eder.</li>
          </ul>
        </td>
      </tr>
    </table>

    <h3>12.2 Dashboard (Proje Yönetim Paneli)</h3>
    <table style="border: none;">
      <tr>
        <td style="border: 2pt dashed #ccc; width: 40%; text-align: center; vertical-align: middle; height: 300pt;">
          <br><br><br>
          <span style="color: #999;">[BURAYA DASHBOARD EKRAN GÖRÜNTÜSÜ GELECEK]</span>
          <br><br><br>
        </td>
        <td style="border: none; padding-left: 20pt;">
          <span class="bold">Teknik Betimleme:</span>
          <ul>
            <li><span class="bold">Proje Özetleri:</span> Aktif projenin toplam nokta sayısı, kullanılan projeksiyon (ITRF96/UTM) ve yükseklik modeli durumunu (TG-20 Aktif/Pasif) tek bakışta sunar.</li>
            <li><span class="bold">Hızlı Erişim:</span> En son yapılan ölçümlere ve dışa aktarım (Export) araçlarına anlık erişim sağlar.</li>
            <li><span class="bold">Sistem Sağlığı:</span> Batarya durumu ve GNSS çipsetinin güncel hata payını arka planda izler (Background Monitoring).</li>
          </ul>
        </td>
      </tr>
    </table>

    <h3>12.3 Ölçüm (GNSS) ve Veri Kaydedici</h3>
    <table style="border: none;">
      <tr>
        <td style="border: 2pt dashed #ccc; width: 40%; text-align: center; vertical-align: middle; height: 300pt;">
          <br><br><br>
          <span style="color: #999;">[BURAYA ÖLÇÜM EKRANI EKRAN GÖRÜNTÜSÜ GELECEK]</span>
          <br><br><br>
        </td>
        <td style="border: none; padding-left: 20pt;">
          <span class="bold">Teknik Betimleme:</span>
          <ul>
            <li><span class="bold">Canlı Veri Akışı:</span> GG-RMC ayıklayıcıdan gelen saniyelik koordinat güncellemeleri.</li>
            <li><span class="bold">Hassasiyet Göstergesi:</span> Yatay ve dikey doğruluk değerlerine göre renk değiştiren (Yeşil: <1m, Sarı: 1-5m, Kırmızı: >5m) dinamik göstergeler.</li>
            <li><span class="bold">Statik Kayıt Modu:</span> Geri sayım sayacı ve örnekleme havuzunun (Sample Pool) doluluk oranını gösteren ilerleme çubuğu.</li>
          </ul>
        </td>
      </tr>
    </table>

    <div class="page-break"></div>

    <h3>12.4 Aplikasyon (Stakeout) ve Navigasyon</h3>
    <table style="border: none;">
      <tr>
        <td style="border: 2pt dashed #ccc; width: 40%; text-align: center; vertical-align: middle; height: 300pt;">
          <br><br><br>
          <span style="color: #999;">[BURAYA APLİKASYON EKRAN GÖRÜNTÜSÜ GELECEK]</span>
          <br><br><br>
        </td>
        <td style="border: none; padding-left: 20pt;">
          <span class="bold">Teknik Betimleme:</span>
          <ul>
            <li><span class="bold">Hedefleme Radarı:</span> Mevcut konumun hedefe göre bağıl vektörünü (Azimut/Mesafe) görselleştiren "Targeting Radar" katmanı.</li>
            <li><span class="bold">Sanal Ufuk:</span> Jalon dikliğini kontrol etmek için ivmeölçer verisini kullanan su terazisi simülasyonu.</li>
            <li><span class="bold">Sesli/Titreşimli Geri Bildirim:</span> Hedefe yaklaştıkça frekansı artan uyarı sinyalleri ile kullanıcının ekrana bakmadan aplikasyon yapabilmesine olanak tanır.</li>
          </ul>
        </td>
      </tr>
    </table>

    <h2>13. SONUÇ</h2>
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

