import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@ApiTags('General')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Root endpoint — confirms the API is reachable' })
  getRoot(): object {
    return this.appService.getRoot();
  }

  @Public()
  @Get('health')
  @ApiOperation({ summary: 'Health check — returns server status and uptime' })
  getHealth(): object {
    return this.appService.getHealth();
  }
}
