import { Controller, Get } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DataSource } from "typeorm";

@Controller("health")
export class HealthController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly config: ConfigService,
  ) {}

  @Get()
  async check() {
    let database = false;
    try {
      await this.dataSource.query("SELECT 1");
      database = true;
    } catch {
      database = false;
    }
    const missingConfiguration = ["DATABASE_URL", "JWT_ACCESS_SECRET"].filter(
      (key) => !this.config.get<string>(key),
    );
    return {
      status: database && missingConfiguration.length === 0 ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      checks: { database, missingConfiguration },
    };
  }
}
