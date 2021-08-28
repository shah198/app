import { Injectable } from "@nestjs/common";
import Tenant_UsersAppService from "../appservices/tenant_users.appservice";
import { Tenant_UsersDto } from "../../submodules/Portfolio-Platform-Dtos/tenant_usersDto";
import { Tenant_UsersEntity } from "../../submodules/Portfolio-Platform-Entities/tenant_usersEntity";
import FacadeBase from "./facadebase";

@Injectable()
export class Tenant_UsersFacade extends FacadeBase<Tenant_UsersEntity,Tenant_UsersDto>{
    constructor(private tenant_usersAppService: Tenant_UsersAppService){
       super(tenant_usersAppService);
    }
}