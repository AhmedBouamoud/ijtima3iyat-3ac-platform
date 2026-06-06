/* ===================================================
   الاجتماعيات للجميع - التطبيق الرئيسي
   =================================================== */

'use strict';

/* ===== إدارة التقدم ===== */
const Progress = {
  KEY: 'ijtima3iyat_progress',

  getAll() {
    try { return JSON.parse(localStorage.getItem(this.KEY) || '{}'); }
    catch { return {}; }
  },

  save(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  markReviewed(lessonId) {
    const data = this.getAll();
    data[lessonId] = { reviewed: true, date: new Date().toISOString() };
    this.save(data);
    return data;
  },

  unmarkReviewed(lessonId) {
    const data = this.getAll();
    delete data[lessonId];
    this.save(data);
    return data;
  },

  isReviewed(lessonId) {
    return !!this.getAll()[lessonId];
  },

  getCount() {
    return Object.keys(this.getAll()).length;
  },

  getReviewedIds() {
    return Object.keys(this.getAll());
  },

  getByDomain(lessons) {
    const reviewed = this.getAll();
    const history = lessons.filter(l => l.domain === 'history' && reviewed[l.id]);
    const geography = lessons.filter(l => l.domain === 'geography' && reviewed[l.id]);
    const citizenship = lessons.filter(l => l.domain === 'citizenship' && reviewed[l.id]);
    return { history: history.length, geography: geography.length, citizenship: citizenship.length };
  }
};

/* ===== الاختبار التفاعلي ===== */
const Quiz = {
  current: 0,
  score: 0,
  answered: false,
  questions: [],
  container: null,

  init(containerId, questions) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    this.questions = questions;
    this.current = 0;
    this.score = 0;
    this.answered = false;
    this.render();
  },

  render() {
    if (this.current >= this.questions.length) {
      this.showResult();
      return;
    }
    const q = this.questions[this.current];
    const allQuestions = this.container.querySelectorAll('.quiz-question');
    allQuestions.forEach(el => el.classList.remove('active'));
    const qEl = this.container.querySelector(`[data-question="${this.current}"]`);
    if (qEl) {
      qEl.classList.add('active');
      this.answered = false;
      const fb = qEl.querySelector('.quiz-feedback');
      if (fb) { fb.style.display = 'none'; fb.className = 'quiz-feedback'; }
      qEl.querySelectorAll('.quiz-option').forEach(opt => {
        opt.classList.remove('selected', 'correct', 'wrong');
        opt.onclick = () => this.selectOption(opt, qEl);
      });
    }
    const progressEl = this.container.querySelector('.quiz-progress-text');
    if (progressEl) progressEl.textContent = `${this.current + 1} / ${this.questions.length}`;
  },

  selectOption(optEl, qEl) {
    if (this.answered) return;
    this.answered = true;
    const correct = optEl.dataset.correct === 'true';

    qEl.querySelectorAll('.quiz-option').forEach(opt => {
      opt.classList.remove('selected');
      if (opt.dataset.correct === 'true') opt.classList.add('correct');
    });

    if (correct) {
      optEl.classList.add('correct');
      this.score++;
    } else {
      optEl.classList.add('wrong');
    }

    const fb = qEl.querySelector('.quiz-feedback');
    if (fb) {
      fb.style.display = 'flex';
      fb.className = `quiz-feedback ${correct ? 'correct' : 'wrong'}`;
      fb.textContent = correct ? '✓ إجابة صحيحة!' : `✗ الإجابة الصحيحة: ${this.questions[this.current].explanation || ''}`;
    }
  },

  next() {
    if (!this.answered) {
      alert('الرجاء اختيار إجابة أولاً');
      return;
    }
    this.current++;
    this.render();
  },

  prev() {
    if (this.current > 0) { this.current--; this.render(); }
  },

  showResult() {
    const result = this.container.querySelector('.quiz-result');
    const body = this.container.querySelector('.quiz-body');
    const nav = this.container.querySelector('.quiz-nav');
    if (!result) return;
    if (body) body.style.display = 'none';
    if (nav) nav.style.display = 'none';
    result.style.display = 'block';

    const pct = Math.round((this.score / this.questions.length) * 100);
    const scoreEl = result.querySelector('.quiz-score');
    if (scoreEl) {
      scoreEl.textContent = `${this.score}/${this.questions.length}`;
      if (pct >= 80) scoreEl.className = 'quiz-score excellent';
      else if (pct >= 60) scoreEl.className = 'quiz-score good';
      else if (pct >= 40) scoreEl.className = 'quiz-score average';
      else scoreEl.className = 'quiz-score poor';
    }

    const msgEl = result.querySelector('.quiz-result-msg');
    if (msgEl) {
      if (pct >= 80) msgEl.textContent = 'ممتاز! أنت مستعد لهذا الدرس.';
      else if (pct >= 60) msgEl.textContent = 'جيد! راجع بعض النقاط لتثبيت المعلومات.';
      else if (pct >= 40) msgEl.textContent = 'حسن! أعد قراءة الدرس للتعمق أكثر.';
      else msgEl.textContent = 'راجع الدرس مجدداً. أنت قادر على التحسن!';
    }

    const pctEl = result.querySelector('.quiz-pct');
    if (pctEl) pctEl.textContent = `${pct}%`;
  },

  restart() {
    this.current = 0;
    this.score = 0;
    this.answered = false;
    const result = this.container.querySelector('.quiz-result');
    const body = this.container.querySelector('.quiz-body');
    const nav = this.container.querySelector('.quiz-nav');
    if (result) result.style.display = 'none';
    if (body) body.style.display = 'block';
    if (nav) nav.style.display = 'flex';
    this.render();
  }
};

