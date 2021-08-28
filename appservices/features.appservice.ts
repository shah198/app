import { HttpService, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FeaturesDto } from "../../submodules/Portfolio-Platform-Dtos/featuresDto";
import { FeaturesEntity } from "../../submodules/Portfolio-Platform-Entities/featuresEntity";
import AppService from "../../submodules/Portfolio-Platform-Service/AppServiceBase";
import { Repository } from "typeorm";
let dto = require('../../submodules/Portfolio-Platform-Mappings/features.mapper')

@Injectable()
export default class FeaturesAppService extends AppService<FeaturesEntity,FeaturesDto>{
    constructor(@InjectRepository(FeaturesEntity) private readonly featuresRepository: Repository<FeaturesEntity>,public http:HttpService) {
        super(http,featuresRepository,FeaturesEntity,FeaturesEntity,FeaturesDto,dto.featuresentityJson, dto.featuresdtoJson,dto.featuresentityToDtoJson, dto.featuresdtoToEntityJson);
             
    }

} 