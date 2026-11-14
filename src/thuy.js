/* Giai đoạn 5: tuyến, bến và hoạt hình minh họa giao thông thủy */
(function () {
  'use strict';
  var S = window.SaBan;
  if (!S) return;
  var banDo = S.banDo;

  var THU_MUC = 'data/giao_thong/';
  var MAU = { 'buýt sông': '#0b7285', 'phà': '#e67700', 'tàu khách': '#5f3dc4', 'tàu hàng': '#495057' };
  var MA_CHU = {
    'buýt sông': 'th_buyt_song', 'phà': 'th_pha', 'tàu khách': 'th_tau_khach', 'tàu hàng': 'th_tau_hang',
    'bến buýt sông': 'th_ben_buyt_song', 'bến phà': 'th_ben_pha', 'bến tàu khách': 'th_ben_tau_khach',
    'cảng hàng hóa': 'th_cang', 'đang hoạt động': 'th_dang_hoat_dong', 'dự kiến': 'th_du_kien'
  };
  var LOAI_TUYEN_CUA_BEN = { 'bến buýt sông': 'buýt sông', 'bến phà': 'phà', 'bến tàu khách': 'tàu khách', 'cảng hàng hóa': 'tàu hàng' };
  var CAC_LOP = ['th-tuyen-nen', 'th-tuyen', 'th-ben', 'th-ben-nhan', 'th-tau'];

  var tuyen = [], ben = [], theoMa = {}, hinh = null, tangToc = 10;
  var dangBat = false, sanSang = false, dangChon = null;
  var tau = [], thoiGian = 0, khungTruoc = 0, veTruoc = 0, dangChay = false;

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

  function taiTep(tenTep, cot) {
    return fetch(THU_MUC + tenTep).then(function (r) {
      if (!r.ok) throw { tep: tenTep };
      return r.text();
    }).then(function (vb) {
      if (tenTep.slice(-4) === '.csv') {
        var ds = S.docCSV(vb);
        var thieu = (cot || []).filter(function (c) { return !ds.length || !(c in ds[0]); });
        if (thieu.length) throw { tep: tenTep, cot: thieu };
        return ds;
      }
      try { return JSON.parse(vb); } catch (e) { throw { tep: tenTep }; }
    });
  }

  function baoLoiTai(e) {
    console.error(e);
    var tep = THU_MUC + (e && e.tep ? e.tep : '');
    if (e && e.cot) {
      S.baoLoi('File ' + tep + ' thiếu cột: ' + e.cot.join(', ') + '.', 'The file ' + tep + ' is missing columns: ' + e.cot.join(', ') + '.');
    } else if (e && e.tep) {
      S.baoLoi('Không đọc được file ' + tep + '.\nHãy bấm đúp cap_nhat_du_lieu.bat để tạo lại.', 'Could not read ' + tep + '.');
    } else {
      S.baoLoi('Không hiển thị được lớp giao thông thủy.', 'Could not display the waterway layer.');
    }
    document.getElementById('bat-thuy').checked = false;
    dangBat = false;
    veBang();
  }

  // ---------- Tàu ----------
  function taoTau() {
    tau = [];
    var kx = 111320 * Math.cos(10.78 * Math.PI / 180), ky = 110570;
    hinh.features.forEach(function (f) {
      if (f.properties.hinh !== 'đường chạy') return;
      var d = theoMa[f.properties.ma];
      var soTau = d ? parseInt(d.so_tau, 10) || 0 : 0;
      var tocDo = d ? parseFloat(String(d.toc_do).replace(',', '.')) || 0 : 0;
      if (!soTau || !tocDo) return;
      var td = f.geometry.coordinates, tich = [0];
      for (var i = 1; i < td.length; i++) {
        tich.push(tich[i - 1] + Math.hypot((td[i][0] - td[i - 1][0]) * kx, (td[i][1] - td[i - 1][1]) * ky));
      }
      var dai = tich[tich.length - 1];
      var c = td[0], z = td[td.length - 1];
      // tuyến có hai đầu gần nhau là tuyến vòng (đi rồi về); còn lại tàu chạy tới cuối rồi quay đầu
      var vong = Math.hypot((c[0] - z[0]) * kx, (c[1] - z[1]) * ky) < 800;
      for (var k = 0; k < soTau; k++) {
        tau.push({ ma: d.ma, loai: d.loai, td: td, tich: tich, dai: dai, vong: vong,
                   lech: (k / soTau) * (vong ? dai : 2 * dai), tocDo: tocDo / 3.6 * tangToc });
      }
    });
  }

  function viTri(x, tg) {
    var s = x.lech + tg * x.tocDo;
    if (x.vong) s = s % x.dai;
    else { s = s % (2 * x.dai); if (s > x.dai) s = 2 * x.dai - s; }
    var lo = 0, hi = x.tich.length - 1;
    while (hi - lo > 1) { var m = (lo + hi) >> 1; if (x.tich[m] <= s) lo = m; else hi = m; }
    var doan = x.tich[hi] - x.tich[lo], f = doan > 0 ? (s - x.tich[lo]) / doan : 0;
    return [x.td[lo][0] + (x.td[hi][0] - x.td[lo][0]) * f, x.td[lo][1] + (x.td[hi][1] - x.td[lo][1]) * f];
  }

  function veTau() {
    var nguon = banDo.getSource('th-tau');
    if (!nguon) return;
    nguon.setData({ type: 'FeatureCollection', features: tau.map(function (x) {
      return { type: 'Feature', properties: { loai: x.loai, ma: x.ma }, geometry: { type: 'Point', coordinates: viTri(x, thoiGian) } };
    }) });
  }

  function khung(luc) {
    if (!dangChay) return;
    thoiGian += Math.min(0.1, (luc - khungTruoc) / 1000);
    khungTruoc = luc;
    if (luc - veTruoc > 60) { veTruoc = luc; veTau(); }
    requestAnimationFrame(khung);
  }

  function batDauChay() {
    if (dangChay || !dangBat || !sanSang || document.hidden) return;
    dangChay = true;
    khungTruoc = performance.now();
    requestAnimationFrame(khung);
  }

  // ---------- Bản đồ ----------
  function mauTheoLoai(thuocTinh) {
    var bt = ['match', ['get', thuocTinh]];
    Object.keys(MAU).forEach(function (k) { bt.push(k, MAU[k]); });
    bt.push('#495057');
    return bt;
  }

  function ganThuocTinh() {
    hinh.features.forEach(function (f) {
      var p = f.properties;
      if (p.hinh === 'bến') {
        var b = theoMa[p.ma];
        p.nhan = b ? ten(b) : p.ma;
        p.loai_tuyen = LOAI_TUYEN_CUA_BEN[p.loai] || '';
      }
    });
    if (banDo.getSource('thuy')) banDo.getSource('thuy').setData(hinh);
  }

  function themLop() {
    banDo.addSource('thuy', { type: 'geojson', data: hinh });
    banDo.addSource('th-tau', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    var laTuyen = ['==', ['get', 'hinh'], 'tuyến'], laBen = ['==', ['get', 'hinh'], 'bến'];
    banDo.addLayer({ id: 'th-tuyen-nen', type: 'line', source: 'thuy', filter: laTuyen,
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#ffffff', 'line-width': 6, 'line-opacity': 0.85 } });
    banDo.addLayer({ id: 'th-tuyen', type: 'line', source: 'thuy', filter: laTuyen,
      paint: { 'line-color': mauTheoLoai('loai'), 'line-width': 2.6, 'line-dasharray': [3, 1.4] } });
    banDo.addLayer({ id: 'th-ben', type: 'circle', source: 'thuy', filter: laBen,
      paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 11, 4, 16, 8],
               'circle-color': '#ffffff', 'circle-stroke-color': mauTheoLoai('loai_tuyen'), 'circle-stroke-width': 3 } });
    banDo.addLayer({ id: 'th-ben-nhan', type: 'symbol', source: 'thuy', filter: laBen, minzoom: 12.6,
      layout: { 'text-field': ['get', 'nhan'], 'text-font': ['Noto Sans Bold'], 'text-size': 11.5,
                'text-offset': [0, 1], 'text-anchor': 'top', 'text-max-width': 8, 'text-optional': true },
      paint: { 'text-color': mauTheoLoai('loai_tuyen'), 'text-halo-color': '#ffffff', 'text-halo-width': 2 } });
    banDo.addLayer({ id: 'th-tau', type: 'circle', source: 'th-tau',
      paint: { 'circle-radius': ['interpolate', ['linear'], ['zoom'], 11,
                 ['match', ['get', 'loai'], 'tàu hàng', 6, 4.5], 16, ['match', ['get', 'loai'], 'tàu hàng', 13, 10]],
               'circle-color': mauTheoLoai('loai'), 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 2 } });

    ['th-tuyen-nen', 'th-ben'].forEach(function (id) {
      banDo.on('mouseenter', id, function () { banDo.getCanvas().style.cursor = 'pointer'; });
      banDo.on('mouseleave', id, function () { banDo.getCanvas().style.cursor = ''; });
    });
    banDo.on('click', function (e) {
      var ma = trung(e.point);
      if (ma) chon(ma, false);
      else if (dangChon) {
        dangChon = null;
        var lopKhacDangChon = (S.hanhChinh && S.hanhChinh.dangChon()) || (S.duAn && S.duAn.dangChon && S.duAn.dangChon());
        if (!lopKhacDangChon) document.getElementById('the').hidden = true;
      }
    });
  }

  function trung(diem) {
    if (!sanSang || !dangBat) return null;
    var r = 8, o = [[diem.x - r, diem.y - r], [diem.x + r, diem.y + r]];
    var kq = banDo.queryRenderedFeatures(o, { layers: ['th-ben'] });
    if (!kq.length) kq = banDo.queryRenderedFeatures(o, { layers: ['th-tuyen-nen'] });
    return kq.length ? kq[0].properties.ma : null;
  }

  function capNhat() {
    if (!sanSang) return;
    CAC_LOP.forEach(function (id) { banDo.setLayoutProperty(id, 'visibility', dangBat ? 'visible' : 'none'); });
    if (!dangBat) { dangChay = false; if (dangChon) { dangChon = null; document.getElementById('the').hidden = true; } return; }
    veTau();
    batDauChay();
  }

  // ---------- Bảng điều khiển và thẻ ----------
  function veBang() {
    document.getElementById('khoi-thuy').hidden = !dangBat;
    if (!dangBat) return;
    var ds = document.getElementById('th-ds-tuyen');
    ds.textContent = '';
    tuyen.forEach(function (d) {
      var li = el('li'), nut = el('button', 'muc-du-an');
      nut.type = 'button';
      var cham = el('span', 'cham');
      cham.style.background = MAU[d.loai] || '#495057';
      nut.appendChild(cham);
      nut.appendChild(el('span', null, ten(d) + (d.trang_thai === 'dự kiến' ? ' · ' + nhan('dự kiến') : '')));
      nut.addEventListener('click', function () { chon(d.ma, true); });
      li.appendChild(nut);
      ds.appendChild(li);
    });
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
    if (!theoMa[ma]) return;
    if (S.hanhChinh) S.hanhChinh.boChon();
    if (S.duAn) S.duAn.boChon();
    dangChon = ma;
    veThe();
    document.getElementById('the').hidden = false;
    if (window.matchMedia('(max-width: 767px)').matches) S.datBang(false);
    if (bayToi && sanSang) {
      var b = khungCua(ma);
      if (b) banDo.fitBounds([[Math.max(b[0], 106.66), Math.max(b[1], 10.705)], [Math.min(b[2], 106.825), Math.min(b[3], 10.855)]],
        { padding: 80, duration: 900, maxZoom: 15.5 });
    }
  }

  function muc(nhanChu, noiDung) {
    var d = el('div', 'the-muc');
    d.appendChild(el('h3', null, nhanChu));
    d.appendChild(el('p', null, noiDung));
    return d;
  }

  function veThe() {
    var d = theoMa[dangChon];
    if (!d) return;
    var nd = document.getElementById('the-noi-dung');
    nd.textContent = '';
    var laBen = !('trang_thai' in d);
    nd.appendChild(el('p', 'the-loai', t('lop_duong_thuy', 'Giao thông thủy') + ' · ' + nhan(d.loai)));
    nd.appendChild(el('h2', null, ten(d)));
    if (laBen) {
      var tu = theoMa[d.tuyen];
      if (tu) {
        nd.appendChild(el('h3', null, t('th_thuoc_tuyen', 'Thuộc tuyến')));
        var nut = el('button', 'nut-lien-ket', ten(tu));
        nut.type = 'button';
        nut.addEventListener('click', function () { chon(tu.ma, true); });
        var p = el('p'); p.appendChild(nut); nd.appendChild(p);
      }
      nd.appendChild(el('p', 'ghi-chu', t('th_vi_tri_osm', 'Vị trí lấy từ OpenStreetMap.')));
      return;
    }
    var hang = el('p', 'the-hang-nhan');
    var tt = el('span', 'nhan-tt', nhan(d.trang_thai));
    tt.style.background = d.trang_thai === 'dự kiến' ? '#862e9c' : '#1b7a3d';
    hang.appendChild(tt);
    hang.appendChild(el('span', 'nhan-kc ' + (d.da_kiem_chung === 'có' ? 'da' : 'can'),
      d.da_kiem_chung === 'có' ? t('da_kiem_chung', 'đã kiểm chứng') : t('can_kiem_chung', 'cần kiểm chứng')));
    nd.appendChild(hang);
    if (d.mo_ta_vi) nd.appendChild(muc(t('mo_ta', 'Mô tả'), d.mo_ta_vi));
    if (d.ghi_chu_vi) nd.appendChild(muc(t('luu_y', 'Lưu ý'), d.ghi_chu_vi));
    if (en()) nd.appendChild(el('p', 'ghi-chu', 'Details are currently available in Vietnamese only.'));
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
    var soTau = parseInt(d.so_tau, 10) || 0;
    if (soTau) nd.appendChild(el('p', 'ghi-chu canh-bao', t('th_tau_minh_hoa',
      'Tàu chạy trên bản đồ là minh họa: số tàu ({so}) và tốc độ ({toc} km/h) là giả định, không phải lịch chạy thật.')
      .replace('{so}', soTau).replace('{toc}', d.toc_do)));
    else nd.appendChild(el('p', 'ghi-chu canh-bao', t('chua_co_vi_tri', 'Chưa có vị trí trên bản đồ.')));
    nd.appendChild(el('p', 'ghi-chu', t('ngay_cap_nhat', 'Cập nhật') + ': ' + d.ngay_cap_nhat));
  }

  // ---------- Khởi động (chỉ tải khi bật lớp) ----------
  var dangTai = null;
  function taiDuLieu() {
    if (dangTai) return dangTai;
    dangTai = Promise.all([
      taiTep('tuyen_thuy.csv', ['ma', 'ten_vi', 'ten_en', 'loai', 'trang_thai', 'mo_ta_vi', 'so_tau', 'toc_do',
                                 'nguon', 'ngay_cap_nhat', 'da_kiem_chung']),
      taiTep('ben_thuy.csv', ['ma', 'ten_vi', 'ten_en', 'loai', 'tuyen']),
      taiTep('duong_thuy.geojson'),
      taiTep('gia_dinh.csv', ['ma', 'gia_tri'])
    ]).then(function (kq) {
      tuyen = kq[0]; ben = kq[1]; hinh = kq[2];
      tuyen.concat(ben).forEach(function (d) { theoMa[d.ma] = d; });
      kq[3].forEach(function (g) {
        if (g.ma === 'tang_toc_hien_thi') tangToc = parseFloat(String(g.gia_tri).replace(',', '.')) || 10;
      });
      return new Promise(function (xong) { S.khiNenSanSang(xong); });
    }).then(function () {
      ganThuocTinh();
      themLop();
      taoTau();
      sanSang = true;
    });
    return dangTai;
  }

  document.getElementById('bat-thuy').addEventListener('change', function (e) {
    dangBat = e.target.checked;
    veBang();
    if (!dangBat) { capNhat(); return; }
    taiDuLieu().then(function () { veBang(); capNhat(); }).catch(baoLoiTai);
  });
  document.getElementById('the-dong').addEventListener('click', function () { dangChon = null; });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) dangChay = false; else batDauChay();
  });
  S.khiDoiNgonNgu(function () {
    veBang();
    if (sanSang) ganThuocTinh();
    if (dangChon) veThe();
  });
  veBang();

  window.SaBan.thuy = {
    trung: trung,
    chon: chon,
    boChon: function () { dangChon = null; },
    dangChon: function () { return !!dangChon; },
    trangThai: function () { return { sanSang: sanSang, soTau: tau.length, dangChay: dangChay }; }
  };
})();
