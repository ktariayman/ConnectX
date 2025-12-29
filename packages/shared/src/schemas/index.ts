import { z } from 'zod';


export const RoomCreateSchema = z.object({
 name: z.string().min(3).max(50),
});

export type RoomCreateInput = z.infer<typeof RoomCreateSchema>;
