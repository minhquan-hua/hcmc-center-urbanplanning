/* Sa bàn Tây Nam Bộ, bước 2: hạ tầng (cao tốc, đường ven biển, tàu phà, đường thủy, cảng bến, sân bay) */
(function () {
  'use strict';
  var S = window.SaBan;
  if (!S) return;
  var banDo = S.banDo;

  var TAM = 'tay-nam-bo';
  var THU_MUC = 'data/tay_nam_bo/';
  var NGUON = 'htt';
  var NHOM = ['cao tốc', 'đường bộ', 'tàu, phà', 'đường thủy', 'cảng, bến', 'sân bay'];
  var TRANG_THAI = ['đã hoàn thành', 'đang thi công', 'đã phê duyệt', 'đề xuất'];
  var MAU = {
    'đã hoàn thành': '#1b7a3d',
    'đang thi công': '#d9480f',
    'đã phê duyệt': '#1864ab',
    'đề xuất': '#862e9c'
  };
  var MA_CHU = {
    'cao tốc': 'htt_cao_toc', 'đường bộ': 'ht_duong_bo', 'tàu, phà': 'htt_tau_pha', 'đường thủy': 'htt_duong_thuy',
    'cảng, bến': 'htt_cang', 'sân bay': 'ht_san_bay',
    'đã hoàn thành': 'tt_hoan_thanh', 'đang thi công': 'tt_thi_cong', 'đã phê duyệt': 'tt_phe_duyet', 'đề xuất': 'tt_de_xuat'
  };
  var CAP = { A: 'htt_cap_a', B: 'htt_cap_b', C: 'htt_cap_c' };
  var CAC_LOP = ['htt-vung', 'htt-vung-vien', 'htt-tuyen-nen', 'htt-tuyen', 'htt-tuyen-dut', 'htt-tuyen-so-do',
                 'htt-diem', 'htt-nhan'];

  var ds = [];
  var theoMa = {};
  var hinh = null;
  var sanSang = false;
  var locNhom = {};
  var locTrangThai = {};
  var dangChon = null;

  function t(ma, macDinh) { return S.chu(ma) || macDinh || ma; }
  function en() { return S.ngonNgu() === 'en'; }
  function ten(d) { return (en() && d.ten_en) ? d.ten_en : d.ten_vi; }
  function cot(d, goc) { return (en() && d[goc + '_en']) ? d[goc + '_en'] : d[goc + '_vi']; }
  function nhan(giaTri) { return t(MA_CHU[giaTri], giaTri); }
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
      S.baoLoi('Không hiển thị được lớp hạ tầng Tây Nam Bộ.', 'Could not display the Mekong Delta infrastructure layer.');
    }
  }

  // ---------- Lớp bản đồ ----------
  function ganThuocTinh() {
    hinh.features.forEach(function (f) {
      var d = theoMa[f.properties.ma];
      if (!d) return;
      f.properties.trang_thai = d.trang_thai;
      f.properties.nhom = d.nhom;
      f.properties.ten = ten(d);
    });
    if (banDo.getSource(NGUON)) banDo.getSource(NGUON).setData(hinh);
  }

  var LA_TUYEN = ['==', ['get', 'hinh'], 'tuyến'];
  var XONG = ['==', ['get', 'trang_thai'], 'đã hoàn thành'];
  var SO_DO = ['boolean', ['get', 'so_do'], false];
  var GOC = {
    'htt-vung': ['==', ['get', 'hinh'], 'vùng'],
    'htt-vung-vien': ['==', ['get', 'hinh'], 'vùng'],
    'htt-tuyen-nen': ['all', LA_TUYEN, ['!', SO_DO]],
    'htt-tuyen': ['all', LA_TUYEN, ['!', SO_DO], XONG],
    'htt-tuyen-dut': ['all', LA_TUYEN, ['!', SO_DO], ['!', XONG]],
    'htt-tuyen-so-do': ['all', LA_TUYEN, SO_DO],
    'htt-diem': ['==', ['get', 'hinh'], 'điểm'],
    'htt-nhan': ['in', ['get', 'hinh'], ['literal', ['điểm', 'nhãn']]]
  };

  function themLop() {
    // nằm dưới các điểm chiến lược nhưng trên ranh giới tỉnh
    var truoc = banDo.getLayer('tnb-diem-vong') ? 'tnb-diem-vong' : undefined;
    var mau = ['match', ['get', 'trang_thai']];
    TRANG_THAI.forEach(function (k) { mau.push(k, MAU[k]); });
    mau.push('#555555');
    var chon = ['boolean', ['feature-state', 'chon'], false];
    var rong = ['interpolate', ['linear'], ['zoom'], 6, ['case', chon, 4, 2], 11, ['case', chon, 8, 4.5]];

    banDo.addSource(NGUON, { type: 'geojson', data: hinh, promoteId: 'ma' });
    banDo.addLayer({ id: 'htt-vung', type: 'fill', source: NGUON, filter: GOC['htt-vung'],
      paint: { 'fill-color': mau, 'fill-opacity': ['case', chon, 0.55, 0.3] } }, truoc);
    banDo.addLayer({ id: 'htt-vung-vien', type: 'line', source: NGUON, filter: GOC['htt-vung-vien'],
      paint: { 'line-color': mau, 'line-width': ['case', chon, 3, 1.5] } }, truoc);
    banDo.addLayer({ id: 'htt-tuyen-nen', type: 'line', source: NGUON, filter: GOC['htt-tuyen-nen'],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#ffffff', 'line-opacity': 0.85,
               'line-width': ['interpolate', ['linear'], ['zoom'], 6, ['case', chon, 7, 4], 11, ['case', chon, 13, 8]] } }, truoc);
    banDo.addLayer({ id: 'htt-tuyen', type: 'line', source: NGUON, filter: GOC['htt-tuyen'],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': mau, 'line-width': rong } }, truoc);
    banDo.addLayer({ id: 'htt-tuyen-dut', type: 'line', source: NGUON, filter: GOC['htt-tuyen-dut'],
      paint: { 'line-color': mau, 'line-width': rong, 'line-dasharray': [2, 1.4] } }, truoc);
    // tuyến sơ đồ (đường thủy): chuỗi chấm tròn
    banDo.addLayer({ id: 'htt-tuyen-so-do', type: 'line', source: NGUON, filter: GOC['htt-tuyen-so-do'],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': mau, 'line-width': ['interpolate', ['linear'], ['zoom'], 6, ['case', chon, 5, 3.5], 11, ['case', chon, 9, 6]],
               'line-dasharray': [0, 2] } }, truoc);
    banDo.addLayer({ id: 'htt-diem', type: 'circle', source: NGUON, filter: GOC['htt-diem'],
      paint: {
        'circle-radius': ['case', chon, 8, 5.5],
        'circle-color': ['case', SO_DO, '#ffffff', mau],
        'circle-stroke-color': ['case', SO_DO, mau, '#ffffff'],
        'circle-stroke-width': ['case', SO_DO, 3, 2]
      } }, truoc);
    banDo.addLayer({ id: 'htt-nhan', type: 'symbol', source: NGUON, filter: GOC['htt-nhan'],
      minzoom: 8,
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
  }

  // Ưu tiên nhấp trong tầm Tây Nam Bộ: hạ tầng > điểm chiến lược > ranh giới (tay_nam_bo.js hỏi hàm này trước)
  var LOP_NHAP = ['htt-diem', 'htt-tuyen-nen', 'htt-tuyen-so-do', 'htt-vung'];
  function trung(diem) {
    if (!sanSang || S.tam() !== TAM) return null;
    var o = [[diem.x - 6, diem.y - 6], [diem.x + 6, diem.y + 6]];
    for (var i = 0; i < LOP_NHAP.length; i++) {
      var kq = banDo.queryRenderedFeatures(i < 3 ? o : diem, { layers: [LOP_NHAP[i]] });
      if (kq.length) return kq[0].properties.ma;
    }
    return null;
  }

  // chỉ các chấm hạ tầng có vị trí thật (cảng, bến); chấm sơ đồ (rỗng) không tính
  function trungDiem(diem) {
    if (!sanSang || S.tam() !== TAM) return false;
    return banDo.queryRenderedFeatures([[diem.x - 6, diem.y - 6], [diem.x + 6, diem.y + 6]], { layers: ['htt-diem'] })
      .some(function (f) { return !f.properties.so_do; });
  }

  function duocHien(d) { return locNhom[d.nhom] && locTrangThai[d.trang_thai]; }

  function capNhatHienThi() {
    var bat = S.tam() === TAM;
    if (!bat) boChon();
    if (!sanSang) return;
    var hien = ds.filter(duocHien).map(function (d) { return d.ma; });
    var loc = ['in', ['get', 'ma'], ['literal', hien]];
    CAC_LOP.forEach(function (id) {
      banDo.setLayoutProperty(id, 'visibility', bat ? 'visible' : 'none');
      banDo.setFilter(id, ['all', GOC[id], loc]);
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

  function veBang() {
    veNutLoc(document.getElementById('htt-loc-nhom'), NHOM, locNhom, false);
    veNutLoc(document.getElementById('htt-loc-trang-thai'), TRANG_THAI, locTrangThai, true);
    var coHinh = {};
    if (hinh) hinh.features.forEach(function (f) { coHinh[f.properties.ma] = true; });
    var khung = document.getElementById('ds-htt');
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
    document.getElementById('htt-dem').textContent =
      t('ht_dang_hien', 'Đang hiện') + ' ' + hien.length + '/' + ds.length;
  }

  // ---------- Thẻ thông tin ----------
  function boChon() {
    if (!dangChon) return;
    if (sanSang) banDo.setFeatureState({ source: NGUON, id: dangChon }, { chon: false });
    dangChon = null;
    document.getElementById('the').hidden = true;
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
    if (S.tnb) S.tnb.boChon();
    boChon();
    dangChon = ma;
    banDo.setFeatureState({ source: NGUON, id: ma }, { chon: true });
    veThe();
    var the = document.getElementById('the');
    the.hidden = false;
    the.scrollTop = 0;
    var hep = dienThoai();
    if (hep) S.datBang(false);
    if (bayToi) {
      var k = khungCua(ma);
      // điện thoại: thẻ thông tin che nửa dưới màn hình nên dồn hình lên nửa trên
      var le = hep ? { top: 130, bottom: Math.round(window.innerHeight * 0.55), left: 40, right: 40 }
                   : { top: 120, bottom: 120, left: 380, right: 380 };
      if (k) banDo.fitBounds(k, { padding: le, maxZoom: 11, duration: 800 });
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
    nd.appendChild(el('p', 'the-loai', t('htt_ha_tang', 'Hạ tầng Tây Nam Bộ') + ' · ' + nhan(d.nhom)));
    nd.appendChild(el('h2', null, ten(d)));
    var hang = el('p', 'the-hang-nhan');
    var tt = el('span', 'nhan-tt', nhan(d.trang_thai));
    tt.style.background = MAU[d.trang_thai];
    hang.appendChild(tt);
    hang.appendChild(el('span', 'nhan-kc ' + (d.da_kiem_chung === 'có' ? 'da' : 'can'),
      d.da_kiem_chung === 'có' ? t('da_kiem_chung', 'đã kiểm chứng') : t('can_kiem_chung', 'cần kiểm chứng')));
    nd.appendChild(hang);
    mucThe(nd, t('moc_thoi_gian', 'Mốc thời gian'), cot(d, 'moc_thoi_gian'));
    mucThe(nd, t('mo_ta', 'Mô tả'), cot(d, 'mo_ta'));
    mucThe(nd, t('ht_luu_y', 'Lưu ý'), cot(d, 'ghi_chu'));

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
    if (CAP[d.cap_tin_cay]) {
      nd.appendChild(el('p', 'ghi-chu', t('htt_cap', 'Cấp tin cậy nguồn') + ': ' + t(CAP[d.cap_tin_cay], d.cap_tin_cay)));
    }

    var cac = hinh.features.filter(function (f) { return f.properties.ma === d.ma; });
    if (!cac.length) {
      nd.appendChild(el('p', 'ghi-chu canh-bao', t('ht_khong_hinh',
        'Chưa có hướng tuyến hay vị trí đáng tin để vẽ; chỉ hiện trong danh sách.')));
    } else if (cac[0].properties.so_do) {
      nd.appendChild(el('p', 'ghi-chu canh-bao', cac[0].properties.hinh === 'điểm'
        ? t('htt_so_do_diem', 'Chấm rỗng chỉ là vị trí sơ đồ cho biết khu vực, không phải vị trí chính xác.')
        : t('htt_so_do_tuyen', 'Đường chấm chỉ là sơ đồ nối các nơi tuyến đi qua theo nguồn; không phải luồng tàu chính xác.')));
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
    taiTep('ha_tang.csv', ['ma', 'ten_vi', 'ten_en', 'nhom', 'trang_thai', 'cap_tin_cay', 'moc_thoi_gian_vi',
                           'mo_ta_vi', 'nguon', 'ngay_cap_nhat', 'da_kiem_chung']),
    taiTep('ha_tang.geojson')
  ]).then(function (kq) {
    var sai = kq[0].filter(function (d) { return NHOM.indexOf(d.nhom) < 0 || TRANG_THAI.indexOf(d.trang_thai) < 0; });
    if (sai.length) {
      S.baoLoi('File ' + THU_MUC + 'ha_tang.csv có cột "nhom" hoặc "trang_thai" ghi sai ở: ' +
               sai.map(function (d) { return d.ten_vi || d.ma; }).join(', ') +
               '.\nCác mục này tạm không hiện. Hãy bấm đúp cap_nhat_du_lieu.bat để xem hướng dẫn sửa.',
               THU_MUC + 'ha_tang.csv has invalid "nhom" or "trang_thai" values; those rows are hidden.');
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

  window.SaBan.htTnb = {
    trung: trung, trungDiem: trungDiem, chon: chon_, boChon: boChon,
    dangChon: function () { return !!dangChon; }
  };
})();
