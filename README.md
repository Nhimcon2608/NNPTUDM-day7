# NNPTUDM-day7

API quản lý tồn kho với `Product` và `Inventory`.

## 1. Cài đặt

```bash
npm install
cp .env.example .env
```

Cập nhật `MONGODB_URI` trong `.env` nếu cần, sau đó chạy:

```bash
npm run dev
```

Kiểm tra nhanh toàn bộ luồng API:

```bash
npm run smoke
```

## 2. API

### Product

- `POST /api/products`
- `GET /api/products`
- `GET /api/products/:id`

Body tạo product:

```json
{
  "name": "iPhone 16",
  "sku": "IP16-001",
  "price": 25000000,
  "description": "128GB"
}
```

Khi tạo product thành công, hệ thống tự tạo một `inventory` tương ứng với:

```json
{
  "stock": 0,
  "reserved": 0,
  "soldCount": 0
}
```

### Inventory

- `GET /api/inventories`
- `GET /api/inventories/:id`
- `POST /api/inventories/add-stock`
- `POST /api/inventories/remove-stock`
- `POST /api/inventories/reservation`
- `POST /api/inventories/sold`

Body cho các API thao tác kho:

```json
{
  "product": "PRODUCT_ID",
  "quantity": 5
}
```
