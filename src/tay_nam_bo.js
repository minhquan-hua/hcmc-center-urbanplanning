/* Sa bàn Tây Nam Bộ, bước 1: ranh giới tỉnh trước / sau sáp nhập và ba vị trí chiến lược */
(function () {
  'use strict';
  var S = window.SaBan;
  if (!S) return;
  var banDo = S.banDo;

  var TAM = 'tay-nam-bo';
  var THU_MUC = 'data/tay_nam_bo/';
  // Màu theo đơn vị sau sáp nhập; địa phương cũ dùng màu của đơn vị mà nó hợp vào
  var MAU = { 'can-tho': '#d1495b', 'an-giang': '#0b6e99', 'ca-mau': '#7b4fa0',
              'vinh-long': '#2a9d8f', 'dong-thap': '#3a7d44', 'tay-ninh': '#e09f1f' };
  var MAU_VIEN_CU = '#22313f';
  var MAU_DIEM = '#c92a2a';
  // Hướng đặt tên điểm so với chấm (để không đè tên tỉnh): left = bên phải chấm, right = bên trái, top = bên dưới
  var HUONG_NHAN = { 'phu-quoc': 'top', 'can-tho': 'right', 'hon-khoai': 'left' };
  var CAC_LOP = ['tnb-nen', 'tnb-vien', 'tnb-nhan', 'tnb-diem-vong', 'tnb-diem', 'tnb-diem-nhan'];

  var sanSang = false;
  var ky = 'sau';       // 'sau' hoặc 'truoc' sáp nhập
  var ds = [];          // các dòng trong tinh.csv
  var tinh = {};        // ma -> dòng
  var dsDiem = [];      // các dòng trong diem.csv
  var diem = {};
  var hinh = null;
  var nhanTinh = { type: 'FeatureCollection', features: [] };
  var hinhDiem = { type: 'FeatureCollection', features: [] };
  var dangChon = null;  // { loai: 'tinh' | 'diem', ma }

  function t(ma, macDinh) { return S.chu(ma) || macDinh || ma; }
  function en() { return S.ngonNgu() === 'en'; }
  function ten(v) { return (en() && v.ten_en) ? v.ten_en : v.ten_vi; }
  function nhan(v) { return (en() && v.nhan_en) ? v.nhan_en : (v.nhan_vi || v.ten_vi); }
  function laMoi(v) { return v.nhom === 'mới'; }
  function nhomKy() { return ky === 'sau' ? 'mới' : 'cũ'; }
  function mau(v) { return MAU[laMoi(v) ? v.ma : v.thuoc] || '#7a8691'; }
  function dienThoai() { return window.matchMedia('(max-width: 767px)').matches; }

  function el(the, lop, chu) {
    var e = document.createElement(the);
    if (lop) e.className = lop;
    if (chu != null) e.textContent = chu;
    return e;
  }

  // ---------- Tải dữ liệu ----------
  function taiTep(tenTep, cotBatBuoc) {
    return fetch(THU_MUC + tenTep).then(function (r) {
      if (!r.ok) throw { tep: tenTep, kieu: 'thieu' };
      return r.text();
    }).then(function (vb) {
      if (tenTep.slice(-4) === '.csv') {
        var kq = S.docCSV(vb);
        var thieu = cotBatBuoc.filter(function (c) { return !kq.length || !(c in kq[0]); });
        if (thieu.length) throw { tep: tenTep, kieu: 'cot', cot: thieu };
        return kq;
      }
      try { return JSON.parse(vb); } catch (e) { throw { tep: tenTep, kieu: 'hong' }; }
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
      S.baoLoi('Không hiển thị được bản đồ Tây Nam Bộ.', 'Could not display the Mekong Delta map.');
    }
  }

  // ---------- Lớp bản đồ ----------
  function ganNhan() {
    nhanTinh.features = hinh.features.filter(function (f) { return tinh[f.properties.ma]; }).map(function (f) {
      var v = tinh[f.properties.ma];
      return { type: 'Feature', properties: { ma: v.ma, nhom: v.nhom, nhan: nhan(v) },
               geometry: { type: 'Point', coordinates: f.properties.diem } };
    });
    hinhDiem.features = dsDiem.map(function (d) {
      return { type: 'Feature', id: d.ma, properties: { ma: d.ma, nhan: ten(d), huong: HUONG_NHAN[d.ma] || 'left' },
               geometry: { type: 'Point', coordinates: [parseFloat(d.kinh_do), parseFloat(d.vi_do)] } };
    });
    if (banDo.getSource('tnb-nhan')) banDo.getSource('tnb-nhan').setData(nhanTinh);
    if (banDo.getSource('tnb-diem')) banDo.getSource('tnb-diem').setData(hinhDiem);
  }

  function themLop() {
    // Như tầm vùng: ranh giới ven biển trên OpenStreetMap gồm cả mặt biển, nên tô DƯỚI lớp nước
    var duoi = banDo.getLayer('water') ? 'water' : undefined;
    var dangChonBT = ['boolean', ['feature-state', 'chon'], false];
    hinh.features.forEach(function (f) {
      var v = tinh[f.properties.ma];
      f.properties.mau = v ? mau(v) : '#7a8691';
    });
    banDo.addSource('tnb', { type: 'geojson', data: hinh, promoteId: 'ma' });
    banDo.addSource('tnb-nhan', { type: 'geojson', data: nhanTinh });
    banDo.addSource('tnb-diem', { type: 'geojson', data: hinhDiem, promoteId: 'ma' });

    banDo.addLayer({ id: 'tnb-nen', type: 'fill', source: 'tnb', filter: ['==', ['get', 'nhom'], 'mới'],
      paint: { 'fill-color': ['get', 'mau'], 'fill-opacity': ['case', dangChonBT, 0.5, 0.22] } }, duoi);
    banDo.addLayer({ id: 'tnb-vien', type: 'line', source: 'tnb', filter: ['==', ['get', 'nhom'], 'mới'],
      paint: { 'line-color': ['get', 'mau'], 'line-width': 2.2 } }, duoi);

    // Các lớp dưới đây nằm trên cùng
    banDo.addLayer({ id: 'tnb-nhan', type: 'symbol', source: 'tnb-nhan', filter: ['==', ['get', 'nhom'], 'mới'],
      layout: { 'text-field': ['get', 'nhan'], 'text-font': ['Noto Sans Bold'], 'text-size': 14,
                'text-max-width': 8, 'text-allow-overlap': true },
      paint: { 'text-color': '#16212c', 'text-halo-color': '#ffffff', 'text-halo-width': 2 } });
    banDo.addLayer({ id: 'tnb-diem-vong', type: 'circle', source: 'tnb-diem',
      paint: { 'circle-radius': ['case', ['boolean', ['feature-state', 'chon'], false], 17, 12],
               'circle-color': MAU_DIEM, 'circle-opacity': 0.18,
               'circle-stroke-color': MAU_DIEM, 'circle-stroke-width': 1.2 } });
    banDo.addLayer({ id: 'tnb-diem', type: 'circle', source: 'tnb-diem',
      paint: { 'circle-radius': 6.5, 'circle-color': MAU_DIEM,
               'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2 } });
    banDo.addLayer({ id: 'tnb-diem-nhan', type: 'symbol', source: 'tnb-diem',
      layout: { 'text-field': ['get', 'nhan'], 'text-font': ['Noto Sans Bold'], 'text-size': 13.5,
                'text-anchor': ['get', 'huong'],
                'text-offset': ['match', ['get', 'huong'], 'left', ['literal', [1.1, 0]], 'right', ['literal', [-1.1, 0]],
                                'top', ['literal', [0, 1.1]], ['literal', [0, -1.1]]],
                'text-max-width': 12,
                'text-allow-overlap': true },
      paint: { 'text-color': MAU_DIEM, 'text-halo-color': '#ffffff', 'text-halo-width': 2 } });

    banDo.on('click', function (e) {
      if (S.tam() !== TAM) return;
      var kq = trung(e.point);
      if (kq) chon(kq.loai, kq.ma); else boChon();
    });
    banDo.on('mousemove', function (e) {
      if (S.tam() !== TAM) return;
      banDo.getCanvas().style.cursor = trung(e.point) ? 'pointer' : '';
    });
    datKy(ky);
  }

  // Ưu tiên nhấp: điểm chiến lược > ranh giới; nhấp vào mặt nước thì không chọn tỉnh
  function trung(p) {
    if (!sanSang || S.tam() !== TAM) return null;
    var hop = [[p.x - 8, p.y - 8], [p.x + 8, p.y + 8]];
    var d = banDo.queryRenderedFeatures(hop, { layers: ['tnb-diem', 'tnb-diem-nhan'] });
    if (d.length) return { loai: 'diem', ma: d[0].properties.ma };
    if (banDo.getLayer('water') && banDo.queryRenderedFeatures(p, { layers: ['water'] }).length) return null;
    var kq = banDo.queryRenderedFeatures(p, { layers: ['tnb-nen'] });
    return kq.length ? { loai: 'tinh', ma: kq[0].properties.ma } : null;
  }

  function capNhatHienThi() {
    var bat = S.tam() === TAM;
    if (!bat) boChon();
    if (!sanSang) return;
    CAC_LOP.forEach(function (id) { banDo.setLayoutProperty(id, 'visibility', bat ? 'visible' : 'none'); });
  }

  // ---------- Trước / Sau sáp nhập ----------
  function datKy(moi) {
    ky = moi;
    document.querySelectorAll('#tnb-chon-ky button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-ky') === ky));
    });
    document.getElementById('tnb-mo-ta-ky').textContent = ky === 'sau'
      ? t('tnb_mo_ta_sau', 'Từ 1/7/2025: 6 đơn vị cấp tỉnh.')
      : t('tnb_mo_ta_truoc', 'Trước 1/7/2025: 14 đơn vị cấp tỉnh.');
    if (dangChon && dangChon.loai === 'tinh' && tinh[dangChon.ma] && tinh[dangChon.ma].nhom !== nhomKy()) boChon();
    veBang();
    if (!sanSang) return;
    var loc = ['==', ['get', 'nhom'], nhomKy()];
    banDo.setFilter('tnb-nen', loc);
    banDo.setFilter('tnb-nhan', loc);
    if (ky === 'sau') {
      banDo.setFilter('tnb-vien', loc);
      banDo.setPaintProperty('tnb-vien', 'line-color', ['get', 'mau']);
      banDo.setPaintProperty('tnb-vien', 'line-width', 2.2);
      banDo.setPaintProperty('tnb-nhan', 'text-color', '#16212c');
    } else {
      banDo.setFilter('tnb-vien', loc);
      banDo.setPaintProperty('tnb-vien', 'line-color', MAU_VIEN_CU);
      banDo.setPaintProperty('tnb-vien', 'line-width', 1.3);
      banDo.setPaintProperty('tnb-nhan', 'text-color', '#22313f');
    }
    banDo.setLayoutProperty('tnb-nhan', 'text-size', ky === 'sau' ? 14 : 12);
  }
  document.querySelectorAll('#tnb-chon-ky button').forEach(function (b) {
    b.addEventListener('click', function () { datKy(b.getAttribute('data-ky')); });
  });

  // ---------- Bảng điều khiển ----------
  function nutDs(chu, mauO, khiNhan, lopO) {
    var li = el('li');
    var nut = el('button', 'muc-du-an');
    nut.type = 'button';
    var o = el('span', lopO || 'o-mau');
    if (mauO) o.style.background = mauO;
    nut.appendChild(o);
    nut.appendChild(el('span', null, chu));
    nut.addEventListener('click', khiNhan);
    li.appendChild(nut);
    return li;
  }

  function veBang() {
    var khung = document.getElementById('ds-tnb');
    khung.textContent = '';
    ds.filter(function (v) { return v.nhom === nhomKy(); }).forEach(function (v) {
      khung.appendChild(nutDs(ten(v), mau(v), function () { chon('tinh', v.ma); }));
    });
    var khungDiem = document.getElementById('ds-tnb-diem');
    khungDiem.textContent = '';
    dsDiem.forEach(function (d) {
      khungDiem.appendChild(nutDs(ten(d), MAU_DIEM, function () { chon('diem', d.ma, true); }, 'o-mau o-diem'));
    });
  }

  // ---------- Thẻ thông tin ----------
  function datChon(bat) {
    if (!dangChon || !sanSang) return;
    banDo.setFeatureState({ source: dangChon.loai === 'tinh' ? 'tnb' : 'tnb-diem', id: dangChon.ma }, { chon: bat });
  }

  function boChon() {
    if (!dangChon) return;
    datChon(false);
    dangChon = null;
    document.getElementById('the').hidden = true;
  }

  function chon(loai, ma, bay) {
    if (!sanSang) return;
    var muc = loai === 'tinh' ? tinh[ma] : diem[ma];
    if (!muc) return;
    if (loai === 'tinh' && muc.nhom !== nhomKy()) datKy(laMoi(muc) ? 'sau' : 'truoc');
    boChon();
    dangChon = { loai: loai, ma: ma };
    datChon(true);
    veThe();
    var the = document.getElementById('the');
    the.hidden = false;
    the.scrollTop = 0;
    if (dienThoai()) S.datBang(false);
    if (bay && loai === 'diem') {
      banDo.easeTo({ center: [parseFloat(muc.kinh_do), parseFloat(muc.vi_do)],
                     zoom: Math.max(banDo.getZoom(), 7), duration: 900 });
    }
  }

  function lienKet(v) {
    var nut = el('button', 'nut-lien-ket', ten(v));
    nut.type = 'button';
    nut.addEventListener('click', function () { chon('tinh', v.ma); });
    return nut;
  }

  function dongNguon(nd, tenNguon, link) {
    if (!link) return;
    var a = el('a', null, tenNguon || link);
    a.href = link; a.target = '_blank'; a.rel = 'noopener';
    var p = el('p', 'the-nguon'); p.appendChild(a);
    nd.appendChild(p);
  }

  function nhanKiemChung(nd, nhanTrai, co) {
    var d = el('div', 'the-dong-tt');
    d.appendChild(el('span', 'the-nhan', nhanTrai));
    d.appendChild(el('span', 'nhan-kc ' + (co ? 'da' : 'can'),
      co ? t('da_kiem_chung', 'đã kiểm chứng') : t('can_kiem_chung', 'cần kiểm chứng')));
    nd.appendChild(d);
  }

  function veThe() {
    if (!dangChon) return;
    var nd = document.getElementById('the-noi-dung');
    nd.textContent = '';
    if (dangChon.loai === 'diem') {
      var d = diem[dangChon.ma];
      nd.appendChild(el('p', 'the-loai', t('tnb_loai_diem', 'Vị trí chiến lược')));
      nd.appendChild(el('h2', null, ten(d)));
      nd.appendChild(el('p', 'the-ghi-chu', (en() && d.mo_ta_en) ? d.mo_ta_en : d.mo_ta_vi));
      nd.appendChild(el('h3', null, t('nguon', 'Nguồn')));
      dongNguon(nd, d.nguon_ten, d.nguon);
      dongNguon(nd, d.nguon_2_ten, d.nguon_2);
      if (d.vi_tri) {
        nd.appendChild(el('h3', null, t('tnb_vi_tri', 'Vị trí trên bản đồ')));
        dongNguon(nd, d.vi_tri_ten, d.vi_tri);
      }
      nhanKiemChung(nd, t('tnb_loai_diem', 'Vị trí chiến lược'), d.da_kiem_chung === 'có');
      nd.appendChild(el('p', 'ghi-chu', t('ngay_cap_nhat', 'Cập nhật') + ': ' + d.ngay_cap_nhat));
      return;
    }
    var v = tinh[dangChon.ma];
    nd.appendChild(el('p', 'the-loai', laMoi(v)
      ? t('vung_loai_moi', 'Đơn vị cấp tỉnh hiện nay')
      : t('vung_loai_cu', 'Địa phương cũ (trước 1/7/2025)')));
    nd.appendChild(el('h2', null, ten(v)));
    var ghiChu = (en() && v.ghi_chu_en) ? v.ghi_chu_en : v.ghi_chu_vi;
    if (ghiChu) nd.appendChild(el('p', 'the-ghi-chu', ghiChu));
    var con = ds.filter(function (x) { return x.thuoc === v.ma; });
    if (con.length) {
      nd.appendChild(el('h3', null, t('vung_gop_tu', 'Được hợp nhất từ')));
      var ul = el('ul', 'ds-gop');
      con.forEach(function (x) { var li = el('li'); li.appendChild(lienKet(x)); ul.appendChild(li); });
      nd.appendChild(ul);
    }
    if (v.thuoc && tinh[v.thuoc]) {
      nd.appendChild(el('h3', null, t('vung_nay_thuoc', 'Từ 1/7/2025 thuộc')));
      var ul2 = el('ul', 'ds-gop');
      var li2 = el('li'); li2.appendChild(lienKet(tinh[v.thuoc])); ul2.appendChild(li2);
      nd.appendChild(ul2);
    }
    nd.appendChild(el('h3', null, t('nguon', 'Nguồn')));
    dongNguon(nd, v.nguon_ten, v.nguon);
    dongNguon(nd, v.nguon_2_ten, v.nguon_2);
    nhanKiemChung(nd, t('vung_thong_tin', 'Thông tin sáp nhập'), v.da_kiem_chung === 'có');
    nd.appendChild(el('p', 'ghi-chu', laMoi(v)
      ? t('tnb_ranh_gioi', 'Ranh giới tham khảo từ OpenStreetMap, không phải địa giới pháp lý.')
      : t('vung_ranh_gioi_cu', 'Ranh giới cũ: bản lưu OpenStreetMap ngày 1/5/2025, chỉ để tham khảo.')));
    nd.appendChild(el('p', 'ghi-chu', t('ngay_cap_nhat', 'Cập nhật') + ': ' + v.ngay_cap_nhat));
  }

  // ---------- Khởi động ----------
  document.getElementById('the-dong').addEventListener('click', boChon);
  S.khiDoiNgonNgu(function () {
    datKy(ky);
    if (sanSang) { ganNhan(); if (dangChon) veThe(); }
  });
  S.khiDoiTam(capNhatHienThi);

  Promise.all([
    taiTep('tinh.csv', ['ma', 'ten_vi', 'ten_en', 'nhom', 'thuoc', 'ghi_chu_vi', 'nguon_ten', 'nguon',
                        'ngay_cap_nhat', 'da_kiem_chung']),
    taiTep('tinh.geojson'),
    taiTep('diem.csv', ['ma', 'ten_vi', 'ten_en', 'kinh_do', 'vi_do', 'mo_ta_vi', 'nguon_ten', 'nguon',
                        'ngay_cap_nhat', 'da_kiem_chung'])
  ]).then(function (kq) {
    hinh = kq[1];
    var coHinh = {};
    hinh.features.forEach(function (f) { coHinh[f.properties.ma] = true; });
    var thieu = kq[0].filter(function (v) { return !coHinh[v.ma]; }).map(function (v) { return v.ten_vi; });
    if (thieu.length) {
      S.baoLoi('Chưa có ranh giới cho: ' + thieu.join(', ') + '.\nHãy bấm đúp cap_nhat_du_lieu.bat để tạo lại.',
               'No boundary yet for: ' + thieu.join(', ') + '. Run cap_nhat_du_lieu.bat to rebuild.');
    }
    ds = kq[0].filter(function (v) { return coHinh[v.ma]; });
    ds.forEach(function (v) { tinh[v.ma] = v; });
    var saiToaDo = [];
    dsDiem = kq[2].filter(function (d) {
      var ok = d.ma && isFinite(parseFloat(d.kinh_do)) && isFinite(parseFloat(d.vi_do));
      if (!ok) saiToaDo.push(d.ten_vi || d.ma);
      return ok;
    });
    if (saiToaDo.length) {
      S.baoLoi('File data/tay_nam_bo/diem.csv: tọa độ chưa đúng ở: ' + saiToaDo.join(', ') + '.\nKinh độ, vĩ độ phải là con số, dùng dấu chấm.',
               'data/tay_nam_bo/diem.csv: invalid coordinates for: ' + saiToaDo.join(', ') + '.');
    }
    dsDiem.forEach(function (d) { diem[d.ma] = d; });
    datKy(ky);
    S.khiNenSanSang(function () {
      try {
        ganNhan();
        sanSang = true;
        themLop();
        datKy(ky);
        capNhatHienThi();
      } catch (e) { baoLoiTai(e); }
    });
  }).catch(baoLoiTai);

  window.SaBan.tnb = {
    trung: trung, chon: chon, boChon: boChon, datKy: datKy,
    dangChon: function () { return !!dangChon; }
  };
})();
