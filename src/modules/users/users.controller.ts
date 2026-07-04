import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/jwt-payload.interface';

@ApiTags('Users')
@ApiBearerAuth('JWT')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.findById(user.sub);
  }

  @Patch('me/change-password')
  @ApiOperation({ summary: 'Change current user password' })
  changePassword(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(user.sub, dto);
  }

  @Get('me/notifications')
  @ApiOperation({ summary: 'Get current user notifications' })
  getNotifications(@CurrentUser() user: JwtPayload) {
    return this.usersService.getNotifications(user.sub);
  }

  @Patch('me/notifications/:id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  markRead(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.usersService.markNotificationRead(user.sub, id);
  }
}
