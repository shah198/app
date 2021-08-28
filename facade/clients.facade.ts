import { Injectable } from "@nestjs/common";
import ClientsAppService from "../appservices/clients.appservice";
import { ClientsDto } from "../../submodules/Portfolio-Platform-Dtos/clientsDto";
import { ClientsEntity } from "../../submodules/Portfolio-Platform-Entities/clientsEntity";
import FacadeBase from "./facadebase";

@Injectable()
export class ClientsFacade extends FacadeBase<ClientsEntity,ClientsDto>{
    constructor(private clientsAppService: ClientsAppService){
       super(clientsAppService);
    }
}