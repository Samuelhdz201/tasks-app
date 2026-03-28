import { Response } from 'express';
import pool from '../db/client';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getTasks = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, page = '1', limit = '10' } = req.query;
  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

  try {
    let query = 'SELECT * FROM tasks WHERE user_id = $1';
    const params: (string | number)[] = [req.userId!];

    if (status) {
      query += ' AND status = $2 LIMIT $3 OFFSET $4';
      params.push(status as string, parseInt(limit as string), offset);
    } else {
      query += ' LIMIT $2 OFFSET $3';
      params.push(parseInt(limit as string), offset);
    }

    const result = await pool.query(query, params);
    res.json({ tasks: result.rows });
  } catch (error) {
    console.error('getTasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, status = 'pending', due_date } = req.body;

  if (!title) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }

  try {
    const result = await pool.query(
      'INSERT INTO tasks (user_id, title, description, status, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.userId, title, description, status, due_date]
    );
    res.status(201).json({ task: result.rows[0] });
  } catch (error) {
    console.error('createTask error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    if (result.rows[0].user_id !== req.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    res.json({ task: result.rows[0] });
  } catch (error) {
    console.error('getTaskById error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { title, description, status, due_date } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);

    if (existing.rows.length === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    if (existing.rows[0].user_id !== req.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    const result = await pool.query(
      `UPDATE tasks SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        due_date = COALESCE($4, due_date),
        updated_at = NOW()
      WHERE id = $5 RETURNING *`,
      [title, description, status, due_date, id]
    );

    res.json({ task: result.rows[0] });
  } catch (error) {
    console.error('updateTask error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const existing = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);

    if (existing.rows.length === 0) {
      res.status(404).json({ error: 'Task not found' });
      return;
    }

    if (existing.rows[0].user_id !== req.userId) {
      res.status(403).json({ error: 'Forbidden' });
      return;
    }

    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('deleteTask error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};