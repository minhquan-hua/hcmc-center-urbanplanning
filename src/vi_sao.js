/* Sa bàn vùng, bước 3: thẻ "Vì sao sáp nhập" (nội dung nằm trong data/vung/vi_sao_sap_nhap.csv) */
(function () {
  'use strict';
  var S = window.SaBan;
  if (!S) return;

  var TEP = 'data/vung/vi_sao_sap_nhap.csv';
  var COT = ['ma', 'nhom', 'cap_tin_cay', 'tieu_de_vi', 'tieu_de_en', 'noi_dung_vi',
             'nguon_ten', 'nguon', 'ngay_cap_nhat', 'da_kiem_chung'];
  var NHOM = [
    { ma: 'chính thức', chu: 'vs_nhom_chinh_thuc', macDinh: 'Văn bản và phát biểu chính thức' },
    { ma: 'góc nhìn', chu: 'vs_nhom_goc_nhin', macDinh: 'Góc nhìn nghiên cứu và chuyên gia' },
    { ma: 'câu hỏi', chu: 'vs_nhom_cau_hoi', macDinh: 'Câu hỏi gợi mở' }
  ];
  var CAP = {
    A: { chu: 'vs_cap_a', macDinh: 'A · văn bản chính thức' },
    B: { chu: 'vs_cap_b', macDinh: 'B · phát biểu lãnh đạo, đề án qua báo tường thuật' },
    C: { chu: 'vs_cap_c', macDinh: 'C · nghiên cứu, viện nghiên cứu quốc tế' },
    D: { chu: 'vs_cap_d', macDinh: 'D · ý kiến chuyên gia trên báo chính thống' }
  };

  var ds = [];
  var nut = document.getElementById('nut-vi-sao');

  function t(ma, macDinh) { return S.chu(ma) || macDinh || ma; }
  function en() { return S.ngonNgu() === 'en'; }
  function el(the, lop, chu) {
    var e = document.createElement(the);
    if (lop) e.className = lop;
    if (chu != null) e.textContent = chu;
    return e;
  }
  function dangMo() {
    return !document.getElementById('the').hidden && !!document.querySelector('#the-noi-dung .vs-the');
  }

  function veMuc(m) {
    var khung = el('div', 'vs-muc');
    var hang = el('div', 'the-hang-nhan');
    if (CAP[m.cap_tin_cay]) {
      var c = el('span', 'vs-cap vs-cap-' + m.cap_tin_cay.toLowerCase(), m.cap_tin_cay);
      c.title = t(CAP[m.cap_tin_cay].chu, CAP[m.cap_tin_cay].macDinh);
      hang.appendChild(c);
    }
    if (m.da_kiem_chung !== 'có') hang.appendChild(el('span', 'nhan-kc can', t('can_kiem_chung', 'cần kiểm chứng')));
    if (hang.childNodes.length) khung.appendChild(hang);
    khung.appendChild(el('h4', null, (en() && m.tieu_de_en) ? m.tieu_de_en : m.tieu_de_vi));
    khung.appendChild(el('p', null, (en() && m.noi_dung_en) ? m.noi_dung_en : m.noi_dung_vi));
    if (m.nguon) {
      var p = el('p', 'the-nguon');
      p.appendChild(document.createTextNode(t('nguon', 'Nguồn') + ': '));
      var a = el('a', null, m.nguon_ten || m.nguon);
      a.href = m.nguon; a.target = '_blank'; a.rel = 'noopener';
      p.appendChild(a);
      khung.appendChild(p);
    }
    return khung;
  }

  function veThe() {
    var nd = document.getElementById('the-noi-dung');
    nd.textContent = '';
    var goc = el('div', 'vs-the');
    goc.appendChild(el('p', 'the-loai', t('tam_vung', 'Toàn vùng')));
    goc.appendChild(el('h2', null, t('vs_tieu_de', 'Vì sao sáp nhập?')));
    goc.appendChild(el('p', null, t('vs_mo_dau',
      'Từ 1/7/2025, TP.HCM, Bình Dương và Bà Rịa - Vũng Tàu hợp nhất thành Thành phố Hồ Chí Minh.')));

    NHOM.forEach(function (n) {
      var muc = ds.filter(function (m) { return m.nhom === n.ma; });
      if (!muc.length) return;
      goc.appendChild(el('h3', null, t(n.chu, n.macDinh)));
      if (n.ma === 'câu hỏi') {
        goc.appendChild(el('p', 'ghi-chu vs-luu-y', t('vs_cau_hoi_luu_y',
          'Website chỉ đặt câu hỏi để thảo luận, không khẳng định câu trả lời.')));
      }
      muc.forEach(function (m) { goc.appendChild(veMuc(m)); });
    });

    goc.appendChild(el('h3', null, t('vs_cap_tieu_de', 'Cấp tin cậy của nguồn')));
    var ul = el('ul', 'vs-chu-giai');
    Object.keys(CAP).forEach(function (k) {
      var li = el('li');
      li.appendChild(el('span', 'vs-cap vs-cap-' + k.toLowerCase(), k));
      li.appendChild(el('span', null, t(CAP[k].chu, CAP[k].macDinh).replace(/^[A-D]\s*·\s*/, '')));
      ul.appendChild(li);
    });
    goc.appendChild(ul);
    goc.appendChild(el('p', 'ghi-chu', t('vs_luu_y',
      'Các ý kiến là của người được dẫn, không phải của website. Hãy đọc bài gốc trước khi trích dẫn.')));
    var ngay = ds.length ? ds[0].ngay_cap_nhat : '';
    if (ngay) goc.appendChild(el('p', 'ghi-chu', t('ngay_cap_nhat', 'Cập nhật') + ': ' + ngay));
    nd.appendChild(goc);
  }

  function mo() {
    if (!ds.length) return;
    if (S.haTang) S.haTang.boChon();
    if (S.vung) S.vung.boChon();
    veThe();
    var the = document.getElementById('the');
    the.hidden = false;
    the.scrollTop = 0;
    if (window.matchMedia('(max-width: 767px)').matches) S.datBang(false);
  }

  nut.addEventListener('click', mo);
  S.khiDoiNgonNgu(function () { if (dangMo()) veThe(); });
  S.khiDoiTam(function (tam) {
    if (tam !== 'vung' && document.querySelector('#the-noi-dung .vs-the')) document.getElementById('the').hidden = true;
  });

  fetch(TEP).then(function (r) {
    if (!r.ok) throw { kieu: 'thieu' };
    return r.text();
  }).then(function (vb) {
    var kq = S.docCSV(vb);
    var thieu = COT.filter(function (c) { return !kq.length || !(c in kq[0]); });
    if (thieu.length) throw { kieu: 'cot', cot: thieu };
    ds = kq.filter(function (m) { return m.tieu_de_vi && m.noi_dung_vi; });
    nut.disabled = !ds.length;
  }).catch(function (e) {
    console.error(e);
    nut.disabled = true;
    if (e && e.kieu === 'cot') {
      S.baoLoi('File ' + TEP + ' thiếu cột: ' + e.cot.join(', ') + '.\nHãy kiểm tra dòng đầu tiên của file.',
               'The file ' + TEP + ' is missing columns: ' + e.cot.join(', ') + '.');
    } else if (e && e.kieu === 'thieu') {
      S.baoLoi('Không tìm thấy file ' + TEP + '.', 'Could not find ' + TEP + '.');
    } else {
      S.baoLoi('Không hiển thị được thẻ "Vì sao sáp nhập".', 'Could not display the "Why merge?" card.');
    }
  });

  window.SaBan.viSao = { mo: mo, dangMo: dangMo };
})();
