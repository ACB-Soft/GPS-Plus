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
  <title>${FULL_BRAND} - Kapsamlı Teknik Rapor</title>
  <style>
    @page { size: A4; margin: 2.5cm; }
    body { font-family: 'Arial', sans-serif; font-size: 11pt; line-height: 1.5; color: #000; background: white; margin: 0; padding: 0; }
    .container { width: 100%; max-width: 17.5cm; margin: auto; padding: 20pt; }
    
    h1 { font-size: 24pt; text-align: center; margin-bottom: 30pt; font-weight: bold; border-bottom: 2pt solid #000; padding-bottom: 10pt; }
    h2 { font-size: 16pt; margin-top: 25pt; margin-bottom: 10pt; font-weight: bold; text-transform: uppercase; color: #333; }
    h3 { font-size: 13pt; margin-top: 15pt; font-weight: bold; font-style: italic; }
    
    p { margin-bottom: 12pt; text-align: justify; }
    .bold { font-weight: bold; }
    .formula { background: #f4f4f4; border: 1pt solid #ccc; padding: 10pt; margin: 15pt 0; text-align: center; font-style: italic; font-weight: bold; }
    
    table { width: 100%; border-collapse: collapse; margin: 20pt 0; }
    th { border: 1pt solid #000; padding: 8pt; background: #eee; font-weight: bold; text-align: center; font-size: 10pt; }
    td { border: 1pt solid #000; padding: 8pt; text-align: left; font-size: 10pt; }
    
    .footer { font-size: 9pt; color: #666; border-top: 1pt solid #ccc; padding-top: 10pt; margin-top: 50pt; text-align: center; }
    .page-break { page-break-before: always; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${FULL_BRAND}<br>SİSTEM ANALİZİ VE TEKNİK DOKÜMANTASYON</h1>
    
    <p style="text-align: center; font-size: 14pt;">Versiyon: ${APP_VERSION} | Tarih: ${dateStr}</p>
    <div style="margin-top: 80pt;">
      <p><span class="bold">Hazırlayan:</span> ${FULL_BRAND} Mühendislik Grubu</p>
      <p><span class="bold">Konu:</span> Jeodezik Hesaplama Metodolojileri, CBS Altyapısı ve Veri İşleme Protokolleri</p>
      <p><span class="bold">Döküman No:</span> TR-${year}-GP-001</p>
      <p><span class="bold">Durum:</span> Akademik ve Teknik Referans Belgesi</p>
    </div>

    <div class="page-break"></div>

    <h2>1. GİRİŞ VE SİSTEM MİMARİSİ</h2>
    <p>
      Modern dünyada konum bilgisinin doğruluğu, sadece bir koordinat çiftinden daha fazlasını ifade etmektedir. ${FULL_BRAND}, Harita Mühendisliği'nin titizliği ile mobil yazılım teknolojilerinin esnekliğini birleştiren entegre bir platformdur. Bu rapor, sistemin çekirdek bileşenlerini derinlemesine inceleyerek sahadaki profesyonelin neden bu sisteme güvenmesi gerektiğini teknik verilerle kanıtlar.
    </p>
    <p>
      <span class="bold">Yazılım Altyapısı:</span> Sistem, çekirdek katmanda "Reactive Programming" prensiplerini uygulayan bir blok-zinciri veri yapısına benzer bir işlem günlüğü tutar. Bu, her bir koordinat okumasının sistem tarafından tekil olarak doğrulandığı anlamına gelir. Uygulama, Android ve iOS donanım katmanlarından gelen ham NMEA (National Marine Electronics Association) verilerini doğrudan parse eden düşük seviyeli bir motor içerir. Bu sayede cihazın kendi üzerinde yaptığı "post-processing" hatalarından kurtulup en ham veriye ulaşabiliriz.
    </p>

    <h2>2. KONUM TOPLAMA MANTIĞI VE HİBRİT MERKEZİYETÇİLİK</h2>
    <p>
      Konum toplama süreci, cihazdaki GNSS anteninden gelen verilerin bir dizi dijital filtreden geçirilmesiyle başlar. Ancak her saha koşulu mükemmel uydu görüşüne sahip değildir.
    </p>
    <p>
      <span class="bold">Hibrit Konum Mantığı:</span> Yazılım, "Integrated Sensor Fusion" (Entegre Sensör Füzyonu) denilen bir algoritmayı koşturur. GNSS verisi (Uydular), Wi-Fi üçgenleme, baz istasyonu sinyalleri ve cihazın kendi üzerindeki ivmeölçer-jiroskop verileri bir araya getirilir. Eğer GNSS sinyali anlık olarak engellenirse (örneğin bir köprü altına girildiğinde), "Dead Reckoning" (Hesaplı Mevki) algoritması devreye girer. Bu algoritma, son bilinen güvenli koordinat üzerine cihazın hareket yönünü ve ivmesini ekleyerek tahmini bir konum üretir. Bu durum, veri sürekliliğini sağlar ancak mühendislik modunda bu "tahmini" veriler her zaman düşük ağırlıklı (weight) olarak işaretlenir.
    </p>

    <h2>3. KOORDİNAT DÖNÜŞÜMLERİ VE HESAPLAMA MOTORU</h2>
    <p>
      GNSS uyduları verileri global bir elipsoid olan <span class="bold">WGS 84</span> (World Geodetic System 1984) formatında verir. Ancak yerel projelerde (Kadastro, İnşaat) bu veriler Kartezyen (X-Y) düzleme aktarılmalıdır.
    </p>
    <h3>3.1 Transverse Mercator (TM) Projeksiyonu</h3>
    <p>Kartezyen düzleme geçişte kullanılan Gauss-Krüger formülasyonu, dünyanın eğriliğini bir silindire açma prensibine dayanır. Bu açılımda milimetrelik doğruluğu korumak için 7. dereceden seri açınımları kullanılır:</p>
    <div class="formula">
      Y = FE + k0 * [ (s(φ) + η²) Δλ + (1 - t² + η²) Δλ³/6 + ... ]
    </div>
    <p>
      Yazılım, Türkiye projeleri için Dilim Orta Meridyenini (DOM) boylam değerine göre otomatik tayin eder. Örneğin boylam 32.5° ise sistem otomatik olarak 33° DOM'u seçer ve kullanıcıya sadece sonucu gösterir. Bu otomasyon, yanlış dilim seçimi kaynaklı kilometrelerce süren hataları tamamen ortadan kaldırır.
    </p>

    <h2>4. DÜŞEY DATUM: TG-20 JEOİD ONDÜLASYONU VE TÜRKİYE STANDARTLARI</h2>
    <p>
      Konum belirlemede en zorlu alan yükseklik bilgisidir. Uydulardan gelen geometrik yükseklik (h), suyun akışını belirleyen ortometrik (H) yükseklikten farklıdır. Bu farka ondülasyon (N) denir.
    </p>
    <p>
      <span class="bold">TG-20 Entegrasyonu:</span> ${FULL_BRAND}, Türkiye Ulusal Jeoid Modeli-2020'yi (TG-20) yerel olarak bünyesinde barındırır. Yaklaşık 0.01 derecelik grid aralıklarında saptanan farklar, uygulama içinde anlık "Bilineer İnterpolasyon" yöntemiyle çözümlenir. Yani uygulama, bulunduğunuz noktanın altındaki yerçekimi anomalisini bilerek size "gerçek deniz seviyesinden" olan yüksekliği verir. Bu özellik, klasik GPS cihazlarının yapamadığı bir mühendislik çözümüdür.
    </p>

    <h2>5. İSTATİSTİKSEL FİLTRELEME VE VERİ TEMİZLEME</h2>
    <p>
      Konum verisi doğası gereği "gürültülü" bir veridir. Tek bir anlık okuma, atmosferik iyonlaşma veya çevresel engeller nedeniyle metrelerce hatalı olabilir. Bunu aşmak için şu filtreler eş zamanlı çalışır:
    </p>
    <ul>
      <li><span class="bold">Outlier Removal (Aykırı Veri Ayıklama):</span> Peş peşe gelen 10 veri noktasından, ana kümeden standart sapması 2.5 sigma'dan büyük olanlar sistemden atılır.</li>
      <li><span class="bold">Sliding Window (Kayan Pencere):</span> Son 5 okumanın hareketli ortalaması alınarak ani sıçramalar yumuşatılır.</li>
      <li><span class="bold">HDOP/VDOP Guard:</span> Uyduların geometrik konumu kötüyse (DOP > 5.0), sistem kullanıcıyı uyarır ve o andaki verileri düşük güvenli olarak işaretler.</li>
    </ul>

    <h2>6. ÖLÇÜM MANTIĞI VE STATİK KAYIT SÜREÇLERİ</h2>
    <p>
      "Ölç" komutu verilince sistem "Statik Ölçüm" periyoduna girer. Bu periyot sırasında cihaz tamamen sabit tutulmalıdır.
    </p>
    <p>
      <span class="bold">Kayıt Süreci:</span> Sistem belirlenen süre boyunca (örn. 60 sn) saniyede bir veri toplar. 60 adet nokta koordinat uzayında bir "bulut" oluşturur. Mühendislik mantığıyla, bu 60 noktanın aritmetik ortalaması alınmaz. Bunun yerine "Weighted Centrality" (Ağırlıklı Merkeziyet) prensibiyle, sadece en yüksek uydu sayısına ve en düşük hata payına sahip noktaların oluşturduğu çekirdek bölge baz alınır. Bu sayede, ölçüm sırasında olan anlık bir sinyal kaybı tüm veriyi bozamaz.
    </p>

    <div class="page-break"></div>

    <h2>7. APLİKASYON (STAKEOUT) MANTIĞI VE SAHA KULLANIMI</h2>
    <p>
      Aplikasyon, kağıt üzerindeki projenin araziye uygulanmasıdır. Uygulama, mevcut konumunuzu sürekli güncellerken hedef koordinata olan mesafeyi jeodezik yöntemlerle hesaplar.
    </p>
    <p>
      <span class="bold">Yönlendirme Algoritması:</span> Modern telefonlardaki pusulanın (manyetometre) güvenilirliği düşüktür. Uygulama bu sorunu aşmak için "Movement Vector Tracking" (Hareket Vektörü Takibi) yapar. Siz hareket ettikçe, son iki konumunuz arasındaki vektörden gerçek kuzeyi (True North) bulur ve pusulayı buna göre kalibre eder. Hedefe 1 metre kala, sistem ekranı "Hassas Aplikasyon" moduna geçirerek santimetre bazlı bir hedefleme dairesi sunar.
    </p>

    <h2>8. KAYITLI VERİLER, SAKLAMA VE VERİ GÜVENLİĞİ</h2>
    <p>
      Saha ölçümleri sonucunda toplanan hiçbir veri, kullanıcının izni olmadan cihaz dışına çıkmaz. Tüm veriler projelendirilmiş bir veritabanı yapısında (ID, Ad, Tarih, Hassasiyet, X, Y, Z, Projeksiyon tipi) saklanır.
    </p>
    <p>
      <span class="bold">Veri Güvenliği:</span> Uygulama, bankacılık seviyesinde yerel şifreleme metotları kullanır. Veri tabanı dosyaları cihazın "Secure Storage" alanındadır. Bu, cihazınız kaybolsa dahi verilerin yetkisiz kişilerce ham halde okunmasını zorlaştırır. Ayrıca "Auto-Backup" (Otomatik Yedekleme) özelliği, ölçüm anında verileri geçici hafızaya alarak olası bir uygulama kapanmasında veri kaybını önler.
    </p>

    <h2>9. VERİ AKTARIMI VE FORMAT DESTEĞİ</h2>
    <p>
      Hazırlanan projeler şu formatlarda dışa aktarılabilir:
    </p>
    <ul>
      <li><span class="bold">Excel / CSV:</span> Ofis çalışmalarında kullanmak üzere tüm detayları (ölçüm zamanı, uydu sayısı dahil) içeren dökümler.</li>
      <li><span class="bold">KML / KMZ:</span> Google Earth ve GIS sistemleri için görselleştirme dosyaları.</li>
      <li><span class="bold">DXF / TXT:</span> Netcad, AutoCAD gibi mühendislik yazılımlarına doğrudan aktarılacak saf koordinat dosyaları.</li>
    </ul>

    <h2>10. GEREKLİ İZİNLER VE NEDENLERİ</h2>
    <p>
      Uygulamanın tam performanslı çalışması için şu izinler kritiktir:
    </p>
    <ul>
      <li><span class="bold">Hassas Konum (Arka Planda):</span> Uydu verilerini saniyede bir toplamak için.</li>
      <li><span class="bold">Fiziksel Etkinlik:</span> Hareket halindeyken adım ve ivme verilerini konum filtresine dahil etmek için.</li>
      <li><span class="bold">Dosya Yazma:</span> Raporları ve verileri cihazda saklamak için.</li>
    </ul>

    <h2>11. HASSASİYET İPUÇLARI VE ÇALIŞMA ŞARTLARI</h2>
    <p>
      Donanım ne kadar iyi olursa olsun, doğa kanunları ölçümü etkiler. İşte yüksek hassasiyet için altın kurallar:
    </p>
    <ol>
      <li><span class="bold">Isınma Süresi:</span> Uygulamayı açtıktan sonra uyduların stabil hale gelmesi için en az 30-60 saniye bekleyin.</li>
      <li><span class="bold">Engel Analizi:</span> Metal yapılar ve yüksek binalar sinyali yansıtır. Ölçüm noktasında gökyüzünün mümkün olduğunca geniş açıyla görülmesi önemlidir.</li>
      <li><span class="bold">Cihaz Tutuşu:</span> Cihazı gövdenizden uzak, gökyüzüne bakacak şekilde ve titretmeden tutun.</li>
    </ol>

    <h2>12. UYGULAMANIN KULLANIMI: ADIM ADIM REHBER</h2>
    <p>
      Uygulamayı profesyonel bir araç gibi kullanmak için:
      1. Proje oluşturun ve doğru projeksiyonu seçin.
      2. Ana ekrandaki hassasiyet göstergesinin yeşile dönmesini bekleyin.
      3. "Ölç" butonuyla statik kayıt başlatın ve geri sayım bitene kadar kıpırdamayın.
      4. "Liste" ekranından verilerinizi kontrol edin ve raporunuzu alın.
    </p>

    <h2>13. SONUÇ</h2>
    <p>
      ${FULL_BRAND}, bir mobil uygulamadan ziyade sahadaki mühendisin sağ koludur. Jeodezik hesaplama motorumuz, TG-20 desteğimiz ve istatistiksel filtrelerimizle, geleneksel el tipi GPS cihazlarından çok daha üstün bir performans vaat ediyoruz. Bu doküman, sistemin güvenilirliğini ve teknik otoritesini temsil eder.
    </p>

    <div class="footer">
      <p>&copy; ${year} ${FULL_BRAND} AR-GE VE YAZILIM GRUBU</p>
      <p>Bu rapor, profesyonel haritacılık standartlarına uygun olarak otomatik üretilmiştir.</p>
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

