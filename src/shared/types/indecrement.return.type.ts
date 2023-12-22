import { Model } from 'sequelize-typescript';

export type InDecrementReturnType<M extends Model> = [[affectedRows: M[], affectedCount?: number]]
