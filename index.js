const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment');
const phonenumbers = require('google-libphonenumber');
const fs = require('fs');
const path = require('path');

const token = '7301883949:AAGI-cJKosJ1vavbPlYLEW137j5qT7tjry0';
const bot = new TelegramBot(token, {polling: true});

let zzk = 0;

bot.onText(/\/start/, async (msg) => {
  zzk++;
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || '';
  const userId = msg.from.id || '';
  const userUsername = msg.from.username || '';
  const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

  const startMessage = `عضو يستخدم البوت…
اسم المستخدم : ${userName}
يوزر المستخدم : @${userUsername}
ايدي المستخدم : ${userId}
رقم المستخدم  : ${zzk}
الوقت : ${currentTime}
ـ @SAGD112`;

  const keyboard = {
    inline_keyboard: [
      [{text: '𝐓𝐢𝐤𝐭𝐨𝐤🎥', callback_data: 'Tik'}, {text: '𝐈𝐧𝐬𝐭𝐚𝐠𝐫𝐚𝐦💌', callback_data: 'IG'}],
      [{text: '𝐓𝐰𝐢𝐭𝐭𝐞𝐫[𝐗]🐦', callback_data: 'Tw'}, {text: '𝐒𝐧𝐚𝐩𝐂𝐡𝐚𝐭👻', callback_data: 'Sn'}],
      [{text: '𝐘𝐨𝐮𝐓𝐮𝐛𝐞📺', callback_data: 'YT'}, {text: '𝐓𝐞𝐥𝐞𝐠𝐫𝐚𝐦🔮', callback_data: 'Tele'}],
      [{text: '𝐏𝐡𝐨𝐧𝐞📞', callback_data: 'PH'}],
      [{text: '- ⚜️ 𝐃𝐞𝐯', url: 'https://t.me/SAGD112'}]
    ]
  };

  await bot.sendMessage(chatId, startMessage, {parse_mode: 'HTML'});
  await bot.sendMessage(chatId, `اهلا بك : | ${userName} | مرحبا بك في بوت info SocialMedia اختر الخدمه التي تعجبك من الازرار الشفافه ايضا للحصول على معلوماتك اضغط على  [ /info ]`, {
    parse_mode: 'HTML',
    reply_markup: keyboard
  });
});

bot.on('callback_query', async (callbackQuery) => {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;

  switch(action) {
    case 'Tik':
      await bot.sendMessage(chatId, 'ارسل اسم المستخدم تيك توك');
      bot.once('message', handleTikTok);
      break;
    case 'IG':
      await bot.sendMessage(chatId, 'ارسل اسم المستخدم انستاجرام');
      bot.once('message', handleInstagram);
      break;
    case 'Tw':
      await bot.sendMessage(chatId, 'ارسل اسم المستخدم تويتر X');
      bot.once('message', handleTwitter);
      break;
    case 'Sn':
      await bot.sendMessage(chatId, 'ارسل اسم المستخدم سناب شات');
      bot.once('message', handleSnapchat);
      break;
    case 'YT':
      await bot.sendMessage(chatId, 'ارسل اسم المستخدم يوتيوب');
      bot.once('message', handleYouTube);
      break;
    case 'Tele':
      await bot.sendMessage(chatId, 'ارسل اسم المستخدم الذي تريد تبحث عليه في التيليجرام');
      bot.once('message', handleTelegram);
      break;
    case 'PH':
      await bot.sendMessage(chatId, 'ارسل رقم الهاتف بالصيغه الدوليه');
      bot.once('message', handlePhoneNumber);
      break;
  }
});

