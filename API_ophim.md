# OPhim API — tài liệu chi tiết cho AI Agent / Antigravity / Codex

> Nguồn tổng hợp từ trang API public của OPhim và các ví dụ endpoint public đang được cộng đồng sử dụng. Tài liệu này viết theo hướng để AI coding agent có thể đọc, hiểu nhanh và tự sinh code tích hợp.

## 1. Tổng quan

OPhim cung cấp API REST để lấy dữ liệu phim, danh sách phim, tìm kiếm, lọc theo thể loại/quốc gia/năm và lấy chi tiết phim.

### Thông tin chung

| Thuộc tính | Giá trị |
|---|---|
| Base URL chính | `https://ophim1.com` |
| Kiểu dữ liệu | `JSON` |
| Encoding | `UTF-8` |
| HTTP method | `GET` |
| Auth | Không thấy yêu cầu token ở docs public |
| Image CDN thường dùng | `https://img.ophim.live/uploads/movies/` |

### Quy ước quan trọng

- API trả về dữ liệu phim dạng JSON.
- Dữ liệu danh sách thường có `items` hoặc `data.items`, tùy endpoint cũ/mới.
- Ảnh poster/thumb thường chỉ trả về filename, ví dụ `one-piece-thumb.jpg`. Muốn hiển thị ảnh cần nối với `pathImage` hoặc CDN:

```ts
const imageUrl = `${pathImage}${movie.thumb_url}`;
// hoặc fallback
const imageUrl = `https://img.ophim.live/uploads/movies/${movie.thumb_url}`;
```

- Danh sách phim chỉ nên dùng để lấy metadata cơ bản và `slug`.
- Muốn lấy link xem phim / tập phim thì gọi chi tiết phim theo `slug`.
- Không nên crawl toàn bộ detail của hàng chục nghìn phim cùng lúc. Nên phân trang, cache, debounce search, và chỉ gọi chi tiết khi user mở trang phim.

---

## 2. Hai nhóm endpoint cần biết

Hiện có 2 kiểu endpoint thường gặp:

### 2.1. Endpoint legacy

Các endpoint dạng ngắn:

```txt
GET https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=1
GET https://ophim1.com/phim/{slug}
```

Endpoint legacy thường trả response dạng:

```ts
interface LegacyListResponse {
  status: boolean;
  items: MovieListItem[];
  pathImage: string;
  pagination: Pagination;
}
```

### 2.2. Endpoint v1

Các endpoint dạng `/v1/api/...`:

```txt
GET https://ophim1.com/v1/api/home
GET https://ophim1.com/v1/api/danh-sach/{type}?page=1
GET https://ophim1.com/v1/api/phim/{slug}
```

Endpoint v1 thường được cộng đồng dùng theo dạng:

```ts
interface V1Response<T> {
  status: boolean;
  msg?: string;
  data: T;
}
```

Trong code nên viết adapter để hỗ trợ cả 2 format nếu cần.

---

## 3. Kiểu dữ liệu TypeScript đề xuất

```ts
export interface Pagination {
  totalItems?: number;
  totalItemsPerPage?: number;
  currentPage?: number | null;
  totalPages?: number;
}

export interface TmdbInfo {
  type?: 'movie' | 'tv' | string;
  id?: string | number;
  season?: number | null;
  vote_average?: number;
  vote_count?: number;
}

export interface ImdbInfo {
  id?: string;
  vote_average?: number;
  vote_count?: number;
}

export interface MovieListItem {
  _id?: string;
  name: string;
  slug: string;
  origin_name?: string;
  thumb_url?: string;
  poster_url?: string;
  year?: number;
  modified?: {
    time?: string;
  };
  tmdb?: TmdbInfo;
  imdb?: ImdbInfo;
}

export interface CategoryItem {
  id?: string;
  name: string;
  slug: string;
}

export interface CountryItem {
  id?: string;
  name: string;
  slug: string;
}

export interface EpisodeItem {
  name: string;
  slug?: string;
  filename?: string;
  link_embed?: string;
  link_m3u8?: string;
}

export interface EpisodeServer {
  server_name: string;
  server_data: EpisodeItem[];
}

export interface MovieDetail {
  _id?: string;
  name: string;
  slug: string;
  origin_name?: string;
  content?: string;
  type?: string;
  status?: string;
  thumb_url?: string;
  poster_url?: string;
  trailer_url?: string;
  time?: string;
  episode_current?: string;
  episode_total?: string;
  quality?: string;
  lang?: string;
  year?: number;
  actor?: string[];
  director?: string[];
  category?: CategoryItem[];
  country?: CountryItem[];
}

