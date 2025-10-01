# 🤖 SelfBot for Discord

Bu **Discord SelfBot**, sunucularınızı ve medya yönetimini kolaylaştıran bir proje

---

## 📌 Yeni / Güncellemeler

### ✨ Yeni
- Artık medya dosyaları **link paylaşmak yerine indiriliyor ve gönderiliyor**.  
- `!kanalayarla` komutu, kaynak kanaldaki tüm ekleri hedef kanala otomatik gönderiyor.  
- `!ping` komutu eklendi, gecikmeyi ölçüyor.  
- Sahip yönetimi komutları: `!sahipekle` / `!sahipsil` / `!owners`.  
- `!soyle` komutu eklendi: mesajı belirttiğiniz kanala atar ve kendi mesajınızı siler.

### ⚡ Güncellendi
- `!yardım` komutu artık tüm komutları ve açıklamalarını gösteriyor.  
- Runtime ve config’teki owner listesi **kalıcı ve senkron** hâle getirildi.  
- Versiyon 2 deki birçok hata fixlendi.
- Selfbot durumu ayarlama özeliği eklendi.

---

## 🛠 Komutlar

### Sahip Yönetimi
- `!sahipekle <ID veya mention>`  
  → Yeni bir owner ekler ve `config.js`’e kalıcı kaydeder.

- `!sahipsil <ID veya mention>`  
  → Belirtilen owner’ı config.js’den  siler.

- `!owners`  
  → Tüm sahipleri listeler ve etiketler.

### Kanal Medya Gönderimi
- `!kanalayarla <AlınacakKanaldID> <GönderilecekKanaldID>`  
  → Belirtilen kanaldaki tüm medyaları otomatik olarak diğer kanala gönderir.

### Yardımcı Komutlar
- `!ping`  
  → Botun gecikmesini ölçer ve gösterir.

- `!yardım`  
  → Tüm komutları ve açıklamalarını listeler.

- `!soyle <mesaj>`  
  → Belirttiğiniz mesajı kanala gönderir ve kendi mesajınızı siler (say komutu mantığı).  

---

## ⚡ Notlar
- Selfbot komutları **komutu yazan mesajı siler**.  
- Node.js ≥16 ve üzeri sürümler ile çalışır.  
- Bu proje **discord.js-selfbot-v13** modülü ile yazılmıştır.  
- Media forwarding artık **dosyayı indirip gönderiyor**, link paylaşmıyor.  
- Selfbot kullanımı **Discord ToS ihlali** oluşturabilir, dikkatli kullanın. 
- Herhangi bir **yasaklama durumunda** sorumluluk kabul etmiyorum. 

---

## 📂 Kurulum
1. Repository’i klonlayın:  

  git clone https://github.com/Burak-16/nsfw-selfbot-v3.git
  cd nsfw-selfbot-v3

2. Modülleri indirin:

   npm install 

3. Config.js dosyasını belirtilen şekilde doldurun:

   module.exports = {
    BOT: {
    token: "YOUR_USER_TOKEN_HERE",
    owners: ["YOUR_OWNER_ID_HERE"]
  }
};

 4. Projeyi çalıştırın:

 node main.js
