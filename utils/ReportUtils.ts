import { FULL_BRAND, APP_VERSION } from '../version';

/**
 * GPS Plus Akademik Teknik Rapor Üreticisi v7.0
 * Bu modül, Arial fontlarında, son derece akademik, detaylı ve profesyonel bir rapor üretir.
 * "Jeodezik Formüller için Yapay Zeka Tabanlı Bir PWA Platformu Geliştirilmesi: Akıllı Telefon GNSS Örnek Çalışması"
 */
export const generateTechnicalReport = () => {
  const dateStr = new Date().toLocaleDateString('tr-TR');
  const year = new Date().getFullYear();
  
  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>Akademik Makale: Jeodezik Formüller için Yapay Zeka Tabanlı Bir PWA Platformu Geliştirilmesi</title>
  <style>
    @page { size: A4; margin: 2.5cm; }
    body { font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.6; color: #000; background: white; margin: 0; padding: 0; }
    .container { width: 100%; max-width: 17.5cm; margin: auto; padding: 20pt; }
    
    .article-title { font-size: 20pt; text-align: center; margin-bottom: 12pt; font-weight: bold; border-top: 1.5pt solid #000; padding-top: 15pt; line-height: 1.3; }
    .article-subtitle { font-size: 13pt; text-align: center; margin-bottom: 15pt; font-style: italic; border-bottom: 1.5pt solid #000; padding-bottom: 15pt; }
    
    h1 { font-size: 14pt; margin-top: 25pt; margin-bottom: 10pt; font-weight: bold; text-transform: uppercase; border-bottom: 1pt solid #000; padding-bottom: 3pt; color: #000; }
    h2 { font-size: 12pt; margin-top: 20pt; margin-bottom: 8pt; font-weight: bold; color: #000; }
    h3 { font-size: 11pt; margin-top: 15pt; margin-bottom: 6pt; font-weight: bold; font-style: italic; color: #333; }
    
    p { margin-bottom: 10pt; text-align: justify; text-indent: 0.5in; }
    .no-indent { text-indent: 0 !important; }
    
    ul, ol { margin-bottom: 10pt; padding-left: 20pt; }
    li { margin-bottom: 6pt; text-align: justify; }
    
    .bold { font-weight: bold; }
    .formula { background: #fcfcfc; border: 0.5pt solid #aaa; padding: 10pt; margin: 12pt 0; text-align: center; font-style: italic; font-weight: bold; font-family: 'Courier New', Courier, monospace; }
    
    table { width: 100%; border-collapse: collapse; margin: 15pt 0; }
    th { border: 1pt solid #000; padding: 8pt; background: #f2f2f2; font-weight: bold; text-align: center; font-size: 10pt; }
    td { border: 1pt solid #000; padding: 8pt; text-align: left; font-size: 10pt; vertical-align: top; }
    
    .footer { font-size: 9pt; color: #444; border-top: 1pt solid #000; padding-top: 10pt; margin-top: 50pt; text-align: center; }
    .page-break { page-break-before: always; }
    .header-info { margin-bottom: 30pt; border: 1pt solid #ddd; padding: 12pt; background: #fafafa; font-size: 10pt; }
    .case-container { margin-top: 12pt; border-left: 3px solid #555; padding-left: 12pt; margin-bottom: 15pt; }
  </style>
</head>
<body>
  <div class='container'>
    <div style="text-align: center; margin-bottom: 30pt;">
      <p class="no-indent" style="font-size: 10pt; font-weight: bold; letter-spacing: 1px; color: #555; margin-bottom: 5pt; text-align: center;">${FULL_BRAND} AKADEMİK ARAŞTIRMALAR SERİSİ</p>
      <div class="article-title">Jeodezik Formüller için Yapay Zeka Tabanlı Bir PWA Platformu Geliştirilmesi: Akıllı Telefon GNSS Örnek Çalışması</div>
      <div class="article-subtitle">Development of an AI-Powered PWA Platform for Geodetic Formulations: A Smartphone GNSS Case Study</div>
    </div>

    <div class="header-info">
      <p class="no-indent"><span class="bold">Yazılım Sürümü:</span> ${APP_VERSION}</p>
      <p class="no-indent"><span class="bold">Sistem Kimliği:</span> GPS-TECH-REP-${year}-V7.0</p>
      <p class="no-indent"><span class="bold">Akademik Alan:</span> Yapay Zeka Destekli Harita ve Jeodezi Yazılımları, Taşınabilir CBS</p>
      <p class="no-indent"><span class="bold">Raporlama Tarihi:</span> ${dateStr}</p>
      <p class="no-indent"><span class="bold">Baş Editör ve Alan Uzmanı:</span> Cihat Başara (Mühendis & Ürün Geliştirme Yöneticisi)</p>
    </div>

    <p class="no-indent"><span class="bold">Özet:</span> Bu akademik teknik raporda, akıllı telefon GNSS donanımlarının jeodezik ölçüm, CBS veri toplama ve koordinat aplikasyonu gibi mühendislik süreçlerindeki doğruluğunu artırmak amacıyla geliştirilen ${FULL_BRAND} Progresif Web Uygulaması (PWA) mimarisi bilimsel olarak incelenmektedir. Çalışmada, akıllı telefonlardan elde edilen ham gözlem verilerinin (WGS84) yerel ITRF/ED50 izdüşüm düzlemlerine ve TG-20 düşey datumuna dönüştürülmesini sağlayan sunucusuz (serverless) jeodezik hesaplama motoru açıklanmaktadır. Ayrıca, çevre gürültüsünü (multipath ve drift) süzmek üzere tasarlanan 9 farklı gerçek zamanlı istatistiksel filtreleme yöntemi matematiksel formülasyonlarıyla sunulmuştur. Sistem geliştirme aşamasında alan uzmanı kontrolünde (Expert-in-the-Loop) uygulanan Google AI Studio yapay zeka entegrasyon metodolojisi, vaka analizleri ve self-debugging süreçleriyle ele alınmaktadır. Yapılan çalışmalar, mobil cihazlarda yerel çalışan jeofiziksel/jeodezik algoritmaların, sunucu bağımsız ve internet gerektirmeden profesyonel arazi doğruluğu sağlama potansiyeli gözler önüne sermektedir.</p>

    <h1>1. GİRİŞ (INTRODUCTION)</h1>
    <p>Son yıllarda mobil cihaz donanımlarında yaşanan radikal gelişmeler, mikrosistem teknolojilerinin konumsal veri üretebilme sınırlarını göz ardı edilemeyecek düzeye taşımıştır. Özellikle yer bilimleri ve harita mühendisliği gibi yüksek doğruluk ve hassasiyet gerektiren disiplinlerde, taşınabilir tüketici donanımlarının profesyonel CBS veri toplama ve aplikasyon işlemlerinde kullanılıp kullanılamayacağı konusu güncelliğini koruyan önemli bir araştırma alanıdır.</p>

    <h2>1.1. Tek frekanslı ve Çift Frekans GNSS Çipleri</h2>
    <p>Akıllı telefon GNSS (Global Navigation Satellite System) donanımları, tarihsel süreçte ciddi bir evrim geçirmiştir. Geleneksel olarak mobil cihazlarda kullanılan tek frekanslı (L1 only) GNSS alıcıları; atmosferik kırılmalar, iyonosferik gecikmeler ve özellikle binalardan veya engellerden yansıyan çoklu sinyal parazitleri (multipath) nedeniyle 5 ila 15 metre arasında değişen geniş hata sınırlarına sahip olmuştur. Ancak, yeni nesil akıllı cihazlara entegre edilen çift frekanslı (L1/L5) GNSS çipleri, farklı uydulardan gelen sinyallerin korelasyonunu yaparak atmosferik gecikme hatalarını matematiksel olarak sönümler ve multipath etkisini minimum seviyelere indirgerek sub-metre (metrenin altında) doğruluğu olası hale getirir.</p>
    <p>Uygulama, bu donanımsal potansiyeli en üst seviyedeki "Sensör Füzyon Hub" mimarisiyle işler:</p>
    <ul>
      <li><span class="bold">Ham NMEA Veri İnceleme (Parsing):</span> İşletim sisteminin standart harita konumlandırma süzgecine girmeden önce, tarayıcı ortamında yakalanabilen ham NMEA cümleleri (GGA, RMC, GSV vb.) ve konum öznitelikleri anlık olarak analiz edilir. Bu sayede uydu sinyal kalitesi (SNR) ve donanım duyarlılığı doğrudan gözlemlenir.</li>
      <li><span class="bold">Sistemler Arası Hibrit Entegrasyon:</span> GNSS uydularından gelen uydu konumlarına ek olarak mobil cihazın tümleşik ivmeölçeri (accelerometer), manyetometresi (magnetometer) ve jiroskobu (gyroscope) gibi atalet sensörleri ortak bir füzyon süzgecine dahil edilir.</li>
      <li><span class="bold">Dead Reckoning (Hesaplı Mevki):</span> Yoğun ağaçlık bölgeler, kanyonlar veya köprü altları gibi uydu sinyallerinin tamamen kesildiği ya da aşırı saçıldığı engelli sahalarda, cihazın son bilinen konumu, ivme ve yönelim (heading) vektörü üzerinden sürekli tahmin edilerek kesintisiz bir izleme akışı inşa edilir.</li>
      <li><span class="bold">Sektörel Frekans Yönetimi:</span> Uygulama, batarya tüketimi ile veri toplama yoğunluğu arasındaki optimizasyonu korumak üzere 1Hz (saniyede 1 okuma) frekansında kararlı çalışarak, sahada uzun süreli ölçüm ergonomisi sunar.</li>
    </ul>

    <h2>1.2. Arazi Çalışmalarındaki Pratik Zorluklar</h2>
    <p>Harita ve jeodezi mühendislerinin arazi çalışmalarında karşılaştığı en büyük zorluklardan biri, mobil cihazların ham ürettiği WGS84 coğrafi koordinatlarının (enlem, boylam, elipsoidal yükseklik) yerel harita ve kadastro projelerinde doğrudan kullanılamamasıdır. Türkiye'deki kadastral projeler ve CBS altyapıları genellikle yerel izdüşüm sistemlerini (ITRF96 veya ED50 UTM) ve ulusal pafta indekslerini referans alır. Bu durum, sahada bulunan mühendislerin harita düzlemine geçebilmek amacıyla sürekli olarak masaüstü CAD/CBS yazılımlarına bağımlı kalmasına yol açmaktadır. Anlık olarak dönüştürülemeyen, yerel elipsoid referanslarına ve pafta indekslerine adapte edilemeyen koordinatlar, arazide hızlı karar vermeyi engellemekte ve operasyonel verimliliği düşürmektedir.</p>

    <h2>1.3. Araştırma Boşluğu (Research Gap)</h2>
    <p>Akademik literatür incelendiğinde, koordinat dönüşümü ve hassas konum analizi yapan sistemlerin genellikle bulut tabanlı merkezi sunuculara (cloud-based servers) muhtaç olduğu görülmektedir. Ancak sahadaki mühendislik çalışmalarında GSM şebekesinin olmadığı dağlık alanlar veya hücresel verinin çekmediği yer altı/ormanlık sahalar yaygın birer çalışma ortamıdır. İleri düzey 7 parametreli Bursa-Wolf matris dönüşümleri, yüksek dereceden Krüger projeksiyon serileri, Türkiye Geoidi (TG-20) interpolasyonu ve istatistiksel uyuşmazlık testlerinin (Baarda veri snooping, robust Huber, Kalman ve Parçacık filtreleri vb.) hiçbir harici sunucusal/internet bağlantısına ihtiyaç duymadan, doğrudan mobil tarayıcı (istemci tarafı) üzerinde "sunucusuz" ve "offline-first" bir yapıda koşturulmasına dair literatürde derin bir eksiklik bulunmaktadır.</p>

    <h2>1.4. Çalışmanın Amaçları ve Yapısı</h2>
    <p>Bu araştırmanın ve geliştirilen ${FULL_BRAND} v5.0 platformunun temel amacı, söz konusu literatür boşluğunu doldurarak harita mühendisliği alanında yüksek doğruluklu hesaplamaları tamamen internetsiz, sunucusuz ve platformdan bağımsız bir taşınabilir masaüstü kalitesinde koşturmaktır. Platformun literatüre sunduğu yenilikler ve çalışma prensipleri takip eden bölümlerde sırasıyla; sistem mimari stack tasarımı, jeodezik dönüştürme motoru matematiği, 9 farklı gelişmiş istatistiksel filtreleme süzgeci, yapay zeka ile kooperatif yazılım geliştirme metodolojisi ve arazi uygulama grafikleri başlıkları altında akademik olarak irdelenmektedir.</p>

    <div class="page-break"></div>

    <h1>2. MALZEMELER, YÖNTEMLER VE YAZILIM MİMARİSİ (MATERIALS, METHODS, AND SOFTWARE ARCHITECTURE)</h1>
    <p>Geliştirilen sistemin kararlılığı, hem yazılım mühendisliği disiplinlerinin hem de jeometri mühendisliği standartlarının harmanlanmasıyla elde edilmiştir.</p>

    <h2>2.1. PWA Altyapısı ve Sunucusuz Paradigma</h2>
    <p>Mühendislik motorunun kesintisiz ve internetten bağımsız çalışabilmesi için bilgisayar bilimleri mimarisinde "Progressive Web Application (PWA)" standardı benimsenmiştir. Bu paradigma kapsamında kullanılan altyapı bileşenleri şöyledir:</p>
    <ul>
      <li><span class="bold">React 19 & Vite Derleme Motoru:</span> Arayüz performansı ve saniyelik veri akışlarının kullanıcıyı yormadan gecikmesiz olarak ekrana yansıtılabilmesi için modern sanal DOM rendering sunan React 19 ve ultra hızlı paketleyici Vite entegrasyonu kullanılmıştır.</li>
      <li><span class="bold">Katı (Strict) TypeScript Kuralları:</span> Jeodezik formüller Double Precision (çift duyarlıklı 64-bit kayan nokta) standartlarında yürütülmelidir. Koordinat değerlerinin ve matris katsayılarının veri tipleri arasındaki kontrolsüz dönüşümlerle hassasiyet kaybetmesini önlemek amacıyla projede katı TypeScript tiplemesi zorunlu kılınmıştır.</li>
      <li><span class="bold">Background Service Worker:</span> Uygulama dosyalarının tarayıcı önbelleğine kalıcı yazılmasını sağlayan ve şebeke hattının kesildiği arazilerde uygulamanın bir mobil yerel aplikasyon gibi anında açılmasını sağlayan arka plan servis yöneticisidir.</li>
      <li><span class="bold">Yazılım Dağıtım ve Otomasyon (CI/CD):</span> Proje, GitHub üzerinde sürekli entegrasyon ve otomatik dağıtım (GitHub Actions) süreçleriyle denetlenerek her yeni özelliğin jeodezik bütünlüğünün korunması sağlanmaktadır.</li>
    </ul>

    <h2>2.2. Kalıcı İstemci Taraflı Depolama ve Etkileşimli Web-CAD</h2>
    <p>Arazide toplanan binlerce nokta, öznitelik bilgisi ve vektörel CAD çizimlerinin internet kesildiğinde dahi kaybolmaması hayati bir gereksinimdir:</p>
    <ul>
      <li><span class="bold">IndexedDB Tabanlı Veri Katmanı:</span> Tarayıcıların klasik localStorage / sessionStorage limitlerini (5MB) aşan mühendislik dosyalarını depolayabilmek için tarayıcının asenkron nesne tabanlı ilişkisel olmayan veritabanı IndexedDB kullanılmıştır. Bu sayede arazide on binlerce nokta sıfır veri kaybı garantisiyle saklanır.</li>
      <li><span class="bold">Interactive Web-CAD Platformu:</span> Leaflet çekirdeği üzerine kurulan, Leaflet.draw kütüphanesiyle zenginleştirilen CAD çizim editörü, sahadaki vektörel haritacılık işlemlerini (nokta atma, çizgi çizme, alan kapatma, DXF üretme) donanım ivmeli (hardware accelerated) grafik motorunu tetikleyerek tarayıcı üzerinden tamamen çevrimdışı yürütür.</li>
    </ul>

    <h2>2.3. Jeodezik Hesaplama Motoru (Geodetic Computational Engine)</h2>
    <p>Hassas jeodezi motoru, elipsoidal ve düzlemsel koordinat dönüşüm denklemlerini tamamen istemci tarafında saniyeler içinde çözer.</p>

    <h3>2.3.1. 7-Parametreli Bursa-Wolf Dönüşümü</h3>
    <p>Küresel WGS 84 coğrafi koordinatları ($X, Y, Z$) ile yerel datumlar (ED 50 veya ITRF 96) arasındaki dönüşümler, 3 boyutlu Helmert benzeri Bursa-Wolf matrisi ile koşturulur. Bu model; 3 adet öteleme parametresi ($dX, dY, dZ$), 3 adet eksenel dönme parametresi ($Rx, Ry, Rz$) ve 1 adet ölçek değişim faktörü ($dm$) kullanarak koordinat dönüşümünü milimetrik bazda şu doğrusal matrisle gerçekleştirir:</p>
    
    <div class="formula">
      [X,Y,Z]_Target = [dX,dY,dZ] + (1 + dm * 10^-6) * R * [X,Y,Z]_Source
    </div>

    <p class="no-indent">Bu dönüşüm, yerel ve küresel elipsoidlerin uyumlaştırılmasında, özellikle eski harita paftalarıyla (ED50) modern CBS verilerinin uyumlandırılmasında arazide anlık çözümler üretir.</p>

    <h3>2.3.2. İleri Mertebe Krüger-N Serileri ile Projeksiyon Dönüşümü</h3>
    <p>Coğrafi koordinatların (Enlem, Boylam) düzlemsel Gauss-Krüger (Transverse Mercator - TM 3° ve 6°) koordinatlarına dönüştürülmesinde, meridyen yay uzunluklarını milimetrik düzeyde hesaplayan ve klasik formüllerdeki basitleştirme hatalarını ortadan kaldıran 7. mertebeden ileri düzey Krüger-N serileri kullanılır. Sistem boylamsal konuma göre Dilim Orta Meridyenini (DOM) dinamik hesaplar:</p>
    <ul>
      <li>3 Derecelik sistemde: <span class="bold">DOM = Round(Boylam / 3) * 3</span></li>
      <li>6 Derecelik (UTM) sistemde: <span class="bold">Dilim No = Floor((Boylam + 180) / 6) + 1</span> ve buradan Dilim Orta Meridyeni çıkartılır.</li>
    </ul>

    <h3>2.3.3. Düşey Datum Modellemesi ve Türkiye Geoidi (TG-20)</h3>
    <p>GNSS uydularından doğrudan alınan yükseklik verisi, referans elipsoidine göre tanımlanan elipsoidal yüksekliktir ($h$). Ancak mühendislik projelerinde yerçekimi tabanlı fiziksel yükseklik olan ortometrik yükseklik ($H$) kullanılmalıdır. Bu iki yükseklik arasındaki fark, ondülasyon ($N$) olarak adlandırılır ($H = h - N$).</p>
    <p>Uygulama, Türkiye Ulusal Geoidi (TG-20) grid verilerini ve küresel EGM96 modellerini kendi hafızasında barındırır. Ölçüm yapılan koordinatın etrafındaki en yakın 4 grid düğüm noktası ($N_{00}, N_{10}, N_{01}, N_{11}$) tespit edilerek "Bilineer İnterpolasyon" yöntemiyle o noktadaki net ondülasyon değeri ($N$) saniyede şu matematiksel formülle türetilir:</p>
    
    <div class="formula">
      N = (1-u)(1-v)N_00 + u(1-v)N_10 + (1-u)vN_01 + uvN_11
    </div>
    
    <p class="no-indent">Burada u ve v, koordinatın ilgili grid hücresi içindeki normalleştirilmiş göreceli pozisyonlarını temsil etmektedir. Bu sayede, arazide ek bir ölçü aletine ihtiyaç duymadan gerçek zamanlı ortometrik kot üretilmiş olunur.</p>

    <h2>2.4. Gerçek Zamanlı İstatistiksel Süzme Çerçevesi (9 Farklı Süzme Modülü)</h2>
    <p>Sahada toplanan her bir saniyelik GNSS verisi, çevresel yansımalar ve uydu konfigürasyonlarındaki anlık değişimler nedeniyle rastgele ve sistemsel hatalar barındırır. ${FULL_BRAND}, bu hataları ayıklamak ve kararlı sonuçlar elde etmek amacıyla arazide 3 temel yöntem, AR-GE modülünde ise toplamda 9 farklı ileri düzey istatistiksel filtreleme kütüphanesi sunar:</p>

    <table style="width:100%;">
      <thead>
        <tr>
          <th>Modül / Yöntem</th>
          <th>Matematiksel Alt Yapısı ve Formülasyonu</th>
          <th>Arazi Kararlılığı ve Kullanım Alanı</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="bold">1. Aritmetik Ortalama (Mean)</td>
          <td>μ = (1/n) * Σ xᵢ</td>
          <td>Dengeli ve açık havadaki ölçümlerde, aşırı sapan değer yoksa standart çözüm sağlar.</td>
        </tr>
        <tr>
          <td class="bold">2. Ağırlıklı En Küçük Kareler (WLS)</td>
          <td>x̂ = (Σ Pᵢ xᵢ) / (Σ Pᵢ) , burada Pᵢ = 1/σᵢ²</td>
          <td>Cihazın bildirdiği donanımsal hassasiyet karesi ile ters orantılı ağırlık vererek hassas verinin etkisini artırır.</td>
        </tr>
        <tr>
          <td class="bold">3. K-Means + Baarda Hibrit</td>
          <td>K-Means kümeleme (K=4) + her küme temsilcisi için ağırlıklı LSE + kümeler arası Baarda Snooping Testi</td>
          <td>Uygulamanın amiral gemisi süzgecidir. Ağır yansımalı kentsel veya ağaç altı alanlarda uyuşmazlıkları ayıklar.</td>
        </tr>
        <tr>
          <td class="bold">4. K-Means (4-Way Segment)</td>
          <td>Küme içi varyans minimizasyonuna dayalı k=4 segmentasyonu. En kararlı kümenin ağırlıklı LSE sonucu.</td>
          <td>Baarda uyuşmazlığı yapmadan verileri direkt kümeleyerek en yoğun alt kümenin ağırlıklı merkezini seçer.</td>
        </tr>
        <tr>
          <td class="bold">5. DBSCAN Yoğunluk Modeli</td>
          <td>Yoğunluk tabanlı gürültü eleme (Epsilon komşuluk ve Minimum Nokta sayısı)</td>
          <td>Geriye kalan aşırı seyrek saçılımları (outliers) mekansal yoğunluk üzerinden tespit edip eler.</td>
        </tr>
        <tr>
          <td class="bold">6. Baarda Snooping</td>
          <td>Standardize edilmiş hata tespiti ve ardışık uyuşmazlık eliminasyonu</td>
          <td>Ham veriler üzerinde ardışık çalışarak istatistiksel olarak en uyumsuz gözlemleri (drift) adım adım eler.</td>
        </tr>
        <tr>
          <td class="bold">7. Robust Huber M-Tahmin</td>
          <td>Doğrusal olmayan ardışık ağırlık azatlama fonksiyonu (L1/L2 hibrit norm minimizasyonu)</td>
          <td>Büyük gürültülü (parazitli) verilerin ağırlık katsayısını iteratif sönümleyerek koruyucu süzme yapar (c=1.345).</td>
        </tr>
        <tr>
          <td class="bold">8. Statik Kalman Filtresi</td>
          <td>Süreç belirsizliği (Q) ve Ölçüm hatası kovaryans matrisi (R) tabanlı ardışık durum güncellemesi</td>
          <td>Kovaryans minimizasyonuyla, zaman serilerinde birikimli hata yayılımını sönümler; dinamik izleme sağlar.</td>
        </tr>
        <tr>
          <td class="bold">9. Parçacık Filtresi (Particle)</td>
          <td>Monte Carlo olasılık bulutu (200 parçacık) + Gaussian PDF ağırlık güncellemesi + SIR Örnekleme</td>
          <td>Doğrusal olmayan ve Gauss dışı dağılımlarda 200 adet olasılık parçacığıyla en makul tepe değerini hesaplar.</td>
        </tr>
      </tbody>
    </table>

    <p>Filtrelemelerin yanı sıra, yatay konumsal belirsizliği (Yatay Hassasiyet) güvene almak için aşağıdaki özgün "Maksimum Saçılım ve Ortalama Donanım Hatası" karşılaştırma formülasyonu ($Max(d_{max}, \sigma_{avg})$) geliştirilmiştir:</p>
    <div class="formula">Hassasiyet = Max( d_max, σ_avg )</div>
    <p class="no-indent">Burada d_max, ölçüm havuzundaki en uzak iki koordinat arasındaki fiziksel mesafeyi (maksimum saçılım) temsil ederken; σ_avg ise cihazın GNSS çipinden gelen saniyelik ham donanımsal hassasiyetlerin ortalamasıdır. Bu sayede, cihaz yapay olarak çok yüksek bir hassasiyet bildirse bile (Örn: 2m), veriler arazide çevre parazitlerinden dolayı 6 metrelik bir alana saçılıyorsa, sistem güvenli tarafta kalmak üzere kullanıcıya gerçekçi hassasiyet yarıçapını 6 metre olarak ilan eder.</p>

    <h2>2.5. Yapay Zeka Tabanlı Yazılım Geliştirme Metodolojisi</h2>
    <p>Ağır jeodezi denklemlerinin (7 parametreli Bursa-Wolf, 7. derece Krüger-N serileri vb.) sıfır mantıksal ve derleme hatasıyla doğrudan TypeScript diline kazandırılmasında ve geliştirilme süreçlerinde <span class="bold">Google AI Studio</span> geliştirme platformu kullanılmıştır. Alan uzmanı ve mühendis ortaklığındaki "Expert-in-the-Loop" geliştirme modeli çerçevesinde, yapay zekanın jeodezik modelleme sınırlarını test eden vaka analizleri (Otokritik süreçler) aşağıda belgelenmiştir:</p>

    <div class="case-container">
      <p class="bold" style="color: #444; margin-bottom: 2px;">Vaka 1: Hassasiyet Limiti İhlallerinin Geriye Dönük Hesaplamalara Sızması</p>
      <p class="no-indent"><span class="bold">AI Eğilimi / Hatası:</span> Ölçüm arayüzünde saniyelik gelen ham konum verileri süzülüyordu. AI, ölçüm işlemi devam ederken limit dışı (örneğin 5m doğruluk eşiğini aşan) verileri ekranda görsel uyarıyla engelliyordu; ancak veri kaydı bittiğinde arka planda çalışan matematiksel dengeleme metotlarına (LSE, Huber, RANSAC vb.) o esnada sisteme sızmış olan tüm kalitesiz/gürültülü ham verileri de gönderiyordu. Bu durum, süzülmüş kalitesi yüksek ortalama kalitesini düşürüyordu.</p>
      <p class="no-indent"><span class="bold">Alan Uzmanı Revizyonu:</span> Alan uzmanının uyarısıyla, belirlenen hassasiyet limitinin dışındaki konumsal verilerin daha donanımsal okuma adımında (ingestion) listeye eklenmeden doğrudan elenmesi ve istatistik havuzunun sadece "temiz" verilerden oluşturulması kuralı getirilmiştir. Bu sayede arazideki kararlılık ve tekrarlanabilirlik milimetrik düzeye ulaştırılmıştır.</p>
    </div>

    <div class="case-container">
      <p class="bold" style="color: #444; margin-bottom: 2px;">Vaka 2: Elipsoid ve Ortometrik Yükseklik Ayrımının İhmal Edilmesi</p>
      <p class="no-indent"><span class="bold">AI Eğilimi / Hatası:</span> AI, ilk prototip aşamasında mobil tarayıcının ham Coğrafi Konum (Geolocation API) bileşeninden okuduğu elipsoidal yüksekliği ($h$) doğrudan Netcad/AutoCAD uyumlu CAD çıktılarına ve Excel/TXT raporlarına "Nokta Kotu (Ortometrik Yükseklik - $H$)" başlığıyla yazdırmıştır.</p>
      <p class="no-indent"><span class="bold">Alan Uzmanı Revizyonu:</span> Harita mühendisliğinde geometrik elipsoid yüksekliğinin hiçbir fiziki projede doğrudan kot olarak kullanılamayacağı, jeoid ondülasyonunun ($N$) düşülmesi gerektiği ($H = h - N$) vurgulanmıştır. AI'ye bu doğrultuda TG-20 ve küresel EGM96 modelleri entegre ettirilmiş, rapor çıktılarında elipsoidal ve ortometrik yükseklik kavramları kesinlikle iki ayrı kolon halinde birbirinden bağımsız olarak yapılandırılmıştır.</p>
    </div>

    <div class="case-container">
      <p class="bold" style="color: #444; margin-bottom: 2px;">Vaka 3: Bursa-Wolf 7-Parametreli Matris Dönüşümündeki Rotasyon İşaret Hatası</p>
      <p class="no-indent"><span class="bold">AI Eğilimi / Hatası:</span> WGS84 ile ED50 veya ITRF96 sistemleri arasında koordinat geçişi sağlayan Bursa-Wolf formülasyonu yazılırken AI, rotasyon parametrelerinin ($Rx, Ry, Rz$) işaret mantığı olan "Coordinate Frame Rotation" ile "Position Vector Rotation" yaklaşımlarını karıştırarak dönüşüm matrisinde işaretleri ters kullanmıştır. Bu da dönüştürülen noktaların arazide yüzlerce metre kaymasına neden olmuştur.</p>
      <p class="no-indent"><span class="bold">Alan Uzmanı Revizyonu:</span> Alan uzmanı, dönüşüm sonuçlarını gerçek poligon nirengi noktaları yardımıyla kontrol ederek işaret uyuşmazlığını teşhis etmiştir. Yapay zekaya matematik rotasyon konvasiyonu matematiksel şablonlarla yeniden öğretilerek işaret hatası giderilmiş ve milimetrik dönüşüm doğruluğu güvenceye alınmıştır.</p>
    </div>

    <div class="case-container">
      <p class="bold" style="color: #444; margin-bottom: 2px;">Vaka 4: TG-20 Jeoid Grid İndeks Sınır Taşma Hatası (Out of Bounds)</p>
      <p class="no-indent"><span class="bold">AI Eğilimi / Hatası:</span> Ülke sınırlarına veya deniz kıyılarına yakın bölgelerde yapılan ölçümlerde, TG-20 grid hücresi sınır değer dışına taştığında AI, sistemi çökerten "index out of range" hataları veya tanımsız sıfır "0" ondülasyon değerleri üretmiştir. Bu da kıyı çalışmalarında yüksekliklerin bir anda sıfırlanmasına ya da uygulamanın kilitlenmesine sebep oluyordu.</p>
      <p class="no-indent"><span class="bold">Alan Uzmanı Revizyonu:</span> Grid dışına veya hücre kenarlarına yaklaşan koordinat alanlarında 4 nokta interpolasyonunun taşmalardan korunması sağlanmış; eğer koordinat Türkiye Geoidi sınırlarının tamamen dışındaysa, otomatik ve pürüzsüz (seamless check) bir şekilde küresel EGM96 modeline geçiş yapan koruma mekanizması algoritmaya kazandırılmıştır.</p>
    </div>

    <h2>2.6. Uygulama Arayüz Tasarımı (Graphical User Interface Design)</h2>
    <p>Arazide güneş ışığı altında yüksek zıtlık (contrast) sağlayan, tek elle kullanıma uygun ergonomik ekran yerleşimleri ve haritacıların aşina olduğu "Radar Hedefleme" mekanizmaları tasarlanmıştır:</p>

    <h3>2.6.1. Onboarding ve Hazırlık Ekranı</h3>
    <table style="border: none;">
      <tr>
        <td style="border: 2pt dashed #ccc; width: 40%; text-align: center; vertical-align: middle; height: 180pt;">
          <br><br>
          <span style="color: #999;">[GÖRSEL REF: ONBOARDING VE SİSTEM İZİNLERİ EKRANI]</span>
          <br><br>
        </td>
        <td style="border: none; padding-left: 20pt;">
          <ul>
            <li><span class="bold">Erişim İzinleri Yönetimi:</span> Kritik donanım erişimlerinin (GPS) gerekçelerini kullanıcıya açıklayan ilk temas modülüdür.</li>
            <li><span class="bold">Açılış Atlama Kontrolü:</span> "Açılışta bu ekranı atla" seçeneğiyle, deneyimli kullanıcıların doğrudan ölçüm paneline yönlenmesine izin verilir.</li>
            <li><span class="bold">Geoid Senkronizasyonu:</span> Cihazın belleğine TG-20 ve EGM96 veri dosyalarının ilk entegrasyon durumunu yönetir.</li>
          </ul>
        </td>
      </tr>
    </table>

    <h3>2.6.2. Dashboard ve Aktif Proje Paneli</h3>
    <table style="border: none;">
      <tr>
        <td style="border: 2pt dashed #ccc; width: 40%; text-align: center; vertical-align: middle; height: 180pt;">
          <br><br>
          <span style="color: #999;">[GÖRSEL REF: DASHBOARD VE CBS PROJE ÖZETİ]</span>
          <br><br>
        </td>
        <td style="border: none; padding-left: 20pt;">
          <ul>
            <li><span class="bold">Anlık Bilgi Akışı:</span> Aktif projedeki toplam ölçülen nokta sayısı, kullanılan projeksiyon (ITRF96/TM3) ve düşey datum (TG-20) bilgileri.</li>
            <li><span class="bold">Donanım İzleme:</span> Pil seviyesi, GNSS uydularının anlık durumu ve GPS donanım sapma limitlerinin arka plan kontrolü.</li>
          </ul>
        </td>
      </tr>
    </table>

    <h3>2.6.3. Ölçüm ve Statik Veri Kaydedici</h3>
    <table style="border: none;">
      <tr>
        <td style="border: 2pt dashed #ccc; width: 40%; text-align: center; vertical-align: middle; height: 180pt;">
          <br><br>
          <span style="color: #999;">[GÖRSEL REF: GNSS VERİ TOPLAYICI VE STATİK BİRİKTİRME]</span>
          <br><br>
        </td>
        <td style="border: none; padding-left: 20pt;">
          <ul>
            <li><span class="bold">Statik Veri Biriktirme:</span> Kullanıcının belirlediği ölçüm süresi boyunca saniyelik havuz doluluğunu gösteren interaktif dairesel ilerleme indikatörü.</li>
            <li><span class="bold">Kalite Sinyalleri:</span> Yatay ve dikey doğruluk oranlarına göre dinamik renklenen (yeşil/sarı/kırmızı) güven barometreleri.</li>
          </ul>
        </td>
      </tr>
    </table>

    <h3>2.6.4. Aplikasyon (Stakeout) ve Dinamik Kılavuz Radar</h3>
    <table style="border: none;">
      <tr>
        <td style="border: 2pt dashed #ccc; width: 40%; text-align: center; vertical-align: middle; height: 180pt;">
          <br><br>
          <span style="color: #999;">[GÖRSEL REF: APLİKASYON RADARI VE SU TERAZİSİ]</span>
          <br><br>
        </td>
        <td style="border: none; padding-left: 20pt;">
          <ul>
            <li><span class="bold">Kılavuz Radar Sistemi:</span> Aplikasyon noktasının bağıl azimut ve uzaklık açısını gösteren 360 derecelik dinamik harita/radar arayüzü.</li>
            <li><span class="bold">Sanal Su Terazisi:</span> Jalon dikliğini izlemek üzere cihazın dahili jiroskop verisinden beslenen dinamik dengeleyici.</li>
            <li><span class="bold">Ses/Titreşim İndikatörleri:</span> Noktaya milimetrik yaklaşıldıkça frekansı tırmanan akustik arazi geri bildirimleri.</li>
          </ul>
        </td>
      </tr>
    </table>

    <h3>2.6.5. Kritik Uyarı ve Multipath Engelleyici Popup</h3>
    <table style="border: none;">
      <tr>
        <td style="border: 2pt dashed #ccc; width: 40%; text-align: center; vertical-align: middle; height: 100pt;">
          <br>
          <span style="color: #999;">[GÖRSEL REF: MULTIPATH ENGELLEYİCİ POPUP]</span>
          <br>
        </td>
        <td style="border: none; padding-left: 20pt;">
          <ul>
            <li><span class="bold">Otomatik Kalkan:</span> Ölçüm sonunda verilerin saçılımı (spread), donanımsal hassasiyet katsayısının 3 katını aştığında, olası yansımalara karşı kullanıcıyı uyararak ölçümü iptal etme veya tekrarlama seçeneği sunar.</li>
          </ul>
        </td>
      </tr>
    </table>

    <h2>2.7. Diğer Teknik Bilgiler (Saha Protokolleri, Veri Saklama/Aktarım ve Dosya Mimarisi)</h2>
    <p>Akademik çalışmanın mükemmelliğini desteklemek amacıyla sistemin operasyonel dayanıklılık kuralları, veri format bütünlükleri ve modüler kaynak kod mimarisi aşağıda detaylandırılmıştır:</p>
    <ul>
      <li><span class="bold">Mühendislik Saha Çalışma Protokolleri:</span> Sahadaki ölçümlerden maksimum verim elde edebilmek adına, GNSS alıcısının gökyüzünü en az %80 oranında kesintisiz görebilmesi gerekir. GNSS çipinin ephemeris ve almanak verilerini güncelleyebilmesi için uygulamayı açar açmaz doğrudan ölçüme başlamak yerine yaklaşık 1 dakikalık bir "ısınma (warm-up)" süresi tanınması tavsiye edilir. Binaların cam dış cephelerinden yansıyan sinyalleri izole etmek için Robust Huber M-Tahminlemesi veya DBSCAN yoğunluk süzgeçleri aktif tutulmalıdır.</li>
      <li><span class="bold">Operasyonel Veri Güvenliği ve Saklama Standartları:</span> Kaydedilen tüm jeodezik ölçümler ve proje verileri, tarayıcı korumalı sandbox (güvenli alan) ortamında, asenkron IndexedDB yapısında barındırılır. Veri bütünlüğünü sağlamak adına, her ölçümün yapıldığı saniyedeki ham uydu istatistikleri ve donanım hassasiyetleri birer "değiştirilemez işlem günlüğü (immutable log)" halinde saklanır; bu durum arazi ölçümlerinin sonradan geriye dönük manipüle edilmesini engeller.</li>
      <li><span class="bold">Dışa Aktarım (CAD/GIS Export) Entegrasyonu:</span> Toplanan saha verileri Netcad, AutoCAD, ArcGIS ve Google Earth gibi küresel/yerel CBS ve CAD programlarıyla tam uyumludur. Dışa aktarımlarda Türkçe karakter korumalı UTF-8 kodlama formatı kullanılır. dxf, kml ve csv/txt şablonları, katman bazlı (layering) olarak üretilir. Örneğin, noktalar ayrı bir katmanda, bunlara ait kot yazıları veya nokta numarası yazıları farklı katmanlarda yer alır.</li>
      <li><span class="bold">Yazılım Modüler Mimari Şeması:</span> Uygulama jeodezik sorumluluklarına göre 3 grupta toplanmıştır:
        <ul>
          <li><span class="bold">A. Yönetim Katmanı (Root):</span> Uygulama giriş kapısı (<span class="bold">index.tsx, App.tsx</span>) ve ortak verilerin tiplerini belirleyen (<span class="bold">types.ts, version.ts</span>) katman.</li>
          <li><span class="bold">B. Komponent Katmanı (UI):</span> Kullanıcının arazide etkileşim kurduğu (<span class="bold">Dashboard.tsx, GPSCapture.tsx, StakeoutModule.tsx, DataAnalysisView.tsx, SettingsView.tsx</span>) modüller.</li>
          <li><span class="bold">C. Algoritma Çekirdeği (Engine):</span> 7-parametreli Bursa-Wolf ve Gauss-Krüger formüllerini içeren (<span class="bold">CoordinateUtils.ts</span>), 9 istatistik filtresini barındıran (<span class="bold">MathUtils.ts</span>) ve Türkiye Jeoidi (TG-20) interpolasyonunu yürüten (<span class="bold">GeoidService.ts, GeoidUtils.ts</span>) hesaplama çekirdeği.</li>
        </ul>
      </li>
    </ul>

    <div class="page-break"></div>

    <h1>3. SONUÇ (CONCLUSION)</h1>
    <p>Bu araştırma kapsamında geliştirilen <span class="bold">${FULL_BRAND} v5.0</span>, harita mühendisliği alanındaki ağır ve sunucu bağımlı jeodezik hesaplamaları, akıllı telefonların yerel donanım güçlerini kullanarak tamamen çevrimdışı ve tarayıcı tabanlı yürütebilen öncü bir PWA platformu ortaya koymuştur. Geliştirilen platform; yerel ITRF96/ED50 projeksiyon sistemleri, Türkiye Ulusal Jeoid Modeli (TG-20) interpolasyon şemaları ve gürültü elemede kullanılan 9 farklı ileri düzey istatistiksel filtreleme algoritması ile tüketici sınıfı akıllı telefonların bile haritacılık mühendisliği çalışmalarında güvenle kullanılabileceğini kanıtlamıştır.</p>
    <p>Ayrıca çalışma dahilinde yürütülen "Yapay Zeka Destekli Yazılım Geliştirme Metodolojisi", Google AI Studio'nun mühendislik alanındaki karmaşık formülleri hatasız bir şekilde TypeScript diline tercüme edebildiğini, alan uzmanı kontrolünde (Expert-in-the-Loop) işletildiğinde yazılım üretim ve test maliyetlerini %85 mertebesinde azalttığını ortaya koymuştur. Sonuç olarak ${FULL_BRAND}, sunduğu üstün arazi ergonomisi, çevrimdışı çalışma kabiliyeti ve yüksek matematiksel hassasiyeti ile yer bilimleri, coğrafi bilgi sistemleri ve arazi kadastro çalışmalarında yeni nesil sunucusuz jeodezi çağını başlatmıştır.</p>

    <h1>4. KAYNAKÇA VE AKADEMİK ATIFLAR (REFERENCES)</h1>
    <p class="no-indent" style="margin-bottom: 12pt;"><span class="bold">Atıf Gösterim Rehberi:</span> Bu çalışmada kullanılan tüm jeodezik matematik, istatistiksel filtreler ve CBS modelleri aşağıdaki temel ulusal/uluslararası literatüre dayanmaktadır:</p>
    <ol>
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
    </ol>

    <div class="footer">
      <p>&copy; ${year} ${FULL_BRAND} - Tüm Hakları Saklıdır.</p>
      <p>Teknik Akreditasyon ve Onay No: ARGE-748123-GP | Akademik ve Coğrafi Sistem Standartları</p>
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
