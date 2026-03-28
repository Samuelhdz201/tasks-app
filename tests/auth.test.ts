import request from 'supertest';
import { app } from '../src/index';
import pool from '../src/db/client';

beforeAll(async () => {
  await pool.query('DELETE FROM tasks');
  await pool.query('DELETE FROM users');
});

afterAll(async () => {
  await pool.query('DELETE FROM tasks');
  await pool.query('DELETE FROM users');
  await pool.end();
});

describe('Auth - Register', () => {
  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@test.com', password: '123456' });

    expect(res.status).toBe(201);
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.email).toBe('test@test.com');
  });

  it('should fail if email already exists', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Test User', email: 'test@test.com', password: '123456' });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Email already exists');
  });

  it('should fail if required fields are missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test2@test.com' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('All fields are required');
  });
});

describe('Auth - Login', () => {
  it('should login successfully and return a JWT', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: '123456' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('should fail with wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid password');
  });

  it('should fail with non-existent email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@test.com', password: '123456' });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('User not found');
  });
});