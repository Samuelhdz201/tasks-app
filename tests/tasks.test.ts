import request from 'supertest';
import { app } from '../src/index';
import pool from '../src/db/client';

let tokenUser1: string;
let tokenUser2: string;
let taskId: number;

beforeAll(async () => {
  await pool.query('DELETE FROM tasks');
  await pool.query('DELETE FROM users');

  // Crear y loguear usuario 1
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'User One', email: 'user1@test.com', password: '123456' });

  const login1 = await request(app)
    .post('/api/auth/login')
    .send({ email: 'user1@test.com', password: '123456' });
  tokenUser1 = login1.body.token;

  // Crear y loguear usuario 2
  await request(app)
    .post('/api/auth/register')
    .send({ name: 'User Two', email: 'user2@test.com', password: '123456' });

  const login2 = await request(app)
    .post('/api/auth/login')
    .send({ email: 'user2@test.com', password: '123456' });
  tokenUser2 = login2.body.token;
});

afterAll(async () => {
  await pool.query('DELETE FROM tasks');
  await pool.query('DELETE FROM users');
  await pool.end();
});

describe('Tasks', () => {
  it('should create a task with valid token', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ title: 'Test Task', description: 'Test desc', status: 'pending' });

    console.log('createTask response:', res.status, res.body);
    expect(res.status).toBe(201);
    expect(res.body.task).toHaveProperty('id');
    taskId = res.body.task.id;
  });

  it('should fail to create a task without token', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({ title: 'No token task' });

    expect(res.status).toBe(401);
  });

  it('should list only tasks of authenticated user', async () => {
    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${tokenUser1}`);

    expect(res.status).toBe(200);
    expect(res.body.tasks.every((t: any) => t.title === 'Test Task')).toBe(true);
  });

  it('should filter tasks by status', async () => {
    const res = await request(app)
      .get('/api/tasks?status=pending')
      .set('Authorization', `Bearer ${tokenUser1}`);

    expect(res.status).toBe(200);
    expect(res.body.tasks.every((t: any) => t.status === 'pending')).toBe(true);
  });

  it('should return 403 when accessing another user task', async () => {
    expect(taskId).toBeDefined();
    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUser2}`);

    expect(res.status).toBe(403);
  });

  it('should update a task successfully', async () => {
    expect(taskId).toBeDefined();
    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUser1}`)
      .send({ title: 'Updated Task', status: 'in_progress' });

    expect(res.status).toBe(200);
    expect(res.body.task.title).toBe('Updated Task');
    expect(res.body.task.status).toBe('in_progress');
  });

  it('should return correct pagination', async () => {
    const res = await request(app)
      .get('/api/tasks?page=1&limit=5')
      .set('Authorization', `Bearer ${tokenUser1}`);

    expect(res.status).toBe(200);
    expect(res.body.tasks.length).toBeLessThanOrEqual(5);
  });

  it('should delete a task successfully', async () => {
    expect(taskId).toBeDefined();
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${tokenUser1}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Task deleted successfully');
  });
});