import { Body,Query, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Put, Req } from '@nestjs/common';
import { Tenant_App_FeaturesFacade } from '../facade/tenant_app_features.facade';
import { ResponseModel } from '../../submodules/Portfolio-Platform-Common/ResponseModel';
import { SNS_SQS } from '../../submodules/Portfolio-Platform-RabbitMQConfig/SNS_SQS';
import { Tenant_App_FeaturesDto } from '../../submodules/Portfolio-Platform-Dtos/tenant_app_featuresDto';
import { RequestModel } from '../../submodules/Portfolio-Platform-Common/RequestModel';
import { Message } from '../../submodules/Portfolio-Platform-Common/Message';


@Controller('tenant_app_features')
export class Tenant_App_FeaturesRoutes{

  constructor(private tenant_app_featuresFacade : Tenant_App_FeaturesFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['TENANT_APP_FEATURES_ADD','TENANT_APP_FEATURES_UPDATE','TENANT_APP_FEATURES_DELETE'];
  private serviceName = ['TENANT_APP_FEATURES_SERVICE','TENANT_APP_FEATURES_SERVICE','TENANT_APP_FEATURES_SERVICE'];
  
  onModuleInit() {
   
    for (var i = 0; i < this.topicArray.length; i++) {
      this.sns_sqs.listenToService(this.topicArray[i], this.serviceName[i], (() => {
        let value = this.topicArray[i];
        return async (result) => {
          console.log("Result is........" + JSON.stringify(result));
          try {
            let responseModelOfTenant_App_FeaturesDto: ResponseModel<Tenant_App_FeaturesDto> = null;
            console.log(`listening to  ${value} topic.....result is....`);
            // ToDo :- add a method for removing queue message from queue....
            switch (value) {
              case 'TENANT_APP_FEATURES_ADD':
                console.log("Inside TENANT_APP_FEATURES_ADD Topic");
                responseModelOfTenant_App_FeaturesDto = await this.createTenantAppFeatures(result["message"]);
                break;
              case 'TENANT_APP_FEATURES_UPDATE':
                  console.log("Inside TENANT_APP_FEATURES_UPDATE Topic");
                  responseModelOfTenant_App_FeaturesDto = await this.updateTenantAppFeatures(result["message"]);
                  break;
              case 'TENANT_APP_FEATURES_DELETE':
                    console.log("Inside TENANT_APP_FEATURES_DELETE Topic");
                    responseModelOfTenant_App_FeaturesDto = await this.deleteTenantAppFeatures(result["message"]);
                    break;
  
            }
  
            console.log("Result of aws of GroupRoutes  is...." + JSON.stringify(result));
            let requestModelOfTenant_App_FeaturesDto: RequestModel<Tenant_App_FeaturesDto> = result["message"];
            responseModelOfTenant_App_FeaturesDto.setSocketId(requestModelOfTenant_App_FeaturesDto.SocketId)
            responseModelOfTenant_App_FeaturesDto.setCommunityUrl(requestModelOfTenant_App_FeaturesDto.CommunityUrl);
            responseModelOfTenant_App_FeaturesDto.setRequestId(requestModelOfTenant_App_FeaturesDto.RequestGuid);
            responseModelOfTenant_App_FeaturesDto.setStatus(new Message("200", "Group Inserted Successfully", null));

            for (let index = 0; index < result.OnSuccessTopicsToPush.length; index++) {
              const element = result.OnSuccessTopicsToPush[index];
              console.log("ELEMENT: ", JSON.stringify(responseModelOfTenant_App_FeaturesDto));
              this.sns_sqs.publishMessageToTopic(element, responseModelOfTenant_App_FeaturesDto)
            }
          }
          catch (error) {
            console.log("Inside Catch.........");
            console.log(error, result);
            for (let index = 0; index < result.OnFailureTopicsToPush.length; index++) {
              const element = result.OnFailureTopicsToPush[index];
              let errorResult: ResponseModel<Tenant_App_FeaturesDto> = new ResponseModel<Tenant_App_FeaturesDto>(null,null,null,null,null,null,null,null,null);;
              errorResult.setStatus(new Message("500",error,null))
              

              this.sns_sqs.publishMessageToTopic(element, errorResult);
            }
          }
        }
      })())
    }

  }


  @Get()
  allTenantAppFeatures() {
    try {
     
      return this.tenant_app_featuresFacade.getAll();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/") 
  async createTenantAppFeatures(@Body() body:RequestModel<Tenant_App_FeaturesDto>): Promise<ResponseModel<Tenant_App_FeaturesDto>> {  //requiestmodel<STUDENTDto></STUDENTDto>....Promise<ResponseModel<Grou[pDto>>]
    try {

      let result = await this.tenant_app_featuresFacade.create(body);
   
      return result;
      // return null;
    } catch (error) {
       console.log("Error is....." + error);
       throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put("/")
  async updateTenantAppFeatures(@Body() body: RequestModel<Tenant_App_FeaturesDto>): Promise<ResponseModel<Tenant_App_FeaturesDto>> {  //requiestmodel<STUDENTDto></STUDENTDto>....Promise<ResponseModel<Grou[pDto>>]
    try {

      console.log("Executing update query..............")
      return await this.tenant_app_featuresFacade.update(body);
    } catch (error) {
      console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('/')
  deleteTenantAppFeatures(@Body() body:RequestModel<Tenant_App_FeaturesDto>): Promise<ResponseModel<Tenant_App_FeaturesDto>>{
    try {
  
      return this.tenant_app_featuresFacade.deleteById(body);
        } catch (error) {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }
}