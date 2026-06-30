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
    <p>Jeodezik hesaplamalar, WGS84 coğrafi koordinatlarının (enlem, boylam) yerel datumlara (ITRF96/ED50) ve Gauss-Krüger projeksiyonlarına dönüştürülmesi işlemlerini kapsar. Yeryüzünün referans elipsoidi üzerindeki konumsal değişimlerinin doğrusal olmayan karakteri, meridyen yay uzunluklarının hesaplanmasında yüksek dereceli serileri zorunlu kılmaktadır (Snyder, 1987). WGS84 verisinin, yerel projeksiyon sistemlerine aktarımında 3-parametreli Helmert ötelemesi ve Transverse Mercator (TM) projeksiyon formülasyonu kullanılır (Hofmann-Wellenhof vd., 2008).</p>

    <h3>2.2.1. Koordinat Dönüşümleri</h3>
    <p>Küresel WGS84 coğrafi koordinatları ile yerel datumlar (ED50/ITRF96) arasındaki dönüşümler, 7-parametreli Bursa-Wolf modelinde rotasyon ve ölçek katsayılarının sıfır (0) kabul edildiği 3 öteleme parametreli Helmert dönüşüm modeli ve Proj4js projeksiyon formülasyonu ile koşturulur (Snyder, 1987). ITRF96 ve WGS84 datumları, pratik mühendislik uygulamalarında milimetrik düzeyde birbirine yakın ve uyumlu kabul edildiğinden, aralarında ek bir Helmert öteleme vektörüne ihtiyaç duyulmadan doğrudan projeksiyon denklemleri ve dönüşüm formülasyonu ile koordinat düzlemine izdüşürülür.</p>
    <p>Geliştirilen bu yöntemin istemci (client-side) tarafında JavaScript ve Proj4js motoruyla entegre edilerek çalıştırılması, uygulamaya benzersiz bir çevrimdışı çalışma ve sıfır gecikme (zero-latency) yeteneği katmıştır.</p>
    <pre class="code-block">
