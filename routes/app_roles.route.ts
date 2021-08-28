import { Body,Query, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Put, Req } from '@nestjs/common';
import { App_RolesFacade } from '../facade/app_roles.facade';
import { ResponseModel } from '../../submodules/Portfolio-Platform-Common/ResponseModel';
import { SNS_SQS } from '../../submodules/Portfolio-Platform-RabbitMQConfig/SNS_SQS';
import { App_RolesDto } from '../../submodules/Portfolio-Platform-Dtos/app_rolesDto';
import { RequestModel } from '../../submodules/Portfolio-Platform-Common/RequestModel';
import { Message } from '../../submodules/Portfolio-Platform-Common/Message';


@Controller('app_roles')
export class App_RolesRoutes{

  constructor(private app_rolesFacade : App_RolesFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['APP_ROLES_ADD','APP_ROLES_UPDATE','APP_ROLES_DELETE'];
  private serviceName = ['APP_ROLES_SERVICE','APP_ROLES_SERVICE','APP_ROLES_SERVICE'];
  
  onModuleInit() {
   
    for (var i = 0; i < this.topicArray.length; i++) {
      this.sns_sqs.listenToService(this.topicArray[i], this.serviceName[i], (() => {
        let value = this.topicArray[i];
        return async (result) => {
          console.log("Result is........" + JSON.stringify(result));
          try {
            let responseModelOfApp_RolesDto: ResponseModel<App_RolesDto> = null;
            console.log(`listening to  ${value} topic.....result is....`);
            // ToDo :- add a method for removing queue message from queue....
            switch (value) {
              case 'APP_ROLES_ADD':
                console.log("Inside APP_ROLES_ADD Topic");
                responseModelOfApp_RolesDto = await this.createAppRoles(result["message"]);
                break;
              case 'APP_ROLES_UPDATE':
                  console.log("Inside APP_ROLES_UPDATE Topic");
                  responseModelOfApp_RolesDto = await this.updateAppRoles(result["message"]);
                  break;
              case 'APP_ROLES_DELETE':
                    console.log("Inside APP_ROLES_DELETE Topic");
                    responseModelOfApp_RolesDto = await this.deleteAppRoles(result["message"]);
                    break;
  
            }
  
            console.log("Result of aws of GroupRoutes  is...." + JSON.stringify(result));
            let requestModelOfApp_RolesDto: RequestModel<App_RolesDto> = result["message"];
            responseModelOfApp_RolesDto.setSocketId(requestModelOfApp_RolesDto.SocketId)
            responseModelOfApp_RolesDto.setCommunityUrl(requestModelOfApp_RolesDto.CommunityUrl);
            responseModelOfApp_RolesDto.setRequestId(requestModelOfApp_RolesDto.RequestGuid);
            responseModelOfApp_RolesDto.setStatus(new Message("200", "Group Inserted Successfully", null));

            for (let index = 0; index < result.OnSuccessTopicsToPush.length; index++) {
              const element = result.OnSuccessTopicsToPush[index];
              console.log("ELEMENT: ", JSON.stringify(responseModelOfApp_RolesDto));
              this.sns_sqs.publishMessageToTopic(element, responseModelOfApp_RolesDto)
            }
          }
          catch (error) {
            console.log("Inside Catch.........");
            console.log(error, result);
            for (let index = 0; index < result.OnFailureTopicsToPush.length; index++) {
              const element = result.OnFailureTopicsToPush[index];
              let errorResult: ResponseModel<App_RolesDto> = new ResponseModel<App_RolesDto>(null,null,null,null,null,null,null,null,null);;
              errorResult.setStatus(new Message("500",error,null))
              

              this.sns_sqs.publishMessageToTopic(element, errorResult);
            }
          }
        }
      })())
    }

  }


  @Get()
  allAppRoles() {
    try {
    
      return this.app_rolesFacade.getAll();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/") 
  async createAppRoles(@Body() body:RequestModel<App_RolesDto>): Promise<ResponseModel<App_RolesDto>> {  //requiestmodel<STUDENTDto></STUDENTDto>....Promise<ResponseModel<Grou[pDto>>]
    try {

      let result = await this.app_rolesFacade.create(body);
   
      return result;
      // return null;
    } catch (error) {
       console.log("Error is....." + error);
       throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put("/")
  async updateAppRoles(@Body() body: RequestModel<App_RolesDto>): Promise<ResponseModel<App_RolesDto>> {  //requiestmodel<STUDENTDto></STUDENTDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
 

      console.log("Executing update query..............")
      return await this.app_rolesFacade.update(body);
    } catch (error) {
      console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('/')
  deleteAppRoles(@Body() body:RequestModel<App_RolesDto>): Promise<ResponseModel<App_RolesDto>>{
    try {

      return this.app_rolesFacade.deleteById(body);
        } catch (error) {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }

}