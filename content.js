// content.js - TEMİZLENMİŞ HALİ

function notlariTaraVeGonder() {
    console.log("SÜMOB Eklentisi: Son Yıl Notları taranıyor...");

    const tablo = document.querySelector('table'); 
    
    if (!tablo) {
        console.log("Hata: Not tablosu bulunamadı!");
        return;
    }

    const satirlar = tablo.querySelectorAll('tbody tr');
    let bulunanNotlar = {};

    satirlar.forEach(satir => {
        const sutunlar = satir.querySelectorAll('td');
        
        // Tablo yapısını kontrol et
        if (sutunlar.length > 8) {
            
            // VERİ ÇEKME (Yeni Haritaya Göre)
            const dersAdi = sutunlar[2].innerText.trim();  // Index 2: Ders Adı
            const vizeNotu = sutunlar[4].innerText.trim(); // Index 4: Vize 1
            const finalNotu = sutunlar[8].innerText.trim(); // Index 8: Final

            // Başlık satırını atla
            if (dersAdi && dersAdi !== "Ders Adı") {
                bulunanNotlar[dersAdi] = {
                    vize: vizeNotu,
                    final: finalNotu
                };
            }
        }
    });

    console.log("Bulunan SON YIL Notları:", bulunanNotlar);

    // Verileri arka plana gönder (Alarm yok, sadece mesaj var)
    chrome.runtime.sendMessage({
        type: "NOT_KONTROL",
        data: bulunanNotlar
    });
}

// Sayfa açıldıktan 3 saniye sonra 1 kere çalıştır.
// (Sürekli kontrolü zaten background.js 15 dakikada bir yapıyor)
setTimeout(notlariTaraVeGonder, 3000);