/* ===== البحث ===== */
const Search = {
  init(inputId, cardsSelector) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      const cards = document.querySelectorAll(cardsSelector);
      cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = (!query || text.includes(query)) ? '' : 'none';
      });
    });
  }
};

/* ===== العد التنازلي ===== */
const Countdown = {
  init(targetDate, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const update = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = target - now;

      if (diff <= 0) {
        container.innerHTML = '<p style="color:var(--gold-light);font-weight:700;font-size:1.5rem;">الامتحان اليوم - وفقك الله! 🎓</p>';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const dEl = container.querySelector('.cd-days');
      const hEl = container.querySelector('.cd-hours');
      const mEl = container.querySelector('.cd-minutes');
      const sEl = container.querySelector('.cd-seconds');

      if (dEl) dEl.textContent = String(days).padStart(2, '0');
      if (hEl) hEl.textContent = String(hours).padStart(2, '0');
      if (mEl) mEl.textContent = String(minutes).padStart(2, '0');
      if (sEl) sEl.textContent = String(seconds).padStart(2, '0');
    };

    update();
    setInterval(update, 1000);
  }
};

/* ===== التنقل ===== */
const Nav = {
  init() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (hamburger && mobileMenu) {
      hamburger.addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
        hamburger.textContent = mobileMenu.classList.contains('open') ? '✕' : '☰';
      });

      document.addEventListener('click', (e) => {
        if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
          mobileMenu.classList.remove('open');
          hamburger.textContent = '☰';
        }
      });
    }

    const currentPath = window.location.pathname;
    document.querySelectorAll('.navbar-nav a, .mobile-menu a').forEach(link => {
      if (link.getAttribute('href') === currentPath ||
          (currentPath.includes(link.getAttribute('href')) && link.getAttribute('href') !== '/')) {
        link.classList.add('active');
      }
    });
  }
};

/* ===== زر المراجعة ===== */
function initReviewButton(lessonId) {
  const btn = document.getElementById('reviewBtn');
  if (!btn) return;

  const updateState = (reviewed) => {
    if (reviewed) {
      btn.classList.add('reviewed');
      btn.innerHTML = '<span class="btn-icon">✅</span> تمت المراجعة';
    } else {
      btn.classList.remove('reviewed');
      btn.innerHTML = '<span class="btn-icon">📖</span> وضع علامة "تمت المراجعة"';
    }
  };

  updateState(Progress.isReviewed(lessonId));

  btn.addEventListener('click', () => {
    if (Progress.isReviewed(lessonId)) {
      Progress.unmarkReviewed(lessonId);
      updateState(false);
    } else {
      Progress.markReviewed(lessonId);
      updateState(true);
      showToast('تم حفظ تقدمك! ✅');
    }
    updateProgressDisplay();
  });
}

/* ===== تحديث عرض التقدم ===== */
function updateProgressDisplay() {
  const count = Progress.getCount();
  const el = document.getElementById('progressCount');
  if (el) el.textContent = count;

  const total = 18;
  const pct = Math.round((count / total) * 100);
  const bar = document.getElementById('progressBar');
  if (bar) bar.style.width = `${pct}%`;

  const pctEl = document.getElementById('progressPercent');
  if (pctEl) pctEl.textContent = `${pct}%`;
}

