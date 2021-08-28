import { Injectable } from "@nestjs/common";
import Tenant_App_FeaturesAppService from "../appservices/tenant_app_features.appservice";
import { Tenant_App_FeaturesDto } from "../../submodules/Portfolio-Platform-Dtos/tenant_app_featuresDto";
import { Tenant_App_FeaturesEntity } from "../../submodules/Portfolio-Platform-Entities/tenant_app_featuresEntity";
import FacadeBase from "./facadebase";

@Injectable()
export class Tenant_App_FeaturesFacade extends FacadeBase<Tenant_App_FeaturesEntity,Tenant_App_FeaturesDto>{
    constructor(private tenant_app_featuresAppService: Tenant_App_FeaturesAppService){
       super(tenant_app_featuresAppService);
    }
}