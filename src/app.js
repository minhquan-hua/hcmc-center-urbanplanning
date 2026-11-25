/* Sa bàn quy hoạch TP.HCM - giai đoạn 1: bản đồ nền 3D và khung giao diện */
(function () {
  'use strict';

  var TEP_CHU = 'data/ngon_ngu/giao_dien.csv';
  var NEN_BAN_DO = 'https://tiles.openfreemap.org/styles/liberty';

  // Góc nhìn ban đầu: sông Sài Gòn giữa Quận 1 cũ và Thủ Thiêm
  var GOC_NHIN_DAU = { center: [106.7135, 10.7790], zoom: 14.2, pitch: 55, bearing: -18 };
  // Giới hạn vùng xem: Quận 1, 3, 4, Bình Thạnh, Quận 2 cũ và vùng đệm
  var GIOI_HAN = [[106.62, 10.70], [106.83, 10.86]];
  var THU_NHO_NHAT = 11.5;
  // Tầm toàn vùng: TP.HCM sau sáp nhập, Đồng Nai, Tây Ninh (giới hạn rộng để thấy cả Côn Đảo)
  var KHUNG_VUNG = [[105.75, 10.25], [107.65, 12.05]];
  var GIOI_HAN_VUNG = [[104.6, 8.2], [108.8, 12.9]];
  var THU_NHO_NHAT_VUNG = 6.5;
  // Tầm Tây Nam Bộ: đủ thấy Tây Ninh mới ở phía bắc, Phú Quốc, Thổ Chu ở phía tây, Hòn Khoai ở phía nam
  var KHUNG_TNB = [[103.4, 8.35], [107.0, 11.8]];
  var GIOI_HAN_TNB = [[100.0, 4.0], [110.5, 16.0]]; // rộng theo chiều dọc để điện thoại vẫn thấy trọn vùng
  var THU_NHO_NHAT_TNB = 5.5;
  // Tầm Tây Nam Bộ đang làm dở: bản công khai tạm ẩn, chỉ hiện khi xem thử trên máy (localhost).
  // Khi đưa Tây Nam Bộ lên mạng (bước 5) thì đổi CONG_KHAI_TNB thành true.
  var CONG_KHAI_TNB = true;
  var HIEN_TNB = CONG_KHAI_TNB || /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  var CAC_TAM = HIEN_TNB ? ['trung-tam', 'vung', 'tay-nam-bo'] : ['trung-tam', 'vung'];
  if (!HIEN_TNB) {
    var nutTnb = document.querySelector('#chon-tam button[data-tam="tay-nam-bo"]');
    if (nutTnb) nutTnb.parentNode.removeChild(nutTnb);
  }
  // Các ô bật/tắt lớp chi tiết chỉ dùng ở tầm trung tâm
  var O_TRUNG_TAM = ['bat-3d', 'bat-hanh-chinh', 'bat-du-an', 'bat-giao-thong', 'bat-thuy'];

  var tuDien = {};
  var nguoiNghe = []; // các hàm được gọi lại mỗi khi đổi ngôn ngữ
  var tam = 'trung-tam'; // 'trung-tam', 'vung' hoặc 'tay-nam-bo'
  var nguoiNgheTam = [];
  var nhoO = {};         // trạng thái các ô lớp trung tâm trước khi rời tầm trung tâm
  // Mặc định tiếng Anh (chủ dự án chọn 20/11/2026); người xem bấm nút VI thì nhớ lựa chọn.
  // Khoá lưu đổi tên ('ngon_ngu_2') để lựa chọn cũ, lưu khi tiếng Việt còn là mặc định, không giữ lại.
  var KHOA_NGON_NGU = 'ngon_ngu_2';
  var ngonNgu = 'en';
  try { ngonNgu = localStorage.getItem(KHOA_NGON_NGU) === 'vi' ? 'vi' : 'en'; } catch (e) {}

  // ---------- Báo lỗi dễ hiểu ----------
  // Lỗi dữ liệu là việc của chủ dự án: khi xem tiếng Anh vẫn kèm bản tiếng Việt bên dưới
  function baoLoi(loiVi, loiEn) {
    var o = document.getElementById('bao-loi');
    o.textContent = ngonNgu === 'en' && loiEn ? loiEn + '\n\n' + loiVi : loiVi;
    o.hidden = false;
  }

  // ---------- Đọc file CSV (chịu được dấu phẩy trong ngoặc kép, file lưu từ Excel) ----------
  // docHang trả về các dòng dạng mảng (dòng đầu là tên cột); docCSV trả về mỗi dòng một đối tượng theo tên cột
  function docCSV(vanBan) {
    var dong = docHang(vanBan);
    if (!dong.length) return [];
    var cot = dong[0].map(function (x) { return x.trim(); });
    return dong.slice(1).map(function (d) {
      var muc = {};
      cot.forEach(function (ten, k) { muc[ten] = (d[k] || '').trim(); });
      return muc;
    });
  }

  function docHang(vanBan) {
    vanBan = vanBan.replace(/^﻿/, '');
    // Excel ở Việt Nam đôi khi lưu bằng dấu chấm phẩy thay cho dấu phẩy
    var dongDau = vanBan.split(/\r?\n/)[0] || '';
    var phanCach = (dongDau.split(';').length > dongDau.split(',').length) ? ';' : ',';
    var dong = [], o = [], chu = '', trongNgoac = false;
    for (var i = 0; i < vanBan.length; i++) {
      var c = vanBan[i];
      if (trongNgoac) {
        if (c === '"' && vanBan[i + 1] === '"') { chu += '"'; i++; }
        else if (c === '"') trongNgoac = false;
        else chu += c;
      } else if (c === '"') trongNgoac = true;
      else if (c === phanCach) { o.push(chu); chu = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && vanBan[i + 1] === '\n') i++;
        o.push(chu); chu = '';
        if (o.some(function (x) { return x.trim() !== ''; })) dong.push(o);
        o = [];
      } else chu += c;
    }
    o.push(chu);
    if (o.some(function (x) { return x.trim() !== ''; })) dong.push(o);
    return dong;
  }

  // ---------- Ngôn ngữ ----------
  function chu(ma) {
    var m = tuDien[ma];
    if (!m) return null;
    return (ngonNgu === 'en' && m.en) ? m.en : m.vi;
  }

  function apDungNgonNgu() {
    document.documentElement.lang = ngonNgu;
    document.querySelectorAll('[data-chu]').forEach(function (el) {
      var v = chu(el.getAttribute('data-chu'));
      if (v) el.textContent = v;
    });
    // Nhãn đọc cho trình đọc màn hình (aria-label)
    document.querySelectorAll('[data-chu-nhan]').forEach(function (el) {
      var v = chu(el.getAttribute('data-chu-nhan'));
      if (v) el.setAttribute('aria-label', v);
    });
    var tieuDe = chu('tieu_de');
    if (tieuDe) document.title = tieuDe;
    // Nút hiện ngôn ngữ sẽ chuyển sang
    document.getElementById('nut-ngon-ngu').textContent = ngonNgu === 'vi' ? 'EN' : 'VI';
    nguoiNghe.forEach(function (f) { f(ngonNgu); });
  }

  function taiChu() {
    return fetch(TEP_CHU)
      .then(function (r) {
        if (!r.ok) throw new Error('khong_tim_thay');
        return r.text();
      })
      .then(function (vb) {
        var ds = docCSV(vb);
        if (!ds.length || !('ma' in ds[0]) || !('vi' in ds[0])) throw new Error('sai_cot');
        ds.forEach(function (m) { if (m.ma) tuDien[m.ma] = m; });
        apDungNgonNgu();
      })
      .catch(function (e) {
        if (e.message === 'sai_cot') {
          baoLoi('File data/ngon_ngu/giao_dien.csv sai định dạng.\nDòng đầu tiên phải là: ma,vi,en',
                 'The file data/ngon_ngu/giao_dien.csv is malformed.\nIts first line must be: ma,vi,en');
        } else {
          baoLoi('Không đọc được file data/ngon_ngu/giao_dien.csv.\nHãy mở website bằng cách bấm đúp xem_thu.bat, không mở trực tiếp index.html.',
                 'Could not read data/ngon_ngu/giao_dien.csv.\nOpen the site by double-clicking xem_thu.bat, not index.html directly.');
        }
        apDungNgonNgu();
      });
  }

  // ---------- Bản đồ ----------
  if (!window.maplibregl) {
    baoLoi('Không tải được thư viện bản đồ. Hãy kiểm tra kết nối mạng rồi tải lại trang.',
           'Could not load the map library. Check your internet connection and reload.');
    taiChu();
    return;
  }

  var banDo = new maplibregl.Map({
    container: 'ban-do',
    style: NEN_BAN_DO,
    center: GOC_NHIN_DAU.center,
    zoom: GOC_NHIN_DAU.zoom,
    pitch: GOC_NHIN_DAU.pitch,
    bearing: GOC_NHIN_DAU.bearing,
    maxBounds: GIOI_HAN,
    minZoom: THU_NHO_NHAT,
    maxPitch: 70,
    attributionControl: { compact: true }
  });
  window.banDo = banDo; // để các giai đoạn sau và việc kiểm tra dùng lại

  banDo.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
  banDo.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

  // Bản đồ luôn khớp kích thước khung, kể cả khi xoay điện thoại
  if (window.ResizeObserver) {
    new ResizeObserver(function () { banDo.resize(); }).observe(document.getElementById('ban-do'));
  }

  var daBaoLoiNen = false;
  banDo.on('error', function (e) {
    // Chỉ báo khi chính bản mô tả nền chưa tải được; lỗi lẻ của từng ô bản đồ thì bỏ qua
    var coNen = false;
    try { coNen = !!(banDo.getStyle() && banDo.getStyle().layers.length); } catch (loi) {}
    if (daBaoLoiNen || coNen) return;
    daBaoLoiNen = true;
    console.error(e && e.error);
    baoLoi('Không tải được bản đồ nền. Hãy kiểm tra kết nối mạng rồi tải lại trang.',
           'Could not load the base map. Check your internet connection and reload.');
  });

  function lop3D() {
    return banDo.getStyle().layers.filter(function (l) { return l.type === 'fill-extrusion'; });
  }

  function bat3D(bat) {
    lop3D().forEach(function (l) {
      banDo.setLayoutProperty(l.id, 'visibility', bat ? 'visible' : 'none');
    });
  }

  var nenDaSanSang = false;
  banDo.on('load', function () {
    nenDaSanSang = true;
    // Bản đồ nền có rất nhiều nhãn "Khu phố ..." làm rối; ẩn bớt để nhãn phường và dự án dễ đọc
    try {
      var loc = banDo.getFilter('label_other');
      if (loc) banDo.setFilter('label_other',
        ['all', loc, ['!=', ['slice', ['to-string', ['get', 'name']], 0, 7], 'Khu phố']]);
    } catch (loi) { console.warn(loi); }
    bat3D(document.getElementById('bat-3d').checked);
  });

  // ---------- Nút bấm ----------
  document.getElementById('bat-3d').addEventListener('change', function (e) {
    if (nenDaSanSang) bat3D(e.target.checked);
  });

  function bayToiVung(thoiGian, khung) {
    banDo.setPadding({ top: 0, bottom: 0, left: 0, right: 0 });
    var rong = window.matchMedia('(min-width: 768px)').matches;
    banDo.fitBounds(khung || KHUNG_VUNG, {
      padding: rong ? { top: 70, bottom: 20, left: 340, right: 20 } : { top: 110, bottom: 60, left: 10, right: 10 },
      pitch: 0, bearing: 0, duration: thoiGian, essential: true
    });
  }

  document.getElementById('nut-ve-dau').addEventListener('click', function () {
    if (tam === 'vung') bayToiVung(1200);
    else if (tam === 'tay-nam-bo') bayToiVung(1200, KHUNG_TNB);
    else banDo.flyTo(Object.assign({ duration: 1200 }, GOC_NHIN_DAU));
  });

  // ---------- Chuyển tầm nhìn: Tây Nam Bộ / Toàn vùng / Trung tâm ----------
  function datO(id, bat) {
    var o = document.getElementById(id);
    if (o && o.checked !== bat) { o.checked = bat; o.dispatchEvent(new Event('change')); }
  }

  function datTam(moi) {
    if (moi === tam || CAC_TAM.indexOf(moi) < 0) return;
    var S = window.SaBan;
    // đang xem tour thì thoát tour trước
    if (S.tour && S.tour.trangThai().dangMo) S.tour.dong();
    ['hanhChinh', 'duAn', 'thuy', 'vung', 'haTang', 'tnb', 'htTnb'].forEach(function (k) { if (S[k] && S[k].boChon) S[k].boChon(); });
    document.getElementById('the').hidden = true;
    var cu = tam;
    tam = moi;
    document.body.classList.toggle('tam-vung', tam === 'vung');
    document.body.classList.toggle('tam-tnb', tam === 'tay-nam-bo');
    document.querySelectorAll('#chon-tam button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-tam') === tam));
    });
    // trong bảng lớp, mỗi khối có data-khoi chỉ hiện ở đúng tầm của nó
    document.querySelectorAll('#bang [data-khoi]').forEach(function (k) {
      k.hidden = k.getAttribute('data-khoi') !== tam;
    });
    banDo.stop();
    if (tam !== 'trung-tam') {
      // tắt các lớp chi tiết, nhớ lại để bật lại khi về trung tâm
      if (cu === 'trung-tam') {
        O_TRUNG_TAM.forEach(function (id) { nhoO[id] = document.getElementById(id).checked; datO(id, false); });
      }
      var laTnb = tam === 'tay-nam-bo';
      banDo.setMinZoom(laTnb ? THU_NHO_NHAT_TNB : THU_NHO_NHAT_VUNG);
      banDo.setMaxBounds(laTnb ? GIOI_HAN_TNB : GIOI_HAN_VUNG);
      bayToiVung(1500, laTnb ? KHUNG_TNB : KHUNG_VUNG);
    } else {
      O_TRUNG_TAM.forEach(function (id) { datO(id, !!nhoO[id]); });
      banDo.setPadding({ top: 0, bottom: 0, left: 0, right: 0 });
      banDo.flyTo(Object.assign({ duration: 1500, essential: true }, GOC_NHIN_DAU));
      banDo.once('moveend', function () {
        if (tam !== 'trung-tam') return;
        banDo.setMinZoom(THU_NHO_NHAT);
        banDo.setMaxBounds(GIOI_HAN);
      });
    }
    nguoiNgheTam.forEach(function (f) { f(tam); });
  }
  document.querySelectorAll('#chon-tam button').forEach(function (b) {
    b.addEventListener('click', function () { datTam(b.getAttribute('data-tam')); });
  });

  document.getElementById('nut-ngon-ngu').addEventListener('click', function () {
    ngonNgu = ngonNgu === 'vi' ? 'en' : 'vi';
    try { localStorage.setItem(KHOA_NGON_NGU, ngonNgu); } catch (e) {}
    apDungNgonNgu();
  });

  var bang = document.getElementById('bang');
  var nutBang = document.getElementById('nut-bang');
  function datBang(mo) {
    bang.classList.toggle('dong-lai', !mo);
    nutBang.setAttribute('aria-expanded', String(mo));
  }
  nutBang.addEventListener('click', function () {
    datBang(bang.classList.contains('dong-lai'));
  });
  // Trên điện thoại: thu bảng lại lúc đầu để thấy bản đồ
  if (window.matchMedia('(max-width: 767px)').matches) datBang(false);

  // Ba cụm trong bảng (Tour, Ranh giới, Hạ tầng), mỗi cụm mở/đóng riêng.
  // Laptop: mở sẵn cả ba; điện thoại: đóng cả ba cho gọn. Không nhớ sau khi tải lại trang.
  var cumDongLucDau = window.matchMedia('(max-width: 767px)').matches;
  document.querySelectorAll('#bang .cum-nut').forEach(function (nut) {
    var noiDung = document.getElementById(nut.getAttribute('aria-controls'));
    function datCum(mo) {
      nut.setAttribute('aria-expanded', String(mo));
      noiDung.hidden = !mo;
    }
    datCum(!cumDongLucDau);
    nut.addEventListener('click', function () { datCum(nut.getAttribute('aria-expanded') !== 'true'); });
  });

  var nutTrinhChieu = document.getElementById('nut-trinh-chieu');
  nutTrinhChieu.addEventListener('click', function () {
    var bat = document.documentElement.classList.toggle('trinh-chieu');
    nutTrinhChieu.setAttribute('aria-pressed', String(bat));
    datBang(!bat);
    setTimeout(function () { banDo.resize(); }, 50);
  });

  // ---------- Thẻ "Giới thiệu và nguồn dữ liệu" ----------
  function moGioiThieu() {
    var S = window.SaBan;
    ['hanhChinh', 'duAn', 'thuy', 'vung', 'haTang', 'tnb', 'htTnb'].forEach(function (k) { if (S[k] && S[k].boChon) S[k].boChon(); });
    var nd = document.getElementById('the-noi-dung');
    nd.textContent = '';
    function them(the, lop, ma, macDinh) {
      var e = document.createElement(the);
      if (lop) e.className = lop;
      e.textContent = chu(ma) || macDinh;
      nd.appendChild(e);
    }
    them('p', 'the-loai', 'gioi_thieu', 'Giới thiệu');
    them('h2', null, 'tieu_de', 'Sa bàn quy hoạch TP.HCM');
    them('p', null, 'gt_muc_dich', '');
    them('h3', null, 'gt_nguon_tieu_de', 'Nguồn dữ liệu');
    var ds = document.createElement('ul');
    ds.className = 'ds-nguon';
    ['gt_nguon_nen', 'gt_nguon_hanh_chinh', 'gt_nguon_du_an', 'gt_nguon_giao_thong', 'gt_nguon_vung', 'gt_nguon_tnb'].forEach(function (ma) {
      if (ma === 'gt_nguon_tnb' && !HIEN_TNB) return;
      var li = document.createElement('li');
      li.textContent = chu(ma) || ma;
      ds.appendChild(li);
    });
    nd.appendChild(ds);
    them('h3', null, 'gt_luu_y_tieu_de', 'Lưu ý khi sử dụng');
    var ds2 = document.createElement('ul');
    ds2.className = 'ds-nguon';
    ['gt_luu_y_ranh_gioi', 'gt_luu_y_kiem_chung', 'gt_luu_y_mo_phong'].forEach(function (ma) {
      var li = document.createElement('li');
      li.textContent = chu(ma) || ma;
      ds2.appendChild(li);
    });
    nd.appendChild(ds2);
    document.getElementById('the').hidden = false;
    if (window.matchMedia('(max-width: 767px)').matches) datBang(false);
  }
  document.getElementById('nut-gioi-thieu').addEventListener('click', moGioiThieu);
  document.getElementById('the-dong').addEventListener('click', function () {
    document.getElementById('the').hidden = true;
  });

  // Lấy chữ theo ngôn ngữ: cột "<goc>_en" khi xem tiếng Anh, nếu trống thì "<goc>_vi" (hoặc "<goc>")
  function cot(d, goc) {
    if (!d) return '';
    var vi = (goc + '_vi') in d ? d[goc + '_vi'] : d[goc];
    return (ngonNgu === 'en' && d[goc + '_en']) ? d[goc + '_en'] : (vi || '');
  }

  // Tên đơn vị hành chính cũ khi xem tiếng Anh: "Phường Bến Nghé" -> "Bến Nghé Ward", "Quận 1" -> "District 1"
  function tenHC(s) {
    if (!s || ngonNgu !== 'en') return s;
    var m;
    if ((m = /^Phường\s+(.+)$/.exec(s))) return /^\d/.test(m[1]) ? 'Ward ' + m[1] : m[1] + ' Ward';
    if ((m = /^Quận\s+(.+)$/.exec(s))) return /^\d/.test(m[1]) ? 'District ' + m[1] : m[1] + ' District';
    if ((m = /^Thành phố\s+(.+)$/.exec(s))) return m[1] + ' City';
    return s;
  }

  // Phần dùng chung cho các lớp bản đồ (src/hanh_chinh.js và các giai đoạn sau)
  window.SaBan = {
    cot: cot,
    tenHC: tenHC,
    banDo: banDo,
    docCSV: docCSV,
    docHang: docHang,
    chu: chu,
    baoLoi: baoLoi,
    datBang: datBang,
    ngonNgu: function () { return ngonNgu; },
    tam: function () { return tam; },
    datTam: datTam,
    // các tầm đang hiện trên website và khung giới hạn bản đồ của từng tầm
    cacTam: function () { return CAC_TAM.slice(); },
    gioiHanTam: function (t) { return t === 'vung' ? GIOI_HAN_VUNG : t === 'tay-nam-bo' ? GIOI_HAN_TNB : GIOI_HAN; },
    khiDoiTam: function (f) { nguoiNgheTam.push(f); },
    khiDoiNgonNgu: function (f) { nguoiNghe.push(f); },
    khiNenSanSang: function (f) { if (nenDaSanSang) f(); else banDo.once('load', f); }
  };

  taiChu();
})();
