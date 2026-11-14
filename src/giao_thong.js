/* Giai đoạn 4: hoạt hình minh họa giao thông đường bộ và so sánh kịch bản */
(function () {
  'use strict';
  var S = window.SaBan;
  if (!S) return;
  var banDo = S.banDo;

  var THU_MUC = 'data/giao_thong/';
  var SO_CAP_DI_DEN = 260;                        // số cặp điểm đi - điểm đến dùng chung cho mọi kịch bản
  var VUNG_LOI = [106.675, 10.745, 106.76, 10.82]; // xe xuất phát và kết thúc trong vùng này
  var MAU_XE = { xe_may: '#212529', o_to: '#1c7ed6', xe_buyt: '#f08c00' };

  var mang = null, giaDinh = {}, dsGiaDinh = [], kichBan = [], quaSong = [];
  var dangBat = false, sanSang = false;
  var ky = 'cao';                 // 'cao' hoặc 'thap'
  var maKichBan = null;
  var capDiDen = [];              // [nutDi, nutDen, quaSong?]
  var tuyenTheoKB = {};           // ma kịch bản -> mảng tuyến
  var xe = [];
  var thoiGian = 0, khungTruoc = 0, veTruoc = 0, dangChay = false;

  function t(ma, macDinh) { return S.chu(ma) || macDinh || ma; }
  function en() { return S.ngonNgu() === 'en'; }
  function el(the, lop, chu) {
    var e = document.createElement(the);
    if (lop) e.className = lop;
    if (chu != null) e.textContent = chu;
    return e;
  }
  function so(ma) { return giaDinh[ma]; }

  // Số ngẫu nhiên có hạt giống cố định: mỗi lần mở đều ra cùng một kết quả, các kịch bản so được với nhau
  function taoNgauNhien(hat) {
    return function () {
      hat |= 0; hat = hat + 0x6D2B79F5 | 0;
      var x = Math.imul(hat ^ hat >>> 15, 1 | hat);
      x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x;
      return ((x ^ x >>> 14) >>> 0) / 4294967296;
    };
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
      S.baoLoi('File ' + tep + ' thiếu cột: ' + e.cot.join(', ') + '.', 'The file ' + tep + ' is missing columns: ' + e.cot.join(', ') + '.');
    } else if (e && e.kieu === 'so') {
      S.baoLoi('File ' + THU_MUC + 'gia_dinh.csv: dòng "' + e.ma + '" thiếu hoặc không phải là số.\nHãy sửa rồi bấm đúp cap_nhat_du_lieu.bat.',
               'gia_dinh.csv: the row "' + e.ma + '" is missing or not a number.');
    } else if (e && e.tep) {
      S.baoLoi('Không đọc được file ' + tep + '.\nHãy bấm đúp cap_nhat_du_lieu.bat để tạo lại.', 'Could not read ' + tep + '.');
    } else {
      S.baoLoi('Không chạy được mô phỏng giao thông.', 'Could not run the traffic illustration.');
    }
    document.getElementById('bat-giao-thong').checked = false;
    dangBat = false;
    veBang();
  }

  // ---------- Mạng đường và tìm đường ngắn nhất ----------
  function canhDung(c, kb) {
    if (c[5] && c[5] !== kb.them_cau) return false;                       // cầu dự kiến: chỉ có trong kịch bản thêm cầu đó
    if (kb.bo_cau && c[4] >= 0 && mang.qua_song[c[4]] === kb.bo_cau) return false;
    return true;
  }

  function taoKe(kb) {
    var ke = new Array(mang.nut.length);
    for (var i = 0; i < ke.length; i++) ke[i] = [];
    mang.canh.forEach(function (c, j) {
      if (!canhDung(c, kb)) return;
      ke[c[0]].push([c[1], c[2], j, 0]);
      if (c[3] === 0) ke[c[1]].push([c[0], c[2], j, 1]);
    });
    return ke;
  }

  function timDuong(ke, di, den) {
    var n = ke.length;
    var xa = new Float64Array(n).fill(Infinity);
    var truoc = new Int32Array(n).fill(-1), canhTruoc = new Int32Array(n).fill(-1), nguoc = new Uint8Array(n);
    var dong = [[0, di]];
    xa[di] = 0;
    while (dong.length) {
      // lấy phần tử nhỏ nhất khỏi đống
      var dau = dong[0], cuoi = dong.pop();
      if (dong.length) {
        dong[0] = cuoi;
        var i = 0;
        for (;;) {
          var l = 2 * i + 1, r = l + 1, m = i;
          if (l < dong.length && dong[l][0] < dong[m][0]) m = l;
          if (r < dong.length && dong[r][0] < dong[m][0]) m = r;
          if (m === i) break;
          var tam = dong[i]; dong[i] = dong[m]; dong[m] = tam; i = m;
        }
      }
      var u = dau[1];
      if (dau[0] > xa[u]) continue;
      if (u === den) break;
      var ds = ke[u];
      for (var k = 0; k < ds.length; k++) {
        var v = ds[k][0], d = dau[0] + ds[k][1];
        if (d < xa[v]) {
          xa[v] = d; truoc[v] = u; canhTruoc[v] = ds[k][2]; nguoc[v] = ds[k][3];
          dong.push([d, v]);
          var j = dong.length - 1;
          while (j > 0) {
            var cha = (j - 1) >> 1;
            if (dong[cha][0] <= dong[j][0]) break;
            var tam2 = dong[cha]; dong[cha] = dong[j]; dong[j] = tam2; j = cha;
          }
        }
      }
    }
    if (xa[den] === Infinity) return null;
    var chuoi = [];
    for (var x = den; x !== di; x = truoc[x]) chuoi.push([canhTruoc[x], nguoc[x]]);
    chuoi.reverse();
    return chuoi;
  }

  function taoTuyen(chuoi) {
    var diem = [], tich = [0], qs = {};
    var kx = 111320 * Math.cos(10.78 * Math.PI / 180), ky2 = 110570;
    chuoi.forEach(function (b) {
      var c = mang.canh[b[0]], td = c[6], soDiem = td.length / 2;
      if (c[4] >= 0) qs[c[4]] = true;
      for (var i = 0; i < soDiem; i++) {
        var k = b[1] ? soDiem - 1 - i : i;
        var x = td[2 * k], y = td[2 * k + 1];
        if (diem.length) {
          var px = diem[diem.length - 2], py = diem[diem.length - 1];
          if (px === x && py === y) continue;
          tich.push(tich[tich.length - 1] + Math.hypot((x - px) * kx, (y - py) * ky2));
        }
        diem.push(x, y);
      }
    });
    return { diem: diem, tich: tich, dai: tich[tich.length - 1], qs: qs };
  }

  function vungLoi(i) {
    var p = mang.nut[i];
    return p[0] > VUNG_LOI[0] && p[0] < VUNG_LOI[2] && p[1] > VUNG_LOI[1] && p[1] < VUNG_LOI[3];
  }

  // Các nút đi tới được và quay về được từ trung tâm (tránh chọn phải đoạn đường cụt một chiều)
  function nutThongSuot(ke) {
    var n = ke.length, keNguoc = new Array(n), tam = 0, gan = Infinity, i;
    for (i = 0; i < n; i++) keNguoc[i] = [];
    for (i = 0; i < n; i++) ke[i].forEach(function (c) { keNguoc[c[0]].push([i]); });
    for (i = 0; i < n; i++) {
      var d = Math.hypot(mang.nut[i][0] - 106.700, mang.nut[i][1] - 10.776);
      if (d < gan && ke[i].length) { gan = d; tam = i; }
    }
    function lan(danhSach) {
      var thay = new Uint8Array(n), hang = [tam];
      thay[tam] = 1;
      while (hang.length) {
        var u = hang.pop();
        danhSach[u].forEach(function (c) { if (!thay[c[0]]) { thay[c[0]] = 1; hang.push(c[0]); } });
      }
      return thay;
    }
    var xuoi = lan(ke), nguoc = lan(keNguoc), kq = [];
    for (i = 0; i < n; i++) if (xuoi[i] && nguoc[i] && vungLoi(i)) kq.push(i);
    return kq;
  }

  function taoCapDiDen() {
    var ke = taoKe(kichBan[0]);
    var nut = nutThongSuot(ke);
    var dong = nut.filter(function (i) { return mang.nut[i][2] === 1; });
    var tay = nut.filter(function (i) { return mang.nut[i][2] === 0; });
    var rd = taoNgauNhien(20261114);
    var tiLeQua = so('ti_le_qua_song') / 100;
    capDiDen = [];
    function chon(ds) { return ds[Math.floor(rd() * ds.length)]; }
    while (capDiDen.length < SO_CAP_DI_DEN && nut.length > 1) {
      var a, b, qua = dong.length && tay.length && rd() < tiLeQua;
      if (qua) { a = chon(tay); b = chon(dong); if (rd() < 0.5) { var tam = a; a = b; b = tam; } }
      else { a = chon(nut); b = chon(nut); }
      if (a !== b) capDiDen.push([a, b, qua]);
    }
  }

  function tuyenCua(ma) {
    if (tuyenTheoKB[ma]) return tuyenTheoKB[ma];
    var kb = kichBan.filter(function (k) { return k.ma === ma; })[0];
    var ke = taoKe(kb);
    var ds = capDiDen.map(function (c) {
      var chuoi = timDuong(ke, c[0], c[1]);
      return chuoi && chuoi.length ? taoTuyen(chuoi) : null;
    });
    tuyenTheoKB[ma] = ds;
    return ds;
  }

  // ---------- Xe ----------
  function mayYeu() {
    return window.matchMedia('(max-width: 767px)').matches || (navigator.hardwareConcurrency || 8) <= 4;
  }

  function taoXe() {
    var tong = Math.round(so(ky === 'cao' ? 'so_xe_cao_diem' : 'so_xe_thap_diem') * (mayYeu() ? 0.4 : 1));
    var tuyen = tuyenCua(maKichBan);
    var rd = taoNgauNhien(7);
    var tocDo = so(ky === 'cao' ? 'toc_do_cao_diem' : 'toc_do_thap_diem') / 3.6 * so('tang_toc_hien_thi');
    var mocXeMay = so('ti_le_xe_may') / 100, mocOTo = mocXeMay + so('ti_le_o_to') / 100;
    xe = [];
    for (var i = 0; i < tong; i++) {
      var r = rd(), loai = r < mocXeMay ? 'xe_may' : (r < mocOTo ? 'o_to' : 'xe_buyt');
      var lech = rd(), daoDong = 0.85 + rd() * 0.3;
      var tu = tuyen[i % tuyen.length];
      if (!tu || tu.dai < 50) continue;
      xe.push({ tuyen: tu, loai: loai, lech: lech * tu.dai, tocDo: tocDo * so('he_so_toc_do_' + loai) * daoDong });
    }
  }

  function viTri(x, tg) {
    var tu = x.tuyen, s = (x.lech + tg * x.tocDo) % tu.dai;
    var lo = 0, hi = tu.tich.length - 1;
    while (hi - lo > 1) { var m = (lo + hi) >> 1; if (tu.tich[m] <= s) lo = m; else hi = m; }
    var doan = tu.tich[hi] - tu.tich[lo], f = doan > 0 ? (s - tu.tich[lo]) / doan : 0;
    return [tu.diem[2 * lo] + (tu.diem[2 * hi] - tu.diem[2 * lo]) * f,
            tu.diem[2 * lo + 1] + (tu.diem[2 * hi + 1] - tu.diem[2 * lo + 1]) * f];
  }

  function veXe() {
    var nguon = banDo.getSource('gt-xe');
    if (!nguon) return;
    nguon.setData({ type: 'FeatureCollection', features: xe.map(function (x) {
      return { type: 'Feature', properties: { loai: x.loai }, geometry: { type: 'Point', coordinates: viTri(x, thoiGian) } };
    }) });
  }

  function khung(luc) {
    if (!dangChay) return;
    var dt = Math.min(0.1, (luc - khungTruoc) / 1000);
    khungTruoc = luc;
    thoiGian += dt;
    if (luc - veTruoc > 50) { veTruoc = luc; veXe(); }   // khoảng 20 lần vẽ mỗi giây
    requestAnimationFrame(khung);
  }

  function batDauChay() {
    if (dangChay || !dangBat || !sanSang || document.hidden) return;
    dangChay = true;
    khungTruoc = performance.now();
    requestAnimationFrame(khung);
  }

  // ---------- Bản đồ ----------
  function themLop() {
    banDo.addSource('gt-cau', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    banDo.addSource('gt-xe', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
    banDo.addLayer({ id: 'gt-cau', type: 'line', source: 'gt-cau',
      layout: { 'line-cap': 'round' },
      paint: { 'line-color': ['match', ['get', 'kieu'], 'bo', '#e03131', '#2f9e44'], 'line-width': 9, 'line-opacity': 0.55 } });
    banDo.addLayer({ id: 'gt-xe', type: 'circle', source: 'gt-xe',
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 11,
          ['match', ['get', 'loai'], 'xe_buyt', 3.4, 'o_to', 2.6, 1.8], 16,
          ['match', ['get', 'loai'], 'xe_buyt', 8, 'o_to', 6, 4]],
        'circle-color': ['match', ['get', 'loai'], 'xe_buyt', MAU_XE.xe_buyt, 'o_to', MAU_XE.o_to, MAU_XE.xe_may],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': ['match', ['get', 'loai'], 'xe_may', 0.6, 1.2]
      } });
  }

  function veCauKichBan() {
    var kb = kichBan.filter(function (k) { return k.ma === maKichBan; })[0];
    var ds = [];
    mang.canh.forEach(function (c) {
      var kieu = (kb.them_cau && c[5] === kb.them_cau) ? 'them'
        : (kb.bo_cau && c[4] >= 0 && mang.qua_song[c[4]] === kb.bo_cau) ? 'bo' : null;
      if (!kieu) return;
      var td = [];
      for (var i = 0; i < c[6].length; i += 2) td.push([c[6][i], c[6][i + 1]]);
      ds.push({ type: 'Feature', properties: { kieu: kieu }, geometry: { type: 'LineString', coordinates: td } });
    });
    banDo.getSource('gt-cau').setData({ type: 'FeatureCollection', features: ds });
  }

  function capNhat() {
    if (!sanSang) return;
    ['gt-cau', 'gt-xe'].forEach(function (id) {
      banDo.setLayoutProperty(id, 'visibility', dangBat ? 'visible' : 'none');
    });
    if (!dangBat) { dangChay = false; return; }
    taoXe();
    veCauKichBan();
    veThongKe();
    veXe();
    batDauChay();
  }

  // ---------- Bảng điều khiển ----------
  function tenKB(k) { return (en() && k.ten_en) ? k.ten_en : k.ten_vi; }

  function demQuaSong(ma) {
    var tuyen = tuyenCua(ma), dem = mang.qua_song.map(function () { return 0; });
    var tongDai = 0, soChuyen = 0;
    var tong = Math.round(so(ky === 'cao' ? 'so_xe_cao_diem' : 'so_xe_thap_diem') * (mayYeu() ? 0.4 : 1));
    for (var i = 0; i < tong; i++) {
      var tu = tuyen[i % tuyen.length];
      if (!tu) continue;
      Object.keys(tu.qs).forEach(function (q) { dem[q]++; });
      if (capDiDen[i % tuyen.length][2]) { tongDai += tu.dai; soChuyen++; }
    }
    return { dem: dem, daiTB: soChuyen ? tongDai / soChuyen / 1000 : 0 };
  }

  function veThongKe() {
    var khungTK = document.getElementById('gt-thong-ke');
    khungTK.textContent = '';
    if (!sanSang || !dangBat) return;
    var nay = demQuaSong(maKichBan), goc = demQuaSong(kichBan[0].ma);
    var laGoc = maKichBan === kichBan[0].ma;
    var bang = el('table', 'bang-tk');
    var dau = el('tr');
    dau.appendChild(el('th', null, t('gt_diem_qua_song', 'Qua sông bằng')));
    dau.appendChild(el('th', null, t('gt_so_xe', 'Số xe')));
    if (!laGoc) dau.appendChild(el('th', null, t('gt_so_voi_hien_trang', 'So với hiện trạng')));
    bang.appendChild(dau);
    quaSong.forEach(function (q, i) {
      var chiSo = mang.qua_song.indexOf(q.ten_osm);
      if (chiSo < 0 || (!nay.dem[chiSo] && !goc.dem[chiSo])) return;
      var h = el('tr');
      h.appendChild(el('td', null, (en() && q.ten_en) ? q.ten_en : q.ten_vi));
      h.appendChild(el('td', 'so', String(nay.dem[chiSo])));
      if (!laGoc) {
        var lech = nay.dem[chiSo] - goc.dem[chiSo];
        h.appendChild(el('td', 'so ' + (lech > 0 ? 'tang' : lech < 0 ? 'giam' : ''), (lech > 0 ? '+' : '') + lech));
      }
      bang.appendChild(h);
      void i;
    });
    khungTK.appendChild(bang);
    var cau = t('gt_quang_duong', 'Quãng đường trung bình của chuyến qua sông') + ': ' + nay.daiTB.toFixed(2).replace('.', en() ? '.' : ',') + ' km';
    if (!laGoc) cau += ' (' + t('gt_hien_trang', 'hiện trạng') + ' ' + goc.daiTB.toFixed(2).replace('.', en() ? '.' : ',') + ' km)';
    khungTK.appendChild(el('p', 'ghi-chu', cau));
    khungTK.appendChild(el('p', 'ghi-chu', t('gt_giai_thich_so', 'Số xe là số chấm đang chạy trong hoạt hình, không phải lưu lượng thật.')));
  }

  function veBang() {
    document.getElementById('khoi-giao-thong').hidden = !dangBat;
    if (!dangBat) return;
    document.querySelectorAll('#gt-chon-ky button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.getAttribute('data-ky') === ky));
    });
    var ds = document.getElementById('gt-kich-ban');
    ds.textContent = '';
    kichBan.forEach(function (k) {
      var nut = el('button', 'nut-kich-ban', tenKB(k));
      nut.type = 'button';
      nut.setAttribute('aria-pressed', String(k.ma === maKichBan));
      nut.addEventListener('click', function () { maKichBan = k.ma; veBang(); capNhat(); });
      ds.appendChild(nut);
    });
    var kb = kichBan.filter(function (k) { return k.ma === maKichBan; })[0];
    document.getElementById('gt-mo-ta').textContent = kb ? ((en() && kb.mo_ta_en) ? kb.mo_ta_en : kb.mo_ta_vi) : '';
    var cg = document.getElementById('gt-chu-giai');
    cg.textContent = '';
    [['xe_may', 'gt_xe_may', 'xe máy'], ['o_to', 'gt_o_to', 'ô tô'], ['xe_buyt', 'gt_xe_buyt', 'xe buýt']].forEach(function (x) {
      var li = el('li'), cham = el('span', 'cham');
      cham.style.background = MAU_XE[x[0]];
      li.appendChild(cham);
      li.appendChild(el('span', null, t(x[1], x[2]) + ' ' + (sanSang ? so('ti_le_' + x[0]) + '%' : '')));
      cg.appendChild(li);
    });
    veThongKe();
  }

  // Thẻ liệt kê mọi con số giả định, để sinh viên thấy mô phỏng dựa trên gì
  function moGiaDinh() {
    if (S.hanhChinh) S.hanhChinh.boChon();
    if (S.duAn) S.duAn.boChon();
    var nd = document.getElementById('the-noi-dung');
    nd.textContent = '';
    nd.appendChild(el('p', 'the-loai', t('lop_duong_bo', 'Giao thông đường bộ')));
    nd.appendChild(el('h2', null, t('gt_gia_dinh', 'Các con số mô phỏng dùng')));
    nd.appendChild(el('p', 'ghi-chu canh-bao', t('gt_canh_bao', 'Mô phỏng minh họa cho mục đích học tập, không phải số liệu thực.')));
    dsGiaDinh.forEach(function (g) {
      var muc = el('div', 'the-muc');
      muc.appendChild(el('h3', null, g.gia_tri + ' ' + g.don_vi));
      muc.appendChild(el('p', null, g.mo_ta_vi));
      var nhan = el('p', 'the-hang-nhan');
      var coNguon = g.loai_nguon === 'số liệu công bố';
      nhan.appendChild(el('span', 'nhan-kc ' + (coNguon ? 'da' : 'can'),
        coNguon ? t('gt_so_lieu_cong_bo', 'số liệu công bố') : t('gt_gia_dinh_minh_hoa', 'giả định minh họa')));
      if (coNguon && /^https?:\/\//.test(g.nguon)) {
        var a = el('a', null, g.nguon.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]);
        a.href = g.nguon; a.target = '_blank'; a.rel = 'noopener';
        nhan.appendChild(a);
      }
      muc.appendChild(nhan);
      nd.appendChild(muc);
    });
    if (en()) nd.appendChild(el('p', 'ghi-chu', 'Descriptions are currently available in Vietnamese only.'));
    document.getElementById('the').hidden = false;
    if (window.matchMedia('(max-width: 767px)').matches) S.datBang(false);
  }

  // ---------- Khởi động (chỉ tải dữ liệu khi người dùng bật lớp, để trang mở nhanh) ----------
  var dangTai = null;
  function taiDuLieu() {
    if (dangTai) return dangTai;
    dangTai = Promise.all([
      taiTep('mang_duong.json'),
      taiTep('gia_dinh.csv', ['ma', 'gia_tri', 'don_vi', 'mo_ta_vi', 'loai_nguon', 'nguon']),
      taiTep('kich_ban.csv', ['ma', 'ten_vi', 'ten_en', 'bo_cau', 'them_cau', 'mo_ta_vi']),
      taiTep('diem_qua_song.csv', ['ten_osm', 'ten_vi', 'ten_en'])
    ]).then(function (kq) {
      mang = kq[0];
      dsGiaDinh = kq[1];
      dsGiaDinh.forEach(function (g) { giaDinh[g.ma] = parseFloat(String(g.gia_tri).replace(',', '.')); });
      ['ti_le_xe_may', 'ti_le_o_to', 'ti_le_xe_buyt', 'toc_do_thap_diem', 'toc_do_cao_diem', 'he_so_toc_do_xe_may',
       'he_so_toc_do_o_to', 'he_so_toc_do_xe_buyt', 'so_xe_cao_diem', 'so_xe_thap_diem', 'ti_le_qua_song',
       'tang_toc_hien_thi'].forEach(function (ma) {
        if (!(giaDinh[ma] >= 0)) throw { kieu: 'so', ma: ma };
      });
      kichBan = kq[2];
      quaSong = kq[3];
      if (!kichBan.length) throw { tep: 'kich_ban.csv', kieu: 'hong' };
      maKichBan = kichBan[0].ma;
      taoCapDiDen();
      return new Promise(function (xong) { S.khiNenSanSang(xong); });
    }).then(function () {
      themLop();
      sanSang = true;
    });
    return dangTai;
  }

  document.getElementById('bat-giao-thong').addEventListener('change', function (e) {
    dangBat = e.target.checked;
    veBang();
    if (!dangBat) { capNhat(); return; }
    document.getElementById('gt-mo-ta').textContent = t('gt_dang_tai', 'Đang tải mạng đường...');
    taiDuLieu().then(function () { veBang(); capNhat(); }).catch(baoLoiTai);
  });
  document.querySelectorAll('#gt-chon-ky button').forEach(function (b) {
    b.addEventListener('click', function () { ky = b.getAttribute('data-ky'); veBang(); capNhat(); });
  });
  document.getElementById('gt-xem-gia-dinh').addEventListener('click', function () {
    taiDuLieu().then(moGiaDinh).catch(baoLoiTai);
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) dangChay = false; else batDauChay();
  });
  S.khiDoiNgonNgu(function () { veBang(); });
  veBang();

  window.SaBan.giaoThong = {
    trangThai: function () {
      return { sanSang: sanSang, soXe: xe.length, kichBan: maKichBan, ky: ky, dangChay: dangChay,
               thongKe: sanSang ? demQuaSong(maKichBan) : null };
    }
  };
})();
