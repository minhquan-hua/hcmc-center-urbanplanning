/* Nút "Blackboard": tấm bảng đen đính poster.
   Danh sách poster nằm trong data/bang_den/bang_den.csv; file poster nằm cùng thư mục data/bang_den/.
   Website chỉ đọc, không tải lên được: chủ dự án chép file vào thư mục rồi đưa lên mạng. */
(function () {
  'use strict';
  var S = window.SaBan;
  if (!S) return;

  var THU_MUC = 'data/bang_den/';
  var TEP = THU_MUC + 'bang_den.csv';
  var COT_BAT_BUOC = ['ma', 'tieu_de_vi', 'tep', 'tam', 'nguon_ten', 'ngay_cap_nhat', 'da_kiem_chung'];
  var LOAI = { jpg: 'anh', jpeg: 'anh', png: 'anh', webp: 'anh', pdf: 'pdf', csv: 'bang' };
  var TAM_HOP_LE = ['chung', 'trung-tam', 'vung', 'tay-nam-bo'];
  var TEN_TAM = { 'trung-tam': 'tam_trung_tam', 'vung': 'tam_vung', 'tay-nam-bo': 'tam_tnb' };
  var THU_PHONG_MAC_DINH = { 'trung-tam': 16, 'vung': 11, 'tay-nam-bo': 10 };
  var SO_DONG_TOI_DA = 500;
  var MAU_GHIM = ['#d64541', '#e0a526', '#2f80c2', '#3b9b5a'];
  var XOAY = [-1.6, 1.1, -0.6, 1.8, -1.2, 0.7];

  var ds = [];            // các poster đọc được
  var canhBao = [];       // lỗi từng dòng: { vi, en }
  var loiTep = null;      // lỗi cả file bang_den.csv: { vi, en }
  var dangTai = null;     // lời hứa tải file (chỉ tải một lần)
  var thieuTep = {};      // ma -> true khi không tìm thấy file poster
  var daKiemTep = false;
  var dangXem = null;     // poster đang mở to
  var nutTruoc = null;    // nút được bấm trước khi mở bảng, để trả lại con trỏ khi đóng
  var cuonLuoi = 0;       // vị trí cuộn của lưới poster
  var ghim = null;        // { marker, poster } ghim đang cắm trên bản đồ
  var boNhoBang = {};     // đường dẫn -> các dòng của file CSV đã đọc

  var lop = document.getElementById('bang-den');
  var than = document.getElementById('bden-than');
  var nutVe = document.getElementById('bden-ve');
  var nutDong = document.getElementById('bden-dong');
  var nutMo = document.getElementById('nut-bang-den');
  if (!lop || !than || !nutMo) return;

  function t(ma, macDinh) { return S.chu(ma) || macDinh || ma; }
  function en() { return S.ngonNgu() === 'en'; }
  function loi(vi, enChu) { return { vi: vi, en: enChu }; }
  // lời báo lỗi dành cho chủ dự án: khi xem tiếng Anh vẫn kèm bản tiếng Việt
  function chuLoi(l) { return en() && l.en ? l.en + '\n' + l.vi : l.vi; }
  function el(the, lopCss, chu) {
    var e = document.createElement(the);
    if (lopCss) e.className = lopCss;
    if (chu != null) e.textContent = chu;
    return e;
  }
  function duongDan(tep) {
    return THU_MUC + tep.split('/').map(encodeURIComponent).join('/');
  }
  function soNguyen(chu, n) { return chu.replace('{n}', n); }

  // ---------- Đọc danh sách poster ----------
  function docDanhSach(dong) {
    var cot = dong.length ? Object.keys(dong[0]) : [];
    var thieu = COT_BAT_BUOC.filter(function (c) { return cot.indexOf(c) < 0; });
    if (!dong.length) {
      loiTep = loi('File data/bang_den/bang_den.csv chưa có dòng poster nào.',
                   'The file data/bang_den/bang_den.csv has no poster rows yet.');
      return;
    }
    if (thieu.length) {
      loiTep = loi('File data/bang_den/bang_den.csv thiếu cột: ' + thieu.join(', ') +
                   '.\nDòng đầu tiên phải có đủ các cột: ' + COT_BAT_BUOC.join(', ') + '.',
                   'The file data/bang_den/bang_den.csv is missing columns: ' + thieu.join(', ') +
                   '.\nIts first line must contain: ' + COT_BAT_BUOC.join(', ') + '.');
      return;
    }
    var daCo = {};
    dong.forEach(function (d, i) {
      var so = i + 2; // số dòng như khi mở bằng Excel (dòng 1 là tên cột)
      var vt = 'Dòng ' + so + ': ', vtEn = 'Row ' + so + ': ';
      var tep = (d.tep || '').replace(/\\/g, '/');
      if (!d.tieu_de_vi) {
        canhBao.push(loi(vt + 'chưa có tiêu đề ở cột tieu_de_vi, poster này bị bỏ qua.',
                         vtEn + 'no title in column tieu_de_vi; this poster was skipped.'));
        return;
      }
      if (!tep) {
        canhBao.push(loi(vt + 'chưa ghi tên file ở cột tep, poster "' + d.tieu_de_vi + '" bị bỏ qua.',
                         vtEn + 'no file name in column tep; poster "' + d.tieu_de_vi + '" was skipped.'));
        return;
      }
      var duoi = (tep.split('.').pop() || '').toLowerCase();
      var loai = LOAI[duoi];
      if (!loai || tep.indexOf('.') < 0) {
        canhBao.push(loi(vt + 'file "' + tep + '" chưa mở được trên website. Chỉ nhận ảnh JPG, PNG, WebP, file PDF và bảng CSV. File Word, Excel, PowerPoint: hãy lưu thành PDF.',
                         vtEn + 'file "' + tep + '" cannot be shown on the website. Only JPG, PNG, WebP images, PDF files and CSV tables are supported.'));
        return;
      }
      var ma = d.ma || ('dong-' + so);
      if (daCo[ma]) {
        canhBao.push(loi(vt + 'mã "' + ma + '" ở cột ma bị trùng với dòng khác; hãy đặt mã khác.',
                         vtEn + 'code "' + ma + '" in column ma is used twice; please use another code.'));
        ma = ma + '-' + so;
      }
      daCo[ma] = true;
      var tam = (d.tam || 'chung').split('|').map(function (x) { return x.trim().toLowerCase(); }).filter(Boolean);
      var tamLa = tam.filter(function (x) { return TAM_HOP_LE.indexOf(x) < 0; });
      if (tamLa.length || !tam.length) {
        canhBao.push(loi(vt + 'cột tam có giá trị lạ "' + tamLa.join('|') + '"; tạm hiện poster ở mọi tầm. Chỉ dùng: ' + TAM_HOP_LE.join(', ') + '.',
                         vtEn + 'column tam has an unknown value "' + tamLa.join('|') + '"; the poster is shown in every view for now. Allowed: ' + TAM_HOP_LE.join(', ') + '.'));
        tam = ['chung'];
      }
      var p = {
        ma: ma, d: d, tep: tep, loai: loai, tam: tam,
        anhNho: (d.anh_nho || '').replace(/\\/g, '/'),
        canKiemChung: d.da_kiem_chung !== 'có'
      };
      if (p.anhNho && !/\.(jpe?g|png|webp)$/i.test(p.anhNho)) {
        canhBao.push(loi(vt + 'ảnh thu nhỏ "' + p.anhNho + '" phải là ảnh JPG, PNG hoặc WebP; tạm dùng biểu tượng.',
                         vtEn + 'thumbnail "' + p.anhNho + '" must be a JPG, PNG or WebP image; an icon is used instead.'));
        p.anhNho = '';
      }
      if (d.kinh_do || d.vi_do) {
        var x = parseFloat(String(d.kinh_do).replace(',', '.'));
        var y = parseFloat(String(d.vi_do).replace(',', '.'));
        if (isFinite(x) && isFinite(y) && x >= 100 && x <= 111 && y >= 4 && y <= 17) {
          p.viTri = [x, y];
          var z = parseFloat(String(d.thu_phong || '').replace(',', '.'));
          if (isFinite(z)) p.thuPhong = Math.max(4, Math.min(19, z));
        } else {
          canhBao.push(loi(vt + 'kinh_do và vi_do phải là con số trong vùng bản đồ (kinh độ khoảng 100-111, vĩ độ khoảng 4-17, dùng dấu chấm). Poster vẫn hiện nhưng chưa ghim được lên bản đồ.',
                           vtEn + 'kinh_do and vi_do must be numbers inside the map area (longitude about 100-111, latitude about 4-17). The poster is shown but cannot be pinned on the map.'));
        }
      }
      ds.push(p);
    });
  }

  function taiDanhSach() {
    if (dangTai) return dangTai;
    dangTai = fetch(TEP, { cache: 'no-cache' })
      .then(function (r) {
        if (!r.ok) throw new Error('khong_tim_thay');
        return r.text();
      })
      .then(function (vb) { docDanhSach(S.docCSV(vb)); })
      .catch(function (e) {
        console.error(e);
        if (!loiTep) {
          loiTep = e.message === 'khong_tim_thay'
            ? loi('Không tìm thấy file data/bang_den/bang_den.csv. Bảng đen chưa có poster nào.',
                  'The file data/bang_den/bang_den.csv was not found, so the board has no posters.')
            : loi('Không đọc được file data/bang_den/bang_den.csv. Hãy mở website bằng cách bấm đúp xem_thu.bat, hoặc kiểm tra kết nối mạng.',
                  'Could not read data/bang_den/bang_den.csv. Open the site with xem_thu.bat, or check your connection.');
        }
      });
    return dangTai;
  }

  // Kiểm tra một lần xem file PDF, CSV có thật trên máy chủ không (ảnh thì tự biết khi tải hỏng)
  function kiemTep() {
    if (daKiemTep) return;
    daKiemTep = true;
    ds.forEach(function (p) {
      if (p.loai === 'anh') return;
      fetch(duongDan(p.tep), { method: 'HEAD', cache: 'no-cache' })
        .then(function (r) { if (!r.ok) danhDauThieu(p, p.tep); })
        .catch(function () {});
    });
  }

  function danhDauThieu(p, tep) {
    var lanDau = !thieuTep[p.ma];
    thieuTep[p.ma] = true;
    if (lanDau) {
      canhBao.push(loi('Không tìm thấy file data/bang_den/' + tep + ' (poster "' + p.d.tieu_de_vi + '"). Kiểm tra tên file, kể cả chữ hoa và chữ thường.',
                       'File data/bang_den/' + tep + ' was not found (poster "' + p.d.tieu_de_vi + '"). Check the file name, including upper and lower case.'));
    }
    if (lanDau && !lop.hidden && !dangXem) veLuoi(true);
  }

  // ---------- Biểu tượng ----------
  function bieuTuong(loai) {
    var s = document.createElement('span');
    s.className = 'bden-bieu-tuong';
    if (loai === 'anh') {
      // khung ảnh có núi và mặt trời: dùng khi ảnh không tải được
      s.innerHTML = '<svg viewBox="0 0 120 90" aria-hidden="true"><rect x="24" y="14" width="72" height="56" rx="3" fill="#fff" stroke="#c9ccd1" stroke-width="2"/>' +
        '<circle cx="76" cy="30" r="6" fill="#e0a526"/><path d="M28 66l22-24 14 15 9-9 19 18z" fill="#9aa6b2"/></svg>';
      return s;
    }
    var mau = loai === 'pdf' ? '#c0392b' : '#2e7d4f';
    var chu = loai === 'pdf' ? 'PDF' : 'CSV';
    var ruot = loai === 'pdf'
      ? '<path d="M38 46h44M38 56h44M38 66h30M38 76h40" stroke="#b9bdc4" stroke-width="3" stroke-linecap="round"/>'
      : '<path d="M36 44h48v40H36zM36 54h48M36 64h48M36 74h48M52 44v40M68 44v40" stroke="#9aa6b2" stroke-width="2.2" fill="none"/>';
    s.innerHTML = '<svg viewBox="0 0 120 90" aria-hidden="true">' +
      '<path d="M30 6h46l14 14v64H30z" fill="#fff" stroke="#c9ccd1" stroke-width="2"/>' +
      '<path d="M76 6v14h14" fill="#eceef1" stroke="#c9ccd1" stroke-width="2"/>' + ruot +
      '<rect x="22" y="22" width="34" height="16" rx="2" fill="' + mau + '"/>' +
      '<text x="39" y="34" text-anchor="middle" font-family="system-ui,Arial,sans-serif" font-size="11" font-weight="700" fill="#fff">' + chu + '</text></svg>';
    return s;
  }

  var SVG_GHIM = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="currentColor"/></svg>';

  function tenLoai(loai) {
    return loai === 'anh' ? t('bd_loai_anh', 'Ảnh') : loai === 'pdf' ? t('bd_loai_pdf', 'PDF') : t('bd_loai_bang', 'Bảng số liệu');
  }

  function anhNho(p) {
    var hop = el('span', 'bden-anh');
    var src = p.anhNho ? duongDan(p.anhNho) : (p.loai === 'anh' && !thieuTep[p.ma] ? duongDan(p.tep) : '');
    if (!src) { hop.appendChild(bieuTuong(p.loai)); return hop; }
    var img = el('img');
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = src;
    img.addEventListener('error', function () {
      hop.textContent = '';
      if (p.anhNho) {
        // ảnh thu nhỏ hỏng: báo một lần rồi dùng ảnh gốc (nếu là ảnh) hoặc biểu tượng
        canhBao.push(loi('Không tìm thấy ảnh thu nhỏ data/bang_den/' + p.anhNho + ' (poster "' + p.d.tieu_de_vi + '"); tạm dùng ảnh gốc hoặc biểu tượng.',
                         'Thumbnail data/bang_den/' + p.anhNho + ' was not found (poster "' + p.d.tieu_de_vi + '"); the original or an icon is used instead.'));
        p.anhNho = '';
        hop.appendChild(anhNho(p).firstChild);
        if (!lop.hidden && !dangXem) veCanhBao();
      } else {
        hop.appendChild(bieuTuong(p.loai));
        danhDauThieu(p, p.tep);
      }
    });
    hop.appendChild(img);
    return hop;
  }

  // ---------- Lưới poster ----------
  function hienTrongTam(p) {
    return p.tam.indexOf('chung') >= 0 || p.tam.indexOf(S.tam()) >= 0;
  }

  function veCanhBao() {
    var cu = than.querySelector('.bden-canh-bao');
    if (cu) cu.parentNode.removeChild(cu);
    if (!canhBao.length) return;
    var hop = el('div', 'bden-canh-bao');
    hop.setAttribute('role', 'note');
    hop.appendChild(el('p', null, t('bd_canh_bao', 'Một số poster chưa hiện được hoặc còn lỗi:')));
    var ul = el('ul');
    canhBao.forEach(function (c) { ul.appendChild(el('li', null, chuLoi(c))); });
    hop.appendChild(ul);
    than.appendChild(hop);
  }

  function veLuoi(giuCuon) {
    dangXem = null;
    nutVe.hidden = true;
    var cuon = giuCuon ? than.scrollTop : 0;
    than.textContent = '';
    if (loiTep) {
      var hopLoi = el('div', 'bden-canh-bao bden-loi-tep');
      hopLoi.setAttribute('role', 'alert');
      hopLoi.appendChild(el('p', null, chuLoi(loiTep)));
      than.appendChild(hopLoi);
      return;
    }
    var hien = ds.filter(hienTrongTam);
    var tenTam = t(TEN_TAM[S.tam()], S.tam());
    than.appendChild(el('p', 'bden-phu',
      tenTam + ' · ' + soNguyen(t('bd_so_poster', '{n} poster'), hien.length) + '. ' + t('bd_huong_dan', 'Bấm vào một poster để xem đầy đủ.')));
    if (!hien.length) {
      than.appendChild(el('p', 'bden-trong', t('bd_trong', 'Chưa có poster nào cho tầm này.')));
    } else {
      var ul = el('ul', 'bden-luoi');
      hien.forEach(function (p, i) {
        var li = el('li');
        var nut = el('button', 'bden-poster');
        nut.type = 'button';
        nut.setAttribute('data-ma', p.ma);
        nut.style.setProperty('--xoay', XOAY[i % XOAY.length] + 'deg');
        nut.style.setProperty('--ghim', MAU_GHIM[i % MAU_GHIM.length]);
        nut.appendChild(anhNho(p));
        nut.appendChild(el('span', 'bden-ten', S.cot(p.d, 'tieu_de')));
        var nhan = el('span', 'bden-nhan');
        nhan.appendChild(el('span', 'bden-loai', tenLoai(p.loai)));
        if (thieuTep[p.ma]) nhan.appendChild(el('span', 'nhan-kc can', t('bd_khong_tim_thay', 'Không tìm thấy file')));
        if (p.canKiemChung) nhan.appendChild(el('span', 'nhan-kc can', t('can_kiem_chung', 'cần kiểm chứng')));
        if (p.viTri) {
          var vt = el('span', 'bden-co-vi-tri');
          vt.innerHTML = SVG_GHIM;
          vt.title = t('bd_co_vi_tri', 'Có vị trí trên bản đồ');
          vt.appendChild(el('span', 'bden-an', t('bd_co_vi_tri', 'Có vị trí trên bản đồ')));
          nhan.appendChild(vt);
        }
        nut.appendChild(nhan);
        nut.addEventListener('click', function () { cuonLuoi = than.scrollTop; moPoster(p); });
        li.appendChild(nut);
        ul.appendChild(li);
      });
      than.appendChild(ul);
    }
    veCanhBao();
    than.scrollTop = cuon;
    kiemTep();
  }

  // ---------- Xem một poster ----------
  function giaiMa(buf) {
    // File CSV lưu từ Excel có thể là UTF-8 hoặc bảng mã tiếng Việt của Windows
    try { return new TextDecoder('utf-8', { fatal: true }).decode(buf); } catch (e) {}
    try { return new TextDecoder('windows-1258').decode(buf); } catch (e2) {}
    return new TextDecoder('utf-8').decode(buf);
  }

  function veBangSo(hop, p) {
    var url = duongDan(p.tep);
    hop.appendChild(el('p', 'bden-dang-tai', t('bd_dang_tai', 'Đang tải…')));
    var lay = boNhoBang[url] ? Promise.resolve(boNhoBang[url]) :
      fetch(url).then(function (r) {
        if (!r.ok) throw new Error('khong_tim_thay');
        return r.arrayBuffer();
      }).then(function (buf) {
        var dong = S.docHang(giaiMa(buf));
        boNhoBang[url] = dong;
        return dong;
      });
    lay.then(function (dong) {
      if (dangXem !== p) return;
      hop.textContent = '';
      if (!dong.length) { hop.appendChild(el('p', 'bden-dang-tai', 'File CSV trống.')); return; }
      var soCot = dong.reduce(function (m, d) { return Math.max(m, d.length); }, 0);
      var than2 = dong.slice(1, 1 + SO_DONG_TOI_DA);
      // cột nào toàn số thì canh phải cho dễ so
      var laSo = [];
      for (var k = 0; k < soCot; k++) {
        var coGiaTri = false, toanSo = true;
        than2.forEach(function (d) {
          var v = (d[k] || '').trim();
          if (!v) return;
          coGiaTri = true;
          if (!/^[-+]?[\d\s.,]+%?$/.test(v)) toanSo = false;
        });
        laSo[k] = coGiaTri && toanSo;
      }
      var bang = el('table', 'bden-bang-so');
      var thead = el('thead'), tr = el('tr');
      for (var c = 0; c < soCot; c++) tr.appendChild(el('th', laSo[c] ? 'so' : null, (dong[0][c] || '').trim()));
      thead.appendChild(tr);
      bang.appendChild(thead);
      var tbody = el('tbody');
      than2.forEach(function (d) {
        var r = el('tr');
        for (var c2 = 0; c2 < soCot; c2++) r.appendChild(el('td', laSo[c2] ? 'so' : null, (d[c2] || '').trim()));
        tbody.appendChild(r);
      });
      bang.appendChild(tbody);
      hop.appendChild(bang);
      if (dong.length - 1 > SO_DONG_TOI_DA) {
        hop.parentNode.insertBefore(el('p', 'bden-goi-y', soNguyen(t('bd_gioi_han_dong', 'Chỉ hiện {n} dòng đầu.'), SO_DONG_TOI_DA)), hop.nextSibling);
      }
    }).catch(function (e) {
      if (dangXem !== p) return;
      hop.textContent = '';
      hop.appendChild(el('p', 'bden-dang-tai bden-loi', e.message === 'khong_tim_thay'
        ? t('bd_khong_tim_thay', 'Không tìm thấy file') + ': data/bang_den/' + p.tep
        : (en() ? 'Could not read this CSV file.' : 'Không đọc được file CSV này.')));
    });
  }

  function veAnh(hop, p) {
    var img = el('img');
    img.src = duongDan(p.tep);
    img.alt = S.cot(p.d, 'tieu_de');
    img.addEventListener('click', function (e) {
      // bấm để phóng to, giữ chỗ vừa bấm ở giữa khung
      var r = img.getBoundingClientRect();
      var tlX = (e.clientX - r.left) / r.width, tlY = (e.clientY - r.top) / r.height;
      var to = hop.classList.toggle('phong-to');
      if (to) {
        hop.scrollLeft = img.offsetWidth * tlX - hop.clientWidth / 2;
        hop.scrollTop = img.offsetHeight * tlY - hop.clientHeight / 2;
      }
    });
    img.addEventListener('error', function () {
      hop.textContent = '';
      hop.appendChild(el('p', 'bden-dang-tai bden-loi', t('bd_khong_tim_thay', 'Không tìm thấy file') + ': data/bang_den/' + p.tep));
    });
    hop.appendChild(img);
  }

  function vePdf(hop, p) {
    if (navigator.pdfViewerEnabled === true && window.matchMedia('(min-width: 768px)').matches) {
      var khung = el('iframe', 'bden-pdf');
      khung.src = duongDan(p.tep) + '#view=FitH';
      khung.title = S.cot(p.d, 'tieu_de');
      hop.appendChild(khung);
      return;
    }
    // Điện thoại: trình duyệt thường không hiện PDF ngay trong trang, nên mở thẻ mới
    hop.classList.add('bden-pdf-ngoai');
    var xemTruoc = anhNho(p);
    xemTruoc.classList.add('bden-xem-truoc');
    hop.appendChild(xemTruoc);
    hop.appendChild(el('p', 'bden-goi-y', t('bd_pdf_the_moi', 'Trình duyệt này mở PDF trong một thẻ mới.')));
    var a = el('a', 'bden-nut chinh', t('bd_mo_pdf', 'Mở PDF trong thẻ mới'));
    a.href = duongDan(p.tep);
    a.target = '_blank';
    a.rel = 'noopener';
    hop.appendChild(a);
  }

  function moPoster(p) {
    dangXem = p;
    nutVe.hidden = false;
    than.textContent = '';
    var d = p.d;
    var to = el('article', 'bden-to');
    var cotTep = el('div', 'bden-to-tep');
    var hop = el('div', 'bden-tep bden-tep-' + p.loai);
    cotTep.appendChild(hop);
    if (p.loai === 'anh') {
      veAnh(hop, p);
      cotTep.appendChild(el('p', 'bden-goi-y', t('bd_goi_y_anh', 'Bấm vào ảnh để phóng to hoặc thu nhỏ.')));
    } else if (p.loai === 'pdf') vePdf(hop, p);
    else veBangSo(hop, p);

    var tt = el('div', 'bden-thong-tin');
    var tieuDe = el('h3', null, S.cot(d, 'tieu_de'));
    tieuDe.id = 'bden-poster-ten';
    tieuDe.tabIndex = -1;
    tt.appendChild(tieuDe);
    var hang = el('div', 'the-hang-nhan');
    hang.appendChild(el('span', 'bden-loai', tenLoai(p.loai)));
    if (p.canKiemChung) hang.appendChild(el('span', 'nhan-kc can', t('can_kiem_chung', 'cần kiểm chứng')));
    tt.appendChild(hang);
    var moTa = S.cot(d, 'mo_ta');
    if (moTa) tt.appendChild(el('p', 'bden-mo-ta', moTa));
    var nguon = el('p', 'the-nguon');
    nguon.appendChild(el('strong', null, t('bd_nguon', 'Nguồn') + ': '));
    var tenNguon = S.cot(d, 'nguon_ten');
    if (d.nguon && /^https?:\/\//.test(d.nguon)) {
      var a = el('a', null, tenNguon || d.nguon);
      a.href = d.nguon;
      a.target = '_blank';
      a.rel = 'noopener';
      nguon.appendChild(a);
    } else nguon.appendChild(document.createTextNode(tenNguon));
    tt.appendChild(nguon);
    tt.appendChild(el('p', 'bden-ngay', t('bd_cap_nhat', 'Cập nhật') + ': ' + d.ngay_cap_nhat));

    var hangNut = el('div', 'bden-hang-nut');
    if (p.viTri) {
      var nutBanDo = el('button', 'bden-nut chinh', t('bd_xem_ban_do', 'Xem vị trí trên bản đồ'));
      nutBanDo.type = 'button';
      nutBanDo.addEventListener('click', function () { xemTrenBanDo(p); });
      hangNut.appendChild(nutBanDo);
    }
    var moTep = el('a', 'bden-nut', t('bd_mo_tep', 'Mở file gốc'));
    moTep.href = duongDan(p.tep);
    moTep.target = '_blank';
    moTep.rel = 'noopener';
    hangNut.appendChild(moTep);
    var taiVe = el('a', 'bden-nut', t('bd_tai_ve', 'Tải về'));
    taiVe.href = duongDan(p.tep);
    taiVe.setAttribute('download', p.tep.split('/').pop());
    hangNut.appendChild(taiVe);
    tt.appendChild(hangNut);

    to.appendChild(cotTep);
    to.appendChild(tt);
    than.appendChild(to);
    than.scrollTop = 0;
    tieuDe.focus({ preventScroll: true });
  }

  function veLuoiVa(maTraVe) {
    veLuoi(false);
    than.scrollTop = cuonLuoi;
    var nut = maTraVe && than.querySelector('.bden-poster[data-ma="' + (window.CSS && CSS.escape ? CSS.escape(maTraVe) : maTraVe) + '"]');
    (nut || nutDong).focus({ preventScroll: !!nut });
  }

  // ---------- Mở, đóng bảng ----------
  function mo(maPoster) {
    nutTruoc = document.activeElement;
    lop.hidden = false;
    document.body.classList.add('dang-bang-den');
    than.textContent = '';
    than.appendChild(el('p', 'bden-phu', t('bd_dang_tai', 'Đang tải…')));
    nutDong.focus();
    taiDanhSach().then(function () {
      if (lop.hidden) return;
      var p = maPoster && ds.filter(function (x) { return x.ma === maPoster; })[0];
      cuonLuoi = 0;
      veLuoi(false);
      if (p) moPoster(p);
    });
  }

  function dong() {
    if (lop.hidden) return;
    lop.hidden = true;
    dangXem = null;
    than.textContent = '';
    document.body.classList.remove('dang-bang-den');
    if (nutTruoc && nutTruoc.focus && document.contains(nutTruoc)) nutTruoc.focus();
    else nutMo.focus();
  }

  nutMo.addEventListener('click', function () { mo(); });
  nutDong.addEventListener('click', dong);
  nutVe.addEventListener('click', function () {
    var ma = dangXem && dangXem.ma;
    veLuoiVa(ma);
  });
  // bấm ra ngoài tấm bảng (phần nền tối) thì đóng
  lop.addEventListener('click', function (e) { if (e.target === lop) dong(); });

  lop.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (dangXem) veLuoiVa(dangXem.ma);
      else dong();
      return;
    }
    if (e.key !== 'Tab') return;
    // giữ con trỏ bàn phím trong bảng khi bảng đang mở
    var cac = Array.prototype.filter.call(
      lop.querySelectorAll('button, a[href], iframe, [tabindex]:not([tabindex="-1"])'),
      function (x) { return !x.hidden && x.offsetParent !== null; });
    if (!cac.length) return;
    var dau = cac[0], cuoi = cac[cac.length - 1];
    if (e.shiftKey && document.activeElement === dau) { e.preventDefault(); cuoi.focus(); }
    else if (!e.shiftKey && document.activeElement === cuoi) { e.preventDefault(); dau.focus(); }
  });

  // ---------- Ghim poster lên bản đồ ----------
  function trongKhung(t2, diem) {
    var g = S.gioiHanTam(t2);
    return diem[0] >= g[0][0] && diem[0] <= g[1][0] && diem[1] >= g[0][1] && diem[1] <= g[1][1];
  }

  function chonTam(p) {
    var hienTai = S.tam();
    if (trongKhung(hienTai, p.viTri)) return hienTai;
    var thu = p.tam.indexOf('chung') >= 0 ? ['trung-tam', 'vung', 'tay-nam-bo'] : p.tam;
    var cacTam = S.cacTam();
    for (var i = 0; i < thu.length; i++) {
      if (cacTam.indexOf(thu[i]) >= 0 && trongKhung(thu[i], p.viTri)) return thu[i];
    }
    return hienTai;
  }

  function boGhim() {
    if (ghim) { ghim.marker.remove(); ghim = null; }
  }

  function veNhanGhim() {
    if (!ghim) return;
    var ten = S.cot(ghim.poster.d, 'tieu_de');
    ghim.nhan.textContent = ten;
    ghim.nhan.setAttribute('aria-label', t('bd_mo_poster', 'Mở poster') + ': ' + ten);
    ghim.bo.setAttribute('aria-label', t('bd_bo_ghim', 'Bỏ ghim'));
    ghim.bo.title = t('bd_bo_ghim', 'Bỏ ghim');
  }

  function catGhim(p) {
    boGhim();
    var e = el('div', 'bden-ghim');
    var the = el('div', 'bden-ghim-the');
    var nhan = el('button', 'bden-ghim-nhan');
    nhan.type = 'button';
    var bo = el('button', 'bden-ghim-bo', '×');
    bo.type = 'button';
    the.appendChild(nhan);
    the.appendChild(bo);
    e.appendChild(the);
    e.appendChild(el('span', 'bden-ghim-kim'));
    // không để thao tác trên ghim làm bản đồ kéo hoặc chọn lớp bên dưới
    ['mousedown', 'touchstart', 'pointerdown', 'click', 'dblclick', 'wheel'].forEach(function (ten) {
      e.addEventListener(ten, function (ev) { ev.stopPropagation(); }, { passive: true });
    });
    nhan.addEventListener('click', function () { mo(p.ma); });
    bo.addEventListener('click', boGhim);
    ghim = {
      poster: p, nhan: nhan, bo: bo,
      marker: new maplibregl.Marker({ element: e, anchor: 'bottom' }).setLngLat(p.viTri).addTo(S.banDo)
    };
    veNhanGhim();
  }

  function xemTrenBanDo(p) {
    var tamDich = chonTam(p);
    dong();
    var banDo = S.banDo;
    function bay() {
      var rong = window.matchMedia('(min-width: 768px)').matches;
      var bangLop = document.getElementById('bang');
      var bangMo = bangLop && !bangLop.classList.contains('dong-lai');
      banDo.flyTo({
        center: p.viTri,
        zoom: p.thuPhong || THU_PHONG_MAC_DINH[S.tam()] || 12,
        offset: rong ? [bangMo ? 170 : 0, 25] : [0, 35],
        duration: 1500,
        essential: true
      });
      catGhim(p);
    }
    if (tamDich !== S.tam()) {
      S.datTam(tamDich);
      banDo.once('moveend', bay);
    } else bay();
  }

  // ---------- Đổi tầm, đổi ngôn ngữ ----------
  S.khiDoiTam(function () {
    boGhim();
    if (!lop.hidden && !dangXem) veLuoi(false);
  });
  S.khiDoiNgonNgu(function () {
    veNhanGhim();
    if (lop.hidden || !dangTai) return;
    if (dangXem) moPoster(dangXem);
    else veLuoi(true);
  });

  S.bangDen = { mo: mo, dong: dong, boGhim: boGhim };
})();
