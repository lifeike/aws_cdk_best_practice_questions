import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { MyAppStack } from "../stacks/myapp-stack";

export class MyAppStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    new MyAppStack(this, "MyAppStack", props);
  }
}