export interface MovieDetailResponse {
  movie?: MovieDetail;
  item?: MovieDetail;
  episodes?: EpisodeServer[];
}
```

---

## 4. Endpoint chi tiết

## 4.1. Lấy phim mới cập nhật — legacy

### Mục đích

Dùng để lấy danh sách phim mới cập nhật theo trang.

### Request

```http
GET /danh-sach/phim-moi-cap-nhat?page={page}
```

### URL đầy đủ

```txt
https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=1
```

### Params

| Param | Kiểu | Bắt buộc | Mô tả |
|---|---:|---:|---|
| `page` | number | Không | Trang cần lấy. Mặc định thường là `1`. |

### Response shape thực tế

```json
{
  "status": true,
  "items": [
    {
      "tmdb": {
        "type": "tv",
        "id": "37854",
        "season": 1,
        "vote_average": 8.7,
        "vote_count": 5216
      },
      "imdb": {
        "id": "tt0388629",
        "vote_average": 9,
        "vote_count": 341535
      },
      "modified": {
        "time": "2026-04-27T11:45:40.000Z"
      },
      "_id": "6220e66e8481266c5b7f154f",
      "name": "Đảo Hải Tặc",
      "origin_name": "One Piece (Luffy)",
      "thumb_url": "one-piece-thumb.jpg",
      "slug": "one-piece",
      "year": 1999,
      "poster_url": "one-piece-poster.jpg"
    }
  ],
  "pathImage": "https://img.ophim.live/uploads/movies/",
  "pagination": {
    "totalItems": 35382,
    "totalItemsPerPage": 24,
    "currentPage": 1,
    "totalPages": 1475
  }
}
```

### Cách dùng

```ts
async function getLatestMovies(page = 1) {
  const res = await fetch(`https://ophim1.com/danh-sach/phim-moi-cap-nhat?page=${page}`);
  if (!res.ok) throw new Error(`OPhim error: ${res.status}`);
  return res.json() as Promise<LegacyListResponse>;
}
```

### Ghi chú cho AI agent

- Dùng endpoint này để render trang “Mới cập nhật”.
- Mỗi item có `slug`, dùng `slug` để gọi chi tiết phim.
- Ảnh lấy bằng `pathImage + thumb_url` hoặc `pathImage + poster_url`.

---

## 4.2. Lấy danh sách phim — v1

### Mục đích

Dùng để lấy phim theo loại danh sách: phim mới cập nhật, phim lẻ, phim bộ, phim đang chiếu, phim hoàn thành, phim vietsub, thuyết minh, lồng tiếng, sắp chiếu...

### Request

```http
GET /v1/api/danh-sach/{type}?page={page}
```

### URL đầy đủ

```txt
https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat?page=1
```

### Path params

| Param | Kiểu | Bắt buộc | Ví dụ | Mô tả |
|---|---:|---:|---|---|
| `type` | string | Có | `phim-moi-cap-nhat` | Loại danh sách phim cần lấy. |

### Một số `type` thường dùng

```txt
phim-moi-cap-nhat
phim-le
phim-bo
phim-bo-dang-chieu
phim-bo-hoan-thanh
phim-sap-chieu
phim-vietsub
phim-thuyet-minh
phim-long-tieng
hoat-hinh
tv-shows
subteam
```

> Lưu ý: một số `type` có thể thay đổi theo server. Nếu 404 hoặc empty data thì cần test lại slug danh sách từ website/menu.

### Query params thường dùng

| Param | Kiểu | Bắt buộc | Ví dụ | Mô tả |
|---|---:|---:|---|---|
| `page` | number | Không | `1` | Phân trang. |
| `sort_field` | string | Không | `_id`, `modified.time`, `year` | Field sort. Tùy server hỗ trợ. |
| `sort_type` | string | Không | `desc`, `asc` | Kiểu sắp xếp. |
| `sort_lang` | string | Không | `vietsub`, `thuyet-minh`, `long-tieng` | Lọc theo ngôn ngữ/phụ đề nếu server hỗ trợ. |
| `category` | string | Không | `hanh-dong` | Lọc theo thể loại. |
| `genre` | string | Không | `hanh-dong` | Một số ví dụ cộng đồng dùng `genre`; nếu `category` không chạy có thể thử `genre`. |
| `country` | string | Không | `han-quoc` | Lọc theo quốc gia. |
| `year` | number/string | Không | `2024` | Lọc theo năm. |
| `limit` | number | Không | `24` | Số item/trang, nếu server hỗ trợ. |

### Response shape dự kiến

```ts
interface V1MovieListData {
  seoOnPage?: unknown;
  breadCrumb?: unknown[];
  titlePage?: string;
  items: MovieListItem[];
  params?: unknown;
  type_list?: string;
  APP_DOMAIN_FRONTEND?: string;
  APP_DOMAIN_CDN_IMAGE?: string;
  pagination: Pagination;
}

