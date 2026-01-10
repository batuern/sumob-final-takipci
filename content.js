// Sayfa tam yüklendiğinde notları taramaya başla
function notlariTaraVeGonder() {
    console.log("SÜMOB Eklentisi: Tablo taranıyor...");
    
    // Senin ekran görüntündeki tablo id'sini kullanıyoruz
    const tablo = document.querySelector('#dynamic-table');
    
    if (!tablo) {
        console.log("Hata: Not tablosu bulunamadı!");
        return;
    }

    const satirlar = tablo.querySelectorAll('tbody tr');
    let bulunanNotlar = {};

    satirlar.forEach(satir => {
        const sutunlar = satir.querySelectorAll('td');
        
        // Tablo yapısında ders adı 2. sütun, vize 5. sütun (Sıralamayı teyit ettik)
        if (sutunlar.length > 5) {
            const dersAdi = sutunlar[1].innerText.trim();
            const vizeNotu = sutunlar[4].innerText.trim();
            const finalNotu = sutunlar[8] ? sutunlar[8].innerText.trim() : "";

            if (dersAdi) {
                bulunanNotlar[dersAdi] = {
                    vize: vizeNotu,
                    final: finalNotu
                };
            }
        }
    });

    console.log("Bulunan Notlar:", bulunanNotlar);

    // Arka plana (background.js) veriyi gönder
    chrome.runtime.sendMessage({
        type: "NOT_KONTROL",
        data: bulunanNotlar
    });
}

// Sayfa açıldıktan 3 saniye sonra çalıştır (Yavaş yüklenen tablolar için)
setTimeout(notlariTaraVeGonder, 3000);