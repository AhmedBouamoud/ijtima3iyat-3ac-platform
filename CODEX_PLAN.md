# CODEX_PLAN.md — خطة التطوير

## المشروع
**الاجتماعيات للجميع** — منصة مراجعة الجهوي للثالثة إعدادي  
الأستاذ أحمد بوعمود — مؤسسة الحنان

---

## الحالة الراهنة

### المرحلة الأولى (مكتملة) ✅
- [x] الصفحة الرئيسية (`index.html`)
- [x] صفحة الدروس (`lessons.html`)
- [x] المنهجية (`methodology.html`)
- [x] الامتحانات الجهوية (`exams.html`)
- [x] الإنفوغرافيا (`infographics.html`)
- [x] الفيديوهات (`videos.html`)
- [x] الموارد الخارجية (`resources.html`)
- [x] فضاء الأستاذ (`teacher-space.html`)
- [x] ليلة الامتحان (`exam-night.html`)
- [x] قاموس المصطلحات (`glossary.html`)
- [x] تتبع التقدم (`progress.html`)
- [x] نظام CSS كامل (`css/main.css`)
- [x] JavaScript (`js/app.js`)
- [x] بيانات الدروس (`data/lessons.json`)
- [x] ملف التشغيل (`netlify.toml`)
- [x] manifest + robots.txt

### دروس التاريخ (6/6) ✅
- [x] `lessons/history/nazisme.html`
- [x] `lessons/history/ww2.html`
- [x] `lessons/history/palestine.html`
- [x] `lessons/history/independence.html`
- [x] `lessons/history/moroccan-state.html`
- [x] `lessons/history/resistance.html`

### دروس الجغرافيا (6/6) ✅
- [x] `lessons/geography/usa.html`
- [x] `lessons/geography/japan.html`
- [x] `lessons/geography/russia.html`
- [x] `lessons/geography/egypt.html`
- [x] `lessons/geography/nigeria.html`
- [x] `lessons/geography/economic-phenomenon.html`

### دروس المواطنة (6/6) ✅
- [x] `lessons/citizenship/heritage.html`
- [x] `lessons/citizenship/natural-resources.html`
- [x] `lessons/citizenship/world-sharing.html`
- [x] `lessons/citizenship/religions-dialogue.html`
- [x] `lessons/citizenship/world-peace.html`
- [x] `lessons/citizenship/media-programs.html`

---

## المرحلة الثانية (مقترحة)

### تحسينات الأداء
- [ ] Service Worker كامل للعمل offline
- [ ] تحويل إلى PWA قابل للتثبيت

### تحسينات المحتوى
- [ ] إضافة صور إنفوغرافيا مصوّرة لكل درس
- [ ] تحديث بيانات JSON بمحتوى أغنى
- [ ] إضافة فيديوهات مدمجة بعد التحقق منها

### تحسينات التفاعل
- [ ] اختبار شامل بـ 50+ سؤال
- [ ] بطاقات حفظ (Flashcards) تفاعلية
- [ ] طباعة PDF تلقائية لكل درس

### ربط خارجي
- [ ] ربط مع Notion Database
- [ ] مزامنة التقدم عبر الأجهزة

---

## التقنية المستخدمة

| المكوّن | التقنية |
|---------|---------|
| Frontend | Static HTML + CSS + JS |
| التخزين | localStorage |
| النشر | Netlify |
| الخطوط | Google Fonts (Cairo) |
| الأيقونات | Unicode Emoji |

---

## قواعد لا تُكسر

1. لا Backend إلا بطلب صريح
2. لا تغيير ترتيب الدروس
3. لا حذف توقيع الأستاذ
4. لا كسر Netlify deploy
5. العربية RTL في كل مكان
