import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TenantsDto } from "../../submodules/Portfolio-Platform-Dtos/tenantsDto";
import { TenantsEntity } from "../../submodules/Portfolio-Platform-Entities/tenantsEntity";
import AppService from "../../submodules/Portfolio-Platform-Service/AppServiceBase";
import { Repository } from "typeorm";
let dto = require('../../submodules/Portfolio-Platform-Mappings/tenants.mapper')

@Injectable()
export default class TenantsAppService extends AppService<TenantsEntity,TenantsDto>{
    constructor(@InjectRepository(TenantsEntity) private readonly tenantsRepository: Repository<TenantsEntity>,public http:HttpService) {
        super(http,tenantsRepository,TenantsEntity,TenantsEntity,TenantsDto,dto.tenantsentityJson, dto.tenantsdtoJson,dto.tenantsentityToDtoJson, dto.tenantsdtoToEntityJson);
             
    }

} 