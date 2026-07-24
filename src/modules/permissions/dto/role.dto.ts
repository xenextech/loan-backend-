import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({
    description:
      'Unique role code. For a role to actually authenticate as this code, the UserRole Postgres enum must also be extended with a matching value (one additive migration) — this endpoint only creates the permission-configuration side.',
    example: 'REGIONAL_MANAGER',
  })
  @IsString()
  @MaxLength(40)
  @Matches(/^[A-Z][A-Z0-9_]*$/, {
    message: 'code must be UPPER_SNAKE_CASE, starting with a letter',
  })
  code!: string;

  @ApiProperty({ example: 'Regional Manager' })
  @IsString()
  @MaxLength(80)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateRoleDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
