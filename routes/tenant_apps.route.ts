import { Body,Query, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Put, Req } from '@nestjs/common';
import { Tenant_AppsFacade } from '../facade/tenant_apps.facade';
import { ResponseModel } from '../../submodules/Portfolio-Platform-Common/ResponseModel';
import { SNS_SQS } from '../../submodules/Portfolio-Platform-RabbitMQConfig/SNS_SQS';
import { Tenant_AppsDto } from '../../submodules/Portfolio-Platform-Dtos/tenant_appsDto';
import { RequestModel } from '../../submodules/Portfolio-Platform-Common/RequestModel';
import { Message } from '../../submodules/Portfolio-Platform-Common/Message';


@Controller('tenant_apps')
export class Tenant_AppsRoutes{

  constructor(private tenant_appsFacade : Tenant_AppsFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['TENANT_APPS_ADD','TENANT_APPS_UPDATE','TENANT_APPS_DELETE'];
  private serviceName = ['TENANT_APPS_SERVICE','TENANT_APPS_SERVICE','TENANT_APPS_SERVICE'];
  
  onModuleInit() {
   
    for (var i = 0; i < this.topicArray.length; i++) {
      this.sns_sqs.listenToService(this.topicArray[i], this.serviceName[i], (() => {
        let value = this.topicArray[i];
        return async (result) => {
          console.log("Result is........" + JSON.stringify(result));
          try {
            let responseModelOfTenant_AppsDto: ResponseModel<Tenant_AppsDto> = null;
            console.log(`listening to  ${value} topic.....result is....`);
            // ToDo :- add a method for removing queue message from queue....
            switch (value) {
              case 'TENANT_APPS_ADD':
                console.log("Inside TENANT_APPS_ADD Topic");
                responseModelOfTenant_AppsDto = await this.createTenantApps(result["message"]);
                break;
              case 'TENANT_APPS_UPDATE':
                  console.log("Inside TENANT_APPS_UPDATE Topic");
                  responseModelOfTenant_AppsDto = await this.updateTenantApps(result["message"]);
                  break;
              case 'TENANT_APPS_DELETE':
                    console.log("Inside TENANT_APPS_DELETE Topic");
                    responseModelOfTenant_AppsDto = await this.deleteTenantApps(result["message"]);
                    break;
  
            }
  
            console.log("Result of aws of GroupRoutes  is...." + JSON.stringify(result));
            let requestModelOfTenant_AppsDto: RequestModel<Tenant_AppsDto> = result["message"];
            responseModelOfTenant_AppsDto.setSocketId(requestModelOfTenant_AppsDto.SocketId)
            responseModelOfTenant_AppsDto.setCommunityUrl(requestModelOfTenant_AppsDto.CommunityUrl);
            responseModelOfTenant_AppsDto.setRequestId(requestModelOfTenant_AppsDto.RequestGuid);
            responseModelOfTenant_AppsDto.setStatus(new Message("200", "Group Inserted Successfully", null));

            for (let index = 0; index < result.OnSuccessTopicsToPush.length; index++) {
              const element = result.OnSuccessTopicsToPush[index];
              console.log("ELEMENT: ", JSON.stringify(responseModelOfTenant_AppsDto));
              this.sns_sqs.publishMessageToTopic(element, responseModelOfTenant_AppsDto)
            }
          }
          catch (error) {
            console.log("Inside Catch.........");
            console.log(error, result);
            for (let index = 0; index < result.OnFailureTopicsToPush.length; index++) {
              const element = result.OnFailureTopicsToPush[index];
              let errorResult: ResponseModel<Tenant_AppsDto> = new ResponseModel<Tenant_AppsDto>(null,null,null,null,null,null,null,null,null);;
              errorResult.setStatus(new Message("500",error,null))
              

              this.sns_sqs.publishMessageToTopic(element, errorResult);
            }
          }
        }
      })())
    }

  }


  @Get()
  allTenantApps() {
    try {
  
      return this.tenant_appsFacade.getAll();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/") 
  async createTenantApps(@Body() body:RequestModel<Tenant_AppsDto>): Promise<ResponseModel<Tenant_AppsDto>> {  //requiestmodel<STUDENTDto></STUDENTDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
    
      let result = await this.tenant_appsFacade.create(body);
   
      return result;
      // return null;
    } catch (error) {
       console.log("Error is....." + error);
       throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put("/")
  async updateTenantApps(@Body() body: RequestModel<Tenant_AppsDto>): Promise<ResponseModel<Tenant_AppsDto>> {  //requiestmodel<STUDENTDto></STUDENTDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
 

      console.log("Executing update query..............")
      return await this.tenant_appsFacade.update(body);
    } catch (error) {
      console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('/')
  deleteTenantApps(@Body() body:RequestModel<Tenant_AppsDto>): Promise<ResponseModel<Tenant_AppsDto>>{
    try {

      return this.tenant_appsFacade.deleteById(body);
        } catch (error) {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }
}