import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UsersDto } from "../../submodules/Portfolio-Platform-Dtos/usersDto";
import { UsersEntity } from "../../submodules/Portfolio-Platform-Entities/usersEntity";
import AppService from "../../submodules/Portfolio-Platform-Service/AppServiceBase";
import { Repository } from "typeorm";
let dto = require('../../submodules/Portfolio-Platform-Mappings/users.mapper')

@Injectable()
export default class UsersAppService extends AppService<UsersEntity,UsersDto>{
    constructor(@InjectRepository(UsersEntity) private readonly usersRepository: Repository<UsersEntity>,public http:HttpService) {
        super(http,usersRepository,UsersEntity,UsersEntity,UsersDto,dto.usersentityJson, dto.usersdtoJson,dto.usersentityToDtoJson, dto.usersdtoToEntityJson);
             
    }

} 