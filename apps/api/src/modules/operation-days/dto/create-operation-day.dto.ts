import { IsUUID } from 'class-validator';
export class CreateOperationDayDto { @IsUUID() menuPlanId!: string; }
