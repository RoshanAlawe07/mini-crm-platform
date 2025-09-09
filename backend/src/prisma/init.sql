-- customers
CREATE TABLE customers (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(30),
  total_spend DECIMAL(12,2) DEFAULT 0,
  last_active DATETIME,
  visits_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- orders
CREATE TABLE orders (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  customer_id BIGINT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- segments
CREATE TABLE segments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  rules_json JSON NOT NULL,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- campaigns
CREATE TABLE campaigns (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  segment_id BIGINT,
  name VARCHAR(255),
  message_template TEXT,
  scheduled_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (segment_id) REFERENCES segments(id) ON DELETE SET NULL
);

-- communication_log
CREATE TABLE communication_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  campaign_id BIGINT,
  customer_id BIGINT,
  message TEXT,
  status ENUM('PENDING','SENT','FAILED') DEFAULT 'PENDING',
  attempts INT DEFAULT 0,
  last_attempt_at DATETIME,
  delivery_receipt JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);
