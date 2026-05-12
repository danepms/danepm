import { Controller, Get, Param } from '@nestjs/common';
import { PropertiesService } from './properties.service';

@Controller('marketing')
export class MarketingController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Get('vacancies')
  async getPublicVacancies() {
    return this.propertiesService.getPublicVacancies();
  }

  @Get('vacancies/:id')
  async getVacancyDetails(@Param('id') id: string) {
    return this.propertiesService.getVacancyDetails(id);
  }
}
