import { Request, Response } from 'express';

export class DebugController {
 async status(req: Request, res: Response) {
 }
}

export const debugController = new DebugController();
