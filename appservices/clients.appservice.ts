import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ClientsDto } from "../../submodules/Portfolio-Platform-Dtos/clientsDto";
import { ClientsEntity } from "../../submodules/Portfolio-Platform-Entities/clientsEntity";
import AppService from "../../submodules/Portfolio-Platform-Service/AppServiceBase";
import { Repository } from "typeorm";
let dto = require('../../submodules/Portfolio-Platform-Mappings/clients.mapper')

@Injectable()
export default class ClientsAppService extends AppService<ClientsEntity,ClientsDto>{
    constructor(@InjectRepository(ClientsEntity) private readonly clientsRepository: Repository<ClientsEntity>,public http:HttpService) {
        super(http,clientsRepository,ClientsEntity,ClientsEntity,ClientsDto,dto.clientsentityJson, dto.clientsdtoJson,dto.clientsentityToDtoJson, dto.clientsdtoToEntityJson);
             
    }

} 