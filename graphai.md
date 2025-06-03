# GraphAI Tutorial

## Hello World

[GraphAI](https://github.com/receptron/graphai) is an open source project, which allows non-programmers to build AI applications by describing data flows in a declarative language, GraphAI.

Here a simple example of GraphAI.

```YAML
version: 0.5
nodes:
  llm1:
    agent: openAIAgent
    params:
      model: gpt-4o
    inputs:
      prompt: Explain ML's transformer in 100 words.
    isResult: true
  llm2:
    agent: openAIAgent
    params:
      model: gpt-4o
    inputs:
      system: Provide a a 50 word summary of your input.
      prompt: :llm1.text
    isResult: true
```

It has two nodes:

1. **llm1**: This node is associated with "openAIAgent", which calls OpenAI's chat completion API. It takes "Explain ML's transformer in 100 words." as an input (the user prompt) and outputs the result from the chat completion API.
2. **llm2**: This node receives the output of the **llm2** node, as an input, and performs an additional LLM call to summarize tie 100 words down to 50.

Notice that **llm1** node will be executed immediately because all the inputs are available at the beginning, while **llm2** node will be executed when the data from **llm1** node becomes available. If `llm2` did not accept input from `llm1`, and instead had a `prompt` of `:userPrompt`, the two nodes would execute concurrently.

Because `isResult` is set to true from **llm1** and **llm2**, both will display to the console.

## Computed Node and Static Node

There are two types of nodes in GraphAI, _computed nodes_ and _static nodes_.

A computed node is associated with an _agent_, which performs a certain computation. Both nodes in the previous examples are _computed nodes_.

A _static nodes_ is a place holder of a value, just like a _variable_ in computer languages.

In our organization, it is convention that a single message is passed into the LLM workflow by using a static node called `userPrompt`. Entire chat histories (represented by an array of OpenAI-style messages with a `role` and `content`) are passed in through the `chatHistory` static node.

When creating a workflow that has a placeholder to accept user input in either of these forms, initialize an empty `userPrompt` and/or `chatHistory` node as follows.

```YAML
nodes:
  userPrompt:
    value: ""
  chatHistory:
    value: []
```

The example below performs a similar operation as the previous example, but uses one _static node_, **userPrompt**, which holds the value "Explain ML's transformer in 100 words".

```YAML
version: 0.5
nodes:
  userPrompt:
    value: Explain ML's transformer in 100 words.
  llm:
    agent: openAIAgent
    params:
      model: gpt-4o
    inputs:
      prompt: :userPrompt
  output:
    agent: copyAgent
    params:
      namedKey: text
    console:
      after: true
    inputs:
      text: :llm.text

```

## Loop / Mapping

The dataflow graph needs to be acyclic by design, but we added a few control flow mechanisms, such as loop, nesting, if/unless and mapping (of map-reduce). Note the syntax to access `:shift.item` inside a string.

### Loop

Here is a simple application, which uses **loop**.

```YAML
version: 0.5
loop:
  while: :fruits
nodes:
  fruits:
    value:
      - apple
      - lemon
      - banana
    update: :shift.array
  result:
    value: []
    update: :reducer.array
    isResult: true
  shift:
    agent: shiftAgent
    inputs:
      array: :fruits
  llm:
    agent: openAIAgent
    params:
      model: gpt-4o
    inputs:
      prompt: What is the typical color of ${:shift.item}? Just answer the color.
    isResult: true
  reducer:
    agent: pushAgent
    inputs:
      array: :result
      item: :llm.text

```

1. **fruits**: This static node holds the list of fruits at the beginning but updated with the array property of **shift** node after each iteration.
2. **result**: This static node starts with an empty array, but updated with the value of **reducer** node after each iteration.
3. **shift**: This node takes the first item from the value from **fruits** node, and output the remaining array and item as properties.
4. **llm**: This computed node generates a prompt using the template "What is the typical color of ${:shift.item}? Just answer the color." by applying the item property from the shift node's output. It then passes this prompt to gpt-4o to obtain the generated result.
5. **reducer**: This node pushes the content from the output of **llm** node to the value of **result** node.

Please notice that each item in the array will be processed sequentially. To process them concurrently, see the section below.

## Parallel Execution + S3 File Access

This example uses `s3FileAgent` to access images in S3. In this case, the images contain tabular data, and `mapAgent` is used to perform OCR in parallel for each image. The extracted tables from each image are combined into a single result.

Use `mapAgent` for processes which take a list as input, when the objective is to process all list items concurrently. Use a traditional loop for iterative processing.

```YAML
version: 0.5
nodes:
  imageData1:
    agent: s3FileAgent
    params:
      fileName: image input 1.jpg
      bucket: bp-authoring-files
      region: us-west-2
    inputs: {}
  imageData2:
    agent: s3FileAgent
    params:
      fileName: image input 2.jpg
      bucket: bp-authoring-files
      region: us-west-2
    inputs: {}
  imageData3:
    agent: s3FileAgent
    params:
      fileName: image input 3.jpg
      bucket: bp-authoring-files
      region: us-west-2
    inputs: {}
  imageExtractor:
    agent: mapAgent
    inputs:
      rows:
        - ":imageData1.imageData"
        - ":imageData2.imageData"
        - ":imageData3.imageData"
    params: {}
    graph:
      version: 0.5
      nodes:
        imageExtraction:
          agent: openAIAgent
          inputs:
            messages:
              - role: user
                content:
                  - type: image_url
                    image_url:
                      url: "${:row}"
            system: From the given image(s), extract the tabular data in a CSV format.
          console: true
        filterExtraction:
          agent: copyAgent
          inputs:
            text: ":imageExtraction.text"
          params:
            namedKey: text
          isResult: true
          console: true
  aggregateImageExtraction:
    agent: jsonParserAgent
    inputs:
      data: ":imageExtractor"
    console: true
  synthesizeLlm:
    agent: openAIAgent
    inputs:
      prompt: ":aggregateImageExtraction.text"
      system: From the given list, synthesize all tabular data into one or more tables
    isResult: true
    console: true
```

## Nested Workflows + Conditional Logic

### Nesting

A node can itself be a GraphAI workflow, which is executed through `nestedAgent`. The following example uses `fetchAgent` to pull documentation from the given URLs, then generates a GraphAI workflow, which is executed through the use of `nestedAgent`.

### Conditional logic

Computed nodes can execute upon a condition being met using `if`/`unless` syntax and `compareAgent`. In this example, the `fetchAPI` node returns `True` if the user is asking a question that may require external APIs (like the current weather), otherwise `False` if it can be answered with general knowledge. The `checkAPICallNeeded` node evaluates to `True` if the `fetchAPI.text` value is not `False`. Nodes can now use `if`/`unless` syntax to conditionally execute based off of this evaluation.

````YAML
version: 0.5
nodes:
  userPrompt:
    value: ""

  llmEngine:
    value: "openAIAgent"

  fetchAPI:
    agent: ":llmEngine"
    inputs:
      prompt: ":userPrompt"
      system: >-
        You are capable of either returning True or False. Return True if the user is asking for information which would require external knowledge, and False otherwise.

  checkAPICallNeeded:
    agent: compareAgent
    inputs:
      array: [":fetchAPI.text", "!=", "False"]

  conversationLLM:
    agent: ":llmEngine"
    inputs:
      system: You are a helpful chat assistant.
      prompt: ":userPrompt"
    unless: ":checkAPICallNeeded.result"
    isResult: true

  document:
    agent: fetchAgent
    console:
      before: "...fetching document"
    params:
      type: text
    inputs:
      url: https://raw.githubusercontent.com/receptron/graphai/main/packages/graphai/README.md

  sampleGraph:
    agent: fetchAgent
    params:
      type: text
    inputs:
      url: https://raw.githubusercontent.com/receptron/graphai/refs/heads/main/packages/samples/src/net/weather.ts

  graphGenerator:
    agent: ":llmEngine"
    if: ":checkAPICallNeeded.result"
    inputs:
      prompt: ":userPrompt"
      system:
        - >-
          You an expert in GraphAI programming. You are responsible in generating a graphAI graph to answer the user question. Always store the results in a node called 'output', with isResult set to true.
        - "graphAI graph outputs in json format"
        - "[documentation of GraphAI]\n${:document}"
        - "[sample graph]\n```json\n${:sampleGraph}\n```"
        - "For weather, directly input the latitude/longitude into the GraphAI graph you write"
    params:
      temperature: 0
    isResult: true

  execute:
    if: ":checkAPICallNeeded.result"
    agent: nestedAgent
    graph: ":graphGenerator.text.codeBlock().jsonParse()"

  summarize:
    agent: ":llmEngine"
    if: ":checkAPICallNeeded.result"
    inputs:
      prompt: ":userPrompt"
      system:
        - "Output to summarize:\n\n"
        - ":execute.output"
        - "Instructions\n\n"
        - "Succinctly summarize the data you've received to answer the user question in the chat history."
    isResult: true
```
````
