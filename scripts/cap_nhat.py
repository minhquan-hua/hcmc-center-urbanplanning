# -*- coding: utf-8 -*-
"""Xử lý lại toàn bộ dữ liệu của Sa bàn quy hoạch TP.HCM.

Chạy:  py scripts/cap_nhat.py            (dùng dữ liệu OpenStreetMap đã tải sẵn)
       py scripts/cap_nhat.py --tai-lai  (tải lại ranh giới từ OpenStreetMap)

Chỉ dùng thư viện có sẵn của Python, không cần cài thêm gì.
"""
import csv
import json
import math
import sys
import time
import unicodedata
import urllib.parse
import urllib.request
from pathlib import Path

GOC = Path(__file__).resolve().parent.parent
HC = GOC / 'data' / 'hanh_chinh'
THO = HC / 'goc_osm'          # dữ liệu thô tải từ OpenStreetMap
OVERPASS = 'https://overpass-api.de/api/interpreter'
KHUNG = '10.745,106.665,10.83,106.80'       # nam, tây, bắc, đông
NGAY_CU = '2025-05-01T00:00:00Z'            # thời điểm lấy ranh giới cũ
QUAN_CU = ['Quận 1', 'Quận 3', 'Quận 4', 'Quận Bình Thạnh', 'Thành phố Thủ Đức']
QUAN_VE_VIEN = ['Quận 1', 'Quận 3', 'Quận 4', 'Quận Bình Thạnh']
PHAN_HOP_LE = ['toàn bộ', 'một phần', 'phần còn lại']
KIEM_CHUNG_HOP_LE = ['có', 'cần kiểm chứng']
SAI_SO = 0.00001   # gần 1 mét, dùng để làm gọn đường ranh giới


class LoiDuLieu(Exception):
    pass


# ---------------------------------------------------------------- đọc CSV
def doc_csv(duong_dan, cot_bat_buoc):
    if not duong_dan.exists():
        raise LoiDuLieu(f'Không tìm thấy file {duong_dan.relative_to(GOC)}')
    van_ban = duong_dan.read_text(encoding='utf-8-sig')
    dong_dau = van_ban.splitlines()[0] if van_ban.strip() else ''
    phan_cach = ';' if dong_dau.count(';') > dong_dau.count(',') else ','
    ds = []
    for i, d in enumerate(csv.DictReader(van_ban.splitlines(), delimiter=phan_cach), start=2):
        muc = {(k or '').strip(): (v or '').strip() for k, v in d.items()}
        if any(muc.values()):
            muc['_dong'] = i
            ds.append(muc)
    thieu = [c for c in cot_bat_buoc if not ds or c not in ds[0]]
    if thieu:
        raise LoiDuLieu(f'File {duong_dan.relative_to(GOC)} thiếu cột: {", ".join(thieu)}. '
                        f'Dòng đầu tiên phải có đủ các cột: {", ".join(cot_bat_buoc)}')
    return ds


def chuan_ten(ten):
    """'Phường 1' -> '1', 'Phường Bến Nghé' -> 'bến nghé' để so khớp tên."""
    t = unicodedata.normalize('NFC', ten).strip()
    if t.casefold().startswith('phường '):
        t = t[7:]
    return t.strip().casefold()


def ma_tu_ten(ten):
    t = unicodedata.normalize('NFD', ten.replace('đ', 'd').replace('Đ', 'D'))
    t = ''.join(c for c in t if unicodedata.category(c) != 'Mn').lower()
    return '-'.join(''.join(c if c.isalnum() else ' ' for c in t).split())


# ---------------------------------------------------------------- tải OSM
def tai(truy_van, duong_dan):
    du_lieu = urllib.parse.urlencode({'data': truy_van}).encode('utf-8')
    for lan in range(1, 7):
        try:
            yc = urllib.request.Request(OVERPASS, data=du_lieu,
                                        headers={'User-Agent': 'sa-ban-quy-hoach-edu/0.1'})
            with urllib.request.urlopen(yc, timeout=300) as tl:
                noi_dung = tl.read()
            kq = json.loads(noi_dung)
            if not kq.get('elements'):
                raise ValueError('máy chủ trả về rỗng')
            duong_dan.parent.mkdir(parents=True, exist_ok=True)
            duong_dan.write_bytes(noi_dung)
            print(f'  Đã tải {duong_dan.name}: {len(kq["elements"])} ranh giới')
            return
        except Exception as e:  # máy chủ Overpass hay quá tải, thử lại
            print(f'  Lần {lan} chưa được ({e}). Chờ 20 giây rồi thử lại...')
            time.sleep(20)
    raise LoiDuLieu('Không tải được dữ liệu từ OpenStreetMap sau 6 lần thử. '
                    'Hãy kiểm tra mạng và chạy lại sau ít phút.')


