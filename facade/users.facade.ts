import { Injectable } from "@nestjs/common";
import UsersAppService from "../appservices/users.appservice";
import { UsersDto } from "../../submodules/Portfolio-Platform-Dtos/usersDto";
import { UsersEntity } from "../../submodules/Portfolio-Platform-Entities/usersEntity";
import FacadeBase from "./facadebase";

@Injectable()
export class UsersFacade extends FacadeBase<UsersEntity,UsersDto>{
    constructor(private usersAppService: UsersAppService){
       super(usersAppService);
    }
}