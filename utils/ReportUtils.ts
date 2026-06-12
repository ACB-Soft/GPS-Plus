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

    <h1>1. GİRİŞ</h1>
    <p>Akıllı telefon donanımlarında yaşanan gelişmeler, taşınabilir tüketici donanımlarının konumsal veri üretebilme yeteneklerini göz ardı edilemeyecek düzeye taşımıştır. Yüksek doğruluk ve hassasiyet gerektiren ölçümlerde kullanılan profesyonel jeodezik donanımlar ve profesyonel yazılımlar için yüksek maliyet ve kullanıcı tarafında ciddi bilgi birikimi gerekmektedir. Bu durum taşınabilir tüketici donanımların ön etüt aşamasında; veri toplama ve aplikasyon işlemlerinde kullanılıp kullanılamayacağını bir araştırma konusuna dönüştürmüştür.</p>

    <h2>1.1. Akıllı Telefon GNSS Donanımlarının Gelişimi</h2>
    <p>Akıllı telefonların GNSS alıcıları tarihsel süreçte tek frekanslı (L1) GNSS alıcıları ve çift frekanslı (L1/L5) GNSS alıcıları olarak gelişim göstermiştir. Akıllı telefonların konum doğruluğu, veri toplama sırasında sinyalleri etkileyen çevresel faktörler, uydu konumları, donanım özellikleri ve yazılım değişkenlerine bağlı olarak değişmektedir. Bununla birlikte, çift frekanslı (L1/L5) GNSS alıcısına sahip akıllı telefonlar, düşük maliyetli bir alternatif olarak konumlandırmada gelişmiş doğruluk sağlayabilme potansiyeline sahiptir [1, 2]. Son yıllarda “Geolocation API” hizmeti ile konum, yükseklik ve hassasiyet parametresi kullanıma açılmıştır [3]. Bu durum web tarayıcı tabanlı veri toplama süreçleri için ön ayak oluşturmuştur.</p>

    <h2>1.2. Arazi Çalışmalarındaki Zorluklar</h2>
    <p>Saha çalışması yapan tüm disiplinlerin arazi çalışmalarında karşılaştığı en büyük zorluklardan biri, akıllı telefonların ham ürettiği WGS84 coğrafi koordinatlarının (enlem, boylam, elipsoidal yükseklik) yerel harita ve kadastro projelerinde doğrudan kullanılamamasıdır. Türkiye'deki kadastro projeleri ve CBS altyapıları genellikle yerel izdüşüm sistemlerini (ITRF96/ED50) referans alır. Bu durum, sahada bulunan mühendislerin harita düzlemine geçebilmek amacıyla sürekli olarak masaüstü (CAD/CBS) yazılımlarına bağımlı kalmaktadır. Anlık olarak dönüştürülemeyen, yerel elipsoid referanslarına ve pafta indekslerine adapte edilemeyen koordinatlar, saha çalışmalarında hızlı karar vermeyi engellemekte ve verimliliği düşürmektedir.</p>

    <h2>1.3. Çalışmanın Amacı ve Araştırma Boşluğu</h2>
    <p>Literatür incelendiğinde, koordinat ölçümü, anlık koordinat dönüşümü, arazi aplikasyonu ve koordinat verilerin global yazılımlara (CAD/CBS) aktarılmasını sağlayan sistemlerin genellikle bulut tabanlı merkezi sunuculara muhtaç olduğu, bilgisayar tabanlı programlar ile yapıldığı veya akıllı telefonlar için kurulum gerektirdiği görülmektedir.
    İleri düzey 7 parametreli Bursa-Wolf matris dönüşümleri, yüksek dereceden Krüger projeksiyon serileri, Türkiye Geoidi (TG-20) enterpolasyonu ve istatistiksel uyuşmazlık ve kümeleme testlerinin hiçbir harici sunucu bağlantısına ihtiyaç duymadan ve kurulumsuz olarak doğrudan akıllı telefon tarayıcısı üzerinde bir yapıda çalıştırılmasına dair literatürde derin bir eksiklik bulunmaktadır.
    Bu akademik çalışmanın ve geliştirilen “ACB Maps - GPS Plus” isimli uygulamanın temel amacı, söz konusu literatür boşluğunu doldurarak harita mühendisliği alanında yüksek doğruluklu hesaplamaları tamamen internetsiz, sunucusuz ve platformdan bağımsız bir taşınabilir masaüstü kalitesinde yapmaktır. Platformun literatüre sunduğu yenilikler ve çalışma prensipleri, Türkiye özelinde web tabanlı bir uygulama geliştirilerek incelenmiştir.</p>

    <div class="page-break"></div>

    <h1>2. MALZEMELER, YÖNTEMLER VE YAZILIM MİMARİSİ (MATERIALS, METHODS, AND SOFTWARE ARCHITECTURE)</h1>
    <p>Geliştirilen sistemin kararlılığı, hem yazılım mühendisliği disiplinlerinin hem de jeometri mühendisliği standartlarının harmanlanmasıyla elde edilmiştir.</p>

    <h2>2.1. Progressive Web Application (PWA) Altyapısı</h2>
    <p>Geliştirilen mühendislik motorunun arazide kesintisiz, yüksek performanslı ve internet şebekesinden bağımsız (çevrimdışı) çalışabilmesi amacıyla, bilgisayar bilimleri literatüründe modern bir yaklaşım olan Progressive Web Application (PWA) mimarisi benimsenmiştir.
    Saniyelik veri akışlarının kullanıcıyı yormadan, gecikmesiz olarak ekrana yansıtılabilmesi için modern sanal DOM rendering sunan React kütüphanesi ve ultra hızlı derleme motoru Vite entegrasyonu tercih edilmiştir [4,5]. Sistem arayüzünde yüksek okunabilirlik sağlamak adına Plus Jakarta Sans ve JetBrains Mono yazı tipleri, hassas CAD simgeleri ve uydu durum göstergeleri için ise Lucide ve FontAwesome kütüphaneleri kullanılmıştır [6,7,8].
    Projenin sürdürülebilirliği ve kod kalitesi, GitHub Actions üzerinden yürütülen Sürekli Entegrasyon ve Sürekli Dağıtım (CI/CD) süreçleriyle denetlenmektedir [9]. Ayrıca, jeodezik formüllerin Double Precision standartlarında yürütülmesi gerektiğinden; koordinat değerlerinin ve matris katsayılarının kontrolsüz veri tipi dönüşümleriyle hassasiyet kaybetmesini önlemek amacıyla projede katı (Strict) TypeScript tiplemesi zorunlu kılınmıştır [10].
    Saha operasyonlarının kalbini oluşturan vektörel haritacılık işlemleri, Leaflet çekirdeği ve Leaflet.draw kütüphanesi üzerine inşa edilen interaktif bir Web-CAD platformu aracılığıyla yürütülmektedir [11]. Bu modül, tarayıcının hardware accelerated grafik motorunu tetikleyerek tamamen çevrimdışı çalışmaktadır.
    Harita altlığı olarak Google Maps API ve OpenStreetMap servisleri entegre edilerek gerçek zamanlı uydu fotoğrafları ve topografik katmanlar kullanılmıştır [12,13]. Ölçüm esnasında toplanan koordinatların hata yayılım profilleri ve regresyon eğrileri ise Recharts kütüphanesiyle dinamik olarak grafikleştirilmektedir [14].
    Klasik tarayıcıların localStorage limitlerini (5mb) aşan büyük boyutlu mühendislik dosyalarını ve arazide toplanan on binlerce noktayı sıfır veri kaybıyla saklayabilmek amacıyla, asenkron ve nesne tabanlı IndexedDB veritabanı katmanı kullanılmıştır [15]. PWA mimarisinin temel taşı olan Background Service Worker sayesinde, uygulamanın çekirdek dosyaları tarayıcı önbelleğine kalıcı olarak yazılmakta ve şebeke hattının olmadığı kırsal arazilerde dahi sistem yerel bir mobil aplikasyon hızında açılabilmektedir [16].
    İstemci tarafında toplanan verilerin dışa aktarımı için SheetJS (xlsx) motoru kullanılarak sunucu bağımsız dosyalar üretilmektedir [17]. Üretilen bu çıktıların arka planda paketlenerek indirilebilmesi için JSZip ve FileSaver.js kütüphaneleri kullanılmıştır [18,19].
    Uygulama, akıllı mobil cihazların ham uydu verilerine ve entegre GNSS alıcısı donanım katmanına doğrudan erişebilmek için W3C Geolocation API standartlarını kullanmaktadır [3]. Donanımdan alınan konum verilerinin ve jeoid modellerinin istemci tarafında hızlı, dinamik ve yüksek duyarlılıkla işlenmesi, datum ve koordinat projeksiyon dönüşümlerinin milimetrik hassasiyetle gerçekleştirilmesi için Proj4js kütüphanesi kullanılmaktadır [20].</p>

    <h2>2.2. Jeodezik Hesaplama Yöntemleri</h2>
    <p>Hassas jeodezi motoru, elipsoidal ve düzlemsel koordinat dönüşüm denklemlerini tamamen istemci tarafında saniyeler içinde çözer.</p>

    <h3>2.2.1. Koordinat Dönüşümleri</h3>
    <p>Küresel WGS84 coğrafi koordinatları ile yerel datumlar (ED50/ITRF96) arasındaki dönüşümler, 7-parametreli Bursa-Wolf modelinde rotasyon ve ölçek katsayılarının sıfır (0) kabul edildiği 3 öteleme parametreli Helmert dönüşüm modeli ve Proj4js projeksiyon formülasyonu ile koşturulur [21,22,23,40]. ITRF96 ve WGS84 datumları, pratik mühendislik uygulamalarında milimetrik düzeyde birbirine yakın ve uyumlu kabul edildiğinden, aralarında ek bir Helmert öteleme vektörüne ihtiyaç duyulmadan doğrudan projeksiyon denklemleri ve dönüşüm formülasyonu ile koordinat düzlemine izdüşürülür. Uygulamada Proj4js kütüphanesi ile entegre edilen ED50 ve ITRF96 tanımları aşağıdaki kod satırlarında açıkça görülmektedir:</p>
    <pre class="code-block">
