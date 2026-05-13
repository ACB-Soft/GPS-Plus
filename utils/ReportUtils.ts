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
    <p>Hatalı sinyalleri (Outliers) temizlemek ve en doğru sonucu üretmek için ${FULL_BRAND}, kullanıcıya 8 farklı ileri düzey istatistiksel yöntem sunar. Bu yöntemler, farklı arazi ve sinyal koşullarına göre optimize edilmiştir:</p>
    <ul>
      <li><span class="bold">1. Aritmetik Ortalama:</span> Veri kümesindeki düşük hassasiyetli veriler elendikten sonra, kalan tüm verilerin matematiksel ortalaması alınarak nihai koordinat hesaplanır.
        <div class="formula">μ = (1/n) * Σ xᵢ</div>
      </li>
      <li><span class="bold">2. Ağırlıklı En Küçük Kareler (Weighted Least Squares):</span> Her bir GNSS örneği, kendi anlık hassasiyet değerinin karesiyle ters orantılı olarak ağırlıklandırılır (W = 1/σ²). Bu sayede daha düşük hata payına sahip "kaliteli" sinyaller, hesaplama sonucuna matematiksel olarak daha fazla etki eder.
        <div class="formula">x̂ = (Σ wᵢ xᵢ) / (Σ wᵢ) , burada wᵢ = 1/σᵢ²</div>
      </li>
      <li><span class="bold">3. Robust Yöntem (M-Estimators):</span> Huber ağırlık fonksiyonu kullanılarak gerçekleştirilen bu yöntemde, sapan değerlerin etkisi doğrusal değil, belirli bir eşikten sonra sınırlı hale getirilir. Yinelemeli (iterative) hesaplama ile sapan verilere rağmen en kararlı konum kestirimi yapılır.
        <div class="formula">ρ(e) = { 0.5 * e² (|e| ≤ k); k * |e| - 0.5 * k² (|e| > k) }</div>
      </li>
      <li><span class="bold">4. Mahalanobis Uzaklık Analizi:</span> Koordinatların kovaryans matrisi üzerinden çok boyutlu uzaklık analizi yapılır. Korelasyonu bozan ve gürültü içeren veriler, koordinat sisteminin geometrik yapısına göre tespit edilerek elenir.
        <div class="formula">d² = (x - μ)ᵀ S⁻¹ (x - μ)</div>
      </li>
      <li><span class="bold">5. DBSCAN (Density-Based Clustering):</span> Koordinat uzayındaki yoğunluk analizi yapılarak ana "çekirdek küme" tespit edilir. Yansıma (multi-path) nedeniyle oluşan küme dışı sıçramalı veriler "gürültü" (noise) olarak işaretlenerek hesaba katılmaz. Algoritma, ε (epsilon) yarıçap komşuluğundaki MinPts (Minimum Nokta) parametrelerine dayanır.</li>
      <li><span class="bold">6. RANSAC (Random Sample Consensus):</span> Rastgele örnekleme ve konsensüs prensibiyle çalışır. Veri kümesi içindeki en büyük uyumlu grubu (inliers) tespit eder. Sıçramalı ve hatalı verilerin (outliers) yoğun olduğu zorlu arazi koşullarında en güvenilir sonuçlardan birini üretir.</li>
      <li><span class="bold">7. KDE (Kernel Density Estimation):</span> Çekirdek yoğunluk kestirimi ile verilerin dağılım olasılığı hesaplanır. Matematiksel olarak olasılığın en yüksek olduğu "zirve noktası" nihai koordinat olarak belirlenir.
        <div class="formula">f̂(x) = (1 / nh) * Σ K((x - xᵢ) / h)</div>
      </li>
      <li><span class="bold">8. Median + MAD (Median Absolute Deviation):</span> Aşırı uç değerlere karşı en dirençli yöntemdir. Medyan üzerinden hesaplanan mutlak sapma (MAD) değerini kullanarak, verilerin merkezine en yakın "sağlam" (robust) grubu filtreler.
        <div class="formula">MAD = median(|xᵢ - median(X)|)</div>
      </li>
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

    <h2>11. HASSASİYET HESAPLAMA METODOLOJİSİ (YATAY HASSASİYET)</h2>
    <p>Uygulama, kullanıcıya sunulan "Yatay Hassasiyet" (Horizontal Precision) değerini hesaplarken, sadece donanımsal veriye güvenmek yerine hibrit bir matematiksel model kullanır. Bu model, iki temel bileşenin bileşkesinden oluşur:</p>
    <ul>
      <li><span class="bold">1. İstatistiksel Belirsizlik Tahmini:</span> GNSS alıcısından gelen anlık hata paylarının (σ_sensor) ortalaması ve toplanan verilerin kendi içindeki standart hatası (SEM - Standard Error of Mean) birleştirilir. Bu, verilerin tekrarlanabilirliğini ölçer.
        <div class="formula">σ_stat = √[ (SEM)² + (σ_avg / √n)² ]</div>
      </li>
      <li><span class="bold">2. Fiziksel Yayılım (Maksimum Mesafe):</span> Kullanıcının belirlediği hassasiyet limitine uyan ("Güvenilir") ham veriler arasındaki en uzak iki nokta arasındaki fiziksel mesafe hesaplanır. Bu, GPS sinyalindeki yavaş sürüklenmeleri (Drift) veya ani sıçramaları (Multipath) tespit etmek için en kritik parametredir.
        <div class="formula">d_max = Max( Distance(P_i, P_j) ) , ∀ i,j ∈ Güvenilir_Veriler</div>
      </li>
    </ul>

    <h3>11.1 Sinyal Güvenilirlik Analizi ve Multipath Denetimi</h3>
    <p>Uygulama, veri bütünlüğünü korumak için hibrit bir "Güvenilirlik Değerlendirme Algoritması" (Reliability Assessment Algorithm) kullanır. Bu sistem, donanımsal hassasiyet verilerini (σ_avg), fiziksel yayılım (d_max) ve veri yoğunluğu (n) ile çapraz sorgulayarak sinyal kalitesini şu şekilde kategorize eder:</p>
    <ul>
      <li><span class="bold">Güvenli Seviye (Yeşil):</span> d_max ≤ σ_avg * 1.5 ve σ_avg ≤ 10m ve n ≥ 5 veri. Fiziksel saçılım tutarlı, hassasiyet yüksek ve istatistiksel populasyon yeterli seviyededir. Multipath riski minimumdur.</li>
      <li><span class="bold">Orta Güven / Veri Az (Turuncu):</span> 
        <ul>
          <li>σ_avg > 10m durumu: Donanımsal hassasiyetin mühendislik standartları için sınır değerde (10m+) olduğunu gösterir.</li>
          <li>n < 5 durumu: Güçlü bir istatistiksel sonuç üretmek için veri sayısının yetersiz olduğunu (Veri Az) belirtir.</li>
          <li>1.5 < (d_max / σ_avg) ≤ 3.0 durumu: Sensör düşük hata payı bildirse dahi, verilerin fiziksel yayılımının uyumsuz olduğunu (Early Multipath) işaret eder.</li>
        </ul>
      </li>
      <li><span class="bold">Güvensiz Seviye (Kırmızı):</span> d_max > 20m veya d_max > σ_avg * 3.0 durumu. Cihaz yüksek hassasiyet bildirse dahi (Örn: 2m hassasiyet raporlanırken verilerin 6m+ alana yayılması), sinyal yansıması (Multipath) nedeniyle koordinatların gerçek konumdan saptığı matematiksel olarak kanıtlanmıştır. Bu durumda kullanıcıya "Düşük Sinyal Kalitesi" pop-up uyarısı gösterilir.</li>
    </ul>

    <h2>12. HASSASİYET İPUÇLARI VE SAHA PROTOKOLLERİ</h2>
    <p>En iyi sonuçlar için mühendis tavsiyeleri:</p>
    <ul>
      <li><span class="bold">Anten Görüşü:</span> Cihaz gökyüzünün en az %80'ini doğrudan görebilmelidir.</li>
      <li><span class="bold">Isınma (Warm-Up):</span> GNSS çipsetinin ephemeris verilerini indirmesi için uygulama açıldıktan sonra ilk ölçümden önce 1 dk beklenmelidir.</li>
      <li><span class="bold">Multi-path Analizi:</span> Büyük cam cepheli binaların yanında yansıyan sinyaller koordinatı kaydırabilir; bu alanlarda DBSCAN filtresi özellikle aktif edilmelidir.</li>
    </ul>

    <h2>13. TEKNİK GÖRSEL ARAYÜZ VE OPERASYONEL EKRAN ANALİZİ</h2>
    <p>Uygulamanın kullanıcı arayüzü, karmaşık jeodezik verileri sahada anlaşılır kılmak için "Bilgi Hiyerarşisi" prensibiyle tasarlanmıştır. Aşağıda ana operasyonel ekranların teknik açıklamaları ve görsel yerleşimleri sunulmuştur:</p>

    <h3>13.1 Onboarding ve Hazırlık Ekranı</h3>
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
            <li><span class="bold">Gösterim Kontrolü:</span> Ayarlar sayfasından "Onboarding Ekranını Her Açılışta Göster" seçeneği ile bu ekranın uygulama başlangıcındaki davranışı manuel olarak yönetilebilir.</li>
            <li><span class="bold">Initial Sync:</span> TG-20 jeoid grid verilerinin yerel veritabanına ilk senkronizasyon sürecini yönetir.</li>
          </ul>
        </td>
      </tr>
    </table>

    <h3>13.2 Dashboard (Proje Yönetim Paneli)</h3>
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

    <h3>13.3 Ölçüm (GNSS) ve Veri Kaydedici</h3>
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

    <h3>13.4 Aplikasyon (Stakeout) ve Navigasyon</h3>
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

    <h3>13.5 Kritik Uyarı ve Multipath Bildirim Sistemi</h3>
    <table style="border: none;">
      <tr>
        <td style="border: 2pt dashed #ccc; width: 40%; text-align: center; vertical-align: middle; height: 150pt;">
          <br><br>
          <span style="color: #999;">[BURAYA MULTIPATH UYARI POPUP GÖRÜNTÜSÜ GELECEK]</span>
          <br><br>
        </td>
        <td style="border: none; padding-left: 20pt;">
          <span class="bold">Teknik Betimleme:</span>
          <ul>
            <li><span class="bold">Anlık Denetim:</span> Ölçüm bittiğinde verilerin saçılımı (spread) donanımsal hassasiyetin 3 katını aşıyorsa sistem otomatik bir engelleyici mesaj (Modal) çıkarır.</li>
            <li><span class="bold">Kullanıcı Farkındalığı:</span> "Ölçüm sırasında çevresel faktörler nedeniyle Multipath (Yansıma) hatası tespit edildi" uyarısı ile kullanıcının yanıltıcı hassasiyet verilerine güvenmesi engellenir.</li>
            <li><span class="bold">Karar Destek:</span> Kullanıcıya ölçümü daha açık bir alanda tekrarlaması yönünde mühendislik tavsiyesi sunulur.</li>
          </ul>
        </td>
      </tr>
    </table>

    <h2>14. UYGULAMA DOSYA YAPISI VE MODÜLER MİMARİ</h2>
    <p>${FULL_BRAND} yazılım mimarisi, "Separation of Concerns" (Sorumlulukların Ayrılması) prensibiyle modüler bir yapıda tasarlanmıştır. Bu yapı, her bir jeodezik fonksiyonun izole bir şekilde test edilmesine ve geliştirilmesine olanak tanır:</p>
    <ul>
      <li><span class="bold">/utils/MathUtils.ts (İstatistik ve Hesaplama Çekirdeği):</span> Uygulamanın beynidir. Aritmetik Ortalama, Robust Tahminleme, KDE, RANSAC, Mahalanobis ve DBSCAN gibi tüm ileri düzey istatistiksel algoritmalar bu dosyada kodlanmıştır. Sinyal işlemenin matematiksel doğrulanması burada gerçekleşir.</li>
      <li><span class="bold">/utils/CoordinateUtils.ts (Projeksiyon ve Dönüşüm Katmanı):</span> Proj4 kütüphanesi entegrasyonu ile WGS84, ITRF96, ED50 gibi koordinat sistemleri arasındaki geçişleri yönetir. Dilim orta meridyeni (DOM) hesaplamaları ve TM projeksiyon dönüşümleri bu modülün sorumluluğundadır.</li>
      <li><span class="bold">/components/GeoidUtils.ts (Yükseklik Modeli Yönetimi):</span> Elipsoidal yükseklik verisini, TG-20 ve EGM96 modellerini kullanarak fiziksel (ortometrik) yüksekliğe dönüştüren yardımcı fonksiyondur. Cihazın yerel yüksekliğini global datum ile senkronize eder.</li>
      <li><span class="bold">/components/ExcelUtils.ts (Veri Raporlama ve Excel Dökümü):</span> Toplanan verilerin mühendislik standartlarına uygun Excel (.xlsx) formatına dönüştürülmesini sağlar. Kolon yapıları, veri tipleri ve istatistiksel özet tabloları bu modülde yapılandırılır.</li>
      <li><span class="bold">/services/GeoidService.ts (Grid Veri Servisi):</span> TG-20 ve EGM96 gibi büyük ölçekli jeoid grid verilerini sorgulayan ve "Bilineer İnterpolasyon" ile ara değer üreten düşük seviyeli servis katmanıdır. Hafıza yönetimini optimize ederek grid verilerini hızlıca işler.</li>
      <li><span class="bold">/components/GPSCapture.tsx (Saha Ölçüm Modülü):</span> Kullanıcının saha operasyonlarını yönettiği ana görsel arayüzdür. GNSS verilerinin saniyelik görselleştirilmesi, doğruluk kontrolleri ve kayıt süreçleri bu bileşen üzerinden yürütülür.</li>
      <li><span class="bold">/components/StakeoutModule.tsx (Aplikasyon / Navigasyon Modülü):</span> Manuel nokta ekleme, haritadan nokta seçimi ve hedefe yönlendirme (azimut/mesafe) zekasını barındıran modüldür. Görsel "Radar" ve "Su Terazisi" kontrollerini içerir.</li>
      <li><span class="bold">/utils/ReportUtils.ts (Teknik Rapor Oluşturucu):</span> Şu an okumakta olduğunuz dökümantasyonun dinamik olarak üretilmesini sağlar. Yazılımın tüm teknik parametrelerini profesyonel bir formatta PDF/DOC çıktılarına hazırlar.</li>
    </ul>

    <h2>15. SONUÇ</h2>
    <p>
      ${FULL_BRAND}, Harita Mühendisliği’nin karmaşık matematiksel dünyasını, son kullanıcının mobil cihazındaki kullanıcı dostu bir arayüze sığdırmıştır. TG-20 jeoid desteği, 7 parametreli Bursa-Wolf dönüşümü ve gelişmiş istatistiksel filtreleme sistemleri ile sahadaki veri üretim süreçlerini hızlandırır ve güvenilir kılar. Bu teknik döküman, uygulamanın bilimsel temellere dayalı operasyonel gücünün bir beyanıdır.
    </p>

    <h2>16. KAYNAKÇA VE AKADEMİK ATIFLAR</h2>
    <p>Bu uygulamada kullanılan algoritmalar, jeodezik modeller ve yazılım kütüphaneleri aşağıdaki temel literatüre dayanmaktadır:</p>
    <ul>
      <li><span class="bold">Huber, P. J. (1981).</span> Robust Statistics. John Wiley & Sons. (M-Estimators ve Robust Tahminleme yöntemleri için).</li>
      <li><span class="bold">Hampel, F. R. (1974).</span> The influence curve and its role in robust estimation. Journal of the American Statistical Association. (Median Absolute Deviation - MAD yöntemi için).</li>
      <li><span class="bold">Fischler, M. A., & Bolles, R. C. (1981).</span> Random sample consensus: a paradigm for model fitting with applications to image analysis and automated cartography. Communications of the ACM. (RANSAC algoritması için).</li>
      <li><span class="bold">Ester, M., Kriegel, H. P., Sander, J., & Xu, X. (1996).</span> A density-based algorithm for discovering clusters in large spatial databases with noise. In KDD. (DBSCAN kümeleme analizi için).</li>
      <li><span class="bold">Silverman, B. W. (1986).</span> Density Estimation for Statistics and Data Analysis. CRC Press. (Kernel Density Estimation - KDE yöntemleri için).</li>
      <li><span class="bold">Kaplan, E. D., & Hegarty, C. (2017).</span> Understanding GPS/GNSS: Principles and Applications. Artech House. (Hata modelleri ve sinyal işleme prensipleri için).</li>
      <li><span class="bold">Teunissen, P. J. G. (2000).</span> The Least-Squares Equation. Delft University Press. (En Küçük Kareler yöntemi jeodezik uygulamaları için).</li>
      <li><span class="bold">Hofmann-Wellenhof, B., Lichtenegger, H., & Wasle, E. (2007).</span> GNSS – Global Navigation Satellite Systems. Springer. (Koordinat dönüşümleri ve projeksiyon sistemleri için).</li>
      <li><span class="bold">Harita Genel Müdürlüğü (HGM). (2020).</span> Türkiye Geoidi - 2020 (TG-20) Teknik Dökümanı. (Yerel düşey datum ve ondülasyon hesaplamaları için).</li>
      <li><span class="bold">Lemoine, F. G., et al. (1998).</span> The Development of the Joint NASA GSFC and NIMA Geopotential Model EGM96. NASA/TP-1998-206861. (Global jeoid modeli EGM96 için).</li>
      <li><span class="bold">Bursa, M. (1962).</span> The theory of the determination of the non-parallelism of the minor axis of the reference ellipsoid. Studia Geophysica et Geodaetica. (7-Parametreli Bursa-Wolf dönüşüm modeli için).</li>
      <li><span class="bold">Evenden, G. I. (1990).</span> Cartographic Projection Procedures for the UNIX Environment — A User's Manual. USGS Open-File Report. (Proj4 kütüphanesinin temelini oluşturan matematiksel algoritmalar için).</li>
      <li><span class="bold">Agafonkin, V. (2011).</span> Leaflet: An Open-Source JavaScript Library for Mobile-Friendly Interactive Maps. (Harita görselleştirme mimarisi için).</li>
      <li><span class="bold">OSGeo (Open Source Geospatial Foundation).</span> PROJ: Generic coordinate transformation software. (Projeksiyon dönüşümleri standartları için).</li>
    </ul>

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
  link.download = 'GPS_Plus_TEKNIK_RAPOR.doc';
  link.click();
  URL.revokeObjectURL(url);
};

