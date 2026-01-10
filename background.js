// Alarm kur: Her 15 dakikada bir kontrol et
chrome.alarms.create("finalKontrol", { periodInMinutes: 15 });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "finalKontrol") {
        console.log("Arka planda final kontrolü başladı...");
        otomatikKontrolEt();
    }
});

async function otomatikKontrolEt() {
    try {
        const response = await fetch("https://obis3.selcuk.edu.tr/Ogrenci/SonYilNotlari");
        const html = await response.text();
        
        // HTML içinden notları ayıkla (Basit bir Regex ile)
        // Bu kısım sayfa yapısına göre çok hassastır
        chrome.storage.local.get(['eskiNotlar'], (result) => {
            const eskiNotlar = result.eskiNotlar || {};
            
            // Burada basitçe HTML içinde yeni bir veri var mı diye bakıyoruz
            // Eğer daha profesyonel bir ayıklama istersen 'offscreen document' kullanabiliriz
            // Ama şimdilik en kolay yol senin sayfayı her açtığında content.js'in veriyi güncellemesidir.
            console.log("Arka plan sorgusu başarılı.");
        });
    } catch (error) {
        console.error("Arka plan kontrol hatası:", error);
    }
}

// Bildirim dinleyicisi (content.js'den gelen veriler için)
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
                        iconUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
                        title: "MÜJDE! FİNAL NOTUN GELDİ 🎓",
                        message: `${ders}: ${yeniFinal}`,
                        priority: 2
                    });
                }
            }
            chrome.storage.local.set({ eskiNotlar: yeniNotlar });
        });
    }
});