import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CustomersService } from 'src/customers/customers.service';

@Injectable()
export class CustomerAuthorizationGuard implements CanActivate {
  constructor(private customersService: CustomersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      throw new HttpException('Authorization failed', HttpStatus.UNAUTHORIZED);
    }

    const customerId = parseInt(authorizationHeader, 10);
    if (
      isNaN(customerId) ||
      !(await this.customersService.verifyCustomerExists(customerId))
    ) {
      throw new HttpException('Authorization failed', HttpStatus.UNAUTHORIZED);
    }

    request.user = { id: customerId };
    return true;
  }
}
