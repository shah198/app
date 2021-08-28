import { Body,Query, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Put, Req } from '@nestjs/common';
import { FeaturesFacade } from '../facade/features.facade';
import { ResponseModel } from '../../submodules/Portfolio-Platform-Common/ResponseModel';
import { SNS_SQS } from '../../submodules/Portfolio-Platform-RabbitMQConfig/SNS_SQS';
import { FeaturesDto } from '../../submodules/Portfolio-Platform-Dtos/featuresDto';
import { RequestModel } from '../../submodules/Portfolio-Platform-Common/RequestModel';
import { Message } from '../../submodules/Portfolio-Platform-Common/Message';


@Controller('features')
export class FeaturesRoutes{

  constructor(private featuresFacade : FeaturesFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['FEATURES_ADD','FEATURES_UPDATE','FEATURES_DELETE'];
  private serviceName = ['FEATURES_SERVICE','FEATURES_SERVICE','FEATURES_SERVICE'];
  
  onModuleInit() {
   
    for (var i = 0; i < this.topicArray.length; i++) {
      this.sns_sqs.listenToService(this.topicArray[i], this.serviceName[i], (() => {
        let value = this.topicArray[i];
        return async (result) => {
          console.log("Result is........" + JSON.stringify(result));
          try {
            let responseModelOfFeaturesDto: ResponseModel<FeaturesDto> = null;
            console.log(`listening to  ${value} topic.....result is....`);
            // ToDo :- add a method for removing queue message from queue....
            switch (value) {
              case 'FEATURES_ADD':
                console.log("Inside FEATURES_ADD Topic");
                responseModelOfFeaturesDto = await this.createFeatures(result["message"]);
                break;
              case 'FEATURES_UPDATE':
                  console.log("Inside FEATURES_UPDATE Topic");
                  responseModelOfFeaturesDto = await this.updateFeatures(result["message"]);
                  break;
              case 'FEATURES_DELETE':
                    console.log("Inside FEATURES_DELETE Topic");
                    responseModelOfFeaturesDto = await this.deleteFeatures(result["message"]);
                    break;
  
            }
  
            console.log("Result of aws of GroupRoutes  is...." + JSON.stringify(result));
            let requestModelOfFeaturesDto: RequestModel<FeaturesDto> = result["message"];
            responseModelOfFeaturesDto.setSocketId(requestModelOfFeaturesDto.SocketId)
            responseModelOfFeaturesDto.setCommunityUrl(requestModelOfFeaturesDto.CommunityUrl);
            responseModelOfFeaturesDto.setRequestId(requestModelOfFeaturesDto.RequestGuid);
            responseModelOfFeaturesDto.setStatus(new Message("200", "Group Inserted Successfully", null));

            for (let index = 0; index < result.OnSuccessTopicsToPush.length; index++) {
              const element = result.OnSuccessTopicsToPush[index];
              console.log("ELEMENT: ", JSON.stringify(responseModelOfFeaturesDto));
              this.sns_sqs.publishMessageToTopic(element, responseModelOfFeaturesDto)
            }
          }
          catch (error) {
            console.log("Inside Catch.........");
            console.log(error, result);
            for (let index = 0; index < result.OnFailureTopicsToPush.length; index++) {
              const element = result.OnFailureTopicsToPush[index];
              let errorResult: ResponseModel<FeaturesDto> = new ResponseModel<FeaturesDto>(null,null,null,null,null,null,null,null,null);;
              errorResult.setStatus(new Message("500",error,null))
              

              this.sns_sqs.publishMessageToTopic(element, errorResult);
            }
          }
        }
      })())
    }

  }


  @Get()
  allFeatures() {
    try {
    
      return this.featuresFacade.getAll();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/") 
  async createFeatures(@Body() body:RequestModel<FeaturesDto>): Promise<ResponseModel<FeaturesDto>> {  //requiestmodel<STUDENTDto></STUDENTDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
   
      let result = await this.featuresFacade.create(body);
   
      return result;
      // return null;
    } catch (error) {
       console.log("Error is....." + error);
       throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put("/")
  async updateFeatures(@Body() body: RequestModel<FeaturesDto>): Promise<ResponseModel<FeaturesDto>> {  //requiestmodel<STUDENTDto></STUDENTDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
     

      console.log("Executing update query..............")
      return await this.featuresFacade.update(body);
    } catch (error) {
      console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('/')
  deleteFeatures(@Body() body:RequestModel<FeaturesDto>): Promise<ResponseModel<FeaturesDto>>{
    try {
    
      return this.featuresFacade.deleteById(body);
        } catch (error) {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }

}