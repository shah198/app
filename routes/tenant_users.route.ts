import { Body,Query, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Put, Req } from '@nestjs/common';
import { Tenant_UsersFacade } from '../facade/tenant_users.facade';
import { ResponseModel } from '../../submodules/Portfolio-Platform-Common/ResponseModel';
import { SNS_SQS } from '../../submodules/Portfolio-Platform-RabbitMQConfig/SNS_SQS';
import { Tenant_UsersDto } from '../../submodules/Portfolio-Platform-Dtos/tenant_usersDto';
import { RequestModel } from '../../submodules/Portfolio-Platform-Common/RequestModel';
import { Message } from '../../submodules/Portfolio-Platform-Common/Message';


@Controller('tenant_users')
export class Tenant_UsersRoutes{

  constructor(private tenant_usersFacade : Tenant_UsersFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['TENANT_USERS_ADD','TENANT_USERS_UPDATE','TENANT_USERS_DELETE'];
  private serviceName = ['TENANT_USERS_SERVICE','TENANT_USERS_SERVICE','TENANT_USERS_SERVICE'];
  
  onModuleInit() {
   
    for (var i = 0; i < this.topicArray.length; i++) {
      this.sns_sqs.listenToService(this.topicArray[i], this.serviceName[i], (() => {
        let value = this.topicArray[i];
        return async (result) => {
          console.log("Result is........" + JSON.stringify(result));
          try {
            let responseModelOfTenant_UsersDto: ResponseModel<Tenant_UsersDto> = null;
            console.log(`listening to  ${value} topic.....result is....`);
            // ToDo :- add a method for removing queue message from queue....
            switch (value) {
              case 'TENANT_USERS_ADD':
                console.log("Inside TENANT_USERS_ADD Topic");
                responseModelOfTenant_UsersDto = await this.createTenantUsers(result["message"]);
                break;
              case 'TENANT_USERS_UPDATE':
                  console.log("Inside TENANT_USERS_UPDATE Topic");
                  responseModelOfTenant_UsersDto = await this.updateTenantUsers(result["message"]);
                  break;
              case 'TENANT_USERS_DELETE':
                    console.log("Inside TENANT_USERS_DELETE Topic");
                    responseModelOfTenant_UsersDto = await this.deleteTenantUsers(result["message"]);
                    break;
  
            }
  
            console.log("Result of aws of GroupRoutes  is...." + JSON.stringify(result));
            let requestModelOfTenant_UsersDto: RequestModel<Tenant_UsersDto> = result["message"];
            responseModelOfTenant_UsersDto.setSocketId(requestModelOfTenant_UsersDto.SocketId)
            responseModelOfTenant_UsersDto.setCommunityUrl(requestModelOfTenant_UsersDto.CommunityUrl);
            responseModelOfTenant_UsersDto.setRequestId(requestModelOfTenant_UsersDto.RequestGuid);
            responseModelOfTenant_UsersDto.setStatus(new Message("200", "Group Inserted Successfully", null));

            for (let index = 0; index < result.OnSuccessTopicsToPush.length; index++) {
              const element = result.OnSuccessTopicsToPush[index];
              console.log("ELEMENT: ", JSON.stringify(responseModelOfTenant_UsersDto));
              this.sns_sqs.publishMessageToTopic(element, responseModelOfTenant_UsersDto)
            }
          }
          catch (error) {
            console.log("Inside Catch.........");
            console.log(error, result);
            for (let index = 0; index < result.OnFailureTopicsToPush.length; index++) {
              const element = result.OnFailureTopicsToPush[index];
              let errorResult: ResponseModel<Tenant_UsersDto> = new ResponseModel<Tenant_UsersDto>(null,null,null,null,null,null,null,null,null);;
              errorResult.setStatus(new Message("500",error,null))
              

              this.sns_sqs.publishMessageToTopic(element, errorResult);
            }
          }
        }
      })())
    }

  }


  @Get()
  allTenantUsers() {
    try {
     
      return this.tenant_usersFacade.getAll();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/") 
  async createTenantUsers(@Body() body:RequestModel<Tenant_UsersDto>): Promise<ResponseModel<Tenant_UsersDto>> {  //requiestmodel<STUDENTDto></STUDENTDto>....Promise<ResponseModel<Grou[pDto>>]
    try {

      let result = await this.tenant_usersFacade.create(body);
   
      return result;
      // return null;
    } catch (error) {
       console.log("Error is....." + error);
       throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put("/")
  async updateTenantUsers(@Body() body: RequestModel<Tenant_UsersDto>): Promise<ResponseModel<Tenant_UsersDto>> {  //requiestmodel<STUDENTDto></STUDENTDto>....Promise<ResponseModel<Grou[pDto>>]
    try {


      console.log("Executing update query..............")
      return await this.tenant_usersFacade.update(body);
    } catch (error) {
      console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('/')
  deleteTenantUsers(@Body() body:RequestModel<Tenant_UsersDto>): Promise<ResponseModel<Tenant_UsersDto>>{
    try {
   
      return this.tenant_usersFacade.deleteById(body);
        } catch (error) {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }

}