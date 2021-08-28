import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { App_RolesDto } from "../../submodules/Portfolio-Platform-Dtos/app_rolesDto";
import { App_RolesEntity } from "../../submodules/Portfolio-Platform-Entities/app_rolesEntity";
import AppService from "../../submodules/Portfolio-Platform-Service/AppServiceBase";
import { Repository } from "typeorm";
let dto = require('../../submodules/Portfolio-Platform-Mappings/app_roles.mapper')

@Injectable()
export default class App_RolesAppService extends AppService<App_RolesEntity,App_RolesDto>{
    constructor(@InjectRepository(App_RolesEntity) private readonly app_rolesRepository: Repository<App_RolesEntity>,public http:HttpService) {
        super(http,app_rolesRepository,App_RolesEntity,App_RolesEntity,App_RolesDto,dto.app_rolesentityJson, dto.app_rolesdtoJson,dto.app_rolesentityToDtoJson, dto.app_rolesdtoToEntityJson);
             
    }

} 