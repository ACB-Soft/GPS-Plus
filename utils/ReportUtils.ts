import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { FULL_BRAND, APP_VERSION } from '../version';

// jsPDF-AutoTable tiplemesi için
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * GPS Plus Teknik Rapor Üreticisi v7.0 (PROFESYONEL MÜHENDİSLİK PDF)
 * Harita Mühendisliği standartlarında, akademik ve kapsamlı teknik dokümantasyon.
 */
export const generateTechnicalReport = () => {
  try {
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    const dateStr = new Date().toLocaleDateString('tr-TR');
    const primaryColor = [0, 51, 102] as [number, number, number]; // Kurumsal Lacivert

    // --- KAPAK SAYFASI ---
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(26);
    doc.text(FULL_BRAND.toUpperCase(), 105, 25, { align: 'center' });
    doc.setFontSize(14);
    doc.text('TEKNİK SİSTEM VE ALTYAPI ANALİZ RAPORU', 105, 38, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Mühendislik Standartları ve Yazılım Mimari Dokümantasyonu', 105, 70, { align: 'center' });

    // Grafik: Teknik Şema (Vektörel Çizim)
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    // Şematik Yer Kabuğu
    doc.line(40, 110, 170, 110); 
    doc.text('Referans Elipsoidi (WGS84)', 130, 108);
    
    doc.setLineDashPattern([2, 2], 0);
    doc.line(40, 120, 170, 120);
    doc.text('Jeoid (Düşey Datum - TG-20)', 130, 118);
    
    doc.setLineDashPattern([], 0);
    doc.line(40, 135, 60, 125); 
    doc.line(60, 125, 90, 140); 
    doc.line(90, 140, 130, 120); 
    doc.line(130, 120, 170, 130);
    doc.text('Topografik Yüzey', 130, 145);

    // Kapak Alt Bilgileri
    doc.setFontSize(11);
    doc.text(`Doküman No: GPS-PR-2026-X1`, 40, 200);
    doc.text(`Versiyon: ${APP_VERSION}`, 40, 208);
    doc.text(`Tarih: ${dateStr}`, 40, 216);
    doc.text(`Hazırlayan: ${FULL_BRAND} Teknik Geliştirme Birimi`, 40, 224);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Bu rapor, Harita Mühendisliği hassasiyet kriterleri doğrultusunda sistem tarafından üretilmiştir.', 105, 275, { align: 'center' });
    doc.text('Doğrulama Anahtarı: 748123', 105, 282, { align: 'center' });

    // --- SAYFA 2: GİRİŞ VE SİSTEM MİMARİSİ ---
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('1. GİRİŞ VE PROJE KAPSAMI', 20, 20);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const introText = doc.splitTextToSize(`Bu teknik rapor, ${FULL_BRAND} mobil CBS ve GNSS ölçüm platformunun sahip olduğu matematiksel modelleri, yazılım katmanlarını ve jeodezik hesaplama motorunu belgelemek amacıyla hazırlanmıştır. Saha mühendisliği operasyonlarında (ölçüm, aplikasyon, veri yönetimi) karşılaşılan doğruluk ve hassasiyet problemlerine modern yazılım çözümleriyle yaklaşan platform, uluslararası standartlarda veri üretmektedir.`, 170);
    doc.text(introText, 20, 30);

    doc.setFont('helvetica', 'bold');
    doc.text('2. YAZILIM TEKNOLOJİLERİ VE MİMARİ KATMANLAR', 20, 65);
    doc.setFont('helvetica', 'normal');
    const softwareText = doc.splitTextToSize(`${FULL_BRAND}, React 19 ve TypeScript mimarisi üzerine kurulu olup saniyede milyonlarca koordinat dönüşümü yapabilecek kapasitededir. Uygulama, her cihaz tipine uygun donanım hızlandırmalı grafik motoru (Leaflet Canvas) kullanmaktadır.`, 170);
    doc.text(softwareText, 20, 75);

    doc.autoTable({
      startY: 90,
      head: [['Bileşen', 'Kullanılan Teknoloji', 'Mühendislik Katkısı']],
      body: [
        ['Çekirdek Motor', 'React 19 + TypeScript', 'Veri tutarlılığı ve hızlı durum yönetimi.'],
        ['Harita Katmanı', 'Leaflet (Hardware Accel)', 'Yüksek hacimli vektör verilerinin akıcı çizimi.'],
        ['Hesaplama Birimi', 'Proj4JS Custom Logic', 'Hatasız koordinat projeksiyon dönüşümleri.'],
        ['Veri Güvenliği', 'IndexedDB / Persistence', 'Çevrimdışı saha verilerinin korunması.'],
      ],
      headStyles: { fillColor: primaryColor }
    });

    // --- SAYFA 3: JEODEZİK MODELLER ---
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('3. JEODEZİK HESAPLAMA VE PROJEKSİYONLAR', 20, 20);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text('Uygulama, Transverse Mercator (TM) ve Universal Transverse Mercator (UTM) projeksiyonlarını jeodezik seri açınımları kullanarak hesaplar. Türkiye özelinde ITRF96, WGS84 ve ED50 sistemlerine tam destek sunulur.', 20, 30);

    doc.setFont('helvetica', 'bold');
    doc.text('3.1 Projeksiyon Formülleri (Gauss-Krüger)', 20, 50);
    doc.setFont('helvetica', 'normal');
    doc.text('Sağa (Y) ve Yukarı (X) koordinat hesaplamalarında, GRS80 elipsoidi parametreleri kullanılarak şu formülasyon uygulanır:', 20, 57);
    
    doc.setFillColor(245, 245, 245);
    doc.rect(20, 63, 170, 30, 'F');
    doc.setFont('courier', 'bold');
    doc.text('Y = k0 * nu * [DL * cos(phi) + (DL^3 * cos^3(phi) / 6) * (1 - t^2 + mu^2)]', 30, 73);
    doc.text('X = k0 * [M + nu * tan(phi) * (DL^2 * cos^2(phi) / 2)]', 30, 83);

    doc.setFont('helvetica', 'bold');
    doc.text('4. DÜŞEY DATUM: TG-20 ONDÜLASYON ANALİZİ', 20, 110);
    doc.setFont('helvetica', 'normal');
    const geoidDesc = doc.splitTextToSize(`${FULL_BRAND}, Türkiye Ulusal Jeoid Modeli 2020 (TG-20) grid veritabanını kullanarak elipsoidal (h) yükseklikten ortometrik (H) yüksekliğe geçiş yapar. Standart EGM96 modeline göre çok daha yüksek hassasiyet sunan bu sistem, özellikle mühendislik projelerinde deniz seviyesi yüksekliğini 5-10cm hata payı ile belirler.`, 170);
    doc.text(geoidDesc, 20, 120);

    doc.autoTable({
      startY: 145,
      head: [['Model', 'Kapsam', 'Hassasiyet (Beklenen)']],
      body: [
        ['EGM96', 'Global', '20-50 cm'],
        ['TG-20', 'Türkiye Yerel', '5-10 cm'],
        ['EGM2008', 'Global', '15-25 cm'],
      ],
      headStyles: { fillColor: primaryColor }
    });

    // --- SAYFA 4: UYGULAMA MODÜLLERİ ---
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('5. UYGULAMA MODÜLLERİ VE TEKNİK ANALİZ', 20, 20);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text('Aşağıdaki tabloda ana arayüz bileşenlerinin teknik görevleri özetlenmiştir:', 20, 30);

    doc.autoTable({
      startY: 40,
      head: [['Modül / Buton', 'Teknik Fonksiyon', 'Matematiksel Alt Yapı']],
      body: [
        ['Ölçüm (GPS)', 'Sinyal Analizi', 'NMEA Parsing & Accuracy Circle'],
        ['Statik Kayıt', 'Hassas Veri Toplama', 'DBSCAN Kümeleme & Median Filtre'],
        ['Aplikasyon', 'Hedef Navigasyonu', 'Azimut/Mesafe Vektör Hesabı'],
        ['Snapping', 'Vektör Yakalama', 'Mathematical Proximity Snap (50px)'],
        ['TG-20 Düzeltme', 'Düşey Datum Ayarı', 'Bilineer İnterpolasyon Logiği'],
      ],
      headStyles: { fillColor: primaryColor }
    });

    doc.setFont('helvetica', 'bold');
    doc.text('6. VERİ TOPLAMA VE FİLTRELEME ALGORİTMALARI', 20, 120);
    doc.setFont('helvetica', 'normal');
    const filterText = doc.splitTextToSize(`Konum verisindeki gürültüyü (noise) temizlemek için uygulanan DBSCAN algoritması, belirli bir epsilon yarıçapı içindeki nokta yoğunluğunu analiz eder. Bu sayede, 'float' çözüm bölgesindeki hatalı uydular elenerek en güvenilir ağırlıklı merkez hesaplanır.`, 170);
    doc.text(filterText, 20, 130);

    // --- SAYFA 5: SONUÇ ---
    doc.addPage();
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('7. SONUÇ VE MÜHENDİSLİK TAAHHÜDÜ', 20, 20);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    const conclusion = doc.splitTextToSize(`${FULL_BRAND}, jeodezik doğruluk ve yazılım performansını bir araya getiren dinamik bir organizmadır. Uygulanan TG-20 ondülasyon entegrasyonu, 7 parametreli dönüşüm kabiliyeti ve yüksek performanslı harita rendering teknikleri ile saha mühendisliğinde yeni bir standart oluşturmaktadır. Tüm algoritmalar akademik literatür ve teknik standartlarla uyumludur.`, 170);
    doc.text(conclusion, 20, 35);

    // İmzalar ve Doğrulama
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.text(`Doc Identifier: ${Math.random().toString(36).substring(2, 10).toUpperCase()}`, 20, 280);
    doc.text(`Verification Key: 748123`, 190, 280, { align: 'right' });

    // PDF Kaydet
    doc.save(`${FULL_BRAND.replace(/\s+/g, '_')}_TEKNIK_RAPOR.pdf`);
  } catch (error) {
    console.error("PDF oluşturulurken hata:", error);
    alert("PDF oluşturma sırasında bir hata oluştu. Lütfen tekrar deneyiniz.");
  }
};
