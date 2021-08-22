module.exports = {
    schema: `
         input CreateInput {
            name: String
        }
        
        input CompleteInput {
            pk: String
            sk: String
            status: String
        }

        type Query {
            processes: [String]
        
        }
        type Mutation {
            startProcess(input: CreateInput): String
            completeProcess(input: CompleteInput): String
            @aws_iam 
        }

        type Subscription {
            processSubscription: String
            @aws_subscribe(mutations: ["completeProcess"])
        }
    `,
    resolvers: {
        Query: {
            processes: [
                {
                    type: 'add',
                    pk: 'process',
                    sk: 'process_'
                },
                {
                    type: 'db',
                    action: 'list'
                }
            ]
        },
        Mutation: {
            startProcess: [
                {
                    type: 'add',
                    pk: 'process',
                    sk: 'process_@id',
                    status: 'started'
                },
                {
                    type: 'db',
                    action: 'set'
                },
                {
                    type: 'emit-event',
                    event: 'startProcess',
                    data: {
                        pk: '#pk',
                        sk: '#sk',
                        status: '#status'
                    }
                }
            ],

            completeProcess: [
                {
                    type: 'add',
                    pk: '$pk',
                    sk: '$sk',
                    status: '$status'
                },
                {
                    type: 'db',
                    action: 'set'
                }
            ]
        },

        Events: {
            processCompleted: [
                {
                    type: 'receive-event',
                    source: 'accounting',
                    event: 'processCompleted',
                    query: `
                        mutation completeProcess($input: CompleteInput) {
                            completeProcess(input: $input)
                        }
                    `,
                    variables: {
                        pk: 'detail.pk',
                        sk: 'detail.sk',
                        status: 'detail.status'
                    }
                }
            ]
        }
    },
    config: {
        name: 'risecustomlogicapi',
        eventBus: 'default'
    }
}
