import { Body,Query, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Put, Req } from '@nestjs/common';
import { App_MessagesFacade } from '../facade/app_messages.facade';
import { ResponseModel } from '../../submodules/Portfolio-Platform-Common/ResponseModel';
import { SNS_SQS } from '../../submodules/Portfolio-Platform-RabbitMQConfig/SNS_SQS';
import { App_MessagesDto } from '../../submodules/Portfolio-Platform-Dtos/app_messagesDto';
import { RequestModel } from '../../submodules/Portfolio-Platform-Common/RequestModel';
import { Message } from '../../submodules/Portfolio-Platform-Common/Message';


@Controller('app_messages')
export class App_MessagesRoutes{

  constructor(private app_messagesFacade : App_MessagesFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['APP_MESSAGES_ADD','APP_MESSAGES_UPDATE','APP_MESSAGES_DELETE'];
  private serviceName = ['APP_MESSAGES_SERVICE','APP_MESSAGES_SERVICE','APP_MESSAGES_SERVICE'];
  
  onModuleInit() {
   
    for (var i = 0; i < this.topicArray.length; i++) {
      this.sns_sqs.listenToService(this.topicArray[i], this.serviceName[i], (() => {
        let value = this.topicArray[i];
        return async (result) => {
          console.log("Result is........" + JSON.stringify(result));
          try {
            let responseModelOfApp_MessagesDto: ResponseModel<App_MessagesDto> = null;
            console.log(`listening to  ${value} topic.....result is....`);
            // ToDo :- add a method for removing queue message from queue....
            switch (value) {
              case 'APP_MESSAGES_ADD':
                console.log("Inside APP_MESSAGES_ADD Topic");
                responseModelOfApp_MessagesDto = await this.createAppMessages(result["message"]);
                break;
              case 'APP_MESSAGES_UPDATE':
                  console.log("Inside APP_MESSAGES_UPDATE Topic");
                  responseModelOfApp_MessagesDto = await this.updateAppMessages(result["message"]);
                  break;
              case 'APP_MESSAGES_DELETE':
                    console.log("Inside APP_MESSAGES_DELETE Topic");
                    responseModelOfApp_MessagesDto = await this.deleteAppMessages(result["message"]);
                    break;
  
            }
  
            console.log("Result of aws of GroupRoutes  is...." + JSON.stringify(result));
            let requestModelOfApp_MessagesDto: RequestModel<App_MessagesDto> = result["message"];
            responseModelOfApp_MessagesDto.setSocketId(requestModelOfApp_MessagesDto.SocketId)
            responseModelOfApp_MessagesDto.setCommunityUrl(requestModelOfApp_MessagesDto.CommunityUrl);
            responseModelOfApp_MessagesDto.setRequestId(requestModelOfApp_MessagesDto.RequestGuid);
            responseModelOfApp_MessagesDto.setStatus(new Message("200", "Group Inserted Successfully", null));

            for (let index = 0; index < result.OnSuccessTopicsToPush.length; index++) {
              const element = result.OnSuccessTopicsToPush[index];
              console.log("ELEMENT: ", JSON.stringify(responseModelOfApp_MessagesDto));
              this.sns_sqs.publishMessageToTopic(element, responseModelOfApp_MessagesDto)
            }
          }
          catch (error) {
            console.log("Inside Catch.........");
            console.log(error, result);
            for (let index = 0; index < result.OnFailureTopicsToPush.length; index++) {
              const element = result.OnFailureTopicsToPush[index];
              let errorResult: ResponseModel<App_MessagesDto> = new ResponseModel<App_MessagesDto>(null,null,null,null,null,null,null,null,null);;
              errorResult.setStatus(new Message("500",error,null))
              

              this.sns_sqs.publishMessageToTopic(element, errorResult);
            }
          }
        }
      })())
    }

  }


  @Get()
  allAppMessages() {
    try {

      return this.app_messagesFacade.getAll();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/") 
  async createAppMessages(@Body() body:RequestModel<App_MessagesDto>): Promise<ResponseModel<App_MessagesDto>> {  //requiestmodel<STUDENTDto></STUDENTDto>....Promise<ResponseModel<Grou[pDto>>]
    try {

      let result = await this.app_messagesFacade.create(body);
   
      return result;
      // return null;
    } catch (error) {
       console.log("Error is....." + error);
       throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put("/")
  async updateAppMessages(@Body() body: RequestModel<App_MessagesDto>): Promise<ResponseModel<App_MessagesDto>> {  //requiestmodel<STUDENTDto></STUDENTDto>....Promise<ResponseModel<Grou[pDto>>]
    try {

      console.log("Executing update query..............")
      return await this.app_messagesFacade.update(body);
    } catch (error) {
      console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('/')
  deleteAppMessages(@Body() body:RequestModel<App_MessagesDto>): Promise<ResponseModel<App_MessagesDto>>{
    try {

      return this.app_messagesFacade.deleteById(body);
        } catch (error) {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }

}