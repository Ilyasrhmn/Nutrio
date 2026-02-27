import { Injectable } from "@nestjs/common";
import { APP_NAME, API_VERSION } from "@workspace/common/constants";

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: APP_NAME,
      version: API_VERSION,
      description: "BI Hackathon API",
      timestamp: new Date().toISOString(),
    };
  }
}
