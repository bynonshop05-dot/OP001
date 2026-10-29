/* ระบบเข้าสู่ระบบ + ตัวเชื่อมฐานข้อมูล สำหรับระบบการเงินโรงเรียน
 *
 * หน้าแอปเดิมเรียก window.claude.use('db' | 'downloads' | 'user')
 * ไฟล์นี้สร้าง window.claude ตัวแทน โดย:
 *   - 'db'        → รอจนผู้ใช้ login ด้วย Supabase Auth แล้วจึงคืนตัวเชื่อมฐานข้อมูล
 *                   (ตาราง sf_docs ใน Supabase; ถ้ายังไม่สร้างตาราง จะเก็บไว้ในเบราว์เซอร์แทน)
 *   - 'downloads' → ดาวน์โหลดไฟล์ผ่านเบราว์เซอร์
 *   - 'user'      → ผู้ที่ login แล้วบันทึกข้อมูลได้
 */
(() => {
  'use strict';
  const TABLE = 'sf_docs';
  const cfg = window.SUPABASE_CONFIG || {};
  const sb = cfg.url && cfg.anonKey && window.supabase
    ? window.supabase.createClient(cfg.url, cfg.anonKey)
    : null;

  /* ---------- หน้า login ---------- */
  const css = `
  .lg-ov{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;
    background:var(--bg,#fbf4f8);background-image:radial-gradient(900px 500px at 85% -10%,var(--brand-soft,#fbe1ee),transparent 70%)}
  .lg-card{width:100%;max-width:380px;background:var(--surface,#fff);border:1px solid var(--line,#edd6e2);border-radius:14px;
    box-shadow:var(--shadow);padding:28px 24px;display:flex;flex-direction:column;gap:14px}
  .lg-card h1{font-size:1.35rem;color:var(--brand,#a3125a)}
  .lg-card p{margin:0;color:var(--muted,#7b6372);font-size:.88rem}
  .lg-card label{display:flex;flex-direction:column;gap:5px;font-size:.88rem;font-weight:500}
  .lg-card .btn{width:100%;padding:10px 13px;font-size:.95rem}
  .lg-err{color:var(--neg,#c22a3c);font-size:.86rem;min-height:1.2em}
  .lg-err.ok{color:var(--pos,#157347)}
  .lg-link{background:none;border:0;padding:0;color:var(--info,#1c5fbd);cursor:pointer;font-size:.86rem;text-decoration:underline;align-self:center}
  .lg-user{display:inline-flex;align-items:center;gap:8px}
  .lg-note{background:var(--warn-soft,#fff3d6);color:var(--warn,#9a6200);border-radius:8px;padding:8px 12px;font-size:.86rem;margin-bottom:12px}
  `;
  const st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  let overlay = null;
  function showLogin(message) {
    if (overlay) return;
    overlay = document.createElement('div');
    overlay.className = 'lg-ov';
    overlay.innerHTML = `
      <form class="lg-card" autocomplete="on" novalidate>
        <h1>ระบบการเงินโรงเรียน</h1>
        <p>เข้าสู่ระบบด้วยอีเมลและรหัสผ่านที่ผู้ดูแลระบบสร้างให้</p>
        <label>อีเมล<input class="inp" type="email" name="email" autocomplete="username" required></label>
        <label>รหัสผ่าน<input class="inp" type="password" name="password" autocomplete="current-password" required></label>
        <div class="lg-err" role="alert"></div>
        <button type="submit" class="btn pri">เข้าสู่ระบบ</button>
        <button type="button" class="lg-link" data-forgot>ลืมรหัสผ่าน</button>
      </form>`;
    document.body.appendChild(overlay);
    const form = overlay.querySelector('form');
    const err = overlay.querySelector('.lg-err');
    const btn = form.querySelector('button[type=submit]');
    if (message) err.textContent = message;
    form.email.focus();

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const email = form.email.value.trim(), password = form.password.value;
      if (!email || !password) { err.textContent = 'กรอกอีเมลและรหัสผ่าน'; return; }
      if (!sb) { err.textContent = 'ยังไม่ได้ตั้งค่า Supabase ในไฟล์ config.js'; return; }
      btn.disabled = true; err.className = 'lg-err'; err.textContent = 'กำลังเข้าสู่ระบบ...';
      const { error } = await sb.auth.signInWithPassword({ email, password });
      btn.disabled = false;
      if (error) {
        err.textContent = /invalid/i.test(error.message) ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
          : /confirm/i.test(error.message) ? 'บัญชีนี้ยังไม่ได้ยืนยันอีเมล'
          : 'เข้าสู่ระบบไม่สำเร็จ: ' + error.message;
      }
      // สำเร็จ → onAuthStateChange จะปิดหน้านี้เอง
    });

    overlay.querySelector('[data-forgot]').addEventListener('click', async () => {
      const email = form.email.value.trim();
      if (!email) { err.className = 'lg-err'; err.textContent = 'กรอกอีเมลก่อน แล้วกด "ลืมรหัสผ่าน" อีกครั้ง'; form.email.focus(); return; }
      if (!sb) return;
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.href.split('#')[0] });
      err.className = error ? 'lg-err' : 'lg-err ok';
      err.textContent = error ? 'ส่งอีเมลไม่สำเร็จ: ' + error.message : 'ส่งลิงก์ตั้งรหัสผ่านใหม่ไปที่อีเมลแล้ว';
    });
  }
  function hideLogin() { if (overlay) { overlay.remove(); overlay = null; } }

  function showUserBar(user) {
    const meta = document.querySelector('.top .meta');
    if (!meta || meta.querySelector('.lg-user')) return;
    const box = document.createElement('span');
    box.className = 'lg-user';
    box.innerHTML = `<span></span><button type="button" class="btn sm">ออกจากระบบ</button>`;
    box.firstChild.textContent = user.email || '';
    box.querySelector('button').addEventListener('click', async () => {
      await sb.auth.signOut();
      location.reload();
    });
    meta.appendChild(box);
  }

  /* ---------- ตั้งรหัสผ่านใหม่ (มาจากลิงก์ในอีเมล) ---------- */
  async function askNewPassword() {
    const pw = prompt('ตั้งรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)');
    if (!pw) return;
    const { error } = await sb.auth.updateUser({ password: pw });
    alert(error ? 'ตั้งรหัสผ่านไม่สำเร็จ: ' + error.message : 'ตั้งรหัสผ่านใหม่แล้ว');
  }

  /* ---------- รอผู้ใช้ login ---------- */
  const userReady = new Promise(resolve => {
    if (!sb) {
      const start = () => showLogin('ยังไม่ได้ตั้งค่า Supabase ในไฟล์ config.js หรือโหลดไลบรารีไม่สำเร็จ');
      document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start) : start();
      return;
    }
    let done = false;
    const onUser = user => {
      if (done) return;
      done = true;
      hideLogin();
      const bar = () => showUserBar(user);
      document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', bar) : bar();
      resolve(user);
    };
    sb.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') setTimeout(askNewPassword, 0);
      if (session && session.user) onUser(session.user);
      else if (event === 'SIGNED_OUT' && done) location.reload();
    });
    sb.auth.getSession().then(({ data }) => {
      if (data.session) onUser(data.session.user);
      else {
        const start = () => { if (!done) showLogin(); };
        document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', start) : start();
      }
    });
  });

  /* ---------- ตัวเชื่อมฐานข้อมูลแบบ doc/collection ---------- */
  // เก็บทุกเอกสารในหน่วยความจำ แยกตาม collection แล้วแจ้งผู้ฟัง (onSnapshot) เมื่อมีการเปลี่ยนแปลง
  function makeStore(backend) {
    const cache = {};           // col -> Map(id -> data)
    const listeners = {};       // col -> Set(fn)
    let loaded = false;
    const colMap = c => (cache[c] = cache[c] || new Map());
    const emit = col => {
      if (!loaded) return;
      (listeners[col] || []).forEach(fn => fn(col));
    };
    const snapCol = col => ({
      docs: [...colMap(col).entries()].map(([id, d]) => ({ id, data: () => JSON.parse(JSON.stringify(d)) }))
    });
    const snapDoc = (col, id) => {
      const d = colMap(col).get(id);
      return { id, exists: d !== undefined, data: () => (d === undefined ? undefined : JSON.parse(JSON.stringify(d))) };
    };
    const listen = (col, fn) => {
      (listeners[col] = listeners[col] || new Set()).add(fn);
      if (loaded) fn(col);
      return () => listeners[col].delete(fn);
    };
    const docRef = (col, id) => ({
      async set(data) { await backend.set(col, id, data); colMap(col).set(id, data); emit(col); },
      async delete() { await backend.del(col, id); colMap(col).delete(id); emit(col); },
      async get() { return snapDoc(col, id); },
      onSnapshot(cb, onErr) { return listen(col, () => cb(snapDoc(col, id)), onErr); }
    });
    const api = {
      doc(path) { const [col, id] = String(path).split('/'); return docRef(col, id); },
      collection(col) {
        return {
          doc: id => docRef(col, id),
          onSnapshot(cb, onErr) { return listen(col, () => cb(snapCol(col)), onErr); }
        };
      }
    };
    return {
      api,
      load(rows) {
        rows.forEach(r => colMap(r.col).set(r.id, r.data));
        loaded = true;
        Object.keys(listeners).forEach(emit);
      },
      remote(col, id, data) { // การเปลี่ยนแปลงจากผู้ใช้คนอื่น (realtime)
        if (data === null) colMap(col).delete(id); else colMap(col).set(id, data);
        emit(col);
      }
    };
  }

  async function supabaseDb(user) {
    const rows = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await sb.from(TABLE).select('col,id,data').range(from, from + 999);
      if (error) throw error;
      rows.push(...data);
      if (data.length < 1000) break;
    }
    const store = makeStore({
      async set(col, id, data) {
        const { error } = await sb.from(TABLE).upsert({ col, id, data, updated_by: user.id, updated_at: new Date().toISOString() });
        if (error) throw { code: error.code || 'error', message: error.message };
      },
      async del(col, id) {
        const { error } = await sb.from(TABLE).delete().eq('col', col).eq('id', id);
        if (error) throw { code: error.code || 'error', message: error.message };
      }
    });
    store.load(rows);
    // ผู้ใช้หลายคนพร้อมกัน: อัปเดตหน้าจอเมื่อคนอื่นแก้ข้อมูล
    sb.channel('sf_docs_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: TABLE }, p => {
        if (p.eventType === 'DELETE') { if (p.old && p.old.col) store.remote(p.old.col, p.old.id, null); }
        else if (p.new) store.remote(p.new.col, p.new.id, p.new.data);
      })
      .subscribe();
    return store.api;
  }

  function localDb(user) {
    const key = 'school-finance:' + (user && user.id || 'guest');
    let all = {};
    try { all = JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) { all = {}; }
    const save = () => { try { localStorage.setItem(key, JSON.stringify(all)); } catch (e) { throw { code: 'storage-full' }; } };
    const store = makeStore({
      async set(col, id, data) { all[col + '/' + id] = data; save(); },
      async del(col, id) { delete all[col + '/' + id]; save(); }
    });
    store.load(Object.entries(all).map(([k, data]) => { const i = k.indexOf('/'); return { col: k.slice(0, i), id: k.slice(i + 1), data }; }));
    return store.api;
  }

  function notice(text) {
    const add = () => {
      const b = document.getElementById('banner');
      if (!b || !b.parentNode) return;
      const n = document.createElement('div');
      n.className = 'lg-note';
      n.textContent = text;
      b.parentNode.insertBefore(n, b);
    };
    document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', add) : add();
  }

  let dbPromise = null;
  const getDb = () => dbPromise = dbPromise || userReady.then(async user => {
    try {
      return await supabaseDb(user);
    } catch (e) {
      console.warn('Supabase table not available, using browser storage', e);
      notice('ยังไม่พบตาราง sf_docs ใน Supabase — ตอนนี้ข้อมูลถูกเก็บไว้ในเบราว์เซอร์เครื่องนี้เท่านั้น (ดูวิธีตั้งค่าใน DEPLOY.md)');
      return localDb(user);
    }
  });

  /* ---------- ดาวน์โหลดไฟล์ ---------- */
  const downloads = {
    async save({ filename, data }) {
      const blob = data instanceof Blob ? data : new Blob([data], { type: typeof data === 'string' ? 'text/html;charset=utf-8' : 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = filename || 'download';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
  };

  const userCap = { async can() { await userReady; return true; } };

  window.claude = {
    async use(name) {
      if (name === 'db') return getDb();
      if (name === 'downloads') return downloads;
      if (name === 'user') return userCap;
      return null;
    }
  };
})();
