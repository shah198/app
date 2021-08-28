import { Injectable } from "@nestjs/common";
import Feature_PermissionsAppService from "../appservices/feature_permissions.appservice";
import { Feature_PermissionsDto } from "../../submodules/Portfolio-Platform-Dtos/feature_permissionsDto";
import { Feature_PermissionsEntity } from "../../submodules/Portfolio-Platform-Entities/feature_permissionsEntity";
import FacadeBase from "./facadebase";

@Injectable()
export class Feature_PermissionsFacade extends FacadeBase<Feature_PermissionsEntity,Feature_PermissionsDto>{
    constructor(private feature_permissionsAppService: Feature_PermissionsAppService){
       super(feature_permissionsAppService);
    }
}