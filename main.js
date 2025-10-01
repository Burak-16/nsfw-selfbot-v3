const fs = require("fs");
const path = require("path");
const axios = require("axios")
//sonradan eklediğim modüller


const { Client } = require("discord.js-selfbot-v13");
const {
  JsonDatabase,
} = require("wio.db");

const db = new JsonDatabase({
databasePath:"./nudeseks.json"
});

const { BOT } = require("./Config")

const client = new Client({
  checkUpdate: false,
});
exports.client = client;

  client.on("ready", () => {
    console.log(`${client.user.tag} giriş yaptı!`);

    // Burada durumu ayarlayabilirsin
    client.user.setActivity("Burakrhyme Project!", { type: "WATCHING" }); // Oynuyor izliyor dinliyor vs yapmak için büyük harflerle ingilizcesini yaz PLAYING WATCHING LISTINIG
    client.user.setStatus("idle"); // Online dnd idle vs.
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

client.login(BOT.token);
client.setMaxListeners(30);



//test komutu bu
client.on("messageCreate", async (message) => {
  // Kendi mesajlarını işlemez (loop engeli)
  if (message.author.id === client.user.id) return;

  // !kanalayarla komutu
  if (message.content.startsWith("!kanalayarla")) {

    // Sahip kontrolü
    if (!BOT.owners.includes(message.author.id)) {
      return message.channel.send("Birdaha bu komutu kullanmaya çalışırsan seni karım yaparım");
    }

    // Parametreleri ayır
    let splitted = message.content.split(" ");
    let alinacakanal = splitted[1];
    let gonderileceknala = splitted[2];

    // Hata kontrolü
    if (!alinacakanal || !gonderileceknala) {
      return message.channel.send("Birdaha kanal idisi belirtmez isen ananı karım yaparım. Böyle kullanacan hayvan Örnek: `!kanalayarla 123456789 987654321`");
    }

    try {
      db.set(`${alinacakanal}`, gonderileceknala);
      await message.channel.send({ content: `<#${alinacakanal}> Bu kanala gönderilen medya otomatik olarak <#${gonderileceknala}> kanalına gönderilecek.`});
    } catch (err) {
      console.error(err);
      message.channel.send("⚠️ Bir hata oluştu, tekrar deneyin.");
    }
  }

  // Medya gönderme kısmı (kaynak -> hedef, dosya indirip upload)
  if (db.has(`${message.channelId}`)) {
    if (message.attachments && message.attachments.size > 0) {
      // Hedef kanal id'si
      const targetChannelId = db.get(`${message.channelId}`);
      const targetChannel = client.channels.cache.get(targetChannelId);

      // Eğer hedef kanal bulunamazsa skip
      if (!targetChannel) {
        console.warn(`Hedef kanal bulunamadı: ${targetChannelId}`);
        return;
      }

      // Her attachment için işlem (for..of async uyumlu)
      for (const attachment of message.attachments.values()) {
        try {
          // Benzersiz geçici dosya adı: zaman damgası + orj ad
          const uniqueName = `${Date.now()}_${attachment.name}`;
          const filePath = path.join(__dirname, "temp", uniqueName);

          // Dosyayı indir (axios ile arraybuffer)
          const response = await axios.get(attachment.url, { responseType: "arraybuffer" });
          fs.writeFileSync(filePath, response.data);

          // Hedef kanala gönder (dosya olarak)
          await targetChannel.send({ files: [filePath] });

          console.log(`✅ Aktarıldı: ${attachment.name} -> ${targetChannelId}`);

          // Geçici dosyayı sil
          try { fs.unlinkSync(filePath); } catch (e) { console.error("Temp dosya silinemedi:", e); }

          // await sleep(200);

        } catch (err) {
          console.error("Dosya aktarılırken hata:", err);
        }
      }
    }
  }
});



// owner ekleme komutu

// config dosya yolu (main dosyana göre ayarla)
const configPath = path.join(__dirname, "./Config.js");

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!sahipekle")) return;

  // Sadece mevcut ownerlar kullanabilir
  if (!BOT.owners.includes(message.author.id)) {
    return message.channel.send("❌ Bu komutu kullanmaya yetkiniz yok!");
  }

  // Mesajı sil (selfbot)
  await message.delete().catch(() => {});

  const parts = message.content.split(" ").filter(Boolean);
  const newOwnerId = parts[1]?.replace(/[<@!>]/g, ""); // mention varsa ID’ye çevir

  if (!newOwnerId || isNaN(newOwnerId)) {
    return message.channel.send("❌ Lütfen geçerli bir kullanıcı ID’si girin. Örnek: `!sahipekle 123456789012345678`");
  }

  if (BOT.owners.includes(newOwnerId)) {
    return message.channel.send("⚠️ Bu kullanıcı zaten owner listesinde!");
  }

  // Runtime array'e ekle
  BOT.owners.push(newOwnerId);

  try {
    // Cache temizle, config'i güncel olarak al
    delete require.cache[require.resolve(configPath)];
    let configData = require(configPath);

    if (!configData.BOT.owners.includes(newOwnerId)) {
      configData.BOT.owners.push(newOwnerId);

      // Config dosyasına yaz (kalıcı)
      fs.writeFileSync(configPath, "module.exports = " + JSON.stringify(configData, null, 2) + ";", "utf8");
    }

    message.channel.send(`✅ Kullanıcı ID ${newOwnerId} owner olarak eklendi ve kaydedildi!`);
  } catch (err) {
    console.error("Config güncellenirken hata:", err);
    message.channel.send("⚠️ Config güncellenirken bir hata oluştu!");
  }
});


