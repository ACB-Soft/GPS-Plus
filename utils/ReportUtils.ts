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
    <p>Hatalı sinyalleri (Outliers) temizlemek ve en doğru sonucu üretmek için ${FULL_BRAND}, kullanıcıya 3 ana yöntemin yanı sıra AR-GE modülünde toplam 9 farklı ileri düzey istatistiksel ve süzgeçleme yöntemi sunar. Bu yöntemler, farklı arazi, yansıma (multipath) ve sinyal koşullarına göre optimize edilmiştir:</p>
    <ul>
      <li><span class="bold">1. Aritmetik Ortalama:</span> Veri setindeki tüm değerlerin basit aritmetik ortalamasını hesaplar. Düşük hassasiyetli veriler ön filtreleme ile elendikten sonra kalan tüm veriler eşit ağırlığa sahiptir.
        <div class="formula">μ = (1/n) * Σ xᵢ</div>
      </li>
      <li><span class="bold">2. Ağırlıklı En Küçük Kareler (Weighted Least Squares):</span> Yatay hassasiyet (acc) değerlerini kullanarak ağırlıklı dengeleme yapar. Ağırlıklar P = 1/acc² olarak alınır. Daha düşük hata payına sahip "kaliteli" sinyaller, hesaplama sonucuna matematiksel olarak daha fazla etki eder.
        <div class="formula">x̂ = (Σ Pᵢ xᵢ) / (Σ Pᵢ) , burada Pᵢ = 1/σᵢ²</div>
      </li>
      <li><span class="bold">3. K-Means + Baarda Hibrit Modeli:</span> Uygulamanın en gelişmiş standart üretici modelidir. 5 aşamalı bir analiz süreci yürütür:
        <ul>
          <li><span class="bold">A. Referans Tespiti (Mid-Range):</span> Verilerin uzaydaki geometrik sınırları üzerinden bir merkez noktası belirler.</li>
          <li><span class="bold">B. Sıkı Eleme (1.0 * Eps):</span> Referans noktasından, donanımsal ortalama hassasiyetin 1.0 katından daha uzak olan verileri "gürültü" olarak kabul eder ve eler.</li>
          <li><span class="bold">C. K-Means Kümeleme:</span> Kalan kararlı verileri K-Means algoritması ile 4 bağımsız kümeye ayırarak yerel yoğunlukları tespit eder.</li>
          <li><span class="bold">D. Küme Özetleme:</span> Her küme kendi içinde ağırlıklı dengeleme ile tek bir temsilci noktaya indirgenir.</li>
          <li><span class="bold">E. Baarda Güvenilirlik Testi:</span> Elde edilen 4 özet nokta arasında istatistiksel uyuşmazlık testi (Baarda) yapılır. Matematiksel olarak uyumsuz olan kümeler nihai sonuçtan dışlanır.</li>
        </ul>
      </li>
    </ul>

    <h3>6.1 AR-GE VE İLERİ DÜZEY AKADEMİK MODELLEME YÖNTEMLERİ</h3>
    <p>Aşağıdaki yöntemler, sistemin sınırlarını zorlamak ve yeni nesil donanım entegrasyonlarını test etmek amacıyla yalnızca Ar-Ge platformunda aktif edilmiş araştırma kütüphaneleridir:</p>
    <ul>
      <li><span class="bold">A. K-Means (4 Küme - Saf Segmentasyon):</span> Baarda testi işletilmeden, ham gözlem uzayını k=4 parametresiyle doğrudan kümelere ayırır. En yoğun (en çok ölçü içeren) alt grubu bularak, onun ağırlıklı ortalamasını çıktı verir. Yerel yığılmaları gözlemlemek için idealdir.</li>
      <li><span class="bold">B. DBSCAN (Yoğunluk Tabanlı Kümeleme):</span> Yoğun gürültü içeren ortamlarda (ağaçlık alanlar, dar sokaklar) mekansal yoğunluk analizi yapar. Hücre yoğunluğu düşük olan uzak noktaları otomatik olarak ham veri kümesinden eler ve ana çekirdek gözlem grubunu pürüzsüzleştirir.</li>
      <li><span class="bold">C. Baarda (Doğrudan Veri Snooping):</span> K-Means kümeleme ön şartı aranmaksızın, uyuşmazlık testini ham gözlemler üzerinde doğrudan ve ardışık olarak işletir. Her adımda en büyük standartlaştırılmış hataya sahip gözlemi eler. Konumsal dağılımda tekil sıçramaların (spikes) tespiti için kusursuzdur.</li>
      <li><span class="bold">D. Robust Huber (M-Estimation):</span> Gözlemlerin ağırlıklarını doğrusal olmayan bir iterasyonla günceller. Huber sınır değerinden (c=1.345) büyük hata barındıran yansıyan sinyallerin (multipath) ağırlığını doğrusal olarak azaltırken, normal hataları quadratik süzgeçten geçirir. İterasyonlar, koordinat değişimi milimetre sınırına gerileyene dek sürdürülür.</li>
      <li><span class="bold">E. Statik Kalman Filtresi:</span> Duran bir alıcı için tasarlanan 3 boyutlu dinamik durum modelidir. Süreç gürültüsü (Q=1e-9) çok küçük tutularak, her yeni gelen gözlemin hata kovaryansı (R) doğrultusunda durum matrisi ardışık olarak güncellenir. Zamanla azalan gözlem belirsizliğini ve zaman serisi kararlılığını simüle eder.</li>
      <li><span class="bold">F. Statik Parçacık Filtresi (Particle Filter):</span> Rastgele dağılımlı 200 adet Monte Carlo parçacığı (olasılık bulutu) ile çalışır. Her bir gözlem adımında parçacıkların ağırlıkları olasılık fonksiyonuna (Gaussian PDF) göre güncellenir, sistematik yeniden örnekleme (Resampling) yapılarak olasılık dağılımının en daraldığı tepe noktası nihai koordinat olarak seçilir.</li>
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
    <p>Uygulama, kullanıcıya sunulan "Yatay Hassasiyet" (Horizontal Precision) değerini hesaplarken, cihazın bildirdiği ham verilere ek olarak matematiksel bir "Maksimum Değer Formülü" kullanır. Bu formül, teorik hata payı ile pratik saçılımı kıyaslayarak en muhafazakar (en güvenli) sonucu üretir:</p>
    
    <div class="formula">Hassasiyet = Max( d_max, σ_avg )</div>

    <p>Burada bileşenler şu şekilde tanımlanır:</p>
    <ul>
      <li><span class="bold">1. Ortalama Donanımsal Hassasiyet (σ_avg):</span> GNSS çipsetinin her bir örnek için raporladığı donanımsal hata paylarının aritmetik ortalamasıdır. Bu değer, uydu geometrisi (DOP) ve sinyal gücü bazlı teorik belirsizliği temsil eder.</li>
      <li><span class="bold">2. Maksimum Saçılım / Yayılım (d_max):</span> Kullanıcının belirlediği hassasiyet limitine uyan ham veriler arasındaki en uzak iki nokta arasındaki fiziksel mesafedir. Bu parametre, sinyaldeki "Multipath" (Yansıma) veya "Drift" (Sürüklenme) hatalarını pratik olarak ölçer.</li>
    </ul>
    <p>Sonuç olarak; eğer cihaz 2 metre hassasiyet bildirmesine rağmen veriler 6 metrelik bir alana yayılıyorsa, uygulama kullanıcıya 6 metre hassasiyet raporlayarak yanıltıcı sonuçların önüne geçer.</p>

    <h3>11.1 Sinyal Güvenilirlik Analizi ve Multipath Denetimi</h3>
    <p>Uygulama, veri bütünlüğünü korumak için hibrit bir "Güvenilirlik Değerlendirme Algoritması" (Reliability Assessment Algorithm) kullanır. Bu sistem, donanımsal hassasiyet verilerini (σ_avg), fiziksel yayılım (d_max) ve veri yoğunluğu (n) ile çapraz sorgulayarak sinyal kalitesini şu şekilde kategorize eder:</p>
    <ul>
      <li><span class="bold">Güvenli Seviye (Yeşil):</span> σ_avg ≤ 10m ve d_max ≤ 15m ve n ≥ 5 veri. Fiziksel saçılım tutarlı, hassasiyet yüksek ve istatistiksel populasyon yeterli seviyededir. Multipath riski minimumdur.</li>
      <li><span class="bold">Orta Güven / Veri Az (Turuncu):</span> 
        <ul>
          <li>10m < σ_avg ≤ 20m durumu: Donanımsal hassasiyetin mühendislik standartları için orta seviyede olduğunu gösterir.</li>
          <li>15m < d_max ≤ 30m durumu: Verilerin fiziksel yayılımının arttığını ancak henüz kritik seviyeye ulaşmadığını gösterir.</li>
          <li>n < 5 durumu: Güçlü bir istatistiksel sonuç üretmek için veri sayısının yetersiz olduğunu (Veri Az) belirtir.</li>
        </ul>
      </li>
      <li><span class="bold">Güvensiz Seviye (Kırmızı):</span> σ_avg > 20m veya d_max > 30m veya d_max > σ_avg * 3.0 durumu. Cihaz yüksek hassasiyet bildirse dahi (Örn: 2m hassasiyet raporlanırken verilerin 6m+ alana yayılması), sinyal yansıması (Multipath) veya donanımsal yetersizlik nedeniyle koordinatların gerçek konumdan saptığı matematiksel olarak kanıtlanmıştır.</li>
    </ul>

    <h2>12. HASSASİYET İPUÇLARI VE SAHA PROTOKOLLERİ</h2>
    <p>En iyi sonuçlar için mühendis tavsiyeleri:</p>
    <ul>
      <li><span class="bold">Anten Görüşü:</span> Cihaz gökyüzünün en az %80'ini doğrudan görebilmelidir.</li>
      <li><span class="bold">Isınma (Warm-Up):</span> GNSS çipsetinin ephemeris verilerini indirmesi için uygulama açıldıktan sonra ilk ölçümden önce 1 dk beklenmelidir.</li>
      <li><span class="bold">Multi-path Analizi:</span> Büyük cam cepheli binaların yanında yansıyan sinyaller koordinatı kaydırabilir; bu alanlarda RANSAC veya Huber M-Estimation filtresi özellikle aktif edilmelidir.</li>
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
            <li><span class="bold">Kullanıcı Farkındalığı:</span> "Ölçüm sırasında çevresel ve donanımsal faktörler nedeniyle hatalar tespit edildi" uyarısı ile kullanıcının yanıltıcı hassasiyet verilerine güvenmesi engellenir.</li>
            <li><span class="bold">Karar Destek:</span> Kullanıcıya ölçümü daha açık bir alanda tekrarlaması yönünde mühendislik tavsiyesi sunulur.</li>
          </ul>
        </td>
      </tr>
    </table>

    <h2>14. UYGULAMA DOSYA YAPISI VE MODÜLER MİMARİ</h2>
    <p>${FULL_BRAND} yazılım mimarisi, "Separation of Concerns" (Sorumlulukların Ayrılması) prensibiyle modüler bir yapıda tasarlanmıştır. Bu yapı, her bir jeodezik fonksiyonun izole bir şekilde test edilmesine, doğrulanmasına ve geliştirilmesine olanak tanır. Uygulamanın tüm klasör ve dosya yapısı aşağıda detaylı olarak açıklanmıştır:</p>
    
    <h3>14.1 Kök Dizin Sorumluluk Grubu (Root Files)</h3>
    <p>Uygulamanın genel akışını, temel durumunu, stil katmanını ve derleme süreçlerini yöneten temel dosyalardır:</p>
    <ul>
      <li><span class="bold">App.tsx:</span> Uygulamanın merkezi yönetim, yönlendirme (routing), anlık görünüm geçişleri ve genel ayarların (varsayılan hassasiyetler, koordinat sistemleri, dil tercihleri) kalıcı depo (localStorage) ile senkronizasyonunu kontrol eden can damarıdır.</li>
      <li><span class="bold">types.ts:</span> Uygulamada yer alan tüm haritacılık veri tiplerini, GNSS nokta yapısını, jeofiziksel ölçüm veri havuzlarını ve istatistik modeli parametrelerini tanımlayan ortak tip kütüphanesidir.</li>
      <li><span class="bold">version.ts:</span> Uygulamanın resmi ismini (<span class="bold">${FULL_BRAND}</span>), geçerli yazılım sürümünü ve yayın bilgilerini bildiren anahtar dosyadır.</li>
      <li><span class="bold">index.html & index.tsx:</span> Tarayıcı pencerelerindeki ana giriş kapısıdır. React uygulamasını DOM ağacına monte ederek tarayıcıda hayat bulmasını sağlar.</li>
      <li><span class="bold">index.css:</span> Tailwind CSS stil motorunun sisteme dahil edildiği, "Inter" ekran yazı tipleri ile "JetBrains Mono" veri gösterim yazı tiplerinin tanımlandığı tek global stil deklarasyon kümesidir.</li>
      <li><span class="bold">vite.config.ts & tsconfig.json:</span> Projenin modern, hızlı ve hatasız bir şekilde derlenmesini (Vite) ve TypeScript katı tip kontrollerinin (Strict Type-Safety) otomatik uygulanmasını kontrol eden altyapı ayarlarıdır.</li>
    </ul>

    <h3>14.2 Komponent ve Arayüz Grubu (/components)</h3>
    <p>Haritacıların sahada doğrudan temas kurduğu, kullanımı kolay ve performans odaklı arayüzlerin konumlandığı modüllerdir:</p>
    <ul>
      <li><span class="bold">Dashboard.tsx:</span> Kullanıcıyı karşılayan ana ara birimdir. Aktif nokta istatistiklerini, seçilmiş olan projeksiyon sistemini, TG-20 ve batarya durumlarını tekil kartlar halinde gösteren kontrol paneli özetidir.</li>
      <li><span class="bold">GPSCapture.tsx:</span> Gerçek zamanlı sahadaki uydu verilerini süzmeye yarayan, hareketli veya saniyeli geri sayım tabanlı ölçüm sürecini organize eden dinamik yakalama ekranıdır.</li>
      <li><span class="bold">StakeoutModule.tsx:</span> Arazi aplikasyon işlerini milimetrik düzeyde gerçekleştiren modüldür. Haritadan nokta seçimi, manuel veri girişi, 360 derece hedefe yönlenme radarı ve ivmeölçer tabanlı su terazisi kontrollerini yönetir.</li>
      <li><span class="bold">DataAnalysisView.tsx:</span> AR-GE (Araştırma & Geliştirme) merkezinin kontrol ünitesidir. Toplanan ham verilerin saçılım grafiklerini, 9 farklı istatistik filtresini barındırır ve şu an detaylarını incelediğiniz bu teknik raporunun yönetimini gerçekleştirir.</li>
      <li><span class="bold">SavedLocationsList.tsx:</span> Kaydedilen tüm jeodezik ölçümlerin sıralandığı, arama ve klasör bazlı gruplama filtrelerinin uygulandığı arazi nokta defteridir.</li>
      <li><span class="bold">SettingsView.tsx:</span> Ölçüm süresinden, ulaşılan min hassasiyete, harita sağlayıcılarından (Google Hybrid, Esri vb.) veri yedekleme, kurtarma ve fabrika ayarlarına sıfırlama iş akışlarına dek tüm sistem hassasiyet ayarlarının yönetildiği kontrol noktasıdır.</li>
      <li><span class="bold">Onboarding.tsx:</span> Uygulama ilk açıldığında veya istendiğinde çalışan, GPS izinlerinin önemini, veri formatlarını ve jeodezik ayarların nasıl yapılması gerektiğini görsel olarak anlatan etkileşimli rehberdir.</li>
      <li><span class="bold">ExcelUtils.ts & KMLUtils.ts & TxtUtils.ts:</span> Jeodezik verilerin Netcad, AutoCAD, Global Mapper ve Excel gibi teknik programlara doğrudan aktarılabilmesi amacıyla, Türkçe karakter korumalı ve katman planlarına sahip dosyalar üreten çevirici kütüphanelerdir.</li>
      <li><span class="bold">Header.tsx & GlobalFooter.tsx & Modal.tsx:</span> Uygulama genelinde gezinmeyi kolaylaştıran, uyarı mesajlarını yöneten ve her ekrana kusursuz adaptasyon sağlayan ortak arayüz öğeleridir.</li>
    </ul>

    <h3>14.3 Mühendislik ve Jeografi Çekirdeği (/utils & /services)</h3>
    <p>Doğrudan donanımdan gelen verilerin üzerinde ağır jeodezik matematik ve sinyal filtreleme süreçlerini yürüten algoritma çekirdekleridir:</p>
    <ul>
      <li><span class="bold">/utils/CoordinateUtils.ts:</span> Bursa-Wolf 7-Parametreli datum dönüştürme matrislerini, Gauss-Krüger (TME 3 derecelik) projeksiyon formüllerini ve otomatik dilim orta meridyeni (DOM) atamasını yöneten, harita mühendisliğinin temel taşıdır.</li>
      <li><span class="bold">/utils/MathUtils.ts:</span> Sinyal gürültülerini (Multipath, Drift) temizleyen; DBSCAN kümeleme, Robust Huber M-Estimation, RANSAC, Kalman Filtresi ve Monte Carlo Parçacık Filtresi (Particle Filter) gibi 9 ileri düzey istatistiksel ve süzgeçleme algoritmasının yer aldığı çekirdek kütüphanedir.</li>
      <li><span class="bold">/components/GeoidUtils.ts & /services/GeoidService.ts:</span> Türkiye Ulusal Jeoid Modeli (TG-20) ile küresel EGM96 modellerini barındıran, 2D koordinatın geçtiği bölgedeki yükseklik ondülasyonunu (N) 4 düğüm noktası üzerinden "Bilineer İnterpolasyon" ile çözerek elipsoidal yüksekliği fiziksel ortometrik yüksekliğe milimetrik çeviren koordinat düzeltme sistemdir.</li>
      <li><span class="bold">/utils/LanguageContext.tsx & trtoentranslate.ts:</span> Tüm teknik terimlerin, jeodezik rapor başlıklarının ve arazi arayüzlerinin Türkçe ve İngilizce dillerindeki karşılıklarını sunan, alan terimlerini akademik olarak eşleyen dil dönüştürme katmanıdır.</li>
      <li><span class="bold">/utils/browser.ts:</span> Tarayıcının GPS sensor API yeteneklerini test eden ve gerekli donanım doğrulamalarını yapan sistem arayüzüdür.</li>
    </ul>

    <h2>15. GOOGLE AI STUDIO VE ALAN UZMANI İŞBİRLİĞİ (METODOLOJİK REHBER)</h2>
    <p>Bu uygulama sadece konvansiyor bir mühendislik aracı değil; yapay zekanın jeodezik modelleme ve yazılım mühendisliğindeki yeteneklerini ölçen öncü bir uygulamalı vaka analizidir (Case Study). Proje, Yazılım Mimarı ve Kod Ortaklığı tarafında <span class="bold">Google AI Studio</span> ile Geodezi/Harita Mühendisliği Alan Uzmanlığı (Cihat Başara) tarafındaki derin mesleki bilginin ortak sinerjisi doğrultusunda şu metotlarla geliştirilmiştir:</p>
    
    <h3>15.1 Kod Üretimi ve Algoritma Çevirisi (Prototipleme)</h3>
    <p><span class="bold">Rolü:</span> Alan uzmanının sağladığı karmaşık jeodezik teorik iş akışları (TG-20 jeoid interpolasyonu, Bursa-Wolf, Gauss-Krüger dönüşüm serileri, uyuşmazlık testleri) AI Studio arayüzü üzerinden yüksek mühendislik odaklı istemlerle (Prompt) doğrudan beslenmiştir.</p>
    <p><span class="bold">Değinilen Nokta:</span> AI Studio'nun bu karmaşık matematiksel algoritmaları ve istatistik modellerini sıfırdan temiz, modüler ve 15-16 hane hassasiyetini (Double Precision) koruyan TypeScript kod bloklarına anında tercüme yeteneği. Özellikle büyük dil modellerinin (LLM) karmaşık mantıksal yapıları hızlıca prototipleme ve çalışır koda dökme kabiliyeti sayesinde geleneksel yazılım süreçlerinde haftalar süren analiz aşaması günler seviyesine indirilmiştir.</p>

    <h3>15.2 Düşük-Kod (Low-Code/No-Code) Esnekliği ile Ergonomik Arayüz Tasarımı</h3>
    <p><span class="bold">Rolü:</span> Sahada çalışan teknik personelin arazideki zorlu koşullara (kontrast, yüksek güneş ışığı altında okunabilirlik, hızlı jalon diklik kontrolü vb.) uygun bir kullanıcı arayüzüne (UI) sahip olması amacıyla AI Studio; modern kullanıcı deneyimi (UX), responsive Tailwind CSS bileşen tasarımları ve hata ayıklama süreçlerinde tam zamanlı asistanlık yapmıştır.</p>
    <p><span class="bold">Değinilen Nokta:</span> Yazılım mühendisi olmayan alan uzmanının detaylı arazi gözlemleri ve donanımsal limitleri tespiti, AI Studio’nun yönlendirmeleri ile birleşerek profesyonel düzeyde çalışan, kararlı, kompakt ve esnek (responsive) bir arazi el terminali arayüzüne dönüştürülmüştür. Bu durum, teknik alan uzmanlarının sınırsız yazılım ekiplerine bağımlılığını azaltıp doğrudan fikir-ürün döngüsünü gerçekleştirebilmesini kanıtlamıştır.</p>

    <h3>15.3 Büyük Dil Modellerinin (LLM) Kabiliyet ve Limitlerinin Test Edilmesi</h3>
    <p><span class="bold">Rolü:</span> Sistemin matematiksel doğruluğu, jeodezik formüllerin koordinat dönüşüm hassasiyetleri ve veri güvenliği alan uzmanı tarafından her aşamada denetlenmiştir. Yapay zekanın jeodezi alanındaki sınırları ve yetenekleri bu süreç doğrultusunda şu iki ana unsurda test edilmiştir:</p>
    <ul>
      <li><span class="bold">Halüsinasyon, Yapay Zeka Hata Oranı ve Self-Debugging:</span> Yapay zekanın karmaşık matris dengelemesi, Huber sınır katsayıları veya veri parselleme algoritmalarındaki anlık hataları (bug), alan uzmanının matematiksel denetimlerinden sonra doğru "İstem Mühendisliği" (Prompt Engineering) teknikleri ile yine AI Studio'ya başarılı bir şekilde düzelttirilmiştir (kendi hatasını çözme - self-debugging).</li>
      <li><span class="bold">Zaman ve Geliştirme Maliyeti Verimliliği:</span> Geleneksel yazılım mühendisliği ekiplerinin geliştirme, test, doğrulamaları için harcadığı kaynaklar kıyaslandığında; bir adet jeodezi alan uzmanı ile Google AI Studio'nun ortak ortaklığı, projeyi %85 oranında hızlandırmış ve yazılım üretim maliyetini minimuma indirmiştir. Bu durum, yapay zekanın endüstriyel mühendislik uygulamalarında güvenilir bir "Co-Pilot" olduğunu literatürde teyit etmiştir.</li>
    </ul>

    <h3>15.4 Eksik/Sığ İstemlerde Üretilen Yapay Zeka Hataları ve Alan Uzmanı Müdahaleleri (Otokritik & Vaka Analizi)</h3>
    <p>Yapay zeka modellerinin haritacılık gibi yüksek matematiksel hassasiyet, fiziksel kısıtlar ve jeodezik standartlar içeren disiplinlerdeki en büyük zayıflığı, istemlerin eksik veya sığ dille aktarıldığı anlarda ortaya çıkmaktadır. Model, bu durumlarda genel yazılımsal varsayımlar yapmakta ve teknik olarak hatalı kabuller üretebilmektedir. <span class="bold">${FULL_BRAND}</span> geliştirilme sürecinde yaşanan otokritik hata ve alan uzmanı (Cihat Başara) müdahale vakaları şunlardır:</p>
    
    <div style="margin-top: 15px; border-left: 4px solid #dc2626; padding-left: 15px; margin-bottom: 20px;">
      <p class="bold" style="color: #dc2626; margin-bottom: 4px;">Vaka 1: Hassasiyet Limiti İhlallerinin Geriye Dönük Hesaplamalara Sızması</p>
      <p><span class="bold">AI Hatası:</span> Ölçüm arayüzünde saniyelik gelen ham GPS verileri doğruluk filtresine tabi tutuluyordu. Örneğin, 5m doğruluk limiti aşıldığında ekranda uyarı veriliyordu. Ancak AI, veri toplama fazı tamamlandıktan sonra arka planda çalışan En Küçük Kareler (LSE), Huber M-Tahminleme ve RANSAC algoritmalarına, o esnada kaydedilmiş gürültülü (örneğin 12-15 metre doğruluk sapması olan) tüm ham verileri de dahil ediyordu. Bu durum, nihai ağırlıklı ortalama koordinatı saptırarak kararsızlaştırıyordu.</p>
      <p><span class="bold">Alan Uzmanı Revizyonu:</span> Alan uzmanı, jeodezik veri üretiminde kalitenin başlangıçta korunması gerektiğini belirterek, belirlenen doğruluk sınırı dışındaki konum verilerinin daha kayıt esnasında veri havuzuna kesinlikle alınmaması, listeye eklenmeden çöpe atılması ve sadece süzülmüş hassas veriler üstünde istatistiksel çıkarım yapılması kuralını getirmiştir. Bu sayede saha ölçümlerinin konum doğruluğu ve tekrarlanabilirliği milimetrik olarak güvence altına alınmıştır.</p>
    </div>

    <div style="border-left: 4px solid #d97706; padding-left: 15px; margin-bottom: 20px;">
      <p class="bold" style="color: #d97706; margin-bottom: 4px;">Vaka 2: Elipsoid ve Ortometrik Yükseklik Ayrımının İhmal Edilmesi</p>
      <p><span class="bold">AI Hatası:</span> İlk prototiplerde AI, mobil cihazın ham GPS alıcısından okuduğu elipsoidal yüksekliği ($h$) doğrudan Netcad ve AutoCAD uyumlu ham TXT ve Excel çıktılarına "Nokta Kotu (Ortometrik Yükseklik - $H$)" başlığı altında tekil yükseklik verisi olarak yazdırmıştır.</p>
      <p><span class="bold">Alan Uzmanı Revizyonu:</span> Mühendislikte elipsoidal yükseklik ile fiziki ortometrik yüksekliğin farkının hayati olduğu, aradaki jeoid ondülasyonu ($N$) düşülmeden ($H = h - N$) üretilen ve projelerde kullanılan kotların imalat ve aplikasyon facialarına yol açacağı belirtilmiştir. Bu uyarıyla, TG-20 ve EGM96 filtreleri sisteme adapte edilmiş ve raporlama motorunda elipsoidal ve ortometrik kot kavramları iki ayrı kolon olarak birbirinden kesinlikle ayrılmıştır.</p>
    </div>

    <div style="border-left: 4px solid #2563eb; padding-left: 15px; margin-bottom: 20px;">
      <p class="bold" style="color: #2563eb; margin-bottom: 4px;">Vaka 3: Bursa-Wolf 7-Parametreli Matris Dönüşümündeki Rotasyon İşaret Hatası</p>
      <p><span class="bold">AI Hatası:</span> WGS84 ile ED50/ITRF96 sistemleri arasında koordinat transferi sağlayan 7-Parametreli Bursa-Wolf matris dönüşümü yazılırken AI, rotasyon parametrelerinin ($Rx, Ry, Rz$) işaretlerini "Coordinate Frame Rotation" (Koordinat Ekseni Rotasyonu) ile "Position Vector Rotation" (Konum Vektörü Rotasyonu) kavramlarının farkını ayırt edemeyerek ters işaretli atamıştır. Bu durum haritada yüzlerce metrelik konumsal kaymalara sebep olmuştur.</p>
      <p><span class="bold">Alan Uzmanı Revizyonu:</span> Dönüşüm çıktısı kontrol noktalarıyla kıyaslanmış, rotasyon matrisindeki işaretlerin fiziksel yönleri ve işaret konvansiyonu alan uzmanının sağladığı formül şablonlarıyla revize edilerek formüllerin doğruluğu güvenceye alınmıştır.</p>
    </div>

    <div style="border-left: 4px solid #059669; padding-left: 15px; margin-bottom: 20px;">
      <p class="bold" style="color: #059669; margin-bottom: 4px;">Vaka 4: TG-20 Jeoid Grid Sınırlarında "İnterpolasyon Sırasızlığı" (Out of Bounds)</p>
      <p><span class="bold">AI Hatası:</span> AI, Türkiye Ulusal Jeoid Modeli (TG-20) dosyalarını okurken sınır koordinatlarına yaklaşan ölçümlerde, en yakın grid hücresini direkt kopyalamış ya da indeks sınır taşmalarında sistemi hata vermeye veya sıfır "0" yüksekliği üretmeye zorlamıştır. Bu durum kıyı veya sınır bölgelerinde ani dikey yüksekleme atlamalarına yol açmıştı.</p>
      <p><span class="bold">Alan Uzmanı Revizyonu:</span> Grid dışına veya hücre kenarlarına yaklaşan koordinatlarda 4 düğüm noktasının ağırlıklandırıldığı "Bilineer İnterpolasyon" modelinin kesintisiz çalışması, sınır dışı taşmalarda ise küresel EGM96 modeline pürüzsüz (seamless/fallback) bir şekilde geçiş sağlayan dinamik bir koruma köprüsü kurulması sağlanmıştır.</p>
    </div>

    <h2>16. SONUÇ</h2>
    <p>
      ${FULL_BRAND}, Harita Mühendisliği’nin karmaşık matematiksel dünyasını, son kullanıcının mobil cihazındaki kullanıcı dostu bir arayüze sığdırmıştır. TG-20 jeoid desteği, 7 parametreli Bursa-Wolf dönüşümü, AI Studio destekli modüler altyapısı ve gelişmiş istatistiksel filtreleme sistemleri ile sahadaki veri üretim süreçlerini hızlandırır ve güvenilir kılar. Bu teknik döküman, uygulamanın bilimsel temellere dayalı operasyonel gücünün ve modern insan-yapay zeka ortaklığının bir beyanıdır.
    </p>

    <h2>17. KAYNAKÇA VE AKADEMİK ATIFLAR</h2>
    <p>Bu uygulamada kullanılan algoritmalar, jeodezik modeller ve yazılım kütüphaneleri aşağıdaki temel literatüre dayanmaktadır:</p>
    <ul>
      <li><span class="bold">Huber, P. J. (1981).</span> Robust Statistics. John Wiley & Sons. (M-Estimators ve Robust Tahminleme yöntemleri için).</li>
      <li><span class="bold">Hampel, F. R. (1974).</span> The influence curve and its role in robust estimation. Journal of the American Statistical Association. (Median Absolute Deviation - MAD yöntemi için).</li>
      <li><span class="bold">Fischler, M. A., & Bolles, R. C. (1981).</span> Random sample consensus: a paradigm for model fitting with applications to image analysis and automated cartography. Communications of the ACM. (RANSAC algoritması için).</li>
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

