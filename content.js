function notlariTaraVeGonder() {
    console.log("SÜMOB Eklentisi: Son Yıl Notları taranıyor...");

    // Son Yıl Notları sayfasında tek ve ana bir tablo olduğu için direkt 'table' diyebiliriz.
    const tablo = document.querySelector('table'); 
    
    if (!tablo) {
        console.log("Hata: Not tablosu bulunamadı!");
        return;
    }

    const satirlar = tablo.querySelectorAll('tbody tr');
    let bulunanNotlar = {};

    satirlar.forEach(satir => {
        const sutunlar = satir.querySelectorAll('td');
        
        // Tablo yapısını kontrol et (Vize1=4, Final=8 olduğu için en az 9 sütun olmalı)
        if (sutunlar.length > 8) {
            
            // VERİ ÇEKME (Yeni Haritaya Göre)
            const dersAdi = sutunlar[2].innerText.trim();  // Index 2: Ders Adı
            const vizeNotu = sutunlar[4].innerText.trim(); // Index 4: Vize 1
            const finalNotu = sutunlar[8].innerText.trim(); // Index 8: Final

            // Başlık satırını (header) çekmemek için basit bir kontrol
            // "Ders Adı" yazan satırı ve boş satırları atlıyoruz
            if (dersAdi && dersAdi !== "Ders Adı") {
                bulunanNotlar[dersAdi] = {
                    vize: vizeNotu,
                    final: finalNotu
                };
            }
        }
    });

    console.log("Bulunan SON YIL Notları:", bulunanNotlar);

    chrome.runtime.sendMessage({
        type: "NOT_KONTROL",
        data: bulunanNotlar
    });
}

// 3 saniye sonra çalıştır, 15 dakikada bir tekrarla
setTimeout(notlariTaraVeGonder, 3000);  
chrome.alarms.create("finalKontrol", { periodInMinutes: 15 });