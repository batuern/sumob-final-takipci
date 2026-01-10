
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
        
   
        chrome.storage.local.get(['eskiNotlar'], (result) => {
            const eskiNotlar = result.eskiNotlar || {};
            
            
            console.log("Arka plan sorgusu başarılı.");
        });
    } catch (error) {
        console.error("Arka plan kontrol hatası:", error);
    }
}


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