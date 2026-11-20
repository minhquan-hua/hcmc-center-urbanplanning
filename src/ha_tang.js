/* Sa bàn vùng, bước 2: hạ tầng vùng (metro, đường sắt, đường bộ, sân bay, cảng, khu đô thị, khu công nghiệp) */
(function () {
  'use strict';
  var S = window.SaBan;
  if (!S) return;
  var banDo = S.banDo;

  var THU_MUC = 'data/vung/';
  var NHOM = ['metro', 'đường sắt', 'đường bộ', 'sân bay', 'cảng', 'khu đô thị', 'khu công nghiệp'];
  var NHOM_SAT = ['metro', 'đường sắt'];
  var TRANG_THAI = ['đã hoàn thành', 'đang thi công', 'đã phê duyệt', 'đề xuất'];
  var MAU = {
    'đã hoàn thành': '#1b7a3d',
    'đang thi công': '#d9480f',
    'đã phê duyệt': '#1864ab',
    'đề xuất': '#862e9c'
  };
  var MA_CHU = {
    'metro': 'ht_metro', 'đường sắt': 'ht_duong_sat', 'đường bộ': 'ht_duong_bo', 'sân bay': 'ht_san_bay',
    'cảng': 'ht_cang', 'khu đô thị': 'ht_khu_do_thi', 'khu công nghiệp': 'ht_khu_cong_nghiep',
    'đã hoàn thành': 'tt_hoan_thanh', 'đang thi công': 'tt_thi_cong',
    'đã phê duyệt': 'ht_tt_phe_duyet', 'đề xuất': 'ht_tt_chu_truong'
  };
  var MAC_DINH = { 'đã phê duyệt': 'đã phê duyệt, chưa khởi công', 'đề xuất': 'chủ trương, quy hoạch' };
  var CAC_LOP = ['ht-vung', 'ht-vung-vien', 'ht-tuyen-nen', 'ht-tuyen', 'ht-tuyen-dut', 'ht-tuyen-sat',
                 'ht-diem', 'ht-nhan'];
  var LOP_NHAP = ['ht-diem', 'ht-tuyen-nen', 'ht-vung'];

  var ds = [];
  var theoMa = {};
  var hinh = null;
  var sanSang = false;
  var locNhom = {};
  var locTrangThai = {};
  var chiLongThanh = false;
  var dangChon = null;

  function t(ma, macDinh) { return S.chu(ma) || macDinh || ma; }
  function en() { return S.ngonNgu() === 'en'; }
  function ten(d) { return (en() && d.ten_en) ? d.ten_en : d.ten_vi; }
  function nhan(giaTri) { return t(MA_CHU[giaTri], MAC_DINH[giaTri] || giaTri); }
  function laSat(d) { return NHOM_SAT.indexOf(d.nhom) >= 0; }

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
      S.baoLoi('Không hiển thị được lớp hạ tầng vùng.', 'Could not display the regional infrastructure layer.');
    }
  }

  // ---------- Lớp bản đồ ----------
  function ganThuocTinh() {
    hinh.features.forEach(function (f) {
      var d = theoMa[f.properties.ma];
      if (!d) return;
      f.properties.trang_thai = d.trang_thai;
      f.properties.nhom = d.nhom;
      f.properties.sat = laSat(d);
      f.properties.ten = ten(d);
    });
    if (banDo.getSource('ha-tang')) banDo.getSource('ha-tang').setData(hinh);
  }

  function themLop() {
    var truoc = banDo.getLayer('vung-nhan') ? 'vung-nhan' : undefined;
    var mau = ['match', ['get', 'trang_thai']];
    TRANG_THAI.forEach(function (k) { mau.push(k, MAU[k]); });
    mau.push('#555555');
    var chon = ['boolean', ['feature-state', 'chon'], false];
    var xong = ['==', ['get', 'trang_thai'], 'đã hoàn thành'];
    var laTuyen = ['==', ['get', 'hinh'], 'tuyến'];
    var rong = ['interpolate', ['linear'], ['zoom'], 7, ['case', chon, 4, 2], 12, ['case', chon, 8, 4.5]];

    banDo.addSource('ha-tang', { type: 'geojson', data: hinh, promoteId: 'ma' });

    banDo.addLayer({ id: 'ht-vung', type: 'fill', source: 'ha-tang', filter: ['==', ['get', 'hinh'], 'vùng'],
      paint: { 'fill-color': mau, 'fill-opacity': ['case', chon, 0.55, 0.3] } }, truoc);
    banDo.addLayer({ id: 'ht-vung-vien', type: 'line', source: 'ha-tang', filter: ['==', ['get', 'hinh'], 'vùng'],
      paint: { 'line-color': mau, 'line-width': ['case', chon, 3, 1.5] } }, truoc);
    // nền trắng rộng: dễ nhấp và tách tuyến khỏi bản đồ nền
    banDo.addLayer({ id: 'ht-tuyen-nen', type: 'line', source: 'ha-tang', filter: laTuyen,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#ffffff', 'line-opacity': 0.85,
               'line-width': ['interpolate', ['linear'], ['zoom'], 7, ['case', chon, 7, 4], 12, ['case', chon, 13, 8]] } }, truoc);
    banDo.addLayer({ id: 'ht-tuyen', type: 'line', source: 'ha-tang', filter: ['all', laTuyen, xong],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': mau, 'line-width': rong } }, truoc);
    banDo.addLayer({ id: 'ht-tuyen-dut', type: 'line', source: 'ha-tang', filter: ['all', laTuyen, ['!', xong]],
      paint: { 'line-color': mau, 'line-width': rong, 'line-dasharray': [2, 1.4] } }, truoc);
    // metro và đường sắt: thêm vạch trắng ở giữa để phân biệt với đường bộ
    banDo.addLayer({ id: 'ht-tuyen-sat', type: 'line', source: 'ha-tang', filter: ['all', laTuyen, ['get', 'sat']],
      paint: { 'line-color': '#ffffff',
               'line-width': ['interpolate', ['linear'], ['zoom'], 7, 0.7, 12, 1.6],
               'line-dasharray': [3, 3] } }, truoc);
    banDo.addLayer({ id: 'ht-diem', type: 'circle', source: 'ha-tang', filter: ['==', ['get', 'hinh'], 'điểm'],
      paint: {
        'circle-radius': ['case', chon, 9, 6],
        'circle-color': ['case', ['get', 'so_do'], '#ffffff', mau],
        'circle-stroke-color': ['case', ['get', 'so_do'], mau, '#ffffff'],
        'circle-stroke-width': ['case', ['get', 'so_do'], 3, 2]
      } }, truoc);
    banDo.addLayer({ id: 'ht-nhan', type: 'symbol', source: 'ha-tang', filter: ['in', ['get', 'hinh'], ['literal', ['điểm', 'nhãn']]],
      minzoom: 8.5,
      layout: {
        'text-field': ['get', 'ten'],
        'text-font': ['Noto Sans Regular'],
        'text-size': 12,
        'text-anchor': ['case', ['==', ['get', 'hinh'], 'điểm'], 'top', 'center'],
        'text-offset': ['case', ['==', ['get', 'hinh'], 'điểm'], ['literal', [0, 0.7]], ['literal', [0, 0]]],
        'text-max-width': 9,
        'text-optional': true
      },
      paint: { 'text-color': '#16212c', 'text-halo-color': '#ffffff', 'text-halo-width': 1.6 } }, truoc);

    banDo.on('click', function (e) {
      if (S.tam() !== 'vung') return;
      var ma = trung(e.point);
      if (ma) chon_(ma); else boChon(true);
    });
    banDo.on('mousemove', function (e) {
      if (S.tam() !== 'vung') return;
      if (trung(e.point)) banDo.getCanvas().style.cursor = 'pointer';
    });
  }

  function trung(diem) {
    if (!sanSang || S.tam() !== 'vung') return null;
    var o = [[diem.x - 6, diem.y - 6], [diem.x + 6, diem.y + 6]];
    for (var i = 0; i < LOP_NHAP.length; i++) {
      var kq = banDo.queryRenderedFeatures(i < 2 ? o : diem, { layers: [LOP_NHAP[i]] });
      if (kq.length) return kq[0].properties.ma;
    }
    return null;
  }

  function duocHien(d) {
    return locNhom[d.nhom] && locTrangThai[d.trang_thai] && (!chiLongThanh || d.noi_long_thanh === 'có');
  }

  function capNhatHienThi() {
    var bat = S.tam() === 'vung';
    if (!bat) boChon();
    if (!sanSang) return;
    var hien = ds.filter(duocHien).map(function (d) { return d.ma; });
    var loc = ['in', ['get', 'ma'], ['literal', hien]];
    var goc = {
      'ht-vung': ['==', ['get', 'hinh'], 'vùng'], 'ht-vung-vien': ['==', ['get', 'hinh'], 'vùng'],
      'ht-tuyen-nen': ['==', ['get', 'hinh'], 'tuyến'],
      'ht-tuyen': ['all', ['==', ['get', 'hinh'], 'tuyến'], ['==', ['get', 'trang_thai'], 'đã hoàn thành']],
      'ht-tuyen-dut': ['all', ['==', ['get', 'hinh'], 'tuyến'], ['!=', ['get', 'trang_thai'], 'đã hoàn thành']],
      'ht-tuyen-sat': ['all', ['==', ['get', 'hinh'], 'tuyến'], ['get', 'sat']],
      'ht-diem': ['==', ['get', 'hinh'], 'điểm'], 'ht-nhan': ['in', ['get', 'hinh'], ['literal', ['điểm', 'nhãn']]]
    };
    CAC_LOP.forEach(function (id) {
      banDo.setLayoutProperty(id, 'visibility', bat ? 'visible' : 'none');
      banDo.setFilter(id, ['all', goc[id], loc]);
    });
    if (dangChon && hien.indexOf(dangChon) < 0) boChon();
  }

  // ---------- Bảng điều khiển ----------
  function veNutLoc(khung, cacGiaTri, trangThaiLoc, coMau) {
    khung.textContent = '';
    cacGiaTri.forEach(function (giaTri) {
      var so = ds.filter(function (d) { return (coMau ? d.trang_thai : d.nhom) === giaTri; }).length;
      if (!so) return;
      var nut = el('button', 'nut-loc');
      nut.type = 'button';
      nut.setAttribute('aria-pressed', trangThaiLoc[giaTri] ? 'true' : 'false');
      if (coMau) {
        var cham = el('span', 'cham');
        cham.style.background = MAU[giaTri];
        nut.appendChild(cham);
      }
      nut.appendChild(el('span', null, nhan(giaTri) + ' (' + so + ')'));
      nut.addEventListener('click', function () {
        trangThaiLoc[giaTri] = !trangThaiLoc[giaTri];
        veBang();
        capNhatHienThi();
      });
      khung.appendChild(nut);
    });
  }

  // Tóm tắt kết nối sân bay Long Thành, đếm từ dữ liệu
  function dongTomTat(tieuDe, cac) {
    var p = el('p', 'ht-tom-tat');
    p.appendChild(el('strong', null, tieuDe + ': ' + cac.length + ' ' + t('ht_tuyen', 'tuyến')));
    var phan = [];
    TRANG_THAI.forEach(function (k) {
      var so = cac.filter(function (d) { return d.trang_thai === k; }).length;
      if (so) phan.push(so + ' ' + nhan(k));
    });
    if (phan.length) p.appendChild(document.createTextNode(' (' + phan.join('; ') + ')'));
    return p;
  }

  function veLongThanh() {
    var khung = document.getElementById('ht-long-thanh');
    khung.textContent = '';
    var noi = ds.filter(function (d) { return d.noi_long_thanh === 'có'; });
    if (!noi.length) return;
    khung.appendChild(el('p', 'nhan-loc', t('ht_lt_tieu_de', 'Kết nối sân bay Long Thành - TP.HCM')));
    khung.appendChild(dongTomTat(t('ht_duong_bo_hoa', 'Đường bộ'),
      noi.filter(function (d) { return !laSat(d); })));
    khung.appendChild(dongTomTat(t('ht_duong_sat_hoa', 'Đường sắt và metro'), noi.filter(laSat)));
    var nut = el('button', 'nut-loc', t('ht_lt_chi_hien', 'Chỉ hiện các tuyến này'));
    nut.type = 'button';
    nut.setAttribute('aria-pressed', chiLongThanh ? 'true' : 'false');
    nut.addEventListener('click', function () {
      chiLongThanh = !chiLongThanh;
      veBang();
      capNhatHienThi();
    });
    khung.appendChild(nut);
  }

  function veBang() {
    veNutLoc(document.getElementById('ht-loc-nhom'), NHOM, locNhom, false);
    veNutLoc(document.getElementById('ht-loc-trang-thai'), TRANG_THAI, locTrangThai, true);
    veLongThanh();
    var coHinh = {};
    if (hinh) hinh.features.forEach(function (f) { coHinh[f.properties.ma] = true; });
    var khung = document.getElementById('ds-ha-tang');
    khung.textContent = '';
    var hien = ds.filter(duocHien);
    hien.forEach(function (d) {
      var li = el('li');
      var nut = el('button', 'muc-du-an');
      nut.type = 'button';
      var cham = el('span', 'cham');
      cham.style.background = MAU[d.trang_thai];
      nut.appendChild(cham);
      nut.appendChild(el('span', null, ten(d) + (coHinh[d.ma] ? '' : ' *')));
      nut.addEventListener('click', function () { chon_(d.ma, true); });
      li.appendChild(nut);
      khung.appendChild(li);
    });
    document.getElementById('ht-dem').textContent =
      t('ht_dang_hien', 'Đang hiện') + ' ' + hien.length + '/' + ds.length;
  }

  // ---------- Thẻ thông tin ----------
  // giuThe: không ẩn thẻ (khi lớp ranh giới vùng vừa mở thẻ của nó)
  function boChon(giuThe) {
    if (!dangChon) return;
    if (sanSang) banDo.setFeatureState({ source: 'ha-tang', id: dangChon }, { chon: false });
    dangChon = null;
    if (!(giuThe && S.vung && S.vung.dangChon())) document.getElementById('the').hidden = true;
  }

  function khungCua(ma) {
    var x1 = 999, y1 = 999, x2 = -999, y2 = -999;
    function them(c) {
      if (typeof c[0] === 'number') {
        if (c[0] < x1) x1 = c[0]; if (c[0] > x2) x2 = c[0];
        if (c[1] < y1) y1 = c[1]; if (c[1] > y2) y2 = c[1];
      } else c.forEach(them);
    }
    hinh.features.forEach(function (f) { if (f.properties.ma === ma) them(f.geometry.coordinates); });
    return x1 === 999 ? null : [[x1, y1], [x2, y2]];
  }

  function chon_(ma, bayToi) {
    if (!sanSang || !theoMa[ma]) return;
    if (S.vung) S.vung.boChon();
    boChon();
    dangChon = ma;
    banDo.setFeatureState({ source: 'ha-tang', id: ma }, { chon: true });
    veThe();
    document.getElementById('the').hidden = false;
    var hep = window.matchMedia('(max-width: 767px)').matches;
    if (hep) S.datBang(false);
    if (bayToi) {
      var k = khungCua(ma);
      // điện thoại: thẻ thông tin che nửa dưới màn hình nên dồn hình lên nửa trên
      var le = hep ? { top: 130, bottom: Math.round(window.innerHeight * 0.55), left: 40, right: 40 }
                   : { top: 120, bottom: 120, left: 380, right: 380 };
      if (k) banDo.fitBounds(k, { padding: le, maxZoom: 12.5, duration: 800 });
    }
  }

  function mucThe(nd, nhanChu, noiDung) {
    if (!noiDung) return;
    var dl = el('div', 'the-muc');
    dl.appendChild(el('h3', null, nhanChu));
    dl.appendChild(el('p', null, noiDung));
    nd.appendChild(dl);
  }

  function veThe() {
    var d = theoMa[dangChon];
    if (!d) return;
    var nd = document.getElementById('the-noi-dung');
    nd.textContent = '';
    nd.appendChild(el('p', 'the-loai', t('ht_ha_tang', 'Hạ tầng vùng') + ' · ' + nhan(d.nhom)));
    nd.appendChild(el('h2', null, ten(d)));
    var hang = el('p', 'the-hang-nhan');
    var tt = el('span', 'nhan-tt', nhan(d.trang_thai));
    tt.style.background = MAU[d.trang_thai];
    hang.appendChild(tt);
    hang.appendChild(el('span', 'nhan-kc ' + (d.da_kiem_chung === 'có' ? 'da' : 'can'),
      d.da_kiem_chung === 'có' ? t('da_kiem_chung', 'đã kiểm chứng') : t('can_kiem_chung', 'cần kiểm chứng')));
    nd.appendChild(hang);
    if (d.noi_long_thanh === 'có') {
      nd.appendChild(el('p', 'ghi-chu', t('ht_lt_thuoc', 'Thuộc nhóm kết nối sân bay Long Thành - TP.HCM.')));
    }
    mucThe(nd, t('moc_thoi_gian', 'Mốc thời gian'), S.cot(d, 'moc_thoi_gian'));
    mucThe(nd, t('mo_ta', 'Mô tả'), S.cot(d, 'mo_ta'));
    mucThe(nd, t('ht_luu_y', 'Lưu ý'), S.cot(d, 'ghi_chu'));

    nd.appendChild(el('h3', null, t('nguon', 'Nguồn')));
    var dsNguon = el('ul', 'ds-nguon');
    d.nguon.split('|').forEach(function (u) {
      u = u.trim();
      if (!u) return;
      var a = el('a', null, u.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]);
      a.href = u; a.target = '_blank'; a.rel = 'noopener';
      var li = el('li'); li.appendChild(a); dsNguon.appendChild(li);
    });
    nd.appendChild(dsNguon);

    var cac = hinh.features.filter(function (f) { return f.properties.ma === d.ma; });
    if (!cac.length) {
      nd.appendChild(el('p', 'ghi-chu canh-bao', t('ht_khong_hinh',
        'Chưa có hướng tuyến hay vị trí đáng tin để vẽ; chỉ hiện trong danh sách.')));
    } else if (cac[0].properties.so_do) {
      nd.appendChild(el('p', 'ghi-chu canh-bao', t('ht_so_do',
        'Chấm rỗng chỉ là vị trí sơ đồ cho biết khu vực; chưa có hướng tuyến hay ranh giới đáng tin để vẽ.')));
    } else {
      nd.appendChild(el('p', 'ghi-chu', t('ht_hinh_osm',
        'Hình vẽ lấy từ OpenStreetMap do cộng đồng vẽ; với công trình chưa xây đây là hướng tuyến hoặc ranh dự kiến, có thể khác thiết kế cuối cùng.')));
    }
    nd.appendChild(el('p', 'ghi-chu', t('ngay_cap_nhat', 'Cập nhật') + ': ' + d.ngay_cap_nhat));
  }

  // ---------- Khởi động ----------
  NHOM.forEach(function (k) { locNhom[k] = true; });
  TRANG_THAI.forEach(function (k) { locTrangThai[k] = true; });
  document.getElementById('the-dong').addEventListener('click', function () { boChon(); });
  S.khiDoiNgonNgu(function () {
    if (!ds.length) return;
    veBang();
    if (sanSang) { ganThuocTinh(); veThe(); }
  });
  S.khiDoiTam(capNhatHienThi);

  Promise.all([
    taiTep('ha_tang.csv', ['ma', 'ten_vi', 'ten_en', 'nhom', 'trang_thai', 'noi_long_thanh', 'moc_thoi_gian_vi',
                           'mo_ta_vi', 'nguon', 'ngay_cap_nhat', 'da_kiem_chung']),
    taiTep('ha_tang.geojson')
  ]).then(function (kq) {
    var sai = kq[0].filter(function (d) { return NHOM.indexOf(d.nhom) < 0 || TRANG_THAI.indexOf(d.trang_thai) < 0; });
    if (sai.length) {
      S.baoLoi('File ' + THU_MUC + 'ha_tang.csv có cột "nhom" hoặc "trang_thai" ghi sai ở: ' +
               sai.map(function (d) { return d.ten_vi || d.ma; }).join(', ') +
               '.\nCác mục này tạm không hiện. Hãy bấm đúp cap_nhat_du_lieu.bat để xem hướng dẫn sửa.',
               'ha_tang.csv has invalid "nhom" or "trang_thai" values; those rows are hidden.');
    }
    ds = kq[0].filter(function (d) { return sai.indexOf(d) < 0; });
    ds.forEach(function (d) { theoMa[d.ma] = d; });
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

  // Dùng cho tour: tô đậm nhiều mục cùng lúc (không mở thẻ) và bật/tắt chế độ chỉ hiện kết nối Long Thành
  var danhDauCu = [];
  function danhDau(dsMa) {
    if (!sanSang) return;
    danhDauCu.forEach(function (ma) { if (ma !== dangChon) banDo.setFeatureState({ source: 'ha-tang', id: ma }, { chon: false }); });
    danhDauCu = (dsMa || []).filter(function (ma) { return theoMa[ma]; });
    danhDauCu.forEach(function (ma) { banDo.setFeatureState({ source: 'ha-tang', id: ma }, { chon: true }); });
  }
  function datChiLongThanh(bat) {
    if (chiLongThanh === !!bat) return;
    chiLongThanh = !!bat;
    veBang();
    capNhatHienThi();
  }

  window.SaBan.haTang = {
    trung: trung, chon: chon_, boChon: boChon, danhDau: danhDau, datChiLongThanh: datChiLongThanh,
    dangChon: function () { return !!dangChon; }
  };
})();
