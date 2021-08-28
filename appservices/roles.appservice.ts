import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { RolesDto } from "../../submodules/Portfolio-Platform-Dtos/rolesDto";
import { RolesEntity } from "../../submodules/Portfolio-Platform-Entities/rolesEntity";
import AppService from "../../submodules/Portfolio-Platform-Service/AppServiceBase";
import { Repository } from "typeorm";
let dto = require('../../submodules/Portfolio-Platform-Mappings/roles.mapper')

@Injectable()
export default class RolesAppService extends AppService<RolesEntity,RolesDto>{
    constructor(@InjectRepository(RolesEntity) private readonly rolesRepository: Repository<RolesEntity>,public http:HttpService) {
        super(http,rolesRepository,RolesEntity,RolesEntity,RolesDto,dto.rolesentityJson, dto.rolesdtoJson,dto.rolesentityToDtoJson, dto.rolesdtoToEntityJson);
             
    }
} 