# CDK Best Practice Questions

This is a project for CDK expert to review and optimize, I'm pretty new on this and lack of experience of best practice.

The goal of this cdk app is to manage cdk resources and deploy micro-services project from different source repos programmingly.

## Context

### I have learned these resources before asking questions

* <a href="https://github.com/aws-samples/aws-cdk-examples" target="_blank" rel="noopener noreferrer">aws cdk example repo</a>
* <a href="https://docs.aws.amazon.com/cdk/v2/guide/home.html" target="_blank" rel="noopener noreferrer">aws cdk official user guide</a>
* <a href="https://github.com/aws/aws-cdk/blob/main/packages/aws-cdk-lib/pipelines/README.md" target="_blank" rel="noopener noreferrer">aws cdk lib repo readme file</a>


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


as you can see, in my [pipeline-cdk](./lib/pipeline-cdk.ts), I have defined 