//owner silme komutu

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!sahipsil")) return;

  // Sadece owner kullanabilir
  if (!BOT.owners.includes(message.author.id)) {
    return message.channel.send("❌ Bu komutu kullanmaya yetkiniz yok!");
  }

  // Mesajı sil (selfbot)
  await message.delete().catch(() => {});

  const parts = message.content.split(" ").filter(Boolean);
  const removeId = parts[1]?.replace(/[<@!>]/g, "");

  if (!removeId || isNaN(removeId)) {
    return message.channel.send("❌ Lütfen geçerli bir kullanıcı ID’si girin. Örnek: `!sahipsil 123456789012345678`");
  }

  // Cache temizle ve config’i al
  delete require.cache[require.resolve(configPath)];
  const configData = require(configPath);

  if (!configData.BOT.owners.includes(removeId)) {
    return message.channel.send("⚠️ Bu kullanıcı zaten owner listesinde yok!");
  }

  // Config array’inden sil
  configData.BOT.owners = configData.BOT.owners.filter(id => id !== removeId);

  // Dosyaya yaz (kalıcı)
  fs.writeFileSync(configPath, "module.exports = " + JSON.stringify(configData, null, 2) + ";", "utf8");

  // Runtime array’i güncelle
  BOT.owners = BOT.owners.filter(id => id !== removeId);

  message.channel.send(`✅ Kullanıcı ID ${removeId} owner listesinden silindi!`);
});




// ownerları görüntüleme 

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!owners")) return;

  // Opsiyonel: sadece owner görebilsin
  if (!BOT.owners.includes(message.author.id)) {
    return message.channel.send("❌ Bu komutu kullanmaya yetkiniz yok!");
  }

  // Mesajı sil (selfbot)
  await message.delete().catch(() => {});

  if (!BOT.owners || BOT.owners.length === 0) {
    return message.channel.send("⚠️ Henüz hiçbir owner eklenmemiş.");
  }

  // Owner ID’lerini mention’a çevir
  const mentions = BOT.owners.map(id => `<@${id}>`).join("\n");

  message.channel.send(`👑 Sahipler:\n${mentions}`);
});





client.on("messageCreate", async (message) => {
  if(!BOT.owners.includes(message.author.id)) {
    if(message.content.startsWith("!soyle")) {
      return message.channel.send("❌ Bu komutu kullanmaya yetkiniz yok!");
    }
    return;
  }

  if(message.content.startsWith("!soyle")) {
    // Komutu yazan mesajı sil
    await message.delete().catch(() => {});

    let splitted = message.content.split(" ");
    let kanalID = splitted[1];
    let mesaj = kanalID ? splitted.slice(2).join(" ") : splitted.slice(1).join(" ");

    // Eğer mesaj yoksa uyarı
    if(!mesaj) {
      return message.channel.send("❌ Lütfen göndermek istediğiniz mesajı yazın! Örnek: `!soyle 123456789 Merhaba dünya!`");
    }

    try {
      let kanal = kanalID ? client.channels.cache.get(kanalID) : message.channel;
      if(!kanal) return message.channel.send("❌ Geçerli bir kanal ID'si girin!");

      await kanal.send(mesaj);
    } catch(err) {
      console.error(err);
      message.channel.send("⚠️ Mesaj gönderilirken bir hata oluştu.");
    }
  }
});

//ping komutu 

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!ping")) return;

  // Mesajı sil (selfbot)
  await message.delete().catch(() => {});

  const start = Date.now();
  const msg = await message.channel.send("🏓 Pong...");
  const latency = Date.now() - start;

  // Mesajı editleyelim latency ile
  msg.edit(`🏓 Pong! Gecikme: ${latency}ms`);
});

//command list (yardım komutu)

client.on("messageCreate", async (message) => {
  if (!message.content.startsWith("!yardım")) return;

  // Mesajı sil (selfbot)
  await message.delete().catch(() => {});

  const yardımMesajı = `
🤖 Selfbot Komutları:

!sahipekle <ID veya mention>
  → Yeni bir owner ekler ve config.js’e kalıcı kaydeder.

!sahipsil <ID veya mention>
  → Belirtilen owner’ı config.js ve runtime array’den siler.

!owners
  → Tüm sahipleri listeler ve etiketler.

!kanalayarla <alınacakKanaldID> <gönderilecekKanaldID>
  → Belirtilen kanaldaki medyaları diğer kanala otomatik gönderir.

!ping
  → Botun gecikmesini ölçer ve gösterir.

  !soyle
     →  Belirtiğiniz mesajı yazar.
`;

  message.channel.send(yardımMesajı);
});


const express = require('express');
const { channel } = require("diagnostics_channel");
const app = express();
const port = 3000;

app.get('/', (req, res) => res.send('Power By Burakrhyme'));

app.listen(port, () =>
    console.log(`Bot bu adres üzerinde çalışıyor: http://localhost:${port}`)
);

