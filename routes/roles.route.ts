import { Body,Query, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Put, Req } from '@nestjs/common';
import { RolesFacade } from '../facade/roles.facade';
import { ResponseModel } from '../../submodules/Portfolio-Platform-Common/ResponseModel';
import { SNS_SQS } from '../../submodules/Portfolio-Platform-RabbitMQConfig/SNS_SQS';
import { RolesDto } from '../../submodules/Portfolio-Platform-Dtos/rolesDto';
import { RequestModel } from '../../submodules/Portfolio-Platform-Common/RequestModel';
import { Message } from '../../submodules/Portfolio-Platform-Common/Message';


@Controller('roles')
export class RolesRoutes{

  constructor(private rolesFacade : RolesFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['ROLES_ADD','ROLES_UPDATE','ROLES_DELETE'];
  private serviceName = ['ROLES_SERVICE','ROLES_SERVICE','ROLES_SERVICE'];
  
  onModuleInit() {
   
    for (var i = 0; i < this.topicArray.length; i++) {
      this.sns_sqs.listenToService(this.topicArray[i], this.serviceName[i], (() => {
        let value = this.topicArray[i];
        return async (result) => {
          console.log("Result is........" + JSON.stringify(result));
          try {
            let responseModelOfRolesDto: ResponseModel<RolesDto> = null;
            console.log(`listening to  ${value} topic.....result is....`);
            // ToDo :- add a method for removing queue message from queue....
            switch (value) {
              case 'ROLES_ADD':
                console.log("Inside ROLES_ADD Topic");
                responseModelOfRolesDto = await this.createRoles(result["message"]);
                break;
              case 'ROLES_UPDATE':
                  console.log("Inside ROLES_UPDATE Topic");
                  responseModelOfRolesDto = await this.updateRoles(result["message"]);
                  break;
              case 'ROLES_DELETE':
                    console.log("Inside ROLES_DELETE Topic");
                    responseModelOfRolesDto = await this.deleteRoles(result["message"]);
                    break;
  
            }
  
            console.log("Result of aws of GroupRoutes  is...." + JSON.stringify(result));
            let requestModelOfRolesDto: RequestModel<RolesDto> = result["message"];
            responseModelOfRolesDto.setSocketId(requestModelOfRolesDto.SocketId)
            responseModelOfRolesDto.setCommunityUrl(requestModelOfRolesDto.CommunityUrl);
            responseModelOfRolesDto.setRequestId(requestModelOfRolesDto.RequestGuid);
            responseModelOfRolesDto.setStatus(new Message("200", "Group Inserted Successfully", null));

            for (let index = 0; index < result.OnSuccessTopicsToPush.length; index++) {
              const element = result.OnSuccessTopicsToPush[index];
              console.log("ELEMENT: ", JSON.stringify(responseModelOfRolesDto));
              this.sns_sqs.publishMessageToTopic(element, responseModelOfRolesDto)
            }
          }
          catch (error) {
            console.log("Inside Catch.........");
            console.log(error, result);
            for (let index = 0; index < result.OnFailureTopicsToPush.length; index++) {
              const element = result.OnFailureTopicsToPush[index];
              let errorResult: ResponseModel<RolesDto> = new ResponseModel<RolesDto>(null,null,null,null,null,null,null,null,null);;
              errorResult.setStatus(new Message("500",error,null))
              

              this.sns_sqs.publishMessageToTopic(element, errorResult);
            }
          }
        }
      })())
    }

  }


  @Get()
  allRoles() {
    try {
 
      return this.rolesFacade.getAll();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/") 
  async createRoles(@Body() body:RequestModel<RolesDto>): Promise<ResponseModel<RolesDto>> {  //requiestmodel<STUDENTDto></STUDENTDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
    
      let result = await this.rolesFacade.create(body);
   
      return result;
      // return null;
    } catch (error) {
       console.log("Error is....." + error);
       throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put("/")
  async updateRoles(@Body() body: RequestModel<RolesDto>): Promise<ResponseModel<RolesDto>> {  //requiestmodel<STUDENTDto></STUDENTDto>....Promise<ResponseModel<Grou[pDto>>]
    try {


      console.log("Executing update query..............")
      return await this.rolesFacade.update(body);
    } catch (error) {
      console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('/')
  deleteRoles(@Body() body:RequestModel<RolesDto>): Promise<ResponseModel<RolesDto>>{
    try {
  
      return this.rolesFacade.deleteById(body);
        } catch (error) {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }

}