interface V1MovieListResponse {
  status: boolean;
  msg?: string;
  data: V1MovieListData;
}
```

### Cách dùng

```ts
async function getMoviesByList(type: string, page = 1) {
  const url = new URL(`https://ophim1.com/v1/api/danh-sach/${type}`);
  url.searchParams.set('page', String(page));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`OPhim error: ${res.status}`);

  const json = await res.json();
  return json.data?.items ?? [];
}
```

### Ví dụ có filter

```ts
async function getFilteredMovies() {
  const url = new URL('https://ophim1.com/v1/api/danh-sach/phim-moi-cap-nhat');
  url.searchParams.set('page', '1');
  url.searchParams.set('category', 'hanh-dong');
  url.searchParams.set('country', 'han-quoc');
  url.searchParams.set('year', '2024');

  const res = await fetch(url.toString());
  return res.json();
}
```

---

## 4.3. Tìm kiếm phim

### Mục đích

Tìm phim theo từ khóa.

### Request

```http
GET /v1/api/tim-kiem?keyword={keyword}&page={page}
```

### URL đầy đủ

```txt
https://ophim1.com/v1/api/tim-kiem?keyword=one%20piece&page=1
```

### Params

| Param | Kiểu | Bắt buộc | Ví dụ | Mô tả |
|---|---:|---:|---|---|
| `keyword` | string | Có | `one piece` | Từ khóa tìm kiếm. Cần encode URL. |
| `page` | number | Không | `1` | Trang kết quả. |

### Cách dùng

```ts
async function searchMovies(keyword: string, page = 1) {
  const url = new URL('https://ophim1.com/v1/api/tim-kiem');
  url.searchParams.set('keyword', keyword);
  url.searchParams.set('page', String(page));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`OPhim search error: ${res.status}`);

  const json = await res.json();
  return json.data?.items ?? [];
}
```

### Ghi chú cho AI agent

- Luôn dùng `URLSearchParams`, không tự nối chuỗi keyword trực tiếp.
- Nên debounce search ở frontend khoảng 300–500ms.
- Không gọi search mỗi lần user gõ một ký tự nếu chưa debounce.

---

## 4.4. Lấy danh sách thể loại

### Mục đích

Lấy toàn bộ thể loại để render dropdown/menu filter.

### Request

```http
GET /v1/api/the-loai
```

### URL đầy đủ

```txt
https://ophim1.com/v1/api/the-loai
```

### Response shape dự kiến

```ts
interface CategoryListResponse {
  status: boolean;
  data: {
    items: CategoryItem[];
  };
}
```

### Item dự kiến

```json
{
  "name": "Hành Động",
  "slug": "hanh-dong"
}
```

### Cách dùng

```ts
async function getCategories() {
  const res = await fetch('https://ophim1.com/v1/api/the-loai');
  if (!res.ok) throw new Error(`OPhim category error: ${res.status}`);

  const json = await res.json();
  return Array.isArray(json.data?.items) ? json.data.items : [];
}
```

---

## 4.5. Lấy phim theo thể loại

### Mục đích

Lấy danh sách phim thuộc một thể loại cụ thể.

### Request

```http
GET /v1/api/the-loai/{slug}?page={page}
```

### URL đầy đủ

```txt
https://ophim1.com/v1/api/the-loai/hanh-dong?page=1
```

### Path params

| Param | Kiểu | Bắt buộc | Ví dụ | Mô tả |
|---|---:|---:|---|---|
| `slug` | string | Có | `hanh-dong` | Slug thể loại lấy từ endpoint `/v1/api/the-loai`. |

### Query params

| Param | Kiểu | Bắt buộc | Mô tả |
|---|---:|---:|---|
| `page` | number | Không | Phân trang. |

### Cách dùng

```ts
async function getMoviesByCategory(categorySlug: string, page = 1) {
  const url = new URL(`https://ophim1.com/v1/api/the-loai/${categorySlug}`);
  url.searchParams.set('page', String(page));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`OPhim category movies error: ${res.status}`);

  const json = await res.json();
  return json.data?.items ?? [];
}
```

---

## 4.6. Lấy danh sách quốc gia

### Mục đích

Lấy toàn bộ quốc gia để render dropdown/menu filter.

### Request

```http
GET /v1/api/quoc-gia
```

### URL đầy đủ

```txt
https://ophim1.com/v1/api/quoc-gia
```

### Response shape dự kiến

```ts
interface CountryListResponse {
  status: boolean;
  data: {
    items: CountryItem[];
  };
}
```

### Item dự kiến

```json
{
  "name": "Hàn Quốc",
  "slug": "han-quoc"
}
```

### Cách dùng

```ts
async function getCountries() {
  const res = await fetch('https://ophim1.com/v1/api/quoc-gia');
  if (!res.ok) throw new Error(`OPhim country error: ${res.status}`);

  const json = await res.json();
  return Array.isArray(json.data?.items) ? json.data.items : [];
}
```

---

## 4.7. Lấy phim theo quốc gia

### Mục đích

Lấy danh sách phim thuộc một quốc gia cụ thể.

### Request

```http
GET /v1/api/quoc-gia/{slug}?page={page}
```

### URL đầy đủ

```txt
https://ophim1.com/v1/api/quoc-gia/han-quoc?page=1
```

### Path params

| Param | Kiểu | Bắt buộc | Ví dụ | Mô tả |
|---|---:|---:|---|---|
| `slug` | string | Có | `han-quoc` | Slug quốc gia lấy từ endpoint `/v1/api/quoc-gia`. |

### Cách dùng

```ts
async function getMoviesByCountry(countrySlug: string, page = 1) {
  const url = new URL(`https://ophim1.com/v1/api/quoc-gia/${countrySlug}`);
  url.searchParams.set('page', String(page));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`OPhim country movies error: ${res.status}`);

  const json = await res.json();
  return json.data?.items ?? [];
}
```

---

## 4.8. Lấy phim theo năm phát hành

### Mục đích

Lấy danh sách phim theo năm phát hành.

### Request

```http
GET /v1/api/nam/{year}?page={page}
```

### URL đầy đủ

```txt
https://ophim1.com/v1/api/nam/2024?page=1
```

### Path params

| Param | Kiểu | Bắt buộc | Ví dụ | Mô tả |
|---|---:|---:|---|---|
| `year` | number/string | Có | `2024` | Năm phát hành. |

### Query params

| Param | Kiểu | Bắt buộc | Mô tả |
|---|---:|---:|---|
| `page` | number | Không | Phân trang. |

### Cách dùng

```ts
async function getMoviesByYear(year: number, page = 1) {
  const url = new URL(`https://ophim1.com/v1/api/nam/${year}`);
  url.searchParams.set('page', String(page));

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`OPhim year movies error: ${res.status}`);

  const json = await res.json();
  return json.data?.items ?? [];
}
```

> Nếu endpoint `/v1/api/nam/{year}` không chạy, thử kiểm tra lại docs/API Postman hiện tại vì trang docs gọi nhóm này là “Năm Phát Hành”, nhưng HTML public không expose path chi tiết.

---

## 4.9. Lấy chi tiết phim — legacy

### Mục đích

Lấy thông tin đầy đủ của một phim, bao gồm mô tả, diễn viên, đạo diễn, thể loại, quốc gia và danh sách tập/link xem.

### Request

```http
GET /phim/{slug}
```

### URL đầy đủ

```txt
https://ophim1.com/phim/one-piece
```

### Path params

| Param | Kiểu | Bắt buộc | Ví dụ | Mô tả |
|---|---:|---:|---|---|
| `slug` | string | Có | `one-piece` | Slug lấy từ item danh sách hoặc kết quả search. |

### Response shape thường gặp

```ts
interface LegacyMovieDetailResponse {
  status: boolean;
  movie: MovieDetail;
  episodes: EpisodeServer[];
}
```

### Cách dùng

```ts
async function getMovieDetailLegacy(slug: string) {
  const res = await fetch(`https://ophim1.com/phim/${slug}`);
  if (!res.ok) throw new Error(`OPhim movie detail error: ${res.status}`);

  const json = await res.json();

  return {
    movie: json.movie,
    episodes: json.episodes ?? [],
  };
}
```

### Cách lấy link xem phim

```ts
const detail = await getMovieDetailLegacy('one-piece');

