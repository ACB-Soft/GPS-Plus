import { FULL_BRAND } from '../version';

export const generateTechnicalReport = () => {
  const year = new Date().getFullYear();

  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>Akademik Teknik Rapor: Gürbüz İstatistiksel Süzme Yöntemleri</title>
  <style>
    @page { size: A4; margin: 2.5cm; }
    body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.6; color: #000; }
    .container { width: 100%; max-width: 17.5cm; margin: auto; }
    h1 { font-size: 16pt; font-weight: bold; text-align: center; margin-top: 25pt; margin-bottom: 25pt; text-transform: uppercase; line-height: 1.3; }
    h2 { font-size: 13pt; font-weight: bold; margin-top: 20pt; margin-bottom: 10pt; page-break-after: avoid; border-bottom: 1px solid #000; padding-bottom: 3pt; }
    p { margin-bottom: 12pt; text-align: justify; text-indent: 1.25cm; }
    .no-indent { text-indent: 0 !important; }
    .formula { text-align: center; font-style: italic; margin: 18pt 0; text-indent: 0; font-size: 11.5pt; line-height: 1.8; background: #fafafa; padding: 12pt; border: 1px solid #ddd; }
    .symbols { margin-bottom: 15pt; padding-left: 1.25cm; font-family: 'Times New Roman', serif; font-size: 10pt; list-style-type: none; }
    .symbols li { margin-bottom: 6pt; text-indent: -0.5cm; padding-left: 0.5cm; text-align: justify; }
    .ref-list { padding-left: 0; margin-bottom: 15pt; list-style-type: none; }
    .ref-list li { margin-bottom: 10pt; text-align: justify; font-size: 10pt; text-indent: -0.75cm; padding-left: 0.75cm; }
    b { font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <h1>KÜRESEL NAVİGASYON UYDU SİSTEMLERİNDE (GNSS) GÜRBÜZ JEODEZİK KONUM KESTİRİMİ VE İSTATİSTİKSEL MODELLEME TEKNİK RAPORU</h1>
    
    <p class="no-indent">Bu akademik teknik rapor, <b>${FULL_BRAND} (${year})</b> profesyonel jeodezik konumlandırma ve haritalama yazılımı altyapısında entegre edilmiş olan altı adet yüksek doğruluklu, gürbüz (robust) istatistiksel konum süzme ve kestirim algoritmasının teorik, jeodezik ve istatistiksel temellerini detaylandırmaktadır. Küresel Konumlandırma Sistemleri (GNSS) alıcıları tarafından üretilen ham gözlem serileri; çoklu yol (multipath) yansımaları, iyonosferik/troposferik kırılmalar, uydu geometrisindeki zayıflıklar (DOP katsayıları) ve sinyal kesintileri (cycle slips) gibi bozucu etkiler sebebiyle klasik Gaussian (normal) dağılım varsayımına uymazlar. Bu dışsal bozucu etkiler, gözlem serilerinde ağır kuyruklu (heavy-tailed) dağılımların oluşmasına ve rastgele hataların ötesinde sistematik veya kaba hataların (outliers) ortaya çıkmasına sebep olur. Jeodezik mühendisliğinde ve hassas aplikasyon (stakeout) çalışmalarında, bu kaba hataların süzülmesi hayati bir öneme sahiptir.</p>

    <p>Klasik istatistikte sıkça başvurulan aritmetik ortalama yöntemi, tek bir kaba hataya karşı bile sıfır kırılma noktasına (breakdown point, <i>&epsilon;<sup>*</sup> = 0</i>) sahip olduğundan, gürbüz olmayan duyarlı bir kestiricidir. Bu raporda sunulan tüm formülasyonlar, gürbüz istatistik kuramı ve jeodezik dengeleme literatüründeki özgün tanımlamaların iki boyutlu (2D) küresel koordinat sistemine (Enlem ve Boylam bazında) uyarlanmış kararlı, ölçeklenebilir ve matematiksel olarak kanıtlanmış versiyonlarıdır. Uygulamadaki algoritmik yapıyla birebir örtüşen bu yöntemler, veriyi işleme biçimlerine göre iki ana kategoride sınıflandırılır:</p>
    
    <p><b>1. Bir Boyutlu (1D) Bağımsız Yaklaşım:</b> Bu yaklaşımda Enlem (Latitude) ve Boylam (Longitude) koordinat eksenleri birbirlerinden bağımsız stokastik zaman serileri olarak ele alınır. Her boyut için gürbüz konum kestirimi ayrı ayrı ve kendi serisi içinde sıralama (rank) tabanlı kestiriciler vasıtasıyla icra edilir (Örn: Hodges-Lehmann R-Kestiricisi, Tukey'in Üçlü Ortalaması). Bu yöntemler, özellikle koordinat eksenlerinin birinde asimetrik saçılma veya çoklu yol yansıması olduğunda, diğer eksenin etkilenmesini engelleyerek mükemmel bir yalıtım sağlar. <i>Önemli bir ayrıntı olarak; 1D bağımsız yöntemlerle gürbüz yatay koordinat seti elde edildikten sonra, yazılım arayüzünde kullanılan 'geçerli gözlem indeksi (inliers)' ve ortalama oturum hassasiyeti (accuracy estimation) metriklerini türetmek amacıyla, elde edilen 1D merkeze göre 2D Rayleigh MAD tabanlı bir uzaysal ardıl süzme (post-processing filtering) uygulanır. Bu sayede, boyutsal bağımsızlık korunurken sistem bütününde boyutsal kalite entegrasyonu da tam olarak sağlanmış olur.</i></p>
    
    <p><b>2. İki Boyutlu (2D) Uzaysal Yaklaşım:</b> Bu yaklaşımda her bir gözlem noktasının (epokun) iki boyutlu uzaydaki konumu bir bütün olarak değerlendirilir. Noktaların güncel ağırlık merkezine veya uzaysal robust medyana olan metrik (Euclidean) mesafeleri (residuals) hesaplanır. Her gözlem epoku için 2D uzayda tek bir robust sönümleme katsayısı (weight factor) belirlenir ve bu ortak katsayı Enlem ile Boylam bileşenlerine ortak bir çarpan olarak uygulanır (Örn: Huber M-Kestiricisi, Hampel Outlier Rejection, Optimal S-Kestiricisi). Bu sayede koordinat bileşenleri arasındaki uzaysal korelasyon ve yön bilgisi (spatial anisotropy) korunur.</p>

    <h2>WGS-84 Ellipsoidal Differential Projection and Metric Transformation Model</h2>
    <p>Yazılım bünyesinde icra edilen tüm iki boyutlu gürbüz istatistiksel analizler, dinamik eşik tayinleri ve mesafe metrikleri (residuals, MAD, sönümleme sınırları) ham açısal derece birimleri (decimal degrees) yerine, <b>kesin metrik formatta (metre cinsinden)</b> icra edilmektedir. Coğrafi koordinatların (Enlem, Boylam) doğrudan öklid dairesel mesafelerine tabi tutulması, kutuplara doğru meridyenlerin daralması ve yer kürenin basıklığı nedeniyle jeodezik açıdan büyük hatalar doğurur. Yer küreyi mükemmel bir küre kabul eden klasik Haversine formülü ise yerel ağlarda (~10-100m) basıklığı ihmal ettiği için 3-5 cm'ye varan geometrik bozulmalara yol açabilmektedir. Bu bozucu etkileri engellemek amacıyla, her bir oturumun (session) gözlem epokları, yerel oturum merkezinin enlem açısına (&phi;) bağlı olarak <b>WGS-84 Referans Elipsoidi</b> üzerinde yerel diferansiyel teğet düzleme projekte edilmektedir.</p>
    
    <p>Bu amaçla, her bir oturumun ortalama koordinat merkezindeki enlem açısı (&phi;) referans alınarak WGS-84 elipsoidi parametreleri doğrultusunda 1 saniyelik veya 1 derecelik enlem ve boylam farklarının o bölgedeki yerel metrik karşılık katsayıları (Meridional and Prime Vertical radii of curvature) analitik olarak türetilir:</p>

    <div class="formula" style="line-height: 1.3; margin: 10pt 0; padding: 8pt;">a = 6,378,137.0 m (WGS-84 Semi-Major Axis)<br/>f = 1 / 298.257223563 (WGS-84 Flattening Ratio)<br/>e² = 2f - f² ≈ 0.00669437999014 (First Eccentricity Squared)<br/>M = [a · (1 - e²)] / [1 - e² · sin²(φ)]<sup>1.5</sup> (Meridional Radius of Curvature)<br/>N = a / √(1 - e² · sin²(φ)) (Prime Vertical Radius of Curvature)<br/>latCoeff = M · (π / 180.0) (Latitude Metric Coefficient in m/deg)<br/>lngCoeff = N · cos(φ) · (π / 180.0) (Longitude Metric Coefficient in m/deg)</div>

    <p>Herhangi iki coğrafi epok (Lat<sub>1</sub>, Lng<sub>1</sub>) ve (Lat<sub>2</sub>, Lng<sub>2</sub>) arasındaki uzaysal metrik mesafe, bu diferansiyel projeksiyon katsayıları kullanılarak doğrusal yerel teğet düzlemde (ellipsoidal local tangent plane) son derece hassas ve milimetrik doğrulukta hesaplanır:</p>

    <div class="formula" style="line-height: 1.3; margin: 10pt 0; padding: 8pt;">dLat = (Lat₁ - Lat₂) · latCoeff<br/>dLng = (Lng₁ - Lng₂) · lngCoeff<br/>Distance (m) = √(dLat² + dLng²)</div>

    <p>Bu yaklaşım, lokal jeodezik ağlarda (~1 km altındaki GPS epok kümelerinde), Vincenty'nin elipsoidal jeodezik formülünün sunduğu doğruluğu, herhangi bir iteratif yakınsama kararsızlığı veya ağır işlemci yükü oluşturmaksızın milimetrik düzeyde sağlamaktadır. Bu diferansiyel dönüşüm modeli sayesinde; Huber, Hampel ve Optimal S modellerinin tüm iterasyonlarındaki mesafe artıkları (residuals, v<sub>i</sub>), gürbüz sapmalar (MAD) ve donanımsal hassasiyetler (accuracy) aynı fiziksel ve geometrik uzayda (metre) dengelenmektedir.</p>

    <h2>1. Stochastic Single-Point Adjustment (Weighted Least Squares - WLS)</h2>
    <p>Ağırlıklı En Küçük Kareler (WLS) yöntemi, jeodezik ağ dengelemeleri ve uydu konumlandırma teorisinde, gözlemlerin kalitelerinin veya varyanslarının birbirinden farklı olduğu durumlarda Gauss-Markov modeli çerçevesinde en iyi doğrusal tarafsız kestirimi (BLUE) elde etmek için kullanılır (Teunissen, 2000). Alıcı donanım katmanından okunan yatay hassasiyet standard sapması (&sigma;<sub>i</sub>, accuracy) kullanılarak her bir epoka ters karesel stokastik ağırlık matrisi elemanı atanır. Bu yöntem, kaba hataların bulunmadığı temiz Gaussian gürültülü ortamlarda matematiksel olarak en yüksek etkinliğe sahiptir. Hesaplama, Enlem ve Boylam için bağımsız (1D) olarak şu şekilde gerçekleştirilir:</p>
    
    <div class="formula" style="line-height: 1.3; margin: 10pt 0; padding: 8pt;">w<sub>i</sub> = 1 / (&sigma;<sub>i</sub>)<sup>2</sup> &nbsp; (where &sigma;<sub>i</sub> = accuracy<sub>i</sub>, constrained by &sigma;<sub>i</sub> &ge; 0.1 m)<br/>Lat<sub>WLS</sub> = ( &Sigma;<sub>i=1</sub><sup>n</sup> w<sub>i</sub> · Lat<sub>i</sub> ) / ( &Sigma;<sub>i=1</sub><sup>n</sup> w<sub>i</sub> )<br/>Lng<sub>WLS</sub> = ( &Sigma;<sub>i=1</sub><sup>n</sup> w<sub>i</sub> · Lng<sub>i</sub> ) / ( &Sigma;<sub>i=1</sub><sup>n</sup> w<sub>i</sub> )</div>
    
    <ul class="symbols">
      <li><b>Lat<sub>WLS</sub>, Lng<sub>WLS</sub></b>: The estimated optimal coordinates (in decimal degrees) utilizing Weighted Least Squares (WLS) adjustment.</li>
      <li><b>Lat<sub>i</sub>, Lng<sub>i</sub></b>: The raw observed latitude and longitude coordinates of the <i>i</i>-th epoch (in decimal degrees).</li>
      <li><b>w<sub>i</sub></b>: The stochastic measurement weight assigned to the <i>i</i>-th observation epoch (m<sup>-2</sup>).</li>
      <li><b>&sigma;<sub>i</sub> (accuracy<sub>i</sub>)</b>: The hardware-reported horizontal standard deviation (accuracy metric) of the <i>i</i>-th epoch, in meters. A numerical threshold of 0.1 meters is strictly enforced to prevent singularity.</li>
      <li><b>n</b>: The total count of active valid geodetic epochs within the observation sequence.</li>
      <li><b>&Sigma;</b>: The summation operator representing the accumulation of weighted coordinate variables over the interval [1, n].</li>
    </ul>

    <h2>2. Huber M-Estimator (Huber M-Estimation)</h2>
    <p>Huber M-tahmini (Huber, 1964), kaba hataların varlığında parametre kestiriminin bozulmasını önlemek amacıyla tasarlanmış gürbüz bir minimizasyon şemasıdır. Küçük artıklar (residuals) için karesel L<sub>2</sub> normunu (En Küçük Kareler), büyük artıklar için ise mutlak L<sub>1</sub> normunu uygulayan parçalı bir amaç fonksiyonuna dayanır. İki boyutlu jeodezik koordinat kestirimi, İteratif Ağırlıklı En Küçük Kareler (Iteratively Reweighted Least Squares - IRLS) yöntemi kullanılarak yakınsanır. İterasyonun başlangıç noktası (seed), koordinat eksenlerinin dönüşünden bağımsız (rotation-invariant) olan ve Weiszfeld Algoritması ile iteratif olarak yakınsanan <b>Uzaysal L1 Medyan (Spatial L1 Median / Geometric Median)</b> değeridir. Klasik koordinat bazlı (marginal) medyan, eksen dönüşümlerine karşı duyarlı (rotation-dependent) olduğundan jeodezik ağlarda geometrik tutarsızlığa yol açar; Weiszfeld bazlı uzaysal medyan ise bu sorunu tamamen ortadan kaldırır. Her iterasyonda noktaların güncel merkezine olan metrik uzaklığı (v<sub>i</sub>) hesaplanır. İki boyutlu öklid mesafeleri (residuals), Gaussian enlem ve boylam hatalarının bileşkesi olarak <b>Rayleigh Dağılımı</b> gösterir. Dolayısıyla, 1D normal dağılımdaki klasik 1.4826 ölçek katsayısı yerine, 2D uzaysal mesafelerin medyanını doğrudan bileşen standard sapmasına (&sigma;) dönüştüren robust Rayleigh ölçek katsayısı (<b>0.8493</b>) kullanılır:</p>
    
    <div class="formula" style="line-height: 1.3; margin: 10pt 0; padding: 8pt;"><b>Iteratively Reweighted Least Squares (IRLS) Routine:</b><br/>1. Initialize Coordinates (Weiszfeld's Spatial L1 Median): Lat<sup>(0)</sup> = Lat<sub>Weiszfeld</sub> , Lng<sup>(0)</sup> = Lng<sub>Weiszfeld</sub><br/>2. Compute Spatial Residual: v<sub>i</sub><sup>(k)</sup> = calculateDistanceMeter(Lat<sub>i</sub>, Lng<sub>i</sub>, Lat<sup>(k)</sup>, Lng<sup>(k)</sup>)<br/>3. Compute Robust Scale (2D Rayleigh Consistency): &sigma;<sub>MAD</sub><sup>(k)</sup> = 0.8493 · Median( v<sub>i</sub><sup>(k)</sup> ) &nbsp; (&sigma;<sub>MAD</sub><sup>(k)</sup> &ge; 10<sup>-7</sup> m)<br/>4. Calculate Huber Tuning Cutoff: h<sup>(k)</sup> = 1.345 · &sigma;<sub>MAD</sub><sup>(k)</sup><br/>5. Evaluate Robust Huber Weight Factor:<br/>w<sub>Huber</sub>(v<sub>i</sub><sup>(k)</sup>) = { 1.0 if v<sub>i</sub><sup>(k)</sup> &le; h<sup>(k)</sup> ; &nbsp; h<sup>(k)</sup> / v<sub>i</sub><sup>(k)</sup> if v<sub>i</sub><sup>(k)</sup> &gt; h<sup>(k)</sup> }<br/>6. Combine with Stochastic Weight: w<sub>total,i</sub><sup>(k)</sup> = w<sub>i</sub> · w<sub>Huber</sub>(v<sub>i</sub><sup>(k)</sup>)<br/>7. Re-estimate Parameter Vector:<br/>Lat<sup>(k+1)</sup> = ( &Sigma;<sub>i=1</sub><sup>n</sup> w<sub>total,i</sub><sup>(k)</sup> · Lat<sub>i</sub> ) / ( &Sigma;<sub>i=1</sub><sup>n</sup> w<sub>total,i</sub><sup>(k)</sup> ) &nbsp; , &nbsp; Lng<sup>(k+1)</sup> = ( &Sigma;<sub>i=1</sub><sup>n</sup> w<sub>total,i</sub><sup>(k)</sup> · Lng<sub>i</sub> ) / ( &Sigma;<sub>i=1</sub><sup>n</sup> w<sub>total,i</sub><sup>(k)</sup> )<br/>8. Check Convergence: Stop if distance(Lat<sup>(k+1)</sup>, Lng<sup>(k+1)</sup>, Lat<sup>(k)</sup>, Lng<sup>(k)</sup>) &lt; 0.001 m or iteration k = 15.</div>
    
    <ul class="symbols">
      <li><b>Lat<sup>(k)</sup>, Lng<sup>(k)</sup></b>: The coordinates of the robust geodetic center at the <i>k</i>-th iteration of the IRLS algorithm.</li>
      <li><b>v<sub>i</sub><sup>(k)</sup></b>: The 2D Euclidean spatial distance in meters between the <i>i</i>-th observation and the active iterative center.</li>
      <li><b>&sigma;<sub>MAD</sub><sup>(k)</sup></b>: The Median of spatial residuals at iteration <i>k</i>, multiplied by the robust Rayleigh consistency scaling factor of 0.8493. This converts the median of 2D metric Euclidean distances directly to the component-wise standard deviation &sigma;, reflecting Rayleigh properties.</li>
      <li><b>h<sup>(k)</sup></b>: Huber's dynamic tuning limit at iteration <i>k</i>. The constant factor of 1.345 yields 95% asymptotic efficiency when the underlying distribution is perfectly Gaussian.</li>
      <li><b>w<sub>Huber</sub>(v<sub>i</sub><sup>(k)</sup>)</b>: The robust weight coefficient for the <i>i</i>-th point. Points within the h-limit are unattenuated (1.0), whereas those outside are downweighted linearly.</li>
      <li><b>w<sub>total,i</sub><sup>(k)</sup></b>: The product of the hardware's stochastic weight (w<sub>i</sub>) and Huber's robust weight (w<sub>Huber</sub>), establishing the overall weight of the epoch.</li>
      <li><b>calculateDistanceMeter</b>: The geodetic Haversine/WGS-84 metric distance function projecting latitude/longitude differentials into planar meters.</li>
    </ul>

    <h2>3. Hampel M-Estimator (Hampel Outlier Rejection)</h2>
    <p>Hampel (1974) tarafından etki fonksiyonları kuramı çerçevesinde tanımlanan bu gürbüz yöntem, jeodezik veri setlerindeki ağır kaba hataları katı bir sınırla (hard rejection) tamamen ortadan kaldıran güçlü bir ayıklama mekanizmasıdır. Klasik 3-sigma kuralının gürbüzleştirilmiş bir versiyonunu sunar. İlk olarak, eksen dönüşümlerine karşı tam koruma (rotation-invariance) sağlayan ve Weiszfeld algoritması ile üretilen özgün <b>Spatial L1 Median (Geometric Median)</b> referans merkezi bağımsız olarak belirlenir. Ardından tüm noktaların bu merkeze olan iki boyutlu metrik uzaklıkları analiz edilerek 3 &middot; &sigma;<sub>MAD</sub> eşiğini aşan her türlü çoklu yol yansıması, uydu kayması veya anlık donanımsal atlama sistemden tamamen elenir (ağırlığı 0 yapılır). İki boyutlu mesafe dağılımının Rayleigh karakteri göz önüne alınarak &sigma;<sub>MAD</sub> ölçeği <b>0.8493</b> çarpanı ile elde edilir. Geriye kalan temizlenmiş "inlier" alt kümesi üzerinde Ağırlıklı En Küçük Kareler (WLS) dengelemesi çalıştırılarak yüksek hassasiyetli nihai konum elde edilir:</p>
    
    <div class="formula" style="line-height: 1.3; margin: 10pt 0; padding: 8pt;">Lat<sub>L1_median</sub> = Lat<sub>Weiszfeld</sub> , Lng<sub>L1_median</sub> = Lng<sub>Weiszfeld</sub><br/>v<sub>i</sub> = calculateDistanceMeter(Lat<sub>i</sub>, Lng<sub>i</sub>, Lat<sub>L1_median</sub>, Lng<sub>L1_median</sub>)<br/>&sigma;<sub>MAD</sub> = 0.8493 · Median( v<sub>1...n</sub> ) &nbsp; (where Median(v) is the median of metric residuals)<br/>w<sub>Hampel</sub>(v<sub>i</sub>) = { 1.0 if v<sub>i</sub> &le; 3 · &sigma;<sub>MAD</sub> ; &nbsp; 0.0 if v<sub>i</sub> &gt; 3 · &sigma;<sub>MAD</sub> }<br/>Lat<sub>Hampel</sub> = ( &Sigma;<sub>i &isin; Inliers</sub> w<sub>i</sub> · Lat<sub>i</sub> ) / ( &Sigma;<sub>i &isin; Inliers</sub> w<sub>i</sub> ) &nbsp; , &nbsp; Lng<sub>Hampel</sub> = ( &Sigma;<sub>i &isin; Inliers</sub> w<sub>i</sub> · Lng<sub>i</sub> ) / ( &Sigma;<sub>i &isin; Inliers</sub> w<sub>i</sub> )</div>
    
    <ul class="symbols">
      <li><b>Lat<sub>L1_median</sub>, Lng<sub>L1_median</sub></b>: The coordinate components of the true rotation-invariant Spatial L1 Median computed via Weiszfeld's algorithm, possessing a breakdown point of 50%.</li>
      <li><b>v<sub>i</sub></b>: The 2D metric Euclidean distance (residual) of the <i>i</i>-th observation epoch relative to the Spatial L1 Median, measured in meters.</li>
      <li><b>&sigma;<sub>MAD</sub></b>: The robust Rayleigh scale estimator of the spatial residuals. The scale factor 0.8493 converts the median of 2D metric distances into a consistent standard deviation estimate of coordinates under Rayleigh properties.</li>
      <li><b>3 &middot; &sigma;<sub>MAD</sub></b>: The absolute upper boundary threshold based on the Hampel robust three-sigma rule.</li>
      <li><b>w<sub>Hampel</sub>(v<sub>i</sub>)</b>: The binary robust weight filter. It takes the value 1.0 for valid observations and 0.0 for isolated outliers.</li>
      <li><b>Inliers</b>: The index set {i | w<sub>Hampel</sub>(v<sub>i</sub>) = 1.0} of epochs passing the Hampel filter. If fewer than 2 epochs remain, the algorithm automatically falls back to full WLS as a numerical safety guard.</li>
    </ul>

    <h2>4. Hodges-Lehmann R-Estimator (Hodges-Lehmann R-Estimation)</h2>
    <p>Hodges ve Lehmann (1963) tarafından geliştirilen bu R-tahmincisi, parametrik olmayan (non-parametric) sıralama testleri teorisine (Wilcoxon Signed-Rank Test) dayanır. Enlem ve Boylam boyutları tamamen birbirinden bağımsız (1D) iki zaman serisi olarak işlenir. Örneklem kümesindeki tüm olası ikili eleman kombinasyonlarının aritmetik ortalamalarını (jeodezide "Walsh averages" olarak adlandırılır) hesaplar ve bu yeni türetilmiş alt kümenin medyan değerini gürbüz konum kestirimi olarak kabul eder. Dağılım simetrisi veya yapısı hakkında hiçbir ön varsayıma ihtiyaç duymadığı için son derece kararlıdır. Asimptotik kırılma noktası yaklaşık %29.3 olup, Gaussian dağılım altındaki göreceli etkinliği klasik aritmetik ortalamaya göre %95.5 gibi yüksek bir seviyededir:</p>
    
    <div class="formula" style="line-height: 1.3; margin: 10pt 0; padding: 8pt;">Let M = n(n + 1) / 2 &nbsp; (total Walsh average pairs)<br/>W_Lat<sub>i,j</sub> = ( Lat<sub>i</sub> + Lat<sub>j</sub> ) / 2 &nbsp; ( &forall; 1 &le; i &le; j &le; n )<br/>W_Lng<sub>i,j</sub> = ( Lng<sub>i</sub> + Lng<sub>j</sub> ) / 2 &nbsp; ( &forall; 1 &le; i &le; j &le; n )<br/>Lat<sub>HL</sub> = Median( { W_Lat<sub>i,j</sub> } for 1 &le; i &le; j &le; n )<br/>Lng<sub>HL</sub> = Median( { W_Lng<sub>i,j</sub> } for 1 &le; i &le; j &le; n )</div>
    
    <ul class="symbols">
      <li><b>Lat<sub>HL</sub>, Lng<sub>HL</sub></b>: The final robust Hodges-Lehmann Latitude and Longitude coordinate estimates.</li>
      <li><b>W_Lat<sub>i,j</sub>, W_Lng<sub>i,j</sub></b>: The Walsh coordinate averages computed for Latitude and Longitude using the <i>i</i>-th and <i>j</i>-th epochs.</li>
      <li><b>i, j</b>: Loop indices representing pair combinations of geodetic epochs. By restricting j &ge; i, we include the self-averages of the individual points.</li>
      <li><b>M</b>: The cardinality of the symmetric combination matrix of size n &times; n, which mathematically equals n(n+1)/2.</li>
      <li><b>Median</b>: The statistical operator that extracts the central value of a sorted numeric array. For an even number of elements, it computes the average of the two central values.</li>
    </ul>

    <h2>5. Tukey's Trimean</h2>
    <p>Tukey'in Üçlü Ortalaması (Tukey, 1977), sıralı istatistiklerin doğrusal kombinasyonu olan L-tahmincileri sınıfından son derece hızlı, kararlı ve etkin bir gürbüz merkezi eğilim kestiricisidir. Enlem ve Boylam koordinat dizilerini bağımsız sıralı diziler (order statistics) olarak işler. Birinci çeyreklik (Q1, %25. kartil), medyan (Q2, %50. kartil) ve üçüncü çeyreklik (Q3, %75. kartil) değerlerinin ağırlıklı kombinasyonunu alır. Bu sayede verinin hem merkezini hem de iki yöndeki kuyruk asimetrisini (asymmetric distribution skewness) başarıyla modeller ve asimetrik çoklu yol saçılımlarına karşı yüksek direnç gösterir:</p>
    
    <div class="formula" style="line-height: 1.3; margin: 10pt 0; padding: 8pt;">Sort Latitude and Longitude observations to construct order statistics:<br/>Lat<sub>(1)</sub> &le; Lat<sub>(2)</sub> &le; ... &le; Lat<sub>(n)</sub> &nbsp; and &nbsp; Lng<sub>(1)</sub> &le; Lng<sub>(2)</sub> &le; ... &le; Lng<sub>(n)</sub><br/>Q1<sub>Lat</sub> = Percentile(Lat, 0.25) &nbsp; , &nbsp; Q1<sub>Lng</sub> = Percentile(Lng, 0.25)<br/>Q2<sub>Lat</sub> = Percentile(Lat, 0.50) &nbsp; , &nbsp; Q2<sub>Lng</sub> = Percentile(Lng, 0.50) &nbsp; (Sample Median)<br/>Q3<sub>Lat</sub> = Percentile(Lat, 0.75) &nbsp; , &nbsp; Q3<sub>Lng</sub> = Percentile(Lng, 0.75)<br/>Lat<sub>Trimean</sub> = ( Q1<sub>Lat</sub> + 2 · Q2<sub>Lat</sub> + Q3<sub>Lat</sub> ) / 4<br/>Lng<sub>Trimean</sub> = ( Q1<sub>Lng</sub> + 2 · Q2<sub>Lng</sub> + Q3<sub>Lng</sub> ) / 4</div>
    
    <ul class="symbols">
      <li><b>Lat<sub>Trimean</sub>, Lng<sub>Trimean</sub></b>: The robust coordinates calculated using Tukey's Trimean formula.</li>
      <li><b>Lat<sub>(i)</sub>, Lng<sub>(i)</sub></b>: The sorted ordered sequence (order statistics) of observed Latitude and Longitude coordinate components.</li>
      <li><b>Q1<sub>Lat</sub>, Q1<sub>Lng</sub></b>: The first quartile (25th percentile) of the coordinate distributions.</li>
      <li><b>Q2<sub>Lat</sub>, Q2<sub>Lng</sub></b>: The second quartile or statistical median (50th percentile) of the coordinate distributions.</li>
      <li><b>Q3<sub>Lat</sub>, Q3<sub>Lng</sub></b>: The third quartile (75th percentile) of the coordinate distributions.</li>
      <li><b>Percentile(X, p)</b>: The linear interpolation percentile operator that calculates the value below which a percentage <i>p &times; 100</i> of the observations fall.</li>
    </ul>

    <h2>6. Optimal S-Estimator (Optimal S-Estimation)</h2>
    <p>S-tahmincileri (Rousseeuw ve Yohai, 1984), gürbüz istatistikte çok yüksek kırılma noktasına (%50) sahip ve asimptotik olarak son derece etkin kestirim modelleridir. Bu algoritmada, Tukey'in İki-Ağırlıklı (Biweight / bisquare) sönümleme fonksiyonu tercih edilmiştir. İki boyutlu uzayda IRLS mantığıyla çalışan yöntem, merkeze çok uzak gözlemleri tamamen sıfırlayarak dışlarken, orta mesafedeki gözlemleri ise yumuşak bir şekilde sönümleyerek sisteme dahil eder. Bu yönüyle hem Huber'in yumuşaklığını hem de Hampel'in katı kaba hata eleme gücünü birleştiren modern bir yaklaşımdır. Başlangıç merkezi olarak Weiszfeld algoritmasıyla türetilen <b>Spatial L1 Median (Geometric Median)</b> koordinatları kullanılır, böylece rota ve eksen bağımsızlığı (rotation-invariance) korunur. İki boyutlu uzayda çalışıldığından gürbüz ölçek parametresi Rayleigh dağılım katsayısı olan <b>0.8493</b> ile çarpılarak ölçeklenir. Standardize edilmiş artıklar (u) üzerinden ağırlıklar atanır:</p>
    
    <div class="formula" style="line-height: 1.3; margin: 10pt 0; padding: 8pt;"><b>Iterative Formulation and Optimal S Sequence:</b><br/>1. Initialize Coordinates (Weiszfeld's Spatial L1 Median): Lat<sup>(0)</sup> = Lat<sub>Weiszfeld</sub> , Lng<sup>(0)</sup> = Lng<sub>Weiszfeld</sub><br/>2. Compute Spatial Residual: v<sub>i</sub><sup>(k)</sup> = calculateDistanceMeter(Lat<sub>i</sub>, Lng<sub>i</sub>, Lat<sup>(k)</sup>, Lng<sup>(k)</sup>)<br/>3. Compute Robust Scale (2D Rayleigh Consistency): &sigma;<sub>MAD</sub><sup>(k)</sup> = 0.8493 · Median( v<sub>i</sub><sup>(k)</sup> ) &nbsp; (&sigma;<sub>MAD</sub><sup>(k)</sup> &ge; 10<sup>-7</sup> m)<br/>4. Compute Dynamic Cutoff Bound: S<sup>(k)</sup> = c · &sigma;<sub>MAD</sub><sup>(k)</sup> &nbsp; (Tukey's biweight location tuning constant c = 3.0)<br/>5. Calculate Standardized Spatial Deviation: u<sub>i</sub><sup>(k)</sup> = v<sub>i</sub><sup>(k)</sup> / S<sup>(k)</sup><br/>6. Robust Tukey's Biweight Weight Factor Calculation:<br/>w<sub>Biweight</sub>(u<sub>i</sub><sup>(k)</sup>) = { ( 1 - (u<sub>i</sub><sup>(k)</sup>)<sup>2</sup> )<sup>2</sup> if |u<sub>i</sub><sup>(k)</sup>| &le; 1.0 ; &nbsp; 0.0 if |u<sub>i</sub><sup>(k)</sup>| &gt; 1.0 }<br/>7. Combine Weights: w<sub>total,i</sub><sup>(k)</sup> = w<sub>i</sub> · w<sub>Biweight</sub>(u<sub>i</sub><sup>(k)</sup>)<br/>8. Update Coordinates: Iterate until spatial convergence threshold (0.001 m) is met or k = 20.</div>
    
    <ul class="symbols">
      <li><b>u<sub>i</sub><sup>(k)</sup></b>: The dimensionless standardized spatial residual for the <i>i</i>-th observation. It represents the ratio of the physical metric residual to the dynamic outlier boundary (S<sup>(k)</sup>).</li>
      <li><b>c = 3.0</b>: Tukey's biweight location tuning constant, selected to provide an optimal balance between extreme outlier rejection and statistical efficiency in geodetic measurements.</li>
      <li><b>S<sup>(k)</sup></b>: The dynamic robust outlier boundary calculated at the <i>k</i>-th iteration. Any observation lying beyond this metric boundary (i.e., |u| &gt; 1.0) is assigned a weight of exactly 0.0.</li>
      <li><b>w<sub>Biweight</sub>(u<sub>i</sub><sup>(k)</sup>)</b>: The robust weight multiplier. It smoothly decreases from 1.0 (for zero residual) to 0.0 as the standardized residual approaches the boundary of 1.0.</li>
      <li><b>w<sub>total,i</sub><sup>(k)</sup></b>: The final composite weight assigned to both coordinate components at iteration <i>k</i>, combining the stochastic weight (w<sub>i</sub>) and the robust biweight (w<sub>Biweight</sub>).</li>
    </ul>

    <h2>LİTERATÜR VE AKADEMİK KAYNAKLAR (BIBLIOGRAPHY)</h2>
    <ul class="ref-list">
      <li><b>Hampel, F. R.</b> (1974). "The influence curve and its role in robust estimation." <i>Journal of the American Statistical Association</i>, Vol. 69, No. 346, pp. 383-393. <br/><i>Referans Detayı:</i> Bölüm 2: "The Influence Curve: Definitions and Basic Properties" (sf. 384-388) & Bölüm 5: "Robust Estimators of Location" (sf. 390-392).</li>
      
      <li><b>Hodges, J. L., & Lehmann, E. L.</b> (1963). "Estimates of location based on rank tests." <i>The Annals of Mathematical Statistics</i>, Vol. 34, No. 2, pp. 598-611. <br/><i>Referans Detayı:</i> Bölüm 1: "Introduction and Formulation of Estimates" (sf. 598-600) & Bölüm 3: "Properties of the Estimates and Breakdown Behavior" (sf. 601-605).</li>
      
      <li><b>Huber, P. J.</b> (1964). "Robust estimation of a location parameter." <i>The Annals of Mathematical Statistics</i>, Vol. 35, No. 1, pp. 73-101. <br/><i>Referans Detayı:</i> Bölüm 3: "M-Estimators and Asymptotic Variance" (sf. 76-80) & Bölüm 4: "The IRLS Iterative Convergence Scheme" (sf. 81-85).</li>
      
      <li><b>Rousseeuw, P. J., & Yohai, V. J.</b> (1984). "Robust regression by means of S-estimators." <i>Robust and Nonlinear Time Series Analysis</i>, Lecture Notes in Statistics, Vol. 26, Springer-Verlag, Heidelberg. <br/><i>Referans Detayı:</i> Bölüm 2: "Definition and High Breakdown S-estimation of Multivariate Location" (sf. 258-261) & Bölüm 3: "Asymptotic Efficiency of Redescending Scales" (sf. 262-266).</li>
      
      <li><b>Teunissen, P. J. G.</b> (2000). <i>Adjustment theory: an introduction</i>. 1st Edition, Delft University Press, Delft, Netherlands. <br/><i>Referans Detayı:</i> Bölüm 3: "The Least-Squares Method and Stochastic Spatial Adjustment" (sf. 49-55) & Bölüm 4: "Gauss-Markov Linear Estimation and BLUE Properties" (sf. 58-64).</li>
      
      <li><b>Tukey, J. W.</b> (1977). <i>Exploratory Data Analysis</i>. 1st Edition, Addison-Wesley Publishing Company, Reading, Mass. <br/><i>Referans Detayı:</i> Bölüm 2: "Quartiles, Order Statistics, Percentile Interpolation and Trimean Formulae" (sf. 39-43) & Bölüm 5: "Symmetrical L-estimators of Central Tendency" (sf. 45-48).</li>
    </ul>

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