# ---------------------------------------------------------------- hình học
def gian_luoc(pts, eps):
    if len(pts) < 3:
        return pts
    giu = [False] * len(pts)
    giu[0] = giu[-1] = True
    ngan = [(0, len(pts) - 1)]
    while ngan:
        a, b = ngan.pop()
        ax, ay = pts[a]
        bx, by = pts[b]
        dx, dy = bx - ax, by - ay
        dai = dx * dx + dy * dy
        xa, vi_tri = -1.0, None
        for i in range(a + 1, b):
            px, py = pts[i]
            if dai == 0:
                d = (px - ax) ** 2 + (py - ay) ** 2
            else:
                t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / dai))
                d = (px - ax - t * dx) ** 2 + (py - ay - t * dy) ** 2
            if d > xa:
                xa, vi_tri = d, i
        if vi_tri is not None and xa > eps * eps:
            giu[vi_tri] = True
            ngan.append((a, vi_tri))
            ngan.append((vi_tri, b))
    return [p for p, g in zip(pts, giu) if g]


def noi(doan, ten):
    """Nối các đoạn đường thành vòng khép kín."""
    doan = [d[:] for d in doan if len(d) >= 2]
    vong = []
    while doan:
        hien = doan.pop()
        while hien[0] != hien[-1]:
            tim = None
            for i, d in enumerate(doan):
                if d[0] == hien[-1]:
                    tim = (i, d[1:])
                    break
                if d[-1] == hien[-1]:
                    tim = (i, d[-2::-1])
                    break
            if tim is None:
                break
            doan.pop(tim[0])
            hien += tim[1]
        if hien[0] == hien[-1] and len(hien) >= 4:
            vong.append(hien)
        else:
            raise LoiDuLieu(f'Ranh giới "{ten}" trên OpenStreetMap không khép kín, chưa dùng được.')
    return vong


def trong_vong(pt, vong):
    x, y = pt
    trong = False
    for i in range(len(vong) - 1):
        x1, y1 = vong[i]
        x2, y2 = vong[i + 1]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            trong = not trong
    return trong


def trong_da_giac(pt, cac_da_giac):
    for dg in cac_da_giac:
        if trong_vong(pt, dg[0]) and not any(trong_vong(pt, lo) for lo in dg[1:]):
            return True
    return False


def dien_tich_vong(vong):
    """Diện tích gần đúng, km²."""
    lat0 = sum(p[1] for p in vong) / len(vong)
    kx = 111.32 * math.cos(math.radians(lat0))
    ky = 110.57
    s = 0.0
    for i in range(len(vong) - 1):
        s += vong[i][0] * kx * vong[i + 1][1] * ky - vong[i + 1][0] * kx * vong[i][1] * ky
    return abs(s) / 2


def dien_tich(cac_da_giac):
    return sum(dien_tich_vong(dg[0]) - sum(dien_tich_vong(lo) for lo in dg[1:]) for dg in cac_da_giac)


def diem_trong(cac_da_giac):
    """Một điểm chắc chắn nằm bên trong (trọng tâm có thể rơi ra ngoài hình lõm)."""
    dg = max(cac_da_giac, key=lambda d: dien_tich_vong(d[0]))
    ys = [p[1] for p in dg[0]]
    tot = None
    for ti_le in (0.5, 0.4, 0.6, 0.3, 0.7):
        y = min(ys) + (max(ys) - min(ys)) * ti_le
        xs = []
        for vong in dg:
            for i in range(len(vong) - 1):
                x1, y1 = vong[i]
                x2, y2 = vong[i + 1]
                if (y1 > y) != (y2 > y):
                    xs.append((x2 - x1) * (y - y1) / (y2 - y1) + x1)
        xs.sort()
        for i in range(0, len(xs) - 1, 2):
            rong = xs[i + 1] - xs[i]
            if tot is None or rong > tot[0]:
                tot = (rong, ((xs[i] + xs[i + 1]) / 2, y))
        if tot:
            break
    return tot[1]


