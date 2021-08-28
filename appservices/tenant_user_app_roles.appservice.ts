import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Tenant_User_App_RolesDto } from "../../submodules/Portfolio-Platform-Dtos/tenant_user_app_rolesDto";
import { Tenant_User_App_RolesEntity } from "../../submodules/Portfolio-Platform-Entities/tenant_user_app_rolesEntity";
import AppService from "../../submodules/Portfolio-Platform-Service/AppServiceBase";
import { Repository } from "typeorm";
let dto = require('../../submodules/Portfolio-Platform-Mappings/tenant_user_app_roles.mapper')

@Injectable()
export default class Tenant_User_App_RolesAppService extends AppService<Tenant_User_App_RolesEntity,Tenant_User_App_RolesDto>{
    constructor(@InjectRepository(Tenant_User_App_RolesEntity) private readonly tenant_user_app_rolesRepository: Repository<Tenant_User_App_RolesEntity>,public http:HttpService) {
        super(http,tenant_user_app_rolesRepository,Tenant_User_App_RolesEntity,Tenant_User_App_RolesEntity,Tenant_User_App_RolesDto,dto.tenant_user_app_rolesentityJson, dto.tenant_user_app_rolesdtoJson,dto.tenant_user_app_rolesentityToDtoJson, dto.tenant_user_app_rolesdtoToEntityJson);
             
    }

} 