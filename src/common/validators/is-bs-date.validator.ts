import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import {
  isValidBsDateString,
  BS_MIN_YEAR,
  BS_MAX_YEAR,
} from '../utils/bs-ad-date.util';

// Validates a Bikram Sambat date string in "YYYY-MM-DD" format (e.g. "2056-09-17"),
// checking both the shape and that it is a real calendar day within the
// supported BS year range.
export function IsBsDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isBsDate',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          return typeof value === 'string' && isValidBsDateString(value);
        },
        defaultMessage(args: ValidationArguments) {
          return (
            `${args.property} must be a valid Bikram Sambat date in YYYY-MM-DD format ` +
            `(supported years: ${BS_MIN_YEAR}-${BS_MAX_YEAR})`
          );
        },
      },
    });
  };
}
