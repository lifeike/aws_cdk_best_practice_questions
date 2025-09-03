import { Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as codecommit from "aws-cdk-lib/aws-codecommit";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as codepipeline_actions from "aws-cdk-lib/aws-codepipeline-actions";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as s3 from "aws-cdk-lib/aws-s3";

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // S3 bucket for pipeline artifacts
    const artifactBucket = new s3.Bucket(this, "PipelineArtifactsBucket", {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const pipeline = new codepipeline.Pipeline(this, "dmrv-pipeline-construct", {
      pipelineName: "dmrv",
      artifactBucket: artifactBucket,
    });

    // ECR repo
    const ecrRepo = new ecr.Repository(this, "dmrv-ecr-repo", {
      repositoryName: "dmrv",
      removalPolicy: RemovalPolicy.DESTROY,
      emptyOnDelete: true,
    });

    // -------------------
    // CDK source
    // -------------------
    const cdkSourceOutput = new codepipeline.Artifact();
    const cdkSourceAction = new codepipeline_actions.CodeCommitSourceAction({
      actionName: "CDK_Source",
      repository: codecommit.Repository.fromRepositoryName(this, "dmrv-cdk-codecommit-repo", "dmrv-cdk"),
      output: cdkSourceOutput,
      trigger: codepipeline_actions.CodeCommitTrigger.EVENTS, // Use EVENTS for event-based change detection
    });

    // -------------------
    // Frontend source
    // -------------------
    const frontendSourceOutput = new codepipeline.Artifact();
    const frontendSourceAction = new codepipeline_actions.CodeCommitSourceAction({
      actionName: "Frontend_Source",
      repository: codecommit.Repository.fromRepositoryName(this, "dmrv-codecommit-repo", "dmrv"),
      output: frontendSourceOutput,
      trigger: codepipeline_actions.CodeCommitTrigger.EVENTS, // Use EVENTS for event-based change detection
    });

    // ----------------------------------
    // Build CDK
    // ----------------------------------
    const cdkBuildProject = new codebuild.PipelineProject(this, "CdkBuild", {
      environment: { buildImage: codebuild.LinuxBuildImage.STANDARD_7_0 },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          install: { commands: ["npm install -g aws-cdk", "npm ci"] },
          build: { commands: ["npm run build", "npx cdk synth"] },
        },
      }),
    });

    const cdkBuildAction = new codepipeline_actions.CodeBuildAction({
      actionName: "Build_CDK",
      project: cdkBuildProject,
      input: cdkSourceOutput,
      outputs: [new codepipeline.Artifact("CdkBuildOutput")],
    });

    // -------------------
    // Build Frontend
    // -------------------
    const frontendBuildProject = new codebuild.PipelineProject(this, "dmrv-build-app", {
      environment: { buildImage: codebuild.LinuxBuildImage.STANDARD_7_0, privileged: true },
      environmentVariables: {
        ECR_REPO_URI: { value: ecrRepo.repositoryUri },
        AWS_ACCOUNT_ID: { value: Stack.of(this).account },
        AWS_DEFAULT_REGION: { value: Stack.of(this).region },
      },
      buildSpec: codebuild.BuildSpec.fromObject({
        version: "0.2",
        phases: {
          pre_build: {
            commands: [
              "echo Logging in to Amazon ECR...",
              "aws --version",
              "ECR_REGISTRY=$(echo $ECR_REPO_URI | cut -d'/' -f1)",
              "aws ecr get-login-password --region $AWS_DEFAULT_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY",
            ],
          },
          build: {
            commands: ["echo Build started on `date`", "docker build -t $ECR_REPO_URI:latest .", "docker push $ECR_REPO_URI:latest"],
          },
          post_build: {
            commands: ["echo Build completed on `date`", 'printf \'[{"name":"dmrv","imageUri":"%s"}]\' $ECR_REPO_URI:latest > imagedefinitions.json', "cat imagedefinitions.json"],
          },
        },
        artifacts: { files: ["imagedefinitions.json"] },
      }),
    });

    const frontendBuildAction = new codepipeline_actions.CodeBuildAction({
      actionName: "Build_Frontend",
      project: frontendBuildProject,
      input: frontendSourceOutput,
      outputs: [new codepipeline.Artifact("FrontendBuildOutput")],
    });

    // Grant permissions
    ecrRepo.grantPullPush(frontendBuildProject);
    frontendBuildProject.addToRolePolicy(new iam.PolicyStatement({ actions: ["ecr:GetAuthorizationToken"], resources: ["*"] }));

    // CDK source → build
    pipeline.addStage({ stageName: "Source", actions: [cdkSourceAction, frontendSourceAction] });
    // Frontend source → build
    pipeline.addStage({ stageName: "Build_CDK", actions: [cdkBuildAction] });
    pipeline.addStage({ stageName: "Build_Frontend", actions: [frontendBuildAction] });
  }
}
