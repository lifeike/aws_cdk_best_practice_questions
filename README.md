# CDK Best Practice Questions

This is a project for CDK expert to review and optimize, I'm pretty new on this and lack of experience of best practice.

The goal of this cdk app is to manage cdk resources and deploy micro-services project from different source repos programmingly.

## Context

### I have learned these resources before asking questions

* <a href="https://github.com/aws-samples/aws-cdk-examples" target="_blank" >aws cdk example repo</a>
* <a href="https://docs.aws.amazon.com/cdk/v2/guide/home.html" target="_blank" >aws cdk official user guide</a>
* <a href="https://github.com/aws/aws-cdk/blob/main/packages/aws-cdk-lib/pipelines/README.md" target="_blank" >aws cdk lib repo readme file</a>


### Core files in my repo

I have already removed uncessary files from this repo to demo the core feature I want to implement in this repo. Tried my best to simplify the code structure for faster reveiw.

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

Suppose, we have already properly pass the variables and instances created from infrastructure to appliction pipeline to implement fullstack web app on ecs successfully. There is one more challenge that how we pass the variables from infrastructure staging stage to application staging stage. Also, properly pass the variables created in infrastructure production stage to application pipeline production stage so that each stage has clear isolation.

### 4.how to implement micro-services structure in this cdk app

In this demo repo, I have only 2 input resources for demo purpose, one cdk repo and one fullstack application repo. In the future, I will need to add some other services. for example, another backend service for analytics/logging/authentication service specifically. In this case, how do we add more services into this cdk infrastructure. By reusing the ecs instances from infrastructure ?    

## Feedback / Contact Information

I've been stuck on this technical issue for three months. Any help would be strongly appreciated. You can provide help by:

* 1. schedule a meeting with me at any time, I'm available at any time as long as I can solve these technical challenges. Email: `lifeike67@gmail.com` 
* 2. direct code PR in this repo
* 3. provide some learning resource links or git demo repos which could solve the questions in the readme file.  
