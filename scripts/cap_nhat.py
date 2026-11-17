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
        if None in d:
            raise LoiDuLieu(f'File {duong_dan.relative_to(GOC)} dòng {i} có nhiều ô hơn số cột. '
                            f'Thường là do một ô có dấu phẩy mà không nằm trong ngoặc kép; '
                            f'hãy mở file bằng Excel, sửa lại dòng đó rồi lưu kiểu CSV UTF-8.')
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


def da_giac_tu_relation(rel, sai_so=SAI_SO):
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
        pts = gian_luoc(pts, sai_so)
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


# ---------------------------------------------------------------- giao thông đường bộ
GT = GOC / 'data' / 'giao_thong'
LOAI_DUONG = 'motorway|trunk|primary|secondary|tertiary'
MA_GIA_DINH = ['ti_le_xe_may', 'ti_le_o_to', 'ti_le_xe_buyt', 'toc_do_thap_diem', 'toc_do_cao_diem',
               'he_so_toc_do_xe_may', 'he_so_toc_do_o_to', 'he_so_toc_do_xe_buyt', 'so_xe_cao_diem',
               'so_xe_thap_diem', 'ti_le_qua_song', 'tang_toc_hien_thi']


def khoang_cach(a, b):
    """Khoảng cách gần đúng giữa hai điểm (kinh độ, vĩ độ), tính bằng mét."""
    kx = 111320 * math.cos(math.radians((a[1] + b[1]) / 2))
    return math.hypot((a[0] - b[0]) * kx, (a[1] - b[1]) * 110570)


