const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const uuid = require('uuid');
const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot is running...');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// تكوين البوت - تأكد من استبدال 'YOUR_BOT_TOKEN' بالرمز الفعلي لبوتك
const bot = new TelegramBot('7252078284:AAFt6ySoKDAJx-6wbg435qnU-_ramrgRL8Y', { polling: true });

// دالة لإنشاء user agent عشوائي
function generateUserAgent() {
    const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.138 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.5615.138 Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 13_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Mobile/15E148 Safari/604.1",
        "Mozilla/5.0 (iPad; CPU OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1",
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// دالة للنوم (مهلة)
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// دالة للتعامل مع أخطاء الشبكة وإعادة المحاولة في حال الخطأ 429
async function handleNetworkRequest(requestPromise) {
    try {
        return await requestPromise;
    } catch (error) {
        if (error.response && error.response.status === 429) {
            console.log('تم الوصول إلى الحد الأقصى للطلبات. الانتظار 60 ثانية.');
            await sleep(60000); // الانتظار 60 ثانية قبل إعادة المحاولة
            return await requestPromise;
        } else {
            console.error('Network Error:', error.message);
            throw error;
        }
    }
}

// دالة لتنزيل صورة الملف الشخصي
async function downloadProfilePicture(url, username) {
    if (!url) return 'default.jpg';

    const profile_pic_path = `${username}.jpg`;
    const writer = fs.createWriteStream(profile_pic_path);

    try {
        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream'
        });
        response.data.pipe(writer);
        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });
        return profile_pic_path;
    } catch (error) {
        console.error('Error downloading profile picture:', error);
        return 'default.jpg';
    }
}

// المعالج الرئيسي لأمر /ig
bot.onText(/\/ig (.+)/, async (msg, match) => {
    const chatId = msg.chat.id; // تخزين chatId هنا

    try {
        const user = match[1].trim();

        const csr = uuid.v4().replace(/-/g, "");
        const uid = uuid.v4();

        const headers = {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Host": "i.instagram.com",
            "Connection": "Keep-Alive",
            "User-Agent": generateUserAgent(),
            "Cookie": `mid=YwvCRAABAAEsZcmT0OGJdPu3iLUs; csrftoken=${csr}`,
            "Cookie2": "$Version=1",
            "Accept-Language": "en-US",
            "X-IG-Capabilities": "AQ==",
            "Accept-Encoding": "gzip",
        };

        const data = {
            q: user,
            device_id: `android${uid}`,
            guid: uid,
            _csrftoken: csr
        };

        // الطلب الأول إلى Instagram API
        const response = await handleNetworkRequest(
            axios.post('https://i.instagram.com/api/v1/users/lookup/', data, { headers })
        );
        const res = response.data;

        const email = res.obfuscated_email;
        const phone = res.obfuscated_phone;
        const isPrivate = res.user.is_private;
        const fbLogin = res.fb_login_option;
        const whatsappReset = res.can_wa_reset;
        const smsReset = res.can_sms_reset;
        const emailReset = res.can_email_reset;
        const hasValidPhone = res.has_valid_phone;
        const isVerified = res.user.is_verified;
        const profilePicUrl = res.user.profile_pic_url;


        // تنزيل صورة الملف الشخصي
        const profile_pic_path = await downloadProfilePicture(profilePicUrl, user);

        // الطلب الثاني للحصول على معلومات الملف الشخصي للمستخدم
        const headers2 = {
            'accept': '*/*',
            'accept-encoding': 'gzip, deflate, br',
            'accept-language': 'ar,en;q=0.9',
            'cookie': `ig_did=${uuid.v4()}; datr=8J8TZD9P4GjWjawQJMcnRdV_; mid=ZBOf_gALAAGhvjQbR29aVENHIE4Z; ig_nrcb=1; csrftoken=5DoPPeHPd4nUej9JiwCdkvwwmbmkDWpy; ds_user_id=56985317140; dpr=1.25`,
            'referer': `https://www.instagram.com/${user}/?hl=ar`,
            'user-agent': generateUserAgent(),
            'x-csrftoken': '5DoPPeHPd4nUej9JiwCdkvwwmbmkDWpy',
            'x-ig-app-id': '936619743392459',
            'x-requested-with': 'XMLHttpRequest',
        };

        const profileResponse = await handleNetworkRequest(
            axios.get(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${user}`, { headers: headers2 })
        );
        const rr = profileResponse.data;

        const id = rr.data.user.id;
        const name = rr.data.user.full_name;
        const bio = rr.data.user.biography;
        const followers = rr.data.user.edge_followed_by.count;
        const following = rr.data.user.edge_follow.count;

        const re = await handleNetworkRequest(
            axios.get(`https://o7aa.pythonanywhere.com/?id=${id}`)
        );
        const date = re.data.date;

        const message = `
⋘─────━*🌟 معلومات انستغرام 🌟*━─────⋙
💬 الاسم ⇾ ${name}
🔗 اسم المستخدم ⇾ @${user}
🆔 معرف الحساب ⇾ ${id}
👥 المتابعون ⇾ ${followers}
👤 المتابعين ⇾ ${following}
📄 السيرة الذاتية ⇾ ${bio}
📅 تاريخ الحساب ⇾ ${date}
🔗 الرابط ⇾ https://www.instagram.com/${user}
📧 البريد الالكتروني ⇾ ${email}
📞 الهاتف ⇾ ${phone}
🔒 حساب خاص ⇾ ${isPrivate}
📱 خيارات تسجيل الدخول بالفيسبوك ⇾ ${fbLogin}
📱 إعادة تعيين الواتساب ⇾ ${whatsappReset}
📧 إعادة تعيين البريد ⇾ ${emailReset}
📞 هاتف صالح ⇾ ${hasValidPhone}
✔️ حساب موثق ⇾ ${isVerified}
⋘─────━*🌟 انستغرام 🌟*━─────⋙
👨‍💻 المطور: @SAGD112 | @SJGDDW
        `;

        // إرسال الرسالة مع الصورة
        await bot.sendPhoto(chatId, profile_pic_path, { caption: message, parse_mode: 'HTML' });

        // حذف ملف الصورة الشخصية بعد الإرسال
        if (profile_pic_path !== 'default.jpg') {
            fs.unlinkSync(profile_pic_path);
        }

    } catch (e) {
        console.error('Main error:', e);
        bot.sendMessage(chatId, `حدث خطأ: ${e.message}`);
    }
});

// بدء تشغيل البوت
bot.on('polling_error', (error) => {
    console.log('Polling error:', error);
});

console.log('Bot is running...');
