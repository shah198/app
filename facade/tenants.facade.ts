import { Injectable } from "@nestjs/common";
import TenantsAppService from "../appservices/tenants.appservice";
import { TenantsDto } from "../../submodules/Portfolio-Platform-Dtos/tenantsDto";
import { TenantsEntity } from "../../submodules/Portfolio-Platform-Entities/tenantsEntity";
import FacadeBase from "./facadebase";

@Injectable()
export class TenantsFacade extends FacadeBase<TenantsEntity,TenantsDto>{
    constructor(private tenantsAppService: TenantsAppService){
       super(tenantsAppService);
    }
}