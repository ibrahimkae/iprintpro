import mariadb, { Pool } from 'mariadb';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    pool = mariadb.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USER || 'iprint',
      password: process.env.DB_PASSWORD || 'iprint_dev_password',
      database: process.env.DB_NAME || 'iprint',
      connectionLimit: 10
    });
  }
  return pool;
}

export async function ensureSchema(): Promise<void> {
  const conn = await getPool().getConnection();
  try {
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(80),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(120) NOT NULL,
        category VARCHAR(40) NOT NULL,
        payload JSON NOT NULL,
        preview_note VARCHAR(280),
        rating_sum INT NOT NULL DEFAULT 0,
        rating_count INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        user_id INT PRIMARY KEY,
        plan ENUM('free','pro_monthly','pro_yearly'),
        status ENUM('active','past_due','canceled','trialing'),
        trial_ends_at DATETIME NULL,
        current_period_end DATETIME NOT NULL,
        provider ENUM('paytr','iyzico','manual') NOT NULL,
        provider_ref VARCHAR(120),
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        owner_user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_user_id) REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        team_id INT NOT NULL,
        user_id INT NOT NULL,
        role ENUM('owner','manager','staff') NOT NULL DEFAULT 'staff',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (team_id, user_id),
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    await conn.query(`
      CREATE TABLE IF NOT EXISTS activity_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        team_id INT NULL,
        type VARCHAR(40) NOT NULL,
        meta JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_activity_team_time (team_id, created_at),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    // Mevcut kurulumlarda şema zaten var → duplicate column hatası normal, yoksayılır.
    try {
      await conn.query(
        'ALTER TABLE templates ADD COLUMN team_id INT NULL, ADD CONSTRAINT fk_templates_team FOREIGN KEY (team_id) REFERENCES teams(id)'
      );
    } catch {
      // kolon/FK zaten eklenmiş
    }
    await conn.query(`
      CREATE TABLE IF NOT EXISTS template_ratings (
        template_id INT NOT NULL,
        user_id INT NOT NULL,
        stars TINYINT NOT NULL,
        PRIMARY KEY (template_id, user_id),
        FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } finally {
    conn.release();
  }
}
