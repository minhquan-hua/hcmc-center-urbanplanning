/* Sa bàn vùng, bước 1: ranh giới TP.HCM sau sáp nhập, ba địa phương cũ, Đồng Nai, Tây Ninh */
(function () {
  'use strict';
  var S = window.SaBan;
  if (!S) return;
  var banDo = S.banDo;

  var THU_MUC = 'data/vung/';
  var MAU = { 'tphcm': '#d1495b', 'dong-nai': '#3a7d44', 'tay-ninh': '#e09f1f' };
  var MAU_CU = '#22313f';
  var CAC_LOP = ['vung-moi-nen', 'vung-cu-nen', 'vung-moi-vien', 'vung-cu-vien', 'vung-nhan'];

  var sanSang = false;
  var ds = [];          // các dòng trong vung.csv, theo thứ tự trong file
  var vung = {};        // ma -> dòng
  var hinh = null;      // GeoJSON ranh giới
  var diemNhan = { type: 'FeatureCollection', features: [] };
  var dangChon = null;  // mã vùng đang chọn

  function t(ma, macDinh) { return S.chu(ma) || macDinh || ma; }
  function en() { return S.ngonNgu() === 'en'; }
  function ten(v) { return (en() && v.ten_en) ? v.ten_en : v.ten_vi; }
  function nhan(v) { return (en() && v.nhan_en) ? v.nhan_en : (v.nhan_vi || v.ten_vi); }
  function laMoi(v) { return v.nhom === 'mới'; }
  function mau(v) { return laMoi(v) ? (MAU[v.ma] || '#7a8691') : MAU_CU; }

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
      S.baoLoi('Không hiển thị được lớp ranh giới vùng.', 'Could not display the regional boundaries.');
    }
  }

  // ---------- Lớp bản đồ ----------
  function ganNhan() {
    diemNhan.features = hinh.features.filter(function (f) { return vung[f.properties.ma]; }).map(function (f) {
      var v = vung[f.properties.ma];
      return { type: 'Feature',
               properties: { ma: v.ma, nhan: nhan(v), moi: laMoi(v) },
               geometry: { type: 'Point', coordinates: f.properties.diem } };
    });
    if (banDo.getSource('vung-nhan')) banDo.getSource('vung-nhan').setData(diemNhan);
  }

  function themLop() {
    // Ranh giới ven biển trên OpenStreetMap gồm cả mặt biển. Đặt lớp vùng DƯỚI lớp nước của
    // bản đồ nền để chỉ phần đất liền được tô màu và không có đường ranh chạy ra biển.
    var duoi = banDo.getLayer('water') ? 'water' : undefined;
    var laMoiBT = ['==', ['get', 'nhom'], 'mới'];
    var dangChonBT = ['boolean', ['feature-state', 'chon'], false];
    var bt = ['match', ['get', 'ma']];
    Object.keys(MAU).forEach(function (k) { bt.push(k, MAU[k]); });
    bt.push('#7a8691');

    banDo.addSource('vung', { type: 'geojson', data: hinh, promoteId: 'ma' });
    banDo.addSource('vung-nhan', { type: 'geojson', data: diemNhan });

    banDo.addLayer({ id: 'vung-moi-nen', type: 'fill', source: 'vung', filter: laMoiBT,
      paint: { 'fill-color': bt, 'fill-opacity': ['case', dangChonBT, 0.45, 0.2] } }, duoi);
    banDo.addLayer({ id: 'vung-cu-nen', type: 'fill', source: 'vung', filter: ['!', laMoiBT],
      paint: { 'fill-color': MAU_CU, 'fill-opacity': ['case', dangChonBT, 0.3, 0] } }, duoi);
    banDo.addLayer({ id: 'vung-cu-vien', type: 'line', source: 'vung', filter: ['!', laMoiBT],
      paint: { 'line-color': MAU_CU, 'line-width': 1.6, 'line-dasharray': [3, 2.5] } }, duoi);
    banDo.addLayer({ id: 'vung-moi-vien', type: 'line', source: 'vung', filter: laMoiBT,
      paint: { 'line-color': bt, 'line-width': ['interpolate', ['linear'], ['zoom'], 7, 2.2, 11, 4] } }, duoi);

    banDo.addLayer({ id: 'vung-nhan', type: 'symbol', source: 'vung-nhan',
      layout: {
        'text-field': ['get', 'nhan'],
        'text-font': ['Noto Sans Bold'],
        'text-size': ['case', ['get', 'moi'], 17, 12.5],
        'symbol-sort-key': ['case', ['get', 'moi'], 0, 1],
        'text-max-width': 8
      },
      paint: { 'text-color': ['case', ['get', 'moi'], '#16212c', '#4a5866'],
               'text-halo-color': '#ffffff', 'text-halo-width': 2 } });

    banDo.on('click', function (e) {
      if (S.tam() !== 'vung') return;
      // hạ tầng vùng (tuyến, điểm) được ưu tiên hơn ranh giới
      if (S.haTang && S.haTang.trung(e.point)) { boChon(); return; }
      var ma = trung(e.point);
      if (ma) chon(ma); else boChon();
    });
    banDo.on('mousemove', function (e) {
      if (S.tam() !== 'vung') return;
      banDo.getCanvas().style.cursor =
        ((S.haTang && S.haTang.trung(e.point)) || trung(e.point)) ? 'pointer' : '';
    });
  }

  // Vùng nằm dưới điểm nhấp; nhấp vào mặt nước thì không tính. Ưu tiên địa phương cũ (nằm trong TP.HCM mới).
  function trung(diem) {
    if (!sanSang || S.tam() !== 'vung') return null;
    if (banDo.getLayer('water') && banDo.queryRenderedFeatures(diem, { layers: ['water'] }).length) return null;
    var kq = banDo.queryRenderedFeatures(diem, { layers: ['vung-cu-nen'] });
    if (!kq.length) kq = banDo.queryRenderedFeatures(diem, { layers: ['vung-moi-nen'] });
    return kq.length ? kq[0].properties.ma : null;
  }

  function capNhatHienThi() {
    var bat = S.tam() === 'vung';
    if (!bat) boChon();
    if (!sanSang) return;
    CAC_LOP.forEach(function (id) { banDo.setLayoutProperty(id, 'visibility', bat ? 'visible' : 'none'); });
  }

  // ---------- Bảng điều khiển ----------
  function veBang() {
    var khung = document.getElementById('ds-vung');
    khung.textContent = '';
    ds.forEach(function (v) {
      var li = el('li');
      var nut = el('button', 'muc-du-an');
      nut.type = 'button';
      var o = el('span', laMoi(v) ? 'o-mau' : 'o-mau net-dut');
      if (laMoi(v)) o.style.background = mau(v);
      nut.appendChild(o);
      nut.appendChild(el('span', null, ten(v)));
      nut.addEventListener('click', function () { chon(v.ma); });
      li.appendChild(nut);
      khung.appendChild(li);
    });
  }

  // ---------- Thẻ thông tin ----------
  function boChon() {
    if (!dangChon) return;
    if (sanSang) banDo.setFeatureState({ source: 'vung', id: dangChon }, { chon: false });
    dangChon = null;
    document.getElementById('the').hidden = true;
  }

  function chon(ma) {
    if (!sanSang || !vung[ma]) return;
    if (S.haTang) S.haTang.boChon();
    boChon();
    dangChon = ma;
    banDo.setFeatureState({ source: 'vung', id: ma }, { chon: true });
    veThe();
    document.getElementById('the').hidden = false;
    if (window.matchMedia('(max-width: 767px)').matches) S.datBang(false);
  }

  function lienKet(v) {
    var nut = el('button', 'nut-lien-ket', ten(v));
    nut.type = 'button';
    nut.addEventListener('click', function () { chon(v.ma); });
    return nut;
  }

  function dongNguon(nd, tenNguon, link) {
    if (!link) return;
    var a = el('a', null, tenNguon || link);
    a.href = link; a.target = '_blank'; a.rel = 'noopener';
    var p = el('p', 'the-nguon'); p.appendChild(a);
    nd.appendChild(p);
  }

  function veThe() {
    var v = vung[dangChon];
    if (!v) return;
    var nd = document.getElementById('the-noi-dung');
    nd.textContent = '';
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
    if (v.thuoc && vung[v.thuoc]) {
      nd.appendChild(el('h3', null, t('vung_nay_thuoc', 'Từ 1/7/2025 thuộc')));
      var ul2 = el('ul', 'ds-gop');
      var li2 = el('li'); li2.appendChild(lienKet(vung[v.thuoc])); ul2.appendChild(li2);
      nd.appendChild(ul2);
    }

    nd.appendChild(el('h3', null, t('nguon', 'Nguồn')));
    dongNguon(nd, v.nguon_ten, v.nguon);
    dongNguon(nd, v.nguon_2_ten, v.nguon_2);
    var d = el('div', 'the-dong-tt');
    d.appendChild(el('span', 'the-nhan', t('vung_thong_tin', 'Thông tin sáp nhập')));
    var co = v.da_kiem_chung === 'có';
    d.appendChild(el('span', 'nhan-kc ' + (co ? 'da' : 'can'),
      co ? t('da_kiem_chung', 'đã kiểm chứng') : t('can_kiem_chung', 'cần kiểm chứng')));
    nd.appendChild(d);
    nd.appendChild(el('p', 'ghi-chu', laMoi(v)
      ? t('vung_ranh_gioi', 'Ranh giới tham khảo từ OpenStreetMap, không phải địa giới pháp lý. Không vẽ phần ranh giới trên biển.')
      : t('vung_ranh_gioi_cu', 'Ranh giới cũ: bản lưu OpenStreetMap ngày 1/5/2025, chỉ để tham khảo.')));
    nd.appendChild(el('p', 'ghi-chu', t('ngay_cap_nhat', 'Cập nhật') + ': ' + v.ngay_cap_nhat));
  }

  // ---------- Khởi động ----------
  document.getElementById('the-dong').addEventListener('click', boChon);
  S.khiDoiNgonNgu(function () {
    veBang();
    if (sanSang) { ganNhan(); veThe(); }
  });
  S.khiDoiTam(capNhatHienThi);

  Promise.all([
    taiTep('vung.csv', ['ma', 'ten_vi', 'ten_en', 'nhom', 'ghi_chu_vi', 'nguon_ten', 'nguon',
                        'ngay_cap_nhat', 'da_kiem_chung']),
    taiTep('vung.geojson')
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
    ds.forEach(function (v) { vung[v.ma] = v; });
    veBang();
    S.khiNenSanSang(function () {
      try {
        ganNhan();
        themLop();
        sanSang = true;
        capNhatHienThi();
      } catch (e) { baoLoiTai(e); }
    });
  }).catch(baoLoiTai);

  // Dùng cho tour: tô đậm nhiều vùng cùng lúc, không mở thẻ
  var danhDauCu = [];
  function danhDau(dsMa) {
    if (!sanSang) return;
    danhDauCu.forEach(function (ma) { if (ma !== dangChon) banDo.setFeatureState({ source: 'vung', id: ma }, { chon: false }); });
    danhDauCu = (dsMa || []).filter(function (ma) { return vung[ma]; });
    danhDauCu.forEach(function (ma) { banDo.setFeatureState({ source: 'vung', id: ma }, { chon: true }); });
  }

  window.SaBan.vung = {
    trung: trung, chon: chon, boChon: boChon, danhDau: danhDau,
    dangChon: function () { return !!dangChon; }
  };
})();
