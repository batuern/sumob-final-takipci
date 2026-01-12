function notlariTaraVeGonder() {
    console.log("SÜMOB Eklentisi: Tablo taranıyor...");

    const tablo = document.querySelector('#dynamic-table');
    
    if (!tablo) {
        console.log("Hata: Not tablosu bulunamadı!");
        return;
    }

    const satirlar = tablo.querySelectorAll('tbody tr');
    let bulunanNotlar = {};

    satirlar.forEach(satir => {
        const sutunlar = satir.querySelectorAll('td');
        
        // Tablo yapısını kontrol et (Röntgen sonucuna göre en az 9 sütun var)
        if (sutunlar.length > 8) {
            
            // 1. ADIM: Yıl Filtresi (Sütun 1)
            // Sadece kutusunda "2026" yazanları alacağız.
            const yil = sutunlar[1].innerText.trim();
            if (yil !== "2026") {
                return; // 2024, 2025 vs. ise atla
            }

            // 2. ADIM: Verileri Çek (Yeni Haritaya Göre)
            const dersAdi = sutunlar[2].innerText.trim();  // Ders Adı
            const vizeNotu = sutunlar[6].innerText.trim(); // Ara Sınav 1
            const finalNotu = sutunlar[8].innerText.trim(); // Genel Sınav (Final)

            if (dersAdi) {
                bulunanNotlar[dersAdi] = {
                    vize: vizeNotu,
                    final: finalNotu
                };
            }
        }
    });

    console.log("Bulunan GÜNCEL Notlar (2026):", bulunanNotlar);

    chrome.runtime.sendMessage({
        type: "NOT_KONTROL",
        data: bulunanNotlar
    });
}

// 3 saniye sonra çalıştır, 15 dakikada bir tekrarla
setTimeout(notlariTaraVeGonder, 3000);  
chrome.alarms.create("finalKontrol", { periodInMinutes: 15 });