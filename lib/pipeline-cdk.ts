import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as pipelines from "aws-cdk-lib/pipelines";
import * as codecommit from "aws-cdk-lib/aws-codecommit";
import { MyAppStage } from "./stages/fullstack-stage";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ecr from "aws-cdk-lib/aws-ecr";

export class PipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Repo A: Infra/CDK
    const infraRepo = codecommit.Repository.fromRepositoryName(this, "InfraRepo", "dmrv-cdk");
    const infraSource = pipelines.CodePipelineSource.codeCommit(infraRepo, "main");

    // Repo B: Application code
    const appRepo = codecommit.Repository.fromRepositoryName(this, "AppRepo", "dmrv");
    const appSource = pipelines.CodePipelineSource.codeCommit(appRepo, "main");

    // ECR repository for Next.js image
    const repo = new ecr.Repository(this, "NextJsRepo", {
      repositoryName: "nextjs-app",
      removalPolicy: cdk.RemovalPolicy.DESTROY, // ⚠️ dev/demo only
    });

    // Synth step (infra repo only)
    const synth = new pipelines.ShellStep("Synth", {
      input: infraSource,
      installCommands: ["npm install -g aws-cdk"],
      commands: ["npm ci", "npx cdk synth --output cdk.out"],
      primaryOutputDirectory: "cdk.out",
      // let pipeline know we also depend on appSource
      additionalInputs: { app: appSource },
    });

    const pipeline = new pipelines.CodePipeline(this, "Pipeline", { pipelineName: "dmrv-cdk-pipeline", synth, crossAccountKeys: false });

    // Deploy stage (App infra with ECS + ALB)
    const devStage = new MyAppStage(this, "Dev", {
      env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
    });
    pipeline.addStage(devStage, {
      pre: [
        new pipelines.CodeBuildStep("BuildAndPushImage", {
          input: appSource,
          commands: [
            "export ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)",
            "aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com",
            "docker build -t nextjs-app ./",
            "docker tag nextjs-app:latest $ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/nextjs-app:latest",
            "docker push $ACCOUNT_ID.dkr.ecr.$AWS_DEFAULT_REGION.amazonaws.com/nextjs-app:latest",
          ],
          rolePolicyStatements: [
            new iam.PolicyStatement({
              actions: ["ecr:GetAuthorizationToken", "ecr:BatchCheckLayerAvailability", "ecr:CompleteLayerUpload", "ecr:InitiateLayerUpload", "ecr:PutImage", "ecr:UploadLayerPart"],
              resources: ["*"],
            }),
          ],
        }),
      ],
    });
  }
}