def da_giac_tu_relation(rel):
    ten = rel.get('tags', {}).get('name', str(rel.get('id')))
    ngoai, trong = [], []
    for m in rel.get('members', []):
        if m.get('type') != 'way' or not m.get('geometry'):
            continue
        pts = []
        for p in m['geometry']:
            if not p:
                continue
            q = (round(p['lon'], 6), round(p['lat'], 6))
            if not pts or pts[-1] != q:
                pts.append(q)
        pts = gian_luoc(pts, SAI_SO)
        (trong if m.get('role') == 'inner' else ngoai).append(pts)
    cac_dg = [[v] for v in noi(ngoai, ten)]
    for lo in noi(trong, ten) if trong else []:
        for dg in cac_dg:
            if trong_vong(lo[0], dg[0]):
                dg.append(lo)
                break
    if not cac_dg:
        raise LoiDuLieu(f'Ranh giới "{ten}" trên OpenStreetMap không có hình dạng.')
    return cac_dg


def hinh_geojson(cac_dg):
    toa_do = [[[list(p) for p in vong] for vong in dg] for dg in cac_dg]
    if len(toa_do) == 1:
        return {'type': 'Polygon', 'coordinates': toa_do[0]}
    return {'type': 'MultiPolygon', 'coordinates': toa_do}


