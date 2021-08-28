import { Injectable } from "@nestjs/common";
import AppsAppService from "../appservices/apps.appservice";
import { AppsDto } from "../../submodules/Portfolio-Platform-Dtos/appsDto";
import { AppsEntity } from "../../submodules/Portfolio-Platform-Entities/appsEntity";
import FacadeBase from "./facadebase";

@Injectable()
export class AppsFacade extends FacadeBase<AppsEntity,AppsDto>{
    constructor(private appsAppService: AppsAppService){
       super(appsAppService);
    }
}