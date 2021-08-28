import { Injectable } from "@nestjs/common";
import RolesAppService from "../appservices/roles.appservice";
import { RolesDto } from "../../submodules/Portfolio-Platform-Dtos/rolesDto";
import { RolesEntity } from "../../submodules/Portfolio-Platform-Entities/rolesEntity";
import FacadeBase from "./facadebase";

@Injectable()
export class RolesFacade extends FacadeBase<RolesEntity,RolesDto>{
    constructor(private rolesAppService: RolesAppService){
       super(rolesAppService);
    }
}