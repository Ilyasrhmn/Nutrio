import {
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateOrderDto } from "./dto/create-order.dto";
import { RejectOrderDto } from "./dto/reject-order.dto";
import { OrdersService } from "./orders.service";

@Controller("orders")
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}
  @Post() create(
    @Req() req: any,
    @Body() dto: CreateOrderDto,
    @Headers("idempotency-key") key?: string,
  ) {
    return this.orders.create(req.user.id, dto, key);
  }
  @Get("my") listVendor(@Req() req: any) {
    return this.orders.listVendor(req.user.id);
  }
  @Get("supplier") listSupplier(@Req() req: any) {
    return this.orders.listSupplier(req.user.id);
  }
  @Get(":id") detail(@Req() req: any, @Param("id") id: string) {
    return this.orders.detail(req.user.id, id);
  }
  @Post(":id/cancel") cancel(
    @Req() req: any,
    @Param("id") id: string,
    @Body() dto: RejectOrderDto,
    @Headers("idempotency-key") key?: string,
  ) {
    return this.orders.cancel(req.user.id, id, dto, key);
  }
  @Post(":id/accept") accept(
    @Req() req: any,
    @Param("id") id: string,
    @Headers("idempotency-key") key?: string,
  ) {
    return this.orders.accept(req.user.id, id, key);
  }
  @Post(":id/reject") reject(
    @Req() req: any,
    @Param("id") id: string,
    @Body() dto: RejectOrderDto,
    @Headers("idempotency-key") key?: string,
  ) {
    return this.orders.reject(req.user.id, id, dto, key);
  }
  @Post(":id/dispatch") dispatch(
    @Req() req: any,
    @Param("id") id: string,
    @Headers("idempotency-key") key?: string,
  ) {
    return this.orders.dispatch(req.user.id, id, key);
  }
  @Post(":id/receive") receive(
    @Req() req: any,
    @Param("id") id: string,
    @Headers("idempotency-key") key?: string,
  ) {
    return this.orders.receive(req.user.id, id, key);
  }
}
