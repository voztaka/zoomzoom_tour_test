# 줌줌투어 코딩 테스트

## 개요

줌줌투어 코딩 테스트와 관련된 내용을 아래 기술합니다.

## 개발 환경

- **OS:** Windows 11
- **Language:** Node.js (v20.9.0)
- **Database:** MySQL (v5.7)
- **Cache:** Redis (v6.0)
- **Web Application Framework:** NestJS (v10.0)
- **ORM:** TypeORM

## 설치 및 설정

1. **Repository 복제**

   ```
   $ git clone https://github.com/voztaka/zoomzoom_tour_test.git
   $ cd zoomzoom_tour_test
   ```

2. **모듈 설치**

   ```
   $ yarn
   ```

3. **Database 설정**

   - Docker에 MySQL을 설치합니다.
   - DB 실행 스크립트는 root directory의 db.sql 를 참조합니다.

   ```
   $ docker pull mysql:5.7
   $ docker run -d -p 3311:3306 -e MYSQL_ROOT_PASSWORD=1234 --name zoomzoom_tour_mysql mysql:5.7
   ```

4. **Redis Cache 설정**

   - Docker에 Redis를 설치합니다.

   ```
   $ docker pull redis:6.0
   $ docker run --name zoomzoom_tour_redis -p 6579:6379 -d redis:6.0
   ```

5. **Environment 설정**

   - 환경 설정 값들을 .env로 분리하지 않고, 프로젝트 내부에 하드코딩을 하였습니다.

6. **서버 실행**
   - 개발망으로 서버를 실행합니다.
   ```
   $ yarn start:dev
   ```

## API 문서

### 모든 API 공통 오류 응답

API 오류 응답은 일관된 형식을 사용합니다.

- **Status Code:** 400 Bad Request
- **Content:**

  ```json
  {
    "message": [
      "month must be a string",
      "year must be a string",
      "tour_product_id must be a string"
    ],
    "error": "Bad Request",
    "statusCode": 400
  }
  ```

### 1) 고객 - 월 단위 예약 가능한 일자 조회

투어 상품 번호와 함께 년도 및 월을 입력받아, 해당 월의 휴일을 제외한 모든 예약 가능한 날짜를 반환합니다.

#### Endpoint

```
GET /customers/tour_products/schedule
```

#### Headers

- `Authorization`: customers table에 존재하는 고객 ID를 입력합니다. (예, 1)

#### Query Parameters

- `month` (string): 일정을 요청하는 달
- `year` (string): 일정을 요청하는 연도
- `tour_product_id` (string): 투어 상품의 ID

#### 요청 예제

```
localhost:3000/customers/tour_products/schedule?month=12&year=2023&tour_product_id=1
```

#### 성공 응답

- **Status Code:** 200 OK
- **Content:**

  ```json
  {
    "success": true,
    "data": [
      {
        "tourProductId": 1,
        "availableDates": [
          "2023-12-01",
          "2023-12-02",
          // ... 날짜 ...
          "2023-12-30",
          "2023-12-31"
        ]
      }
    ]
  }
  ```

### 2) 고객 - 투어 예약

고객은 투어 상품 번호와 예약 날짜를 제공하여 예약을 시도합니다.
당일 승인된 건이 5건이 초과된 경우, 대기 상태로 예약이 되고, 승인 및 대기 모두 토큰을 부여 받습니다.

#### Endpoint

```
POST /customers/reservations
```

#### Headers

- `Authorization`: customers table에 존재하는 고객 ID를 입력합니다. (예, 1)

#### Request Body

- `tourProductId` (number): 예약하려는 투어 상품의 ID.
- `date` (string): 예약하려는 날짜 ('YYYY-MM-DD' 형식).

```json
{
  "tourProductId": 2,
  "date": "2023-12-01"
}
```

#### 성공 응답

- **Status Code:** 201 Created
- **Content:**

  ```json
  {
    "success": true,
    "data": {
      "token": "5117e6a5-4c7b-467c-aeb8-3876f21a81bd",
      "date": "2023-12-01",
      "status": "Approved"
    }
  }
  ```

### 3) 고객 - 예약 취소

고객이 예약을 취소하는 기능을 제공합니다. 취소하고자 하는 예약의 토큰을 이용합니다.

#### Endpoint

```
POST /customers/reservations/cancel
```

#### Headers

- `Authorization`: customers table에 존재하는 고객 ID를 입력합니다. (예, 1)

#### Request Body

- `token` (string): 취소 하려는 예약의 토큰

```json
{
  "token": "c5b3161b-73c3-4a0b-bf28-b9d82e653495"
}
```

#### 성공 응답

- **Status Code:** 201 Created
- **Content:**

  ```json
  {
    "success": true,
    "data": {
      "message": "예약 취소 성공"
    }
  }
  ```

### 4) 판매자 - 추가 예약 승인

판매자가 추가로 예약을 승인합니다.

#### Endpoint

```
PATCH /sellers/reservations/{reservationId}/approve
```

#### Headers

- `Authorization`: sellers table에 존재하는 판매자 ID를 입력합니다. (예, 1)

#### Path Parameters

- `reservationId` (string): 예약된 ID

#### 요청 예제

```
localhost:3000/sellers/reservations/1/approve
```

#### 성공 응답

- **Status Code:** 200 OK
- **Content:**

  ```json
  {
    "success": true,
    "data": {
      "message": "예약 승인 성공"
    }
  }
  ```