/* ===== إشعار منبثق ===== */
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: ${type === 'success' ? 'var(--primary)' : '#E74C3C'};
    color: white;
    padding: 0.75rem 2rem;
    border-radius: 50px;
    font-family: var(--font-main);
    font-size: 0.95rem;
    font-weight: 600;
    z-index: 9999;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    animation: slideUp 0.3s ease;
  `;
  toast.textContent = message;

  const style = document.createElement('style');
  style.textContent = '@keyframes slideUp { from { transform: translateX(-50%) translateY(20px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }';
  document.head.appendChild(style);

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/* ===== تهيئة الفلاتر ===== */
function initFilters() {
  const tabs = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.lesson-card, .infographic-card, .video-card');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.className = 'filter-tab');
      const domain = tab.dataset.domain;
      tab.classList.add(domain ? `active-${domain}` : 'active-all');

      cards.forEach(card => {
        if (!domain || card.classList.contains(domain)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ===== تحديث حالة البطاقات ===== */
function updateCardReviewStatus() {
  const reviewed = Progress.getReviewedIds();
  document.querySelectorAll('.lesson-card[data-lesson-id]').forEach(card => {
    const id = card.dataset.lessonId;
    if (reviewed.includes(id)) {
      card.classList.add('reviewed');
    } else {
      card.classList.remove('reviewed');
    }
  });
}

/* ===== الطباعة ===== */
function printLesson() { window.print(); }

/* ===== تهيئة التطبيق ===== */
document.addEventListener('DOMContentLoaded', () => {
  Nav.init();
  initFilters();
  updateProgressDisplay();
  updateCardReviewStatus();
  Search.init('searchInput', '.lesson-card');
});

// ─── ملخص الأستاذ ─────────────────────────────────────────────────────────
const TeacherSummary = {
  async init() {
    const m = window.location.pathname.match(/\/lessons\/[^/]+\/([^/]+)\.html/);
    if (!m) return;
    const id = m[1];
    try {
      const res = await fetch('/data/summaries.json');
      if (!res.ok) return;
      const { summaries } = await res.json();
      const entry = summaries.find(s => s.id === id);
      if (!entry || !entry.driveUrl) return;

      const sidebar = document.querySelector('.lesson-sidebar');
      if (!sidebar) return;

      const card = document.createElement('div');
      card.className = 'sidebar-card';
      card.style.cssText = 'border: 2px solid var(--gold); overflow:hidden;';
      card.innerHTML = `
        <div class="sidebar-card-header" style="background:linear-gradient(135deg,var(--primary-dark),var(--primary)); color:white;">
          📄 ملخص الأستاذ
        </div>
        <div class="sidebar-card-body" style="text-align:center;">
          <a href="${entry.driveUrl}" target="_blank" rel="noopener noreferrer"
             class="btn btn-primary" style="width:100%; justify-content:center; margin-bottom:0.5rem;">
            ⬇️ تحميل الملخص
          </a>
          <p style="font-size:0.72rem; color:var(--text-muted); line-height:1.5; margin:0;">
            إعداد الأستاذ أحمد بوعمود<br>مؤسسة الحنان
          </p>
        </div>`;
      sidebar.insertBefore(card, sidebar.firstChild);
    } catch {}
  }
};

document.addEventListener('DOMContentLoaded', () => TeacherSummary.init());

// ─── Notion Sync ───────────────────────────────────────────────────────────
const NotionSync = {
  CACHE_KEY: 'notion_lessons_cache',
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes

  async fetchLessons() {
    const cached = this._getCache();
    if (cached) return cached;
    try {
      const res = await fetch('/.netlify/functions/notion-sync?type=lessons');
      if (!res.ok) return null;
      const data = await res.json();
      if (data.lessons?.length) {
        this._setCache(data.lessons);
        return data.lessons;
      }
    } catch {}
    return null;
  },

  _getCache() {
    try {
      const raw = sessionStorage.getItem(this.CACHE_KEY);
      if (!raw) return null;
      const { ts, data } = JSON.parse(raw);
      if (Date.now() - ts > this.CACHE_TTL) return null;
      return data;
    } catch { return null; }
  },

  _setCache(data) {
    try { sessionStorage.setItem(this.CACHE_KEY, JSON.stringify({ ts: Date.now(), data })); }
    catch {}
  },

  // Inject Notion content into a lesson page
  async injectLessonContent(lessonTitle) {
    const box = document.getElementById('notion-content');
    if (!box) return;
    const lessons = await this.fetchLessons();
    if (!lessons) return;
    const lesson = lessons.find(l =>
      l.id && lessonTitle && l.id.includes(lessonTitle.slice(0, 8))
    );
    if (!lesson) return;

    let html = '';
    if (lesson.idea)  html += `<div class="notion-block"><strong>💡 الفكرة العامة:</strong><p>${lesson.idea}</p></div>`;
    if (lesson.terms) html += `<div class="notion-block"><strong>📖 المصطلحات:</strong><p>${lesson.terms}</p></div>`;
    if (lesson.dates) html += `<div class="notion-block"><strong>📅 التواريخ:</strong><p>${lesson.dates}</p></div>`;
    if (lesson.teacherNote) html += `<div class="notion-block notion-teacher"><strong>👨‍🏫 ملاحظة الأستاذ:</strong><p>${lesson.teacherNote}</p></div>`;

    if (html) {
      box.innerHTML = `<div class="notion-sync-box">${html}</div>`;
      box.style.display = 'block';
    }
  },

  // Update exam date from Notion site-config
  async updateExamDate() {
    const el = document.getElementById('countdown');
    if (!el) return;
    try {
      const res = await fetch('/data/site-config.json');
      const cfg = await res.json();
      if (cfg.examDate) Countdown.init(cfg.examDate, 'countdown');
    } catch {}
  }
};
