// This file runs only on the server side
import mysql from 'mysql2/promise';

// Ensure this only runs on server
if (typeof window !== 'undefined') {
  throw new Error('This module should only be used on the server side');
}

interface MySQLConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port?: number;
}

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'offshore_formation',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
};

let pool: mysql.Pool | null = null;

export async function getConnection() {
  if (!pool) {
    try {
      pool = mysql.createPool(dbConfig);
    } catch (error) {
      console.error('Database connection pool error:', error);
      throw new Error('Failed to create database pool');
    }
  }
  return pool.getConnection();
}

export interface Jurisdiction {
  id: number;
  name: string;
  country_code: string;
  flag_url: string;
  description: string;
  formation_price: number;
  currency: string;
  processing_time: string;
  features: string[];
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export async function getJurisdictions(): Promise<Jurisdiction[]> {
  let conn;
  try {
    conn = await getConnection();
    const [rows] = await conn.execute(`
      SELECT
        id,
        name,
        country_code,
        flag_url,
        description,
        formation_price,
        currency,
        processing_time,
        features,
        status,
        created_at,
        updated_at
      FROM jurisdictions
      WHERE status = 'active'
      ORDER BY name ASC
    `);

    return (rows as any[]).map(row => {
    let features: string[] = [];

    try {
      // Try to parse as JSON first
      if (typeof row.features === 'string') {
        features = JSON.parse(row.features);
      } else if (Array.isArray(row.features)) {
        features = row.features;
      } else {
        features = [];
      }
    } catch (error) {
      console.error('Error parsing features for jurisdiction:', row.name, error);
      // If JSON parsing fails, treat as a simple string and split by comma
      if (typeof row.features === 'string') {
        features = row.features.split(',').map(f => f.trim()).filter(f => f.length > 0);
      } else {
        features = [];
      }
    }

      return {
        ...row,
        features
      };
    });
  } catch (error) {
    console.error('Error fetching jurisdictions:', error);
    throw error;
  } finally {
    if (conn) {
      conn.release();
    }
  }
}

export async function getJurisdictionById(id: number): Promise<Jurisdiction | null> {
  let conn;
  try {
    conn = await getConnection();
    const [rows] = await conn.execute(`
      SELECT
        id,
        name,
        country_code,
        flag_url,
        description,
        formation_price,
        currency,
        processing_time,
        features,
        status,
        created_at,
        updated_at
      FROM jurisdictions
      WHERE id = ? AND status = 'active'
    `, [id]);

    const result = rows as any[];
    if (result.length === 0) return null;

    const row = result[0];
    let features: string[] = [];

    try {
      // Try to parse as JSON first
      if (typeof row.features === 'string') {
        features = JSON.parse(row.features);
      } else if (Array.isArray(row.features)) {
        features = row.features;
      } else {
        features = [];
      }
    } catch (error) {
      console.error('Error parsing features for jurisdiction:', row.name, error);
      // If JSON parsing fails, treat as a simple string and split by comma
      if (typeof row.features === 'string') {
        features = row.features.split(',').map(f => f.trim()).filter(f => f.length > 0);
      } else {
        features = [];
      }
    }

    return {
      ...row,
      features
    };
  } catch (error) {
    console.error('Error fetching jurisdiction by ID:', error);
    throw error;
  } finally {
    if (conn) {
      conn.release();
    }
  }
}