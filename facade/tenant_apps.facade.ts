import { Injectable } from "@nestjs/common";
import Tenant_AppsAppService from "../appservices/tenant_apps.appservice";
import { Tenant_AppsDto } from "../../submodules/Portfolio-Platform-Dtos/tenant_appsDto";
import { Tenant_AppsEntity } from "../../submodules/Portfolio-Platform-Entities/tenant_appsEntity";
import FacadeBase from "./facadebase";

@Injectable()
export class Tenant_AppsFacade extends FacadeBase<Tenant_AppsEntity,Tenant_AppsDto>{
    constructor(private tenant_appsAppService: Tenant_AppsAppService){
       super(tenant_appsAppService);
    }
}