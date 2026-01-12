// Alarmı kur (Her 15 dakikada bir)
chrome.alarms.create("finalKontrol", { periodInMinutes: 15 });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "finalKontrol") {
        console.log("Arka planda final kontrolü başladı...");
        otomatikKontrolEt();
    }
});

// HTML Metnini Parçalayan Özel Fonksiyon (Çünkü arka planda document.querySelector yok!)
function notlariAyikla(htmlMetni) {
    const bulunanNotlar = {};
    
    // HTML'i satır satır (tr) bölmeye çalışalım
    // Not: Bu basit bir regex çözümüdür, arka plan için mecburuz.
    const satirRegex = /<tr[\s\S]*?<\/tr>/gi;
    const satirlar = htmlMetni.match(satirRegex);

    if (satirlar) {
        satirlar.forEach(satir => {
            // ÖNCEKİ FİLTRE: Sadece 2025-2026 satırlarını al
            if (!satir.includes("2025-2026")) return;

            // Sütunları (td) bul
            const sutunRegex = /<td[^>]*>(.*?)<\/td>/gi;
            const sutunlar = [...satir.matchAll(sutunRegex)].map(m => m[1].replace(/<[^>]*>/g, "").trim());

            // Tablo yapına göre: 1. index Ders Adı, 8. index Final
            if (sutunlar.length > 5) {
                const dersAdi = sutunlar[1]; 
                // HTML entity temizliği (&nbsp; vs) gerekebilir ama şimdilik basit tutalım
                const finalNotu = sutunlar[8] || ""; 

                if (dersAdi) {
                    bulunanNotlar[dersAdi] = { final: finalNotu };
                }
            }
        });
    }
    return bulunanNotlar;
}

async function otomatikKontrolEt() {
    try {
        // 1. OBIS'e git veriyi çek
        const response = await fetch("https://obis2.selcuk.edu.tr/Ogrenci/NotDurumu"); // URL'yi doğru yazdığından emin ol
        const html = await response.text();
        
        // 2. HTML'i parçala ve notları bul (EKSİK OLAN KISIM BURASIYDI)
        const yeniNotlar = notlariAyikla(html);
        console.log("Arka planda bulunan notlar:", yeniNotlar);

        // 3. Eskilerle karşılaştır
        chrome.storage.local.get(['eskiNotlar'], (result) => {
            const eskiNotlar = result.eskiNotlar || {};
            let degisiklikVar = false;

            for (let ders in yeniNotlar) {
                const yeniFinal = yeniNotlar[ders].final;
                const eskiFinal = eskiNotlar[ders] ? eskiNotlar[ders].final : "";

                // Not değişmişse ve boş değilse bildirim at
                if (yeniFinal !== eskiFinal && yeniFinal !== "" && yeniFinal !== "-" && yeniFinal !== "0") {
                    chrome.notifications.create({
                        type: "basic",
                        iconUrl: "images/icon128.png", // Buraya gerçek ikon yolunu yazarsan daha şık durur
                        title: "📢 SÜMOB Bildirimi",
                        message: `${ders} final notu açıklandı: ${yeniFinal}`,
                        priority: 2
                    });
                    degisiklikVar = true;
                }
            }

            // Eğer değişiklik varsa hafızayı güncelle
            if (degisiklikVar) {
                // Sadece finali değil komple objeyi saklamak istersen yapıyı koru
                // Burada basitçe merge ediyoruz
                const guncelHafiza = { ...eskiNotlar, ...yeniNotlar };
                chrome.storage.local.set({ eskiNotlar: guncelHafiza });
            }
        });

    } catch (error) {
        console.error("Arka plan kontrol hatası:", error);
    }
}

// Ön yüzden gelen mesajları dinle (Burası manuel kontrol için)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "NOT_KONTROL") {
        const yeniNotlar = request.data;
        chrome.storage.local.get(['eskiNotlar'], (result) => {
            const eskiNotlar = result.eskiNotlar || {};
            
            // Buradaki mantığın doğruydu, aynen koruyoruz
            for (let ders in yeniNotlar) {
                const yeniFinal = yeniNotlar[ders].final;
                const eskiFinal = eskiNotlar[ders] ? eskiNotlar[ders].final : "";

                if (yeniFinal !== eskiFinal && yeniFinal !== "" && yeniFinal !== "-" && yeniFinal !== "0") {
                    chrome.notifications.create({
                        type: "basic",
                        iconUrl: "images/icon128.png", 
                        title: "Yeni Bir Final notu girildi:",
                        message: `${ders}: ${yeniFinal}`,
                        priority: 2
                    });
                }
            }
            chrome.storage.local.set({ eskiNotlar: yeniNotlar });
        });
    }
});