import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Injectable, Param, Patch, Post, Put, Req } from '@nestjs/common';
import { TenantsFacade } from '../facade/tenants.facade';
import { ResponseModel } from '../../submodules/Portfolio-Platform-Common/ResponseModel';
import { SNS_SQS } from '../../submodules/Portfolio-Platform-RabbitMQConfig/SNS_SQS';
import { TenantsDto } from '../../submodules/Portfolio-Platform-Dtos/tenantsDto';
import { RequestModel } from '../../submodules/Portfolio-Platform-Common/RequestModel';
import { Message } from '../../submodules/Portfolio-Platform-Common/Message';


@Controller('tenants')
export class TenantsRoutes{

  constructor(private tenantsFacade : TenantsFacade) { }

  private sns_sqs = SNS_SQS.getInstance();
  private topicArray = ['TENANTS_ADD','TENANTS_UPDATE','TENANTS_DELETE'];
  private serviceName = ['TENANTS_SERVICE','TENANTS_SERVICE','TENANTS_SERVICE'];
  
  onModuleInit() {
   
    for (var i = 0; i < this.topicArray.length; i++) {
      this.sns_sqs.listenToService(this.topicArray[i], this.serviceName[i], (() => {
        let value = this.topicArray[i];
        return async (result) => {
          console.log("Result is........" + JSON.stringify(result));
          try {
            let responseModelOfTenantsDto: ResponseModel<TenantsDto> = null;
            console.log(`listening to  ${value} topic.....result is....`);
            // ToDo :- add a method for removing queue message from queue....
            switch (value) {
              case 'TENANTS_ADD':
                console.log("Inside TENANTS_ADD Topic");
                responseModelOfTenantsDto = await this.createTenants(result["message"]);
                break;
              case 'TENANTS_UPDATE':
                console.log("Inside TENANTS_UPDATE Topic");
               responseModelOfTenantsDto = await this.updateTenants(result["message"]);
                break;
              case 'TENANTS_DELETE':
                console.log("Inside TENANTS_DELETE Topic");
                responseModelOfTenantsDto = await this.deleteTenants(result["message"]);
                break;
  
            }
  
            console.log("Result of aws of GroupRoutes  is...." + JSON.stringify(result));
            let requestModelOfTenantsDto: RequestModel<TenantsDto> = result["message"];
            responseModelOfTenantsDto.setSocketId(requestModelOfTenantsDto.SocketId)
            responseModelOfTenantsDto.setCommunityUrl(requestModelOfTenantsDto.CommunityUrl);
            responseModelOfTenantsDto.setRequestId(requestModelOfTenantsDto.RequestGuid);
            responseModelOfTenantsDto.setStatus(new Message("200", "Group Inserted Successfully", null));

            for (let index = 0; index < result.OnSuccessTopicsToPush.length; index++) {
              const element = result.OnSuccessTopicsToPush[index];
              console.log("ELEMENT: ", JSON.stringify(responseModelOfTenantsDto));
              this.sns_sqs.publishMessageToTopic(element, responseModelOfTenantsDto)
            }
          }
          catch (error) {
            console.log("Inside Catch.........");
            console.log(error, result);
            for (let index = 0; index < result.OnFailureTopicsToPush.length; index++) {
              const element = result.OnFailureTopicsToPush[index];
              let errorResult: ResponseModel<TenantsDto> = new ResponseModel<TenantsDto>(null,null,null,null,null,null,null,null,null);;
              errorResult.setStatus(new Message("500",error,null))
              

              this.sns_sqs.publishMessageToTopic(element, errorResult);
            }
          }
        }
      })())
    }

  }


  @Get()
  allTenants() {
    try {
     
      return this.tenantsFacade.getAll();
    } catch (error) {
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post("/") 
  async createTenants(@Body() body:RequestModel<TenantsDto>): Promise<ResponseModel<TenantsDto>> {  //requiestmodel<STUDENTDto></STUDENTDto>....Promise<ResponseModel<Grou[pDto>>]
    try {

      let result = await this.tenantsFacade.create(body);
   
      return result;
      // return null;
    } catch (error) {
       console.log("Error is....." + error);
       throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put("/")
  async updateTenants(@Body() body:RequestModel<TenantsDto>): Promise<ResponseModel<TenantsDto>> {  //requiestmodel<STUDENTDto></STUDENTDto>....Promise<ResponseModel<Grou[pDto>>]
    try {
             
      console.log("Executing update query..............")
      return await this.tenantsFacade.update(body);
    } catch (error) {
      console.log("Error is....." + error);
      throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  
  @Delete('/')
  deleteTenants(@Body() body:RequestModel<TenantsDto>): Promise<ResponseModel<TenantsDto>>{
    try {
      
      return this.tenantsFacade.deleteById(body);
        } catch (error) {
          throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
  }
}