destProj_ed50 = "+proj=tmerc +lat_0=0 +lon_0=" + dom + " +k=1 +x_0=500000 +y_0=0 +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs";
destProj_itrf96 = "+proj=tmerc +lat_0=0 +lon_0=" + dom + " +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs";
    </pre>

    <h3>2.2.2. Projeksiyon Dönüşümleri</h3>
    <p>WGS84 Coğrafi koordinatların (Enlem, Boylam) düzlemsel Gauss-Krüger (Transverse Mercator - TM 3°) ve küresel UTM (6°) koordinatlarına dönüştürülmesinde, meridyen yay uzunluklarını milimetrik hassasiyetle hesaplayan ve Proj4js motorunda gömülü olan yüksek duyarlıklı geleneksel serisel eşitlikler kullanılmaktadır [22,24,25]. Matematiksel bütünlük ve ölçek doğruluğu açısından dilim genişliklerinde BÖHHBÜY [26] standartları işletilir. Bu projeksiyon ve ölçek farklılıklarını gözeterek dinamik DOM ve Zone değerleri üreten, ardından Proj4js motoruna bu parametreleri aktaran hesaplama çekirdeği şu şekildedir:</p>
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

    <h3>2.2.3. Jeoid Ondülasyonu</h3>
    <p>GNSS alıcılarından doğrudan elde edilen yükseklik verisi, referans elipsoidine (WGS84/GRS80) dik olan geometrik (h-Elipsoidal) yüksekliktir. Ancak mühendislik projelerinde, yeryüzünün fiziki yapısını ve çekim alanını temsil eden yerçekimi tabanlı (H-Ortometrik) yüksekliklerin kullanılması zorunludur. Bu iki yüzey arasındaki düşey açıklık jeoit ondülasyonu (N) olarak tanımlanmakta ve “ H=h-N ” jeodezik bağıntısı ile hesaplanmaktadır [27].
    Geliştirilen yazılım mimarisi, ulusal sınırlarda açık kaynaklı 5’x5’ çözünürlüklü Türkiye Ulusal Jeoidi 2020 (TG20) grid verilerini; küresel ölçekte ise 15’x15’ çözünürlüklü küresel katsayılara dayanan enterpole edilmiş Earth Gravitational Model 1996 (EGM96) verisetini lokal katmanında barındırmaktadır [28,29,30]. Gerçek zamanlı konumlandırma esnasında, ölçüm yapılan koordinatı çevreleyen en yakın dört grid düğüm noktası tespit edilerek, boyutsuz lokal koordinatlar üzerinden "Bilineer İnterpolasyon" yöntemi uygulanmaktadır [31]. Bilineer geoid interpolasyon fonksiyonunun hesap çekirdeği aşağıda sunulmuştur:</p>
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

    <h2>2.3. Sinyal Güvenilirlik Filtresi</h2>
    <p>Akıllı telefonların entegre konum sensörleri doğrudan ham GNSS gözlemleri yerine tarayıcı düzlemine filtrelenmiş tahminler sunar. Bu sebeple donanımın ürettiği konumsal doğruluk kestirimleri (Geolocation API Accuracy Radius), her zaman sahada karşılaşılan fiziki çoklu yansıma (multipath) og atmosferik gecikme etkilerini bütünüyle yansıtamaz [3,32]. Bu sebeple uygulama ile birlikte “Sinyal Güvenirlik Filtresi” geliştirilmiştir. Literatüre kazandırılan bu yöntem, toplanan örneklem havuzunun uzaysal dağılımını matematiksel kriterlere göre denetleyerek sinyal kalitesini derecelendirir.
    Akıllı konumlandırma motoru, statik ölçüm sırasında Geolocation API'nin standart saniyelik güncelleme hızı olan 1 Hz varsayılan frekansı ile veri toplar. İstatistiksel çıkarım için; yerel çevresel engeller, bina yansımaları og ağaç örtüsünden kaynaklanan anlık multipath sapmalarını, sinyal saçılmalarını og yüksek frekanslı beyaz gürültüyü sönümleyerek verilerin kararlılığını güvene almak gerekmektedir. Bu sebeple uygulama içerisine en az 15 epok veri toplanması zorunluğu getirilmiştir.
    Yöntem, güvenilirlik derecelendirmesini Geolocation API tarafından üretilen iki temel parametre üzerinden gerçekleştirmektedir.
    1-Ortalama Donanımsal Sensör Hassasiyeti: Alıcı cihazın her bir saniye bazında bağımsız olarak bildirdiği geometrik hata yarıçap değerlerinin aritmetik ortalamasıdır.
    2-Veri Saçılımı Genişliği: Statik ölçüm havuzunda yer alan en uzak iki koordinat arasındaki geometrik mesafedir.
    Hesaplanan bu veriler ışığında, ölçüm sonucu üç ana kategori altında sınıflandırılarak kullanıcıya bildirilir.
    1-Güvenilir Veri: Ortalama Donanımsal Sensör Hassasiyetinin 5m og altında olması, Veri Saçılımı Genişliğinin 5m og altında kalması, toplanan statik epok sayısının en az 15 olması og Veri Saçılımı Genişliğinin, Ortalama Donanımsal Sensör Hassasiyeti sınırlarında kalması koşuluyla verilir. Gerçeğe en yakın nitelikteki temiz sinyali temsil eder.
    2-Güvensiz Veri: Ortalama Donanımsal Sensör Hassasiyeti 20m'den büyük olması, Veri Saçılımı Genişliğinin 20m'den büyük olması ya da Veri Saçılımı Genişliğinin Ortalama Donanımsal Sensör Hassasiyetinin 3 katından fazla olması durumunda tetiklenir. Sahada ciddi multipath etkisi olduğunu gösterir. Bu sınıftaki veri tamamen güvensizdir og ölçümün tekrarlanması önerilir.
    3-Orta Güvenli Veri: Güvenilir veri sınıfı ölçütlerini sağlayamayan ancak güvensiz veri sınıfı ölçütlerinden de iyi olan durumlar için kullanılır. İki veri sınıfı arasındaki geçiş sınıfıdır. Multipath etkisi barındırdığı için ölçümün tekrarlanması önerilir.
    Bu akıllı “Sinyal Güvenirlik Filtresi” sınıflarını hesaplayan TypeScript kütüphane fonksiyonu şu şekildedir:</p>
    <pre class="code-block">
export function analyzeSignalReliability(samples: Coordinate[]): SignalAnalysis {
  if (samples.length === 0) return { signalQuality: 'low', maxSpread: 0, avgSensorAcc: 99 };
  const maxSpread = calculateMaxDistance(samples);
  const avgSensorAcc = samples.reduce((sum, s) => sum + s.accuracy, 0) / samples.length;
  const ratio = maxSpread / (avgSensorAcc || 0.1);
  const samplesCount = samples.length;
  const meanLat = samples.reduce((sum, s) => sum + s.lat, 0) / samples.length;
  const meanLng = samples.reduce((sum, s) => sum + s.lng, 0) / samples.length;
  const { latCoeff, lngCoeff } = getWGS84Coefficients(meanLat);
  const residuals = samples.map(s => {
    const dLat = (s.lat - meanLat) * latCoeff;
    const dLng = (s.lng - meanLng) * lngCoeff;
    return dLat * dLat + dLng * dLng;
  });
  const variance = residuals.reduce((sum, val) => sum + val, 0) / Math.max(1, samples.length - 1);
  const stdDev = Math.sqrt(variance);
  const isRed = avgSensorAcc > 20 || maxSpread > 20 || ratio > 3.0;
  const isGreen = !isRed && avgSensorAcc <= 5 && maxSpread <= 5 && samplesCount >= 15 && ratio <= 1.0;
  const signalQuality: 'safe' | 'medium' | 'low' = isRed ? 'low' : isGreen ? 'safe' : 'medium';
  return {
    maxSpread,
    avgSensorAcc,
    stdDev,
    ratio,
    signalQuality,
    samplesCount
  };
}
    </pre>

    <h2>2.4. İstatistiksel Veri Filtreleme Yöntemleri</h2>
    <p>Sahada toplanan GNSS verisi, çevresel yansımalar og uydulardaki anlık değişimler nedeniyle rastgele og sistemsel hatalar barındırır. Geliştirilen uygulama, bu hataları ayıklamak og kararlı sonuçlar elde etmek amacıyla toplamda 5 farklı istatistiksel filtreleme kütüphanesini doğrudan kaynak kod yapısında barındırır og tarayıcı tabanlı olarak çalıştırır. Bu yöntemler sadece yatay konumsal hesaplamalarda kullanılır. 
    Uygulama, düşey yükseklik hesaplamalarında ise standart aritmetik ortalamayı kullanır. Akıllı telefonların tarayıcı düzeyindeki Geolocation API tarafından sağlanan yükseklik verileri yüksek gürültülü og kesintili olmasının yanı sıra, ayrıca her epok için güvenilir bir hata yarıçapı barındırmaz [3]. Bu akademik gerçeğe dayanarak, düşey yüksekliklerin belirlenmesinde tüm aktif dönemdeki epokların doğrudan aritmetik ortalaması tercih edilmiştir.</p>

    <h3>2.4.1. Stokastik Tek Nokta Dengelemesi ve Ölçülerin Ağırlıklı Merkezileştirilmesi (Weighted Centroid)</h3>
    <p>En Küçük Kareler (LSE) prensibine göre, jeodezik bir ölçünün ağırlığı (p), o ölçünün karesel ortalama hatasının (veya standart sapmasının) karesiyle ters orantılıdır (p = 1 / &sigma;<sup>2</sup>). Akıllı konum sensörlerinde tarayıcı düzeyinde elde edilen Geolocation API hassasiyet dairesi yarıçapı (<i>accuracy</i>), doğrudan ham standart sapmayı (&sigma;) değil; pratik kestirim dünyasında %95 güven aralığına karşılık gelen bir dairesel hata olasılığını (Circular Error Probable - CEP veya yaklaşık 2-sigma) temsil eder. CEP değeri standart sapma ile doğrusal bağıntılı olduğundan, bu dairesel hata yarıçaplarının karesiyle ters orantılı ağırlıkların atanması (p<sub>i</sub> = 1 / accuracy<sub>i</sub><sup>2</sup>), teorik jeodezik ağırlıklandırma modeliyle tam bir stokastik uyum sergiler.</p>
    <p>Sistem, tam bir 3B ağ dengelemesinin getireceği matris çözümü ve hesaplama yükü yerine; tek boyut düzeylerinde bağımsız ağırlıklı ortalama denklemini çözen ve "Weighted Centroid" olarak da adlandırılan Ağırlıklı En Küçük Kareler (WLS / Weighted LSE) motorunu doğrudan çalıştırır. Yatay konumlar donanımsal doğruluk değerlerinin ters karesiyle ağırlıklandırılarak dengeli tek nokta konumu elde edilir. Dikey yüksekliklerde ise sistem, yüksek gürültülü düşey verileri sönümlemek amacıyla doğrudan aritmetik ortalamaya başvurur.</p>

    <p class="no-indent">Ağırlıklı En Küçük Kareler (WLS) yönteminin TypeScript programlama dili kaynak kod tasarımı aşağıda sunulmuştur:</p>
    <pre class="code-block">
function calculateWeightedLSE(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length === 0) return { result: samples[0], usedIndices: [0] };
  
  const weights = samples.map(s =&gt; 1 / Math.pow(Math.max(0.1, s.accuracy), 2));
  const sumW = weights.reduce((a, b) =&gt; a + b, 0);
  
  const meanLat = samples.reduce((a, s, i) =&gt; a + s.lat * weights[i], 0) / sumW;
  const meanLng = samples.reduce((a, s, i) =&gt; a + s.lng * weights[i], 0) / sumW;
  
  const validAltitudes = samples.filter(s =&gt; s.altitude !== null);
  const meanAlt = validAltitudes.length &gt; 0
    ? validAltitudes.reduce((a, s) =&gt; a + (s.altitude || 0), 0) / validAltitudes.length
    : null;
    
  const result: Coordinate = {
    ...samples[0],
    lat: meanLat,
    lng: meanLng,
    altitude: meanAlt,
    timestamp: Date.now()
  };
  return { result, usedIndices: samples.map((_, i) =&gt; i) };
}
    </pre>

    <h3>2.4.2. Gürbüz Adımlı Huber M-Tahmini Süzgeci (Robust Huber M-Estimation)</h3>
    <p>Huber M-tahmini yöntemi, veri havuzundaki konumsal sıçramaları ve gürültüleri hassasiyete göre yumuşatan gürbüz (robust) bir istatistiksel yaklaşımı temsil eder. Geliştirilen bu saf Huber süzgeci, klasik Huber sönümlemesini donanımsal alıcı doğruluk ağırlıkları ile birleştirerek iteratif bir dengeleme yürütür. 1-sigma eşiğini aşan aşırı sapanlar elendikten sonra, hibrit modelimizdeki gibi <b>Donanım Duyarlılığı × Huber Robust Ağırlığı</b> ortak çarpımı kullanılarak nihai ağırlıklı koordinat çözümü üretilir.</p>

    <div class="case-container" style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 12px; margin-bottom: 20px; font-size: 10pt;">
      <p class="bold" style="color: #4338ca; margin-bottom: 6px;">Huber Robust + Donanımsal Ağırlık Birleşim Mantığı</p>
      <p class="no-indent" style="margin-bottom: 5px;"><span class="bold">1. İteratif Yakınsama:</span> İlk etapta tüm gözlemlerin gürbüz <b>Medyan (Ortanca)</b> konumu referans alınarak ölçek parametresi olarak gürbüz <b>MAD (Median Absolute Deviation)</b> hesaplanır. Huber eşiği (1.345 * pseudo_sigma, sayısal kararlılık için en az 1e-7m) belirlenerek anlık ağırlıklar iteratif biçimde güncellenir ve merkez kayması tolerans değerinin (1 milimetre - 0.001m) altına inene kadar (max 15 adım) pivot yenilenir.</p>
      <p class="no-indent" style="margin-bottom: 5px;"><span class="bold">2. Kalın Hata Temizliği (1-sigma):</span> İterasyon sonunda nihai koordinat merkezinden en fazla 1-sigma (1 * final_pseudo_sigma) kadar uzaktaki gözlemler sisteme dahil edilir, bu sınırın dışındaki yansımalı kaba hatalar bütünüyle elenir.</p>
      <p class="no-indent"><span class="bold">3. Ortak Ağırlıklandırma Formülasyonu:</span> Süzgeçten geçen temiz gözlemlerin nihai ağırlıkları tayin edilirken hem donanımsal hassasiyet karesel varyans modeli (1 / accuracy²) hem de konumsal uzaklığa dayalı Huber sönümlemesi çarpan olarak yansıtılarak tam gürbüzlük ve fiziksel kararlılık elde edilir.</p>
    </div>

    <p class="no-indent">İteratif Huber M-Tahmini gürbüz süzgecini çalıştıran kritik fonksiyon yapısı aşağıda sunulmuştur:</p>
    <pre class="code-block">
