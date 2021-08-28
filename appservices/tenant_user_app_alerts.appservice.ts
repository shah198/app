import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Tenant_User_App_AlertsDto } from "../../submodules/Portfolio-Platform-Dtos/tenant_user_app_alertsDto";
import { Tenant_User_App_AlertsEntity } from "../../submodules/Portfolio-Platform-Entities/tenant_user_app_alertsEntity";
import AppService from "../../submodules/Portfolio-Platform-Service/AppServiceBase";
import { Repository } from "typeorm";
let dto = require('../../submodules/Portfolio-Platform-Mappings/tenant_user_app_alerts.mapper')

@Injectable()
export default class Tenant_User_App_AlertsAppService extends AppService<Tenant_User_App_AlertsEntity,Tenant_User_App_AlertsDto>{
    constructor(@InjectRepository(Tenant_User_App_AlertsEntity) private readonly tenant_user_app_alertsRepository: Repository<Tenant_User_App_AlertsEntity>,public http:HttpService) {
        super(http,tenant_user_app_alertsRepository,Tenant_User_App_AlertsEntity,Tenant_User_App_AlertsEntity,Tenant_User_App_AlertsDto,dto.tenant_user_app_alertsentityJson, dto.tenant_user_app_alertsdtoJson,dto.tenant_user_app_alertsentityToDtoJson, dto.tenant_user_app_alertsdtoToEntityJson);
             
    }

} 