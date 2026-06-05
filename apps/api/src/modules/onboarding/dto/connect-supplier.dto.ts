import { IsUUID } from 'class-validator';

export class ConnectSupplierDto {
  @IsUUID()
  supplierId!: string;
}