const firstServer = detail.episodes[0];
const firstEpisode = firstServer?.server_data?.[0];

console.log(firstEpisode?.link_embed);
console.log(firstEpisode?.link_m3u8);
```

### Ghi chú cho AI agent

- `episodes` là mảng server.
- Mỗi server có `server_name` và `server_data`.
- `server_data` là danh sách tập.
- Mỗi tập có thể có `link_embed` và/hoặc `link_m3u8`.
- Khi render player, ưu tiên `link_embed` nếu dùng iframe, hoặc `link_m3u8` nếu dùng HLS player.

---

## 4.10. Lấy chi tiết phim — v1

### Mục đích

Tương tự legacy detail nhưng theo format v1.

### Request

```http
GET /v1/api/phim/{slug}
```

### URL đầy đủ

```txt
https://ophim1.com/v1/api/phim/one-piece
```

### Response shape dự kiến

```ts
interface V1MovieDetailData {
  seoOnPage?: unknown;
  breadCrumb?: unknown[];
  params?: unknown;
  item: MovieDetail;
  episodes: EpisodeServer[];
  APP_DOMAIN_CDN_IMAGE?: string;
}

interface V1MovieDetailResponse {
  status: boolean;
  msg?: string;
  data: V1MovieDetailData;
}
```

### Cách dùng

```ts
async function getMovieDetailV1(slug: string) {
  const res = await fetch(`https://ophim1.com/v1/api/phim/${slug}`);
  if (!res.ok) throw new Error(`OPhim v1 movie detail error: ${res.status}`);

  const json = await res.json();

  return {
    movie: json.data?.item,
    episodes: json.data?.episodes ?? [],
    imageDomain: json.data?.APP_DOMAIN_CDN_IMAGE,
  };
}
```

---

## 5. Adapter chuẩn hóa response

Nên viết adapter để code không phụ thuộc quá cứng vào legacy hoặc v1.

```ts
export function normalizeMovieListResponse(json: any) {
  const items = json?.items ?? json?.data?.items ?? [];
  const pagination = json?.pagination ?? json?.data?.pagination ?? null;
  const pathImage =
    json?.pathImage ??
    json?.data?.APP_DOMAIN_CDN_IMAGE ??
    'https://img.ophim.live/uploads/movies/';

  return {
    status: Boolean(json?.status),
    items,
    pagination,
    pathImage,
  };
}