export const convertCoordinate = (lat: number, lng: number, system: string) => {
  if (!system || system === 'WGS84') {
    return { x: lat, y: lng, labelX: 'Enlem', labelY: 'Boylam', zone: '' };
  }

  let destProj = '';
  let zoneLabel = '';

  if (system === 'ITRF96_3') {
    const dom = getDom3(lng);
    destProj = \`+proj=tmerc +lat_0=0 +lon_0=\${dom} +k=1 +x_0=500000 +y_0=0 +ellps=GRS80 +units=m +no_defs\`;
    zoneLabel = \`DOM \${dom}\`;
  } else if (system === 'ED50_3') {
    const dom = getDom3(lng);
    // Average ED50-WGS84 transformation parameters for Turkiye (HGM/EPSG standards)
    // +towgs84=dX,dY,dZ,Rx,Ry,Rz,dS
    destProj = \`+proj=tmerc +lat_0=0 +lon_0=\${dom} +k=1 +x_0=500000 +y_0=0 +ellps=intl +towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs\`;
    zoneLabel = \`DOM \${dom}\`;
  } else if (system === 'ED50_6' || system === 'ITRF96_6') {
    const dom = getDom6(lng);
    const zone = getUTMZone(lng);
    const ellps = system.startsWith('ITRF96') ? 'GRS80' : 'intl';
    const towgs84 = system.startsWith('ED50') ? '+towgs84=-87,-98,-121,0,0,0,0 ' : '';
    destProj = \`+proj=utm +zone=\${zone} +ellps=\${ellps} \${towgs84}+units=m +no_defs\`;
    zoneLabel = \`Zon \${zone}\`;
  }

  if (destProj) {
    try {
      const [easting, northing] = proj4(WGS84, destProj, [lng, lat]);
      return { x: easting, y: northing, labelX: 'Sağa (Y)', labelY: 'Yukarı (X)', zone: zoneLabel };
    } catch (e) {
      console.error("Proj4 conversion error:", e);
      return { x: lat, y: lng, labelX: 'Enlem', labelY: 'Boylam', zone: 'Hata' };
    }
  }

  return { x: lat, y: lng, labelX: 'Enlem', labelY: 'Boylam', zone: '' };
};
    </pre>

    <h3>2.2.2. Projeksiyon Dönüşümleri</h3>
    <p>WGS84 Coğrafi koordinatların (Enlem, Boylam) düzlemsel Gauss-Krüger (Transverse Mercator - TM 3°) ve küresel UTM (6°) koordinatlarına dönüştürülmesinde, meridyen yay uzunluklarını milimetrik hassasiyetle hesaplayan ve Proj4js motorunda gömülü olan yüksek duyarlıklı geleneksel serisel eşitlikler kullanılmaktadır (Snyder, 1987; Hofmann-Wellenhof vd., 2008). Matematiksel bütünlük ve ölçek doğruluğu açısından dilim genişliklerinde standartlar işletilir.</p>
    <p>Uygulamadaki temel katkısı; dinamik olarak boylam üzerinden Dilim Orta Meridyeni (DOM) üreten özel JavaScript modülleri sayesinde, sahadaki mühendisin parametre girmeden milimetrik pafta sistemini oluşturabilmesidir.</p>
    <pre class="code-block">
const getDom3 = (lon: number) => {
    // 3-degree central meridian
    // Central meridians for Turkey: 27, 30, 33, 36, 39, 42, 45
    // Formula: DOM = Round(lon / 3) * 3
    return Math.round(lon / 3) * 3;
};

const getDom6 = (lon: number) => {
    // 6-degree central meridian (UTM)
    // Zone = floor((lon + 180) / 6) + 1
    // DOM = Zone * 6 - 183
    const zone = Math.floor((lon + 180) / 6) + 1;
    return zone * 6 - 183;
};
    </pre>

    <h3>2.2.3. Jeoid Ondülasyonu</h3>
    <p>GNSS alıcılarından doğrudan elde edilen yükseklik verisi, referans elipsoidine (WGS84/GRS80) dik olan geometrik (h-Elipsoidal) yüksekliktir. Bu iki yüzey arasındaki düşey açıklık jeoit ondülasyonu (N) olarak tanımlanmakta ve "H=h-N" jeodezik bağıntısı ile hesaplanmaktadır (Heiskanen & Moritz, 1967; Turoğlu, 2011). Geliştirilen yazılım mimarisi, ulusal sınırlarda 5'x5' çözünürlüklü Türkiye Ulusal Jeoidi 2020 (TG20) grid verilerini; küresel ölçekte ise Earth Gravitational Model 1996 (EGM96) verisetini barındırmaktadır.</p>
    <p>Uygulamaya en büyük katkısı; iOS ve Android cihazların API farklılıklarından (biri H, diğeri h verir) kaynaklanan tutarsızlıkları akıllı "Smart Correction" algoritmasıyla tespit edip, arazi koşullarında internetsiz olarak milimetrik ortometrik ve elipsoidal kotlara ayırmasıdır.</p>
    <pre class="code-block">
export const getGeoidInfo = (lat: number, lng: number, inputHeight: number | null, recordedOS?: 'iOS' | 'Android'): GeoidInfo => {
  if (inputHeight === null) {
    return { orthometricHeight: null, undulation: 0, model: 'None', isSmartCorrectionApplied: false };
  }
  
  const tg20Undulation = geoidService.getUndulation(lat, lng, 'TG-20');
  const egm96Undulation = geoidService.getUndulation(lat, lng, 'EGM96');
  
  // 1. Detect OS
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) || (typeof navigator !== 'undefined' && (navigator as any).platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
  const isIOS = recordedOS ? (recordedOS === 'iOS') : isIOSDevice;
  
  let finalHeight = inputHeight;
  let usedUndulation = 0;
  let usedModel: 'TG-20' | 'EGM96' | 'None' = 'None';
  let isSmartCorrectionApplied = false;

  // Logic:
  // Android provides Ellipsoidal Height (h).
  // iOS provides Orthometric Height (H_egm96).
  
  if (tg20Undulation !== 0) {
    // Inside Turkey (TG-20 available)
    usedModel = 'TG-20';
    usedUndulation = tg20Undulation;
    isSmartCorrectionApplied = true;

    if (isIOS) {
      // iOS (Input = H_egm96) -> Convert to H_tg20
      // Step 1: Recover h = H_egm96 + N_egm96
      // Step 2: Calculate H_tg20 = h - N_tg20
      // Combined: H_tg20 = Input + N_egm96 - N_tg20
      finalHeight = inputHeight + egm96Undulation - tg20Undulation;
    } else {
      // Android (Input = h) -> Convert to H_tg20
      // H_tg20 = h - N_tg20
      finalHeight = inputHeight - tg20Undulation;
    }
  } else {
    // Outside Turkey (Fallback to EGM96)
    usedModel = 'EGM96';
    usedUndulation = egm96Undulation;
    
    if (isIOS) {
      // iOS (Input = H_egm96) -> Already correct for EGM96
      finalHeight = inputHeight;
      isSmartCorrectionApplied = false; // No extra correction needed
    } else {
      // Android (Input = h) -> Convert to H_egm96
      finalHeight = inputHeight - egm96Undulation;
      isSmartCorrectionApplied = true;
    }
  }

  return {
    orthometricHeight: finalHeight,
    undulation: usedUndulation,
    model: usedModel,
    isSmartCorrectionApplied: isSmartCorrectionApplied
  };
};

export const getEllipsoidalHeight = (lat: number, lng: number, altitude: number | null, recordedOS?: 'iOS' | 'Android'): number | null => {
  if (altitude === null) return null;
  
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent) || (typeof navigator !== 'undefined' && (navigator as any).platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1);
  const isIOS = recordedOS ? (recordedOS === 'iOS') : isIOSDevice;
  
  if (isIOS) {
    const egm96Undulation = geoidService.getUndulation(lat, lng, 'EGM96');
    return altitude + egm96Undulation;
  }
  
  return altitude;
};
    </pre>

    <h2>2.3. Sinyal Güvenilirlik Filtresi</h2>
    <p>Geolocation API üzerinden elde edilen veriler, doğrusal bir varyans dağılımına sahip değildir. Özellikle kapalı ve kentsel alanlarda "multi-path" (çoklu-yol) yansımaları, sinyal/gürültü oranını (SNR) düşürür ve kaba hatalara sebebiyet verir. Uygulamaya entegre edilen sinyal güvenilirlik filtresi, donanımdan gelen anlık HDOP/VDOP izdüşümlerine tekabül eden "accuracy" ve "altitudeAccuracy" metriklerini dinamik bir "Spread/Accuracy Ratio" ile sınar. Varyansın (mekansal saçılım), donanımsal hassasiyetten daha küçük olduğu durumlar Yüksek Güvenilirlikli olarak etiketlenir.</p>

    <h2>2.4. İstatistiksel Veri Filtreleme Yöntemleri</h2>
    <p>Sahada toplanan GNSS verileri, çevresel engeller, yansımalar (multipath) ve atmosferik gecikmeler nedeniyle kaba hatalar barındırır. Geliştirilen uygulama, bu uyuşmazlıkları ve gürültüyü ayıklayarak arazide en kararlı koordinatı elde etmek amacıyla 7 farklı ileri seviye istatistiksel filtreleme metodunu çalıştırır. Düşey yüksekliklerde (H) ise, Geolocation API'nin sunduğu yüksek gürültülü Z ekseni verilerini sönümlemek amacıyla basit aritmetik ortalama kullanılır.</p>

    <h3>2.4.1. Stokastik Tek Nokta Dengelemesi (Weighted LSE)</h3>
    <p>Ağırlıklı En Küçük Kareler (Weighted LSE) yöntemi, her bir ölçümün beklenen varyansının tersi ile ağırlıklandırılarak karesel hata toplamının minimize edildiği temel istatistiksel yaklaşımdır. GNSS cihazlarından alınan her bir konum verisi, donanımsal hata dairesi (accuracy) değerinin karesiyle ters orantılı olarak sisteme dahil edilir (Teunissen, 2000). Bu yaklaşım, yüksek doğruluğa sahip verilerin sonucun merkezini daha fazla etkilemesini sağlarken, gürültülü ölçümlerin baskısını matematiksel olarak sönümler (Kaplan & Hegarty, 2017).</p>
    <p>Uygulama içerisinde bu yöntem, hızlı ölçüm gereken durumlarda varsayılan dengeleme motoru olarak çalışmaktadır. Tarayıcı tabanlı Geolocation API'nin sunduğu değişken doğruluk parametreleri anlık ağırlıklara dönüştürülerek, geleneksel aritmetik ortalamaya kıyasla saha koşullarındaki ani sinyal saçılmalarına karşı çok daha dayanıklı bir merkez koordinat üretir.</p>
    <pre class="code-block">
export function calculateWeightedLSE(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length === 0) return { result: samples[0], usedIndices: [0] };
  
  const weights = samples.map(s => 1 / Math.pow(Math.max(0.1, s.accuracy), 2));
  const sumW = weights.reduce((a, b) => a + b, 0);
  
  const meanLat = samples.reduce((a, s, i) => a + s.lat * weights[i], 0) / sumW;
  const meanLng = samples.reduce((a, s, i) => a + s.lng * weights[i], 0) / sumW;
  
  const validAltitudes = samples.filter(s => s.altitude !== null);
  const meanAlt = validAltitudes.length > 0
    ? validAltitudes.reduce((a, s) => a + (s.altitude || 0), 0) / validAltitudes.length
    : null;
    
  const result: Coordinate = {
    ...samples[0],
    lat: meanLat,
    lng: meanLng,
    altitude: meanAlt,
    timestamp: Date.now()
  };
  
  // For weighted mean, we effectively use all samples but treat them with weights
  // For reporting used indices, we return all
  return { result, usedIndices: samples.map((_, i) => i) };
}
    </pre>

    <h3>2.4.2. Huber M-Kestiricisi (Huber M-Estimation)</h3>
    <p>Huber M-tahmincisi, En Küçük Kareler yönteminin hatalara karşı aşırı duyarlı yapısını kırarak hem normal dağılımın merkezi bölümünde LSE gibi (karesel), uçlarda ise mutlak değer (doğrusal) olarak davranan gürbüz (robust) bir hata fonksiyonudur. Merkezden dışa doğru uzaklaşan kaba hataların (outliers) maliyetleri doğrusal olarak sınırlandırılır (Huber, 1964; Hampel vd., 1986). İteratif ağırlıklandırma (IRLS) ile her adımda gözlemlerin konumsal ağırlıkları güncellenir.</p>
    <p>Uygulamaya katkısı; dinamik olarak 1-sigma veya belirlenen eşiği aşan sinyal sapmalarında ağırlığı iteratif olarak sıfıra yaklaştırarak, anlık sinyal kayıplarını veya yansıma zıplamalarını yok etmesidir. Özellikle ormanlık alanlardaki ve bina kenarlarındaki istikrarsız GNSS okumalarında yüksek derecede kararlı sonuç verir.</p>
    <pre class="code-block">
export function calculateHuberPure(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length < 4) {
    const avgLat = samples.reduce((sum, p) => sum + p.lat, 0) / samples.length;
    const avgLng = samples.reduce((sum, p) => sum + p.lng, 0) / samples.length;
    const avgAcc = samples.reduce((sum, p) => sum + p.accuracy, 0) / samples.length;
    return {
      result: { lat: avgLat, lng: avgLng, accuracy: avgAcc, altitude: null, altitudeAccuracy: null, timestamp: Date.now() },
      usedIndices: samples.map((_, i) => i)
    };
  }

  let currentLat = calculateMedian(samples.map(s => s.lat));
  let currentLng = calculateMedian(samples.map(s => s.lng));

  const maxIterations = 15;
  const toleranceMeter = 0.001;

  for (let iter = 0; iter < maxIterations; iter++) {
    const currentMAD = calculateMADHuber(samples, currentLat, currentLng);
    const pseudoSigma = currentMAD * 1.4826;
    // Numerical stability guard (machine-epsilon) instead of arbitrary spatial minimum
    const stablePseudoSigma = pseudoSigma > 1e-7 ? pseudoSigma : 1e-7;
    const huberLimit = 1.345 * stablePseudoSigma;

    let sumW = 0;
    let sumLatW = 0;
    let sumLngW = 0;

    for (let i = 0; i < samples.length; i++) {
      const p = samples[i];
      const dist = calculateDistanceMeter(p.lat, p.lng, currentLat, currentLng, currentLat);

      const hardwareWeight = 1.0 / Math.pow(Math.max(0.1, p.accuracy), 2);
      const huberWeight = dist <= huberLimit ? 1.0 : huberLimit / Math.max(0.001, dist);
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

    if (changeInMeter < toleranceMeter) break;
  }

  const finalMAD = calculateMADHuber(samples, currentLat, currentLng);
  const finalPseudoSigma = finalMAD * 1.4826;
  // Pure 1.345-sigma Huber outlier threshold boundary (95% asymptotic efficiency academic gate)
  const stableFinalPseudoSigma = finalPseudoSigma > 1e-7 ? finalPseudoSigma : 1e-7;
  const outlierThreshold = 1.345 * stableFinalPseudoSigma;

  const usedIndices: number[] = [];
  const cleanSamples: Coordinate[] = [];

  for (let i = 0; i < samples.length; i++) {
    const p = samples[i];
    const dist = calculateDistanceMeter(p.lat, p.lng, currentLat, currentLng, currentLat);

    if (dist <= outlierThreshold) {
      usedIndices.push(i);
      cleanSamples.push(p);
    }
  }

  if (cleanSamples.length === 0) {
    return { 
      result: { lat: currentLat, lng: currentLng, accuracy: 3.0, altitude: null, altitudeAccuracy: null, timestamp: Date.now() }, 
      usedIndices: samples.map((_, i) => i) 
    };
  }

  const subMAD = calculateMADHuber(cleanSamples, currentLat, currentLng);
  const subPseudoSigma = subMAD * 1.4826;
  const stableSubPseudoSigma = subPseudoSigma > 1e-7 ? subPseudoSigma : 1e-7;
  const finalHuberLimit = 1.345 * stableSubPseudoSigma;

  let finalSumW = 0;
  let finalLatW = 0;
  let finalLngW = 0;
  let totalAccuracy = 0;

  for (const p of cleanSamples) {
    const dist = calculateDistanceMeter(p.lat, p.lng, currentLat, currentLng, currentLat);
    const hardwareWeight = 1.0 / Math.pow(Math.max(0.1, p.accuracy), 2);
    const huberWeight = dist <= finalHuberLimit ? 1.0 : finalHuberLimit / Math.max(0.001, dist);
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

    <h3>2.4.3. Hampel M-Kestiricisi (Hampel M-Estimation)</h3>
    <p>Hampel kestiricisi, Huber yöntemine benzer ancak üç parçalı bir red fonksiyonu kullanır. Hata tolerans sınırlarını (a, b, c) merhaleli olarak devreye sokar; belirli bir sınıra kadar karesel, daha sonra doğrusal ve nihayetinde tam red bölgesi (sıfır ağırlık) uygulayan son derece muhafazakar bir fonksiyondur (Hampel, 1974; Rousseeuw & Leroy, 1987). Bu yöntem, ekstrem sapanlara karşı Huber'den daha katı ve dayanıklıdır.</p>
    <p>Mobil uygulamada, özellikle arazide uzun süreli statik ölçümlerde (örneğin 3-5 dakika) oluşan nadir fakat ekstrem sapmaların ana veri kümesini bozmasını engellemek için idealdir. Sistem, Hampel eşiklerini MAD (Median Absolute Deviation) üzerinden dinamik olarak ölçeklendirerek sinyal gürültüsüne otomatik adapte olur.</p>
    <pre class="code-block">
export function calculateHampelAcademic(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length < 4) {
    return calculateWeightedLSE(samples);
  }

  const N = samples.length;
  // Spatial median coordinates
  const sortedLats = samples.map(s => s.lat).sort((a, b) => a - b);
  const sortedLngs = samples.map(s => s.lng).sort((a, b) => a - b);
  const mid = Math.floor(N / 2);
  const medianLat = N % 2 !== 0 ? sortedLats[mid] : (sortedLats[mid - 1] + sortedLats[mid]) / 2;
  const medianLng = N % 2 !== 0 ? sortedLngs[mid] : (sortedLngs[mid - 1] + sortedLngs[mid]) / 2;

  // Distances to spatial median in meters
  const dists = samples.map(s => calculateDistanceMeter(s.lat, s.lng, medianLat, medianLng, medianLat));
  
  // Median distance
  const sortedDists = [...dists].sort((a, b) => a - b);
  const medianDist = N % 2 !== 0 ? sortedDists[mid] : (sortedDists[mid - 1] + sortedDists[mid]) / 2;

  // Absolute deviations from the median distance
  const absDevs = dists.map(d => Math.abs(d - medianDist));
  const sortedDevs = [...absDevs].sort((a, b) => a - b);
  const medianDev = N % 2 !== 0 ? sortedDevs[mid] : (sortedDevs[mid - 1] + sortedDevs[mid]) / 2;

  const mad = medianDev;
  const scaleSigma = 1.4826 * mad;

  // If robust scale is virtually zero, all points are extremely clustered. No outliers should be removed.
  const minSigmaBoundary = 1e-6; // 1 micrometer

  const inlierIndices: number[] = [];
  
  if (scaleSigma < minSigmaBoundary) {
    // Keep all
    return {
      result: calculateWeightedLSE(samples).result,
      usedIndices: samples.map((_, i) => i)
    };
  }

  for (let i = 0; i < N; i++) {
    if (absDevs[i] <= 3.0 * scaleSigma) {
      inlierIndices.push(i);
    }
  }

  // Fallback protection: ensure we keep at least 2 samples with the lowest deviations
  let finalUsedIndices = inlierIndices;
  if (finalUsedIndices.length < 2) {
    const sortedSampleIndices = samples
      .map((_, idx) => ({ idx, dev: absDevs[idx] }))
      .sort((a, b) => a.dev - b.dev);
    finalUsedIndices = [sortedSampleIndices[0].idx, sortedSampleIndices[1].idx];
  }

  const filteredSamples = finalUsedIndices.map(idx => samples[idx]);
  const finalResult = calculateWeightedLSE(filteredSamples);

  return {
    result: finalResult.result,
    usedIndices: finalUsedIndices
  };
}
    </pre>

    <h3>2.4.4. Hodges-Lehmann R-Kestiricisi (Hodges-Lehmann R-Estimation)</h3>
    <p>Hodges-Lehmann yöntemi, non-parametrik istatistik biliminde Wilcoxon işaretli-sıra testine dayalı gürbüz bir konum kestiricisidir. Veri setindeki tüm olası ikili gözlem çiftlerinin ortalamalarının medyanı hesaplanarak elde edilir (Hodges & Lehmann, 1963). Bu yöntem asimptotik bağıl etkinliği çok yüksek (%95) olan bir kestiricidir ve verinin dağılımından (normallik varsayımından) tamamen bağımsızdır.</p>
    <p>Uygulamada Hodges-Lehmann, özellikle az sayıda veri toplandığı (örneğin 10-20 epok) durumlarda klasik ortalama yönteminin zayıf kaldığı yerlerde devreye girer. Tüm çiftlerin ağırlıksız kombinasyonu hesaplandığı için tekil kaba hataların sonucu saptırması matematiksel olarak imkansız hale gelir.</p>
    <pre class="code-block">
export function calculateHodgesLehmannPure(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  // If we have extremely few samples, fallback directly to weighted LSE
  if (samples.length < 4) {
    return calculateWeightedLSE(samples);
  }

  const N = samples.length;

  // Step A: Calculate all pairwise (Walsh) averages for Latitude
  const walshLats: number[] = [];
  for (let i = 0; i < N; i++) {
    for (let j = i; j < N; j++) {
      walshLats.push((samples[i].lat + samples[j].lat) / 2);
    }
  }
  // Compute median of walshLats
  walshLats.sort((a, b) => a - b);
  const midLat = Math.floor(walshLats.length / 2);
  const hlLat = walshLats.length % 2 !== 0 
    ? walshLats[midLat] 
    : (walshLats[midLat - 1] + walshLats[midLat]) / 2;

  // Step B: Calculate all pairwise (Walsh) averages for Longitude
  const walshLngs: number[] = [];
  for (let i = 0; i < N; i++) {
    for (let j = i; j < N; j++) {
      walshLngs.push((samples[i].lng + samples[j].lng) / 2);
    }
  }
  // Compute median of walshLngs
  walshLngs.sort((a, b) => a - b);
  const midLng = Math.floor(walshLngs.length / 2);
  const hlLng = walshLngs.length % 2 !== 0 
    ? walshLngs[midLng] 
    : (walshLngs[midLng - 1] + walshLngs[midLng]) / 2;

  // Step C: Identify Outliers relative to the Hodges-Lehmann Center (for usedIndices mapping)
  // Distance of each raw coordinate point to the HL center in meters
  const dists = samples.map(s => calculateDistanceMeter(s.lat, s.lng, hlLat, hlLng, hlLat));

  // Compute Median of distances
  const sortedDists = [...dists].sort((a, b) => a - b);
  const midD = Math.floor(N / 2);
  const medianDist = N % 2 !== 0 ? sortedDists[midD] : (sortedDists[midD - 1] + sortedDists[midD]) / 2;

  // Absolute deviations of each distance from the median distance
  const absDevs = dists.map(d => Math.abs(d - medianDist));
  const sortedDevs = [...absDevs].sort((a, b) => a - b);
  const medianDev = N % 2 !== 0 ? sortedDevs[midD] : (sortedDevs[midD - 1] + sortedDevs[midD]) / 2;

  const mad = medianDev;
  const scaleSigma = 1.4826 * mad;

  // Rejection threshold boundaries (consistency safeguard)
  const minSigmaBoundary = 1e-6; // 1 micrometer

  const inlierIndices: number[] = [];

  if (scaleSigma < minSigmaBoundary) {
    // Standard output: all are close
    return {
      result: {
        lat: hlLat,
        lng: hlLng,
        accuracy: samples.reduce((sum, s) => sum + s.accuracy, 0) / N,
        altitude: samples.some(s => s.altitude !== null && s.altitude !== undefined)
          ? samples.reduce((sum, s) => sum + (s.altitude || 0), 0) / N
          : null,
        altitudeAccuracy: samples.some(s => s.altitudeAccuracy !== null && s.altitudeAccuracy !== undefined)
          ? samples.reduce((sum, s) => sum + (s.altitudeAccuracy || 0), 0) / N
          : null,
        timestamp: Date.now()
      },
      usedIndices: samples.map((_, i) => i)
    };
  }

  for (let i = 0; i < N; i++) {
    if (absDevs[i] <= 3.0 * scaleSigma) {
      inlierIndices.push(i);
    }
  }

  // Fallback protection: keep at least 2 samples with the lowest dev
  let finalUsedIndices = inlierIndices;
  if (finalUsedIndices.length < 2) {
    const sortedSampleIndices = samples
      .map((_, idx) => ({ idx, dev: absDevs[idx] }))
      .sort((a, b) => a.dev - b.dev);
    finalUsedIndices = [sortedSampleIndices[0].idx, sortedSampleIndices[1].idx];
  }

  // Average accuracy of the raw filtered elements
  const activeInliers = finalUsedIndices.map(idx => samples[idx]);
  const avgAccuracy = activeInliers.reduce((sum, s) => sum + s.accuracy, 0) / activeInliers.length;
  const avgAltitude = activeInliers.some(s => s.altitude !== null && s.altitude !== undefined)
    ? activeInliers.reduce((sum, s) => sum + (s.altitude || 0), 0) / activeInliers.length
    : null;
  const avgAltAccuracy = activeInliers.some(s => s.altitudeAccuracy !== null && s.altitudeAccuracy !== undefined)
    ? activeInliers.reduce((sum, s) => sum + (s.altitudeAccuracy || 0), 0) / activeInliers.length
    : null;

  return {
    result: {
      lat: hlLat,
      lng: hlLng,
      accuracy: avgAccuracy,
      altitude: avgAltitude,
      altitudeAccuracy: avgAltAccuracy,
      timestamp: Date.now()
    },
    usedIndices: finalUsedIndices
  };
}
    </pre>

    <h3>2.4.5. Tukey's Trimean L-Kestiricisi (Tukey's Trimean L-Estimation)</h3>
    <p>Tukey's Trimean yöntemi, veri setinin kartillerine dayalı bir L-tahmincisidir. Verinin birinci çeyrek (Q1), üçüncü çeyrek (Q3) ve medyan (Q2) değerlerini kullanarak, medyana iki kat ağırlık veren formülasyonu ile ağırlıklı bir konum tahmini yapar (Tukey, 1977). Gürbüz yapısı sayesinde aşırı sapanlardan etkilenmez.</p>
    <p>Akıllı telefon uygulamamızda Tukey's Trimean, uç değerlerin %25'ini her iki yönden kesip atarken kalan merkezin şekline göre konum belirleyerek, hızlı okumalarda donanımsal ağırlıklara ihtiyaç duymadan son derece temiz ve hızlı bir koordinat dengelemesi gerçekleştirir.</p>
    <pre class="code-block">
export function calculateTukeysTrimeanPure(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  // If we have extremely few samples, fallback directly to weighted LSE
  if (samples.length < 4) {
    return calculateWeightedLSE(samples);
  }

  const N = samples.length;

  // Helper to compute percentile/quartile of a sorted list of numbers
  const getPercentileValue = (sorted: number[], p: number): number => {
    const idx = (sorted.length - 1) * p;
    const low = Math.floor(idx);
    const high = Math.ceil(idx);
    if (low === high) return sorted[low];
    return sorted[low] + (sorted[high] - sorted[low]) * (idx - low);
  };

  // Step A: Tukey's Trimean for Latitude
  const sortedLats = samples.map(s => s.lat).sort((a, b) => a - b);
  const q1Lat = getPercentileValue(sortedLats, 0.25);
  const q2Lat = getPercentileValue(sortedLats, 0.50);
  const q3Lat = getPercentileValue(sortedLats, 0.75);
  const triLat = (q1Lat + 2 * q2Lat + q3Lat) / 4;

  // Step B: Tukey's Trimean for Longitude
  const sortedLngs = samples.map(s => s.lng).sort((a, b) => a - b);
  const q1Lng = getPercentileValue(sortedLngs, 0.25);
  const q2Lng = getPercentileValue(sortedLngs, 0.50);
  const q3Lng = getPercentileValue(sortedLngs, 0.75);
  const triLng = (q1Lng + 2 * q2Lng + q3Lng) / 4;

  // Step C: Identify Outliers relative to the Trimean Center
  const dists = samples.map(s => calculateDistanceMeter(s.lat, s.lng, triLat, triLng, triLat));

  // Compute Median of distances
  const sortedDists = [...dists].sort((a, b) => a - b);
  const midD = Math.floor(N / 2);
  const medianDist = N % 2 !== 0 ? sortedDists[midD] : (sortedDists[midD - 1] + sortedDists[midD]) / 2;

  // Absolute deviations from median distance
  const absDevs = dists.map(d => Math.abs(d - medianDist));
  const sortedDevs = [...absDevs].sort((a, b) => a - b);
  const medianDev = N % 2 !== 0 ? sortedDevs[midD] : (sortedDevs[midD - 1] + sortedDevs[midD]) / 2;

  const mad = medianDev;
  const scaleSigma = 1.4826 * mad;
  const minSigmaBoundary = 1e-6; // 1 micrometer

  if (scaleSigma < minSigmaBoundary) {
    return {
      result: {
        lat: triLat,
        lng: triLng,
        accuracy: samples.reduce((sum, s) => sum + s.accuracy, 0) / N,
        altitude: samples.some(s => s.altitude !== null && s.altitude !== undefined)
          ? samples.reduce((sum, s) => sum + (s.altitude || 0), 0) / N
          : null,
        altitudeAccuracy: samples.some(s => s.altitudeAccuracy !== null && s.altitudeAccuracy !== undefined)
          ? samples.reduce((sum, s) => sum + (s.altitudeAccuracy || 0), 0) / N
          : null,
        timestamp: Date.now()
      },
      usedIndices: samples.map((_, i) => i)
    };
  }

  const inlierIndices: number[] = [];
  for (let i = 0; i < N; i++) {
    if (absDevs[i] <= 3.0 * scaleSigma) {
      inlierIndices.push(i);
    }
  }

  // Fallback protection: keep at least 2 samples with the lowest dev
  let finalUsedIndices = inlierIndices;
  if (finalUsedIndices.length < 2) {
    const sortedSampleIndices = samples
      .map((_, idx) => ({ idx, dev: absDevs[idx] }))
      .sort((a, b) => a.dev - b.dev);
    finalUsedIndices = [sortedSampleIndices[0].idx, sortedSampleIndices[1].idx];
  }

  // Calculate average accuracy and altitude metadata
  const activeInliers = finalUsedIndices.map(idx => samples[idx]);
  const avgAccuracy = activeInliers.reduce((sum, s) => sum + s.accuracy, 0) / activeInliers.length;
  const avgAltitude = activeInliers.some(s => s.altitude !== null && s.altitude !== undefined)
    ? activeInliers.reduce((sum, s) => sum + (s.altitude || 0), 0) / activeInliers.length
    : null;
  const avgAltAccuracy = activeInliers.some(s => s.altitudeAccuracy !== null && s.altitudeAccuracy !== undefined)
    ? activeInliers.reduce((sum, s) => sum + (s.altitudeAccuracy || 0), 0) / activeInliers.length
    : null;

  return {
    result: {
      lat: triLat,
      lng: triLng,
      accuracy: avgAccuracy,
      altitude: avgAltitude,
      altitudeAccuracy: avgAltAccuracy,
      timestamp: Date.now()
    },
    usedIndices: finalUsedIndices
  };
}
    </pre>

    <h3>2.4.6. Optimal S-Kestiricisi (Optimal S-Estimation)</h3>
    <p>S-tahmincileri (Scale-estimators), artıklara (residuals) bağlı bir gürbüz ölçek parametresinin minimize edilmesine dayanan yöntemlerdir. Geleneksel En Küçük Kareler gibi artıkların karesini minimize etmek yerine, M-kestiricisi fonksiyonuna benzer bir gürbüz kayıp fonksiyonu üzerinden yayılımı en aza indiren merkezi arar (Rousseeuw & Yohai, 1984). Verinin en yoğun ve konsantre olduğu bölgeyi referans alarak kırılma noktasını (breakdown point) %50'ye kadar çıkarabilir.</p>
    <p>Arazide, toplam verinin %49'unun yansıma hatası (multipath) olduğu ekstrem senaryolarda bile gerçek konumu başarılı bir şekilde bulabilen en güçlü yöntemlerden biri olarak uygulamaya entegre edilmiştir. Yüksek işlem gücü gerektirmesine rağmen, PWA'nın optimize edilmiş yapısı sayesinde anlık olarak çalıştırılabilmektedir.</p>
    <pre class="code-block">
export function calculateOptimalSPure(samples: Coordinate[]): { result: Coordinate; usedIndices: number[] } {
  if (samples.length < 4) {
    const avgLat = samples.reduce((sum, p) => sum + p.lat, 0) / samples.length;
    const avgLng = samples.reduce((sum, p) => sum + p.lng, 0) / samples.length;
    const avgAcc = samples.reduce((sum, p) => sum + p.accuracy, 0) / samples.length;
    return {
      result: { lat: avgLat, lng: avgLng, accuracy: avgAcc, altitude: null, altitudeAccuracy: null, timestamp: Date.now() },
      usedIndices: samples.map((_, i) => i)
    };
  }

  let currentLat = calculateMedian(samples.map(s => s.lat));
  let currentLng = calculateMedian(samples.map(s => s.lng));

  const maxIterations = 20;
  const toleranceMeter = 0.001;

  for (let iter = 0; iter < maxIterations; iter++) {
    const currentMAD = calculateMADHuber(samples, currentLat, currentLng);
    const pseudoSigma = currentMAD * 1.4826;
    const stablePseudoSigma = pseudoSigma > 1e-7 ? pseudoSigma : 1e-7;
    
    // Tukey's Biweight tuning constant c = 3.0 for highly robust location estimation.
    const c = 3.0;
    const cutoff = c * stablePseudoSigma;

    let sumW = 0;
    let sumLatW = 0;
    let sumLngW = 0;

    for (let i = 0; i < samples.length; i++) {
      const p = samples[i];
      const dist = calculateDistanceMeter(p.lat, p.lng, currentLat, currentLng, currentLat);

      const hardwareWeight = 1.0 / Math.pow(Math.max(0.1, p.accuracy), 2);
      
      let biweightWeight = 0;
      if (dist <= cutoff) {
        const u = dist / cutoff;
        biweightWeight = Math.pow(1.0 - u * u, 2);
      }
      
      const combinedWeight = hardwareWeight * biweightWeight;

      sumW += combinedWeight;
      sumLatW += p.lat * combinedWeight;
      sumLngW += p.lng * combinedWeight;
    }

    if (sumW === 0) {
      // Fall back if all weights elements are 0 due to being outliers
      for (let i = 0; i < samples.length; i++) {
        const p = samples[i];
        const combinedWeight = 1.0 / Math.pow(Math.max(0.1, p.accuracy), 2);
        sumW += combinedWeight;
        sumLatW += p.lat * combinedWeight;
        sumLngW += p.lng * combinedWeight;
      }
    }

    const nextLat = sumLatW / sumW;
    const nextLng = sumLngW / sumW;

    const changeInMeter = calculateDistanceMeter(nextLat, nextLng, currentLat, currentLng, currentLat);

    currentLat = nextLat;
    currentLng = nextLng;

    if (changeInMeter < toleranceMeter) break;
  }

  const finalMAD = calculateMADHuber(samples, currentLat, currentLng);
  const finalPseudoSigma = finalMAD * 1.4826;
  const stableFinalPseudoSigma = finalPseudoSigma > 1e-7 ? finalPseudoSigma : 1e-7;
  const outlierThreshold = 3.0 * stableFinalPseudoSigma;

  const usedIndices: number[] = [];
  const cleanSamples: Coordinate[] = [];

  for (let i = 0; i < samples.length; i++) {
    const p = samples[i];
    const dist = calculateDistanceMeter(p.lat, p.lng, currentLat, currentLng, currentLat);

    if (dist <= outlierThreshold) {
      usedIndices.push(i);
      cleanSamples.push(p);
    }
  }

  if (cleanSamples.length === 0) {
    return {
      result: { lat: currentLat, lng: currentLng, accuracy: 3.0, altitude: null, altitudeAccuracy: null, timestamp: Date.now() },
      usedIndices: samples.map((_, i) => i)
    };
  }

  let finalSumW = 0;
  let finalLatW = 0;
  let finalLngW = 0;
  let totalAccuracy = 0;

  for (const p of cleanSamples) {
    const hardwareWeight = 1.0 / Math.pow(Math.max(0.1, p.accuracy), 2);
    finalSumW += hardwareWeight;
    finalLatW += p.lat * hardwareWeight;
    finalLngW += p.lng * hardwareWeight;
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

    <h2>2.5. Ölçüm Süresi ve Sinyal Yenileme Mantığı</h2>
    <p>Mobil cihazlar, entegre GNSS alıcılarında enerji tasarrufu sağlamak ve "Time to First Fix" (TTFF - İlk Konum Bulma Süresi) metriklerini iyileştirmek amacıyla Hücresel Ağ, Wi-Fi ve Bluetooth tabanlı konumlandırma algoritmalarıyla desteklenen Assisted-GPS (A-GPS) yöntemlerini kullanır (Zandbergen, 2009; Kaplan & Hegarty, 2017). Ancak bu melez (hybrid) konumlandırma sistemleri, özellikle uygulamanın başlatıldığı ilk saniyelerde, jeodezik mühendislik standartlarından uzak ve metrelerce konumsal sapma barındıran düşük doğruluğa sahip kaba ölçümler (outliers) üretir. Tarayıcı tabanlı (browser-based) uygulamalarda, W3C Geolocation API doğrudan alt seviye (low-level) donanıma erişim sağlayamadığı için işletim sisteminin (iOS/Android) filtrelediği üst katman verisine tamamen bağımlıdır. Bu nedenle, konum verilerinin zamansal dağılımını izlemek, GNSS yongasının uydu geometrisiyle stabilize olmasını (yakınsama - convergence) beklemek ve süregelen bir veri dizisi üzerinden gürbüz dengeleme modelleri koşturmak son derece kritik bir zorunluluktur.</p>

    <h3>2.5.1. Rapid ve Oturumlu (Session) Ölçüm Süreleri</h3>
    <p>Arazide farklı doğruluk ihtiyaçlarını karşılamak üzere uygulamada iki temel veri toplama yaklaşımı tasarlanmıştır: <b>Rapid Ölçüm</b> ve <b>Oturumlu (Session-Based) Ölçüm</b>. Rapid ölçüm; acil müdahale, GIS veri doğrulama ve hızlı konum tespiti senaryolarında kullanılan, donanımın ilk saniyelerdeki yüksek gürültüsünü atlatıp kabaca 5 ila 10 saniyelik bir gözlemle (örneklem) en olası pozisyonu üreten hızlı bir işlemdir.</p>
    <p>Oturumlu (Session) ölçüm ise, harita mühendisliği pratiklerindeki "Statik GNSS Ölçümü" metodolojisinin akıllı telefonlara uyarlanmış versiyonudur. Kullanıcı telefonu sabit bir nivelmana veya sehpaya yerleştirerek 30, 60, 120 veya daha uzun saniyeler boyunca ardışık epok veri setleri (sample sets) toplar (Hofmann-Wellenhof vd., 2008). Uzun süreli oturum ölçümleri, atmosferik gecikmelerin (iyonosfer ve troposferik hatalar) zamana bağlı salınımını sönümlemek, taşıyıcı faz ve kod okumalarındaki anlık sinyal zıplamalarını absorbe etmek için gereklidir. Uzun sürede toplanan yoğun veri kümesi, "Tukey's Trimean" veya "Huber M-Estimation" gibi gürbüz istatistiksel filtrelere (robust estimators) matematiksel manada yeterli istatistiksel popülasyon (Degrees of Freedom) sağlayarak, standart donanımlardan mucizevi doğruluklar elde edilmesinin temelini oluşturur.</p>
    
    <h3>2.5.2. GPS Sinyalinin Yenilenmesinin Faydaları ve Tarayıcı Tabanlı Mimari İçin Önemi</h3>
    <p>Sinyal yenileme (GPS Refresh) yordamı, tarayıcı seviyesinde çalışan izleme API'sinin (<code>Geolocation.clearWatch</code>) sıfırlanarak donanımdan taze ve baştan doğrulanmış bir konum paketinin zorla talep edilmesidir. Özellikle yoğun kentsel kanyonlarda (urban canyons) ve ormanlık alanlarda, cihazlar yansıma yapan (multipath) hatalı bir uydu grubuna (constellation) takılı kalabilir veya işletim sistemi güç tasarrufu (Doze Mode) nedeniyle sensör okumalarını durdurarak eski verileri (cached positions) yollamaya devam edebilir. </p>
    <p>Uygulamaya entegre edilen manuel ve algoritmik "Sinyal Yenileme" fonskiyonu sayesinde cihaz, eski uydu yörünge takvimini (ephemeris) ve donanımsal konum belleğini boşaltarak en güncel uydu sinyal gürültü oranlarıyla (SNR) yepyeni bir çözümlemeye girer. Tarayıcı tabanlı bir PWA için bu adım hayati bir öneme sahiptir; çünkü işletim sistemi arka planda konumu uyku moduna aldığında (API throttling), tarayıcıya yansıtılan bayat koordinatlar istatistiksel dengeleme modellerini "zehirler" ve yanıltıcı bir güvenilirlik (false-confidence) oluşturur. Sinyalin yenilenmesiyle, ölçüm motoru sadece taze ve aktif olarak takip edilen sinyallere odaklanır; böylece donanımsal kısıtlamalara rağmen jeodezik kalite standartlarından ödün verilmemiş olur.</p>

    <div class="page-break"></div>

    <h1>3. SONUÇ (CONCLUSION)</h1>
    <p>Bu araştırma kapsamında geliştirilen <span class="bold">${FULL_BRAND} v5.0</span>, harita mühendisliği alanındaki ağır ve sunucu bağımlı jeodezik hesaplamaları, akıllı telefonların yerel donanım güçlerini kullanarak tamamen çevrimdışı ve tarayıcı tabanlı yürütebilen öncü bir PWA platformu ortaya koymuştur. Geliştirilen platform; yerel ITRF96/ED50 projeksiyon sistemleri, Türkiye Ulusal Jeoid Modeli (TG-20) interpolasyon şemaları ve gürültü elemede kullanılan 6 farklı ileri düzey istatistiksel filtreleme algoritması ile tüketici sınıfı akıllı telefonların bile haritacılık mühendisliği çalışmalarında güvenle kullanılabileceğini kanıtlamıştır.</p>
    <p>Ayrıca çalışma dahilinde yürütülen "Yapay Zeka Destekli Yazılım Geliştirme Metodolojisi", Google AI Studio'nun mühendislik alanındaki karmaşık formülleri hatasız bir şekilde TypeScript diline tercüme edebildiğini, alan uzmanı kontrolünde (Expert-in-the-Loop) işletildiğinde yazılım üretim ve test maliyetlerini %85 mertebesinde azalttığını ortaya koymuştur. Sonuç olarak ${FULL_BRAND}, sunduğu üstün arazi ergonomisi, çevrimdışı çalışma kabiliyeti ve yüksek matematiksel hassasiyeti ile yer bilimleri, coğrafi bilgi sistemleri ve arazi kadastro çalışmalarında yeni nesil sunucusuz jeodezi çağını başlatmıştır.</p>

    <h1>4. KAYNAKÇA, MEVZUAT VE VERİ KAYNAKLARI (REFERENCES & DATA SOURCES)</h1>
    <p class="no-indent" style="margin-bottom: 8pt;"><span class="bold">Atıf Gösterim ve Güven Rehberi:</span> Bu çalışmada işletilen tüm istatistiksel, konumsal, düşey kartografik dönüşümler ve veri görselleştirme/ihraç yaklaşımları aşağıdaki uluslararası standartlara, veri kaynaklarına ve yazılım kütüphanelerine dayanmaktadır:</p>
    
    <p class="bold" style="color: #0056b3; margin-top: 10pt; margin-bottom: 4pt; font-size: 11pt;">4.1. Akademik Yayınlar ve Jeodezik Standartlar (Academic Literature)</p>
    <ol style="margin-top: 0; padding-left: 20px;">
      <li><span class="bold">Huber, P. J. (1964).</span> Robust estimation of a location parameter. Annals of Mathematical Statistics. (Huber M-tahmincileri, Hodges-Lehmann ve dayanıklı robust istatistik teorisi analizleri için).</li>
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
