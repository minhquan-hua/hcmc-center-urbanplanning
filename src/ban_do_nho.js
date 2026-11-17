/* Bản đồ nhỏ Việt Nam ở góc dưới: khung đỏ chỉ vùng đang xem trên bản đồ lớn (hiện ở cả ba tầm) */
(function () {
  'use strict';
  var S = window.SaBan;
  if (!S || !window.maplibregl) return;
  var banDo = S.banDo;

  // Cả nước, gồm quần đảo Hoàng Sa và Trường Sa
  var KHUNG_VN = [[101.8, 7.2], [117.6, 23.6]];
  var KHOA_AN = 'ban_do_nho_an';
  var khoi = document.getElementById('ban-do-nho');
  var nut = document.getElementById('bdn-nut');
  var khung = document.getElementById('bdn-khung');

  // Tên gọi trên bản đồ nhỏ: địa danh giữ tiếng Việt có dấu ở cả hai ngôn ngữ
  var NHAN = { type: 'FeatureCollection', features: [
    { type: 'Feature', properties: { ten: 'Hoàng Sa' }, geometry: { type: 'Point', coordinates: [112.0, 16.5] } },
    { type: 'Feature', properties: { ten: 'Trường Sa' }, geometry: { type: 'Point', coordinates: [113.6, 9.9] } },
    { type: 'Feature', properties: { ten: 'Hà Nội', diem: true }, geometry: { type: 'Point', coordinates: [105.85, 21.03] } },
    { type: 'Feature', properties: { ten: 'TP.HCM', diem: true }, geometry: { type: 'Point', coordinates: [106.70, 10.78] } }
  ] };

  var an = false;
  try { an = localStorage.getItem(KHOA_AN) === '1'; } catch (e) {}

  var nho = null;
  function tao() {
    if (nho) return;
    nho = new maplibregl.Map({
      container: khung,
      style: {
        version: 8,
        glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
        sources: {
          omt: { type: 'vector', url: 'https://tiles.openfreemap.org/planet' },
          nhan: { type: 'geojson', data: NHAN },
          khung: { type: 'geojson', data: { type: 'FeatureCollection', features: [] } }
        },
        layers: [
          { id: 'nen', type: 'background', paint: { 'background-color': '#eef0e8' } },
          { id: 'nuoc', type: 'fill', source: 'omt', 'source-layer': 'water', paint: { 'fill-color': '#b9d6e6' } },
          { id: 'bien-gioi', type: 'line', source: 'omt', 'source-layer': 'boundary',
            filter: ['all', ['==', ['get', 'admin_level'], 2], ['!=', ['get', 'maritime'], 1]],
            paint: { 'line-color': '#7a8691', 'line-width': 0.8 } },
          { id: 'diem', type: 'circle', source: 'nhan', filter: ['==', ['get', 'diem'], true],
            paint: { 'circle-radius': 2, 'circle-color': '#22313f' } },
          { id: 'nhan', type: 'symbol', source: 'nhan',
            layout: { 'text-field': ['get', 'ten'], 'text-font': ['Noto Sans Regular'], 'text-size': 9,
                      'text-anchor': ['case', ['==', ['get', 'diem'], true], 'right', 'center'],
                      'text-offset': ['case', ['==', ['get', 'diem'], true], ['literal', [-0.5, 0]], ['literal', [0, 0]]],
                      'text-allow-overlap': true },
            paint: { 'text-color': '#4a5866', 'text-halo-color': '#ffffff', 'text-halo-width': 1.2 } },
          { id: 'khung-nen', type: 'fill', source: 'khung', filter: ['==', ['geometry-type'], 'Polygon'],
            paint: { 'fill-color': '#c92a2a', 'fill-opacity': 0.15 } },
          { id: 'khung-vien', type: 'line', source: 'khung', filter: ['==', ['geometry-type'], 'Polygon'],
            paint: { 'line-color': '#c92a2a', 'line-width': 1.8 } },
          // vùng đang xem quá nhỏ (tầm trung tâm) thì hiện thêm một chấm đỏ cho dễ thấy
          { id: 'khung-cham', type: 'circle', source: 'khung', filter: ['==', ['geometry-type'], 'Point'],
            paint: { 'circle-radius': 3.5, 'circle-color': '#c92a2a', 'circle-stroke-color': '#ffffff', 'circle-stroke-width': 1.2 } }
        ]
      },
      bounds: KHUNG_VN,
      interactive: false,
      attributionControl: false,
      fadeDuration: 0
    });
    nho.on('load', capNhat);
    nho.on('error', function (e) { console.warn('Bản đồ nhỏ:', e && e.error); });
  }

  function capNhat() {
    if (!nho || an || !nho.getSource('khung')) return;
    var b = banDo.getBounds();
    var t = b.getWest(), d = b.getEast(), n = b.getSouth(), bc = b.getNorth();
    var cacHinh = [{ type: 'Feature', properties: {},
      geometry: { type: 'Polygon', coordinates: [[[t, n], [d, n], [d, bc], [t, bc], [t, n]]] } }];
    // độ rộng khung trên bản đồ nhỏ (điểm ảnh); nhỏ hơn 6 thì thêm chấm
    var a = nho.project([t, n]), c = nho.project([d, bc]);
    if (Math.abs(c.x - a.x) < 6) {
      cacHinh.push({ type: 'Feature', properties: {},
        geometry: { type: 'Point', coordinates: [(t + d) / 2, (n + bc) / 2] } });
    }
    nho.getSource('khung').setData({ type: 'FeatureCollection', features: cacHinh });
  }

  function vuaKhung() {
    if (!nho) return;
    nho.resize();
    nho.fitBounds(KHUNG_VN, { padding: 2, duration: 0 });
    capNhat();
  }

  function datAn(moi) {
    an = moi;
    khoi.classList.toggle('thu-gon', an);
    nut.setAttribute('aria-expanded', String(!an));
    nut.textContent = an ? (S.chu('bdn_hien') || 'Bản đồ nhỏ') : '×';
    nut.setAttribute('aria-label', an ? (S.chu('bdn_hien') || 'Bản đồ nhỏ') : (S.chu('bdn_an') || 'Ẩn bản đồ nhỏ'));
    nut.title = nut.getAttribute('aria-label');
    try { localStorage.setItem(KHOA_AN, an ? '1' : '0'); } catch (e) {}
    if (!an) { tao(); setTimeout(vuaKhung, 0); }
  }

  nut.addEventListener('click', function () { datAn(!an); });
  S.khiDoiNgonNgu(function () {
    var ten = (S.chu('bdn_ten') || 'Bản đồ nhỏ Việt Nam') + '. ' + (S.chu('bdn_khung') || '');
    khung.setAttribute('aria-label', ten);
    khung.title = S.chu('bdn_khung') || '';
    datAn(an);
  });
  banDo.on('move', capNhat);
  window.addEventListener('resize', function () { setTimeout(vuaKhung, 50); });
  datAn(an);
})();
