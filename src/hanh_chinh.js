/* Giai đoạn 2: lớp ranh giới hành chính Trước / Sau 2025 */
(function () {
  'use strict';
  var S = window.SaBan;
  if (!S) return;
  var banDo = S.banDo;

  var THU_MUC = 'data/hanh_chinh/';
  // Màu theo quận cũ, dùng chung cho cả hai thời kỳ để dễ so sánh
  var MAU = {
    'Quận 1': '#d1495b',
    'Quận 3': '#e09f1f',
    'Quận 4': '#00798c',
    'Quận Bình Thạnh': '#6a4c93',
    'Thành phố Thủ Đức': '#3a7d44'
  };
  var MAU_KHAC = '#7a8691';
  var MA_PHAN = { 'toàn bộ': 'phan_toan_bo', 'một phần': 'phan_mot_phan', 'phần còn lại': 'phan_con_lai' };
  var LOP = {
    sau: ['hc-moi-nen', 'hc-moi-vien', 'hc-moi-nhan'],
    truoc: ['hc-cu-nen', 'hc-cu-vien', 'hc-quan-vien', 'hc-cu-nhan']
  };

  var ky = 'sau';
  var dangBat = true;
  var sanSang = false;
  var phuongMoi = {};   // ma -> dòng trong phuong_moi.csv
  var gop = [];         // các dòng trong gop_phuong.csv
  var hinh = {};        // moi, cu, quan: GeoJSON
  var dangChon = null;  // { nguon, id }

  function t(ma, macDinh) { return S.chu(ma) || macDinh || ma; }
  function en() { return S.ngonNgu() === 'en'; }
  function tenMoi(p) { return (en() && p.ten_en) ? p.ten_en : ('Phường ' + p.ten_vi); }

  function el(the, lop, chu) {
    var e = document.createElement(the);
    if (lop) e.className = lop;
    if (chu != null) e.textContent = chu;
    return e;
  }

  // ---------- Tải dữ liệu ----------
  function taiTep(ten, cotBatBuoc) {
    return fetch(THU_MUC + ten).then(function (r) {
      if (!r.ok) throw { tep: ten, kieu: 'thieu' };
      return r.text();
    }).then(function (vb) {
      if (ten.slice(-4) === '.csv') {
        var ds = S.docCSV(vb);
        var thieu = cotBatBuoc.filter(function (c) { return !ds.length || !(c in ds[0]); });
        if (thieu.length) throw { tep: ten, kieu: 'cot', cot: thieu };
        return ds;
      }
      try { return JSON.parse(vb); } catch (e) { throw { tep: ten, kieu: 'hong' }; }
    });
  }

  function baoLoiTai(e) {
    console.error(e);
    var tep = THU_MUC + (e && e.tep ? e.tep : '');
    if (e && e.kieu === 'cot') {
      S.baoLoi('File ' + tep + ' thiếu cột: ' + e.cot.join(', ') + '.\nHãy kiểm tra dòng đầu tiên của file.',
               'The file ' + tep + ' is missing columns: ' + e.cot.join(', ') + '.');
    } else if (e && e.kieu === 'hong') {
      S.baoLoi('File ' + tep + ' bị hỏng.\nHãy bấm đúp cap_nhat_du_lieu.bat để tạo lại.',
               'The file ' + tep + ' is corrupted. Run cap_nhat_du_lieu.bat to rebuild it.');
    } else if (e && e.kieu === 'thieu') {
      S.baoLoi('Không tìm thấy file ' + tep + '.\nHãy bấm đúp cap_nhat_du_lieu.bat để tạo lại.',
               'Could not find ' + tep + '. Run cap_nhat_du_lieu.bat to rebuild it.');
    } else {
      S.baoLoi('Không hiển thị được lớp ranh giới hành chính.', 'Could not display the administrative layer.');
    }
  }

  // ---------- Nhãn trên bản đồ (đổi theo ngôn ngữ) ----------
  function ganNhan() {
    hinh.moi.features.forEach(function (f) {
      var p = phuongMoi[f.properties.ma];
      f.properties.nhan = p ? (en() && p.ten_en ? p.ten_en : p.ten_vi) : f.properties.ma;
      f.properties.khu_cu = p ? p.khu_cu : '';
    });
    hinh.cu.features.forEach(function (f) {
      f.properties.nhan = f.properties.ten.replace(/^Phường\s+/, function (m) {
        return /^Phường\s+\d/.test(f.properties.ten) ? 'P.' : '';
      });
    });
    if (banDo.getSource('hc-moi')) banDo.getSource('hc-moi').setData(hinh.moi);
    if (banDo.getSource('hc-cu')) banDo.getSource('hc-cu').setData(hinh.cu);
  }

  function bieuThucMau(thuocTinh) {
    var bt = ['match', ['get', thuocTinh]];
    Object.keys(MAU).forEach(function (k) { bt.push(k, MAU[k]); });
    bt.push(MAU_KHAC);
    return bt;
  }

  function themLop() {
    var duoi = banDo.getLayer('building-3d') ? 'building-3d' : undefined;
    var doDam = ['case', ['boolean', ['feature-state', 'chon'], false], 0.6, 0.3];

    banDo.addSource('hc-moi', { type: 'geojson', data: hinh.moi, promoteId: 'ma' });
    banDo.addSource('hc-cu', { type: 'geojson', data: hinh.cu, promoteId: 'ma' });
    banDo.addSource('hc-quan', { type: 'geojson', data: hinh.quan });

    banDo.addLayer({ id: 'hc-moi-nen', type: 'fill', source: 'hc-moi',
      paint: { 'fill-color': bieuThucMau('khu_cu'), 'fill-opacity': doDam } }, duoi);
    banDo.addLayer({ id: 'hc-cu-nen', type: 'fill', source: 'hc-cu',
      paint: { 'fill-color': bieuThucMau('quan_cu'), 'fill-opacity': doDam } }, duoi);
    banDo.addLayer({ id: 'hc-cu-vien', type: 'line', source: 'hc-cu',
      paint: { 'line-color': '#ffffff', 'line-width': 1.2 } }, duoi);
    banDo.addLayer({ id: 'hc-quan-vien', type: 'line', source: 'hc-quan',
      paint: { 'line-color': '#22313f', 'line-width': 2.6 } }, duoi);
    banDo.addLayer({ id: 'hc-moi-vien', type: 'line', source: 'hc-moi',
      paint: { 'line-color': '#22313f', 'line-width': 2.2 } }, duoi);

    var nhan = {
      'text-field': ['get', 'nhan'],
      'text-font': ['Noto Sans Bold'],
      'text-max-width': 7
    };
    banDo.addLayer({ id: 'hc-moi-nhan', type: 'symbol', source: 'hc-moi',
      layout: Object.assign({ 'text-size': ['interpolate', ['linear'], ['zoom'], 11.5, 11, 15, 16] }, nhan),
      paint: { 'text-color': '#16212c', 'text-halo-color': '#ffffff', 'text-halo-width': 2 } });
    banDo.addLayer({ id: 'hc-cu-nhan', type: 'symbol', source: 'hc-cu', minzoom: 12.8,
      layout: Object.assign({ 'text-size': ['interpolate', ['linear'], ['zoom'], 12.8, 10, 15.5, 14] }, nhan),
      paint: { 'text-color': '#16212c', 'text-halo-color': '#ffffff', 'text-halo-width': 1.8 } });

    ['hc-moi-nen', 'hc-cu-nen'].forEach(function (id) {
      banDo.on('mouseenter', id, function () { banDo.getCanvas().style.cursor = 'pointer'; });
      banDo.on('mouseleave', id, function () { banDo.getCanvas().style.cursor = ''; });
    });
    banDo.on('click', function (e) {
      if (!dangBat) return;
      // nhấp trúng một dự án thì để lớp dự án xử lý
      if (S.duAn && S.duAn.trung(e.point)) return;
      var lop = ky === 'sau' ? 'hc-moi-nen' : 'hc-cu-nen';
      var kq = banDo.queryRenderedFeatures(e.point, { layers: [lop] });
      if (kq.length) chon(ky === 'sau' ? 'hc-moi' : 'hc-cu', kq[0].properties.ma);
      else boChon();
    });
  }

  function capNhatHienThi() {
    if (!sanSang) return;
    ['sau', 'truoc'].forEach(function (k) {
      LOP[k].forEach(function (id) {
        banDo.setLayoutProperty(id, 'visibility', (dangBat && k === ky) ? 'visible' : 'none');
      });
    });
  }

  // ---------- Bảng điều khiển ----------
  function veBang() {
    document.getElementById('khoi-hanh-chinh').hidden = !dangBat;
    document.querySelectorAll('.chon-ky button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-ky') === ky));
    });
    document.getElementById('mo-ta-ky').textContent = ky === 'sau'
      ? t('mo_ta_sau', 'Phường mới từ 1/7/2025. Màu cho biết phường thuộc quận nào trước đây.')
      : t('mo_ta_truoc', 'Quận và phường trước 1/7/2025.');
    var ds = document.getElementById('chu-giai');
    ds.textContent = '';
    Object.keys(MAU).forEach(function (k) {
      var li = el('li');
      var o = el('span', 'o-mau');
      o.style.background = MAU[k];
      li.appendChild(o);
      li.appendChild(el('span', null, k));
      ds.appendChild(li);
    });
  }

  // ---------- Thẻ thông tin ----------
  function boChon() {
    if (dangChon) banDo.setFeatureState({ source: dangChon.nguon, id: dangChon.id }, { chon: false });
    dangChon = null;
    document.getElementById('the').hidden = true;
  }

  function chon(nguon, ma) {
    if (!sanSang) return;
    boChon();
    if (S.duAn) S.duAn.boChon();
    dangChon = { nguon: nguon, id: ma };
    banDo.setFeatureState({ source: nguon, id: ma }, { chon: true });
    veThe();
    document.getElementById('the').hidden = false;
    if (window.matchMedia('(max-width: 767px)').matches) S.datBang(false);
  }

  function khung(f) {
    var b = [180, 90, -180, -90];
    (function di(a) {
      if (typeof a[0] === 'number') {
        b[0] = Math.min(b[0], a[0]); b[1] = Math.min(b[1], a[1]);
        b[2] = Math.max(b[2], a[0]); b[3] = Math.max(b[3], a[1]);
      } else a.forEach(di);
    })(f.geometry.coordinates);
    return [[b[0], b[1]], [b[2], b[3]]];
  }

  function nhanKiemChung(giaTri) {
    var co = giaTri === 'có';
    return el('span', 'nhan-kc ' + (co ? 'da' : 'can'),
      co ? t('da_kiem_chung', 'đã kiểm chứng') : t('can_kiem_chung', 'cần kiểm chứng'));
  }

  function dong(nhan, noiDung) {
    var d = el('div', 'the-dong-tt');
    d.appendChild(el('span', 'the-nhan', nhan));
    if (typeof noiDung === 'string') d.appendChild(el('span', null, noiDung));
    else d.appendChild(noiDung);
    return d;
  }

  function veThe() {
    if (!dangChon) return;
    var nd = document.getElementById('the-noi-dung');
    nd.textContent = '';
    if (dangChon.nguon === 'hc-moi') veTheMoi(nd, phuongMoi[dangChon.id]);
    else veTheCu(nd, hinh.cu.features.filter(function (f) { return f.properties.ma === dangChon.id; })[0]);
  }

  function veTheMoi(nd, p) {
    if (!p) return;
    nd.appendChild(el('p', 'the-loai', t('loai_phuong_moi', 'Phường mới (từ 1/7/2025)')));
    nd.appendChild(el('h2', null, tenMoi(p)));
    nd.appendChild(dong(t('truoc_day_thuoc', 'Trước đây thuộc'), p.khu_cu));

    nd.appendChild(el('h3', null, t('gop_tu', 'Được gộp từ')));
    var ds = el('ul', 'ds-gop');
    gop.filter(function (g) { return g.phuong_moi === p.ma; }).forEach(function (g) {
      var li = el('li');
      var ten = /^Phường\s/.test(g.phuong_cu) ? g.phuong_cu : 'Phường ' + g.phuong_cu;
      li.appendChild(el('span', null, ten));
      li.appendChild(el('span', 'phan ' + (g.phan === 'toàn bộ' ? 'tron' : 'chia'), t(MA_PHAN[g.phan], g.phan)));
      if (g.ghi_chu && !en()) li.appendChild(el('small', null, g.ghi_chu));
      ds.appendChild(li);
    });
    nd.appendChild(ds);

    var ghiChu = (en() && p.ghi_chu_en) ? p.ghi_chu_en : p.ghi_chu_vi;
    if (ghiChu) nd.appendChild(el('p', 'the-ghi-chu', ghiChu));

    nd.appendChild(el('h3', null, t('nguon', 'Nguồn')));
    var a = el('a', null, t('can_cu', 'Nghị quyết 1685/NQ-UBTVQH15, Điều 1, khoản {khoan}').replace('{khoan}', p.khoan));
    a.href = p.nguon; a.target = '_blank'; a.rel = 'noopener';
    var dn = el('p', 'the-nguon'); dn.appendChild(a);
    nd.appendChild(dn);
    nd.appendChild(dong(t('thong_tin_gop', 'Thông tin gộp phường'), nhanKiemChung(p.da_kiem_chung)));
    nd.appendChild(dong(t('hinh_dang', 'Hình dạng ranh giới'), nhanKiemChung(p.hinh_dang_kiem_chung)));
    nd.appendChild(el('p', 'ghi-chu', t('ranh_gioi_tham_khao',
      'Ranh giới tham khảo từ OpenStreetMap, không phải địa giới pháp lý.')));
    nd.appendChild(el('p', 'ghi-chu', t('ngay_cap_nhat', 'Cập nhật') + ': ' + p.ngay_cap_nhat));
  }

  function veTheCu(nd, f) {
    if (!f) return;
    var tt = f.properties;
    nd.appendChild(el('p', 'the-loai', t('loai_phuong_cu', 'Phường cũ (trước 1/7/2025)')));
    nd.appendChild(el('h2', null, tt.ten));
    nd.appendChild(dong(t('thuoc', 'Thuộc'), tt.quan_cu));
    nd.appendChild(el('h3', null, t('nay_thuoc', 'Từ 1/7/2025 thuộc')));
    var ds = el('ul', 'ds-gop');
    gop.filter(function (g) {
      return g.quan_cu === tt.quan_cu &&
        g.phuong_cu.replace(/^Phường\s+/, '') === tt.ten.replace(/^Phường\s+/, '');
    }).forEach(function (g) {
      var p = phuongMoi[g.phuong_moi];
      if (!p) return;
      var li = el('li');
      var nut = el('button', 'nut-lien-ket', tenMoi(p));
      nut.type = 'button';
      nut.addEventListener('click', function () {
        datKy('sau');
        chon('hc-moi', p.ma);
        var fm = hinh.moi.features.filter(function (x) { return x.properties.ma === p.ma; })[0];
        if (fm) banDo.fitBounds(khung(fm), { padding: 80, duration: 900, maxZoom: 15 });
      });
      li.appendChild(nut);
      li.appendChild(el('span', 'phan ' + (g.phan === 'toàn bộ' ? 'tron' : 'chia'), t(MA_PHAN[g.phan], g.phan)));
      ds.appendChild(li);
    });
    nd.appendChild(ds);
    nd.appendChild(el('p', 'ghi-chu', t('ranh_gioi_cu_nguon',
      'Ranh giới cũ: bản lưu OpenStreetMap ngày 1/5/2025, chỉ để tham khảo.')));
  }

  function datKy(k) {
    if (k === ky) return;
    boChon();
    ky = k;
    veBang();
    capNhatHienThi();
  }

  // ---------- Khởi động ----------
  document.querySelectorAll('.chon-ky button').forEach(function (b) {
    b.addEventListener('click', function () { datKy(b.getAttribute('data-ky')); });
  });
  document.getElementById('bat-hanh-chinh').addEventListener('change', function (e) {
    dangBat = e.target.checked;
    if (!dangBat) boChon();
    veBang();
    capNhatHienThi();
  });
  document.getElementById('the-dong').addEventListener('click', boChon);
  S.khiDoiNgonNgu(function () {
    veBang();
    if (sanSang) { ganNhan(); veThe(); }
  });
  veBang();

  Promise.all([
    taiTep('phuong_moi.csv', ['ma', 'ten_vi', 'ten_en', 'khu_cu', 'khoan', 'nguon', 'ngay_cap_nhat',
                               'da_kiem_chung', 'hinh_dang_kiem_chung']),
    taiTep('gop_phuong.csv', ['phuong_moi', 'phuong_cu', 'quan_cu', 'phan']),
    taiTep('phuong_moi.geojson'),
    taiTep('phuong_cu.geojson'),
    taiTep('quan_cu.geojson')
  ]).then(function (kq) {
    kq[0].forEach(function (p) { phuongMoi[p.ma] = p; });
    gop = kq[1];
    hinh = { moi: kq[2], cu: kq[3], quan: kq[4] };
    S.khiNenSanSang(function () {
      try {
        ganNhan();
        themLop();
        sanSang = true;
        capNhatHienThi();
      } catch (e) { baoLoiTai(e); }
    });
  }).catch(baoLoiTai);

  window.SaBan.hanhChinh = {
    datKy: datKy, chon: chon, boChon: boChon,
    dangChon: function () { return !!dangChon; }
  };
})();
