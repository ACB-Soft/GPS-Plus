import React from 'react';
import GlobalFooter from './GlobalFooter';
import { APP_VERSION } from '../version';

interface Props {
  onBack: () => void;
}

const HelpView: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="flex-1 flex flex-col animate-in h-full overflow-hidden bg-[#F8FAFC]">
      <header className="px-8 pt-10 pb-6 flex items-center gap-5 shrink-0 bg-white shadow-sm">
        <button 
          onClick={onBack} 
          className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-slate-100 text-slate-800 active:scale-90 transition-all"
        >
          <i className="fas fa-chevron-left text-sm"></i>
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Yardım & Hakkında</h2>
        </div>
      </header>

      <div className="flex-1 px-8 overflow-y-auto no-scrollbar py-8 space-y-10">
        {/* Kullanım Kılavuzu */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <i className="fas fa-book"></i>
            </div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Nasıl Kullanılır?</h3>
          </div>
          
          <div className="space-y-4">
            {/* Yeni Ölçüm Yap */}
            <div className="soft-card p-5 space-y-3">
              <h4 className="font-black text-slate-900 text-base uppercase flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">1</span>
                Yeni Ölçüm Yap
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed font-medium text-justify">
                Saha çalışmasına başlamak için ana ekrandaki <b>"Yeni Ölçüm Yap"</b> butonuna tıklayın. 
                <br/><br/>
                • <b>Proje Bilgisi:</b> "Yeni Proje Oluştur" ile yeni bir isim verebilir veya "Mevcut Proje Seç" ile önceki çalışmalarınıza devam edebilirsiniz.
                <br/>
                • <b>Koordinat Sistemi:</b> WGS84 (Coğrafi), ITRF96 (3 derece) veya ED50 (3/6 derece) sistemlerinden birini seçin. Proje bir kez oluşturulduğunda sistem değiştirilemez.
                <br/>
                • <b>Ölçüm Süreci:</b> "Ölçümü Başlat" dediğinizde 5 saniyelik bir geri sayım başlar. Uygulama bu sürede saniyede bir konum örneği alarak bunların ortalamasını hesaplar. En doğru sonuç için cihazı nivo/jalon üzerinde veya sabit bir zeminde tutun.
              </p>
            </div>

            {/* Aplikasyon Yap */}
            <div className="soft-card p-5 space-y-3">
              <h4 className="font-black text-slate-900 text-base uppercase flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">2</span>
                Aplikasyon Yap
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed font-medium text-justify">
                Kayıtlı noktaları arazide fiziksel olarak bulmak için <b>"Aplikasyon Yap"</b> modülünü kullanın.
                <br/><br/>
                • <b>Nokta Seçimi:</b> Proje listenizden hedeflediğiniz noktayı seçin.
                <br/>
                • <b>Canlı Rehberlik:</b> Ekranın ortasındaki pusula benzeri gösterge size gitmeniz gereken yönü gösterir. 
                <br/>
                • <b>Mesafe Takibi:</b> Hedefe olan kuş uçuşu mesafeniz (metre cinsinden) anlık olarak güncellenir.
                <br/>
                • <b>Yaklaşma Modu:</b> Hedefe 2 metreden fazla yaklaştığınızda gösterge daha hassas bir "yakın çekim" moduna geçer. Tam noktaya ulaştığınızda görsel ve dokunsal bildirim alırsınız.
              </p>
            </div>

            {/* Kayıtlı Projeler */}
            <div className="soft-card p-5 space-y-3">
              <h4 className="font-black text-slate-900 text-base uppercase flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">3</span>
                Kayıtlı Projeler
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed font-medium text-justify">
                Tüm saha verilerinizi <b>"Kayıtlı Projeler"</b> menüsünden yönetebilirsiniz.
                <br/><br/>
                • <b>Görüntüleme:</b> Noktalarınızı proje klasörleri altında gruplanmış şekilde görün.
                <br/>
                • <b>Detaylar:</b> Bir noktaya tıkladığınızda koordinatlarını, yüksekliğini, hassasiyetini ve harita üzerindeki konumunu görebilirsiniz.
                <br/>
                • <b>Düzenleme:</b> Gereksiz noktaları veya tüm proje klasörlerini silebilirsiniz.
              </p>
            </div>

            {/* Veri Aktar */}
            <div className="soft-card p-5 space-y-3">
              <h4 className="font-black text-slate-900 text-base uppercase flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">4</span>
                Veri Aktar
              </h4>
              <p className="text-slate-600 text-sm leading-relaxed font-medium text-justify">
                Saha verilerinizi ofis yazılımlarına aktarmak için <b>"Veri Aktar"</b> menüsünü kullanın.
                <br/><br/>
                • <b>Excel (.xlsx):</b> Nokta adı, koordinatlar (X, Y, Z), hassasiyet ve tarih bilgilerini içeren detaylı tablo.
                <br/>
                • <b>Google Earth (.kml):</b> Noktalarınızı uydu görüntüsü üzerinde görmek için ideal format.
                <br/>
                • <b>Metin (.txt):</b> Ham veri formatında (Ad, Y, X, Z) hızlı paylaşım.
                <br/>
                • <b>Paylaşım:</b> Oluşturulan dosyaları WhatsApp, E-posta veya Bulut sürücülere doğrudan gönderebilirsiniz.
              </p>
            </div>
          </div>
        </section>

        {/* Hassasiyet İpuçları */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
              <i className="fas fa-signal"></i>
            </div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Hassasiyet İpuçları</h3>
          </div>
          
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 space-y-4">
            <div className="flex gap-4">
              <i className="fas fa-cloud-sun text-amber-600 mt-1 text-lg"></i>
              <p className="text-sm text-amber-900 font-medium leading-relaxed text-justify">
                <b>Açık Gökyüzü:</b> En iyi sonuçlar için binalardan, ağaçlardan ve metal yapılardan uzak, gökyüzünü doğrudan gören alanlarda ölçüm yapın.
              </p>
            </div>
            <div className="flex gap-4">
              <i className="fas fa-mobile-alt text-amber-600 mt-1 text-lg"></i>
              <p className="text-sm text-amber-900 font-medium leading-relaxed text-justify">
                <b>Bekleme Süresi:</b> Uygulamayı açtıktan sonra GPS sinyalinin "oturması" için 30-60 saniye beklemek hassasiyeti 1-2 metreye kadar düşürebilir.
              </p>
            </div>
            <div className="flex gap-4">
              <i className="fas fa-battery-three-quarters text-amber-600 mt-1 text-lg"></i>
              <p className="text-sm text-amber-900 font-medium leading-relaxed text-justify">
                <b>Güç Modu:</b> Cihazınızın "Düşük Güç Modu"nda olmaması gerekir, çünkü bu mod GPS güncelleme sıklığını azaltabilir.
              </p>
            </div>
          </div>
        </section>

        {/* Konum Teknolojisi */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-violet-200">
              <i className="fas fa-satellite-dish"></i>
            </div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Konum Teknolojisi</h3>
          </div>
          
          <div className="bg-violet-50 border border-violet-100 rounded-2xl p-6 space-y-4">
            <p className="text-sm text-violet-900 font-medium leading-relaxed text-justify mb-4">
              Uygulama, en yüksek hassasiyeti sağlamak için <b>Hibrit (Karma) Konumleme</b> teknolojisini kullanır. Bu teknoloji, aşağıdaki 4 kaynağı birleştirerek çalışır:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-violet-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <i className="fas fa-satellite text-violet-600"></i>
                  <h4 className="text-xs font-black text-slate-900 uppercase">1. GNSS (Uydu)</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  GPS, GLONASS, Galileo ve BeiDou uydularından gelen sinyaller. Açık alanda en hassas (±3-5m) konum verisini sağlar.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-violet-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <i className="fas fa-broadcast-tower text-violet-600"></i>
                  <h4 className="text-xs font-black text-slate-900 uppercase">2. Baz İstasyonları</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Uyduların görülemediği kapalı alanlarda veya tünellerde, telefonunuzun bağlı olduğu baz istasyonlarına göre yaklaşık konum belirler.
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-violet-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <i className="fas fa-wifi text-violet-600"></i>
                  <h4 className="text-xs font-black text-slate-900 uppercase">3. Wi-Fi Ağları</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Şehir içinde bina aralarında, çevredeki kablosuz ağların sinyal gücünü kullanarak konumu keskinleştirir (IPS).
                </p>
              </div>

              <div className="bg-white p-4 rounded-xl border border-violet-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <i className="fas fa-bolt text-violet-600"></i>
                  <h4 className="text-xs font-black text-slate-900 uppercase">4. A-GPS (İnternet)</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  İnternet üzerinden güncel uydu yörünge verilerini (Almanak) indirerek, GPS'in saniyeler içinde kilitlenmesini (Fix) sağlar.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Teknik Bilgiler */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <i className="fas fa-microchip"></i>
            </div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Teknik Altyapı</h3>
          </div>
          
          <div className="soft-card p-6 bg-slate-900 text-white border-none space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">ED50 Dönüşümü (Datum Shift)</h4>
                <p className="text-sm text-slate-300 leading-relaxed text-justify">
                  WGS84 ile ED50 (European Datum 1950) arasındaki dönüşümler, Türkiye geneli için optimize edilmiş <b>7 Parametreli Helmert Dönüşümü</b> kullanılarak yapılmaktadır.
                  <br/>
                  <span className="opacity-70 text-xs block mt-1 font-mono">Parametreler: dX, dY, dZ, Rx, Ry, Rz, dS (HGM/EPSG Standartları)</span>
                </p>
              </div>

              <div>
                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">ITRF96 Dönüşümü (Projeksiyon)</h4>
                <p className="text-sm text-slate-300 leading-relaxed text-justify">
                  ITRF96 (GRS80 Elipsoidi) koordinatları, <b>Transversal Mercator (TM)</b> projeksiyonu ile hesaplanmaktadır. 3° dilim genişliği ve dilim orta meridyenleri (DOM) otomatik belirlenir.
                </p>
              </div>

              <div>
                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-1">Düşey Datum (Yükseklik)</h4>
                <p className="text-sm text-slate-300 leading-relaxed text-justify">
                  Ortometrik yükseklik (H), GPS'ten alınan Elipsoid yüksekliğinden (h), <b>TG-20 (Türkiye Geoidi 2020)</b> Hibrit Jeoid Modeli ondülasyon değeri (N) çıkarılarak hesaplanır.
                  <br/>
                  <span className="opacity-70 text-xs block mt-1 font-mono">Formül: H = h - N (TG-20)</span>
                  <span className="opacity-70 text-xs block mt-1 font-mono">Çözünürlük: 5' x 5' (Yaklaşık 9km)</span>
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 mt-4">
              <div className="flex gap-3">
                <i className="fas fa-info-circle text-blue-400 mt-0.5 text-sm"></i>
                <p className="text-xs text-slate-400 leading-relaxed text-justify">
                  <b>Donanım Kısıtı:</b> Uygulama, santimetre hassasiyetindeki TG-20 modelini kullansa da, mobil cihazların dahili GPS alıcılarının düşey (yükseklik) hassasiyeti genellikle ±10-20 metre civarındadır. Bu nedenle görüntülenen yükseklik değeri, profesyonel GNSS alıcıları kadar hassas olmayabilir.
                </p>
              </div>
            </div>

            <ul className="pt-4 border-t border-white/10 space-y-3">
              <li className="flex items-center gap-3 text-sm">
                <i className="fas fa-check-circle text-emerald-400"></i>
                <span className="font-medium">3° ve 6° Dilim Desteği</span>
              </li>
              <li className="flex items-center gap-3 text-sm">
                <i className="fas fa-check-circle text-emerald-400"></i>
                <span className="font-medium">Otomatik DOM Hesabı</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Veri Güvenliği */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
              <i className="fas fa-shield-alt"></i>
            </div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Veri Güvenliği</h3>
          </div>
          <div className="soft-card p-5">
            <p className="text-slate-600 text-sm leading-relaxed font-medium text-justify">
              Verileriniz <b>tamamen cihazınızda</b> saklanır. Uygulama, konum verilerinizi hiçbir uzak sunucuya göndermez. İnternet bağlantısı sadece harita altlıklarını yüklemek için kullanılır. Uygulamayı sildiğinizde, cihazınızdaki veriler de silinecektir.
            </p>
          </div>
        </section>

        {/* Sorumluluk Reddi */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Sorumluluk Reddi</h3>
          </div>
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6">
            <p className="text-sm text-rose-900 font-medium leading-relaxed text-justify">
              Önemli Uyarı: Bu uygulama tarafından sağlanan verilerin doğruluğu ve hassasiyeti, doğrudan kullanıcının mobil cihazının donanımsal (GPS/GNSS) alıcı kapasitesine, uydu görünürlüğüne ve çevresel faktörlere bağlıdır. Uygulama, profesyonel jeodezik ekipmanların yerini tutmaz. Elde edilen verilerin kritik mühendislik projelerinde kullanılmadan önce profesyonel ekipmanlarla doğrulanması önerilir. Oluşabilecek hatalardan veya veri kayıplarından yazılım geliştiricisi sorumlu tutulamaz.
            </p>
          </div>
        </section>

        {/* Hakkında */}
        <section className="space-y-4 pb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <i className="fas fa-code"></i>
            </div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Geliştirici</h3>
          </div>
          <div className="soft-card p-6 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Yazılım & Tasarım</p>
              <p className="text-sm font-black text-slate-900">ACB_Soft Engineering</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sürüm</p>
              <p className="text-sm font-black text-blue-600">{APP_VERSION}</p>
            </div>
          </div>
        </section>
      </div>
      
      <GlobalFooter />
    </div>
  );
};

export default HelpView;
