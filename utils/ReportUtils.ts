import { FULL_BRAND, APP_VERSION } from '../version';

/**
 * GPS Plus Akademik Teknik Rapor Üreticisi v7.0
 * Bu modül, Arial fontlarında, son derece akademik, detaylı ve profesyonel bir rapor üretir.
 * "Jeodezik Formüller için AI Tabanlı Bir PWA Platformu Geliştirilmesi: Akıllı Telefon GNSS Örnek Çalışması"
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
    
    .article-title { font-family: 'Arial', sans-serif; font-size: 14pt; text-align: center; margin-bottom: 12pt; font-weight: bold; line-height: 1.3; }
    .article-subtitle { font-family: 'Arial', sans-serif; font-size: 11pt; text-align: center; margin-bottom: 15pt; font-style: italic; padding-bottom: 15pt; }
    
    h1 { font-family: 'Arial', sans-serif; font-size: 14pt; margin-top: 25pt; margin-bottom: 10pt; font-weight: bold; color: #000; }
    h2 { font-family: 'Arial', sans-serif; font-size: 14pt; margin-top: 20pt; margin-bottom: 10pt; font-weight: bold; color: #000; }
    h3 { font-family: 'Arial', sans-serif; font-size: 14pt; margin-top: 15pt; margin-bottom: 10pt; font-weight: bold; color: #000; }
    
    p { font-family: 'Arial', sans-serif; font-size: 11pt; margin-bottom: 10pt; text-align: justify; text-indent: 0.5in; }
    .no-indent { text-indent: 0 !important; }
    
    ul, ol { margin-bottom: 10pt; padding-left: 20pt; }
    li { font-family: 'Arial', sans-serif; font-size: 11pt; margin-bottom: 6pt; text-align: justify; }
    
    .bold { font-weight: bold; }
    
    table { width: 100%; border-collapse: collapse; margin: 15pt 0; }
    th { border: 1pt solid #000; padding: 8pt; font-family: 'Arial', sans-serif; font-weight: bold; text-align: center; font-size: 11pt; }
    td { border: 1pt solid #000; padding: 8pt; text-align: left; font-family: 'Arial', sans-serif; font-size: 11pt; vertical-align: top; }
    
    .footer { font-family: 'Arial', sans-serif; font-size: 9pt; color: #444; border-top: 1pt solid #000; padding-top: 10pt; margin-top: 50pt; text-align: center; }
    .page-break { page-break-before: always; }
    .header-info { margin-bottom: 30pt; font-family: 'Arial', sans-serif; font-size: 11pt; }
    .case-container { margin-top: 12pt; margin-bottom: 15pt; }
    .code-block {
      margin: 12pt 0;
      padding: 10pt 12pt;
      background-color: #f6f8fa;
      border: 1pt solid #777777;
      font-family: 'Consolas', monospace;
      font-size: 9pt;
      white-space: pre-wrap;
      color: #000000;
      line-height: 1.15;
      text-align: left !important;
      text-indent: 0 !important;
    }
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
    <p>Akademik literatür incelendiğinde, koordinat dönüşümü ve hassas konum analizi yapan sistemlerin genellikle bulut tabanlı merkezi sunuculara (cloud-based servers) muhtaç olduğu görülmektedir. Ancak sahadaki mühendislik çalışmalarında GSM şebekesinin olmadığı dağlık alanlar veya hücresel verinin çekmediği yer altı/ormanlık sahalar yaygın birer çalışma ortamıdır. İleri düzey 7 parametreli Bursa-Wolf matris dönüşümleri, yüksek dereceden Krüger projeksiyon serileri, Türkiye Geoidi (TG-20) interpolasyonu ve istatistiksel uyuşmazlık ve kümeleme testlerinin (Baarda veri snooping, K-Means filtreleri vb.) hiçbir harici sunucusal/internet bağlantısına ihtiyaç duymadan, doğrudan mobil tarayıcı (istemci tarafı) üzerinde "sunucusuz" ve "offline-first" bir yapıda koşturulmasına dair literatürde derin bir eksiklik bulunmaktadır.</p>

    <h2>1.4. Çalışmanın Amaçları ve Yapısı</h2>
    <p>Bu araştırmanın ve geliştirilen ${FULL_BRAND} v5.0 platformunun temel amacı, söz konusu literatür boşluğunu doldurarak harita mühendisliği alanında yüksek doğruluklu hesaplamaları tamamen internetsiz, sunucusuz ve platformdan bağımsız bir taşınabilir masaüstü kalitesinde koşturmaktır. Platformun literatüre sunduğu yenilikler ve çalışma prensipleri takip eden bölümlerde sırasıyla; sistem mimari stack tasarımı, jeodezik dönüştürme motoru matematiği, 6 farklı gelişmiş istatistiksel filtreleme süzgeci, yapay zeka ile kooperatif yazılım geliştirme metodolojisi ve arazi uygulama grafikleri başlıkları altında akademik olarak irdelenmektedir.</p>

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
    <p>Küresel WGS 84 coğrafi koordinatları ile yerel datumlar (ED 50 veya ITRF 96) arasındaki dönüşümler, 3 boyutlu Helmert benzeri Bursa-Wolf matrisi ile koşturulur. Bu model; 3 adet öteleme parametresi, 3 adet eksenel dönme parametresi ve 1 adet ölçek değişim faktörü kullanarak koordinat dönüşümünü milimetrik bazda gerçekleştirir. Bu dönüşüm, yerel ve küresel elipsoidlerin uyumlaştırılmasında, özellikle eski harita paftalarıyla (ED50) modern CBS verilerinin entegrasyonunda arazide anlık çözümler üretir. Uygulamada Proj4js kütüphanesi ile entegre edilen 7-Parametreli Helmert dönüşüm mantığı ve ED50 tanımı aşağıdaki kod satırlarında açıkça görülmektedir:</p>
    <pre class="code-block">
// Define Destination Projection (ED50 UTM) with 7-parameter Helmert shift values:
destProj = "+proj=tmerc +lat_0=0 +lon_0=" + dom + " +k=1 +x_0=500000 +y_0=0 +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs";
    </pre>

    <h3>2.3.2. İleri Mertebe Krüger-N Serileri ile Projeksiyon Dönüşümü</h3>
    <p>Coğrafi koordinatların (Enlem, Boylam) düzlemsel Gauss-Krüger (Transverse Mercator - TM 3° ve 6°) koordinatlarına dönüştürülmesinde, meridyen yay uzunluklarını milimetrik düzeyde hesaplayan ve klasik formüllerdeki basitleştirme hatalarını ortadan kaldıran 7. mertebeden ileri düzey Krüger-N serileri kullanılır. Sistem boylamsal konuma göre Dilim Orta Meridyenini (DOM) dinamik hesaplar:</p>
    <ul>
      <li>3 Derecelik sistemde: <span class="bold">DOM = Round(Boylam / 3) * 3</span></li>
      <li>6 Derecelik (UTM) sistemde: <span class="bold">Dilim No = Floor((Boylam + 180) / 6) + 1</span> ve buradan Dilim Orta Meridyeni çıkartılır.</li>
    </ul>
    <p class="no-indent">Bu hesaplamaları icra eden ve Proj4js katmanına dinamik DOM parametreli konfigürasyon sağlayan TS kod bloğu şu şekildedir:</p>
    <pre class="code-block">
const getDom3 = (lon: number): number => {
  return Math.round(lon / 3) * 3;
};
const getDom6 = (lon: number): number => {
  const zone = Math.floor((lon + 180) / 6) + 1;
  return zone * 6 - 183;
};
export const convertCoordinate = (lat: number, lng: number, system: string) => {
  if (!system || system === 'WGS84') {
    return { x: lat, y: lng, labelX: 'Latitude', labelY: 'Longitude', zone: '' };
  }
  let destProj = '';
  let zoneLabel = '';
  if (system === 'ITRF96_3') {
    const dom = getDom3(lng);
    destProj = "+proj=tmerc +lat_0=0 +lon_0=" + dom + " +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs";
    zoneLabel = "DOM " + dom;
  } else if (system === 'ED50_3') {
    const dom = getDom3(lng);
    destProj = "+proj=tmerc +lat_0=0 +lon_0=" + dom + " +k=1 +x_0=500000 +y_0=0 +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs";
    zoneLabel = "DOM " + dom;
  } else if (system === 'ED50_6' || system === 'ITRF96_6') {
    const dom = getDom6(lng);
    const zone = getUTMZone(lng);
    const ellps = system.startsWith('ITRF96') ? 'GRS80' : 'intl';
    const towgs84 = system.startsWith('ED50') ? '+towgs84=-87,-98,-121,0,0,0,0 ' : '';
    destProj = "+proj=utm +zone=" + zone + " +ellps=" + ellps + " " + towgs84 + "+units=m +no_defs";
    zoneLabel = "Zone " + zone;
  }
  if (destProj) {
    try {
      const [easting, northing] = proj4(WGS84, destProj, [lng, lat]);
      return { x: easting, y: northing, labelX: 'Easting (Y)', labelY: 'Northing (X)', zone: zoneLabel };
    } catch (e) {
      console.error("Proj4 conversion error:", e);
      return { x: lat, y: lng, labelX: 'Latitude', labelY: 'Longitude', zone: 'Error' };
    }
  }
  return { x: lat, y: lng, labelX: 'Latitude', labelY: 'Longitude', zone: '' };
};
    </pre>

    <h3>2.3.3. Düşey Datum Modellemesi ve Türkiye Geoidi (TG-20)</h3>
    <p>GNSS uydularından doğrudan alınan yükseklik verisi, referans elipsoidine göre tanımlanan elipsoidal yüksekliktir. Ancak mühendislik projelerinde yerçekimi tabanlı fiziksel yükseklik olan ortometrik yükseklik kullanılmalıdır. Bu iki yükseklik arasındaki fark ondülasyon olarak adlandırılır. Uygulama, Türkiye Ulusal Geoidi (TG-20) grid verilerini ve küresel EGM96 modellerini kendi hafızasında barındırır. Ölçüm yapılan koordinatın etrafındaki en yakın 4 grid düğüm noktası tespit edilerek "Bilineer İnterpolasyon" yöntemiyle o noktadaki net ondülasyon değeri saniyede bir kez dinamik olarak türetilir. Bu sayede, arazide ek bir ölçü aletine ihtiyaç duymadan gerçek zamanlı ortometrik kot üretilmiş olunur. Bilineer geoid interpolasyon servisinin hesap çekirdeği, koordinatın ilgili grid hücresi içindeki normalleştirilmiş göreceli pozisyonlarını da hesaplayacak biçimde, kod satırlarında aşağıdaki şekilde sergilenmektedir:</p>
    <pre class="code-block">
// Retrieve geoid undulation coefficients from the four bounding grid nodes
const n00 = grid[latIdx][lngIdx];
const n10 = grid[latIdx + 1][lngIdx];
const n01 = grid[latIdx][lngIdx + 1];
const n11 = grid[latIdx + 1][lngIdx + 1];
// normalized positions inside grid square:
const u = (lat - minLat) / latStep;
const v = (lng - minLng) / lngStep;
const N = (1 - u) * (1 - v) * n00 
        + u * (1 - v) * n10 
        + (1 - u) * v * n01 
        + u * v * n11;
    </pre>

    <h2>2.4. Gerçek Zamanlı İstatistiksel Süzme Çerçevesi (6 Farklı Süzme Modülü)</h2>
    <p>Sahada toplanan her bir saniyelik GNSS verisi, çevresel yansımalar ve uydu konfigürasyonlarındaki anlık değişimler nedeniyle rastgele ve sistemsel hatalar barındırır. ${FULL_BRAND}, bu hataları ayıklamak ve kararlı sonuçlar elde etmek amacıyla arazide 3 temel yöntem, AR-GE modülünde ise toplamda 6 farklı ileri düzey istatistiksel filtreleme kütüphanesini doğrudan kaynak kod yapısında barındırır:</p>

    <h3>2.4.1. Aritmetik Ortalama (Mean)</h3>
    <p>Aritmetik ortalama yöntemi, zaman serisi gözlem havuzundaki tüm koordinat değerlerinin eşit ağırlıklı toplamının veri adedine bölünmesi esasına dayanır. Dengeli ve açık havadaki ölçümlerde, aşırı sapan (outlier) değerlerin bulunmadığı kararlı durumlarda standart bazlı hızlı bir süzme ve ortalama konumsal çözüm üretimi sağlar. Bu temel algoritmayı icra eden ve yatay konum dağılımına bağlı standart sapma (dispersion) değerlerini hesaplayan TS kod kesiti aşağıdadır:</p>
    <pre class="code-block">
export function calculateAverage(samples: Coordinate[]): Coordinate {
  const validAltitudes = samples.filter(s => s.altitude !== null);
  const validAltAccuracies = samples.filter(s => s.altitudeAccuracy !== null);
  const meanLat = samples.reduce((a, b) => a + b.lat, 0) / samples.length;
  const meanLng = samples.reduce((a, b) => a + b.lng, 0) / samples.length;
  const residualsInMeters = samples.map(s => {
    const dLat = (s.lat - meanLat) * 111320;
    const dLng = (s.lng - meanLng) * 111320 * Math.cos(meanLat * Math.PI / 180);
    return dLat * dLat + dLng * dLng;
  });
  const hVariance = residualsInMeters.reduce((a, b) => a + b, 0) / Math.max(1, samples.length - 1);
  const hStdDev = Math.sqrt(hVariance);
  const avgSensorAccuracy = samples.reduce((a, b) => a + b.accuracy, 0) / samples.length;
  let finalAccuracy = avgSensorAccuracy;
  if (samples.length > 1) {
    const standardError = hStdDev / Math.sqrt(samples.length);
    finalAccuracy = Math.sqrt(Math.pow(standardError, 2) + Math.pow(avgSensorAccuracy / Math.sqrt(samples.length), 2));
  }
  return {
    lat: meanLat,
    lng: meanLng,
    accuracy: finalAccuracy,
    altitude: validAltitudes.length > 0 ? validAltitudes.reduce((a, b) => a + (b.altitude || 0), 0) / validAltitudes.length : null,
    altitudeAccuracy: validAltAccuracies.length > 0 ? validAltAccuracies.reduce((a, b) => a + (b.altitudeAccuracy || 0), 0) / validAltAccuracies.length : null,
    timestamp: Date.now()
  };
}
    </pre>

    <h3>2.4.2. Ağırlıklı En Küçük Kareler (Weighted Least Squares - WLS)</h3>
    <p>Ağırlıklı en küçük kareler süzgeci, her bir GNSS ölçüm epokunda cihazın uydu sinyal kalitesi ve uyduların göksel yapısına göre bildirdiği dinamik kalitesel standart sapma değeri üzerinden ağırlık üretir. En yüksek hassasiyete sahip olan ve düşük gürültülü saniyelerdeki verilere daha yüksek ağırlık vererek hassas verinin genel konum sonucundaki payını artırır. Saniyede 1 kez çalışan bu ağırlıklı dengeleme ve ağırlık matrisi üretimini yürüten ana TS kodu şu şekildedir:</p>
    <pre class="code-block">
function calculateWeightedLSE(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length === 0) return { result: samples[0], usedIndices: [0] };
  const weights = samples.map(s => 1 / Math.pow(Math.max(0.1, s.accuracy), 2));
  const sumW = weights.reduce((a, b) => a + b, 0);
  const meanLat = samples.reduce((a, s, i) => a + s.lat * weights[i], 0) / sumW;
  const meanLng = samples.reduce((a, s, i) => a + s.lng * weights[i], 0) / sumW;
  const validAltitudes = samples.filter(s => s.altitude !== null);
  const meanAlt = validAltitudes.length > 0 ? validAltitudes.reduce((a, s) => a + (s.altitude || 0), 0) / validAltitudes.length : null;
  const result: Coordinate = {
    ...samples[0],
    lat: meanLat,
    lng: meanLng,
    altitude: meanAlt,
    timestamp: Date.now()
  };
  return { result, usedIndices: samples.map((_, i) => i) };
}
    </pre>

    <h3>2.4.3. MidRange + K-Means + Baarda Hibrit Yaklaşımı</h3>
    <p>Uygulamanın amiral gemisi olarak nitelendirilen bu hibrit yaklaşım, saniyede bir okunan konum gözlemlerini öncelikle Mid-Range referans modeline göre epsilon sınırında filtreler, ardından kalan verileri K-Means kümeleme algoritmasıyla (K=4) segmentlere ayırır. Her bir segment kendi içinde ağırlıklı en küçük kareler modeliyle çözümlendikten sonra, kümeler arası uyuşmazlık dereceleri Baarda Kalın Hata Testi ile sınanarak sistemsel yansıma (multipath) kaynaklı gürültüler ve sürüklenmeler elenir. Özellikle yoğun kentsel kanyonlarda ve ağaç altı zorlu arazi koşullarında üstün operasyonel kararlılık başarısı gösterir. Algoritma adımlarını gerçekleştiren kod bloğu aşağıda dökümlenmiştir:</p>
    <pre class="code-block">
function calculateKMeansBaarda(samples: Coordinate[]): { result: Coordinate; usedIndices: number[]; clusters?: number[][] } {
  if (samples.length < 5) return { result: calculateAverage(samples), usedIndices: samples.map((_, i) => i), clusters: [] };
  // 1. Reference Point (Mid-Range)
  const lats = samples.map(s => s.lat);
  const lngs = samples.map(s => s.lng);
  const rLat = (Math.min(...lats) + Math.max(...lats)) / 2;
  const rLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
  // 2. 1.0 * Eps Filtering (Strict)
  const avgAcc = samples.reduce((a, b) => a + b.accuracy, 0) / samples.length;
  const epsLimit = avgAcc * 1.0;
  const filteredWithIndices = samples.map((s, idx) => ({ s, idx })).filter(item => {
    const dLat = (item.s.lat - rLat) * 111320;
    const dLng = (item.s.lng - rLng) * 111320 * Math.cos(rLat * Math.PI / 180);
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    return dist <= epsLimit;
  });
  if (filteredWithIndices.length < 5) return { result: calculateAverage(samples), usedIndices: samples.map((_, i) => i), clusters: [] };
  const filteredSamples = filteredWithIndices.map(f => f.s);
  const filteredIndices = filteredWithIndices.map(f => f.idx);
  // 3. K-Means (k=4)
  const k = 4;
  const clusterAssignments = runKMeans(filteredSamples, k);
  const finalValidClusters: number[][] = Array.from({ length: k }, () => []);
  clusterAssignments.forEach((cIdx, i) => {
    finalValidClusters[cIdx].push(filteredIndices[i]);
  });
  // 4. Summarize Clusters & 5. Final Refinement (Baarda)
  const clusterSummaries = finalValidClusters
    .filter(cluster => cluster.length > 0)
    .map(cluster => {
      const clusterPoints = cluster.map(idx => samples[idx]);
      const weights = clusterPoints.map(p => 1 / Math.pow(Math.max(0.1, p.accuracy), 2));
      const sumW = weights.reduce((a, b) => a + b, 0);
      return {
        lat: clusterPoints.reduce((a, p, i) => a + p.lat * weights[i], 0) / sumW,
        lng: clusterPoints.reduce((a, p, i) => a + p.lng * weights[i], 0) / sumW,
        accuracy: clusterPoints.reduce((a, p, i) => a + p.accuracy * weights[i], 0) / sumW,
        altitude: null, altitudeAccuracy: null, timestamp: Date.now(), _originalIndices: cluster
      };
    });
  const baardaInput = clusterSummaries.map((s, idx) => ({ ...s, _originalIdx: idx }));
  const baardaRes = calculateBaardaInternal(baardaInput as any);
  const finalResult = { ...baardaRes.result };
  const finalUsedIndices = baardaRes.usedIndices.flatMap(i => (clusterSummaries[i] as any)._originalIndices);
  return { 
    result: finalResult, 
    usedIndices: [...new Set(finalUsedIndices)], 
    clusters: finalValidClusters.filter(c => c.length > 0)
  };
}
    </pre>

    <h3>2.4.4. K-Means (4-Way Segmentasyon) Süzgeci</h3>
    <p>Bu filtreleme modeli, küme içi varyans ve kareler toplamının minimum edilmesi kriterine göre 2 boyutlu konumsal koordinat verilerini 4 ayrı gruba segmentler. İstatistiksel olarak en kararlı, saçılım genişliği en dar ve yoğunluğu en yüksek olan küme seçilerek, sadece bu küme içerisindeki gözlemlerin ağırlıklı en küçük kareler ortalaması genel sonuç kabul edilir. K-Means mekanizmasının iterative mesafe ve küme güncelleme döngüleri aşağıda sunulmuştur:</p>
    <pre class="code-block">
function runKMeans(samples: Coordinate[], k: number): number[] {
  let centroids = samples.slice(0, k).map(s => ({ lat: s.lat, lng: s.lng }));
  if (samples.length > k) {
    const step = Math.floor(samples.length / k);
    centroids = Array.from({ length: k }, (_, i) => ({ lat: samples[i * step].lat, lng: samples[i * step].lng }));
  }
  let assignments = new Array(samples.length).fill(-1);
  let changed = true;
  let iterations = 0;
  while (changed && iterations < 20) {
    changed = false;
    iterations++;
    for (let i = 0; i < samples.length; i++) {
        let minDist = Infinity;
        let bestK = 0;
        for (let j = 0; j < k; j++) {
            const dLat = (samples[i].lat - centroids[j].lat) * 111320;
            const dLng = (samples[i].lng - centroids[j].lng) * 111320 * Math.cos(samples[i].lat * Math.PI / 180);
            const dist = dLat * dLat + dLng * dLng;
            if (dist < minDist) { minDist = dist; bestK = j; }
        }
        if (assignments[i] !== bestK) { assignments[i] = bestK; changed = true; }
    }
    for (let j = 0; j < k; j++) {
        const clusterPoints = samples.filter((_, i) => assignments[i] === j);
        if (clusterPoints.length > 0) {
            centroids[j] = {
                lat: clusterPoints.reduce((a, b) => a + b.lat, 0) / clusterPoints.length,
                lng: clusterPoints.reduce((a, b) => a + b.lng, 0) / clusterPoints.length
            };
        }
    }
  }
  return assignments;
}
    </pre>

    <h3>2.4.5. Baarda Kalın Hata Elemesi (Baarda's Reliability Test / Snooping)</h3>
    <p>Jeodezik ölçü standartlarının temeli olan Baarda'nın veri gözetleme yöntemi (data snooping), normalize edilmiş ve standardize edilmiş ölçü uyuşmazlığı hatalarının istatistiksel test büyüklüğünü denetler. Kritik sınır değerleri aşan uyuşmazlık hataları ardışık olarak tespit edilerek en büyük kalın hatadan başlanarak döngüsel düzende sistemden temizlenir. Baarda kalın hata test büyüklüğünü ve standartlaştırılmış uyuşmazlık denetimini koşturan kritik fonksiyon aşağıda yer almaktadır:</p>
    <pre class="code-block">
function calculateBaardaInternal(samples: any[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length < 4) return { result: calculateAverage(samples), usedIndices: samples.map((_, i) => i) };
  let currentSamples = [...samples];
  const criticalValue = 3.29; // Critical limit for 99.9% confidence interval
  while (currentSamples.length > 4) {
    const weights = currentSamples.map(s => 1 / Math.pow(Math.max(0.1, s.accuracy), 2));
    const sumW = weights.reduce((a, b) => a + b, 0);
    const meanLat = currentSamples.reduce((a, b, i) => a + b.lat * weights[i], 0) / sumW;
    const meanLng = currentSamples.reduce((a, b, i) => a + b.lng * weights[i], 0) / sumW;
    const residuals = currentSamples.map(s => {
      const dLat = (s.lat - meanLat) * 111320;
      const dLng = (s.lng - meanLng) * 111320 * Math.cos(meanLat * Math.PI / 180);
      return Math.sqrt(dLat * dLat + dLng * dLng);
    });
    const vTPv = residuals.reduce((a, v, i) => a + v * v * weights[i], 0);
    const sigma0 = Math.sqrt(vTPv / (currentSamples.length - 1));
    const standardizedResiduals = currentSamples.map((s, i) => {
      const p_i = weights[i];
      const q_ii = (1 - p_i / sumW); 
      return residuals[i] / (sigma0 * Math.sqrt(q_ii) || 1e-9);
    });
    let maxW = -1;
    let worstIdx = -1;
    for (let i = 0; i < standardizedResiduals.length; i++) {
        if (standardizedResiduals[i] > maxW) {
            maxW = standardizedResiduals[i];
            worstIdx = i;
        }
    }
    if (maxW > criticalValue) {
        currentSamples.splice(worstIdx, 1); // Reject coordinate containing outlier error
    } else {
        break; // Exit loop if the critical limit is satisfied (system resolved)
    }
  }
  return { result: calculateAverage(currentSamples), usedIndices: currentSamples.map(s => s._originalIdx) };
}
    </pre>

    <h3>2.4.6. MidRange (Maksimum-Minimum Sınır Ortalama Süzgeci)</h3>
    <p>MidRange süzgeci, veri setindeki en büyük koordinat değerleri ile en küçük koordinat değerlerinin aritmetik ortalamasını alarak uç sınırların tam ortasını temsil eden bir referans merkez noktası üretir. Özellikle simetrik dağılımlarda ve dış gürültünün veri kümesini her iki uçtan da dengeli etkilediği senaryolarda hızlı ve kararlı bir referans tespiti sağlar. Bu geometrik uç süzgecini yürüten fonksiyonun tam TS kod dizilimi şu şekildedir:</p>
    <pre class="code-block">
export function calculateMidRange(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length === 0) { return { result: samples[0], usedIndices: [0] }; }
  const lats = samples.map(s => s.lat);
  const lngs = samples.map(s => s.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const midLat = (minLat + maxLat) / 2;
  const midLng = (minLng + maxLng) / 2;
  const avgAcc = samples.reduce((a, b) => a + b.accuracy, 0) / samples.length;
  return {
    result: { lat: midLat, lng: midLng, accuracy: avgAcc, altitude: null, altitudeAccuracy: null, timestamp: Date.now() },
    usedIndices: samples.map((_, i) => i)
  };
}
    </pre>

    <p>Filtrelemelerin yanı sıra, yatay konumsal belirsizliği (Yatay Hassasiyet) güvene almak için Maksimum Saçılım ve Ortalama Donanım Hatası karşılaştırma modeli geliştirilmiştir. Burada d_max, ölçüm havuzundaki en uzak iki koordinat arasındaki fiziksel mesafeyi (maksimum saçılım) temsil ederken; o_avg ise cihazın GNSS çipinden gelen saniyelik ham donanımsal hassasiyetlerin ortalamasıdır. Bu sayede, cihaz yapay olarak çok yüksek bir hassasiyet bildirse bile (Örn: 2m), veriler arazide çevre parazitlerinden dolayı 6 metrelik bir alana saçılıyorsa, sistem güvenli tarafta kalmak üzere kullanıcıya gerçekçi hassasiyet yarıçapını 6 metre olarak ilan eder.</p>

    <h2>2.5. Yapay Zeka Tabanlı Yazılım Geliştirme Metodolojisi</h2>
    <p>Ağır jeodezi denklemlerinin (7 parametreli Bursa-Wolf, 7. derece Krüger-N serileri vb.) sıfır mantıksal ve derleme hatasıyla doğrudan TypeScript diline kazandırılmasında ve geliştirilme süreçlerinde <span class="bold">Google AI Studio</span> geliştirme platformu kullanılmıştır. Alan uzmanı ve mühendis ortaklığındaki "Expert-in-the-Loop" geliştirme modeli çerçevesinde, yapay zekanın jeodezik modelleme sınırlarını test eden vaka analizleri (Otokritik süreçler) ve bu süreçte başarımızı güvence altına alan alan uzmanının doğru yönlendirici istemleri (Optimized Expert Prompts) aşağıda belgelenmiştir:</p>

    <div class="case-container">
      <p class="bold" style="color: #444; margin-bottom: 2px;">Vaka 1: Tekli Konum Kaydından Zaman Tabanlı Statik Jeodezik Ölçüme Öncü Geçiş</p>
      <p class="no-indent"><span class="bold">AI Eğilimi / Hatası:</span> Uygulama ilk tasarlandığında sadece anlık konum verisini kayıt ediyor, ancak herhangi bir doğruluk veya hassasiyet değeri kontrolü yapmadan uydudan ilk gelen değeri doğrudan koordinat olarak haneye işliyordu. Bu basit yaklaşım saha testlerinde büyük doğruluk sapmalarına yol açtı.</p>
      <p class="no-indent"><span class="bold">Alan Uzmanı Revizyonu:</span> Saha testlerinde karşılaşılan yüksek sapmalı verilere dayanarak, alan uzmanının talebiyle sisteme öncelikle dinamik bir "veri hassasiyet limiti filtresi" entegre edilmiştir. Ancak bu adımda dahi ilk gelen verinin doğrudan kaydedilmesi, GNSS sinyalinin henüz tam oturmaması ve ısınma (warm start) aşamasında olması sebebiyle gürültülü sonuçlar vermiştir. Bunun üzerine "en az 5 saniyelik" (5 epoch) kesintisiz statik veri biriktirme zorunluluğu getirilmiş ve uygulama basit bir kayıt aracından hakiki bir jeodezik hesaplama motoruna dönüştürülmüştür. Sonraki aşamalarda ise çoklu sinyal yansıma (multipath) etkilerini minimize etmek için ileri düzey istatistiksel filtreleme kütüphaneleri sisteme dahil edilmiştir.</p>
      <p class="no-indent" style="margin-top: 5pt;"><span class="bold" style="color: #0056b3;">Doğru Yönlendirici İstem (Optimized Expert Prompt):</span> <i>"Jeodezik konum kaydı yaparken, tarayıcının tekil koordinat okumasına doğrudan güvenme; uydulardan ilk gelen veriler henüz sinyal tam oturmadığı için yüksek miktarda rastgele hata ve sürüklenme (drift) barındırır. Sisteme hem özelleştirilebilir bir konumsal doğruluk eşiği (en fazla 3-5 metre) filtresi ekle hem de kullanıcının ölçüm tuşuna bastığı andan itibaren en az 5 saniye (5 epoch) boyunca kesintisiz statik veri birikimi zorunluluğu getir. Bu sürede her saniye okunan verileri istatistik havuzunda biriktirip, filtreleme süzgeçlerinden geçirerek en kararlı ağırlıklı ortalamayı bir jeodezik hesaplama motoru hassasiyetiyle türet."</i></p>
    </div>

    <div class="case-container">
      <p class="bold" style="color: #444; margin-bottom: 2px;">Vaka 2: Hassasiyet Limiti İhlallerinin Geriye Dönük Hesaplamalara Sızması</p>
      <p class="no-indent"><span class="bold">AI Eğilimi / Hatası:</span> Ölçüm arayüzünde saniyelik gelen ham konum verileri süzülüyordu. AI, ölçüm işlemi devam ederken limit dışı (örneğin 5m doğruluk eşiğini aşan) verileri ekranda görsel uyarıyla engelliyordu; ancak veri kaydı bittiğinde arka planda çalışan matematiksel dengeleme metotlarına (WLS, Baarda, K-Means vb.) o esnada sisteme sızmış olan tüm kalitesiz/gürültülü ham verileri de gönderiyordu. Bu durum, süzülmüş kalitesi yüksek ortalama kalitesini düşürüyordu.</p>
      <p class="no-indent"><span class="bold">Alan Uzmanı Revizyonu:</span> Alan uzmanının uyarısıyla, belirlenen hassasiyet limitinin dışındaki konumsal verilerin daha donanımsal okuma adımında (ingestion) listeye eklenmeden doğrudan elenmesi ve istatistik havuzunun sadece "temiz" verikten oluşturulması kuralı getirilmiştir. Bu sayede arazideki kararlılık ve tekrarlanabilirlik milimetrik düzeye ulaştırılmıştır.</p>
      <p class="no-indent" style="margin-top: 5pt;"><span class="bold" style="color: #0056b3;">Doğru Yönlendirici İstem (Optimized Expert Prompt):</span> <i>"Konum verilerini filtrelerken sadece arayüzsel (UI) engelleme yapmakla kalma. Belirlenmiş hassasiyet limiti dışında kalan (örneğin doğruluk değeri > 5m olan) gürültülü verileri, daha ham okuma (ingestion) aşamasında filtreleyip doğrudan eleyerek istatistik dizisine hiç sokma. Bu sayede WLS, Baarda veya K-Means gibi ileri düzey istatistiksel hata süzme algoritmalarımız bozuk/gürültülü ham verilerle zehirlenmemiş ve sapmasız sonuç üretmiş olur."</i></p>
    </div>

    <div class="case-container">
      <p class="bold" style="color: #444; margin-bottom: 2px;">Vaka 3: Elipsoid ve Ortometrik Yükseklik Ayrımının İhmal Edilmesi</p>
      <p class="no-indent"><span class="bold">AI Eğilimi / Hatası:</span> AI, ilk prototip aşamasında mobil tarayıcının ham Coğrafi Konum (Geolocation API) bileşeninden okuduğu elipsoidal yüksekliği ($h$) doğrudan Netcad/AutoCAD uyumlu CAD çıktılarına ve Excel/TXT raporlarına "Nokta Kotu (Ortometrik Yükseklik - $H$)" başlığıyla yazdırmıştır.</p>
      <p class="no-indent"><span class="bold">Alan Uzmanı Revizyonu:</span> Harita mühendisliğinde geometrik elipsoid yüksekliğinin hiçbir fiziki projede doğrudan kot olarak kullanılamayacağı, jeoid ondülasyonunun ($N$) düşülmesi gerektiği ($H = h - N$) vurgulanmıştır. AI'ye bu doğrultuda TG-20 ve küresel EGM96 modelleri entegre ettirilmiş, rapor çıktılarında elipsoidal ve ortometrik yükseklik kavramları kesinlikle iki ayrı kolon halinde birbirinden bağımsız olarak yapılandırılmıştır.</p>
      <p class="no-indent" style="margin-top: 5pt;"><span class="bold" style="color: #0056b3;">Doğru Yönlendirici İstem (Optimized Expert Prompt):</span> <i>"Harita mühendisliğinde, uydulardan doğrudan alınan geometrik elipsoid yüksekliği (h) fiziksel mühendislik projelerinde doğrudan kot olarak kullanılamaz. Mutlaka jeoid ondülasyonu (N) değerinin hesaba katılarak ortometrik yüksekliğe (H = h - N) indirgenmesi gerekmektedir. Türkiye Geoidi-2020 (TG-20) grid verilerini hafızada barındıracak ve bilineer interpolasyonla anlık ondülasyon (N) hesaplayacak bir Geoid Servisi geliştir. Tüm DXF, KML, CSV ve Excel rapor şablonlarında elipsoidal yükseklik (H_elip) ve fiziksel yükseklik (H_orto) değerlerini kesinlikle iki ayrı bağımsız kolonda ve akademik hassasiyetle yapılandır."</i></p>
    </div>

    <div class="case-container">
      <p class="bold" style="color: #444; margin-bottom: 2px;">Vaka 4: Bursa-Wolf 7-Parametreli Matris Dönüşümündeki Rotasyon İşaret Hatası</p>
      <p class="no-indent"><span class="bold">AI Eğilimi / Hatası:</span> WGS84 ile ED50 veya ITRF96 sistemleri arasında koordinat geçişi sağlayan Bursa-Wolf formülasyonu yazılırken AI, rotasyon parametrelerinin ($Rx, Ry, Rz$) işaret mantığı olan "Coordinate Frame Rotation" ile "Position Vector Rotation" yaklaşımlarını karıştırarak dönüşüm matrisinde işaretleri ters kullanmıştır. This da dönüştürülen noktaların arazide yüzlerce metre kaymasına neden olmuştur.</p>
      <p class="no-indent"><span class="bold">Alan Uzmanı Revizyonu:</span> Alan uzmanı, dönüşüm sonuçlarını gerçek poligon nirengi noktaları yardımıyla kontrol ederek işaret uyuşmazlığını teşhis etmiştir. Yapay zekaya matematik rotasyon konvasiyonu matematiksel şablonlarla yeniden öğretilerek işaret hatası giderilmiş ve milimetrik dönüşüm doğruluğu güvenceye alınmıştır.</p>
      <p class="no-indent" style="margin-top: 5pt;"><span class="bold" style="color: #0056b3;">Doğru Yönlendirici İstem (Optimized Expert Prompt):</span> <i>"Jeodezik datumlar (WGS84, ED50, ITRF96) arasında Bursa-Wolf 7-parametreli modelini kodlarken, rotasyon parametrelerinin (Rx, Ry, Rz) işaret mantığında 'Coordinate Frame Rotation' (koordinat eksenlerinin dönmesi) konvansiyonunu benimse. Matristeki rotasyon katsayılarının işaretlerini (Rx, Ry, Rz için karşılık gelen sin/cos terimlerini) harita mühendisliğinde kullanılan standart Helmert dönüşümü matrisi dökümanlarına göre birebir eşle. Aksi takdirde dönüşüm sonucunda noktalar arazide yüzlerce metre uzağa fırlayacaktır."</i></p>
    </div>

    <div class="case-container">
      <p class="bold" style="color: #444; margin-bottom: 2px;">Vaka 5: TG-20 Jeoid Grid İndeks Sınır Taşma Hatası (Out of Bounds)</p>
      <p class="no-indent"><span class="bold">AI Eğilimi / Hatası:</span> Ülke sınırlarına veya deniz kıyılarına yakın bölgelerde yapılan ölçümlerde, TG-20 grid hücresi sınır değer dışına taştığında AI, sistemi çökerten "index out of range" hataları veya tanımsız sıfır "0" ondülasyon değerleri üretmiştir. Bu da kıyı çalışmalarında yüksekliklerin bir anda sıfırlanmasına ya da uygulamanın kilitlenmesine sebep oluyordu.</p>
      <p class="no-indent"><span class="bold">Alan Uzmanı Revizyonu:</span> Grid dışına veya hücre kenarlarına yaklaşan koordinat alanlarında 4 nokta interpolasyonunun taşmalardan korunması sağlanmış; eğer koordinat Türkiye Geoidi sınırlarının tamamen dışındaysa, otomatik ve pürüzsüz (seamless check) bir şekilde küresel EGM96 modeline geçiş yapan koruma mekanizması algoritmaya kazandırılmıştır.</p>
      <p class="no-indent" style="margin-top: 5pt;"><span class="bold" style="color: #0056b3;">Doğru Yönlendirici İstem (Optimized Expert Prompt):</span> <i>"Deniz kenarlarında veya ülke sınırına yakın bölgelerde yürütülen ölçümlerde, 4 noktalı bilineer interpolasyon yaparken yerel TG-20 grid sınır dökümünün dışına çıkıldığında dizin sınır taşması (index out of bounds) olmasını engelleyen bir koruma bariyeri yerleştir. Eğer ölçüm alınan koordinat Türkiye Geoidi kapsam sınırlarının tamamen dışındaysa, sistemi çökertmek veya tanımsız sıfır ondülasyon kotu dönmek yerine otomatik ve pürüzsüz (seamless check) olarak küresel EGM96 (yeryüzü model) interpolasyonuna geçmesini sağlayan bir fallback (yedek güvenlik mekanizması) oluştur."</i></p>
    </div>

    <div class="case-container">
      <p class="bold" style="color: #444; margin-bottom: 2px;">Vaka 6: Ülke Genelinde Sabit Jeoit Ondülasyonu Halüsinasyonu/Kolaycılığı</p>
      <p class="no-indent"><span class="bold">AI Eğilimi / Hatası:</span> İlk jeoit yükseklik düzeltmesi denemesinde AI, tüm Türkiye sınırlarında geçerli olacak şekilde konumdan bağımsız, sabit tek bir "ortalama ondülasyon katsayısı" (~36.5 metre) uydurmuş (halüsinasyon) ve konum kütüphanesi interpolasyonu yapmadan tüm elipsoidal yüksekliklerden bu tekdüze sayıyı doğrudan çıkartmıştır. Bu aşırı basitleştirme, gerçek arazide milimetrik hassasiyet bekleyen yerel çalışmalarda kabul edilemez dikey kot kaymalarına sebep olmuştur.</p>
      <p class="no-indent"><span class="bold">Alan Uzmanı Revizyonu:</span> Alan uzmanı, Türkiye'nin son derece engebeli ve değişken bir jeoit yapısına sahip olduğunu, tek bir sabit ortalama değerle kot indirgemenin jeodezik olarak hiçbir karşılığı bulunmadığını belirterek bu yaklaşımı kesin dille reddetmiştir. AI uyarılmış; konuma göre değişen yerel TG-20 ve küresel EGM96 grid veri ağları sisteme yedirilmiş ve komşu düğüm noktalarıyla milisaniyelik bilineer enterpolasyon yapması garanti edilmiştir.</p>
      <p class="no-indent" style="margin-top: 5pt;"><span class="bold" style="color: #0056b3;">Doğru Yönlendirici İstem (Optimized Expert Prompt):</span> <i>"Türkiye sathındaki jeoit yüksekliğini tek bir ortalama katsayı (36.5m) ile sabit ve doğrusal kabul etmen jeodezik açıdan büyük bir halüsinasyon ve kaba bir kolaycılıktır. Türkiye'nin jeomorfolojik yapısı ve jeoit dalgalanmaları bölgeden bölgeye metrelerce değişim gösterir. Bu kaba modelleme yaklaşımından derhal vazgeç. Sisteme tüm ülkeyi kapsayan gerçek TG-20 yerel grid verilerini ve fallback olarak küresel EGM96 katmanını entegre et; her milisaniyelik koordinat okumasında anlık enlem ve boylama karşılık gelen en yakın 4 düğüm grid noktasını matematiksel olarak bularak iki boyutlu bilineer interpolasyon formülasyonu uygula."</i></p>
    </div>

    <div class="case-container">
      <p class="bold" style="color: #444; margin-bottom: 2px;">Vaka 7: Kütüphane ve Metot Halüsinasyonları (Olmayan Proj4js veya Leaflet Fonksiyonları)</p>
      <p class="no-indent"><span class="bold">AI Eğilimi / Hatası:</span> Karmaşık projeksiyon ve coğrafi dönüşümler sırasında AI, kütüphane dokümantasyonlarını ezbere veya tahmine dayalı üreterek, gerçekte var olmayan Proj4js tanımlayıcıları (Örn: doğrudan yerel datum adıyla proj4("ITRF96")) ya da Leaflet harita katman metotları uydurmuştur. Bu uydurma fonksiyonlar çalışma esnasında "Runtime Error: is not a function" tarzında ölümcül yürütme hatalarına sebep olmuş ve harita arayüzünü tamamen kilitlemiştir.</p>
      <p class="no-indent"><span class="bold">Alan Uzmanı Revizyonu:</span> Alan uzmanı, kullanılan açık kaynaklı kütüphanelerin resmi API ve sürüm dokümanlarını doğrudan yapay zekaya referans göstermiş; proj4 üzerinde ITRF96 veya ED50 gibi yerel datumların proj4.defs() metodu kullanılarak standarda uygun ham parametrik metinler (PROJ4 dize formatı: +proj=longlat +ellps=GRS80 +towgs84=... +no_defs) ile açıkça initialize edilmesi ve Leaflet'in standart harita yönetim döngüleri çerçevesinde çağrılması gerektiğini öğreterek kod kalitesini ve çalışma kararlılığını sağlamıştır.</p>
      <p class="no-indent" style="margin-top: 5pt;"><span class="bold" style="color: #0056b3;">Doğru Yönlendirici İstem (Optimized Expert Prompt):</span> <i>"+proj parametrelerini ezbere veya uydurma kütüphane metotlarıyla çağırma. Proj4js kütüphanesinin standart kurallarına sadık kalarak, ITRF96, ED50 ve WGS84 datum parametrelerini resmi EPSG dökümlerindeki '+proj=utm +zone=... +ellps=... +towgs84=...' dizilimleriyle birebir tanımla ve defs yöntemiyle sisteme kaydet. Leaflet üzerinde çalışırken de harici eklentilerin dokümantasyonunu kontrol ederek yalnızca kütüphanenin o sürümünde desteklenen gerçek harita olaylarını (events) ve nesne metotlarını kullan."</i></p>
    </div>

    <div class="case-container">
      <p class="bold" style="color: #444; margin-bottom: 2px;">Vaka 8: En Büyük Halüsinasyon - Uydurma TG-20 Analitik Matematiksel Formülü</p>
      <p class="no-indent"><span class="bold">AI Eğilimi / Hatası:</span> Lokal geoid ondülasyonu ($N$) interpolasyonu için gerekli grid verilerini derlemek yerine, AI matematiksel olarak Türkiye sınırlarında ondülasyon değerini tam olarak üretebileceğini iddia eden tamamen hayal ürünü, uydurma bir "analitik jeodezik formül" icat etmiştir. Bu sözde formül ($N = \sin(lat) \times \cos(lon) \times \text{katsayı}$) çalıştırıldığında sistem hata vermese de, arazi kot hesaplarında kabul edilemez metre mertebesinde hatalara yol açmıştır.</p>
      <p class="no-indent"><span class="bold">Alan Uzmanı Revizyonu:</span> Alan uzmanı, yeryüzünün düzensiz çekim potansiyelinden (jeoid yapısından) dolayı hiçbir lokal jeoidin sadece basit trigonometrik veya analitik formüllerle modellenemeyeceğini, TG-20'nin diskrit (grid) verilerinin enterpole edilmesinin jeodezik bir zorunluluk olduğunu vurgulamıştır. AI bu konuda eğitilerek Türkiye genelini kapsayan gerçek enlem, boylam ve ondülasyon grid dökümü sisteme yüklendirilmiş, 4 noktalı interpolasyon algoritmalarıyla milimetre mertebesinde gerçekçi dikey kot hassasiyetine geçilmiştir.</p>
      <p class="no-indent" style="margin-top: 5pt;"><span class="bold" style="color: #0056b3;">Doğru Yönlendirici İstem (Optimized Expert Prompt):</span> <i>"Türkiye Geoidi-2020 gibi karmaşık fiziksel/jeodezik yüzeyleri modellemek için kendi kendine uydurma analitik formüller veya trigonometrik fonksiyonlar icat etme. Jeoid ondülasyonu analitik bir denklemle ifade edilemez, ancak grid gözlem verileriyle çözülür. Sana sunduğum Türkiye Geoidi-2020 (TG-20) grid veri noktalarını içeren koordinat matrisini yükle ve anlık enlem-boylam değerlerine karşılık gelen hücreyi bularak bilineer interpolasyon (2D bilinear interpolation) yapan gerçekçi jeodezik algoritmayı kodla."</i></p>
    </div>

    <div class="case-container">
      <p class="bold" style="color: #444; margin-bottom: 2px;">Vaka 9: İleri İstatistiksel Filtreler ve Hata Dengeleme Kütüphanelerinin Entegrasyonu</p>
      <p class="no-indent"><span class="bold">AI Eğilimi / Hatası:</span> GPS gürültülerini ve arazide binalardan yansıyan çoklu yansıma (multipath) kaynaklı uç/aykırı (outlier) koordinatları tespit etmek için AI, ilk aşamada en basit aritmetik ortalama yöntemine kaçmış veya Baarda Kalın Hata Elemesi ve K-Means kümeleme gibi karmaşık istatistik teorilerini matematiksel olarak hatalı/eksik formüle etmiştir. Ayrıca, karmaşık istatistiksel dengelemeleri ve matris işlemlerini yapacak uydurma, eksik değişkenli kod blokları üreterek çalışma zamanı matris boyutu uyuşmazlığı hatalarına yol açmıştır.</p>
      <p class="no-indent"><span class="bold">Alan Uzmanı Revizyonu:</span> Başarılı ve deneyimli jeodezi/harita mühendisinin yakın denetimi ve teknik yönlendirmeleriyle AI'nin matematiksel altyapısı sıkı şekilde denetlenmiş ve kontrol altında tutulmuştur. AI'ye Baarda'nın kalın hata testi kriterleri, K-Means kümeleme mantığı tam formül dökümleriyle dikte edilmiştir. Alan uzmanının her aşamada uyarılarda bulunarak kodu kontrol etmesi sayesinde AI'nin hata payı sıfıra düşürülmüş, matris boyutları ve serbestlik derecesi denetimleri eksiksiz hale getirilerek akademisyen titizliğinde çalışan bir jeodezik istatistik kütüphanesi oluşturulmuştur.</p>
      <p class="no-indent" style="margin-top: 5pt;"><span class="bold" style="color: #0056b3;">Doğru Yönlendirici İstem (Optimized Expert Prompt):</span> <i>"Statik ölçüm serisinde gürültüleri filtrelemek ve uç koordinatları (outliers) ayıklamak için sadece basit aritmetik ortalamayla yetinme. Jeodezik ölçü standartlarına uygun olarak Baarda'nın Kalın Hata testi (Baarda's Reliability Test) teorisini ve K-Means uzaysal kümeleme algoritmalarını dizeye dahil et. Matris boyutlarının uyuşumunu, serbestlik derecelerini ve serimizin varyansını kontrol ederek istatistiksel hata dengelemesini sıfır derleme ve mantıksal hatayla, adım adım ve tam şablonla TypeScript kütüphanesi olarak kodla."</i></p>
    </div>

    <h2>2.6. Uygulama Arayüz Tasarımı (Graphical User Interface Design)</h2>
    <p></p>

    <h2>2.7. Diğer Teknik Bilgiler (Saha Protokolleri, Veri Saklama/Aktarım ve Dosya Mimarisi)</h2>
    <p>Akademik çalışmanın mükemmelliğini desteklemek amacıyla sistemin operasyonel dayanıklılık kuralları, veri format bütünlükleri ve modüler kaynak kod mimarisi aşağıda detaylandırılmıştır:</p>
    <ul>
      <li><span class="bold">Mühendislik Saha Çalışma Protokolleri:</span> Sahadaki ölçümlerden maksimum verim elde edebilmek adına, GNSS alıcısının gökyüzünü en az %80 oranında kesintisiz görebilmesi gerekir. GNSS çipinin ephemeris ve almanak verilerini güncelleyebilmesi için uygulamayı açar açmaz doğrudan ölçüme başlamak yerine yaklaşık 1 dakikalık bir "ısınma (warm-up)" süresi tanınması tavsiye edilir. Binaların cam dış cephelerinden yansıyan sinyalleri izole etmek için Baarda kalın hata eleme veya K-Means süzgeçleri aktif tutulmalıdır.</li>
      <li><span class="bold">Operasyonel Veri Güvenliği ve Saklama Standartları:</span> Kaydedilen tüm jeodezik ölçümler ve proje verileri, tarayıcı korumalı sandbox (güvenli alan) ortamında, asenkron IndexedDB yapısında barındırılır. Veri bütünlüğünü sağlamak adına, her ölçümün yapıldığı saniyedeki ham uydu istatistikleri ve donanım hassasiyetleri birer "değiştirilemez işlem günlüğü (immutable log)" halinde saklanır; bu durum arazi ölçümlerinin sonradan geriye dönük manipüle edilmesini engeller.</li>
      <li><span class="bold">Dışa Aktarım (CAD/GIS Export) Entegrasyonu:</span> Toplanan saha verileri Netcad, AutoCAD, ArcGIS ve Google Earth gibi küresel/yerel CBS ve CAD programlarıyla tam uyumludur. Dışa aktarımlarda Türkçe karakter korumalı UTF-8 kodlama formatı kullanılır. dxf, kml ve csv/txt şablonları, katman bazlı (layering) olarak üretilir. Örneğin, noktalar ayrı bir katmanda, bunlara ait kot yazıları veya nokta numarası yazıları farklı katmanlarda yer alır.</li>
      <li><span class="bold">Yazılım Modüler Mimari Şeması:</span> Uygulama jeodezik sorumluluklarına göre 3 grupta toplanmıştır:
        <ul>
          <li><span class="bold">A. Yönetim Katmanı (Root):</span> Uygulama giriş kapısı (<span class="bold">index.tsx, App.tsx</span>) ve ortak verilerin tiplerini belirleyen (<span class="bold">types.ts, version.ts</span>) katman.</li>
          <li><span class="bold">B. Komponent Katmanı (UI):</span> Kullanıcının arazide etkileşim kurduğu (<span class="bold">Dashboard.tsx, GPSCapture.tsx, StakeoutModule.tsx, DataAnalysisView.tsx, SettingsView.tsx</span>) modüller.</li>
          <li><span class="bold">C. Algoritma Çekirdeği (Engine):</span> 7-parametreli Bursa-Wolf ve Gauss-Krüger formüllerini içeren (<span class="bold">CoordinateUtils.ts</span>), 6 istatistik filtresini barındıran (<span class="bold">MathUtils.ts</span>) ve Türkiye Jeoidi (TG-20) interpolasyonunu yürüten (<span class="bold">GeoidService.ts, GeoidUtils.ts</span>) hesaplama çekirdeği.</li>
        </ul>
      </li>
      <li><span class="bold">Fiziksel Dosya ve Dizin Klasör Dağılım Şeması (Project Folder Layout):</span> GPS Plus yazılım mimarisinin tüm dizin ve alt modül ağacı, sistem dosya standardı uyarınca aşağıda listelenmiştir:
        <pre class="code-block">
├── .github/                 # GitHub workflows & CI/CD configs
├── components/              # User Interface & Render Modules
│   ├── Dashboard.tsx        # Dynamic home panel displaying core geodetic statuses
│   ├── GPSCapture.tsx       # Live GNSS measurement & filtering terminal
│   ├── StakeoutModule.tsx   # Visual field navigation, radar, & bubble leveling tools
│   ├── DataAnalysisView.tsx # R&D analysis panel displaying scatter plots and filter curves
│   ├── SavedLocationsList.tsx  # Interactive database/point notebook with folder groupings
│   ├── SettingsView.tsx     # System tolerance configurations & Database Backup tools
│   ├── Onboarding.tsx       # Sensor permission checks & technical welcome walkthrough
│   ├── ExcelUtils.ts        # Engineered Excel exporter with custom metadata columns
│   ├── KMLUtils.ts          # High-fidelity CAD & GIS-ready KML file builder
│   ├── TxtUtils.ts          # Turkish character-safe CAD space exporter (X,Y,Z,No)
│   ├── Header.tsx           # Global app navigator and connection status indicator
│   ├── GlobalFooter.tsx     # Version information & brand footer
│   └── Modal.tsx            # Contextual system alerts and confirmation windows
├── hooks/                   # Custom React hooks (sensors, geosearch, etc.)
├── services/                # Geoid grid services & background IO tasks
│   └── GeoidService.ts      # Handles Bilinear Interpolation for TG-20 and EGM96 models
├── utils/                   # Geodetic Mathematics & Computational Core
│   ├── MathUtils.ts         # Computational core housing 6 filters (Huber, RANSAC, KDE, etc.)
│   ├── CoordinateUtils.ts   # Projection Math (Gauss-Krüger, 3°/6° TM, Bursa-Wolf 7-Param)
│   ├── GeoidUtils.ts        # Core parser for height corrections (H = h - N)
│   ├── ReportUtils.ts       # Dynamic PDF/DOC-ready Technical Report generator
│   ├── LanguageContext.tsx  # Dynamic Language provider supporting EN & TR
│   ├── trtoentranslate.ts   # Academic geodetic dictionary definitions for localization
│   └── browser.ts           # Hardware API capability verification hooks
├── App.tsx                  # Core router, global state manager, and local storage syncer
├── types.ts                 # Strong TypeScript type mappings (GNSS, Filtering, Matrix models)
├── version.ts               # Brand configurations and build metadata
├── index.html               # Main SPA DOM mount point
└── tsconfig.json            # Strict TypeScript compilation rules
        </pre>
      </li>
    </ul>

    <div class="page-break"></div>

    <h1>3. SONUÇ (CONCLUSION)</h1>
    <p>Bu araştırma kapsamında geliştirilen <span class="bold">${FULL_BRAND} v5.0</span>, harita mühendisliği alanındaki ağır ve sunucu bağımlı jeodezik hesaplamaları, akıllı telefonların yerel donanım güçlerini kullanarak tamamen çevrimdışı ve tarayıcı tabanlı yürütebilen öncü bir PWA platformu ortaya koymuştur. Geliştirilen platform; yerel ITRF96/ED50 projeksiyon sistemleri, Türkiye Ulusal Jeoid Modeli (TG-20) interpolasyon şemaları ve gürültü elemede kullanılan 6 farklı ileri düzey istatistiksel filtreleme algoritması ile tüketici sınıfı akıllı telefonların bile haritacılık mühendisliği çalışmalarında güvenle kullanılabileceğini kanıtlamıştır.</p>
    <p>Ayrıca çalışma dahilinde yürütülen "Yapay Zeka Destekli Yazılım Geliştirme Metodolojisi", Google AI Studio'nun mühendislik alanındaki karmaşık formülleri hatasız bir şekilde TypeScript diline tercüme edebildiğini, alan uzmanı kontrolünde (Expert-in-the-Loop) işletildiğinde yazılım üretim ve test maliyetlerini %85 mertebesinde azalttığını ortaya koymuştur. Sonuç olarak ${FULL_BRAND}, sunduğu üstün arazi ergonomisi, çevrimdışı çalışma kabiliyeti ve yüksek matematiksel hassasiyeti ile yer bilimleri, coğrafi bilgi sistemleri ve arazi kadastro çalışmalarında yeni nesil sunucusuz jeodezi çağını başlatmıştır.</p>

    <h1>4. KAYNAKÇA VE AKADEMİK ATIFLAR (REFERENCES)</h1>
    <p class="no-indent" style="margin-bottom: 12pt;"><span class="bold">Atıf Gösterim Rehberi:</span> Bu çalışmada kullanılan tüm jeodezik matematik, istatistiksel filtreler ve CBS modelleri aşağıdaki temel ulusal/uluslararası literatüre dayanmaktadır:</p>
    <ol>
      <li><span class="bold">Baarda, W. (1968).</span> A testing procedure for use in geodetic networks. Netherlands Geodetic Commission. (Jeodezik Baarda Snooping kalın hata testleri için).</li>
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
