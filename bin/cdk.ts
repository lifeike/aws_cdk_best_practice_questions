#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { PipelineStack } from "../lib/pipeline-cdk";

const app = new cdk.App();
const cdkPipeline = new PipelineStack(app, "dmrv-cdk-pipeline", { env: { account: "672368182217", region: "us-east-1" } });