def ghi_geojson(duong_dan, doi_tuong):
    duong_dan.write_text(json.dumps({'type': 'FeatureCollection', 'features': doi_tuong},
                                    ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print(f'  Đã ghi {duong_dan.relative_to(GOC)} ({len(doi_tuong)} vùng, '
          f'{duong_dan.stat().st_size // 1024} KB)')


# ---------------------------------------------------------------- hành chính
def xu_ly_hanh_chinh(tai_lai):
    print('1. Đọc bảng phường mới và bảng gộp phường')
    phuong_moi = doc_csv(HC / 'phuong_moi.csv',
                         ['ma', 'ten_vi', 'ten_en', 'khu_cu', 'khoan', 'nguon', 'ngay_cap_nhat',
                          'da_kiem_chung', 'hinh_dang_kiem_chung'])
    gop = doc_csv(HC / 'gop_phuong.csv', ['phuong_moi', 'phuong_cu', 'quan_cu', 'phan'])
    loi = []
    cac_ma = [p['ma'] for p in phuong_moi]
    for p in phuong_moi:
        vt = f'phuong_moi.csv dòng {p["_dong"]}'
        if not p['ma'] or not p['ten_vi']:
            loi.append(f'{vt}: thiếu "ma" hoặc "ten_vi"')
        if cac_ma.count(p['ma']) > 1:
            loi.append(f'{vt}: mã "{p["ma"]}" bị trùng')
        if not p['nguon'].startswith('http'):
            loi.append(f'{vt}: cột "nguon" phải là một đường link bắt đầu bằng http')
        for c in ('da_kiem_chung', 'hinh_dang_kiem_chung'):
            if p[c] not in KIEM_CHUNG_HOP_LE:
                loi.append(f'{vt}: cột "{c}" phải là "có" hoặc "cần kiểm chứng", đang là "{p[c]}"')
    for g in gop:
        vt = f'gop_phuong.csv dòng {g["_dong"]}'
        if g['phuong_moi'] not in cac_ma:
            loi.append(f'{vt}: mã phường mới "{g["phuong_moi"]}" không có trong phuong_moi.csv')
        if g['phan'] not in PHAN_HOP_LE:
            loi.append(f'{vt}: cột "phan" phải là một trong: {", ".join(PHAN_HOP_LE)}')
        if g['quan_cu'] not in QUAN_CU:
            loi.append(f'{vt}: cột "quan_cu" phải là một trong: {", ".join(QUAN_CU)}')
    if loi:
        raise LoiDuLieu('Có lỗi trong file dữ liệu:\n  - ' + '\n  - '.join(loi))

    print('2. Ranh giới từ OpenStreetMap')
    tep_moi, tep_cu = THO / 'ranh_gioi_moi.json', THO / 'ranh_gioi_cu_2025_05.json'
    if tai_lai or not tep_moi.exists():
        ten = '|'.join(p['ten_vi'] for p in phuong_moi)
        tai(f'[out:json][timeout:120];relation["boundary"="administrative"]["admin_level"="6"]'
            f'["name"~"^Phường ({ten})$"]({KHUNG});out geom;', tep_moi)
    if tai_lai or not tep_cu.exists():
        tai(f'[out:json][timeout:180][date:"{NGAY_CU}"];('
            f'relation["boundary"="administrative"]["admin_level"="6"]'
            f'["name"~"^({"|".join(QUAN_CU)})$"]({KHUNG});'
            f'relation["boundary"="administrative"]["admin_level"="8"]({KHUNG}););out geom;', tep_cu)
    osm_moi = json.loads(tep_moi.read_text(encoding='utf-8'))
    osm_cu = json.loads(tep_cu.read_text(encoding='utf-8'))

    # --- phường mới
    theo_ten = {chuan_ten(p['ten_vi']): p for p in phuong_moi}
    hinh_moi = {}
    for rel in osm_moi['elements']:
        p = theo_ten.get(chuan_ten(rel.get('tags', {}).get('name', '')))
        if p:
            hinh_moi[p['ma']] = (da_giac_tu_relation(rel), rel['id'])
    thieu = [p['ten_vi'] for p in phuong_moi if p['ma'] not in hinh_moi]
    if thieu:
        raise LoiDuLieu('OpenStreetMap không có ranh giới cho phường mới: ' + ', '.join(thieu))

    # --- quận và phường cũ
    hinh_quan = {}
    phuong_cu = []
    for rel in osm_cu['elements']:
        tags = rel.get('tags', {})
        if tags.get('admin_level') == '6' and tags.get('name') in QUAN_CU:
            hinh_quan[tags['name']] = da_giac_tu_relation(rel)
    thieu = [q for q in QUAN_CU if q not in hinh_quan]
    if thieu:
        raise LoiDuLieu('Bản lưu OpenStreetMap không có ranh giới cũ của: ' + ', '.join(thieu))
    for rel in osm_cu['elements']:
        tags = rel.get('tags', {})
        if tags.get('admin_level') != '8' or not tags.get('name'):
            continue
        dg = da_giac_tu_relation(rel)
        pt = diem_trong(dg)
        quan = next((q for q in QUAN_CU if trong_da_giac(pt, hinh_quan[q])), None)
        trong_moi = next((ma for ma, (h, _) in hinh_moi.items() if trong_da_giac(pt, h)), None)
        if quan in QUAN_VE_VIEN or (quan and trong_moi):
            phuong_cu.append({'ten': tags['name'], 'quan': quan, 'hinh': dg, 'diem': pt,
                              'trong_moi': trong_moi, 'osm': rel['id'], 'phuong_moi': []})

    print('3. Đối chiếu bảng gộp phường với ranh giới')
    canh_bao = []
    tra = {(chuan_ten(c['ten']), c['quan']): c for c in phuong_cu}
    for g in gop:
        c = tra.get((chuan_ten(g['phuong_cu']), g['quan_cu']))
        if not c:
            canh_bao.append(f'Không tìm thấy ranh giới cũ của "{g["phuong_cu"]}" ({g["quan_cu"]}) '
                            f'- gop_phuong.csv dòng {g["_dong"]}')
            continue
        c['phuong_moi'].append(g['phuong_moi'])
        if g['phan'] == 'toàn bộ' and c['trong_moi'] != g['phuong_moi']:
            canh_bao.append(f'"{g["phuong_cu"]}" ({g["quan_cu"]}) theo bảng gộp thuộc toàn bộ về '
                            f'"{g["phuong_moi"]}" nhưng trên bản đồ lại nằm trong "{c["trong_moi"]}"')
    for c in phuong_cu:
        if not c['phuong_moi']:
            canh_bao.append(f'"{c["ten"]}" ({c["quan"]}) có ranh giới cũ nhưng không có dòng nào '
                            f'trong gop_phuong.csv')
        elif c['trong_moi'] not in c['phuong_moi']:
            canh_bao.append(f'"{c["ten"]}" ({c["quan"]}): phần lớn diện tích nằm trong '
                            f'"{c["trong_moi"]}", không khớp với bảng gộp {c["phuong_moi"]}')
    # so diện tích: phường mới chỉ gồm các phường "toàn bộ" thì tổng diện tích phải xấp xỉ bằng nhau
    so_dt = []
    for p in phuong_moi:
        dong = [g for g in gop if g['phuong_moi'] == p['ma']]
        dt_moi = dien_tich(hinh_moi[p['ma']][0])
        if dong and all(g['phan'] == 'toàn bộ' for g in dong):
            cu = [tra.get((chuan_ten(g['phuong_cu']), g['quan_cu'])) for g in dong]
            if all(cu):
                dt_cu = sum(dien_tich(c['hinh']) for c in cu)
                lech = abs(dt_moi - dt_cu) / dt_cu * 100
                so_dt.append(f'{p["ten_vi"]}: mới {dt_moi:.2f} km², tổng các phường cũ {dt_cu:.2f} km², '
                             f'lệch {lech:.1f}%')
                if lech > 3:
                    canh_bao.append(f'Diện tích phường mới "{p["ten_vi"]}" lệch {lech:.1f}% so với '
                                    f'tổng các phường cũ gộp thành nó')
                continue
        so_dt.append(f'{p["ten_vi"]}: mới {dt_moi:.2f} km² (có phường bị chia tách, không so được)')

    print('4. Ghi file bản đồ')
    ghi_geojson(HC / 'phuong_moi.geojson', [
        {'type': 'Feature', 'properties': {'ma': p['ma'], 'osm': hinh_moi[p['ma']][1]},
         'geometry': hinh_geojson(hinh_moi[p['ma']][0])} for p in phuong_moi])
    phuong_cu.sort(key=lambda c: (QUAN_CU.index(c['quan']), c['ten']))
    ghi_geojson(HC / 'phuong_cu.geojson', [
        {'type': 'Feature',
         'properties': {'ma': ma_tu_ten(c['quan'] + ' ' + c['ten']), 'ten': c['ten'],
                        'quan_cu': c['quan'], 'phuong_moi': '|'.join(c['phuong_moi']), 'osm': c['osm']},
         'geometry': hinh_geojson(c['hinh'])} for c in phuong_cu])
    ghi_geojson(HC / 'quan_cu.geojson', [
        {'type': 'Feature', 'properties': {'ten': q}, 'geometry': hinh_geojson(hinh_quan[q])}
        for q in QUAN_VE_VIEN])

    can_kc = [f'{p["ten_vi"]}: ' + ', '.join(
        ([] if p['da_kiem_chung'] == 'có' else ['thông tin gộp phường']) +
        ([] if p['hinh_dang_kiem_chung'] == 'có' else ['hình dạng ranh giới']))
        for p in phuong_moi if 'cần kiểm chứng' in (p['da_kiem_chung'], p['hinh_dang_kiem_chung'])]
    bao_cao = [
        'BÁO CÁO KIỂM TRA DỮ LIỆU HÀNH CHÍNH',
        f'Tạo lúc: {time.strftime("%d/%m/%Y %H:%M")} (file này do máy tạo, đừng sửa tay)',
        '',
        f'Phường mới: {len(phuong_moi)}. Phường cũ: {len(phuong_cu)}. Dòng gộp phường: {len(gop)}.',
        f'Ranh giới cũ lấy từ bản lưu OpenStreetMap ngày {NGAY_CU[:10]}.',
        '',
        f'CẢNH BÁO ({len(canh_bao)}):' if canh_bao else 'CẢNH BÁO: không có.',
        *[f'  - {c}' for c in canh_bao],
        '',
        'SO SÁNH DIỆN TÍCH (ranh giới mới so với tổng các phường cũ):',
        *[f'  - {s}' for s in so_dt],
        '',
        f'MỤC CẦN KIỂM CHỨNG ({len(can_kc)}):',
        *[f'  - {s}' for s in can_kc],
        '',
    ]
    (HC / 'BAO_CAO_KIEM_TRA.txt').write_text('\n'.join(bao_cao), encoding='utf-8')
    print('\n' + '\n'.join(bao_cao))
    return len(canh_bao)


# ---------------------------------------------------------------- dự án quy hoạch
DA = GOC / 'data' / 'du_an'
KHUNG_DA = '10.735,106.665,10.83,106.80'
LOAI_HOP_LE = ['cầu', 'hầm', 'metro', 'đường', 'công viên', 'khu đô thị']
TRANG_THAI_HOP_LE = ['đã hoàn thành', 'đang thi công', 'đã phê duyệt', 'đề xuất']


def xu_ly_du_an(tai_lai):
    print('\n5. Đọc danh sách dự án')
    du_an = doc_csv(DA / 'du_an.csv',
                    ['ma', 'ten_vi', 'ten_en', 'loai', 'trang_thai', 'moc_thoi_gian_vi', 'mo_ta_vi',
                     'nguon', 'ngay_cap_nhat', 'da_kiem_chung'])
    nguon_hinh = doc_csv(DA / 'hinh_dang_nguon.csv', ['ma', 'kieu', 'tham_so'])
    loi = []
    cac_ma = [d['ma'] for d in du_an]
    for d in du_an:
        vt = f'du_an.csv dòng {d["_dong"]}'
        if not d['ma'] or not d['ten_vi']:
            loi.append(f'{vt}: thiếu "ma" hoặc "ten_vi"')
        if cac_ma.count(d['ma']) > 1:
            loi.append(f'{vt}: mã "{d["ma"]}" bị trùng')
        if d['loai'] not in LOAI_HOP_LE:
            loi.append(f'{vt}: cột "loai" phải là một trong: {", ".join(LOAI_HOP_LE)}')
        if d['trang_thai'] not in TRANG_THAI_HOP_LE:
            loi.append(f'{vt}: cột "trang_thai" phải là một trong: {", ".join(TRANG_THAI_HOP_LE)}')
        if not d['nguon'].startswith('http'):
            loi.append(f'{vt}: cột "nguon" phải bắt đầu bằng http (nhiều link thì ngăn bằng dấu |)')
        if d['da_kiem_chung'] not in KIEM_CHUNG_HOP_LE:
            loi.append(f'{vt}: cột "da_kiem_chung" phải là "có" hoặc "cần kiểm chứng"')
    for h in nguon_hinh:
        vt = f'hinh_dang_nguon.csv dòng {h["_dong"]}'
        if h['ma'] not in cac_ma:
            loi.append(f'{vt}: mã "{h["ma"]}" không có trong du_an.csv')
        if h['kieu'] not in ('osm', 'điểm sơ đồ'):
            loi.append(f'{vt}: cột "kieu" phải là "osm" hoặc "điểm sơ đồ"')
        if h['kieu'] == 'điểm sơ đồ':
            try:
                x, y = [float(v) for v in h['tham_so'].split(',')]
                assert 106 < x < 107.2 and 10 < y < 11.5
            except Exception:
                loi.append(f'{vt}: "tham_so" của điểm sơ đồ phải có dạng kinh độ,vĩ độ (ví dụ 106.7280,10.7822)')
    if loi:
        raise LoiDuLieu('Có lỗi trong file dữ liệu dự án:\n  - ' + '\n  - '.join(loi))

    print('6. Hình dạng công trình từ OpenStreetMap')
    tu_osm = [h for h in nguon_hinh if h['kieu'] == 'osm']
    tep = DA / 'goc_osm' / 'hinh_dang.json'
    tep_ds = DA / 'goc_osm' / 'danh_sach_truy_van.json'
    ds_truy_van = [[h['ma'], h['tham_so']] for h in tu_osm]
    da_doi = not tep_ds.exists() or json.loads(tep_ds.read_text(encoding='utf-8')) != ds_truy_van
    if tai_lai or da_doi or not tep.exists():
        than = ''.join(f'({h["tham_so"]}({KHUNG_DA});)->.s;.s out count;.s out geom;' for h in tu_osm)
        tai(f'[out:json][timeout:120];{than}', tep)
        tep_ds.write_text(json.dumps(ds_truy_van, ensure_ascii=False), encoding='utf-8')
    phan_tu = json.loads(tep.read_text(encoding='utf-8'))['elements']

    canh_bao = []
    doi_tuong = []
    vi_tri = 0
    for h in tu_osm:
        if vi_tri >= len(phan_tu) or phan_tu[vi_tri].get('type') != 'count':
            raise LoiDuLieu('Dữ liệu hình dạng đã tải không khớp danh sách. Hãy chạy lại với --tai-lai.')
        so = int(phan_tu[vi_tri]['tags']['total'])
        cac_way = [e for e in phan_tu[vi_tri + 1: vi_tri + 1 + so] if e.get('type') == 'way' and e.get('geometry')]
        vi_tri += 1 + so
        if not cac_way:
            canh_bao.append(f'Dự án "{h["ma"]}": OpenStreetMap không trả về hình dạng nào, sẽ không hiện trên bản đồ')
            continue
        duong, vung = [], []
        for w in cac_way:
            pts = []
            for p in w['geometry']:
                q = (round(p['lon'], 6), round(p['lat'], 6))
                if not pts or pts[-1] != q:
                    pts.append(q)
            pts = gian_luoc(pts, SAI_SO)
            if len(pts) >= 4 and pts[0] == pts[-1] and w.get('tags', {}).get('leisure'):
                vung.append([pts])
            elif len(pts) >= 2:
                duong.append(pts)
        tt = {'ma': h['ma'], 'so_do': False}
        if vung:
            doi_tuong.append({'type': 'Feature', 'properties': dict(tt, hinh='vùng'), 'geometry': hinh_geojson(vung)})
            diem = diem_trong(vung)
        else:
            doi_tuong.append({'type': 'Feature', 'properties': dict(tt, hinh='tuyến'),
                              'geometry': {'type': 'MultiLineString', 'coordinates': [[list(p) for p in d] for d in duong]}})
            dai = max(duong, key=len)
            diem = dai[len(dai) // 2]
            # tuyến dài chạy ra ngoài khu trung tâm (metro): đặt nhãn ở điểm gần trung tâm nhất
            if not (106.68 < diem[0] < 106.75 and 10.745 < diem[1] < 10.81):
                diem = min((p for d in duong for p in d),
                           key=lambda p: (p[0] - 106.700) ** 2 + (p[1] - 10.775) ** 2)
        doi_tuong.append({'type': 'Feature', 'properties': dict(tt, hinh='điểm'),
                          'geometry': {'type': 'Point', 'coordinates': list(diem)}})
    for h in nguon_hinh:
        if h['kieu'] == 'điểm sơ đồ':
            x, y = [float(v) for v in h['tham_so'].split(',')]
            doi_tuong.append({'type': 'Feature', 'properties': {'ma': h['ma'], 'so_do': True, 'hinh': 'điểm'},
                              'geometry': {'type': 'Point', 'coordinates': [x, y]}})
    co_hinh = {f['properties']['ma'] for f in doi_tuong}
    for d in du_an:
        if d['ma'] not in co_hinh:
            canh_bao.append(f'Dự án "{d["ten_vi"]}" chưa có hình dạng hay vị trí, chỉ hiện trong danh sách')
    ghi_geojson(DA / 'du_an.geojson', doi_tuong)

    can_kc = [d['ten_vi'] for d in du_an if d['da_kiem_chung'] != 'có']
    so_do = [d['ten_vi'] for d in du_an if any(h['ma'] == d['ma'] and h['kieu'] == 'điểm sơ đồ' for h in nguon_hinh)]
    bao_cao = [
        'BÁO CÁO KIỂM TRA DỮ LIỆU DỰ ÁN',
        f'Tạo lúc: {time.strftime("%d/%m/%Y %H:%M")} (file này do máy tạo, đừng sửa tay)',
        '',
        f'Số dự án: {len(du_an)}. Có hình dạng từ OpenStreetMap: {len(co_hinh) - len(so_do)}. '
        f'Chỉ có vị trí sơ đồ: {len(so_do)}.',
        '',
        f'CẢNH BÁO ({len(canh_bao)}):' if canh_bao else 'CẢNH BÁO: không có.',
        *[f'  - {c}' for c in canh_bao],
        '',
        f'VỊ TRÍ SƠ ĐỒ ({len(so_do)}):', *[f'  - {s}' for s in so_do],
        '',
        f'MỤC CẦN KIỂM CHỨNG ({len(can_kc)}):', *[f'  - {s}' for s in can_kc],
        '',
    ]
    (DA / 'BAO_CAO_KIEM_TRA.txt').write_text('\n'.join(bao_cao), encoding='utf-8')
    print('\n' + '\n'.join(bao_cao))
    return len(canh_bao)


def main():
    try:
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass
    try:
        so_canh_bao = xu_ly_hanh_chinh('--tai-lai' in sys.argv)
        so_canh_bao += xu_ly_du_an('--tai-lai' in sys.argv)
    except LoiDuLieu as e:
        print(f'\nDỪNG LẠI: {e}')
        return 1
    print('XONG.' + (f' Có {so_canh_bao} cảnh báo, xem các file BAO_CAO_KIEM_TRA.txt trong data/'
                     if so_canh_bao else ' Không có cảnh báo.'))
    return 0


if __name__ == '__main__':
    sys.exit(main())
