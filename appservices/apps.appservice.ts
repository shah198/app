import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AppsDto } from "../../submodules/Portfolio-Platform-Dtos/appsDto";
import { AppsEntity } from "../../submodules/Portfolio-Platform-Entities/appsEntity";
import AppService from "../../submodules/Portfolio-Platform-Service/AppServiceBase";
import { Repository } from "typeorm";
let dto = require('../../submodules/Portfolio-Platform-Mappings/apps.mapper')

@Injectable()
export default class AppsAppService extends AppService<AppsEntity,AppsDto>{
    constructor(@InjectRepository(AppsEntity) private readonly appsRepository: Repository<AppsEntity>,public http:HttpService) {
        super(http,appsRepository,AppsEntity,AppsEntity,AppsDto,dto.appsentityJson, dto.appsdtoJson,dto.appsentityToDtoJson, dto.appsdtoToEntityJson);
             
    }

} 