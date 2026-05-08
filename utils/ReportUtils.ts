import { FULL_BRAND, APP_VERSION } from '../version';

export const generateTechnicalReport = () => {
  const content = `
================================================================================
                TEKNİK RAPOR: ${FULL_BRAND} SİSTEM ALTYAPISI
                             Versiyon: ${APP_VERSION}
================================================================================

1. GİRİŞ
Bu rapor, ${FULL_BRAND} mobil CBS ve GNSS ölçüm uygulamasının teknik mimarisini, kullanılan 
matematiksel modelleri ve yazılımsal optimizasyon tekniklerini belgelemek amacıyla 
hazırlanmıştır. Uygulama, saha mühendisliği ihtiyaçları doğrultusunda yüksek hassasiyetli 
veri toplama, koordinat dönüşümü ve gerçek zamanlı görselleştirme sunmak üzere tasarlanmıştır.

2. MATERYAL VE METOT
2.1. Yazılım Teknolojileri
Uygulama, modern web standartları ve hibrit mobil uygulama prensipleriyle geliştirilmiştir:
- React 18+ & Vite: Component tabanlı arayüz mimarisi ve yüksek performanslı derleme süreci.
- TypeScript: Tip güvenliği ile yazılımsal hataların (runtime errors) minimize edilmesi.
- Tailwind CSS: Performans odaklı, düşük paket boyutlu stil yönetimi.
- Leaflet JS: Donanım hızlandırmalı (Canvas/WebGL) harita motoru.

2.2. Koordinat Sistemleri ve Dönüşümler
Sistem, ITRF (International Terrestrial Reference Frame) ve WGS84 datumu üzerine inşa edilmiştir.
- UTM Projeksiyonu: 3 derecelik (TME) ve 6 derecelik dilim esasına göre Gauss-Krüger projeksiyonu 
  hesaplamaları, Vincenty ve Haversine algoritmaları ile desteklenmektedir.
- Datum Dönüşümü: Lokal sistemler için 7 parametreli (Helmert) veya 3 parametreli (Molodensky) 
  dönüşüm altyapısı mevcuttur.

2.3. Düşey Datum ve Jeoid Modelleme
Uygulama, elipsoidal yüksekliklerden (h) ortometrik yüksekliklere (H) geçiş için EGM96 (Earth 
Gravitational Model 1996) global jeoid modelini kullanmaktadır.
- n (Ondülasyon) Değeri: Grid verisi üzerinden bilineer interpolasyon yöntemi ile hesaplanır.
- Formülasyon: H = h - n denklemi uyarınca gerçek zamanlı düzeltme uygulanır.

3. VERİ ANALİZİ VE FİLTRELEME ALGORİTMALARI
Statik ölçüm modunda verinin kararlılığını sağlamak amacıyla üç katmanlı bir istatistiksel 
modelleme uygulanır:
3.1. Aritmetik Ortalama: Saf veri setinin merkezi eğilimi.
3.2. Medyan Filtreleme: "Outlier" (aykırı) verilerin, özellikle uydu sinyal yansıması (multipath) 
     nedeniyle oluşan hataların elenmesi için kullanılır.
3.3. Dinamik Epsilon Kümeleme (DBSCAN tabanlı): Belirlenen hassasiyet yarıçapı (epsilon) içinde 
     kalan en yoğun veri grubunun merkezinin hesaplanması. Bu, saha koşullarında en güvenilir 
     sonucu (fix/float geçişleri dahil) verir.

4. PERFORMANS OPTİMİZASYONLARI
Büyük ölçekli KML/DXF verilerinin mobil cihazlarda akıcı çalışması için şu teknikler uygulanmıştır:
- Lazy Vertex Rendering: Sadece ekran görüş alanındaki (Viewport) köşe noktalarının DOM'a basılması.
- Memoization: React.memo ve useMemo ile gereksiz render işlemlerinin önlenmesi.
- Coordinate Pre-processing: Koordinat dönüşümlerinin render anında değil, veri yükleme 
  esnasında bir kez yapılıp hafızada hazır tutulması.

5. SONUÇ VE TAAHHÜT
${FULL_BRAND}, bir Harita Mühendisinin saha tecrübesi ile modern yazılım dünyasının imkanlarını 
birleştiren dinamik bir yapıdır. Sistem açık kaynak standartlarına saygılı ve akademik olarak 
doğrulanabilir algoritmalarla çalışmaktadır.

--------------------------------------------------------------------------------
Bu rapor sistem tarafından otomatik olarak oluşturulmuştur.
Tarih: ${new Date().toLocaleDateString('tr-TR')}
748123 - Verification Key
--------------------------------------------------------------------------------
`;

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `GPS_Plus_Teknik_Rapor_${new Date().toISOString().split('T')[0]}.txt`;
  link.click();
  URL.revokeObjectURL(url);
};
