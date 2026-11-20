/* Giai đoạn 3: lớp dự án quy hoạch và bộ lọc */
(function () {
  'use strict';
  var S = window.SaBan;
  if (!S) return;
  var banDo = S.banDo;

  var THU_MUC = 'data/du_an/';
  var LOAI = ['cầu', 'hầm', 'metro', 'đường', 'công viên', 'khu đô thị'];
  var TRANG_THAI = ['đã hoàn thành', 'đang thi công', 'đã phê duyệt', 'đề xuất'];
  var MAU = {
    'đã hoàn thành': '#1b7a3d',
    'đang thi công': '#d9480f',
    'đã phê duyệt': '#1864ab',
    'đề xuất': '#862e9c'
  };
  var MA_CHU = {
    'cầu': 'loai_cau', 'hầm': 'loai_ham', 'metro': 'loai_metro', 'đường': 'loai_duong',
    'công viên': 'loai_cong_vien', 'khu đô thị': 'loai_khu_do_thi',
    'đã hoàn thành': 'tt_hoan_thanh', 'đang thi công': 'tt_thi_cong',
    'đã phê duyệt': 'tt_phe_duyet', 'đề xuất': 'tt_de_xuat'
  };
  var CAC_LOP = ['da-vung', 'da-tuyen-nen', 'da-tuyen', 'da-tuyen-dut', 'da-diem', 'da-nhan'];

  var duAn = [];          // các dòng trong du_an.csv
  var theoMa = {};
  var hinh = null;        // GeoJSON
  var dangBat = true;
  var sanSang = false;
  var locLoai = {};       // loại -> đang hiện?
  var locTrangThai = {};
  var dangChon = null;

  function t(ma, macDinh) { return S.chu(ma) || macDinh || ma; }
  function en() { return S.ngonNgu() === 'en'; }
  function ten(d) { return (en() && d.ten_en) ? d.ten_en : d.ten_vi; }
  function nhan(giaTri) { return t(MA_CHU[giaTri], giaTri); }
  function el(the, lop, chu) {
    var e = document.createElement(the);
    if (lop) e.className = lop;
    if (chu != null) e.textContent = chu;
    return e;
  }

  // ---------- Tải dữ liệu ----------
  function taiTep(tenTep, cot) {
    return fetch(THU_MUC + tenTep).then(function (r) {
      if (!r.ok) throw { tep: tenTep, kieu: 'thieu' };
      return r.text();
    }).then(function (vb) {
      if (tenTep.slice(-4) === '.csv') {
        var ds = S.docCSV(vb);
        var thieu = cot.filter(function (c) { return !ds.length || !(c in ds[0]); });
        if (thieu.length) throw { tep: tenTep, kieu: 'cot', cot: thieu };
        return ds;
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
    } else if (e && (e.kieu === 'hong' || e.kieu === 'thieu')) {
      S.baoLoi('Không đọc được file ' + tep + '.\nHãy bấm đúp cap_nhat_du_lieu.bat để tạo lại.',
               'Could not read ' + tep + '. Run cap_nhat_du_lieu.bat to rebuild it.');
    } else {
      S.baoLoi('Không hiển thị được lớp dự án quy hoạch.', 'Could not display the planning projects layer.');
    }
  }

  // ---------- Bản đồ ----------
  function ganThuocTinh() {
    hinh.features.forEach(function (f) {
      var d = theoMa[f.properties.ma];
      f.properties.nhan = d ? ten(d) : f.properties.ma;
      f.properties.trang_thai = d ? d.trang_thai : '';
      f.properties.da_xay = d && d.trang_thai === 'đã hoàn thành';
    });
    if (banDo.getSource('du-an')) banDo.getSource('du-an').setData(hinh);
  }

  function mauTheoTrangThai() {
    var bt = ['match', ['get', 'trang_thai']];
    TRANG_THAI.forEach(function (k) { bt.push(k, MAU[k]); });
    bt.push('#555');
    return bt;
  }

  function themLop() {
    banDo.addSource('du-an', { type: 'geojson', data: hinh, generateId: true });
    banDo.addLayer({ id: 'da-vung', type: 'fill', source: 'du-an', filter: ['==', ['get', 'hinh'], 'vùng'],
      paint: { 'fill-color': mauTheoTrangThai(), 'fill-opacity': 0.45, 'fill-outline-color': '#ffffff' } });
    banDo.addLayer({ id: 'da-tuyen-nen', type: 'line', source: 'du-an', filter: ['==', ['get', 'hinh'], 'tuyến'],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#ffffff', 'line-width': ['interpolate', ['linear'], ['zoom'], 11, 5, 16, 11] } });
    banDo.addLayer({ id: 'da-tuyen', type: 'line', source: 'du-an',
      filter: ['all', ['==', ['get', 'hinh'], 'tuyến'], ['==', ['get', 'da_xay'], true]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': mauTheoTrangThai(), 'line-width': ['interpolate', ['linear'], ['zoom'], 11, 2.5, 16, 7] } });
    // công trình chưa xong vẽ nét đứt
    banDo.addLayer({ id: 'da-tuyen-dut', type: 'line', source: 'du-an',
      filter: ['all', ['==', ['get', 'hinh'], 'tuyến'], ['!=', ['get', 'da_xay'], true]],
      paint: { 'line-color': mauTheoTrangThai(), 'line-dasharray': [1.6, 1.1],
               'line-width': ['interpolate', ['linear'], ['zoom'], 11, 2.5, 16, 7] } });
    banDo.addLayer({ id: 'da-diem', type: 'circle', source: 'du-an', filter: ['==', ['get', 'hinh'], 'điểm'],
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 5, 16, 9],
        'circle-color': ['case', ['==', ['get', 'so_do'], true], '#ffffff', mauTheoTrangThai()],
        'circle-stroke-color': ['case', ['==', ['get', 'so_do'], true], mauTheoTrangThai(), '#ffffff'],
        'circle-stroke-width': ['case', ['==', ['get', 'so_do'], true], 3, 2]
      } });
    banDo.addLayer({ id: 'da-nhan', type: 'symbol', source: 'du-an', minzoom: 12.2,
      filter: ['==', ['get', 'hinh'], 'điểm'],
      layout: { 'text-field': ['get', 'nhan'], 'text-font': ['Noto Sans Bold'], 'text-size': 12,
                'text-offset': [0, 1.1], 'text-anchor': 'top', 'text-max-width': 9, 'text-optional': true },
      paint: { 'text-color': mauTheoTrangThai(), 'text-halo-color': '#ffffff', 'text-halo-width': 2 } });

    ['da-vung', 'da-tuyen-nen', 'da-diem'].forEach(function (id) {
      banDo.on('mouseenter', id, function () { banDo.getCanvas().style.cursor = 'pointer'; });
      banDo.on('mouseleave', id, function () { banDo.getCanvas().style.cursor = ''; });
    });
    banDo.on('click', function (e) {
      // nhấp trúng tuyến hay bến đường thủy thì để lớp đó xử lý
      if (S.thuy && S.thuy.trung(e.point)) { dangChon = null; return; }
      var ma = trung(e.point);
      if (ma) chon(ma, false);
      else if (dangChon) {
        dangChon = null;
        // nếu vừa nhấp vào một phường thì thẻ đang thuộc về lớp hành chính, đừng đóng
        if (!S.hanhChinh || !S.hanhChinh.dangChon()) document.getElementById('the').hidden = true;
      }
    });
  }

  // Dự án nằm dưới điểm nhấp (có nới rộng để dễ bấm trên điện thoại)
  function trung(diem) {
    if (!sanSang || !dangBat) return null;
    var r = 8;
    var o = [[diem.x - r, diem.y - r], [diem.x + r, diem.y + r]];
    // ưu tiên chấm của dự án, rồi mới tới tuyến và vùng (metro chạy ngầm dưới nhiều công trình khác)
    var kq = banDo.queryRenderedFeatures(o, { layers: ['da-diem'] });
    if (!kq.length) kq = banDo.queryRenderedFeatures(o, { layers: ['da-tuyen-nen', 'da-vung'] });
    return kq.length ? kq[0].properties.ma : null;
  }

  function hien(d) { return locLoai[d.loai] !== false && locTrangThai[d.trang_thai] !== false; }

  function capNhatHienThi() {
    if (!sanSang) return;
    var cacMa = duAn.filter(hien).map(function (d) { return d.ma; });
    var locMa = ['in', ['get', 'ma'], ['literal', cacMa]];
    var goc = {
      'da-vung': ['==', ['get', 'hinh'], 'vùng'],
      'da-tuyen-nen': ['==', ['get', 'hinh'], 'tuyến'],
      'da-tuyen': ['all', ['==', ['get', 'hinh'], 'tuyến'], ['==', ['get', 'da_xay'], true]],
      'da-tuyen-dut': ['all', ['==', ['get', 'hinh'], 'tuyến'], ['!=', ['get', 'da_xay'], true]],
      'da-diem': ['==', ['get', 'hinh'], 'điểm'],
      'da-nhan': ['==', ['get', 'hinh'], 'điểm']
    };
    CAC_LOP.forEach(function (id) {
      banDo.setFilter(id, ['all', goc[id], locMa]);
      banDo.setLayoutProperty(id, 'visibility', dangBat ? 'visible' : 'none');
    });
    if (dangChon && (!dangBat || !hien(theoMa[dangChon]))) boChon();
  }

  // ---------- Bảng điều khiển ----------
  function veNutLoc(khung, ds, trangThaiLoc, coMau) {
    khung.textContent = '';
    ds.forEach(function (giaTri) {
      var so = duAn.filter(function (d) { return (coMau ? d.trang_thai : d.loai) === giaTri; }).length;
      if (!so) return;
      var nut = el('button', 'nut-loc');
      nut.type = 'button';
      nut.setAttribute('aria-pressed', String(trangThaiLoc[giaTri] !== false));
      if (coMau) {
        var cham = el('span', 'cham');
        cham.style.background = MAU[giaTri];
        nut.appendChild(cham);
      }
      nut.appendChild(el('span', null, nhan(giaTri) + ' (' + so + ')'));
      nut.addEventListener('click', function () {
        trangThaiLoc[giaTri] = trangThaiLoc[giaTri] === false;
        veBang();
        capNhatHienThi();
      });
      khung.appendChild(nut);
    });
  }

  function veBang() {
    document.getElementById('khoi-du-an').hidden = !dangBat;
    veNutLoc(document.getElementById('loc-loai'), LOAI, locLoai, false);
    veNutLoc(document.getElementById('loc-trang-thai'), TRANG_THAI, locTrangThai, true);
    var ds = document.getElementById('ds-du-an');
    ds.textContent = '';
    var dangHien = duAn.filter(hien);
    dangHien.forEach(function (d) {
      var li = el('li');
      var nut = el('button', 'muc-du-an');
      nut.type = 'button';
      var cham = el('span', 'cham');
      cham.style.background = MAU[d.trang_thai];
      nut.appendChild(cham);
      nut.appendChild(el('span', null, ten(d)));
      nut.addEventListener('click', function () { chon(d.ma, true); });
      li.appendChild(nut);
      ds.appendChild(li);
    });
    document.getElementById('dem-du-an').textContent =
      t('dang_hien', 'Đang hiện') + ' ' + dangHien.length + '/' + duAn.length;
  }

  // ---------- Thẻ thông tin ----------
  function boChon() {
    dangChon = null;
    document.getElementById('the').hidden = true;
  }

  function khungCua(ma) {
    var b = [180, 90, -180, -90];
    hinh.features.forEach(function (f) {
      if (f.properties.ma !== ma) return;
      (function di(a) {
        if (typeof a[0] === 'number') {
          b[0] = Math.min(b[0], a[0]); b[1] = Math.min(b[1], a[1]);
          b[2] = Math.max(b[2], a[0]); b[3] = Math.max(b[3], a[1]);
        } else a.forEach(di);
      })(f.geometry.coordinates);
    });
    return b[0] > b[2] ? null : b;
  }

  function chon(ma, bayToi) {
    var d = theoMa[ma];
    if (!d) return;
    if (S.hanhChinh) S.hanhChinh.boChon();
    if (S.thuy) S.thuy.boChon();
    dangChon = ma;
    veThe();
    document.getElementById('the').hidden = false;
    if (window.matchMedia('(max-width: 767px)').matches) S.datBang(false);
    if (bayToi && sanSang) {
      var b = khungCua(ma);
      if (b) {
        // tuyến dài (metro) chỉ bay tới phần trong khu trung tâm
        var k = [[Math.max(b[0], 106.675), Math.max(b[1], 10.74)], [Math.min(b[2], 106.76), Math.min(b[3], 10.83)]];
        if (k[0][0] > k[1][0] || k[0][1] > k[1][1]) k = [[b[0], b[1]], [b[2], b[3]]];
        banDo.fitBounds(k, { padding: 90, duration: 900, maxZoom: 15.5 });
      }
    }
  }

  function dongTT(nhanChu, noiDung) {
    var dl = el('div', 'the-muc');
    dl.appendChild(el('h3', null, nhanChu));
    dl.appendChild(el('p', null, noiDung));
    return dl;
  }

  function veThe() {
    var d = theoMa[dangChon];
    if (!d) return;
    var nd = document.getElementById('the-noi-dung');
    nd.textContent = '';
    var dau = el('p', 'the-loai', t('du_an', 'Dự án') + ' · ' + nhan(d.loai));
    nd.appendChild(dau);
    nd.appendChild(el('h2', null, ten(d)));
    var tt = el('span', 'nhan-tt', nhan(d.trang_thai));
    tt.style.background = MAU[d.trang_thai];
    var hang = el('p', 'the-hang-nhan');
    hang.appendChild(tt);
    hang.appendChild(el('span', 'nhan-kc ' + (d.da_kiem_chung === 'có' ? 'da' : 'can'),
      d.da_kiem_chung === 'có' ? t('da_kiem_chung', 'đã kiểm chứng') : t('can_kiem_chung', 'cần kiểm chứng')));
    nd.appendChild(hang);

    if (d.moc_thoi_gian_vi) nd.appendChild(dongTT(t('moc_thoi_gian', 'Mốc thời gian'), S.cot(d, 'moc_thoi_gian')));
    if (d.mo_ta_vi) nd.appendChild(dongTT(t('mo_ta', 'Mô tả'), S.cot(d, 'mo_ta')));
    if (d.chu_dau_tu) nd.appendChild(dongTT(t('chu_dau_tu', 'Chủ đầu tư / nguồn vốn'), S.cot(d, 'chu_dau_tu')));
    if (d.van_ban) nd.appendChild(dongTT(t('van_ban', 'Văn bản'), S.cot(d, 'van_ban')));
    if (d.ghi_chu_vi) nd.appendChild(dongTT(t('luu_y', 'Lưu ý'), S.cot(d, 'ghi_chu')));

    nd.appendChild(el('h3', null, t('nguon', 'Nguồn')));
    var dsNguon = el('ul', 'ds-nguon');
    d.nguon.split('|').forEach(function (u) {
      u = u.trim();
      if (!/^https?:\/\//.test(u)) return;
      var a = el('a', null, u.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]);
      a.href = u; a.target = '_blank'; a.rel = 'noopener';
      var li = el('li'); li.appendChild(a); dsNguon.appendChild(li);
    });
    nd.appendChild(dsNguon);

    var coSoDo = hinh.features.some(function (f) { return f.properties.ma === d.ma && f.properties.so_do; });
    var coHinh = hinh.features.some(function (f) { return f.properties.ma === d.ma; });
    if (coSoDo) nd.appendChild(el('p', 'ghi-chu canh-bao', t('vi_tri_so_do',
      'Vị trí sơ đồ: chấm rỗng chỉ đánh dấu khu vực, không phải ranh giới hay vị trí chính xác.')));
    else if (coHinh) nd.appendChild(el('p', 'ghi-chu', t('hinh_tu_osm',
      'Hình dạng lấy từ OpenStreetMap; tuyến chưa xây là hướng tuyến dự kiến.')));
    else nd.appendChild(el('p', 'ghi-chu canh-bao', t('chua_co_vi_tri', 'Chưa có vị trí trên bản đồ.')));
    nd.appendChild(el('p', 'ghi-chu', t('ngay_cap_nhat', 'Cập nhật') + ': ' + d.ngay_cap_nhat));
  }

  // ---------- Khởi động ----------
  document.getElementById('bat-du-an').addEventListener('change', function (e) {
    dangBat = e.target.checked;
    veBang();
    capNhatHienThi();
  });
  document.getElementById('the-dong').addEventListener('click', function () { dangChon = null; });
  S.khiDoiNgonNgu(function () {
    if (!duAn.length) return;
    veBang();
    if (sanSang) ganThuocTinh();
    if (dangChon) veThe();
  });

  Promise.all([
    taiTep('du_an.csv', ['ma', 'ten_vi', 'ten_en', 'loai', 'trang_thai', 'moc_thoi_gian_vi', 'mo_ta_vi',
                          'nguon', 'ngay_cap_nhat', 'da_kiem_chung']),
    taiTep('du_an.geojson')
  ]).then(function (kq) {
    duAn = kq[0];
    duAn.forEach(function (d) { theoMa[d.ma] = d; });
    hinh = kq[1];
    veBang();
    S.khiNenSanSang(function () {
      try {
        ganThuocTinh();
        themLop();
        sanSang = true;
        capNhatHienThi();
      } catch (e) { baoLoiTai(e); }
    });
  }).catch(baoLoiTai);

  window.SaBan.duAn = {
    trung: trung,
    chon: chon,
    boChon: function () { dangChon = null; },
    dangChon: function () { return !!dangChon; }
  };
})();
