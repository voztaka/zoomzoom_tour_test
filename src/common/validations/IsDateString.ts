import { registerDecorator, ValidationOptions } from 'class-validator';
import * as moment from 'moment';

export function IsDateString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isDateString',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') {
            return false;
          }
          return moment(value, 'YYYY-MM-DD', true).isValid();
        },
        defaultMessage() {
          return `${propertyName} must be a valid date in 'YYYY-MM-DD' format`;
        },
      },
    });
  };
}
