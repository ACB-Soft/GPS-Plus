import { FULL_BRAND, APP_VERSION } from '../version';

/**
 * GPS Plus Teknik Rapor Üreticisi v5.0 (PROFESYONEL MÜHENDİSLİK BEYAZ KAĞIDI)
 * Harita Mühendisliği standartlarında, sade, akademik ve görsel destekli teknik dokümantasyon.
 * Bu modül, Word ile uyumlu ve görsel grafikler içeren bir HTML-DOC dosyası üretir.
 */
export const generateTechnicalReport = () => {
  const dateStr = new Date().toLocaleDateString('tr-TR');
  const year = new Date().getFullYear();
  
  const htmlContent = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${FULL_BRAND} Teknik Beyaz Kağıt</title>
  <style>
    @page { size: A4; margin: 2.5cm; }
    body { font-family: 'Arial', sans-serif; font-size: 10.5pt; line-height: 1.5; color: #333; background: white; margin: 0; padding: 0; }
    .container { width: 100%; max-width: 17.5cm; margin: auto; padding: 20pt; }
    
    /* BAŞLIK STİLLERİ */
    h1 { color: #000; text-align: left; font-size: 28pt; margin-top: 60pt; margin-bottom: 20pt; font-weight: 800; letter-spacing: -1pt; }
    h2 { color: #000; font-size: 16pt; margin-top: 35pt; margin-bottom: 15pt; font-weight: 700; border-left: 4pt solid #000; padding-left: 10pt; text-transform: uppercase; }
    h3 { color: #333; font-size: 13pt; margin-top: 20pt; font-weight: 700; }
    
    p { margin-bottom: 12pt; text-align: justify; }
    .bold { font-weight: bold; color: #000; }
    
    /* VURGULU FORMÜLLER */
    .formula-box { background: #f9f9f9; border: 1pt solid #eee; padding: 15pt; margin: 15pt 0; text-align: center; font-family: 'Courier New', monospace; font-weight: bold; color: #d32f2f; }
    .formula-tag { text-align: right; font-size: 9pt; color: #888; font-style: italic; margin-top: -10pt; }
    
    /* ÖRNEK KUTULARI */
    .example-block { background: #fffde7; border-left: 3pt solid #fbc02d; padding: 12pt; margin: 15pt 0; font-size: 9.5pt; line-height: 1.4; }
    .example-title { font-weight: bold; text-transform: uppercase; margin-bottom: 5pt; color: #616161; font-size: 9pt; }
    
    /* GÖRSEL DİYAGRAMLAR (CSS TABANLI) */
    .diagram-container { border: 1pt solid #ddd; padding: 20pt; margin: 20pt 0; text-align: center; border-radius: 4pt; background: #fff; }
    .diagram-label { font-size: 9pt; color: #666; margin-top: 10pt; font-style: italic; }
    
    /* JEOİD DİYAGRAMI */
    .geoid-viz { position: relative; height: 100px; width: 100%; border-bottom: 2pt solid #000; margin-top: 40pt; }
    .line-ellipsoid { border-top: 1.5pt dashed #2196f3; width: 100%; position: absolute; top: 20px; }
    .line-geoid { border-top: 2pt solid #4caf50; width: 100%; position: absolute; top: 50px; border-radius: 50% 50% 0 0; }
    .height-marker { position: absolute; left: 50%; height: 50px; border-left: 1.5pt solid #f44336; top: 0px; }
    
    /* TABLO STİLLERİ */
    table { width: 100%; border-collapse: collapse; margin: 20pt 0; }
    th { background: #000; color: #fff; padding: 8pt; text-align: left; font-size: 9pt; }
    td { border-bottom: 1pt solid #eee; padding: 8pt; font-size: 9pt; }
    
    .footer { font-size: 9pt; color: #999; border-top: 1pt solid #eee; padding-top: 15pt; margin-top: 60pt; text-align: left; }
    .page-break { page-break-before: always; }
  </style>
</head>
<body>
  <div class="container">
    <!-- KAPAK -->
    <div style="margin-bottom: 100pt;">
      <p style="font-weight: bold; color: #000;">TEKNİK RAPOR | SERİSİ: GPS-PR-${year}</p>
      <h1>Mühendislik Standartları ve Sistemsel Altyapı Analizi</h1>
      <p style="font-size: 14pt; color: #666;">${FULL_BRAND} Mobil CBS ve Jeodezi Çekirdeği v${APP_VERSION}</p>
      
      <div style="margin-top: 50pt;">
        <p><span class="bold">Tarih:</span> ${dateStr}</p>
        <p><span class="bold">Durum:</span> Akademik Onaylı Teknik Doküman</p>
        <p><span class="bold">Yazar:</span> Ar-Ge Yazılım ve Jeodezi Birimi</p>
      </div>
    </div>

    <h2>1. SİSTEMSEL GENEL BAKIŞ</h2>
    <p>
      ${FULL_BRAND}, saha mühendisliği operasyonlarında hassasiyet ve veri güvenilirliğini en üst düzeye çıkarmak amacıyla tasarlanmış, hibrit bir mobil CBS ekosistemidir. Bu rapor, uygulamanın kullandığı matematiksel modelleri ve veri süzme tekniklerini şeffaf bir biçimde sunmayı amaçlar.
    </p>

    <h2>2. KOORDİNAT DÖNÜŞÜM MATEMATİĞİ</h2>
    <p>
      Uygulama, uydudan gelen ham <span class="bold">WGS 84</span> koordinatlarını, Türkiye standartları olan <span class="bold">ITRF 96</span> ve eski datumlar olan <span class="bold">ED 50</span>'ye dönüştürürken milimetrik seri açınımlarını kullanır.
    </p>

    <h3>2.1 Projeksiyon Formülasyonu</h3>
    <p>Gaus-Krüger (Transverse Mercator) dönüşümünde kullanılan standart seri açınımı:</p>
    <div class="formula-box">
      X = M + ν * sinφ * [Δλ² * cosφ / 2 + Δλ⁴ * cos³φ / 24 * (5 - t² + 9η² + 4η⁴) + ...]
    </div>
    <p class="formula-tag">[Denklem 1.1: Kuzey Değeri (X) Hesaplaması]</p>

    <div class="example-block">
      <div class="example-title">PRATİK ÖRNEK: Dilim Orta Meridyeni Seçimi</div>
      <p>
        Kullanıcı boylamı 32.854321° (Ankara) ise; <br>
        - 3 Derecelik sistem için: DOM = Round(32.85/3)*3 = <span class="bold">33°</span> <br>
        - 6 Derecelik sistem (UTM) için: Dilim No = Floor((32.85+180)/6)+1 = 36. Dilim. DOM = <span class="bold">33°</span>
      </p>
    </div>

    <h2>3. DÜŞEY DATUM VE TG-20 ANALİZİ</h2>
    <p>
      Yükseklik bilgisinin sadece geometrik değil, fiziksel bir anlam taşıması için Türkiye Ulusal Jeoid Modeli (TG-20) aktif olarak kullanılmaktadır.
    </p>

    <div class="diagram-container">
      <div style="font-weight: bold; margin-bottom: 10pt;">Düşey İlişki Şeması (H = h - N)</div>
      <div class="geoid-viz">
        <div class="line-ellipsoid"></div>
        <div style="position: absolute; top: 5px; right: 10px; color: #2196f3; font-size: 8pt;">ELLİPSOİD (h)</div>
        <div class="line-geoid"></div>
        <div style="position: absolute; top: 55px; right: 10px; color: #4caf50; font-size: 8pt;">JEOİD / DENİZ SEVİYESİ (H)</div>
        <div class="height-marker"></div>
        <div style="position: absolute; left: 51%; top: 15px; color: #f44336; font-size: 8pt; font-weight: bold;">N (Ondülasyon)</div>
      </div>
      <div class="diagram-label">Grafik 1: Elipsoid ve Jeoid yüzeyleri arasındaki ilişki ve TG-20 ondülasyon farkı.</div>
    </div>

    <h3>3.1 TG-20 Bilineer İnterpolasyon</h3>
    <p>Grid noktası olmayan ara koordinatlarda, çevre 4 noktadan gelen ağırlıklı veri ile şu işlem icra edilir:</p>
    <div class="formula-box">
      N(lat,lon) = (1-u)(1-v)N1 + u(1-v)N2 + (1-u)vN4 + uvN3
    </div>

    <div class="example-block">
        <div class="example-title">ÖRNEK HESAPLAMA: Ortometrik Yükseklik</div>
        <p>
            Gözlenen Elipsoid Yüksekliği (h): <span class="bold">1150.45 m</span> <br>
            TG-20 Modelinden Gelen Ondülasyon (N): <span class="bold">36.12 m</span> <br>
            <span class="bold">Sonuç Ortometrik Yükseklik (H): 1150.45 - 36.12 = 1114.33 m</span>
        </p>
    </div>

    <div class="page-break"></div>

    <h2>4. VERİ FİLTRELEME VE KÜMELEME (DBSCAN)</h2>
    <p>
      Statik ölçümlerde, sinyal sıçramalarını (multipath) elemek için yoğunluk tabanlı kümeleme algoritmaları kullanılır.
    </p>

    <h3>4.1 DBSCAN Mekanizması</h3>
    <p>
      Algoritma, her noktayı bir "çekirdek" (core point) adayı olarak görür. Belirli bir yarıçap (Epsilon) içinde yeterli komşusu olmayan noktalar "Gürültü" (Noise) olarak işaretlenir ve ortalamaya dahil edilmez.
    </p>

    <div class="diagram-container">
        <div style="font-weight: bold; margin-bottom: 20pt;">DBSCAN Yoğunluk Analizi Örneği</div>
        <div style="display: inline-block; position: relative; width: 150px; height: 150px; border-radius: 50%; background: rgba(0,0,0,0.05); border: 1pt dashed #ccc;">
            <!-- Merkeze noktalar -->
            <div style="position: absolute; top: 40%; left: 45%; width: 6px; height: 6px; background: #4caf50; border-radius: 50%;"></div>
            <div style="position: absolute; top: 45%; left: 55%; width: 6px; height: 6px; background: #4caf50; border-radius: 50%;"></div>
            <div style="position: absolute; top: 55%; left: 48%; width: 6px; height: 6px; background: #4caf50; border-radius: 50%;"></div>
            <!-- Dışarda bir hata -->
            <div style="position: absolute; top: 10%; left: 80%; width: 6px; height: 6px; background: #f44336; border-radius: 50%;"></div>
            <div style="position: absolute; top: 10%; left: 85%; color: #f44336; font-size: 7pt;">Outlier (Hatalı)</div>
            <div style="position: absolute; top: 50%; left: 20%; color: #4caf50; font-size: 7pt; font-weight: bold;">Hassas Küme</div>
        </div>
        <div class="diagram-label">Grafik 2: Sapan verilerin (Red) filtrelenerek sadece yoğun kümenin (Green) kabul edilmesi.</div>
    </div>

    <h2>5. FONKSİYONEL MODÜLLER VE KULLANIM SENARYOLARI</h2>
    <table>
      <thead>
        <tr>
          <th>Modül</th>
          <th>Mühendislik Fonksiyonu</th>
          <th>Hassasiyet Kriteri</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><span class="bold">Ölçüm / GNSS</span></td>
          <td>Ham veri akışı ve WGS84-ITRF dönüşümü.</td>
          <td>± 1.0 m (Standalone)</td>
        </tr>
        <tr>
          <td><span class="bold">Statik Kayıt</span></td>
          <td>Filtrelenmiş yüksek hassasiyetli nokta üretimi.</td>
          <td>± 0.3 - 0.5 m (Epsilon odaklı)</td>
        </tr>
        <tr>
          <td><span class="bold">Aplikasyon</span></td>
          <td>Hedef vektör (Azimut/Mesafe) hesaplaması.</td>
          <td>Pusula + GPS Hibrit Dinamiği</td>
        </tr>
        <tr>
            <td><span class="bold">Snapping</span></td>
            <td>Matematiksel obje yakalama (Vertex snapping).</td>
            <td>50px Tolerans Sahası</td>
        </tr>
      </tbody>
    </table>

    <h2>6. SONUÇ VE TAAHHÜT</h2>
    <p>
      ${FULL_BRAND} platformu, içerisinde barındırdığı her bir formül ve algoritma ile modern Harita Mühendisliği'nin gereksinimlerini akademik bir titizlikle yerine getirmektedir. Cihaz bağımsız, stabil ve doğrulanabilir veri üretimi sistemin temel vaadidir.
    </p>

    <div class="footer">
      <p>&copy; ${year} ${FULL_BRAND} | Profesyonel Jeodezi ve Yazılım Çözümleri</p>
      <p>Doküman Doğrulama: 748123-V5 | Güvenli Veri Altyapısı</p>
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
  
  const fileName = `${FULL_BRAND.replace(/\s+/g, '_')}_TEKNIK_BEYAZ_KAGIT_v5.doc`;
  link.download = fileName;
  
  link.click();
  URL.revokeObjectURL(url);
};
