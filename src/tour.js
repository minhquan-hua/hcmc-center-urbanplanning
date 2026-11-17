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
  var anChoThe = false;           // tour tạm ẩn khi người xem mở thẻ "Vì sao sáp nhập" từ trong tour

  // tour.csv cột "tam": "vung" = tour ở tầm Toàn vùng; để trống hoặc "trung-tam" = tầm Trung tâm
  function laVung(maTour) {
    var d = tour.filter(function (x) { return x.ma === maTour; })[0];
    return !!d && d.tam === 'vung';
  }
  function tachMa(chuoi) { return (chuoi || '').split('|').map(function (x) { return x.trim(); }).filter(Boolean); }

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
    var dsTT = document.getElementById('ds-tour'), dsVung = document.getElementById('ds-tour-vung');
    dsTT.textContent = '';
    if (dsVung) dsVung.textContent = '';
    tour.forEach(function (d) {
      var ds = d.tam === 'vung' ? dsVung : dsTT;
      if (!ds) return;
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
  function apDungVung(b) {
    var cacLop = tachMa(b.lop), dd = tachMa(b.danh_dau);
    if (S.haTang) { S.haTang.boChon(); S.haTang.datChiLongThanh(cacLop.indexOf('long-thanh') >= 0); S.haTang.danhDau(dd); }
    if (S.vung) { S.vung.boChon(); S.vung.danhDau(dd); }
    document.getElementById('the').hidden = true;
    var hep = window.matchMedia('(max-width: 767px)').matches;
    banDo.flyTo({
      center: [so(b.kinh_do, 106.85), so(b.vi_do, 10.85)],
      // điện thoại hẹp ngang: lùi ra một chút để thấy đủ vùng đang nói tới
      zoom: so(b.thu_phong, 8.5) - (hep ? 0.9 : 0), pitch: 0, bearing: 0,
      // chừa đúng chiều cao khung tour (đã vẽ trước khi bay) để vùng đang nói tới không bị che
      padding: { top: hep ? 40 : 60, left: 0, right: 0, bottom: chieuCaoTour() },
      duration: 1600, essential: true
    });
  }

  function chieuCaoTour() {
    var khung = document.getElementById('tour');
    var cao = khung.hidden ? 0 : window.innerHeight - khung.getBoundingClientRect().top;
    return Math.round(Math.min(Math.max(cao, window.innerHeight * 0.3), window.innerHeight * 0.6)) + 10;
  }

  function boTourVung() {
    if (S.haTang) { S.haTang.danhDau([]); S.haTang.datChiLongThanh(false); }
    if (S.vung) S.vung.danhDau([]);
  }

  function apDung(b) {
    if (laVung(b.tour)) { apDungVung(b); return; }
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
    if (b.nut === 'vi-sao' && S.viSao) {
      var nut = el('button', 'nut-phu nut-vi-sao tour-nut-the', t('tour_mo_vi_sao', 'Mở thẻ "Vì sao sáp nhập?"'));
      nut.type = 'button';
      nut.addEventListener('click', function () {
        S.viSao.mo();
        // ẩn tour cho thẻ khỏi bị che; đóng thẻ thì tour hiện lại
        anChoThe = true;
        khung.hidden = true;
      });
      nd.appendChild(nut);
    }
    document.getElementById('tour-truoc').disabled = viTri === 0;
    document.getElementById('tour-tiep').textContent =
      viTri === ds.length - 1 ? t('tour_ket_thuc', 'Kết thúc') : t('tour_tiep', 'Tiếp');
    anChoThe = false;
    khung.hidden = false;
    khung.scrollTop = 0;
    document.body.classList.add('dang-tour');
  }

  function mo(ma) {
    if (!buoc[ma] || !buoc[ma].length) return;
    var canTam = laVung(ma) ? 'vung' : 'trung-tam';
    if (S.tam && S.tam() !== canTam) S.datTam(canTam);
    dangMo = ma;
    viTri = 0;
    S.datBang(false);
    ve();
    apDung(buoc[ma][0]);
  }

  function dong() {
    if (dangMo && laVung(dangMo)) { boTourVung(); document.getElementById('the').hidden = true; }
    dangMo = null;
    anChoThe = false;
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
    ve();
    apDung(buoc[dangMo][viTri]);
  }

  document.getElementById('tour-truoc').addEventListener('click', function () { di(-1); });
  document.getElementById('tour-tiep').addEventListener('click', function () { di(1); });
  document.getElementById('tour-thoat').addEventListener('click', dong);
  // thẻ đóng lại (bằng nút × hay nhấp ra ngoài) thì hiện lại tour đang tạm ẩn
  new MutationObserver(function () {
    if (dangMo && anChoThe && document.getElementById('the').hidden) ve();
  }).observe(document.getElementById('the'), { attributes: true, attributeFilter: ['hidden'] });
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
