import { Body,Query, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Put, Req } from '@nestjs/common';
import { Tenant_User_AppsFacade } from '../facade/tenant_user_apps.facade';
import { ResponseModel } from '../../submodules/Portfolio-Platform-Common/ResponseModel';
import { SNS_SQS } from '../../submodules/Portfolio-Platform-RabbitMQConfig/SNS_SQS';
import { Tenant_User_AppsDto } from '../../submodules/Portfolio-Platform-Dtos/tenant_user_appsDto';
import { RequestModel } from '../../submodules/Portfolio-Platform-Common/RequestModel';
import { Message } from '../../submodules/Portfolio-Platform-Common/Message';


@Controller('tenant_user_apps')
export class Tenant_User_AppsRoutes{

  constructor(private tenant_user_appsFacade : Tenant_User_AppsFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['TENANT_USER_APPS_ADD','TENANT_USER_APPS_UPDATE','TENANT_USER_APPS_DELETE'];
  private serviceName = ['TENANT_USER_APPS_SERVICE','TENANT_USER_APPS_SERVICE','TENANT_USER_APPS_SERVICE'];
  
  onModuleInit() {
   
    for (var i = 0; i < this.topicArray.length; i++) {
      this.sns_sqs.listenToService(this.topicArray[i], this.serviceName[i], (() => {
        let value = this.topicArray[i];
        return async (result) => {
          console.log("Result is........" + JSON.stringify(result));
          try {
            let responseModelOfTenant_User_AppsDto: ResponseModel<Tenant_User_AppsDto> = null;
            console.log(`listening to  ${value} topic.....result is....`);
            // ToDo :- add a method for removing queue message from queue....
            switch (value) {
              case 'TENANT_USER_APPS_ADD':
                console.log("Inside TENANT_USER_APPS_ADD Topic");
                responseModelOfTenant_User_AppsDto = await this.createTenantUserApps(result["message"]);
                break;
              case 'TENANT_USER_APPS_UPDATE':
                  console.log("Inside TENANT_USER_APPS_UPDATE Topic");
                  responseModelOfTenant_User_AppsDto = await this.updateTenantUserApps(result["message"]);
                  break;
              case 'TENANT_USER_APPS_DELETE':
                    console.log("Inside TENANT_USER_APPS_DELETE Topic");
                    responseModelOfTenant_User_AppsDto = await this.deleteTenantUserApps(result["message"]);
                    break;
  
            }
  
            console.log("Result of aws of GroupRoutes  is...." + JSON.stringify(result));
            let requestModelOfTenant_User_AppsDto: RequestModel<Tenant_User_AppsDto> = result["message"];
            responseModelOfTenant_User_AppsDto.setSocketId(requestModelOfTenant_User_AppsDto.SocketId)
            responseModelOfTenant_User_AppsDto.setCommunityUrl(requestModelOfTenant_User_AppsDto.CommunityUrl);
            responseModelOfTenant_User_AppsDto.setRequestId(requestModelOfTenant_User_AppsDto.RequestGuid);
            responseModelOfTenant_User_AppsDto.setStatus(new Message("200", "Group Inserted Successfully", null));

            for (let index = 0; index < result.OnSuccessTopicsToPush.length; index++) {
              const element = result.OnSuccessTopicsToPush[index];
              console.log("ELEMENT: ", JSON.stringify(responseModelOfTenant_User_AppsDto));
              this.sns_sqs.publishMessageToTopic(element, responseModelOfTenant_User_AppsDto)
            }
          }
          catch (error) {
            console.log("Inside Catch.........");
            console.log(error, result);
            for (let index = 0; index < result.OnFailureTopicsToPush.length; index++) {
              const element = result.OnFailureTopicsToPush[index];
              let errorResult: ResponseModel<Tenant_User_AppsDto> = new ResponseModel<Tenant_User_AppsDto>(null,null,null,null,null,null,null,null,null);;
              errorResult.setStatus(new Message("500",error,null))
              

              this.sns_sqs.publishMessageToTopic(element, errorResult);
            }
          }
        }
      })())
    }

  }


  @Get()
  allTenantUserApps() {
    try {
      return this.tenant_user_appsFacade.getAll();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/") 
  async createTenantUserApps(@Body() body:RequestModel<Tenant_User_AppsDto>): Promise<ResponseModel<Tenant_User_AppsDto>> {  //requiestmodel<STUDENTDto></STUDENTDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
      let result = await this.tenant_user_appsFacade.create(body);
      return result;
      // return null;
    } catch (error) {
       console.log("Error is....." + error);
       throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put("/")
  async updateTenantUserApps(@Body() body: RequestModel<Tenant_User_AppsDto>): Promise<ResponseModel<Tenant_User_AppsDto>> {  //requiestmodel<STUDENTDto></STUDENTDto>....Promise<ResponseModel<Grou[pDto>>]
    try {

      return await this.tenant_user_appsFacade.update(body);
    } catch (error) {
      console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('/')
  deleteTenantUserApps(@Body() body:RequestModel<Tenant_User_AppsDto>): Promise<ResponseModel<Tenant_User_AppsDto>>{
    try {
      return this.tenant_user_appsFacade.deleteById(body);
        } catch (error) {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }

}