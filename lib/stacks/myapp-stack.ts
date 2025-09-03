import * as route53 from "aws-cdk-lib/aws-route53";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as ecs_patterns from "aws-cdk-lib/aws-ecs-patterns";
import * as ecr from "aws-cdk-lib/aws-ecr";

export class MyAppStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, "MyAppVpc", { maxAzs: 2 });

    // ECS cluster
    const cluster = new ecs.Cluster(this, "MyAppCluster", { vpc });

    // Reference ECR repo created in PipelineStack
    const repo = ecr.Repository.fromRepositoryName(this, "NextJsRepo", "nextjs-app");

    // -------------------
    // Route53 hosted zone
    // -------------------
    const hostedZone = route53.HostedZone.fromLookup(this, "HostedZone", { domainName: "kxmercury.com" });

    // -------------------
    // ACM certificate
    // -------------------
    const certificate = new acm.Certificate(this, "Certificate", {
      domainName: "dmrv.kxmercury.com", // your subdomain
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });
    // Fargate service with ALB
    new ecs_patterns.ApplicationLoadBalancedFargateService(this, "MyAppService", {
      cluster,
      cpu: 512,
      memoryLimitMiB: 1024,
      desiredCount: 2,
      publicLoadBalancer: true,
      taskImageOptions: { image: ecs.ContainerImage.fromEcrRepository(repo, "latest"), containerPort: 3000 },
      certificate, // ACM certificate for HTTPS
      domainName: "dmrv.kxmercury.com", // Route53 subdomain
      domainZone: hostedZone,
      redirectHTTP: true, // auto redirect HTTP → HTTPS
    });
  }
}
