import { Body,Query, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Put, Req } from '@nestjs/common';
import { Feature_PermissionsFacade } from '../facade/feature_permissions.facade';
import { ResponseModel } from '../../submodules/Portfolio-Platform-Common/ResponseModel';
import { SNS_SQS } from '../../submodules/Portfolio-Platform-RabbitMQConfig/SNS_SQS';
import { Feature_PermissionsDto } from '../../submodules/Portfolio-Platform-Dtos/feature_permissionsDto';
import { RequestModel } from '../../submodules/Portfolio-Platform-Common/RequestModel';
import { Message } from '../../submodules/Portfolio-Platform-Common/Message';


@Controller('feature_permissions')
export class Feature_PermissionsRoutes{

  constructor(private feature_permissionsFacade : Feature_PermissionsFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['FEATURE_PERMISSIONS_ADD','FEATURE_PERMISSIONS_UPDATE','FEATURE_PERMISSIONS_DELETE'];
  private serviceName = ['FEATURE_PERMISSIONS_SERVICE','FEATURE_PERMISSIONS_SERVICE','FEATURE_PERMISSIONS_SERVICE'];
  
  onModuleInit() {
   
    for (var i = 0; i < this.topicArray.length; i++) {
      this.sns_sqs.listenToService(this.topicArray[i], this.serviceName[i], (() => {
        let value = this.topicArray[i];
        return async (result) => {
          console.log("Result is........" + JSON.stringify(result));
          try {
            let responseModelOfFeature_PermissionsDto: ResponseModel<Feature_PermissionsDto> = null;
            console.log(`listening to  ${value} topic.....result is....`);
            // ToDo :- add a method for removing queue message from queue....
            switch (value) {
              case 'FEATURE_PERMISSIONS_ADD':
                console.log("Inside FEATURE_PERMISSIONS_ADD Topic");
                responseModelOfFeature_PermissionsDto = await this.createFeaturePermissions(result["message"]);
                break;
              case 'FEATURE_PERMISSIONS_UPDATE':
                  console.log("Inside FEATURE_PERMISSIONS_UPDATE Topic");
                  responseModelOfFeature_PermissionsDto = await this.updateFeaturePermissions(result["message"]);
                  break;
              case 'FEATURE_PERMISSIONS_DELETE':
                    console.log("Inside FEATURE_PERMISSIONS_DELETE Topic");
                    responseModelOfFeature_PermissionsDto = await this.deleteFeaturePermissions(result["message"]);
                    break;
  
            }
  
            console.log("Result of aws of GroupRoutes  is...." + JSON.stringify(result));
            let requestModelOfFeature_PermissionsDto: RequestModel<Feature_PermissionsDto> = result["message"];
            responseModelOfFeature_PermissionsDto.setSocketId(requestModelOfFeature_PermissionsDto.SocketId)
            responseModelOfFeature_PermissionsDto.setCommunityUrl(requestModelOfFeature_PermissionsDto.CommunityUrl);
            responseModelOfFeature_PermissionsDto.setRequestId(requestModelOfFeature_PermissionsDto.RequestGuid);
            responseModelOfFeature_PermissionsDto.setStatus(new Message("200", "Group Inserted Successfully", null));

            for (let index = 0; index < result.OnSuccessTopicsToPush.length; index++) {
              const element = result.OnSuccessTopicsToPush[index];
              console.log("ELEMENT: ", JSON.stringify(responseModelOfFeature_PermissionsDto));
              this.sns_sqs.publishMessageToTopic(element, responseModelOfFeature_PermissionsDto)
            }
          }
          catch (error) {
            console.log("Inside Catch.........");
            console.log(error, result);
            for (let index = 0; index < result.OnFailureTopicsToPush.length; index++) {
              const element = result.OnFailureTopicsToPush[index];
              let errorResult: ResponseModel<Feature_PermissionsDto> = new ResponseModel<Feature_PermissionsDto>(null,null,null,null,null,null,null,null,null);;
              errorResult.setStatus(new Message("500",error,null))
              

              this.sns_sqs.publishMessageToTopic(element, errorResult);
            }
          }
        }
      })())
    }

  }


  @Get()
  allFeaturePermissions() {
    try {
    
      return this.feature_permissionsFacade.getAll();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/") 
  async createFeaturePermissions(@Body() body:RequestModel<Feature_PermissionsDto>): Promise<ResponseModel<Feature_PermissionsDto>> {  //requiestmodel<STUDENTDto></STUDENTDto>....Promise<ResponseModel<Grou[pDto>>]
    try {

      let result = await this.feature_permissionsFacade.create(body);
   
      return result;
      // return null;
    } catch (error) {
       console.log("Error is....." + error);
       throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put("/")
  async updateFeaturePermissions(@Body() body: RequestModel<Feature_PermissionsDto>): Promise<ResponseModel<Feature_PermissionsDto>> {  //requiestmodel<STUDENTDto></STUDENTDto>....Promise<ResponseModel<Grou[pDto>>]
    try {


      console.log("Executing update query..............")
      return await this.feature_permissionsFacade.update(body);
    } catch (error) {
      console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('/')
  deleteFeaturePermissions(@Body() body:RequestModel<Feature_PermissionsDto>): Promise<ResponseModel<Feature_PermissionsDto>>{
    try {

      return this.feature_permissionsFacade.deleteById(body);
        } catch (error) {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }
}