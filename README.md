# Fragment Tool
## دور زدن فیلترینگ دامنه با فرگمنت

توسط ابزار فرگمنت می‌تونین دامنه‌های مرده‌تون رو مجدد زنده کنید!<br>
با فرگمنت‌کردن کانفیگ‌های VLESS/VMESS/TROJAN از نوع WS/GRPC میتونین به کمک این‌ابزار و یک آی‌پی تمیز کلودفلر، فیلترینگ دامنه‌رو دور بزنین.

![screenshot.png](screenshot.png)

### فرگمنت روی چه‌مدل کانفیگ‌هایی کار میکنه؟<br>
اگر سرور شخصی دارین و کانفیگ VLESS/VMESS/TROJAN رو پشت CDN کلودفلر با پروکسی روشن قرار دادین، میتونین توسط این‌ابزار کانفیگ‌های WS/GRPC رو فرگمنت کنین

### فرگمنت چه مقادیری داره؟ <br>
فیلد Packets در کانفیگ فاقد TLS باید برابر ۱ و دارای TLS برابر با tlshello باشه. فیلد Length اندازه پکت‌های خردشده برحسب بایت و فیلد Interval تاخیر ارسال پکت‌ها برحسب میلی‌ثانیه هست. مثلن اگر اندازه پکت ۴۰۰ بایت باشه، با تنظیمات بالا به حدودن ۱۰۰ تکه خرد و در مدت ۵*۱۰۰ میلی‌ثانیه ارسال میشه؛ یعنی ۵۰۰ میلی‌ثانیه به پینگ اضافه میشه. با افزایش تاخیر از ۵ به ۱۰، قدرت عبور از فیلتر بیشتر، اما پینگ هم بیشتر خواهد شد.

### چه کلاینت‌هایی از فرگمنت پشتیبانی می‌کنن؟<br>
کلاینت‌های XRAY با هسته ۱.۸.۳ به بالا، مثل آخرین نسخه از v2rayn, v2rayng, foxray یا streisand (در android, windows, ios) از قابلیت ایمپورت و استفاده از فرگمنت برخوردارن
<br>
* توضیحات بیشتر: https://shorturl.at/cfpE8

### روی چه اینترنت‌هایی تست شده؟<br>
روی همراه‌اول، ایرانسل، مخابرات و سایر سرویس‌دهنده‌ها تست شده

---
### Using the Fragment tool, you can revive your dead domains!
to participate in translating the tool into other languages, you can follow the steps below:<br>
https://github.com/ircfspace/fragment/tree/main/assets/lang

---
Thanks for @GFW-knocker's guidance.

---

* https://ircf.space