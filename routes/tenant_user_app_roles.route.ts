import { Body,Query, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Put, Req } from '@nestjs/common';
import { Tenant_User_App_RolesFacade } from '../facade/tenant_user_app_roles.facade';
import { ResponseModel } from '../../submodules/Portfolio-Platform-Common/ResponseModel';
import { SNS_SQS } from '../../submodules/Portfolio-Platform-RabbitMQConfig/SNS_SQS';
import { Tenant_User_App_RolesDto } from '../../submodules/Portfolio-Platform-Dtos/tenant_user_app_rolesDto';
import { RequestModel } from '../../submodules/Portfolio-Platform-Common/RequestModel';
import { Message } from '../../submodules/Portfolio-Platform-Common/Message';


@Controller('tenant_user_app_roles')
export class Tenant_User_App_RolesRoutes{

  constructor(private tenant_user_app_rolesFacade : Tenant_User_App_RolesFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['TENANT_USER_APP_ROLES_ADD','TENANT_USER_APP_ROLES_UPDATE','TENANT_USER_APP_ROLES_DELETE'];
  private serviceName = ['TENANT_USER_APP_ROLES_SERVICE','TENANT_USER_APP_ROLES_SERVICE','TENANT_USER_APP_ROLES_SERVICE'];
  
  onModuleInit() {
   
    for (var i = 0; i < this.topicArray.length; i++) {
      this.sns_sqs.listenToService(this.topicArray[i], this.serviceName[i], (() => {
        let value = this.topicArray[i];
        return async (result) => {
          console.log("Result is........" + JSON.stringify(result));
          try {
            let responseModelOfTenant_User_App_RolesDto: ResponseModel<Tenant_User_App_RolesDto> = null;
            console.log(`listening to  ${value} topic.....result is....`);
            // ToDo :- add a method for removing queue message from queue....
            switch (value) {
              case 'TENANT_USER_APP_ROLES_ADD':
                console.log("Inside TENANT_USER_APP_ROLES_ADD Topic");
                responseModelOfTenant_User_App_RolesDto = await this.createTenantUserAppRoles(result["message"]);
                break;
              case 'TENANT_USER_APP_ROLES_UPDATE':
                  console.log("Inside TENANT_USER_APP_ROLES_UPDATE Topic");
                  responseModelOfTenant_User_App_RolesDto = await this.updateTenantUserAppRoles(result["message"]);
                  break;
              case 'TENANT_USER_APP_ROLES_DELETE':
                    console.log("Inside TENANT_USER_APP_ROLES_DELETE Topic");
                    responseModelOfTenant_User_App_RolesDto = await this.deleteTenantUserAppRoles(result["message"]);
                    break;
  
            }
  
            console.log("Result of aws of GroupRoutes  is...." + JSON.stringify(result));
            let requestModelOfTenant_User_App_RolesDto: RequestModel<Tenant_User_App_RolesDto> = result["message"];
            responseModelOfTenant_User_App_RolesDto.setSocketId(requestModelOfTenant_User_App_RolesDto.SocketId)
            responseModelOfTenant_User_App_RolesDto.setCommunityUrl(requestModelOfTenant_User_App_RolesDto.CommunityUrl);
            responseModelOfTenant_User_App_RolesDto.setRequestId(requestModelOfTenant_User_App_RolesDto.RequestGuid);
            responseModelOfTenant_User_App_RolesDto.setStatus(new Message("200", "Group Inserted Successfully", null));

            for (let index = 0; index < result.OnSuccessTopicsToPush.length; index++) {
              const element = result.OnSuccessTopicsToPush[index];
              console.log("ELEMENT: ", JSON.stringify(responseModelOfTenant_User_App_RolesDto));
              this.sns_sqs.publishMessageToTopic(element, responseModelOfTenant_User_App_RolesDto)
            }
          }
          catch (error) {
            console.log("Inside Catch.........");
            console.log(error, result);
            for (let index = 0; index < result.OnFailureTopicsToPush.length; index++) {
              const element = result.OnFailureTopicsToPush[index];
              let errorResult: ResponseModel<Tenant_User_App_RolesDto> = new ResponseModel<Tenant_User_App_RolesDto>(null,null,null,null,null,null,null,null,null);;
              errorResult.setStatus(new Message("500",error,null))
              

              this.sns_sqs.publishMessageToTopic(element, errorResult);
            }
          }
        }
      })())
    }

  }


  @Get()
  allTenantUserAppRoles() {
    try {

      return this.tenant_user_app_rolesFacade.getAll();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/") 
  async createTenantUserAppRoles(@Body() body:RequestModel<Tenant_User_App_RolesDto>): Promise<ResponseModel<Tenant_User_App_RolesDto>> {  //requiestmodel<STUDENTDto></STUDENTDto>....Promise<ResponseModel<Grou[pDto>>]
    try {

      let result = await this.tenant_user_app_rolesFacade.create(body);
   
      return result;
      // return null;
    } catch (error) {
       console.log("Error is....." + error);
       throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put("/")
  async updateTenantUserAppRoles(@Body() body: RequestModel<Tenant_User_App_RolesDto>): Promise<ResponseModel<Tenant_User_App_RolesDto>> {  //requiestmodel<STUDENTDto></STUDENTDto>....Promise<ResponseModel<Grou[pDto>>]
    try {

      console.log("Executing update query..............")
      return await this.tenant_user_app_rolesFacade.update(body);
    } catch (error) {
      console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('/')
  deleteTenantUserAppRoles(@Body() body:RequestModel<Tenant_User_App_RolesDto>): Promise<ResponseModel<Tenant_User_App_RolesDto>>{
    try {
      console.log("body: ",body)
      return this.tenant_user_app_rolesFacade.deleteById(body);
        } catch (error) {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }

}