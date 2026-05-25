# Animekun

Ứng dụng xem anime và hoạt hình xây bằng Next.js App Router. Mặc định dữ liệu được lấy từ OPhim API `https://ophim1.com`, ảnh dùng CDN `https://img.ophim.live/uploads/movies/`, hỗ trợ tìm kiếm, duyệt theo danh sách/thể loại/quốc gia/năm và xem tập phim bằng link embed/HLS từ API.

App hiện hỗ trợ 3 nguồn dữ liệu:

- `ophim` mặc định, đầy đủ flow hiện tại
- `nguonc` để dùng adapter tham chiếu từ `src/services/api.js`
- `kkphim` để dùng nguồn `phimapi.com`

Ứng dụng có lớp khóa truy cập riêng: khi mở web, người dùng phải nhập đúng key mới vào được nội dung.

## Công nghệ

- Next.js `16.2.6`
- React `19.2.4`
- TypeScript
- Tailwind CSS `4`
- Docker multi-stage build với Next standalone output
- Font: Be Vietnam Pro

## Nguồn API

| Chức năng | Endpoint |
| --- | --- |
| Phim mới cập nhật | `GET https://ophim1.com/danh-sach/phim-moi-cap-nhat?page={page}` |
| Chi tiết phim | `GET https://ophim1.com/phim/{slug}` |
| Tìm kiếm | `GET https://ophim1.com/v1/api/tim-kiem?keyword={keyword}&page={page}` |
| Danh sách | `GET https://ophim1.com/v1/api/danh-sach/{type}?page={page}` |
| Thể loại | `GET https://ophim1.com/v1/api/the-loai/{slug}?page={page}` |
| Quốc gia | `GET https://ophim1.com/v1/api/quoc-gia/{slug}?page={page}` |
| Năm phát hành | `GET https://ophim1.com/v1/api/nam/{year}?page={page}` |
| Ảnh | `https://img.ophim.live/uploads/movies/{file}` |

## Chạy local

Cài dependency:

```bash
npm install
```

Chạy dev server:

```bash
npm run dev
```

Mở trình duyệt tại:

```text
http://localhost:3001
```

Key mặc định khi chạy local là:

```text
change-me
```

Bạn có thể đổi bằng biến môi trường:

```bash
WEB_FILM_ACCESS_KEY=your-private-key npm run dev
```

Trên PowerShell:

```powershell
$env:WEB_FILM_ACCESS_KEY="your-private-key"; npm run dev
```

## Build production

```bash
npm run build
npm run start
```

## Chạy bằng Docker Compose

Đổi `WEB_FILM_ACCESS_KEY` trong `docker-compose.yaml` thành key riêng của bạn, sau đó chạy:

```bash
docker compose up --build -d
```

Mở:

```text
http://localhost:3001
```

Dừng container:

```bash
docker compose down
```

## Biến môi trường

| Biến | Mô tả | Mặc định |
| --- | --- | --- |
| `WEB_FILM_ACCESS_KEY` | Key dùng để mở khóa web | `change-me` |
| `FILM_API_SOURCE` | Chọn nguồn phim: `ophim`, `nguonc` hoặc `kkphim` | `ophim` |
| `PORT` | Port app lắng nghe trong container | `3001` |
| `HOSTNAME` | Hostname cho Next standalone server | `0.0.0.0` |
| `NEXT_TELEMETRY_DISABLED` | Tắt telemetry của Next.js | `1` |

Ví dụ chạy với NguonC:

```bash
FILM_API_SOURCE=nguonc npm run dev
```

Ví dụ chạy với KKPhim:

```bash
FILM_API_SOURCE=kkphim npm run dev
```

## Cấu trúc chính

```text
app/
  api/unlock/route.ts        Route kiểm tra key và set cookie
  components/                UI components
  lib/access.ts              Helper cho access key/cookie
  lib/phim.ts                Client lấy dữ liệu phim từ API
  unlock/page.tsx            Trang nhập key
proxy.ts                     Chặn request khi chưa mở khóa
Dockerfile                   Image production standalone
docker-compose.yaml          Chạy app bằng Docker Compose
```

## Ghi chú deploy

- App dùng `proxy.ts` của Next.js 16 thay cho `middleware.ts`.
- Redirect sau khi nhập key dùng đường dẫn tương đối để tránh bị nhảy về host nội bộ như `0.0.0.0:3001` khi chạy sau reverse proxy.
- Nếu deploy sau Nginx/Caddy/Cloudflare, hãy trỏ domain về port `3001` của container.
- Không commit key thật nếu repo được public.

## Scripts

```bash
npm run dev      # chạy môi trường phát triển
npm run build    # build production
npm run start    # chạy production build
npm run lint     # kiểm tra lint
```
