import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('suppliers')
@UseGuards(JwtAuthGuard)
export class SuppliersController {
  constructor(private readonly service: SuppliersService) {}

  @Get()
  list(
    @Query('q') q?: string,
    @Query('city') city?: string,
    @Query('province') province?: string,
    @Query('category') category?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    return this.service.list({ q, city, province, category, page, limit });
  }

  @Get('me/profile')
  getMyProfile(@Req() req: any) {
    return this.service.getMyProfile(req.user.sub);
  }

  @Patch('me/profile')
  updateMyProfile(@Req() req: any, @Body() body: any) {
    return this.service.updateMyProfile(req.user.sub, body);
  }

  @Get('me/products')
  listMyProducts(@Req() req: any) {
    return this.service.listMyProducts(req.user.sub);
  }

  @Post('me/products')
  createMyProduct(@Req() req: any, @Body() body: any) {
    return this.service.createMyProduct(req.user.sub, body);
  }

  @Patch('me/products/:productId')
  updateMyProduct(
    @Req() req: any,
    @Param('productId') productId: string,
    @Body() body: any,
  ) {
    return this.service.updateMyProduct(req.user.sub, productId, body);
  }

  @Delete('me/products/:productId')
  deleteMyProduct(@Req() req: any, @Param('productId') productId: string) {
    return this.service.deleteMyProduct(req.user.sub, productId);
  }

  @Get(':id')
  getDetail(@Param('id') id: string) {
    return this.service.getDetail(id);
  }
}
