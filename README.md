# CDK Best Practice Questions

This is a project for CDK expert to review and optimize, I'm pretty new on this and lack of experience of best practice.

The goal of this cdk app is to manage cdk resources and deploy micro-services project from different source repos programmingly.

## Context

### I have learned these resources before asking questions

* <a href="https://github.com/aws-samples/aws-cdk-examples" target="_blank" >aws cdk example repo</a>
* <a href="https://docs.aws.amazon.com/cdk/v2/guide/home.html" target="_blank" >aws cdk official user guide</a>
* <a href="https://github.com/aws/aws-cdk/blob/main/packages/aws-cdk-lib/pipelines/README.md" target="_blank" >aws cdk lib repo readme file</a>


### Core files in my repo

```

lib/                                                                                                       
├── pipeline-cdk.ts                                                                                        
├── stacks                                                                                                 
│   └── myapp-stack.ts                                                                                     
└── stages                                                                                                 
    └── fullstack-stage.ts                                                                                 

```


## Questions

### 1.how to sperate the pipelines


as you can see, in my [pipeline-cdk](./lib/pipeline-cdk.ts), I have defined 2 repos, one `cdk repo for infrastructure`, and one repo for application code which is a `fullstack web app`. And my current approach is a very bad approach, because this pipeline use cdk repo as input source, so only cdk repo code updates could trigger the pipeline. however, in the real-world project, cdk repo rarely change, and application code changed often, we usually replace old ecr image with new image and deploy fullstack web app on ecs. So, I want to create 2 pipelines for cdk infrastructure and application each.


### 2.how to pass the run-time generated resource to other stacks

Suppose, we have already separate the pipelines. In theory, the cdk infrastructure pipeline should be managing all resources, including create/update/delete any aws services. Application pipeline should be managing ecr image replacement and deployment. I wonder how the `application pipeline` use variables or instances created by infrastructure pipeline. for example, infrastructure pipeline create vpc/alb/ecr/ecs, these instances or variables are necessary for application pipeline to implement deployment stage, more specifically:

* when application pipeline build the image, we need ecr instances created from infrastructure pipeline to push the image to.
* when application pipeline deploy the images to ecs, we need ecs created from infrastructure pipeline to deploy the image to.
* when application pipeline make the ecs tasks running, we need alb https address created from infrastructure pipeline.


### 3.how to create multiple stages for these two pipelines

Suppose, we have already properly pass the variables and instances created from infrastructure to appliction pipeline to 

## Feedback / Contact Information

### 1. direct code 
### 2. learning resource link 
### 3. schedule a meeting 