### 5) 판매자 - 휴일 추가

판매자가 투어 상품에 특정 요일 또는 하루 단위로 휴일을 지정합니다.

#### Endpoint

```
POST /sellers/holidays
```

#### Headers

- `Authorization`: sellers table에 존재하는 판매자 ID를 입력합니다. (예, 1)

#### Request Body

특정 요일을 휴일로 지정하는 Reuqest Body입니다.

- `tourProductId` (number): 투어 상품의 ID
- `dayOfWeek` (string): 특정 요일 (e.g. "Sunday", "Monday", ...)

```json
{
  "tourProductId": 1,
  "dayOfWeek": "Tuesday"
}
```

하루 단위로 휴일을 지정하는 Reuqest Body입니다.

- `tourProductId` (number): 투어 상품의 ID
- `date` (string): 특정 날짜

```json
{
  "tourProductId": 1,
  "date": "2023-12-15"
}
```

#### 성공 응답

- **Status Code:** 201 Created
- **Content:**

  ```json
  {
    "success": true,
    "data": {
      "message": "휴일 추가 성공"
    }
  }
  ```

### 6) 판매자 - 고객 예약 여부 확인

판매자가 토큰을 사용해서, 고객의 예약 여부를 확인합니다.

#### Endpoint

```
POST /sellers/reservations/check
```

#### Headers

- `Authorization`: sellers table에 존재하는 판매자 ID를 입력합니다. (예, 1)

#### Request Body

- `token` (string): 예약 후, 발급된 토큰값

```json
{
  "token": "c65ae370-6a9e-4b21-9c0b-51c6e62448f5"
}
```

#### 성공 응답

- **Status Code:** 201 Created
- **Content:**

  ```json
  {
    "success": true,
    "data": {
      "id": 3,
      "date": "2023-11-28",
      "status": "Approved",
      "token": "496c79af-4d0e-41dd-9c94-76f0408c2c3d",
      "token_used_at": null,
      "created_at": "2023-11-24T05:11:45.000Z",
      "updated_at": "2023-11-24T05:11:45.000Z",
      "tourProduct": {
        "id": 1,
        "name": "Seoul Tour",
        "capacity": 5,
        "timezone": "Asia/Seoul",
        "created_at": "2023-11-24T05:10:49.000Z",
        "updated_at": "2023-11-24T05:10:49.000Z",
        "seller": {
          "id": 1
        }
      }
    }
  }
  ```

## 추가 기능 개발

### 1. 성공 응답에 대한 인터셉터 처리

성공적인 API 응답을 일관된 형식으로 변환하기 위해 `ResponseInterceptor`를 구현하였습니다. 이 인터셉터는 NestJS의 `NestInterceptor`를 구현하여, 모든 성공 응답을 `{ success: true, data: ... }` 형식으로 통일합니다.

해당 인터셉터의 구현 코드는 `/src/common/interceptors/response.interceptor.ts` 파일에 위치해 있습니다.

#### 이유

인터셉터 Decorator를 사용하여 응답 형식을 일관되게 관리하기 위한 목적입니다.

### 2. Guard를 통한 인증 처리

API 보안을 강화하기 위해 `AuthorizationGuard`를 구현하였습니다. 이 Guard는 요청 헤더의 `Authorization` 값을 검증하여, 해당 고객 ID가 유효한지 확인합니다. 유효하지 않은 경우, 인증 실패 오류를 반환합니다.

#### 이유

Guard Decorator를 사용하는 목적은 인증 및 인가 로직을 중앙 집중적으로 관리하여 코드의 일관성과 유지보수성을 높이기 위함입니다.

해당 Guard의 구현 코드는 `/src/common/guards` 폴더에 위치해 있습니다.

### 3. ValidaionPipe 사용

NestJS가 제공하는 ValidationPipe를 사용합니다. 해당 기능은 각 DTO의 유효성 검사 및 보안에 도움을 줍니다.

**main.ts**

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false,
    transform: true,
    disableErrorMessages: false,
  }),
);
```

- `whitelist`: 이 옵션을 `true`로 설정하면, DTO에 정의되지 않은 필드는 자동으로 제거되고, 정의된 필드에 대해서만 유효성 검사가 수행됩니다. 이를 통해 코드에서 필수 필드만 사용하여 보안성을 높일 수 있습니다. 이에, `true`로 설정하였습니다.
- `forbidNonWhitelisted`: `true`로 설정되면, DTO에 정의되지 않은 필드가 요청으로 들어올 경우 400 오류 코드를 반환합니다. 이전 플랫폼에서는 보안을 강화하기 위해 이 옵션을 사용했습니다. 그러나 프론트엔드 개발 중 실수로 DTO에 정의되지 않은 필드가 요청에 포함될 경우 서비스에 문제가 생길 수 있습니다. `whitelist` 옵션에서 이미 불필요한 값은 제거되므로, 이 옵션은 `false`로 설정했습니다.
- `transform`: 요청된 데이터를 자동으로 DTO 클래스 타입으로 변환합니다. 따라서, 이 옵션은 `true`로 설정하였습니다.
- `disableErrorMessages`: 유효성 검사 오류 발생 시, 오류 메시지의 포함 여부를 결정합니다. 개발 단계에서는 명확한 오류 메시지가 필요하므로 `true`로 설정했으며, 상용 환경에서는 보안을 위해 `false`로 설정할 수 있습니다.
