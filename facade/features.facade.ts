import { Injectable } from "@nestjs/common";
import FeaturesAppService from "../appservices/features.appservice";
import { FeaturesDto } from "../../submodules/Portfolio-Platform-Dtos/featuresDto";
import { FeaturesEntity } from "../../submodules/Portfolio-Platform-Entities/featuresEntity";
import FacadeBase from "./facadebase";

@Injectable()
export class FeaturesFacade extends FacadeBase<FeaturesEntity,FeaturesDto>{
    constructor(private featuresAppService: FeaturesAppService){
       super(featuresAppService);
    }
}