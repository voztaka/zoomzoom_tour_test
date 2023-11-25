import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SellersService } from 'src/sellers/sellers.service';

@Injectable()
export class SellerAuthorizationGuard implements CanActivate {
  constructor(private sellersService: SellersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      throw new HttpException('Authorization failed', HttpStatus.UNAUTHORIZED);
    }

    const sellerId = parseInt(authorizationHeader, 10);
    if (
      isNaN(sellerId) ||
      !(await this.sellersService.verifySellerExists(sellerId))
    ) {
      throw new HttpException('Authorization failed', HttpStatus.UNAUTHORIZED);
    }

    request.user = { id: sellerId };
    return true;
  }
}