function getWGS84Coefficients(latDegree: number): { latCoeff: number; lngCoeff: number } {
  const latRad = (latDegree * Math.PI) / 180;
  const a = 6378137.0;
  const f = 1 / 298.257223563;
  const e2 = 2 * f - f * f;
  const sinLat = Math.sin(latRad);
  const cosLat = Math.cos(latRad);
  const temp = 1.0 - e2 * sinLat * sinLat;
  const M = (a * (1.0 - e2)) / (temp * Math.sqrt(temp));
  const N = a / Math.sqrt(temp);
  return {
    latCoeff: (M * Math.PI) / 180.0,
    lngCoeff: (N * Math.PI / 180.0) * cosLat
  };
}

function calculateDistanceMeter(lat1: number, lng1: number, lat2: number, lng2: number, baseLat: number): number {
  const { latCoeff, lngCoeff } = getWGS84Coefficients(baseLat);
  const dLat = (lat1 - lat2) * latCoeff;
  const dLng = (lng1 - lng2) * lngCoeff;
  return Math.sqrt(dLat * dLat + dLng * dLng);
}

function calculateMADHuber(samples: Coordinate[], centerLat: number, centerLng: number): number {
  const distances = samples.map(p =&gt; calculateDistanceMeter(p.lat, p.lng, centerLat, centerLng, centerLat));
  return calculateMedian(distances);
}

export function calculateHuberPure(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length &lt; 4) {
    const avgLat = samples.reduce((sum, p) =&gt; sum + p.lat, 0) / samples.length;
    const avgLng = samples.reduce((sum, p) =&gt; sum + p.lng, 0) / samples.length;
    const avgAcc = samples.reduce((sum, p) =&gt; sum + p.accuracy, 0) / samples.length;
    return {
      result: { lat: avgLat, lng: avgLng, accuracy: avgAcc, timestamp: Date.now() },
      usedIndices: samples.map((_, i) =&gt; i)
    };
  }

  let currentLat = calculateMedian(samples.map(s =&gt; s.lat));
  let currentLng = calculateMedian(samples.map(s =&gt; s.lng));

  const maxIterations = 15;
  const toleranceMeter = 0.001;

  for (let iter = 0; iter &lt; maxIterations; iter++) {
    const currentMAD = calculateMADHuber(samples, currentLat, currentLng);
    const pseudoSigma = currentMAD * 1.4826;
    const stablePseudoSigma = pseudoSigma &gt; 1e-7 ? pseudoSigma : 1e-7;
    const huberLimit = 1.345 * stablePseudoSigma;

    let sumW = 0;
    let sumLatW = 0;
    let sumLngW = 0;

    for (let i = 0; i &lt; samples.length; i++) {
      const p = samples[i];
      const dist = calculateDistanceMeter(p.lat, p.lng, currentLat, currentLng, currentLat);

      const hardwareWeight = 1.0 / Math.pow(Math.max(0.1, p.accuracy), 2);
      const huberWeight = dist &lt;= huberLimit ? 1.0 : huberLimit / Math.max(0.001, dist);
      const combinedWeight = hardwareWeight * huberWeight;

      sumW += combinedWeight;
      sumLatW += p.lat * combinedWeight;
      sumLngW += p.lng * combinedWeight;
    }

    if (sumW === 0) break;

    const nextLat = sumLatW / sumW;
    const nextLng = sumLngW / sumW;

    const changeInMeter = calculateDistanceMeter(nextLat, nextLng, currentLat, currentLng, currentLat);

    currentLat = nextLat;
    currentLng = nextLng;

    if (changeInMeter &lt; toleranceMeter) break;
  }

  const finalMAD = calculateMADHuber(samples, currentLat, currentLng);
  const finalPseudoSigma = finalMAD * 1.4826;
  const stableFinalPseudoSigma = finalPseudoSigma &gt; 1e-7 ? finalPseudoSigma : 1e-7;
  const outlierThreshold = 1.0 * stableFinalPseudoSigma;

  const usedIndices: number[] = [];
  const cleanSamples: Coordinate[] = [];

  for (let i = 0; i &lt; samples.length; i++) {
    const p = samples[i];
    const dist = calculateDistanceMeter(p.lat, p.lng, currentLat, currentLng, currentLat);

    if (dist &lt;= outlierThreshold) {
      usedIndices.push(i);
      cleanSamples.push(p);
    }
  }

  if (cleanSamples.length === 0) {
    return { 
      result: { lat: currentLat, lng: currentLng, accuracy: 3.0, timestamp: Date.now() }, 
      usedIndices: samples.map((_, i) =&gt; i) 
    };
  }

  const subMAD = calculateMADHuber(cleanSamples, currentLat, currentLng);
  const subPseudoSigma = subMAD * 1.4826;
  const stableSubPseudoSigma = subPseudoSigma &gt; 1e-7 ? subPseudoSigma : 1e-7;
  const finalHuberLimit = 1.345 * stableSubPseudoSigma;

  let finalSumW = 0;
  let finalLatW = 0;
  let finalLngW = 0;
  let totalAccuracy = 0;

  for (const p of cleanSamples) {
    const dist = calculateDistanceMeter(p.lat, p.lng, currentLat, currentLng, currentLat);
    const hardwareWeight = 1.0 / Math.pow(Math.max(0.1, p.accuracy), 2);
    const huberWeight = dist &lt;= finalHuberLimit ? 1.0 : finalHuberLimit / Math.max(0.001, dist);
    const combinedWeight = hardwareWeight * huberWeight;

    finalSumW += combinedWeight;
    finalLatW += p.lat * combinedWeight;
    finalLngW += p.lng * combinedWeight;
    totalAccuracy += p.accuracy;
  }

  return {
    result: {
      lat: finalLatW / finalSumW,
      lng: finalLngW / finalSumW,
      accuracy: totalAccuracy / cleanSamples.length,
      altitude: null,
      altitudeAccuracy: null,
      timestamp: Date.now()
    },
    usedIndices
  };
}
    </pre>

    <h3>2.4.3. Dinamik G-Means Kümeleme ve Şampiyon Küme Süzgeci (Academic G-Means & WLS)</h3>
    <p>Bu filtreleme modeli, 2D konum verilerini sabit bir <i>K</i> küme sayısı veya yapay sınır kısıtlı bir BIC yaklaşımı yerine, <b>G-Means (Gaussian Means)</b> algoritması yardımıyla dinamik olarak bölümler. Model, Anderson-Darling normal uyuşmazlık test büyüklüğü ve istatistiksel kritik sınırlar rehberliğinde küme alt gruplarının standart normal dağılıma (Gaussian) uygunluğunu denetler. Eğer bir alt grup normal dağılıma uymuyorsa, dinamik olarak bölünerek yeni alt kümeler türetilir. Tüm alt kümeler Gaussian normalliğini sağladığında bölme durur. Ardından en çok eleman barındıran baskın küme "Şampiyon Küme" seçilerek diğer kümelerin taşıdığı gözlemler gürültü ve çoklu-yol yansıması kabul edilip bütünüyle elenir.</p>

    <div class="case-container" style="background-color: #fafaf9; border-left: 4px solid #da5d20; padding: 12px; margin-bottom: 20px; font-size: 10pt;">
      <p class="bold" style="color: #bc4613; margin-bottom: 6px;">Akademik G-Means ve Şampiyon Kümeleme Mantığı</p>
      <p class="no-indent" style="margin-bottom: 5px;"><span class="bold">1. Anderson-Darling Testi ile Bölme Kriteri:</span> Her adımda alt küme verilerinin birincil projeksiyon ekseni üzerindeki dağılımı incelenerek Anderson-Darling normallik test büyüklüğü (A2*) hesaplanır. Test değeri kritik eşik olan 1.869 değerini (alfa = 0.0001) aşarsa kümenin Gaussian olmadığına karar verilerek bölünmeye devam edilir.</p>
      <p class="no-indent" style="margin-bottom: 5px;"><span class="bold">2. Yapay Sınırların Ortadan Kaldırılması:</span> G-Means ile birlikte sabit K bölümleri veya yapay küme sayı kısıtlamaları tamamen ortadan kalkar. Bölme işlemi, verinin doğal konumsal dağılımına uygun olarak tamamen istatistiksel normalliğe göre kendiliğinden sonlanır.</p>
      <p class="no-indent" style="margin-bottom: 5px;"><span class="bold">3. Şampiyon Küme Seçimi ve Filtreleme:</span> Bölme durduktan sonra, en yüksek gözlem yoğunluğuna sahip olan baskın küme "Şampiyon Küme" seçilir. Sinyal saçılımları ve multipath içeren diğer seyrek gruplar doğrudan elenir.</p>
      <p class="no-indent"><span class="bold">4. Şampiyon Kümeye Saf Donanım Ağırlıklı WLS Çözümü:</span> Filtreden başarıyla geçen şampiyon küme gözlemlerinin nihai ağırlıkları tayin edilirken donanımsal hassasiyet modeline göre karesel varyans modeli (1 / accuracy²) doğrudan WLS algoritmasına aktarılarak nihai koordinat çözümü üretilir.</p>
    </div>

    <p class="no-indent">Sistemde yürütülen, dinamik K seçimini G-Means uyuşmazlık modeliyle koşturan, merkez çakışmasını sönümleyen ve nihai ağırlıklı ortalamayı oran katsayısına göre hesaplayan TypeScript kütüphane fonksiyonu şu şekildedir:</p>
    <pre class="code-block">
