import { Injectable } from "@nestjs/common";
import App_RolesAppService from "../appservices/app_roles.appservice";
import { App_RolesDto } from "../../submodules/Portfolio-Platform-Dtos/app_rolesDto";
import { App_RolesEntity } from "../../submodules/Portfolio-Platform-Entities/app_rolesEntity";
import FacadeBase from "./facadebase";

@Injectable()
export class App_RolesFacade extends FacadeBase<App_RolesEntity,App_RolesDto>{
    constructor(private app_rolesAppService: App_RolesAppService){
       super(app_rolesAppService);
    }
}