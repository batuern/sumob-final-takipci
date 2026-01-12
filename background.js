chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "finalKontrol") {
        console.log("Arka planda final kontrolü başladı...");
        otomatikKontrolEt();
    }
});

// HTML Metnini Parçalayan Güncel Fonksiyon (Röntgen sonucuna göre ayarlandı)
function notlariAyikla(htmlMetni) {
    const bulunanNotlar = {};
    
    // Satırları bul
    const satirRegex = /<tr[\s\S]*?<\/tr>/gi;
    const satirlar = htmlMetni.match(satirRegex);

    if (satirlar) {
        satirlar.forEach(satir => {
            // Sütunları ayıkla
            const sutunRegex = /<td[^>]*>(.*?)<\/td>/gi;
            // Tüm sütunları temizleyip bir diziye atıyoruz
            const sutunlar = [...satir.matchAll(sutunRegex)].map(m => m[1].replace(/<[^>]*>/g, "").trim());

            if (sutunlar.length > 8) {
                // 1. Yıl Kontrolü (Index 1)
                const yil = sutunlar[1];
                if (yil !== "2026") return; // Sadece 2026'yı al

                // 2. Veri Çekme
                const dersAdi = sutunlar[2]; // İsim Index 2
                const finalNotu = sutunlar[8]; // Final Index 8

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
        const response = await fetch("https://obis2.selcuk.edu.tr/Ogrenci/NotDurumu");
        const html = await response.text();
        
        const yeniNotlar = notlariAyikla(html);
        console.log("Arka planda bulunan notlar (2026):", yeniNotlar);

        chrome.storage.local.get(['eskiNotlar'], (result) => {
            const eskiNotlar = result.eskiNotlar || {};
            let degisiklikVar = false;

            for (let ders in yeniNotlar) {
                const yeniFinal = yeniNotlar[ders].final;
                const eskiFinal = eskiNotlar[ders] ? eskiNotlar[ders].final : "";

                if (yeniFinal !== eskiFinal && yeniFinal !== "" && yeniFinal !== "-" && yeniFinal !== "0") {
                    chrome.notifications.create({
                        type: "basic",
                        iconUrl: "images/icon128.png", 
                        title: "📢 SÜMOB Bildirimi",
                        message: `${ders} final notu açıklandı: ${yeniFinal}`,
                        priority: 2
                    });
                    degisiklikVar = true;
                }
            }

            if (degisiklikVar) {
                const guncelHafiza = { ...eskiNotlar, ...yeniNotlar };
                chrome.storage.local.set({ eskiNotlar: guncelHafiza });
            }
        });

    } catch (error) {
        console.error("Arka plan kontrol hatası:", error);
    }
}

// Ön yüz mesajlarını dinle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "NOT_KONTROL") {
        const yeniNotlar = request.data;
        chrome.storage.local.get(['eskiNotlar'], (result) => {
            const eskiNotlar = result.eskiNotlar || {};

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