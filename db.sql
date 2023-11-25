CREATE DATABASE zoomzoom_tour;

USE zoomzoom_tour;

CREATE TABLE customers (
  id INT AUTO_INCREMENT NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE sellers (
  id INT AUTO_INCREMENT NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE tour_products (
  id INT AUTO_INCREMENT NOT NULL,
  seller_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  capacity INT NOT NULL COMMENT '자동 승인 가능한 예약 수',
  timezone VARCHAR(255) NOT NULL COMMENT '투어 상품의 time zone',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (seller_id) REFERENCES sellers(id)
);

CREATE TABLE reservations (
  id INT AUTO_INCREMENT NOT NULL,
  customer_id INT NOT NULL,
  tour_product_id INT NOT NULL,
  date DATE NOT NULL COMMENT '투어 상품 예약일',
  status ENUM('Pending', 'Approved', 'Cancelled') NOT NULL COMMENT '예약 상태',
  token VARCHAR(255) UNIQUE COMMENT '예약 성공시 발급되는 토큰',
  token_used_at DATETIME NULL COMMENT '토큰 사용된 날짜',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (tour_product_id) REFERENCES tour_products(id)
);

CREATE TABLE holidays (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tour_product_id INT NOT NULL,
  date DATE COMMENT '휴일 특정일',
  day_of_week ENUM('Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'),
  recurring BOOLEAN DEFAULT FALSE COMMENT '하루 단위 휴일인지 판단하는 필드',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tour_product_id) REFERENCES tour_products(id)
);

INSERT INTO customers (id) VALUES (NULL);

INSERT INTO sellers (id) VALUES (NULL);

INSERT INTO tour_products (name, seller_id, capacity, timezone, created_at, updated_at) VALUES ('Seoul Tour', 1, 5, 'Asia/Seoul', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);


