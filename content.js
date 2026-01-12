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
        // --- YENİ EKLENEN FİLTRE KISMI BAŞLANGIÇ ---
        // Satırın tamamındaki metni alıyoruz
        const satirMetni = satir.innerText;
        
        // Eğer satırda "2025" ibaresi geçmiyorsa (yani 2024 ise) bu satırı atla
        if (!satirMetni.includes("2025-2026")) {
            return; 
        }
        // --- FİLTRE KISMI BİTİŞ ---

        const sutunlar = satir.querySelectorAll('td');
        
        if (sutunlar.length > 5) {
            const dersAdi = sutunlar[1].innerText.trim();
            const vizeNotu = sutunlar[4].innerText.trim();
            // Final notu bazen 8. sütunda olmayabilir, kontrol ediyoruz
            const finalNotu = sutunlar[8] ? sutunlar[8].innerText.trim() : "";

            if (dersAdi) {
                bulunanNotlar[dersAdi] = {
                    vize: vizeNotu,
                    final: finalNotu
                }
            }
        }
    });

    console.log("Bulunan GÜNCEL Notlar (2025-2026):", bulunanNotlar);

    chrome.runtime.sendMessage({
        type: "NOT_KONTROL",
        data: bulunanNotlar
    });
}