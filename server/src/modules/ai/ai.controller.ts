import { Request, Response, NextFunction } from 'express';
import { aiService, DraftTaskInput, WeeklySummaryInput } from './ai.service';

export const aiController = {
  async status(_req: Request, res: Response, next: NextFunction) {
    try {
      res.json(aiService.getStatus());
    } catch (err) {
      next(err);
    }
  },

  async draftTask(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await aiService.draftTask(req.body as DraftTaskInput);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async draftWeeklySummary(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await aiService.draftWeeklySummary(req.body as WeeklySummaryInput);
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async dashboardWeeklySummary(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user || { id: '', role: 'employee' };
      const weekStart =
        typeof req.query.weekStart === 'string'
          ? req.query.weekStart
          : typeof req.body?.weekStart === 'string'
            ? req.body.weekStart
            : undefined;
      const requestedRole =
        typeof req.query.role === 'string'
          ? req.query.role
          : typeof req.body?.role === 'string'
            ? req.body.role
            : typeof req.headers['x-active-role'] === 'string'
              ? req.headers['x-active-role']
              : undefined;

      const data = await aiService.generateDashboardWeeklySummary(
        { id: user.id, role: user.role },
        { weekStart, requestedRole }
      );
      res.json(data);
    } catch (err) {
      next(err);
    }
  },

  async dashboardWeeklyChat(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user || { id: '', role: 'employee' };
      const message = String(req.body?.message || '').trim();
      const weekStart = typeof req.body?.weekStart === 'string' ? req.body.weekStart : undefined;
      const history = Array.isArray(req.body?.history) ? req.body.history : undefined;
      const requestedRole =
        typeof req.body?.role === 'string'
          ? req.body.role
          : typeof req.headers['x-active-role'] === 'string'
            ? req.headers['x-active-role']
            : undefined;

      const data = await aiService.dashboardWeeklyChat(
        { id: user.id, role: user.role },
        { message, weekStart, history, requestedRole }
      );
      res.json(data);
    } catch (err) {
      next(err);
    }
  },
};

