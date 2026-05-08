import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { FULL_BRAND, APP_VERSION } from '../version';

// Extend jsPDF types for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

/**
 * GPS Plus Teknik Rapor Üreticisi v8.0 (PROFESYONEL MÜHENDİSLİK PDF)
 * Harita Mühendisliği standartlarında, akademik ve kapsamlı teknik dokümantasyon.
 */
export const generateTechnicalReport = () => {
  try {
    // Show a small feedback to user
    console.log("Rapor oluşturma başlatıldı...");
    
    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    });

    const dateStr = new Date().toLocaleDateString('tr-TR');
    const primaryColor = [0, 51, 102] as [number, number, number]; // Kurumsal Lacivert
    const accentColor = [220, 38, 38] as [number, number, number]; // Red accent

    // --- KAPAK SAYFASI ---
    // Üst Bölüm
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 60, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text(FULL_BRAND.toUpperCase(), 105, 30, { align: 'center' });
    doc.setFontSize(16);
    doc.text('TEKNİK SİSTEM ANALİZ VE ALTYAPI RAPORU', 105, 45, { align: 'center' });

    // Orta Bölüm (Sembolik Grafik)
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Mühendislik Standartları, Jeodezik Modeller ve Yazılım Teknolojileri', 105, 75, { align: 'center' });

    // Grafik: Referans Yüzeyleri (Vektörel)
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    // Grid Lines for BG
    for(let i=0; i<5; i++) {
        doc.line(40, 100 + (i*10), 170, 100 + (i*10));
    }
    
    doc.setDrawColor(0, 51, 102);
    doc.setLineWidth(1);
    doc.line(40, 120, 170, 120); // Elipsoid
    doc.setFontSize(8);
    doc.text('ELIPSOID (WGS84)', 130, 118);
    
    doc.setLineDashPattern([2, 1], 0);
    doc.line(40, 130, 170, 130); // Jeoid
    doc.text('JEOID (TG-20)', 130, 128);
    
    doc.setLineDashPattern([], 0);
    doc.setDrawColor(220, 38, 38);
    doc.line(40, 145, 60, 135); 
    doc.line(60, 135, 90, 150); 
    doc.line(90, 150, 130, 130); 
    doc.line(130, 130, 170, 140); // Topo
    doc.text('TOPOGRAFYA', 130, 155);

    // Kapak Alt Bilgileri
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Doküman No: GPS-TR-2026-X8`, 40, 210);
    doc.text(`Versiyon: ${APP_VERSION}`, 40, 218);
    doc.text(`Oluşturma Tarihi: ${dateStr}`, 40, 226);
    doc.text(`Hazırlayan: ${FULL_BRAND} Ar-Ge ve Teknik Geliştirme Birimi`, 40, 234);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('Bu rapor Harita Mühendisliği standartlarına uygun olarak üretilmiş teknik bir dokümandır.', 105, 270, { align: 'center' });
    doc.text('Sistem Doğrulama Kodu: 748123-PDF-V8', 105, 276, { align: 'center' });

    // --- SAYFA 2: GİRİŞ VE SİSTEM MİMARİSİ ---
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('1. GİRİŞ VE KAPSAM', 20, 25);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const bodyText1 = `Bu rapor, ${FULL_BRAND} platformunun sahadaki jeodezik ölçüm süreçlerini nasıl yönettiğini, kullanılan matematiksel modellerin geçerliliğini ve yazılım mimarisinin stabilitesini belgelemek amacıyla hazırlanmıştır. Saha mühendisliği disiplini içerisinde, koordinat doğruluğu ve düşey datum hassasiyeti tartışmaya kapalı bir zorunluluktur. Bu doküman, sistemin bu zorunlulukları hangi algoritmalarla yerine getirdiğini teknik detaylarıyla sunar.`;
    doc.text(doc.splitTextToSize(bodyText1, 170), 20, 35);

    doc.setFont('helvetica', 'bold');
    doc.text('2. YAZILIM MİMARİSİ VE PERFORMANS', 20, 65);
    doc.setFont('helvetica', 'normal');
    const bodyText2 = `${FULL_BRAND}, React 19 ve TypeScript mimarisi üzerine kurulu olup saniyede milyonlarca koordinat dönüşümü yapabilecek kapasitededir. Leaflet JS donanım hızlandırmalı harita motoru, DXF ve KML gibi ağır vektörel dosyaları mobil GPU üzerinden akıcı bir şekilde render eder. Sistem, bellek yönetimi ve enerji verimliliği konularında sahadaki zorlu koşullara (yüksek sıcaklık, limitli batarya) uygun olarak optimize edilmiştir.`;
    doc.text(doc.splitTextToSize(bodyText2, 170), 20, 75);

    // Tablo 1: Yazılım Bileşenleri
    doc.autoTable({
      startY: 100,
      head: [['Bileşen', 'Teknoloji / Metot', 'Fonksiyonel Rol']],
      body: [
        ['Framework', 'React 19 + TypeScript', 'Component mimarisi ve tip güvenliği.'],
        ['Harita Motoru', 'Leaflet (Canvas Rendering)', 'Donanım hızlandırmalı görselleştirme.'],
        ['Projeksiyon', 'Proj4JS Custom Engine', 'Gerçek zamanlı koordinat dönüşümü.'],
        ['Depolama', 'IndexedDB / LocalPersistence', 'Çevrimdışı veri güvenliği.'],
        ['Arayüz', 'Tailwind CSS (JIT)', 'Yüksek performanslı, duyarlı tasarım.'],
      ],
      headStyles: { fillColor: primaryColor, fontSize: 10 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 20, right: 20 }
    });

    // --- SAYFA 3: JEODEZİK MODELLER VE PROJEKSİYON ---
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('3. JEODEZİK HESAPLAMA MOTORU', 20, 25);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Uygulama, Transverse Mercator (TM) ve Universal Transverse Mercator (UTM) projeksiyon sistemlerine tam destek sunar. Türkiye ölçeğinde ITRF96, WGS84 ve ED50 sistemleri arasındaki geçişler saniyeler içinde hesaplanır.', 20, 35);

    doc.setFont('helvetica', 'bold');
    doc.text('3.1 Projeksiyon Sistemleri Karşılaştırması', 20, 50);
    
    doc.autoTable({
      startY: 55,
      head: [['Datum', 'Elipsoid', 'Kullanım Alanı']],
      body: [
        ['WGS84', 'WGS84', 'Küresel GNSS Ölçümleri (Navigasyon)'],
        ['ITRF96', 'GRS80', 'Türkiye Kadastral ve Mühendislik Standartları'],
        ['ED50', 'Hayford', 'Eski Kadastral Projeler ve Miras Veriler'],
      ],
      headStyles: { fillColor: primaryColor, fontSize: 10 },
      margin: { left: 20, right: 20 }
    });

    doc.setFont('helvetica', 'bold');
    doc.text('4. TÜRKİYE ULUSAL JEOİD MODELİ (TG-20)', 20, 100);
    doc.setFont('helvetica', 'normal');
    const geoidText = `${FULL_BRAND}, Türkiye Ulusal Jeoid Modeli 2020 (TG-20) grid veritabanını kullanarak elipsoidal yükseklikten (h) ortometrik yüksekliğe (H) geçiş yapar. Bilineer interpolasyon yöntemiyle 0.05 m hassasiyetle yükseklik düzeltmesi uygulanır. Bu, standart küresel modellere (EGM96) göre çok daha yüksek bir düşey doğruluk sağlar.`;
    doc.text(doc.splitTextToSize(geoidText, 170), 20, 110);

    // Formül Kutusu
    doc.setFillColor(245, 245, 245);
    doc.rect(20, 130, 170, 15, 'F');
    doc.setFont('courier', 'bold');
    doc.text('H (Ortometrik) = h (Elipsoid) - N (TG-20 Ondulasyon)', 105, 140, { align: 'center' });

    // --- SAYFA 4: VERİ ANALİZİ VE MODÜLLER ---
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('5. VERİ ANALİZİ VE FİLTRELEME', 20, 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('Saha ölçümlerinde oluşan sinyal hatalarını (noise) en aza indirmek için uygulanan filtreleme metotları:', 20, 35);

    doc.autoTable({
      startY: 45,
      head: [['Metot', 'Teknik Detay', 'Mühendislik Avantajı']],
      body: [
        ['Iterative Averaging', 'Ardışık konumların zaman ağırlıklı ortalaması.', 'Sinyal dalgalanmalarını durultur.'],
        ['DBSCAN Clustering', 'Yoğunluk tabanlı koordinat kümeleme.', 'Gürültülü (uydudan kayan) verileri eler.'],
        ['Median Filtering', 'Sıralı istatistiksel uç değer temizliği.', 'Anlık sinyal sıçramalarını yok eder.'],
      ],
      headStyles: { fillColor: primaryColor, fontSize: 10 },
      margin: { left: 20, right: 20 }
    });

    doc.setFont('helvetica', 'bold');
    doc.text('6. UYGULAMA MODÜLLERİ ANALİZİ', 20, 100);
    doc.autoTable({
      startY: 105,
      head: [['Modül', 'Fonksiyonel İçerik', 'Hassasiyet Kriteri']],
      body: [
        ['Canlı Ölçüm', 'Anlık GNSS İzleme ve Kayıt', '2-5 Metre (Cihaz Bazlı)'],
        ['Statik Kayıt', 'Süre Bazlı Hassas Ortalama', '1.5-3 Metre (Analitik)'],
        ['Stakeout', 'Mesafe ve Azimut Rehberliği', '0.1 Derece Yön Doğruluğu'],
        ['Snapping', 'Vektörel Nesne Yakalama', 'Matematiksel Yakınlık Snapping'],
      ],
      headStyles: { fillColor: primaryColor, fontSize: 10 },
      margin: { left: 20, right: 20 }
    });

    // --- SAYFA 5: SONUÇ VE TAAHHÜT ---
    doc.addPage();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('7. SONUÇ VE GELECEK PERSPEKTİFİ', 20, 25);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    const conclusionText = `${FULL_BRAND}, bir Harita Mühendisinin titizliği ile tasarlanmış, akademik temelleri olan bir platformdur. Kullanılan tüm formülasyonlar (Helmert Dönüşümü, TM Projeksiyonu, TG-20 İnterpolasyonu) mühendislik standartlarına uygundur. Gelecek projeksiyonumuzda RTK (Real Time Kinematic) Bluetooth alıcı entegrasyonu ve BIM modelleri ile tam uyumluluk yer almaktadır.`;
    doc.text(doc.splitTextToSize(conclusionText, 170), 20, 35);

    // İmza Alanı
    doc.line(20, 100, 80, 100);
    doc.setFontSize(9);
    doc.text('Teknik Onay', 20, 105);
    doc.text('GPS Plus Sistem Mimarisi', 20, 110);
    
    doc.line(130, 100, 190, 100);
    doc.text('Kalite Kontrol', 130, 105);
    doc.text('Ar-Ge Yazılım Departmanı', 130, 110);

    // Alt Bilgi (Tüm sayfalarda olmasa da burada gösterelim)
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(8);
    doc.text(`Doc ID: PDF-V8-${Math.random().toString(36).substr(2, 5).toUpperCase()} | ${FULL_BRAND} Projesi`, 105, 280, { align: 'center' });

    // PDF Kaydet
    const safeName = FULL_BRAND.replace(/[^a-z0-9]/gi, '_').toUpperCase();
    doc.save(`${safeName}_MÜHENDİSLİK_TEKNİK_RAPORU.pdf`);
    
    console.log("PDF başarıyla oluşturuldu.");
  } catch (error) {
    console.error("PDF Oluşturma Hatası (Detay):", error);
    alert("PDF oluşturma sırasında bir hata oluştu.\nLütfen tarayıcınızın pop-up engelleyicisini kontrol edin veya tekrar deneyin.");
  }
};