export function normalizeMovieDetailResponse(json: any) {
  const movie = json?.movie ?? json?.data?.item ?? json?.item ?? null;
  const episodes = json?.episodes ?? json?.data?.episodes ?? [];
  const pathImage =
    json?.pathImage ??
    json?.data?.APP_DOMAIN_CDN_IMAGE ??
    'https://img.ophim.live/uploads/movies/';

  return {
    status: Boolean(json?.status),
    movie,
    episodes,
    pathImage,
  };
}
```

---

## 6. Service TypeScript hoàn chỉnh

```ts
const OPHIM_BASE_URL = 'https://ophim1.com';
const OPHIM_IMAGE_FALLBACK = 'https://img.ophim.live/uploads/movies/';

async function requestJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error(`OPhim API error ${res.status}: ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

export function getMovieImageUrl(pathImage: string | undefined, fileName?: string) {
  if (!fileName) return '';
  return `${pathImage || OPHIM_IMAGE_FALLBACK}${fileName}`;
}

export async function getLatestMovies(page = 1) {
  const url = `${OPHIM_BASE_URL}/danh-sach/phim-moi-cap-nhat?page=${page}`;
  const json = await requestJson<any>(url);
  return normalizeMovieListResponse(json);
}

export async function getMovieDetail(slug: string) {
  const url = `${OPHIM_BASE_URL}/phim/${encodeURIComponent(slug)}`;
  const json = await requestJson<any>(url);
  return normalizeMovieDetailResponse(json);
}

export async function searchMovies(keyword: string, page = 1) {
  const url = new URL(`${OPHIM_BASE_URL}/v1/api/tim-kiem`);
  url.searchParams.set('keyword', keyword);
  url.searchParams.set('page', String(page));

  const json = await requestJson<any>(url.toString());
  return normalizeMovieListResponse(json);
}

export async function getCategories() {
  const json = await requestJson<any>(`${OPHIM_BASE_URL}/v1/api/the-loai`);
  return json?.data?.items ?? [];
}

export async function getCountries() {
  const json = await requestJson<any>(`${OPHIM_BASE_URL}/v1/api/quoc-gia`);
  return json?.data?.items ?? [];
}
```

---

## 7. Luồng tích hợp frontend đề xuất

### Trang danh sách phim mới

1. Gọi `getLatestMovies(page)`.
2. Render `items`.
3. Ảnh: `pathImage + item.thumb_url`.
4. Khi user click phim, navigate tới `/movie/{slug}`.

### Trang chi tiết phim

1. Lấy `slug` từ route.
2. Gọi `getMovieDetail(slug)`.
3. Render `movie.name`, `movie.content`, `movie.category`, `movie.country`, `movie.actor`, `movie.director`.
4. Render danh sách episode từ `episodes`.
5. Khi user chọn tập:
   - Nếu dùng iframe: set `src = episode.link_embed`.
   - Nếu dùng HLS: set player source = `episode.link_m3u8`.

### Trang tìm kiếm

1. User nhập keyword.
2. Debounce 300–500ms.
3. Gọi `searchMovies(keyword, page)`.
4. Render items giống trang list.

---

## 8. Prompt ngắn cho Antigravity / Codex

Có thể đưa đoạn này cho AI coding agent:

```txt
Build a movie browsing integration using OPhim API.

Base URL: https://ophim1.com
Data format: JSON, UTF-8, method GET.

Use these endpoints:
- Latest movies: GET /danh-sach/phim-moi-cap-nhat?page={page}
- Movie detail: GET /phim/{slug}
- Search: GET /v1/api/tim-kiem?keyword={keyword}&page={page}
- Categories: GET /v1/api/the-loai
- Countries: GET /v1/api/quoc-gia
- List by type: GET /v1/api/danh-sach/{type}?page={page}
- Movies by category: GET /v1/api/the-loai/{slug}?page={page}
- Movies by country: GET /v1/api/quoc-gia/{slug}?page={page}
- Movies by year: GET /v1/api/nam/{year}?page={page}

Important response rules:
- Legacy list response has: status, items, pathImage, pagination.
- v1 response usually has: status, msg, data.
- v1 list items are usually in data.items.
- Movie detail usually has movie/item and episodes.
- Use movie.slug from list/search to call detail.
- To render images, concatenate pathImage or CDN image domain with thumb_url/poster_url.
- Image fallback CDN: https://img.ophim.live/uploads/movies/
- Episode links are usually in episodes[].server_data[].link_embed or link_m3u8.

Implementation requirements:
- Create an API service module.
- Add safe fetch wrapper with error handling.
- Normalize legacy and v1 responses.
- Do not crawl all detail pages at once.
- Add pagination support.
- Add debounce for search.
```

---

## 9. Lưu ý production

- API public có thể thay đổi format/path, nên code cần defensive parsing.
- Cần xử lý lỗi mạng, response rỗng, item thiếu ảnh, item thiếu `slug`.
- Nên cache danh sách thể loại/quốc gia vì ít thay đổi.
- Nên cache detail phim sau khi user mở phim.
- Với website thật, không nên phụ thuộc 100% vào API public. Có thể lưu dữ liệu về database riêng để giảm rủi ro API đổi/chậm/lỗi.
- Nếu dùng `link_m3u8`, cần kiểm tra CORS/player support.
- Nếu dùng iframe `link_embed`, cần kiểm tra domain có cho embed không.

---

## 10. Checklist cho AI agent khi code

- [ ] Có file `ophim.service.ts` hoặc tương đương.
- [ ] Có `requestJson()` xử lý lỗi HTTP.
- [ ] Có `normalizeMovieListResponse()`.
- [ ] Có `normalizeMovieDetailResponse()`.
- [ ] Có hàm `getLatestMovies(page)`.
- [ ] Có hàm `getMovieDetail(slug)`.
- [ ] Có hàm `searchMovies(keyword, page)`.
- [ ] Có hàm `getCategories()`.
- [ ] Có hàm `getCountries()`.
- [ ] UI danh sách dùng `movie.slug` để route detail.
- [ ] UI ảnh dùng `pathImage + thumb_url` hoặc fallback CDN.
- [ ] UI episode đọc từ `episodes[].server_data[]`.
- [ ] Không fetch detail hàng loạt cho toàn bộ list.