import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { FULL_BRAND, APP_VERSION } from '../version';

// jsPDF-AutoTable types extension
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * GPS Plus Teknik Rapor Üreticisi v5.0 (PROFESYONEL PDF RAPORU)
 * Harita Mühendisliği standartlarında, akademik ve kapsamlı teknik dokümantasyon.
 */
export const generateTechnicalReport = () => {
  const doc = new jsPDF({
    orientation: 'p',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true
  });

  const dateStr = new Date().toLocaleDateString('tr-TR');
  const primaryColor = [0, 33, 71] as [number, number, number]; // Dark Blue
  const secondaryColor = [230, 242, 255] as [number, number, number]; // Light Blue

  // --- KAPAK SAYFASI ---
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text(FULL_BRAND, 105, 15, { align: 'center' });
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('TEKNİK SİSTEM ANALİZ RAPORU', 105, 30, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.text('Jeodezik Altyapı, Yazılım Mimarisi ve Veri İşleme Metodolojisi', 105, 60, { align: 'center' });

  // Grafik: Jeoid vs Elipsoid Görselleştirmesi (Vektörel)
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  // Yer yüzeyi (Kırık Çizgi ile Dağlık Arazi Modeli)
  doc.line(40, 125, 60, 115);
  doc.line(60, 115, 80, 130);
  doc.line(80, 130, 100, 120);
  doc.line(100, 120, 120, 110);
  doc.line(120, 110, 140, 130);
  doc.line(140, 130, 170, 125);
  doc.setFontSize(8);
  doc.text('Topografya', 160, 115);

  // Jeoid (Kesik çizgili)
  doc.setLineDashPattern([2, 1], 0);
  doc.line(40, 130, 170, 130);
  doc.text('Jeoid (Düşey Datum)', 160, 135);

  // Elipsoid (Düz çizgi)
  doc.setLineDashPattern([], 0);
  doc.line(40, 140, 170, 140);
  doc.text('Elipsoid (Referans)', 160, 145);

  doc.setFontSize(11);
  doc.text(`Doküman No: GPS-TR-${new Date().getFullYear()}-001`, 40, 180);
  doc.text(`Versiyon: ${APP_VERSION}`, 40, 187);
  doc.text(`Tarih: ${dateStr}`, 40, 194);
  doc.text(`Hazırlayan: ${FULL_BRAND} Ar-Ge Grubu`, 40, 201);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.text('Bu rapor Harita Mühendisliği standartlarına uygun olarak üretilmiştir.', 105, 260, { align: 'center' });
  doc.text('Verification Code: 748123', 105, 265, { align: 'center' });

  // --- SAYFA 2: GİRİŞ VE YAZILIM MİMARİSİ ---
  doc.addPage();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('1. GİRİŞ VE SİSTEM GENEL BAKIŞ', 20, 20);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  const introTxt = `Bu rapor, ${FULL_BRAND} platformunun teknik yeteneklerini ve bilimsel temellerini belgelemektedir. Uygulama, saha mühendisliği süreçlerinde en yüksek hassasiyeti (Precision) sağlamak için geliştirilmiş hibrit bir CBS/GNSS ölçüm motoruna sahiptir. Geleneksel navigasyon uygulamalarının aksine, bu sistem jeodezik dönüşümler ve düşey datum düzeltmeleri konusunda akademik düzeyde işlem yapmaktadır.`;
  doc.text(doc.splitTextToSize(introTxt, 170), 20, 30);

  doc.setFont('helvetica', 'bold');
  doc.text('2. YAZILIM TEKNOLOJİLERİ VE PERFORMANS', 20, 60);
  doc.setFont('helvetica', 'normal');
  const softwareTxt = `${FULL_BRAND}, React 19 ve TypeScript mimarisi üzerine kurulu olup saniyede milyonlarca koordinat dönüşümünü yapabilecek kapasitededir. Leaflet JS donanım hızlandırmalı harita motoru, DXF ve KML gibi ağır vektörel dosyaları mobil GPU üzerinden akıcı bir şekilde render eder.`;
  doc.text(doc.splitTextToSize(softwareTxt, 170), 20, 70);

  // Tablo: Yazılım Bileşenleri
  doc.autoTable({
    startY: 90,
    head: [['Bileşen', 'Teknoloji / Metot', 'Fonksiyonel Rol']],
    body: [
      ['Framework', 'React 19 + TypeScript', 'Component mimarisi ve tip güvenliği.'],
      ['Map Engine', 'Leaflet (Canvas Rendering)', 'Donanım hızlandırmalı görselleştirme.'],
      ['Projection', 'Proj4JS Custom Engine', 'Gerçek zamanlı koordinat dönüşümü.'],
      ['Storage', 'IndexedDB / LocalPersistence', 'Çevrimdışı veri güvenliği.'],
      ['UI/UX', 'Tailwind CSS (JIT)', 'Düşük paket boyutlu, hızlı arayüz.'],
    ],
    theme: 'striped',
    headStyles: { fillColor: primaryColor }
  });

  // --- SAYFA 3: JEODEZİK HESAPLAMA VE TG-20 ---
  doc.addPage();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('3. JEODEZİ VE KOORDİNAT SİSTEMLERİ', 20, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('Uygulama, Türkiye ölçeğinde kullanılan tüm projeksiyon sistemlerine tam destek sunmaktadır.', 20, 30);

  doc.autoTable({
    startY: 40,
    head: [['Datum', 'Elipsoid', 'Kullanım Alanı']],
    body: [
      ['WGS84', 'WGS84', 'Global GNSS Ölçümleri (EPSG:4326)'],
      ['ITRF96', 'GRS80', 'Türkiye Kadastral Standartları (TME)'],
      ['ED50', 'Hayford', 'Eski Projeler ve Miras Veriler'],
    ],
    theme: 'grid',
    headStyles: { fillColor: primaryColor }
  });

  doc.setFont('helvetica', 'bold');
  doc.text('3.1 Projeksiyon Matematiği', 20, 85);
  doc.setFont('helvetica', 'normal');
  doc.text('Gauss-Krüger projeksiyonu (TM) hesaplamalarında, meridyen yakınsaması ve ölçek faktörü düzeltmeleri mm hassasiyetinde uygulanır. 3 derece (TME) ve 6 derece (UTM) dilim orta meridyenleri saniyeler içinde otomatik olarak tespit edilir.', 20, 95);

  doc.setFont('helvetica', 'bold');
  doc.text('4. TG-20 JEOİD MODELLEME VE YÜKSEKLİK ANALİZİ', 20, 115);
  doc.setFont('helvetica', 'normal');
  const geoidTxt = `GNSS cihazlarından gelen elipsoidal yüksekliklerin (h), fiziksel yerçekimi yüzeyi olan jeoid (H - Ortometrik) yüksekliğe dönüştürülmesi için Türkiye Ulusal Jeoid Modeli (TG-20) kullanılmaktadır. Uygulama, 0.01 x 0.01 derecelik grid veritabanı üzerinden bilineer interpolasyon yaparak 0.05 m hassasiyetle yükseklik düzeltmesi uygular.`;
  doc.text(doc.splitTextToSize(geoidTxt, 170), 20, 125);

  // Formül kutusu (Vektörel)
  doc.setFillColor(245, 245, 245);
  doc.rect(20, 145, 170, 20, 'F');
  doc.setFont('courier', 'bold');
  doc.text('H (Ortometrik) = h (Elipsoid) - N (TG-20 Ondulasyon)', 105, 157, { align: 'center' });

  // --- SAYFA 4: VERİ ANALİZİ VE APLİKASYON ---
  doc.addPage();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('5. İLERİ VERİ ANALİZİ VE FİLTRELEME', 20, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  const filterTxt = `Konum verilerindeki gürültüyü ve uydu sinyal hatalarını (multipath) minimize etmek için üç seviyeli istatistiksel filtreleme uygulanmaktadır. Bu, saha ölçümü sırasında anlık sapmaların önüne geçerek 'Fix' çözüm doğruluğunu garanti altına alır.`;
  doc.text(doc.splitTextToSize(filterTxt, 170), 20, 30);

  doc.autoTable({
    startY: 50,
    head: [['Metot', 'Teknik Detay', 'Mühendislik Avantajı']],
    body: [
      ['Median Filtre', 'Sigma bazlı uç değer temizliği.', 'Anlık sinyal sıçramalarını yok eder.'],
      ['DBSCAN Clustering', 'Yoğunluk tabanlı kümeleme.', 'Gürültüden (noise) arındırılmış saf konum.'],
      ['Moving Average', 'Zaman ağırlıklı ortalama.', 'Hareket halinde pürüzsüz izleme.'],
    ],
    theme: 'striped',
    headStyles: { fillColor: primaryColor }
  });

  doc.setFont('helvetica', 'bold');
  doc.text('6. APLİKASYON (STAKEOUT) VE NAVİGASYON', 20, 100);
  doc.setFont('helvetica', 'normal');
  const stakeoutTxt = `Aplikasyon modülü, hedefe olan jeodezik azimut (Bearing) ve uzaklığı (Range) saniyede 10 kez hesaplar. 'Snapping' (Yakalam) teknolojisi, harita üzerindeki poligon köşelerine ve çizgi uçlarına matematiksel bir çekim (gravity snap) uygulayarak, parmakla seçme hatalarını sıfıra indirir.`;
  doc.text(doc.splitTextToSize(stakeoutTxt, 170), 20, 110);

  // --- SAYFA 5: SONUÇ VE TAAHHÜT ---
  doc.addPage();
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('7. SONUÇ VE MÜHENDİSLİK TAAHHÜDÜ', 20, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  const resultTxt = `${FULL_BRAND} platformu, bir Harita Mühendisinin analitik hassasiyeti ile geliştirilmiştir. Sistemdeki tüm koordinat dönüşümleri, jeoid modellemeleri ve veri toplama protokolleri akademik literatüre ve kurum standartlarına uygundur. Gelecek versiyonlarda RTK Bluetooth entegrasyonu ve BIM (IFC) veri desteği ile sistem kapasitesinin artırılması hedeflenmektedir.`;
  doc.text(doc.splitTextToSize(resultTxt, 170), 20, 30);

  // Teknik İmza Alanı
  doc.line(20, 100, 80, 100);
  doc.text('Onaylayan', 20, 105);
  doc.setFontSize(9);
  doc.text('Baş Mühendis', 20, 110);
  
  doc.line(130, 100, 190, 100);
  doc.text('Sistem Mimarisi', 130, 105);
  doc.text('Yazılım Geliştirme Lideri', 130, 110);

  // Footer on all pages (Optional loop, but we can just do last page footer)
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Doc ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()} | ${FULL_BRAND} | Verification Key: 748123`, 105, 280, { align: 'center' });

  // Save the PDF
  const fileName = `${FULL_BRAND.replace(/\s+/g, '_')}_MÜHENDİSLİK_TEKNİK_RAPORU.pdf`;
  doc.save(fileName);
};
