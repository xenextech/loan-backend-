import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { ParentsService } from './parents.service';
import { ParentProfileDto } from './dto/parent-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@ApiTags('Parents')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PARENT)
@Controller('parents')
export class ParentsController {
  constructor(private readonly parentsService: ParentsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get parent profile' })
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.parentsService.getProfile(user.sub);
  }

  @Put('me')
  @ApiOperation({ summary: 'Create or update parent profile' })
  upsertProfile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ParentProfileDto,
  ) {
    return this.parentsService.upsertProfile(user.sub, dto);
  }

  @Post('me/salary-sheet')
  @ApiOperation({ summary: 'Upload salary sheet document' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadSalarySheet(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.parentsService.uploadSalarySheet(user.sub, file);
  }

  @Delete('me/salary-sheet')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete salary sheet document' })
  deleteSalarySheet(@CurrentUser() user: JwtPayload) {
    return this.parentsService.deleteSalarySheet(user.sub);
  }
}