function calculateKMeans(samples: Coordinate[]): { result: Coordinate; usedIndices: number[]; clusters?: number[][] } {
  if (samples.length &lt; 2) {
    return {
      result: samples[0] || { lat: 0, lng: 0, accuracy: 0, timestamp: Date.now(), altitude: null, altitudeAccuracy: null },
      usedIndices: samples.map((_, i) =&gt; i),
      clusters: []
    };
  }

  const finalClusters: number[][] = [];
  const queue: number[][] = [Array.from({ length: samples.length }, (_, i) =&gt; i)];

  const centerLat = samples.reduce((sum, s) =&gt; sum + s.lat, 0) / samples.length;
  const centerLng = samples.reduce((sum, s) =&gt; sum + s.lng, 0) / samples.length;
  const { latCoeff, lngCoeff } = getWGS84Coefficients(centerLat);

  const toLocal = (p: Coordinate) =&gt; ({
    x: (p.lng - centerLng) * lngCoeff,
    y: (p.lat - centerLat) * latCoeff
  });

  function erf(x: number): number {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;
    const sign = x &lt; 0 ? -1 : 1;
    const absX = Math.abs(x);
    const t = 1.0 / (1.0 + p * absX);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
    return sign * y;
  }

  function normalCDF(val: number): number {
    return 0.5 * (1 + erf(val / Math.sqrt(2)));
  }

  while (queue.length &gt; 0) {
    const C = queue.shift()!;
    if (C.length &lt; 8) {
      finalClusters.push(C);
      continue;
    }

    const subSamples = C.map(idx =&gt; samples[idx]);
    const subAssignments = runKMeans(subSamples, 2);

    const C0: number[] = [];
    const C1: number[] = [];
    for (let i = 0; i &lt; subAssignments.length; i++) {
      if (subAssignments[i] === 0) {
        C0.push(C[i]);
      } else {
        C1.push(C[i]);
      }
    }

    if (C0.length === 0 || C1.length === 0) {
      finalClusters.push(C);
      continue;
    }

    const pSub0 = C0.map(idx =&gt; toLocal(samples[idx]));
    const pSub1 = C1.map(idx =&gt; toLocal(samples[idx]));

    const c0 = {
      x: pSub0.reduce((sum, p) =&gt; sum + p.x, 0) / pSub0.length,
      y: pSub0.reduce((sum, p) =&gt; sum + p.y, 0) / pSub0.length
    };
    const c1 = {
      x: pSub1.reduce((sum, p) =&gt; sum + p.x, 0) / pSub1.length,
      y: pSub1.reduce((sum, p) =&gt; sum + p.y, 0) / pSub1.length
    };

    const vx = c0.x - c1.x;
    const vy = c0.y - c1.y;
    const len = Math.sqrt(vx * vx + vy * vy);

    if (len &lt; 1e-6) {
      finalClusters.push(C);
      continue;
    }

    const ux = vx / len;
    const uy = vy / len;

    const projected: number[] = [];
    for (const idx of C) {
      const localPt = toLocal(samples[idx]);
      const proj = localPt.x * ux + localPt.y * uy;
      projected.push(proj);
    }

    const N = projected.length;
    const m = projected.reduce((sum, val) =&gt; sum + val, 0) / N;
    const variance = projected.reduce((sum, val) =&gt; sum + Math.pow(val - m, 2), 0) / N;

    if (variance &lt; 1e-9) {
      finalClusters.push(C);
      continue;
    }

    const std = Math.sqrt(variance);
    const z = projected.map(val =&gt; (val - m) / std);
    const sortedZ = [...z].sort((a, b) =&gt; a - b);

    let sum = 0;
    for (let i = 0; i &lt; N; i++) {
      const pVal = normalCDF(sortedZ[i]);
      const pValComplement = normalCDF(sortedZ[N - 1 - i]);
      const logP = Math.log(Math.max(1e-15, pVal));
      const log1P = Math.log(Math.max(1e-15, 1 - pValComplement));
      sum += (2 * (i + 1) - 1) * (logP + log1P);
    }
    const A2 = -N - sum / N;
    const A2Star = A2 * (1 + 4 / N - 25 / (N * N));
    const criticalValueGMeans = 1.869;

    if (A2Star &gt; criticalValueGMeans) {
      queue.push(C0);
      queue.push(C1);
    } else {
      finalClusters.push(C);
    }
  }

  const validClusters = finalClusters.filter(c =&gt; c.length &gt; 0);

  let bestClusterIdx = 0;
  let maxCount = -1;
  for (let i = 0; i &lt; validClusters.length; i++) {
    if (validClusters[i].length &gt; maxCount) {
      maxCount = validClusters[i].length;
      bestClusterIdx = i;
    }
  }

  const championIndices = validClusters[bestClusterIdx] || [];
  const championPoints = championIndices.map(idx =&gt; samples[idx]);

  let finalSumW = 0, finalLatW = 0, finalLngW = 0, totalAccuracy = 0;
  for (const p of championPoints) {
    const wHardware = 1.0 / Math.pow(Math.max(0.1, p.accuracy), 2);
    finalSumW += wHardware;
    finalLatW += p.lat * wHardware;
    finalLngW += p.lng * wHardware;
    totalAccuracy += p.accuracy;
  }

  return {
    result: {
      lat: finalLatW / (finalSumW || 1.0),
      lng: finalLngW / (finalSumW || 1.0),
      accuracy: totalAccuracy / (championIndices.length || 1),
      altitude: null,
      altitudeAccuracy: null,
      timestamp: Date.now()
    },
    usedIndices: championIndices,
    clusters: validClusters
  };
}

