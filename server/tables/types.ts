import type { z } from "zod";
import type { createTableSchema, updateTableSchema } from "./schemas/table.schema";

export type CreateTableInput = z.infer<typeof createTableSchema>;
export type UpdateTableInput = z.infer<typeof updateTableSchema>;
