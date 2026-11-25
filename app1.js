const SB_URL = 'https://ypmrbbccpgsrulvhsrkn.supabase.co';
const SB_KEY = 'sb_publishable_rOYB_Y-z5JcJNnd1B3fTzg_Z3XbLoJI';
const sb = supabase.createClient(SB_URL, SB_KEY);
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ROLE = {admin:'Admin', dokter:'Dokter', asisten:'Asisten/Perawat', kasir:'Kasir'};

const umur = d => {
  if (!d) return '';
  const b = new Date(d), n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--;
  return a + ' th';
};

async function masuk() {
  $('loginErr').textContent = '';
  $('btnLogin').disabled = true;
  const { error } = await sb.auth.signInWithPassword({ email: $('em').value.trim(), password: $('pw').value });
  $('btnLogin').disabled = false;
  if (error) { $('loginErr').textContent = 'Email atau kata sandi salah.'; return; }
  await mulai();
}

async function mulai() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) { tampil(false); return; }
  const { data, error } = await sb.from('users').select('nama_lengkap,role_id,aktif').eq('id', session.user.id).maybeSingle();
  if (error  !data  !data.aktif) {
    await sb.auth.signOut();
    $('loginErr').textContent = 'Akun ini belum terdaftar atau tidak aktif. Hubungi admin.';
    tampil(false); return;
  }
  $('uNama').textContent = data.nama_lengkap;
  $('uRole').textContent = ROLE[data.role_id] || data.role_id;
  tampil(true);
  muatDaftar();
  setIdle();
}

function tampil(app) {
  $('vLogin').classList.toggle('hide', app);
  $('vApp').classList.toggle('hide', !app);
  if (!app) { $('pw').value = ''; }
}

async function keluar() { await sb.auth.signOut(); tampil(false); }

let idleT;
function setIdle() {
  clearTimeout(idleT);
  idleT = setTimeout(async () => { await keluar(); $('loginErr').textContent = 'Sesi berakhir karena tidak ada aktivitas.'; }, 15 * 60 * 1000);
}
['click','keydown','touchstart'].forEach(e => document.addEventListener(e, () => { if (!$('vApp').classList.contains('hide')) setIdle(); }));
