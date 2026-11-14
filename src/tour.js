/* Giai đoạn 6: chế độ học - các tour dẫn từng bước kèm câu hỏi gợi mở */
(function () {
  'use strict';
  var S = window.SaBan;
  if (!S) return;
  var banDo = S.banDo;

  var THU_MUC = 'data/tour/';
  var O_CHON = { 'hanh-chinh': 'bat-hanh-chinh', 'du-an': 'bat-du-an', 'duong-bo': 'bat-giao-thong', 'thuy': 'bat-thuy' };

  var tour = [], buoc = {};       // buoc[ma tour] = các bước đã xếp thứ tự
  var dangMo = null, viTri = 0;

  function t(ma, macDinh) { return S.chu(ma) || macDinh || ma; }
  function en() { return S.ngonNgu() === 'en'; }
  function chu(d, cot) { return (en() && d[cot + '_en']) ? d[cot + '_en'] : d[cot + '_vi']; }
  function so(v, macDinh) { var x = parseFloat(String(v).replace(',', '.')); return isNaN(x) ? macDinh : x; }
  function el(the, lop, noiDung) {
    var e = document.createElement(the);
    if (lop) e.className = lop;
    if (noiDung != null) e.textContent = noiDung;
    return e;
  }

  function datO(id, bat) {
    var o = document.getElementById(id);
    if (o && o.checked !== bat) {
      o.checked = bat;
      o.dispatchEvent(new Event('change'));
    }
  }

  // ---------- Danh sách tour trong bảng lớp ----------
  function veDanhSach() {
    var ds = document.getElementById('ds-tour');
    ds.textContent = '';
    tour.forEach(function (d) {
      var nut = el('button', 'nut-tour');
      nut.type = 'button';
      nut.appendChild(el('strong', null, chu(d, 'ten')));
      nut.appendChild(el('span', null, chu(d, 'mo_ta')));
      nut.appendChild(el('em', null, (buoc[d.ma] || []).length + ' ' + t('tour_buoc', 'bước')));
      nut.addEventListener('click', function () { mo(d.ma); });
      ds.appendChild(nut);
    });
  }

  // ---------- Một bước ----------
  function apDung(b) {
    var cacLop = b.lop.split('|').map(function (x) { return x.trim(); });
    Object.keys(O_CHON).forEach(function (l) { datO(O_CHON[l], cacLop.indexOf(l) >= 0); });
    if (b.ky_hanh_chinh && S.hanhChinh) S.hanhChinh.datKy(b.ky_hanh_chinh);
    if (b.kich_ban && S.giaoThong) S.giaoThong.datKichBan(b.kich_ban);
    if (S.hanhChinh) S.hanhChinh.boChon();
    document.getElementById('the').hidden = true;
    banDo.flyTo({
      center: [so(b.kinh_do, 106.7135), so(b.vi_do, 10.779)],
      zoom: so(b.thu_phong, 14), pitch: so(b.nghieng, 0), bearing: so(b.xoay, 0),
      // chừa chỗ cho khung tour ở đáy màn hình để điểm đang nói tới không bị che
      padding: { top: 0, left: 0, right: 0, bottom: Math.round(window.innerHeight * 0.38) },
      duration: 1600, essential: true
    });
  }

  function ve() {
    var khung = document.getElementById('tour');
    if (!dangMo) { khung.hidden = true; document.body.classList.remove('dang-tour'); return; }
    var d = tour.filter(function (x) { return x.ma === dangMo; })[0];
    var ds = buoc[dangMo], b = ds[viTri];
    var nd = document.getElementById('tour-noi-dung');
    nd.textContent = '';
    nd.appendChild(el('p', 'the-loai', chu(d, 'ten') + ' · ' + (viTri + 1) + '/' + ds.length));
    nd.appendChild(el('h2', null, chu(b, 'tieu_de')));
    nd.appendChild(el('p', 'tour-loi-dan', chu(b, 'loi_dan')));
    var cauHoi = chu(b, 'cau_hoi');
    if (cauHoi) {
      var hop = el('div', 'tour-cau-hoi');
      hop.appendChild(el('strong', null, t('tour_cau_hoi', 'Câu hỏi gợi mở')));
      hop.appendChild(el('p', null, cauHoi));
      nd.appendChild(hop);
    }
    document.getElementById('tour-truoc').disabled = viTri === 0;
    document.getElementById('tour-tiep').textContent =
      viTri === ds.length - 1 ? t('tour_ket_thuc', 'Kết thúc') : t('tour_tiep', 'Tiếp');
    khung.hidden = false;
    khung.scrollTop = 0;
    document.body.classList.add('dang-tour');
  }

  function mo(ma) {
    if (!buoc[ma] || !buoc[ma].length) return;
    dangMo = ma;
    viTri = 0;
    S.datBang(false);
    apDung(buoc[ma][0]);
    ve();
  }

  function dong() {
    dangMo = null;
    ve();
    banDo.easeTo({ padding: { top: 0, left: 0, right: 0, bottom: 0 }, duration: 400 });
    if (!window.matchMedia('(max-width: 767px)').matches) S.datBang(true);
  }

  function di(buocNhay) {
    if (!dangMo) return;
    var moi = viTri + buocNhay;
    if (moi >= buoc[dangMo].length) { dong(); return; }
    if (moi < 0) return;
    viTri = moi;
    apDung(buoc[dangMo][viTri]);
    ve();
  }

  document.getElementById('tour-truoc').addEventListener('click', function () { di(-1); });
  document.getElementById('tour-tiep').addEventListener('click', function () { di(1); });
  document.getElementById('tour-thoat').addEventListener('click', dong);
  S.khiDoiNgonNgu(function () { veDanhSach(); ve(); });

  function taiCSV(tenTep, cot) {
    return fetch(THU_MUC + tenTep).then(function (r) {
      if (!r.ok) throw { tep: tenTep };
      return r.text();
    }).then(function (vb) {
      var ds = S.docCSV(vb);
      var thieu = cot.filter(function (c) { return !ds.length || !(c in ds[0]); });
      if (thieu.length) throw { tep: tenTep, cot: thieu };
      return ds;
    });
  }

  Promise.all([
    taiCSV('tour.csv', ['ma', 'ten_vi', 'mo_ta_vi']),
    taiCSV('buoc.csv', ['tour', 'thu_tu', 'tieu_de_vi', 'loi_dan_vi', 'cau_hoi_vi', 'kinh_do', 'vi_do', 'thu_phong', 'lop'])
  ]).then(function (kq) {
    tour = kq[0];
    kq[1].forEach(function (b) { (buoc[b.tour] = buoc[b.tour] || []).push(b); });
    Object.keys(buoc).forEach(function (k) {
      buoc[k].sort(function (a, b) { return so(a.thu_tu, 0) - so(b.thu_tu, 0); });
    });
    veDanhSach();
  }).catch(function (e) {
    console.error(e);
    var tep = THU_MUC + (e && e.tep ? e.tep : '');
    if (e && e.cot) S.baoLoi('File ' + tep + ' thiếu cột: ' + e.cot.join(', ') + '.', 'The file ' + tep + ' is missing columns: ' + e.cot.join(', ') + '.');
    else S.baoLoi('Không đọc được file ' + tep + ' nên chưa có tour nào.', 'Could not read ' + tep + ', so no tours are available.');
  });

  window.SaBan.tour = { mo: mo, dong: dong, di: di, trangThai: function () { return { dangMo: dangMo, viTri: viTri }; } };
})();
