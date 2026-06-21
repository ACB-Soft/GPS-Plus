import React, { useState } from 'react';
import GlobalFooter from './GlobalFooter';
import Header from './Header';
import { generateTechnicalReport } from '../utils/ReportUtils';
import { useLanguage } from '../utils/LanguageContext';

interface Props {
  onBack: () => void;
}

const HelpView: React.FC<Props> = ({ onBack }) => {
  const { t } = useLanguage();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleDownloadClick = () => {
    if (localStorage.getItem('acb_labs_authorized') === 'true') {
      generateTechnicalReport();
    } else {
      setPasswordInput('');
      setPasswordError('');
      setShowPasswordModal(true);
    }
  };

  const handlePasswordSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passwordInput === "748123") {
      localStorage.setItem('acb_labs_authorized', 'true');
      setShowPasswordModal(false);
      generateTechnicalReport();
    } else {
      setPasswordError(t("Hatalı şifre!"));
    }
  };

  return (
    <div className="flex-1 flex flex-col animate-in h-full overflow-hidden bg-slate-200">
      <Header title={t("Yardım & Hakkında")} onBack={onBack} sticky={true} />

      <div className="flex-1 px-8 overflow-y-auto no-scrollbar py-4">
        <div className="max-w-sm mx-auto w-full space-y-10">
          {/* Nasıl Kullanılır? */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <i className="fas fa-book"></i>
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t("Nasıl Kullanılır?")}</h3>
            </div>
            
            <div className="space-y-4">
              {/* Ölçüm Yap */}
              <div className="soft-card p-4 space-y-3">
                <h4 className="font-black text-slate-900 text-base uppercase flex items-center gap-2">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs">1</span>
                  {t("Ölçüm Yap")}
                </h4>
                <p 
                  className="text-slate-700 text-sm leading-relaxed font-medium text-justify"
                  dangerouslySetInnerHTML={{ __html: t("Saha çalışmasına başlamak için ana ekrandaki <b>\"Ölçüm Yap\"</b> butonuna tıklayın.") }}
                />
                <p 
                  className="text-slate-700 text-sm leading-relaxed font-medium text-justify"
                  dangerouslySetInnerHTML={{ __html: t("• <b>Proje Bilgisi:</b> \"Yeni Proje Oluştur\" ile yeni bir isim verebilir veya \"Mevcut Proje Seç\" ile önceki çalışmalarınıza devam edebilirsiniz.") }}
                />
                <p 
                  className="text-slate-700 text-sm leading-relaxed font-medium text-justify"
                  dangerouslySetInnerHTML={{ __html: t("• <b>Koordinat Sistemi:</b> WGS84 (Enlem-Boylam), ITRF96 (3° - TM / 6° - UTM) veya ED50 (3° - TM / 6° - UTM) sistemlerinden birini seçin. Proje bir kez oluşturulduğunda sistem değiştirilemez.") }}
                />
                <p 
                  className="text-slate-700 text-sm leading-relaxed font-medium text-justify"
                  dangerouslySetInnerHTML={{ __html: t("• <b>Ölçüm Süreci:</b> \"Ölçümü Başlat\" dediğinizde belirlediğiniz hassasiyette (2-100 m) ve belirlediğiniz sürede (5-90 sn) veri toplama süreci başlatılır. Uygulama bu aşamada konum örneği alarak verilerin ortalamasını hesaplar. En doğru sonuç için cihazı sabit bir zeminde ve açık bir alanda tutun.") }}
                />
              </div>

              {/* Aplikasyon Yap */}
              <div className="soft-card p-4 space-y-3">
                <h4 className="font-black text-slate-900 text-base uppercase flex items-center gap-2">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs">2</span>
                  {t("Aplikasyon Yap")}
                </h4>
                <p 
                  className="text-slate-700 text-sm leading-relaxed font-medium text-justify"
                  dangerouslySetInnerHTML={{ __html: t("Kayıtlı noktaları arazide fiziksel olarak bulmak için <b>\"Aplikasyon Yap\"</b> modülünü kullanın.") }}
                />
                <p 
                  className="text-slate-700 text-sm leading-relaxed font-medium text-justify"
                  dangerouslySetInnerHTML={{ __html: t("• <b>Nokta Seçimi:</b> Proje listenizden hedeflediğiniz noktayı seçin.") }}
                />
                <p 
                  className="text-slate-700 text-sm leading-relaxed font-medium text-justify"
                  dangerouslySetInnerHTML={{ __html: t("• <b>Canlı Rehberlik:</b> Ekranın ortasındaki pusula benzeri gösterge size gitmeniz gereken yönü gösterir.") }}
                />
                <p 
                  className="text-slate-700 text-sm leading-relaxed font-medium text-justify"
                  dangerouslySetInnerHTML={{ __html: t("• <b>Mesafe Takibi:</b> Hedefe olan kuş uçuşu mesafeniz (metre cinsinden) anlık olarak güncellenir. Uygulamanın metre hassasiyetinde çalıştığını unutmayın.") }}
                />
                <p 
                  className="text-slate-700 text-sm leading-relaxed font-medium text-justify"
                  dangerouslySetInnerHTML={{ __html: t("• <b>Yaklaşma Modu:</b> Hedefe 5 metreden fazla yaklaştığınızda gösterge daha hassas bir \"yakın çekim\" moduna geçer. Mobil cihazların GPS kısıtları nedeniyle 2 metre ve altına ulaştığınızda \"Hedefe Ulaşıldı\" sinyali ve görsel bildirim alırsınız.") }}
                />
              </div>

              {/* Kayıtlı Ölçümler */}
              <div className="soft-card p-4 space-y-3">
                <h4 className="font-black text-slate-900 text-base uppercase flex items-center gap-2">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs">3</span>
                  {t("Kayıtlı Ölçümler")}
                </h4>
                <p 
                  className="text-slate-700 text-sm leading-relaxed font-medium text-justify"
                  dangerouslySetInnerHTML={{ __html: t("Tüm saha verilerinizi <b>\"Kayıtlı Ölçümler\"</b> menüsünden yönetebilirsiniz.") }}
                />
                <p 
                  className="text-slate-700 text-sm leading-relaxed font-medium text-justify"
                  dangerouslySetInnerHTML={{ __html: t("• <b>Görüntüleme:</b> Noktalarınızı proje klasörleri altında gruplanmış şekilde görün.") }}
                />
                <p 
                  className="text-slate-700 text-sm leading-relaxed font-medium text-justify"
                  dangerouslySetInnerHTML={{ __html: t("• <b>Detaylar:</b> Bir noktaya tıkladığınızda koordinatlarını, yüksekliğini, hassasiyetini ve harita üzerindeki konumunu görebilirsiniz.") }}
                />
                <p 
                  className="text-slate-700 text-sm leading-relaxed font-medium text-justify"
                  dangerouslySetInnerHTML={{ __html: t("• <b>Düzenleme:</b> Gereksiz noktaları veya tüm proje klasörlerini silebilirsiniz.Projelere yeniden isim verebilirsiniz.") }}
                />
              </div>

              {/* Veri Aktar */}
              <div className="soft-card p-4 space-y-3">
                <h4 className="font-black text-slate-900 text-base uppercase flex items-center gap-2">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs">4</span>
                  {t("Veri Aktar")}
                </h4>
                <p 
                  className="text-slate-700 text-sm leading-relaxed font-medium text-justify"
                  dangerouslySetInnerHTML={{ __html: t("Saha verilerinizi ofis yazılımlarına aktarmak için <b>\"Veri Aktar\"</b> menüsünü kullanın.") }}
                />
                <p 
                  className="text-slate-700 text-sm leading-relaxed font-medium text-justify"
                  dangerouslySetInnerHTML={{ __html: t("• <b>Google Earth (.kml):</b> Noktalarınızı uydu görüntüsü üzerinde görmek için ideal format.") }}
                />
                <p 
                  className="text-slate-700 text-sm leading-relaxed font-medium text-justify"
                  dangerouslySetInnerHTML={{ __html: t("• <b>Excel (.xlsx):</b> Nokta adı, koordinatlar (Y, X, Z), hassasiyet ve tarih bilgilerini içeren detaylı tablo.") }}
                />
                <p 
                  className="text-slate-700 text-sm leading-relaxed font-medium text-justify"
                  dangerouslySetInnerHTML={{ __html: t("• <b>Metin (.txt):</b> Ham veri formatında (Ad, Y, X, Z) hızlı paylaşım.") }}
                />
                <p 
                  className="text-slate-700 text-sm leading-relaxed font-medium text-justify"
                  dangerouslySetInnerHTML={{ __html: t("• <b>Paylaşım:</b> Oluşturulan dosyaları mobil cihazlarınız ile WhatsApp, E-posta veya Bulut sürücülere doğrudan gönderebilirsiniz.") }}
                />
              </div>
            </div>
          </section>

          {/* Hassasiyet İpuçları */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
                <i className="fas fa-lightbulb"></i>
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t("Hassasiyet İpuçları")}</h3>
            </div>
            
            <div className="soft-card p-6 space-y-4">
              <div className="flex gap-4">
                <i className="fas fa-cloud-sun text-amber-600 mt-1 text-lg"></i>
                <p 
                  className="text-sm text-slate-700 font-medium leading-relaxed text-justify"
                  dangerouslySetInnerHTML={{ __html: t("<b>Açık Gökyüzü:</b> En iyi sonuçlar için binalardan, ağaçlardan ve metal yapılardan uzak, gökyüzünü doğrudan gören alanlarda ölçüm yapın.") }}
                />
              </div>
              <div className="flex gap-4">
                <i className="fas fa-mobile-alt text-amber-600 mt-1 text-lg"></i>
                <p 
                  className="text-sm text-slate-700 font-medium leading-relaxed text-justify"
                  dangerouslySetInnerHTML={{ __html: t("<b>Bekleme Süresi:</b> Uygulamayı açtıktan sonra GPS sinyalinin \"oturması\" için yaklaşık 30 saniye beklemek hassasiyeti 2-5 metreye kadar düşürebilir.") }}
                />
              </div>
              <div className="flex gap-4">
                <i className="fas fa-battery-three-quarters text-amber-600 mt-1 text-lg"></i>
                <p 
                  className="text-sm text-slate-700 font-medium leading-relaxed text-justify"
                  dangerouslySetInnerHTML={{ __html: t("<b>Güç Modu:</b> Cihazınızın \"Düşük Güç Modu\"nda olmaması gerekir, çünkü bu mod GPS güncelleme sıklığını azaltabilir.") }}
                />
              </div>
            </div>
          </section>

          {/* Hassasiyet Hesabı */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t("Hassasiyet Hesabı")}</h3>
            </div>
            
            <div className="soft-card p-6 space-y-6">
              <div className="space-y-3">
                <p className="text-sm text-slate-700 font-medium leading-relaxed">
                  {t("Uygulama, ekranda gördüğünüz nihai <b>Hassasiyet</b> değerini şu formülle belirler:")}
                </p>
                <div className="text-center py-1">
                  <code className="text-sm font-black text-blue-900 tracking-wider">
                    {t("= Max(Veri Saçılımı, Donanımsal Hassasiyet)")}
                  </code>
                </div>
                <p className="text-sm text-slate-600 font-medium leading-tight italic">
                  {t("* Örneğin; sensör 2m hata payı diyorsa ancak ham veriler 6m'ye yayılıyorsa, gerçek hata payınız 6m olarak kabul edilir.")}
                </p>
              </div>
                
              <div className="space-y-3 border-t border-slate-100 pt-4">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">{t("Sinyal Güvenilirlik Analizi")}</h4>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">
                  {t("Uygulama, ölçüm sırasında sadece sensörden gelen hata payına bakmaz; aynı zamanda toplanan koordinatların birbirine olan mesafesini (Veri Saçılımı) analiz ederek <b>Multipath (Sinyal Yansıması)</b> riskini değerlendirir:")}
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full mt-1.5 shrink-0 shadow-sm shadow-emerald-200"></div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-emerald-700 uppercase tracking-tight">{t("Güvenilir Veri (Yeşil)")}</p>
                      <p 
                        className="text-sm text-slate-600 font-medium leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: t("Veriler yüksek tutarlılıktadır.<br/>Donanımsal Hassasiyet &le; 5m,<br/>Veri Saçılımı &le; 5m,<br/>Veri Saçılımı &le; Donanımsal Hassasiyet,<br/>Veri Sayısı &ge; 15") }}
                      />
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 bg-amber-500 rounded-full mt-1.5 shrink-0 shadow-sm shadow-amber-200"></div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-amber-700 uppercase tracking-tight">{t("Orta Güvenli Veri / Veri Az (Turuncu)")}</p>
                      <p 
                        className="text-sm text-slate-600 font-medium leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: t("Veriler orta tutarlılıktadır.<br/>5m &lt; Donanımsal Hassasiyet &le; 20m,<br/>5m &lt; Veri Saçılımı &le; 20m,<br/>Veri Saçılımı &gt; Donanımsal Hassasiyet,<br/>Veri Sayısı &lt; 15") }}
                      />
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2.5 h-2.5 bg-rose-500 rounded-full mt-1.5 shrink-0 shadow-sm shadow-rose-200"></div>
                    <div className="flex-1">
                      <p className="text-sm font-black text-rose-700 uppercase tracking-tight">{t("Güvensiz Veri (Kırmızı)")}</p>
                      <p 
                        className="text-sm text-slate-600 font-medium leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: t("Veriler yüksek oranda sapmalı ve güvensizdir.<br/>Donanımsal Hassasiyet &gt; 20m,<br/>Veri Saçılımı &gt; 20m,<br/>Veri Saçılımı &gt; Donanımsal Hassasiyet x 3") }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Çoklu Oturum */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-200 animate-pulse">
                <i className="fas fa-hourglass-half"></i>
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t("Çoklu Oturum")}</h3>
            </div>
            
            <div className="soft-card p-6 space-y-4">
              <p 
                className="text-sm text-slate-700 font-medium leading-relaxed text-justify"
                dangerouslySetInnerHTML={{ __html: t("Uzun süreli ölçümlerde (30, 60 ve 90 sn) birikimli GPS kaymalarını sıfırlamak ve en kaliteli uydu verisini yakalamak için geliştirilen akıllı ölçüm modudur:") }}
              />
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <i className="fas fa-sync-alt"></i>
                  </div>
                  <p 
                    className="text-sm text-slate-700 font-medium leading-relaxed text-justify flex-1"
                    dangerouslySetInnerHTML={{ __html: t("<b>Donanım Sıfırlama:</b> Her 15 saniyelik ölçüm periyodunun ardından ölçüm (iOS için 30, Android için 15 saniye) otomatik olarak duraklatılır ve cihazın GPS alıcısı arka planda tamamen yeniden başlatılır.") }}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <i className="fas fa-satellite"></i>
                  </div>
                  <p 
                    className="text-sm text-slate-700 font-medium leading-relaxed text-justify flex-1"
                    dangerouslySetInnerHTML={{ __html: t("<b>Yeniden Kilitlenme:</b> Verilen bu arada cihazın uydulara daha temiz açılardan yeniden kilitlenmesi sağlanır; böylece multipath (sinyal yansıması) etkisi en aza indirilir.") }}
                  />
                </div>
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                    <i className="fas fa-bullseye"></i>
                  </div>
                  <p 
                    className="text-sm text-slate-700 font-medium leading-relaxed text-justify flex-1"
                    dangerouslySetInnerHTML={{ __html: t("<b>Yüksek Doğruluk:</b> Farklı zaman dilimlerinde sıfırlanıp tekrar alınan temiz örneklerin birleştirilmesiyle, tekil ve uzun bir ölçüme kıyasla çok daha kararlı ve hassas koordinatlar elde edilir.") }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Konum Hesabı */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                <i className="fas fa-calculator"></i>
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t("Konum Hesabı")}</h3>
            </div>
            
            <div className="soft-card p-6 space-y-4">
              <p 
                className="text-sm text-slate-700 font-medium leading-relaxed text-justify"
                dangerouslySetInnerHTML={{ __html: t("Uygulama, toplanan ham GPS verilerini nihai bir koordinata dönüştürmek için 7 farklı gelişmiş akademik model sunar. Bu yöntemleri <b>Ayarlar</b> menüsünden değiştirebilirsiniz:") }}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-white p-3 px-4 rounded-xl border border-blue-100 shadow-sm ring-1 ring-blue-50 flex items-center justify-between">
                  <h4 className="text-sm font-black text-blue-700 uppercase tracking-tight">{t("1. Ağırlıklı En Küçük Kareler")}</h4>
                  <span className="text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded-full font-bold">{t("VARSAYILAN")}</span>
                </div>

                <div className="bg-white p-3 px-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{t("2. MAD + DBSCAN")}</h4>
                  <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-bold">{t("KÜMELEME")}</span>
                </div>

                <div className="bg-white p-3 px-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{t("3. Huber M-Kestiricisi")}</h4>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold">{t("ROBUST")}</span>
                </div>

                <div className="bg-white p-3 px-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{t("4. Hampel M-Kestiricisi")}</h4>
                  <span className="text-[10px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-bold">{t("ROBUST")}</span>
                </div>

                <div className="bg-white p-3 px-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{t("5. Hodges-Lehmann R-Kestiricisi")}</h4>
                  <span className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-bold">{t("ROBUST")}</span>
                </div>

                <div className="bg-white p-3 px-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{t("6. Tukey's Trimean L-Kestiricisi")}</h4>
                  <span className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-bold">{t("ROBUST")}</span>
                </div>

                <div className="bg-white p-3 px-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between md:col-span-2">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">{t("7. Optimal S-Kestiricisi")}</h4>
                  <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-bold">{t("ROBUST")}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Konum Teknolojisi */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-300">
                <i className="fas fa-satellite-dish"></i>
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t("Konum Teknolojisi")}</h3>
            </div>
            
            <div className="soft-card p-6 space-y-4">
              <p 
                className="text-sm text-slate-700 font-medium leading-relaxed text-justify mb-4"
                dangerouslySetInnerHTML={{ __html: t("Uygulama, en yüksek hassasiyeti sağlamak için <b>Hibrit (Karma) Konumlama</b> teknolojisini kullanır. Bu teknoloji, aşağıdaki 4 kaynağı birleştirerek çalışır:") }}
              />
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-satellite text-indigo-600"></i>
                    <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">{t("1. GNSS (Uydu)")}</h4>
                  </div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    {t("GPS, GLONASS, Galileo ve BeiDou uydularından gelen sinyalleri kullanır. Açık alanda hassas (±2m) konum verisi sağlar.")}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-broadcast-tower text-indigo-600"></i>
                    <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">{t("2. Baz İstasyonları")}</h4>
                  </div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    {t("Uyduların görülemediği kapalı alanlarda veya tünellerde, telefonunuzun bağlı olduğu baz istasyonlarına göre yaklaşık konum belirler. Hassiyeti düşüktür.")}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-wifi text-indigo-600"></i>
                    <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">{t("3. Wi-Fi Ağları")}</h4>
                  </div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    {t("Şehir içinde bina aralarında, çevredeki kablosuz ağların sinyal gücünü kullanarak konumu keskinleştirir (IPS). Hassiyeti oldukça düşüktür.")}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <i className="fas fa-bolt text-indigo-600"></i>
                    <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">{t("4. A-GPS (İnternet)")}</h4>
                  </div>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    {t("İnternet üzerinden güncel uydu yörünge verilerini (almanak) indirerek, GPS'in saniyeler içinde kilitlenmesini (Fix) sağlar. Hassiyeti oldukça düşüktür.")}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Koordinat Dönüşüm Altyapısı */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-400">
                <i className="fas fa-microchip"></i>
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t("Koordinat Dönüşümü")}</h3>
            </div>
            
            <div className="bg-slate-100 border border-slate-200 rounded-2xl p-6 space-y-6 shadow-inner">
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-black text-indigo-700 uppercase tracking-tight mb-1">{t("ED50 Dönüşümü")}</h4>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed text-justify">
                    {t("WGS84 ile ED50 (European Datum 1950) arasındaki dönüşümler, Türkiye geneli için optimize edilmiş 7 Parametreli (dX, dY, dZ, Rx, Ry, Rz, dS \"HGM/EPSG Standartları\") Helmert Dönüşümü kullanılarak yapılmaktadır.")}
                  </p>
                </div>

                <div>
                  <h4 className="text-base font-black text-indigo-700 uppercase tracking-tight mb-1">{t("ITRF96 Dönüşümü")}</h4>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed text-justify">
                    {t("ITRF96 (GRS80 Elipsoidi) koordinatları, Transversal Mercator (TM) projeksiyonu ile hesaplanmaktadır. 3° dilim genişliği ve dilim orta meridyenleri (DOM) otomatik belirlenir.")}
                  </p>
                </div>

                <div>
                  <h4 className="text-base font-black text-indigo-700 uppercase tracking-tight mb-1">{t("Düşey Datum (Yükseklik)")}</h4>
                  <p className="text-sm text-slate-700 font-medium leading-relaxed text-justify">
                    {t("Ortometrik yükseklik (H), GPS'ten alınan Elipsoid yüksekliğinden (h), TG-20 Jeoid Modeli ondülasyon değeri (N) çıkarılarak hesaplanır.")}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Veri Güvenliği */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t("Veri Güvenliği")}</h3>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
              <p className="text-emerald-900 text-sm leading-relaxed font-medium text-justify">
                {t("Verileriniz tamamen cihazınızda saklanır. Uygulama, konum verilerinizi hiçbir uzak sunucuya göndermez. Mobil cihazınızdan uygulamayı sildiğinizde veya tarayıcı önbelliğini temizlediğinizde cihazınızdaki veriler de silinecektir. Ölçüm sonrası verilerinizi yedeklemeyi unutmayın.")}
              </p>
            </div>
          </section>

          {/* Sorumluluk Reddi */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t("Sorumluluk Reddi")}</h3>
            </div>
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6">
              <p className="text-sm text-rose-900 font-medium leading-relaxed text-justify">
                {t("Uygulama tarafından sağlanan verilerin doğruluğu ve hassasiyeti, mobil cihazınızın donanımsal (GPS/GNSS) alıcı kapasitesine, uydu görünürlüğüne ve çevresel faktörlere bağlıdır. Uygulama, profesyonel jeodezik ekipmanların yerini tutmaz. Elde edilen verilerin kritik mühendislik projelerinde kullanılmadan önce profesyonel ekipmanlarla doğrulanması önerilir. Oluşabilecek hatalardan veya veri kayıplarından yazılım geliştiricisi sorumlu tutulamaz.")}
              </p>
            </div>
          </section>

          {/* Veri Kaynakları */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                <i className="fas fa-copyright"></i>
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t("Veri Kaynakları")}</h3>
            </div>
            <div className="soft-card p-6 space-y-4">
              <p className="text-sm text-slate-600 font-medium leading-relaxed text-justify">
                {t("Uygulamada kullanılan tüm veriler açık kaynaklı veya lisanslı servislerden sağlanmaktadır. Telif ihlali barındıran herhangi bir içerik bulunmamaktadır.")}
              </p>
              <div className="space-y-3">
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{t("Konum Verisi")}</span>
                  <span className="text-sm font-bold text-slate-900">{t("Geolocation API (WGS84 Format)")}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{t("Koordinat Dönüşümleri")}</span>
                  <span className="text-sm font-bold text-slate-900">{t("Custom Helmert & TM Projection Formulas (HGM/EPSG Standards)")}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{t("Jeoid Modeli")}</span>
                  <span className="text-sm font-bold text-slate-900">{t("TG-20 (Çözünürlük: 5'x5')")}</span>
                  <span className="text-sm font-bold text-slate-900">{t("EGM96 (Çözünürlük: 5'x5')")}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{t("Harita Servisleri")}</span>
                  <span className="text-sm font-bold text-slate-900">{t("Leaflet & React Leaflet (Interactive Spatial Map Engine)")}</span>
                  <span className="text-sm font-bold text-slate-900">{t("Google Maps API (Satellite/Hybrid)")}</span>
                  <span className="text-sm font-bold text-slate-900">{t("OpenStreetMap Contributors")}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{t("Yazılım Kütüphaneleri")}</span>
                  <span className="text-sm font-bold text-slate-900">{t("React & React DOM (Modern UI Engine)")}</span>
                  <span className="text-sm font-bold text-slate-900">{t("Recharts (Statistical Plotting & Chart Services)")}</span>
                  <span className="text-sm font-bold text-slate-900">{t("html-to-image & FileSaver (Dynamic Snapshot Export Services)")}</span>
                  <span className="text-sm font-bold text-slate-900">{t("Proj4js (Coordinate Transformations)")}</span>
                  <span className="text-sm font-bold text-slate-900">{t("SheetJS & JSZip (Data Export Services)")}</span>
                  <span className="text-sm font-bold text-slate-900">{t("Lucide React & Font Awesome (Icons)")}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Hakkında */}
          <section className="space-y-4 pb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-400">
                <i className="fas fa-info-circle"></i>
              </div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{t("Hakkında")}</h3>
            </div>
            <div className="soft-card p-6 space-y-4">
              <p className="text-sm text-slate-700 font-medium leading-relaxed text-justify">
                {t("Bu uygulama, saha çalışmalarında hızlı ve pratik koordinat ölçümü, aplikasyon ve veri yönetimi sağlamak ve basit CBS verisi toplamak amacıyla geliştirilmiştir. Uygulama ile ilgili herhangi bir sorun yaşıyorsanız veya bir özellik isteğiniz varsa e-posta yoluyla iletişime geçebilirsiniz.")}
              </p>
              <div className="flex flex-col">
                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{t("İletişim")}</span>
                <span className="text-sm font-medium text-slate-900"><span className="font-black">acb</span>maps@gmail.com</span>
              </div>
              <div className="pt-2">
                <button 
                  onClick={handleDownloadClick}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer text-center"
                >
                  <i className="fas fa-file-word text-[11px]"></i>
                  {t("Akademik Teknik Rapor")}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
      
      <GlobalFooter />

      {/* ACB Labs Password Modal Prompt */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <form 
            onSubmit={handlePasswordSubmit}
            className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300"
          >
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 shadow-inner">
                  <i className="fas fa-lock text-2xl animate-pulse"></i>
                </div>
                <div>
                  <h3 className="text-slate-900 font-extrabold uppercase tracking-tight text-base leading-tight">
                    {t("Aktivasyon Kodu")}
                  </h3>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <input 
                    type="password"
                    autoFocus
                    required
                    placeholder="••••••"
                    value={passwordInput}
                    onChange={(e) => {
                      setPasswordInput(e.target.value);
                      setPasswordError('');
                    }}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-900 placeholder-slate-300 rounded-xl text-center font-mono text-lg font-black tracking-[0.3em] outline-none transition-all"
                  />
                </div>

                {passwordError && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-600 animate-in shake duration-200">
                    <i className="fas fa-circle-exclamation text-xs"></i>
                    <span className="text-[11px] font-bold uppercase tracking-tight">{passwordError}</span>
                  </div>
                )}

                <div className="pt-2 flex flex-col gap-2">
                  <button 
                    type="submit"
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] active:scale-95 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <i className="fas fa-sign-in-alt"></i>
                    {t("Giriş Yap")}
                  </button>

                  <button 
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200/60 rounded-xl font-black text-[11px] uppercase tracking-[0.15em] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1"
                  >
                    {t("İptal")}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default HelpView;