def xu_ly_giao_thong(tai_lai):
    print('\n7. Đọc giả định và kịch bản giao thông')
    gia_dinh = doc_csv(GT / 'gia_dinh.csv', ['ma', 'gia_tri', 'don_vi', 'mo_ta_vi', 'loai_nguon', 'nguon'])
    kich_ban = doc_csv(GT / 'kich_ban.csv', ['ma', 'ten_vi', 'ten_en', 'bo_cau', 'them_cau', 'mo_ta_vi'])
    qua_song = doc_csv(GT / 'diem_qua_song.csv', ['ten_osm', 'ten_vi', 'ten_en'])
    loi = []
    co = {g['ma']: g for g in gia_dinh}
    for ma in MA_GIA_DINH:
        if ma not in co:
            loi.append(f'gia_dinh.csv: thiếu dòng "{ma}"')
    for g in gia_dinh:
        vt = f'gia_dinh.csv dòng {g["_dong"]}'
        try:
            assert float(g['gia_tri'].replace(',', '.')) >= 0
        except Exception:
            loi.append(f'{vt}: "gia_tri" phải là một con số không âm, đang là "{g["gia_tri"]}"')
        if g['loai_nguon'] not in ('số liệu công bố', 'giả định minh họa'):
            loi.append(f'{vt}: "loai_nguon" phải là "số liệu công bố" hoặc "giả định minh họa"')
        if g['loai_nguon'] == 'số liệu công bố' and not g['nguon'].startswith('http'):
            loi.append(f'{vt}: số liệu công bố phải có link ở cột "nguon"')
    if not loi:
        tong = sum(float(co[m]['gia_tri'].replace(',', '.')) for m in MA_GIA_DINH[:3])
        if abs(tong - 100) > 0.5:
            loi.append(f'gia_dinh.csv: ba tỉ lệ xe máy, ô tô, xe buýt phải cộng lại bằng 100, đang là {tong:g}')
    if not kich_ban or kich_ban[0]['bo_cau'] or kich_ban[0]['them_cau']:
        loi.append('kich_ban.csv: dòng đầu tiên phải là hiện trạng (để trống "bo_cau" và "them_cau")')
    if loi:
        raise LoiDuLieu('Có lỗi trong file dữ liệu giao thông:\n  - ' + '\n  - '.join(loi))

    print('8. Mạng đường chính từ OpenStreetMap')
    them = sorted({k['them_cau'] for k in kich_ban if k['them_cau']})
    truy_van = (f'[out:json][timeout:180];(way["highway"~"^({LOAI_DUONG})(_link)?$"]({KHUNG_DA});'
                + ''.join(f'way["highway"="proposed"]["name"="{t}"]({KHUNG_DA});' for t in them)
                + ');out body;>;out skel qt;')
    tep = GT / 'goc_osm' / 'mang_duong.json'
    tep_tv = GT / 'goc_osm' / 'truy_van.txt'
    if tai_lai or not tep.exists() or not tep_tv.exists() or tep_tv.read_text(encoding='utf-8') != truy_van:
        tai(truy_van, tep)
        tep_tv.write_text(truy_van, encoding='utf-8')
    phan_tu = json.loads(tep.read_text(encoding='utf-8'))['elements']
    toa_do = {e['id']: (round(e['lon'], 5), round(e['lat'], 5)) for e in phan_tu if e['type'] == 'node'}
    cac_way = [e for e in phan_tu if e['type'] == 'way' and len(e.get('nodes', [])) >= 2]

    # bờ đông sông Sài Gòn = các phường mới thuộc Thành phố Thủ Đức cũ
    pm = {p['ma']: p for p in doc_csv(HC / 'phuong_moi.csv', ['ma', 'khu_cu'])}
    hinh_pm = json.loads((HC / 'phuong_moi.geojson').read_text(encoding='utf-8'))['features']
    vung_dong = []
    for f in hinh_pm:
        if pm.get(f['properties']['ma'], {}).get('khu_cu') == 'Thành phố Thủ Đức':
            g = f['geometry']
            vung_dong += [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']

    dem = {}
    for w in cac_way:
        for i, n in enumerate(w['nodes']):
            dem[n] = dem.get(n, 0) + (2 if i in (0, len(w['nodes']) - 1) else 1)
    chi_so = {}
    nut = []

    def lay_nut(n):
        if n not in chi_so:
            chi_so[n] = len(nut)
            x, y = toa_do[n]
            nut.append([x, y, 1 if trong_da_giac((x, y), vung_dong) else 0])
        return chi_so[n]

    ten_qs = [q['ten_osm'] for q in qua_song]
    canh = []
    thay_qs = set()
    for w in cac_way:
        t = w.get('tags', {})
        du_kien = t.get('highway') == 'proposed'
        ten = t.get('name', '')
        mot_chieu = t.get('oneway', '')
        chieu = 0
        if mot_chieu in ('yes', '1', 'true') or t.get('junction') == 'roundabout' or \
                (t.get('highway', '').startswith('motorway') and mot_chieu != 'no'):
            chieu = 1
        cac_nut = w['nodes'][::-1] if mot_chieu == '-1' else w['nodes']
        if mot_chieu == '-1':
            chieu = 1
        qs = ten_qs.index(ten) if ten in ten_qs and (du_kien or t.get('bridge') or t.get('tunnel')) else -1
        if qs >= 0:
            thay_qs.add(ten)
        dau = 0
        for i in range(1, len(cac_nut)):
            if dem[cac_nut[i]] > 1 or i == len(cac_nut) - 1:
                doan = [toa_do[n] for n in cac_nut[dau:i + 1]]
                dai = sum(khoang_cach(doan[k], doan[k + 1]) for k in range(len(doan) - 1))
                if dai > 0:
                    canh.append([lay_nut(cac_nut[dau]), lay_nut(cac_nut[i]), round(dai), chieu, qs,
                                 ten if du_kien else '', [c for p in doan for c in p]])
                dau = i

    # cầu dự kiến chưa nối vào mạng thì nối thẳng tới nút gần nhất
    canh_bao = []
    bac = {}
    for c in canh:
        if not c[5]:
            bac[c[0]] = bac.get(c[0], 0) + 1
            bac[c[1]] = bac.get(c[1], 0) + 1
    for t in them:
        dau_mut = {}
        for c in canh:
            if c[5] == t:
                for n in (c[0], c[1]):
                    dau_mut[n] = dau_mut.get(n, 0) + 1
        if not dau_mut:
            canh_bao.append(f'Không tìm thấy tuyến dự kiến "{t}" trên OpenStreetMap; kịch bản thêm cầu này sẽ giống hiện trạng')
            continue
        for n, so in dau_mut.items():
            if so == 1 and n not in bac:
                gan = min(bac, key=lambda m: khoang_cach(nut[m], nut[n]))
                d = khoang_cach(nut[gan], nut[n])
                if d > 600:
                    canh_bao.append(f'Một đầu của "{t}" cách đường chính gần nhất {d:.0f} m, chưa nối được')
                    continue
                canh.append([n, gan, max(1, round(d)), 0, -1, t, nut[n][:2] + nut[gan][:2]])
    for q in qua_song:
        if q['ten_osm'] not in thay_qs:
            canh_bao.append(f'diem_qua_song.csv: không thấy cầu/hầm nào tên "{q["ten_osm"]}" trong mạng đường')
    for k in kich_ban:
        if k['bo_cau'] and k['bo_cau'] not in ten_qs:
            canh_bao.append(f'kich_ban.csv dòng {k["_dong"]}: "{k["bo_cau"]}" không có trong diem_qua_song.csv')

    ket_qua = {'nut': nut, 'canh': canh, 'qua_song': ten_qs}
    tep_ra = GT / 'mang_duong.json'
    tep_ra.write_text(json.dumps(ket_qua, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
    print(f'  Đã ghi {tep_ra.relative_to(GOC)} ({len(nut)} nút, {len(canh)} đoạn đường, '
          f'{tep_ra.stat().st_size // 1024} KB)')

    gd = [f'{g["ma"]} = {g["gia_tri"]} {g["don_vi"]} ({g["loai_nguon"]})' for g in gia_dinh]
    bao_cao = [
        'BÁO CÁO KIỂM TRA DỮ LIỆU GIAO THÔNG',
        f'Tạo lúc: {time.strftime("%d/%m/%Y %H:%M")} (file này do máy tạo, đừng sửa tay)',
        '',
        f'Mạng đường: {len(nut)} nút, {len(canh)} đoạn. Điểm qua sông tìm thấy: {", ".join(sorted(thay_qs))}.',
        '',
        f'CẢNH BÁO ({len(canh_bao)}):' if canh_bao else 'CẢNH BÁO: không có.',
        *[f'  - {c}' for c in canh_bao],
        '',
        'CÁC CON SỐ ĐANG DÙNG:', *[f'  - {s}' for s in gd],
        '',
    ]
    (GT / 'BAO_CAO_KIEM_TRA.txt').write_text('\n'.join(bao_cao), encoding='utf-8')
    print('\n' + '\n'.join(bao_cao))
    return len(canh_bao)


# ---------------------------------------------------------------- giao thông thủy
KHUNG_THUY = '10.70,106.665,10.86,106.83'
LOAI_TUYEN_THUY = ['buýt sông', 'phà', 'tàu khách', 'tàu hàng']
LOAI_BEN = ['bến buýt sông', 'bến phà', 'bến tàu khách', 'cảng hàng hóa']


def noi_chuoi(doan):
    """Nối các đoạn hở thành các chuỗi dài nhất có thể; trả về chuỗi dài nhất (tính bằng mét)."""
    con = [d[:] for d in doan if len(d) >= 2]
    cac_chuoi = []
    while con:
        hien = con.pop(max(range(len(con)), key=lambda i: len(con[i])))
        doi = True
        while doi:
            doi = False
            for i, d in enumerate(con):
                if d[0] == hien[-1]:
                    hien += d[1:]
                elif d[-1] == hien[-1]:
                    hien += d[-2::-1]
                elif d[-1] == hien[0]:
                    hien = d[:-1] + hien
                elif d[0] == hien[0]:
                    hien = d[:0:-1] + hien
                else:
                    continue
                con.pop(i)
                doi = True
                break
        cac_chuoi.append(hien)
    return max(cac_chuoi, key=lambda c: sum(khoang_cach(c[k], c[k + 1]) for k in range(len(c) - 1)))


def doc_diem(chu):
    x, y = [float(v) for v in chu.split(',')]
    return (x, y)


def xu_ly_thuy(tai_lai):
    print('\n9. Đọc tuyến và bến đường thủy')
    tuyen = doc_csv(GT / 'tuyen_thuy.csv',
                    ['ma', 'ten_vi', 'ten_en', 'loai', 'trang_thai', 'mo_ta_vi', 'truy_van', 'cat_doan',
                     'so_tau', 'toc_do', 'nguon', 'ngay_cap_nhat', 'da_kiem_chung'])
    ben = doc_csv(GT / 'ben_thuy.csv', ['ma', 'ten_vi', 'ten_en', 'loai', 'tuyen', 'truy_van'])
    loi = []
    ma_tuyen = [t['ma'] for t in tuyen]
    for t in tuyen:
        vt = f'tuyen_thuy.csv dòng {t["_dong"]}'
        if t['loai'] not in LOAI_TUYEN_THUY:
            loi.append(f'{vt}: cột "loai" phải là một trong: {", ".join(LOAI_TUYEN_THUY)}')
        if t['trang_thai'] not in ('đang hoạt động', 'dự kiến'):
            loi.append(f'{vt}: cột "trang_thai" phải là "đang hoạt động" hoặc "dự kiến"')
        if not t['nguon'].startswith('http'):
            loi.append(f'{vt}: cột "nguon" phải bắt đầu bằng http')
        if t['da_kiem_chung'] not in KIEM_CHUNG_HOP_LE:
            loi.append(f'{vt}: cột "da_kiem_chung" phải là "có" hoặc "cần kiểm chứng"')
        try:
            assert int(t['so_tau'] or 0) >= 0 and float((t['toc_do'] or '0').replace(',', '.')) >= 0
        except Exception:
            loi.append(f'{vt}: "so_tau" và "toc_do" phải là số không âm')
        if t['cat_doan']:
            try:
                assert len([doc_diem(p) for p in t['cat_doan'].split(';')]) == 2
            except Exception:
                loi.append(f'{vt}: "cat_doan" phải có dạng kinh độ,vĩ độ;kinh độ,vĩ độ')
    for b in ben:
        vt = f'ben_thuy.csv dòng {b["_dong"]}'
        if b['loai'] not in LOAI_BEN:
            loi.append(f'{vt}: cột "loai" phải là một trong: {", ".join(LOAI_BEN)}')
        if b['tuyen'] and b['tuyen'] not in ma_tuyen:
            loi.append(f'{vt}: tuyến "{b["tuyen"]}" không có trong tuyen_thuy.csv')
        if not b['truy_van']:
            loi.append(f'{vt}: thiếu "truy_van"')
    if loi:
        raise LoiDuLieu('Có lỗi trong file dữ liệu đường thủy:\n  - ' + '\n  - '.join(loi))

    print('10. Hình dạng tuyến và vị trí bến từ OpenStreetMap')
    co_hinh = [t for t in tuyen if t['truy_van']]
    truy_van = ('[out:json][timeout:150];'
                + ''.join(f'({t["truy_van"]}({KHUNG_THUY});)->.s;.s out count;.s out geom;' for t in co_hinh)
                + ''.join(f'({b["truy_van"]}({KHUNG_THUY});)->.s;.s out count;.s out center;' for b in ben))
    tep = GT / 'goc_osm' / 'duong_thuy.json'
    tep_tv = GT / 'goc_osm' / 'truy_van_thuy.txt'
    if tai_lai or not tep.exists() or not tep_tv.exists() or tep_tv.read_text(encoding='utf-8') != truy_van:
        tai(truy_van, tep)
        tep_tv.write_text(truy_van, encoding='utf-8')
    phan_tu = json.loads(tep.read_text(encoding='utf-8'))['elements']

    canh_bao = []
    doi_tuong = []
    vi_tri = 0

    def lay_nhom():
        nonlocal vi_tri
        if vi_tri >= len(phan_tu) or phan_tu[vi_tri].get('type') != 'count':
            raise LoiDuLieu('Dữ liệu đường thủy đã tải không khớp danh sách. Hãy chạy lại với --tai-lai.')
        so = int(phan_tu[vi_tri]['tags']['total'])
        nhom = phan_tu[vi_tri + 1: vi_tri + 1 + so]
        vi_tri += 1 + so
        return nhom

    for t in co_hinh:
        doan = []
        for w in lay_nhom():
            if w.get('type') != 'way' or not w.get('geometry'):
                continue
            pts = []
            for p in w['geometry']:
                q = (round(p['lon'], 6), round(p['lat'], 6))
                if not pts or pts[-1] != q:
                    pts.append(q)
            if len(pts) >= 2:
                doan.append(pts)
        if not doan:
            canh_bao.append(f'Tuyến "{t["ten_vi"]}": OpenStreetMap không trả về hình dạng, sẽ không hiện trên bản đồ')
            continue
        chuoi = noi_chuoi(doan)
        ve = doan
        if t['cat_doan']:
            a, b = [doc_diem(p) for p in t['cat_doan'].split(';')]
            ia = min(range(len(chuoi)), key=lambda i: khoang_cach(chuoi[i], a))
            ib = min(range(len(chuoi)), key=lambda i: khoang_cach(chuoi[i], b))
            chuoi = chuoi[ia:ib + 1] if ia <= ib else chuoi[ib:ia + 1][::-1]
            ve = [chuoi]
        chuoi = gian_luoc(chuoi, SAI_SO)
        if len(chuoi) < 2:
            canh_bao.append(f'Tuyến "{t["ten_vi"]}": đoạn cắt quá ngắn, sẽ không hiện trên bản đồ')
            continue
        dai = sum(khoang_cach(chuoi[k], chuoi[k + 1]) for k in range(len(chuoi) - 1))
        doi_tuong.append({'type': 'Feature', 'properties': {'ma': t['ma'], 'hinh': 'tuyến', 'loai': t['loai']},
                          'geometry': {'type': 'MultiLineString',
                                       'coordinates': [[list(p) for p in gian_luoc(d, SAI_SO)] for d in ve]}})
        doi_tuong.append({'type': 'Feature',
                          'properties': {'ma': t['ma'], 'hinh': 'đường chạy', 'loai': t['loai'], 'dai_m': round(dai)},
                          'geometry': {'type': 'LineString', 'coordinates': [list(p) for p in chuoi]}})
    for b in ben:
        nhom = lay_nhom()
        diem = None
        for e in nhom:
            c = e if 'lon' in e else e.get('center')
            if c:
                diem = [round(c['lon'], 6), round(c['lat'], 6)]
                break
        if not diem:
            canh_bao.append(f'Bến "{b["ten_vi"]}": không tìm thấy trên OpenStreetMap, sẽ không hiện trên bản đồ')
            continue
        doi_tuong.append({'type': 'Feature', 'properties': {'ma': b['ma'], 'hinh': 'bến', 'loai': b['loai']},
                          'geometry': {'type': 'Point', 'coordinates': diem}})
    ghi_geojson(GT / 'duong_thuy.geojson', doi_tuong)

    chay = [f'{f["properties"]["ma"]}: đường chạy dài {f["properties"]["dai_m"] / 1000:.1f} km'
            for f in doi_tuong if f['properties']['hinh'] == 'đường chạy']
    bao_cao = [
        'BÁO CÁO KIỂM TRA DỮ LIỆU ĐƯỜNG THỦY',
        f'Tạo lúc: {time.strftime("%d/%m/%Y %H:%M")} (file này do máy tạo, đừng sửa tay)',
        '',
        f'Tuyến: {len(tuyen)} (có hình dạng: {len(chay)}). Bến và cảng: {len(ben)}.',
        *[f'  - {c}' for c in chay],
        '',
        f'CẢNH BÁO ({len(canh_bao)}):' if canh_bao else 'CẢNH BÁO: không có.',
        *[f'  - {c}' for c in canh_bao],
        '',
        'MỤC CẦN KIỂM CHỨNG:', *[f'  - {t["ten_vi"]}' for t in tuyen if t['da_kiem_chung'] != 'có'],
        '',
    ]
    (GT / 'BAO_CAO_KIEM_TRA_THUY.txt').write_text('\n'.join(bao_cao), encoding='utf-8')
    print('\n' + '\n'.join(bao_cao))
    return len(canh_bao)


# ---------------------------------------------------------------- tour học tập
LOP_TOUR = ['hanh-chinh', 'du-an', 'duong-bo', 'thuy']


def kiem_tra_tour():
    print('\n11. Kiểm tra nội dung các tour')
    thu_muc = GOC / 'data' / 'tour'
    tour = doc_csv(thu_muc / 'tour.csv', ['ma', 'ten_vi', 'ten_en', 'mo_ta_vi', 'mo_ta_en'])
    buoc = doc_csv(thu_muc / 'buoc.csv',
                   ['tour', 'thu_tu', 'tieu_de_vi', 'loi_dan_vi', 'cau_hoi_vi', 'kinh_do', 'vi_do',
                    'thu_phong', 'nghieng', 'xoay', 'lop', 'ky_hanh_chinh', 'kich_ban'])
    kich_ban = [k['ma'] for k in doc_csv(GT / 'kich_ban.csv', ['ma'])]
    loi = []
    ma_tour = [t['ma'] for t in tour]
    for b in buoc:
        vt = f'buoc.csv dòng {b["_dong"]}'
        if b['tour'] not in ma_tour:
            loi.append(f'{vt}: tour "{b["tour"]}" không có trong tour.csv')
        if not b['tieu_de_vi'] or not b['loi_dan_vi']:
            loi.append(f'{vt}: thiếu "tieu_de_vi" hoặc "loi_dan_vi"')
        try:
            x, y = float(b['kinh_do'].replace(',', '.')), float(b['vi_do'].replace(',', '.'))
            assert 106.62 <= x <= 106.83 and 10.70 <= y <= 10.86
            assert 10 <= float(b['thu_phong'].replace(',', '.')) <= 18
            assert 0 <= float((b['nghieng'] or '0').replace(',', '.')) <= 70
            float((b['xoay'] or '0').replace(',', '.'))
            int(b['thu_tu'])
        except Exception:
            loi.append(f'{vt}: vị trí không hợp lệ. Kinh độ 106.62-106.83, vĩ độ 10.70-10.86, '
                       f'thu phóng 10-18, nghiêng 0-70; "thu_tu" phải là số nguyên')
        for l in [x for x in b['lop'].split('|') if x]:
            if l not in LOP_TOUR:
                loi.append(f'{vt}: lớp "{l}" không hợp lệ; dùng: {", ".join(LOP_TOUR)} (ngăn bằng dấu |)')
        if b['ky_hanh_chinh'] not in ('', 'truoc', 'sau'):
            loi.append(f'{vt}: "ky_hanh_chinh" phải để trống, hoặc là "truoc" hay "sau"')
        if b['kich_ban'] and b['kich_ban'] not in kich_ban:
            loi.append(f'{vt}: kịch bản "{b["kich_ban"]}" không có trong kich_ban.csv')
    for t in tour:
        if not any(b['tour'] == t['ma'] for b in buoc):
            loi.append(f'tour.csv dòng {t["_dong"]}: tour "{t["ma"]}" chưa có bước nào trong buoc.csv')
    if loi:
        raise LoiDuLieu('Có lỗi trong file tour:\n  - ' + '\n  - '.join(loi))
    thieu_en = sum(1 for b in buoc if not b.get('loi_dan_en') or not b.get('cau_hoi_en'))
    print(f'  {len(tour)} tour, {len(buoc)} bước. Bước chưa có bản tiếng Anh: {thieu_en}.')
    return 0


# ---------------------------------------------------------------- sa bàn vùng
VUNG = GOC / 'data' / 'vung'
NHOM_VUNG = ['mới', 'cũ']
SAI_SO_VUNG = 0.0003   # khoảng 30 mét: đủ mịn ở tầm nhìn toàn vùng, file nhẹ cho điện thoại


def xu_ly_vung(tai_lai):
    print('\nSA BÀN VÙNG\n1. Đọc bảng các tỉnh, thành trong vùng')
    vung = doc_csv(VUNG / 'vung.csv', ['ma', 'ten_vi', 'ten_en', 'nhom', 'osm_id', 'ghi_chu_vi',
                                       'nguon_ten', 'nguon', 'ngay_cap_nhat', 'da_kiem_chung'])
    loi = []
    cac_ma = [v['ma'] for v in vung]
    for v in vung:
        vt = f'vung.csv dòng {v["_dong"]}'
        if not v['ma'] or not v['ten_vi']:
            loi.append(f'{vt}: thiếu "ma" hoặc "ten_vi"')
        if cac_ma.count(v['ma']) > 1:
            loi.append(f'{vt}: mã "{v["ma"]}" bị trùng')
        if v['nhom'] not in NHOM_VUNG:
            loi.append(f'{vt}: cột "nhom" phải là "mới" hoặc "cũ", đang là "{v["nhom"]}"')
        if not v['osm_id'].isdigit():
            loi.append(f'{vt}: cột "osm_id" phải là một con số')
        if v.get('thuoc') and v['thuoc'] not in cac_ma:
            loi.append(f'{vt}: cột "thuoc" phải để trống hoặc là một mã có trong cột "ma"')
        if not v['nguon'].startswith('http'):
            loi.append(f'{vt}: cột "nguon" phải là một đường link bắt đầu bằng http')
        if v.get('nguon_2') and not v['nguon_2'].startswith('http'):
            loi.append(f'{vt}: cột "nguon_2" phải để trống hoặc là một đường link bắt đầu bằng http')
        if v['da_kiem_chung'] not in KIEM_CHUNG_HOP_LE:
            loi.append(f'{vt}: cột "da_kiem_chung" phải là "có" hoặc "cần kiểm chứng"')
        v['_dt_nguon'] = None
        try:
            if v.get('dien_tich_nguon_km2'):
                v['_dt_nguon'] = float(v['dien_tich_nguon_km2'])
        except ValueError:
            loi.append(f'{vt}: cột "dien_tich_nguon_km2" phải để trống hoặc là một con số (dùng dấu chấm)')
        v['_nhan'] = None
        try:
            if v.get('nhan_kinh_do') or v.get('nhan_vi_do'):
                v['_nhan'] = (float(v['nhan_kinh_do']), float(v['nhan_vi_do']))
        except (ValueError, KeyError):
            loi.append(f'{vt}: "nhan_kinh_do" và "nhan_vi_do" phải cùng để trống hoặc cùng là con số (dùng dấu chấm)')
    if loi:
        raise LoiDuLieu('Có lỗi trong file dữ liệu:\n  - ' + '\n  - '.join(loi))

    print('2. Ranh giới từ OpenStreetMap')
    tep = {'mới': VUNG / 'goc_osm' / 'ranh_gioi_vung_moi.json',
           'cũ': VUNG / 'goc_osm' / 'ranh_gioi_vung_cu_2025_05.json'}
    hinh = {}
    for nhom in NHOM_VUNG:
        cac_id = sorted({v['osm_id'] for v in vung if v['nhom'] == nhom})
        if not cac_id:
            continue
        da_co = set()
        if tep[nhom].exists():
            da_co = {str(r['id']) for r in json.loads(tep[nhom].read_text(encoding='utf-8'))['elements']}
        if tai_lai or not set(cac_id) <= da_co:
            ngay = f'[date:"{NGAY_CU}"]' if nhom == 'cũ' else ''
            tai(f'[out:json][timeout:240]{ngay};relation(id:{",".join(cac_id)});out geom;', tep[nhom])
        for rel in json.loads(tep[nhom].read_text(encoding='utf-8'))['elements']:
            hinh[(nhom, str(rel['id']))] = (da_giac_tu_relation(rel, SAI_SO_VUNG),
                                            rel.get('tags', {}).get('name', ''))
    thieu = [v['ten_vi'] for v in vung if (v['nhom'], v['osm_id']) not in hinh]
    if thieu:
        raise LoiDuLieu('OpenStreetMap không có ranh giới cho: ' + ', '.join(thieu))

    print('3. Kiểm tra và ghi file bản đồ')
    canh_bao, so_dt, doi_tuong = [], [], []
    dt = {}
    for v in vung:
        dg, ten_osm = hinh[(v['nhom'], v['osm_id'])]
        dt[v['ma']] = dien_tich(dg)
        dong = f'{v["ten_vi"]}: {dt[v["ma"]]:,.0f} km² theo hình vẽ (tên trên OpenStreetMap: "{ten_osm}")'
        if v['_dt_nguon']:
            lech = abs(dt[v['ma']] - v['_dt_nguon']) / v['_dt_nguon'] * 100
            dong += f'; theo nguồn {v["_dt_nguon"]:,.0f} km², lệch {lech:.1f}%'
            if lech > 3:
                canh_bao.append(f'Diện tích hình vẽ của "{v["ten_vi"]}" lệch {lech:.1f}% so với con số trong nguồn')
        so_dt.append(dong)
        # vị trí đặt tên trên bản đồ: lấy trong vung.csv nếu có (ranh giới ven biển của
        # OpenStreetMap gồm cả mặt biển nên điểm tự tính có thể rơi ra biển)
        diem = v['_nhan'] or diem_trong(dg)
        if v['_nhan'] and not trong_da_giac(diem, dg):
            canh_bao.append(f'Vị trí đặt tên của "{v["ten_vi"]}" trong vung.csv nằm ngoài ranh giới của nó')
        doi_tuong.append({'type': 'Feature',
                          'properties': {'ma': v['ma'], 'nhom': v['nhom'], 'osm': int(v['osm_id']),
                                         'diem': [round(diem[0], 4), round(diem[1], 4)]},
                          'geometry': hinh_geojson(dg)})
    tong_cu = sum(dt[v['ma']] for v in vung if v['nhom'] == 'cũ')
    if tong_cu and 'tphcm' in dt:
        lech = abs(dt['tphcm'] - tong_cu) / tong_cu * 100
        so_dt.append(f'Tổng các địa phương cũ: {tong_cu:,.0f} km²; Thành phố Hồ Chí Minh mới: '
                     f'{dt["tphcm"]:,.0f} km²; lệch {lech:.1f}%')
        if lech > 3:
            canh_bao.append(f'Tổng diện tích các địa phương cũ lệch {lech:.1f}% so với Thành phố Hồ Chí Minh mới')
    ghi_geojson(VUNG / 'vung.geojson', doi_tuong)

    can_kc = [v['ten_vi'] for v in vung if v['da_kiem_chung'] != 'có']
    bao_cao = [
        'BÁO CÁO KIỂM TRA DỮ LIỆU SA BÀN VÙNG',
        f'Tạo lúc: {time.strftime("%d/%m/%Y %H:%M")} (file này do máy tạo, đừng sửa tay)',
        '',
        f'Số vùng: {len(vung)}. Ranh giới cũ lấy từ bản lưu OpenStreetMap ngày {NGAY_CU[:10]}.',
        'Diện tích theo hình vẽ chỉ là gần đúng. Với địa phương ven biển, ranh giới trên OpenStreetMap',
        'gồm cả vùng biển (tới Côn Đảo) nên diện tích hình vẽ lớn hơn nhiều so với diện tích đất liền.',
        '',
        f'CẢNH BÁO ({len(canh_bao)}):' if canh_bao else 'CẢNH BÁO: không có.',
        *[f'  - {c}' for c in canh_bao],
        '',
        'DIỆN TÍCH:',
        *[f'  - {s}' for s in so_dt],
        '',
        f'MỤC CẦN KIỂM CHỨNG ({len(can_kc)}):',
        *[f'  - {s}' for s in can_kc],
        '',
    ]
    (VUNG / 'BAO_CAO_KIEM_TRA.txt').write_text('\n'.join(bao_cao), encoding='utf-8')
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
        so_canh_bao += xu_ly_giao_thong('--tai-lai' in sys.argv)
        so_canh_bao += xu_ly_thuy('--tai-lai' in sys.argv)
        so_canh_bao += kiem_tra_tour()
        so_canh_bao += xu_ly_vung('--tai-lai' in sys.argv)
    except LoiDuLieu as e:
        print(f'\nDỪNG LẠI: {e}')
        return 1
    print('XONG.' + (f' Có {so_canh_bao} cảnh báo, xem các file BAO_CAO_KIEM_TRA.txt trong data/'
                     if so_canh_bao else ' Không có cảnh báo.'))
    return 0


if __name__ == '__main__':
    sys.exit(main())