async function handleTikTok(msg) {
  const chatId = msg.chat.id;
  const username = msg.text.replace('@', '');

  try {
    const response = await axios.get(`https://www.tiktok.com/@${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const userData = JSON.parse($('script#__NEXT_DATA__').html()).props.pageProps.userInfo;

    const message = `
═════════𝚃𝙸𝙺𝚃𝙾𝙺═══════════
𝐍𝐚𝐦𝐞 ⇾ ${userData.user.nickname}
𝐈𝐝 ⇾ ${userData.user.id}
𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞 ⇾ @${username}
𝐅𝐨𝐥𝐥𝐨𝐰𝐞𝐫𝐬 ⇾ ${userData.stats.followerCount}
𝐅𝐨𝐥𝐥𝐨𝐰𝐢𝐧𝐠 ⇾ ${userData.stats.followingCount}
𝐋𝐢𝐤𝐞𝐬 ⇾ ${userData.stats.heartCount}
𝐕𝐢𝐝𝐞𝐨𝐬 ⇾ ${userData.stats.videoCount}
𝐁𝐢𝐨 ⇾ ${userData.user.signature}
𝐔𝐫𝐥 ⇾ https://www.tiktok.com/@${username}
═════════𝚃𝙸𝙺𝚃𝙾𝙺═══════════
    `;

    await bot.sendMessage(chatId, message, {parse_mode: 'HTML'});
  } catch (error) {
    await bot.sendMessage(chatId, 'حدث خطأ أثناء جلب معلومات TikTok.');
  }

  await bot.sendMessage(chatId, 'اضغط [ /start ] للرجوع الى القائمه', {parse_mode: 'HTML'});
}

async function handleInstagram(msg) {
  const chatId = msg.chat.id;
  const username = msg.text.replace('@', '');

  try {
    const response = await axios.get(`https://www.instagram.com/${username}/?__a=1`);
    const userData = response.data.graphql.user;

    const message = `
═════════𝙸𝚗𝚜𝚝𝚊𝚐𝚛𝚊𝚖═══════════
𝐍𝐚𝐦𝐞 ⇾ ${userData.full_name}
𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞 ⇾ @${username}
𝐈𝐝 ⇾ ${userData.id}
𝐅𝐨𝐥𝐥𝐨𝐰𝐞𝐫𝐬 ⇾ ${userData.edge_followed_by.count}
𝐅𝐨𝐥𝐥𝐨𝐰𝐢𝐧𝐠 ⇾ ${userData.edge_follow.count}
𝐏𝐨𝐬𝐭𝐬 : ${userData.edge_owner_to_timeline_media.count}
𝐏𝐫𝐢𝐯𝐚𝐭𝐞𝐥𝐲 ⇾ ${userData.is_private}
𝐔𝐫𝐥 ⇾ https://www.instagram.com/${username}
═════════𝙸𝚗𝚜𝚝𝚊𝚐𝚛𝚊𝚖═══════════
    `;

    const profilePicUrl = userData.profile_pic_url_hd;
    const profilePicPath = path.join(__dirname, `${username}.jpg`);
    
    const writer = fs.createWriteStream(profilePicPath);
    const response = await axios({
      url: profilePicUrl,
      method: 'GET',
      responseType: 'stream'
    });
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    await bot.sendPhoto(chatId, profilePicPath, {caption: message, parse_mode: 'HTML'});
    fs.unlinkSync(profilePicPath);
  } catch (error) {
    await bot.sendMessage(chatId, 'حدث خطأ أثناء جلب معلومات Instagram.');
  }

  await bot.sendMessage(chatId, 'اضغط [ /start ] للرجوع الى القائمه', {parse_mode: 'HTML'});
}

async function handleTwitter(msg) {
  const chatId = msg.chat.id;
  const username = msg.text.replace('@', '');

  try {
    const response = await axios.get(`https://livecounts.io/twitter-live-follower-counter/${username}`);
    const $ = cheerio.load(response.data);
    
    const name = $('meta[name="name"]').attr('content');
    const bio = $('meta[name="description"]').attr('content');
    const profilePicUrl = $('meta[property="og:image"]').attr('content');
    const userId = $('meta[name="userId"]').attr('content');

    const message = `
═════════𝚃𝚠𝚒𝚝𝚝𝚎𝚛 𝚇═══════════
𝐍𝐚𝐦𝐞 ⇾ ${name}
𝐁𝐢𝐨 ⇾ ${bio}
𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞 ⇾ @${username}
𝐈𝐝 ⇾ ${userId}
𝐔𝐫𝐥 ⇾ https://twitter.com/${username}
═════════𝚃𝚠𝚒𝚝𝚝𝚎𝚛 𝚇═══════════
    `;

    const profilePicPath = path.join(__dirname, `${username}.jpg`);
    const writer = fs.createWriteStream(profilePicPath);
    const response = await axios({
      url: profilePicUrl,
      method: 'GET',
      responseType: 'stream'
    });
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    await bot.sendPhoto(chatId, profilePicPath, {caption: message, parse_mode: 'HTML'});
    fs.unlinkSync(profilePicPath);
  } catch (error) {
    await bot.sendMessage(chatId, 'حدث خطأ أثناء جلب معلومات Twitter.');
  }

  await bot.sendMessage(chatId, 'اضغط [ /start ] للرجوع الى القائمه', {parse_mode: 'HTML'});
}

async function handleSnapchat(msg) {
  const chatId = msg.chat.id;
  const username = msg.text.replace('@', '');

  try {
    const response = await axios.get(`https://www.snapchat.com/add/${username}`);
    const $ = cheerio.load(response.data);

    const name = $('meta[property="og:title"]').attr('content');
    const bio = $('meta[name="description"]').attr('content');
    const profilePicUrl = $('meta[property="og:image"]').attr('content');

    const message = `
═════════𝚂𝚗𝚊𝚙𝚌𝚑𝚊𝚝═══════════
𝐍𝐚𝐦𝐞 ⇾ ${name}
𝐁𝐢𝐨 ⇾ ${bio}
𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞 ⇾ @${username}
𝐔𝐫𝐥 ⇾ https://www.snapchat.com/add/${username}
═════════𝚂𝚗𝚊𝚙𝚌𝚑𝚊𝚝═══════════
    `;

    const profilePicPath = path.join(__dirname, `${username}.jpg`);
    const writer = fs.createWriteStream(profilePicPath);
    const response = await axios({
      url: profilePicUrl,
      method: 'GET',
      responseType: 'stream'
    });
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    await bot.sendPhoto(chatId, profilePicPath, {caption: message, parse_mode: 'HTML'});
    fs.unlinkSync(profilePicPath);
  } catch (error) {
    await bot.sendMessage(chatId, 'حدث خطأ أثناء جلب معلومات Snapchat.');
  }

    await bot.sendMessage(chatId, 'اضغط [ /start ] للرجوع الى القائمه', {parse_mode: 'HTML'});
}

// ... (الكود السابق يبقى كما هو)

async function handleYouTube(msg) {
  const chatId = msg.chat.id;
  const username = msg.text.replace('@', '');

  try {
    const response = await axios.get(`https://www.youtube.com/@${username}`);
    const $ = cheerio.load(response.data);

    const name = $('meta[property="og:title"]').attr('content').replace(' - YouTube', '');
    const bio = $('meta[name="description"]').attr('content');
    const subscribers = $('meta[itemprop="interactionCount"]').attr('content');
    const profilePicUrl = $('meta[property="og:image"]').attr('content');

    const message = `
═════════𝚈𝚘𝚞𝚃𝚞𝚋𝚎═══════════
𝐍𝐚𝐦𝐞 ⇾ ${name}
𝐒𝐮𝐛𝐬𝐜𝐫𝐢𝐛𝐞𝐫𝐬 ⇾ ${subscribers}
𝐁𝐢𝐨 ⇾ ${bio}
𝐔𝐫𝐥 ⇾ https://www.youtube.com/@${username}
═════════𝚈𝚘𝚞𝚃𝚞𝚋𝚎═══════════
    `;

    const profilePicPath = path.join(__dirname, `${username}.jpg`);
    const writer = fs.createWriteStream(profilePicPath);
    const imageResponse = await axios({
      url: profilePicUrl,
      method: 'GET',
      responseType: 'stream'
    });
    imageResponse.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    await bot.sendPhoto(chatId, profilePicPath, {caption: message, parse_mode: 'HTML'});
    fs.unlinkSync(profilePicPath);
  } catch (error) {
    await bot.sendMessage(chatId, 'حدث خطأ أثناء جلب معلومات YouTube.');
  }

  await bot.sendMessage(chatId, 'اضغط [ /start ] للرجوع الى القائمه', {parse_mode: 'HTML'});
}

async function handleTelegram(msg) {
  const chatId = msg.chat.id;
  const username = msg.text.replace('@', '');

  try {
    const response = await axios.get(`https://t.me/${username}`);
    const $ = cheerio.load(response.data);

    const name = $('meta[property="og:title"]').attr('content');
    const bio = $('meta[property="og:description"]').attr('content');
    const profilePicUrl = $('meta[property="og:image"]').attr('content');

    const message = `
═════════𝚃𝚎𝚕𝚎𝚐𝚛𝚊𝚖═══════════
𝐔𝐬𝐞𝐫𝐧𝐚𝐦𝐞 ⇾ @${username}
𝐍𝐚𝐦𝐞 ⇾ ${name}
𝐁𝐢𝐨 ⇾ ${bio}
𝐔𝐫𝐥 ⇾ https://t.me/${username}
═════════𝚃𝚎𝚕𝚎𝚐𝚛𝚊𝚖═══════════
    `;

    const profilePicPath = path.join(__dirname, `${username}.jpg`);
    const writer = fs.createWriteStream(profilePicPath);
    const imageResponse = await axios({
      url: profilePicUrl,
      method: 'GET',
      responseType: 'stream'
    });
    imageResponse.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    await bot.sendPhoto(chatId, profilePicPath, {caption: message, parse_mode: 'HTML'});
    fs.unlinkSync(profilePicPath);
  } catch (error) {
    await bot.sendMessage(chatId, 'حدث خطأ أثناء جلب معلومات Telegram.');
  }

  await bot.sendMessage(chatId, 'اضغط [ /start ] للرجوع الى القائمه', {parse_mode: 'HTML'});
}

async function handlePhoneNumber(msg) {
  const chatId = msg.chat.id;
  const phoneNumber = msg.text;

  try {
    const phoneUtil = phonenumbers.PhoneNumberUtil.getInstance();
    const number = phoneUtil.parse(phoneNumber);
    
    const country = phoneUtil.getRegionCodeForNumber(number);
    const timeZones = phonenumbers.timezonesForNumber(number);
    const carrier = phonenumbers.carrierForNumber(number);

    const message = `
═════════𝙸𝚗𝚏𝚘𝙿𝚑𝚘𝚗𝚎═══════════
Phone Number: ${phoneNumber}
Country: ${country}
Timezone: ${timeZones.join(', ')}
Carrier: ${carrier || 'Unknown'}
═════════𝙸𝚗𝚏𝚘𝙿𝚑𝚘𝚗𝚎═══════════
    `;

    await bot.sendMessage(chatId, message, {parse_mode: 'HTML'});
  } catch (error) {
    await bot.sendMessage(chatId, 'حدث خطأ أثناء تحليل رقم الهاتف. تأكد من إدخال الرقم بالصيغة الدولية الصحيحة.');
  }

  await bot.sendMessage(chatId, 'اضغط [ /start ] للرجوع الى القائمه', {parse_mode: 'HTML'});
}

bot.onText(/\/info/, async (msg) => {
  const chatId = msg.chat.id;
  const userName = msg.from.first_name || '';
  const userId = msg.from.id || '';
  const userUsername = msg.from.username || '';
  const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

  const infoMessage = `ـــــــــــــــــــــــــــــــــــــــ
اسمك : ${userName}
يوزرك : @${userUsername}
الايدي : ${userId}
الوقت : ${currentTime}
البايو : (Not available in Telegram Bot API)
ـ @SAGD112`;

  await bot.sendMessage(chatId, infoMessage, {parse_mode: 'HTML'});
});

// Error handling
bot.on('polling_error', (error) => {
  console.log(error);
});

console.log('Bot is running...');
