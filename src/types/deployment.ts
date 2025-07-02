export interface DeploymentStatus {
  isDeployed: boolean;
  deploymentUrl?: string;
  status: 'not_deployed' | 'deploying' | 'deployed' | 'failed';
  lastDeployment?: {
    timestamp: string;
    version: string;
    environment: string;
  };
  healthCheck: {
    database: boolean;
    redis: boolean;
    server: boolean;
  };
  buildInfo?: {
    version: string;
    buildTime: string;
    gitCommit?: string;
    nodeVersion: string;
    environment: string;
  };
}

export interface DeploymentInfo {
  build: {
    version: string;
    buildTime: string;
    gitCommit: string;
    nodeVersion: string;
    environment: string;
  };
  system: {
    platform: string;
    arch: string;
    cpus: number;
    memory: {
      total: string;
      free: string;
    };
    uptime: string;
  };
  environment: {
    nodeEnv: string;
    port: string;
    dbHost: string;
    redisHost: string;
  };
}

export interface DeploymentHealthCheck {
  status: string;
  timestamp: string;
  service: string;
  health?: {
    database: boolean;
    redis: boolean;
    server: boolean;
  };
  system?: any;
}