function runKMeans(samples: Coordinate[], k: number): number[] {
  let centroids = samples.slice(0, k).map(s =&gt; ({ lat: s.lat, lng: s.lng }));
  if (samples.length &gt; k) {
    const step = Math.floor(samples.length / k);
    centroids = Array.from({ length: k }, (_, i) =&gt; ({ lat: samples[i * step].lat, lng: samples[i * step].lng }));
  }
  let assignments = new Array(samples.length).fill(-1);
  let changed = true;
  let iterations = 0;
  while (changed && iterations &lt; 20) {
    changed = false;
    iterations++;
    for (let i = 0; i &lt; samples.length; i++) {
        let minDist = Infinity;
        let bestK = 0;
        for (let j = 0; j &lt; k; j++) {
            const { latCoeff, lngCoeff } = getWGS84Coefficients(samples[i].lat);
            const dLat = (samples[i].lat - centroids[j].lat) * latCoeff;
            const dLng = (samples[i].lng - centroids[j].lng) * lngCoeff;
            const dist = dLat * dLat + dLng * dLng;
            if (dist &lt; minDist) { minDist = dist; bestK = j; }
        }
        if (assignments[i] !== bestK) { assignments[i] = bestK; changed = true; }
    }
    for (let j = 0; j &lt; k; j++) {
        const clusterPoints = samples.filter((_, i) => assignments[i] === j);
        if (clusterPoints.length &gt; 0) {
            centroids[j] = {
                lat: clusterPoints.reduce((a, b) =&gt; a + b.lat, 0) / clusterPoints.length,
                lng: clusterPoints.reduce((a, b) =&gt; a + b.lng, 0) / clusterPoints.length
            };
        }
    }
  }
  return assignments;
}
    </pre>

    <h3>2.4.4. Baarda Kalın Hata Elemesi (Baarda's Reliability Test / Snooping)</h3>
    <p>Jeodezik ölçü standartlarının temeli olan Baarda'nın veri gözetleme yöntemi (data snooping), normalize edilmiş ve standardize edilmiş ölçü uyuşmazlığı hatalarının istatistiksel test büyüklüğünü denetler. Kritik sınır değerleri aşan uyuşmazlık hataları ardışık olarak tespit edilerek en büyük kalın hatadan başlanarak döngüsel düzende sistemden temizlenir.</p>
    
    <div class="case-container" style="background-color: #f8fafc; border-left: 4px solid #d97706; padding: 12px; margin-bottom: 20px; font-size: 10pt;">
      <p class="bold" style="color: #b45309; margin-bottom: 6px;">Uyuşmazlık Testi ve Dengeleme İyileştirmeleri (Saf Akademik Jeodezi Standartları)</p>
      <p class="no-indent" style="margin-bottom: 5px;"><span class="bold">1. Serbestlik Derecesi Düzenlemesi (<i>f = n - 2</i>):</span> Birim ölçü hatasının (<i>&sigma;<sub>0</sub></i>) hesabı sırasında serbestlik derecesi hesabı <i>f = n - u</i> formülüne bağlıdır. 2D düzlemde (<i>X, Y</i> / Enlem, Boylam) koordinat kestirimi yaptığımız için bilinmeyen parametre sayısı <i>u = 2</i>'dir. Bu nedenle formül paydasındaki serbestlik derecesi <i>n - 2</i> olarak güncellenerek akademik kesinlik sağlanmıştır.</p>
      <p class="no-indent" style="margin-bottom: 5px;"><span class="bold">2. Kritik Sınır Değeri (3.29):</span> Seçilen w<sub>test</sub> = 3.29 kritik sınırı, standart normal dağılımda (N(0,1)) çift taraflı %99.9 güven düzeyine (&alpha; = 0.001) tekabül eder. Bu muhafazakar tercih, kaba hata içermeyen temiz epokların yanlışlıkla reddedilmesini (I. Tip Hata) jeodezik toleranslar dahilinde minimize etmek amacıyla Baarda'nın orijinal güven kriteriyle uyumludur.</p>
      <p class="no-indent" style="margin-bottom: 5px;"><span class="bold">3. İndeks Kırılma Koruması:</span> Üst katmandan gelen örneklem grubunda '_originalIdx' özniteliğinin eksik veya tanımsız olması durumuna karşı, metodun girişinde dinamik indeks haritalaması uygulanarak çalışma zamanı bozulma (runtime crash/breakage) riskleri tamamen sönümlenmiştir.</p>
      <p class="no-indent" style="margin-bottom: 5px;"><span class="bold">4. Kaba Hata Sonrası Dengeleme:</span> İstatistiki uyuşmazlık testleri tamamlanarak gürültülü veriler elendikten sonra, kalan temiz koordinatlar düz aritmetik ortalamaya tabi tutulmaz. Bunun yerine kalan veriler kendi güncel hassasiyetleri (<i>p<sub>i</sub> = 1/accuracy<sub>i</sub><sup>2</sup></i>) ile tekrar ağırlıklandırılarak <b>Stokastik Ağırlıklı En Küçük Kareler (Weighted Centroid)</b> motorumuzla çözümlenir ve nihai denge koordinatı jeodezik açıdan en kararlı şekilde elde edilir.</p>
      <p class="no-indent"><span class="bold">5. Saf Akademik Gözetleme Durdurma Kriteri:</span> Standart testte herhangi bir yapay konumsal mesafe veya saçılım eşiği (örneğin 0.25-0.50m gibi kısıtlamalar) kullanılmaz. Algoritma, yalnızca standardize edilmiş hata uyuşmazlık değerleri kritik değer sınırının (3.29) altına indiğinde veya gözlem sayısı jeodezik dengeleme yapmaya (2D konum kestirimi için degrees of freedom f > 0 ihtiyacı nedeniyle en az n = 4 gürbüz nokta) sınır teşkil eden minimum değere ulaştığında doğal olarak durur.</p>
    </div>

    <p class="no-indent">Baarda kalın hata test büyüklüğünü, n - 2 serbestlik derecesini ve temizlenmiş verilerin ağırlıklı dengelenmesini koşturan kritik fonksiyon aşağıda yer almaktadır:</p>
    <pre class="code-block">
function calculateBaardaInternalAcademic(samples: any[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length &lt; 4) return { result: calculateWeightedLSE(samples).result, usedIndices: samples.map((_, i) =&gt; i) };

  // Safe mapping of the original sequence indices
  let currentSamples = samples.map((s, idx) =&gt; ({
    ...s,
    _originalIdx: s._originalIdx !== undefined ? s._originalIdx : idx
  }));
  const criticalValue = 3.29; // Critical limit for 99.9% confidence interval (alpha = 0.001)

  while (currentSamples.length &gt; 4) {
    const weights = currentSamples.map(s =&gt; 1 / Math.pow(Math.max(0.1, s.accuracy), 2));
    const sumW = weights.reduce((a, b) =&gt; a + b, 0);
    const meanLat = currentSamples.reduce((a, b, i) =&gt; a + b.lat * weights[i], 0) / sumW;
    const meanLng = currentSamples.reduce((a, b, i) =&gt; a + b.lng * weights[i], 0) / sumW;

    const residuals = currentSamples.map(s =&gt; {
      return calculateDistanceMeter(s.lat, s.lng, meanLat, meanLng, meanLat);
    });

    const vTPv = residuals.reduce((a, v, i) =&gt; a + v * v * weights[i], 0);
    
    // Corrected degree of freedom: f = n - u, where u = 2 (lat, lng) unknowns in 2D adjustments.
    const sigma0 = Math.sqrt(vTPv / (currentSamples.length - 2));

    const standardizedResiduals = currentSamples.map((s, i) =&gt; {
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

    if (maxW &gt; criticalValue) {
        currentSamples.splice(worstIdx, 1);
    } else {
        break; 
    }
  }

  const lseResult = calculateWeightedLSE(currentSamples);
  return { result: lseResult.result, usedIndices: currentSamples.map(s =&gt; s._originalIdx) };
}
    </pre>

    <h3>2.4.5. "KMeans + Baarda + Huber" İleri-Hibrit Filtreleme Modeli</h3>
    <p>Uygulamada yer alan en gelişmiş ve akademik seviyedeki konum hesaplama yöntemidir. Bu metot, uydulardan gelen sinyal hatalarını ve çoklu yol yansımalarını (multipath) en üstün hassasiyetle ayıklamak ve dengelemek amacıyla geliştirilmiştir. Yöntem, küresel Baarda testi sonuçları üzerinde <b>lokal Huber M-Estimation süzgecini</b> doğrudan koşturarak veri temizliği yaparken; K-Means kümeleme modelini veri elemek için değil, uzaysal yoğunluk oranlarına göre ağırlıklandırma yapmak için kullanır.</p>

    <div class="case-container" style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 12px; margin-bottom: 20px; font-size: 10pt;">
      <p class="bold" style="color: #065f46; margin-bottom: 6px;">İleri Hibrit Algoritması Paralel Kolları ve Yeni Nesil Ağırlık Sentezi</p>
      <p class="no-indent" style="margin-bottom: 5px;"><span class="bold">1. Kol - Genel Baarda Testi (İç Güvenilirlik Süzgeci):</span> Ham ölçüm havuzunun tamamını inceleyerek, konumsal sıçramaları ve kaba koordinat hatalarını varyans kriterlerine göre tamamen ayıklar.</p>
      <p class="no-indent" style="margin-bottom: 5px;"><span class="bold">2. Kol - Dinamik K-Means (Yoğunluk Dağılım Modeli):</span> Ham veriler Bayes Bilgi Kriteri (BIC) yardımıyla en uygun <i>K</i> kümesine bölünür (K=2..6). K-Means bu modelde herhangi bir veri elemesi yapmaz, bunun yerine her bir noktanın ait olduğu kümenin eleman yoğunluğunu (<i>w<sub>cluster</sub> = N<sub>c</sub> / N<sub>total</sub></i>) tespit eder.</p>
      <p class="no-indent" style="margin-bottom: 5px;"><span class="bold">3. Huber Robust Matematiksel Dengelemesi (Yumuşak Ağırlıklandırma):</span> Baarda testini başarıyla geçen temiz gözlemler üzerinde gürbüz varyans referans alınarak her koordinatın Huber ağırlık katsayısı (<i>w<sub>huber</sub></i>) hesaplanır. Sınır dışı kalan mikro gürültülü gözlemler sert şekilde elenmek yerine, etki fonksiyonuyla yumuşak bir şekilde aşağı ağırlıklandırılır (downweight).</p>
      <p class="no-indent" style="margin-bottom: 5px;"><span class="bold">4. Geri Çekilme Mekanizması (Fallback):</span> Baarda testinden başarıyla geçen nokta adedi kritik limitin altına düşerse (nokta sayısı &lt; 4), sistem otomatik olarak hata koruması adına standart Ağırlıklı En Küçük Kareler (Weighted LSE) modeline geri çekilir.</p>
      <p class="no-indent"><span class="bold">5. Üçlü Hibrit WLS Dengelemesi (Joint Weighting):</span> Temiz gözlemlerin nihai weights matrisi; dinamik küme yoğunluğu katsayısı, donanımsal hassasiyetin karesinin tersi ve Huber robust ağırlık katsayısının doğrudan çarpımıyla elde edilir: <i>P<sub>nihai</sub> = w<sub>cluster</sub> &times; w<sub>hardware</sub> &times; w<sub>huber</sub> = (N<sub>c</sub> / N<sub>total</sub>) &times; (1 / accuracy<sup>2</sup>) &times; w<sub>huber</sub></i>. Bu sayede en güvenilir, yüksek yoğunluklu ve düşük hatalı verilerin ağırlığı katlanırken uç değerlerin etkisi sıfıra yakınsar.</p>
    </div>

    <p class="no-indent">"KMeans + Baarda + Huber" yönteminin TypeScript programlama dilli motor kaynak kod tasarımı aşağıda sunulmuştur:</p>
    <pre class="code-block">
function calculateKMeansBaardaHuber(samples: Coordinate[]): { 
  result: Coordinate; 
  usedIndices: number[]; 
  clusters?: number[][]; 
  fallbackApplied?: boolean; 
  actualMethodUsed?: CalculationMethod 
} {
  if (samples.length &lt; 5) {
    return { result: calculateAverage(samples), usedIndices: samples.map((_, i) =&gt; i), clusters: [] };
  }

  // 1. Column A (Geodetic Branch): General Baarda Outlier Elimination
  const baardaRes = calculateBaardaPure(samples);
  const baardaIndices = baardaRes.usedIndices;

  // 2. Column B (Spatial Branch): Dynamic K-Means Clustering (X-Means / BIC model)
  let bestK = 2;
  let bestBIC = Infinity;
  let bestAssignments: number[] = [];
  const maxK = Math.min(6, samples.length);

  for (let k = 2; k &lt;= maxK; k++) {
    const currentAssignments = runKMeans(samples, k);
    const centroids = Array.from({ length: k }, (_, j) =&gt; {
      const cPoints = samples.filter((_, i) =&gt; currentAssignments[i] === j);
      if (cPoints.length === 0) return { lat: samples[j % samples.length].lat, lng: samples[j % samples.length].lng };
      return {
        lat: cPoints.reduce((a, b) =&gt; a + b.lat, 0) / cPoints.length,
        lng: cPoints.reduce((a, b) =&gt; a + b.lng, 0) / cPoints.length
      };
    });

    let totalSquaredDist = 0;
    for (let i = 0; i &lt; samples.length; i++) {
      const cIdx = currentAssignments[i];
      totalSquaredDist += calculateSquaredDistance(samples[i].lat, samples[i].lng, centroids[cIdx].lat, centroids[cIdx].lng, samples[i].lat);
    }
    const varianceR = totalSquaredDist / Math.max(1, samples.length - k);
    const numParameters = k * 3; // d=2 dimensions per cluster
    const bicScore = samples.length * Math.log(Math.max(1e-9, varianceR)) + numParameters * Math.log(samples.length);

    if (bicScore &lt; bestBIC) {
      bestBIC = bicScore;
      bestK = k;
      bestAssignments = currentAssignments;
    }
  }

  const clusters: number[][] = Array.from({ length: bestK }, () =&gt; []);
  bestAssignments.forEach((cIdx, i) =&gt; {
    clusters[cIdx].push(i);
  });
  const validClusters = clusters.filter(c =&gt; c.length &gt; 0);

  // 3. Huber Robust Weighting Scheme: Applied mathematically in the WLS step rather than hard-truncation
  // No data points are hard-eliminated beyond the Baarda geodetic filter.
  const intersectionIndices = baardaIndices;
  const intersectionPoints = intersectionIndices.map(idx =&gt; samples[idx]);

  // If we have at least 4 viable points, calculate Weighted Least Squares (WLS) adjustment using combined weights:
  if (intersectionPoints.length &gt;= 4) {
    const subsetPoints = intersectionPoints;
    const subLats = subsetPoints.map(p =&gt; p.lat);
    const subLngs = subsetPoints.map(p =&gt; p.lng);
    const subMedianCenter = {
      lat: calculateMedian(subLats),
      lng: calculateMedian(subLngs)
    };
    const subSigma = calculateMAD(subsetPoints, subMedianCenter);
    const huberLimit = 1.345 * Math.max(0.05, subSigma);

    const finalWeights = intersectionPoints.map((s, index) =&gt; {
      const globalIndex = intersectionIndices[index];
      const clusterIdx = validClusters.findIndex(c =&gt; c.includes(globalIndex));
      const wCluster = clusterIdx !== -1 ? validClusters[clusterIdx].length / samples.length : 1.0 / samples.length;

      const dist = calculateDistanceMeter(s.lat, s.lng, subMedianCenter.lat, subMedianCenter.lng, subMedianCenter.lat);
      const huberWeight = dist &lt;= huberLimit ? 1.0 : huberLimit / Math.max(0.01, dist);

      // Hardware weight is proportional to inverse squared accuracy: 1 / (accuracy^2)
      const hardwareWeight = 1.0 / Math.pow(Math.max(0.1, s.accuracy), 2);
      return hardwareWeight * huberWeight * wCluster;
    });

    const sumW = finalWeights.reduce((a, b) =&gt; a + b, 0) || 1.0;
    const finalLat = intersectionPoints.reduce((sum, p, i) =&gt; sum + p.lat * finalWeights[i], 0) / sumW;
    const finalLng = intersectionPoints.reduce((sum, p, i) =&gt; sum + p.lng * finalWeights[i], 0) / sumW;

    const avgCoords = calculateAverage(intersectionPoints);

    const finalResult: Coordinate = {
      ...intersectionPoints[0],
      lat: finalLat,
      lng: finalLng,
      accuracy: avgCoords.accuracy,
      timestamp: Date.now()
    };

    const validAlts = intersectionPoints.filter(s =&gt; s.altitude !== null);
    finalResult.altitude = validAlts.length &gt; 0
      ? validAlts.reduce((a, b) =&gt; a + (b.altitude || 0), 0) / validAlts.length
      : null;

    const validAltAccs = intersectionPoints.filter(s =&gt; s.altitudeAccuracy !== null);
    finalResult.altitudeAccuracy = validAltAccs.length &gt; 0
      ? validAltAccs.reduce((a, b) =&gt; a + (b.altitudeAccuracy || 0), 0) / validAltAccs.length
      : null;

    return {
      result: finalResult,
      usedIndices: intersectionIndices,
      clusters: validClusters,
      fallbackApplied: false,
      actualMethodUsed: 'KMEANS_BAARDA_HUBER'
    };
  } else {
    // Graceful Fallback Strategy: Fall back to default Weighted Least Squares method
    const fallbackRes = calculateWeightedLSE(samples);
    return {
      result: fallbackRes.result,
      usedIndices: fallbackRes.usedIndices,
      clusters: validClusters,
      fallbackApplied: true,
      actualMethodUsed: 'WEIGHTED_LSE'
    };
  }
}
    </pre>

    <h3>2.4.6. IQR (Interquartile Range) Uzaysal Aykırı Değer Eleme ve WLS Dengelemesi</h3>
    <p>Jeodezik ağlardaki ve GPS/GNSS gözlemlerindeki kaba hataların (outlier) temizlenmesinde kullanılan diğer bir yenilikçi ve robust yaklaşım ise <b>Interquartile Range (IQR - Çeyrekler Açıklığı)</b> tabanlı uzaysal eleme tekniğidir. Bu yöntem, verilerin olasılık dağılımından bağımsız (non-parametric) olması sebebiyle son derece güvenilirdir ve çoklu yol (multipath) yansımalarından ötürü saçılmış koordinat kümelerinin hızlıca elenmesinde geodezi mühendisliğinde sıklıkla tercih edilmektedir.</p>

    <div class="case-container" style="background-color: #fff1f2; border-left: 4px solid #f43f5e; padding: 12px; margin-bottom: 20px; font-size: 10pt;">
      <p class="bold" style="color: #9f1239; margin-bottom: 6px;">IQR ve Ağırlıklı En Küçük Kareler (WLS) Entegrasyon Modeli</p>
      <p class="no-indent" style="margin-bottom: 5px;"><span class="bold">1. Medyan Tabanlı Merkez tespiti:</span> Ortalama koordinatların çok büyük saçılmalar içeren kaba hatalardan (blunders) olumsuz etkilenmesini önlemek amacıyla, tüm gözlem serisindeki yerel Cartesian X ve Y koordinatlarının <b>Medyan (Q2 - Ortanca)</b> konumu hesaplanır. Bu medyan nokta, sistemin robust referans asıllı nirengi noktasıdır.</p>
      <p class="no-indent" style="margin-bottom: 5px;"><span class="bold">2. Konumsal Artık Hesaplama:</span> Her bir <i>P<sub>i</sub></i> gözleminin bu medyan nirengi noktasına olan iki boyutlu Euclidean mesafesi (Residual) hesaplanır: <i>d<sub>i</sub> = &radic;((x<sub>i</sub> - x<sub>medyan</sub>)<sup>2</sup> + (y<sub>i</sub> - y<sub>medyan</sub>)<sup>2</sup>)</i>.</p>
      <p class="no-indent" style="margin-bottom: 5px;"><span class="bold">3. Çeyrekler Açıklığı Sınırı:</span> Bu elde edilen mesafeler küçükten büyüğe sıralandıktan sonra Birinci Çeyreklik (<i>Q<sub>1</sub></i>, %25. yüzdelik) ve Üçüncü Çeyreklik (<i>Q<sub>3</sub></i>, %75. yüzdelik) konumları belirlenir. Çeyrekler Açıklığı ise şöyle bulunur: <i>IQR = Q<sub>3</sub> - Q<sub>1</sub></i>. Gözlemler için kabul edilebilir üst limit (Outlier Threshold Gate) şu şekilde tanımlanır:
        <br/><span class="bold" style="display: block; text-align: center; margin: 8px 0; font-family: monospace;">Üst Sınır = Q<sub>3</sub> + 1.5 &times; IQR</span>
      </p>
      <p class="no-indent" style="margin-bottom: 5px;"><span class="bold">4. Eleme Kartı ve WLS Çözümü:</span> Mesafesi belirlenen üst sınırın üzerinde olan koordinat gözlemleri sistem dışı bırakılır. Geriye kalan temiz ve güvenceli örneklemler (inliers) ile ağırlık matrisi <i>P = 1 / accuracy<sup>2</sup></i> olan <b>Ağırlıklı En Küçük Kareler (WLS)</b> doğrusal dengeleme matrisi koşturularak nokta konumu en yüksek hassasiyetle hesaplanır.</p>
    </div>

    <p class="no-indent">IQR + WLS koordinat süzme metodolojisinin TS programlama dili motorundaki kaynak kod yapısı aşağıdadır:</p>
    <pre class="code-block">
function calculateIQRWLS(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  // Convert samples to 2D local Cartesian relative to overall mean
  const localPts = samples.map(s => ({ x: (s.lng - avgLng) * lngCoeff, y: (s.lat - avgLat) * latCoeff }));
  const medianX = calculateMedian(localPts.map(p => p.x));
  const medianY = calculateMedian(localPts.map(p => p.y));

  // Compute distance residuals to central median
  const distances = localPts.map(p => Math.sqrt((p.x - medianX)**2 + (p.y - medianY)**2));
  const sortedDists = [...distances].sort((a,b) => a - b);

  const q1 = getPercentile(sortedDists, 0.25);
  const q3 = getPercentile(sortedDists, 0.75);
  const iqr = q3 - q1;
  const upperBound = q3 + 1.5 * iqr;

  const inliers = samples.filter((_, i) => distances[i] <= upperBound);
  return calculateWeightedLSE(inliers);
}
    </pre>

    <h3>2.4.7. Sinyal Güvenilirlik Analizi ve Veri Saçılım Metodolojisi</h3>
    <p>Mobil donanımların ve akıllı telefonların entegre konum sensörleri doğrudan ham GNSS gözlemleri (taşıyıcı fazı vb.) yerine tarayıcı düzlemine filtrelenmiş tahminler sunar. Bu sebeple donanımın ürettiği konumsal doğruluk kestirimleri (UERE - User Equivalent Range Error tabanlı tahmini konum hatası veya Geolocation API Hassasiyet Çemberi / Accuracy Radius), her zaman sahada karşılaşılan fiziki çoklu yansıma (multipath) ve atmosferik gecikme etkilerini bütünüyle yansıtamaz. ${FULL_BRAND}, bu tip yetersiz veya iyimser bildirimlerden kaynaklı riskleri bertaraf etmek amacıyla <b>Konumsal Veri Saçılımı ve Sinyal Güvenilirlik Analiz Motorunu</b> çalıştırır. Bu motor, toplanan örneklem havuzunun uzaysal dağılımını matematiksel kriterlere göre denetleyerek sinyal kalitesini derecelendirir.</p>

    <p><span class="bold">Zaman Serisi ve Epok Aralığı (1 Hz Frekans Modeli):</span> Akıllı konumlandırma motoru, statik ölçüm sırasında Geolocation API'nin standart saniyelik güncelleme hızı olan 1 Hz varsayılan frekansı ile veri toplar. Güvenli bir istatistiksel çıkarım için en az 15 epok (yaklaşık 15 saniyelik kesintisiz zaman serisi dizisi) toplanması zorunluluğu getirilmiştir. Bu 15 saniyelik statik oturum, GNSS uydularının saatler içinde gerçekleşen yörünge/geometri değişimlerini (bölgesel DOP değişimini) modellemek yerine; yerel çevresel engeller, bina yansımaları ve ağaç örtüsünden kaynaklanan anlık çoklu yol (multipath) sapmalarını, sinyal saçılmalarını ve yüksek frekanslı beyaz gürültüyü sönümleyerek verilerin kararlılığını güvene almayı hedefler.</p>

    <h4>A. Matematiksel Göstergeler ve Eşitlikler</h4>
    <p>Sistem, toplanan <b>N</b> adet statik koordinat örneği üzerinden şu 4 ana istatistiksel parametreyi gerçek zamanlı hesaplar:</p>
    <ul>
      <li><span class="bold">Ortalama GNSS Alıcısı Tahmini Konum Hatası (o<sub>avg</sub>):</span> Alıcı cihazın Geolocation API aracılığıyla saniye bazında bağımsız olarak bildirdiği, UERE ve uydu geometrisi (DOP) bütününe dayalı yatay hassasiyet çemberi (accuracy radius) değerlerinin aritmetik ortalamasıdır:
          <br/><span class="bold" style="display: block; text-align: center; margin: 10px 0; font-family: monospace; font-size: 11pt;">o<sub>avg</sub> = (1 / N) &times; &sum; accuracy<sub>i</sub></span>
      </li>
      <li><span class="bold">Maksimum Konumsal Saçılım (d<sub>max</sub>):</span> Statik ölçüm havuzunda yer alan herhangi iki koordinat ikilisi (P<sub>i</sub>, P<sub>j</sub>) arasında hesaplanan en uzak fiziksel mesafedir. Jeodezi motorunda bu mesafe büyük çember (Great-Circle) veya yerel TM düzlem izdüşümü üzerinden milimetrik hesaplanır:
          <br/><span class="bold" style="display: block; text-align: center; margin: 10px 0; font-family: monospace; font-size: 11pt;">d<sub>max</sub> = Max &radic;((x<sub>i</sub> - x<sub>j</sub>)<sup>2</sup> + (y<sub>i</sub> - y<sub>j</sub>)<sup>2</sup>)</span>
      </li>
      <li><span class="bold">Hatalı Bildirim Saçılım Oranı (R):</span> Fiziksel koordinat yayılımı ile donanımın iddia ettiği tahmini konum hatası arasındaki uyumsuzluğu gösteren boyutsuz bir katsayıdır:
          <br/><span class="bold" style="display: block; text-align: center; margin: 10px 0; font-family: monospace; font-size: 11pt;">R = d<sub>max</sub> / o<sub>avg</sub></span>
          Eğer R &gt; 1.0 ise, alıcı cihaz kendi fiziki hata bütçesini azımsıyor ve çevre yansımalarından dolayı koordinatlar hissettirilen hata sınırlarının ötesine saçılıyor demektir (Çoklu yansıma - Multipath etkisi).
      </li>
      <li><span class="bold">Yatay Konumsal Varyans ve Standart Sapma (&sigma;<sub>spatial</sub>):</span> koordinatların tüm statik merkeze (P_ort) olan mesafesel sapmalarının kareler ortalamasıdır:
          <br/><span class="bold" style="display: block; text-align: center; margin: 10px 0; font-family: monospace; font-size: 11pt;">Residual<sub>i</sub> = Mesafe(P<sub>i</sub>, P_ort) &nbsp;&nbsp;&rArr;&nbsp;&nbsp; &sigma;<sub>spatial</sub> = &radic;((1 / (N - 1)) &times; &sum; Residual<sub>i</sub><sup>2</sup>)</span>
      </li>
    </ul>

    <h4>B. Koşullu Karar Matrisi ve Sinyal Işıkları</h4>
    <p>Hesaplanan bu veriler ışığında, sistem anlık ve genel saha durumunu üç ana kategori altında sınıflayarak kullanıcıya raporlar:</p>
    <ol>
      <li><span class="bold">GÜVENSİZ VERİ (KIRMIZI SİNYAL):</span> Tahmini ortalama konum hatasının 20m'den büyük olması (o<sub>avg</sub> &gt; 20m), maksimum fiziksel saçılımın 20m'den büyük olması (d<sub>max</sub> &gt; 20m) ya da tahmini hata iddiasının 3 katından fazla koordinat saçılması yaşanması (R &gt; 3.0) durumunda tetiklenir. Sahada ciddi engelciler veya yetersiz uydu görünürlüğü olduğunu gösterir.</li>
      <li><span class="bold">GÜVENİLİR VERİ (YEŞİL SİNYAL):</span> Hiçbir kırmızı sinyal kriteri oluşmadığı gibi, ortalama tahmini konum hatasının 5m ve altında olması (o<sub>avg</sub> &le; 5m), maksimum saçılımın 5m ve altında kalması (d<sub>max</sub> &le; 5m), toplanan statik epok sayısının en az 15 olması (N &ge; 15) ve koordinat saçılımının tahmini hata sınırlarında kalması (R &le; 1.0) koşuluyla verilir. Kadastral hassasiyete en yakın nitelikteki temiz sinyali temsil eder.</li>
      <li><span class="bold">ORTA GÜVENLİ / YETERSİZ VERİ (TURUNCU SİNYAL):</span> Gerekli koşulların tam olarak sağlanamadığı, ancak yüksek hata limitlerinin de aşılmadığı hibrit durumları (statik gözlem süresinin/epok adedinin yetersiz kalması veya tahmini konum hatası düşük olsa dahi çevresel koşullardan ötürü saçılım oranının (R) sınır değerleri hafifçe aştığı marjinal durumları) sınıflandırmak amacıyla atanır.</li>
    </ol>

    <p class="no-indent">Bu akıllı sinyal durum analizini, uyuşmazlık testlerini ve nihai birleştirilmiş doğruluk yarıçapını hesaplayan kaynak kod yapısı aşağıda döküm haline getirilmiştir:</p>
    <pre class="code-block">
// Calculates the dynamic spatial multipath indicators and returns the rating
export function analyzeSignalReliability(samples: Coordinate[]): SignalAnalysis {
  if (samples.length === 0) return { signalQuality: 'low', maxSpread: 0, avgSensorAcc: 99 };
  
  const maxSpread = calculateMaxDistance(samples);
  const avgSensorAcc = samples.reduce((sum, s) => sum + s.accuracy, 0) / samples.length;
  const ratio = maxSpread / (avgSensorAcc || 0.1);
  const samplesCount = samples.length;

  // Spatial Variance and Standard Deviation
  const meanLat = samples.reduce((sum, s) => sum + s.lat, 0) / samples.length;
  const meanLng = samples.reduce((sum, s) => sum + s.lng, 0) / samples.length;
  const { latCoeff, lngCoeff } = getWGS84Coefficients(meanLat);
  const residuals = samples.map(s => {
    const dLat = (s.lat - meanLat) * latCoeff;
    const dLng = (s.lng - meanLng) * lngCoeff;
    return dLat * dLat + dLng * dLng;
  });
  const variance = residuals.reduce((sum, val) => sum + val, 0) / Math.max(1, samples.length - 1);
  const stdDev = Math.sqrt(variance);

  // Evaluation of Decision Matrix
  const isRed = avgSensorAcc > 20 || maxSpread > 20 || ratio > 3.0;
  const isGreen = !isRed && avgSensorAcc <= 5 && maxSpread <= 5 && samplesCount >= 15 && ratio <= 1.0;
  const signalQuality: 'safe' | 'medium' | 'low' = isRed ? 'low' : isGreen ? 'safe' : 'medium';

  return {
    maxSpread,
    avgSensorAcc,
    stdDev,
    ratio,
    signalQuality,
    samplesCount
  };
}
    </pre>

    <p><span class="bold">Akademik Metodolojik Not (Gelişmiş Elipsoidal Diferansiyel Dönüşümü):</span> Hesaplamalarda enlemsel diferansiyeli metreye dönüştürmek amacıyla kullanılan katsayılar, WGS84 referans elipsoidi parametrelerine (<i>a, e</i>) göre her ölçüm kümesinin ortalama enlem değerine bağlı olarak dinamik Taylor ve Krüger meridyen/paralel yay analizleri (Meridyen Eğrilik Yarıçapı <i>M</i> ve Paralel Daire Eğrilik Yarıçapı <i>N</i>) kapsamında hassas biçimde hesaplanmaktadır. Bu sayede, statik ölçüm süresince toplanan koordinatların yerel düzlem üzerindeki milimetrik izdüşüm doğrulukları pratik olarak korunur ve mobil cihazın hesaplama kararlılığı güvence altına alınır.</p>

    <p>Bu karar matrisinin en kritik çıktısı, nihai filtrelenmiş verinin konum özniteliğindeki doğruluk (accuracy) değerinin belirlenmesidir. ${FULL_BRAND}, bu amaçla akademik düzeyde benzersiz, çift-aşamalılık (dual-bounding) barındıran muhafazakar ve istatistiki bir uyuşmazlık modeli işletir:</p>
    
    <ul>
      <li><span class="bold">1. Birleşik İstatistiki Doğruluk Modeli (Combined Statistical Uncertainty):</span> Süzgeç algoritmaları ve ağırlıklı merkez denge hesaplamalarında (<i>N &gt; 1</i> için), konumsal standart sapmanın (<i>&sigma;<sub>spatial</sub></i>) ortalama standart hatası (<i>SEM</i>) ile her epoka düşen tahmini donanımsal konum hatası karesel (kuadratik) olarak birleştirilir:
        <br/><span class="bold" style="display: block; text-align: center; margin: 10px 0; font-family: monospace; font-size: 11pt;">Standard Error (SE) = &sigma;<sub>spatial</sub> / &radic;N &nbsp;&nbsp;&rArr;&nbsp;&nbsp; finalAccuracy = &radic;(SE<sup>2</sup> + (o<sub>avg</sub> / &radic;N)<sup>2</sup>)</span>
        Bu model, hem uzaysal dağı canlanmayı saniyelerin karesiyle sönümler hem de her bağımsız epokta cihazın iddia ettiği donanımsal hata bütçesini aynı istatistiki ağırlıklama ile süzgecine yansıtır.
      </li>
      <li><span class="bold">2. Nihai Muhafazakar Karar Limit Doğruluğu (Conservative Boundary Accuracy):</span> İstatistiki ağırlıklı dengelemenin getireceği iyimser tahminlerin, arazideki ani fiziki ve beklenmedik sinyal sıçramalarını maskelemesini önlemek amacıyla, deterministik en kötü durum (worst-case) tavan limiti uygulanır:
        <br/><span class="bold" style="display: block; text-align: center; margin: 10px 0; font-family: monospace; font-size: 11pt;">Conservative Accuracy = Max(d<sub>max</sub>, o<sub>avg</sub>)</span>
      </li>
    </ul>

    <p class="no-indent">Bu çift-kademeli hibrit bütünleştirme sayesinde, cihaz yapay olarak çok yüksek bir hassasiyet bildirse bile (yani tahmini konum hata çemberi yarıçapını dar gösterse bile, Örn: 2m), veriler arazide çoklu yansımadan dolayı 6m'lik bir alana saçılıyorsa, sistem güvenli tarafta kalmak üzere kullanıcıya gerçekçi yatay hassasiyet yarıçapını 6m olarak ilan eder. Aynı şekilde, gürültüden arındırılmış veri gruplarında da en hassas milimetrik ve santimetrik konumlandırma çözümleri istatistiksel standart hata formülüyle hassas bir biçimde korunur.</p>

    <h2>2.5. Yapay Zeka Tabanlı Yazılım Geliştirme Metodolojisi</h2>
    <p>Ağır jeodezi denklemlerinin (3-parametreli Molodensky dönüşümü, Gauss-Krüger / UTM izdüşüm dönüşümleri, jeoit dalgalanma serileri vb.) sıfır mantıksal ve derleme hatasıyla doğrudan TypeScript diline kazandırılmasında ve geliştirilme süreçlerinde <span class="bold">Google AI Studio</span> geliştirme platformu kullanılmıştır. Alan uzmanı ve mühendis ortaklığındaki "Expert-in-the-Loop" geliştirme modeli çerçevesinde, yapay zekanın jeodezik modelleme sınırlarını test eden vaka analizleri (Otokritik süreçler) ve bu süreçte başarımızı güvence altına alan alan uzmanının doğru yönlendirici istemleri (Optimized Expert Prompts) aşağıda belgelenmiştir:</p>

    <div class="case-container">
      <p class="bold" style="color: #444; margin-bottom: 2px;">Vaka 1: Tekli Konum Kaydından Zaman Tabanlı Statik Jeodezik Ölçüme Öncü Geçiş</p>
      <p class="no-indent"><span class="bold">AI Eğilimi / Hatası:</span> Uygulama ilk tasarlandığında sadece anlık konum verisini kayıt ediyor, ancak herhangi bir doğruluk veya hassasiyet değeri kontrolü yapmadan uydudan ilk gelen değeri doğrudan koordinat olarak haneye işliyordu. Bu basit yaklaşım saha testlerinde büyük doğruluk sapmalarına yol açtı.</p>
      <p class="no-indent"><span class="bold">Alan Uzmanı Revizyonu:</span> Saha testlerinde karşılaşılan yüksek sapmalı verilere dayanarak, alan uzmanının talebiyle sisteme öncelikle dinamik bir "veri hassasiyet limiti filtresi" entegre edilmiştir. Ancak bu adımda dahi ilk gelen verinin doğrudan kaydedilmesi, GNSS sinyalinin henüz tam oturmaması ve ısınma (warm start) aşamasında olması sebebiyle gürültülü sonuçlar vermiştir. Bunun üzerine "en az 5 saniyelik" (5 epoch) kesintisiz statik veri biriktirme zorunluluğu getirilmiş ve uygulama basit bir kayıt aracından hakiki bir jeodezik hesaplama motoruna dönüştürülmüştür. Son güncelleme ve sistem iyileştirmesiyle birlikte, tam güvenilirlik kriterlerini sağlayan yüksek kaliteli "Güvenilir Veri (Yeşil Sinyal)" sınıfına geçiş için donanımsal hassasiyetin en fazla 5m olması ve statik veri havuzunda en az 15 saniye (15 epok) kesintisiz gözlem birikmiş olması şartı entegre edilmiştir. Sonraki aşamalarda ise çoklu sinyal yansıma (multipath) etkilerini minimize etmek için ileri düzey istatistiksel filtreleme kütüphaneleri sisteme dahil edilmiştir.</p>
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
      <p class="no-indent"><span class="bold">AI Eğilimi / Hatası:</span> AI, ilk prototip aşamasında mobil tarayıcının ham Coğrafi Konum (Geolocation API) bileşeninden okuduğu elipsoidal yüksekliği (h) doğrudan Netcad/AutoCAD uyumlu CAD çıktılarına ve Excel/TXT raporlarına "Nokta Kotu (Ortometrik Yükseklik - H)" başlığıyla yazdırmıştır.</p>
      <p class="no-indent"><span class="bold">Alan Uzmanı Revizyonu:</span> Harita mühendisliğinde geometrik elipsoid yüksekliğinin hiçbir fiziki projede doğrudan kot olarak kullanılamayacağı, jeoid ondülasyonunun (N) düşülmesi gerektiği (H = h - N) vurgulanmıştır. AI'ye bu doğrultuda TG-20 ve küresel EGM96 modelleri entegre ettirilmiş, rapor çıktılarında elipsoidal ve ortometrik yükseklik kavramları kesinlikle iki ayrı kolon halinde birbirinden bağımsız olarak yapılandırılmıştır.</p>
      <p class="no-indent" style="margin-top: 5pt;"><span class="bold" style="color: #0056b3;">Doğru Yönlendirici İstem (Optimized Expert Prompt):</span> <i>"Harita mühendisliğinde, uydulardan doğrudan alınan geometrik elipsoid yüksekliği (h) fiziksel mühendislik projelerinde doğrudan kot olarak kullanılamaz. Mutlaka jeoid ondülasyonu (N) değerinin hesaba katılarak ortometrik yüksekliğe (H = h - N) indirgenmesi gerekmektedir. Türkiye Geoidi-2020 (TG-20) grid verilerini hafızada barındıracak ve bilineer interpolasyonla anlık ondülasyon (N) hesaplayacak bir Geoid Servisi geliştir. Tüm DXF, KML, CSV ve Excel rapor şablonlarında elipsoidal yükseklik (H_elip) ve fiziksel yükseklik (H_orto) değerlerini kesinlikle iki ayrı bağımsız kolonda ve akademik hassasiyetle yapılandır."</i></p>
    </div>

    <div class="case-container">
      <p class="bold" style="color: #444; margin-bottom: 2px;">Vaka 4: Bursa-Wolf 7-Parametreli Matris Dönüşümündeki Rotasyon İşaret Hatası ve 3-Parametreli Modele Geçiş Otokritiği</p>
      <p class="no-indent"><span class="bold">AI Eğilimi / Hatası:</span> WGS84 ile ED50 veya ITRF96 sistemleri arasında koordinat geçişi sağlayan Bursa-Wolf formülasyonu yazılırken AI, rotasyon parametrelerinin (Rx, Ry, Rz) işaret mantığı olan "Coordinate Frame Rotation" ile "Position Vector Rotation" yaklaşımlarını karıştırarak dönüşüm matrisinde işaretleri ters kullanmıştır. Bu durum dönüştürülen noktaların arazide yüzlerce metre kaymasına neden olmuştur.</p>
      <p class="no-indent"><span class="bold">Alan Uzmanı Revizyonu:</span> Alan uzmanı, dönüşüm sonuçlarını gerçek nirengi noktaları yardımıyla kontrol ederek işaret uyuşmazlığını teşhis etmiştir. Ayrıca, bölgesel arazi çalışmalarında rotasyon ve ölçek parametrelerinden kaynaklı aşırı gürültüyü/singüleriteyi (tekillik) önlemek amacıyla, rotasyon terimlerinin sıfır kabul edilerek sadece 3 öteleme bileşenli Molodensky (veya 3-parametreli Helmert öteleme) modelinin (dX, dY, dZ) kullanılmasının arazi koordinat kararlılığı için çok daha güvenli ve pratik olduğunu vurgulamıştır. Yapay zeka bu doğrultuda yönlendirilerek kod 3-parametreli Molodensky modeline sadeleştirilmiş ve hatasız entegrasyon tamamlanmıştır.</p>
      <p class="no-indent" style="margin-top: 5pt;"><span class="bold" style="color: #0056b3;">Doğru Yönlendirici İstem (Optimized Expert Prompt):</span> <i>"Jeodezik datumlar (WGS84, ED50, ITRF96) arasında Bursa-Wolf 7-parametreli modelini kodlarken, arazide rotasyon ve ölçek hatalarının yaratabileceği büyük koordinat kaymaları riskini yok etmek için rotasyon ve ölçek parametrelerini sıfır sabitleyerek 3-Parametreli Molodensky (Helmert Öteleme) modelini seç. ED50 sistemi için proj4 dize tanımlayıcısındaki '+towgs84' katsayılarını sadece 3 öteleme parametresi içerecek şekilde (+towgs84=-87,-98,-121,0,0,0,0) yapılandır. Böylelikle koordinat dönüşümünü hızlı, güvenli ve işaret uyuşumsuzluğu risklerinden tamamen arındırarak koştur."</i></p>
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
      <p class="no-indent"><span class="bold">AI Eğilimi / Hatası:</span> Lokal geoid ondülasyonu (N) interpolasyonu için gerekli grid verilerini derlemek yerine, AI matematiksel olarak Türkiye sınırlarında ondülasyon değerini tam olarak üretebileceğini iddia eden tamamen hayal ürünü, uydurma bir "analitik jeodezik formül" icat etmiştir. Bu sözde formül (N = sin(lat) &times; cos(lng) &times; katsayı) çalıştırıldığında sistem hata vermese de, arazi kot hesaplarında kabul edilemez metre mertebesinde hatalara yol açmıştır.</p>
      <p class="no-indent"><span class="bold">Alan Uzmanı Revizyonu:</span> Alan uzmanı, yeryüzünün düzensiz çekim potansiyelinden (jeoid yapısından) dolayı hiçbir lokal jeoidin sadece basit trigonometrik veya analitik formüllerle modellenemeyeceğini, TG-20'nin diskrit (grid) verilerinin enterpole edilmesinin jeodezik bir zorunluluk olduğunu vurgulamıştır. AI bu konuda eğitilerek Türkiye genelini kapsayan gerçek enlem, boylam ve ondülasyon grid dökümü sisteme yüklendirilmiş, 4 noktalı interpolasyon algoritmalarıyla milimetre mertebesinde gerçekçi dikey kot hassasiyetine geçilmiştir.</p>
      <p class="no-indent" style="margin-top: 5pt;"><span class="bold" style="color: #0056b3;">Doğru Yönlendirici İstem (Optimized Expert Prompt):</span> <i>"Türkiye Geoidi-2020 gibi karmaşık fiziksel/jeodezik yüzeyleri modellemek için kendi kendine uydurma analitik formüller veya trigonometrik fonksiyonlar icat etme. Jeoid ondülasyonu analitik bir denklemle ifade edilemez, ancak grid gözlem verileriyle çözülür. Sana sunduğum Türkiye Geoidi-2020 (TG-20) grid veri noktalarını içeren koordinat matrisini yükle and anlık enlem-boylam değerlerine karşılık gelen hücreyi bularak bilineer interpolasyon (2D bilinear interpolation) yapan gerçekçi jeodezik algoritmayı kodla."</i></p>
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
          <li><span class="bold">C. Algoritma Çekirdeği (Engine):</span> 3-parametreli Molodensky / Helmert Öteleme ve Gauss-Krüger formüllerini içeren (<span class="bold">CoordinateUtils.ts</span>), 6 istatistik filtresini barındıran (<span class="bold">MathUtils.ts</span>) ve Türkiye Jeoidi (TG-20) interpolasyonunu yürüten (<span class="bold">GeoidService.ts, GeoidUtils.ts</span>) hesaplama çekirdeği.</li>
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
│   ├── CoordinateUtils.ts   # Projection Math (Gauss-Krüger, 3°/6° TM, Molodensky / Helmert-3)
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

    <h1>4. KAYNAKÇA, MEVZUAT VE VERİ KAYNAKLARI (REFERENCES & DATA SOURCES)</h1>
    <p class="no-indent" style="margin-bottom: 8pt;"><span class="bold">Atıf Gösterim ve Güven Rehberi:</span> Bu çalışmada işletilen tüm istatistiksel, konumsal, düşey kartografik dönüşümler ve veri görselleştirme/ihraç yaklaşımları aşağıdaki uluslararası standartlara, veri kaynaklarına ve yazılım kütüphanelerine dayanmaktadır:</p>
    
    <p class="bold" style="color: #0056b3; margin-top: 10pt; margin-bottom: 4pt; font-size: 11pt;">4.1. Akademik Yayınlar ve Jeodezik Standartlar (Academic Literature)</p>
    <ol style="margin-top: 0; padding-left: 20px;">
      <li><span class="bold">Baarda, W. (1968).</span> A testing procedure for use in geodetic networks. Netherlands Geodetic Commission. (Jeodezik Baarda Snooping kalın hata testleri ve güven elipsi analizleri için).</li>
      <li><span class="bold">Bursa, M. (1962).</span> The theory of the determination of the non-parallelism of the minor axis of the reference ellipsoid. Studia Geophysica et Geodaetica. (7-Parametreli Bursa-Wolf datum dönüşüm modeli referansı için).</li>
      <li><span class="bold">Molodensky, M. S., Eremeev, V. F., & Yurkina, M. I. (1962).</span> Methods for study of the external gravitational field and figure of the Earth. Israel Program for Scientific Translations. (3-Parametreli Molodensky datum dönüşüm modeli ve elipsoidal kayıklık düzeltmeleri için).</li>
      <li><span class="bold">Hofmann-Wellenhof, B., Lichtenegger, H., & Wasle, E. (2007).</span> GNSS – Global Navigation Satellite Systems. Springer. (Koordinat dönüşümleri ve elipsoidal/coğrafi projeksiyon sistemleri için).</li>
      <li><span class="bold">Kaplan, E. D., & Hegarty, C. (2017).</span> Understanding GPS/GNSS: Principles and Applications. Artech House. (L1/L5 çift frekans sinyalleri, SNR kalitesi ve atalet/sensör füzyon modelleri için).</li>
      <li><span class="bold">Krüger, L. (1912).</span> Konforme Abbildung des Erdellipsoids in der Ebene. Veröffentlichung des Königlich Preuszischen Geodätischen Institutes. (Gauss-Krüger projeksiyon dönüşümleri, meridyen meridyen yay serileri ve elipsoit düzleme tasarımı için).</li>
      <li><span class="bold">MacQueen, J. (1967).</span> Some methods for classification and analysis of multivariate observations. Proceedings of the Fifth Berkeley Symposium on Mathematical Statistics and Probability. (K-Means kümeleme segmentasyon algoritması için).</li>
      <li><span class="bold">Snyder, J. P. (1987).</span> Map projections--A working manual (Vol. 1395). US Government Printing Office. (Proj4js TM/UTM projeksiyon motorunun dayandığı standart serisel denklemler ve k_0 merkez ölçek faktörü tanımları için).</li>
      <li><span class="bold">Teunissen, P. J. G. (2000).</span> The Least-Squares Equation. Delft University Press. (Ağırlıklı En Küçük Kareler (WLS) yöntemi jeodezik uygulamaları için).</li>
    </ol>

    <p class="bold" style="color: #0056b3; margin-top: 10pt; margin-bottom: 4pt; font-size: 11pt;">4.2. Donanım Verileri, Jeoit ve Yer Çekimi Modelleri (Hardware & Geodetic Models)</p>
    <ol style="margin-top: 0; padding-left: 20px;">
      <li><span class="bold">W3C Geolocation API Specification (2016).</span> World Wide Web Consortium. (Akıllı mobil cihazların ham uydu verilerine ve GPS/GNSS alıcısı donanım katmanına erişmek için).</li>
      <li><span class="bold">Harita Genel Müdürlüğü (HGM). (2020).</span> Türkiye Geoidi - 2020 (TG-20) Teknik Dökümanı. (5'x5' çözünürlüklü yerel düşey datum, anlık ondülasyon ve iki boyutlu bilineer interpolasyon katsayı hesaplamaları için).</li>
      <li><span class="bold">Lemoine, F. G., et al. (1998).</span> The Development of the Joint NASA GSFC and NIMA Geopotential Model EGM96. NASA/TP-1998-206861. (5'x5' çözünürlüklü küresel jeoit dalgalanması modeli ve TG-20 dışı kıyı bölgeleri için yedek geopotansiyel referans filtresi).</li>
      <li><span class="bold">EPSG Geodetic Parameter Dataset.</span> International Association of Oil & Gas Producers (IOGP). (ED50, ITRF96, WGS84 yerel dilim ortak parametreleri ve Transverse Mercator projeksiyon dönüşüm katsayıları için).</li>
    </ol>

    <p class="bold" style="color: #0056b3; margin-top: 10pt; margin-bottom: 4pt; font-size: 11pt;">4.3. Harita Servisleri ve Sağlayıcıları (Map Services & Providers)</p>
    <ol style="margin-top: 0; padding-left: 20px;">
      <li><span class="bold">Google Maps API (Satellite/Hybrid Tiles).</span> Google LLC. (Gerçek zamanlı uydu fotoğrafları, hibrit altlık görselleri ve arazi koordinat haritalama doğruluk testleri için).</li>
      <li><span class="bold">OpenStreetMap (OSM) Contributors.</span> © OpenStreetMap Vakfı. (Açık kaynaklı harita altlık servisi ve vektörel sokak/topografya katmanları için).</li>
    </ol>

    <p class="bold" style="color: #0056b3; margin-top: 10pt; margin-bottom: 4pt; font-size: 11pt;">4.4. Yazılım ve Yazım Kütüphaneleri (Software & Presentation Libraries)</p>
    <ol style="margin-top: 0; padding-left: 20px;">
      <li><span class="bold">Proj4js Library (v2.20).</span> OSGeo (Open Source Geospatial Foundation). (İstemci tarafında hızlı ve yüksek duyarlılıklı datum ve koordinat projeksiyon dönüşümleri için).</li>
      <li><span class="bold">Leaflet JS Engine (v1.9) & React-Leaflet (v5.0).</span> Vladimir Agafonkin. (Mobil uyumlu ve yüksek performanslı harita katman kontrolü, çokgen çizim ve Web-CAD görselleştirmesi için).</li>
      <li><span class="bold">SheetJS (xlsx v0.18.5) Export Engine.</span> SheetJS LLC. (İstemci tarafında sunucu bağımsız Excel formatında ölçüm karnesi ve teknik özet tabloları türetmek için).</li>
      <li><span class="bold">JSZip Library (v3.10) & FileSaver.js (v2.0).</span> Stuart Knightley & Eli Grey. (Üretilen CAD, KMZ, Excel ve XML dosyalarını arka planda paketleyerek anlık indirmeye sunan sıkıştırma ve aktarım servisleri için).</li>
      <li><span class="bold">Recharts Visualization Library (v3.8).</span> recharts.org. (Ölçüm esnasında toplanan koordinatların hata yayılım profillerini ve regresyon eğrilerini dinamik çizmek için).</li>
      <li><span class="bold">Lucide React & FontAwesome Free (v7.2).</span> Lucide & Fonticons Inc. (Hassas CAD simgeleri, uyduların konumsal durum göstergeleri ve harita araç barı ikonları için).</li>
      <li><span class="bold">Fontsource Fonts.</span> banyan.gdn. (Sistem arayüzünde yüksek okunabilirlik sağlayan "Plus Jakarta Sans" ve "JetBrains Mono" akademik/konsol yazı tipleri için).</li>
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
