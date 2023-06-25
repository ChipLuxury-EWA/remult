# Backend Methods

Backend methods run on the backend, and are used to improve performance, run server only code (like send mail), or to perform operations that are not accessible through the api.
::: danger
Backend methods are not subject to the entity's api restrictions, meaning that an entity that has allowApiUpdate=false, can be updated through code that runs in a `BackendMethod`.
The rule is, if the user can run the `BackendMethod` using its `allowed` option, the operations in it are considered allowed and if they should be restricted, it is up to the developer to restrict them.
:::

There are three different kinds of backend methods

1. static backend method
2. entity backend method
3. controller backend method

## static backend method

A static backend method, is the simplest kind, it will send its parameters to the `back-end`, and will return its result to the `front-end`.
Here's an example of a backend method.

```ts
import { BackendMethod, remult } from "remult"
import { Task } from "./Task"

export class TasksController {
  @BackendMethod({ allowed: true })
  static async setAll(completed: boolean) {
    const taskRepo = remult.repo(Task)

    for (const task of await taskRepo.find()) {
      await taskRepo.save({ ...task, completed })
    }
  }
}
```

- Note that the `BackendMethod` will "inject" the `Remult` optional object.
  ::: tip
  when using the `remult` object, typescript may warn you that it might be undefined, use the `!` sign to let it know that it's ok.

```ts
remult!.repo
```

:::

Remember to register the `TasksController` class in the `controllers` array of the `remultExpress` options.

```ts{3}
export const api = remultExpress({
  entities: [Task],
  controllers: [TasksController]
})
```

usage example:

```ts
await TasksController.setAll(true)
```

### Deno and other run-times that do not support AsyncLocalStorage

The `remult` object imported from the `remult` package relies on `AsyncLocalStorage` to provide you with the relevant `remult` instance for the relevant request.

For servers that do not support that, we can send `remult` as an optional parameter to the backend method, and it'll be injected by the `BackendMethod`.

Here's an example of a backend method with injected remult.

```ts{6-7}
import { BackendMethod, Remult } from "remult"
import { Task } from "./Task"

export class TasksController {
  @BackendMethod({ allowed: true })
  static async setAll(completed: boolean, remult?: Remult) {
    const taskRepo = remult!.repo(Task)

    for (const task of await taskRepo.find()) {
      await taskRepo.save({ ...task, completed })
    }
  }
}
```

- Note that the `BackendMethod` will "inject" the `Remult` optional object.
- use the `!` sign to let typescript know that remult will be injected.

```ts
remult!.repo
```

:::

## Entity backend method

An Entity backend method will send all the entity fields back and forth to the server, including values that were not saved yet.
It can be used to do Entity related operations.

Here's an example:

```ts{9-17}
@Entity("tasks", {
  allowApiCrud: true
})
export class Task extends IdEntity {
  @Fields.string()
  title = ""
  @Fields.boolean()
  completed = false
  @BackendMethod({ allowed: true })
  async toggleCompleted() {
    this.completed = !this.completed
    console.log({
      title: this.title,
      titleOriginalValue: this.$.title.originalValue
    })
    await this.save()
  }
}
```

- If the entity has a constructor, that receives `Remult` it'll be automatically injected
- Note that it doesn't have the `static` keyword which the static backend method has.

Usage example:

```ts
const task = await remult.repo(Task).findFirst()
await task.toggleCompleted()
```

## Controller backend method

A Controller is a class that once one of its backend method is called, will save its field values and send them back and forth between the `front-end` and the `back-end`

```ts
import { BackendMethod, Controller, Field, remult } from "remult"
import { Task } from "./Task"

@Controller("SetTaskCompletedController")
export class SetTaskCompletedController {
  constructor() {}
  @Fields.boolean()
  completed = false
  @BackendMethod({ allowed: true })
  async updateCompleted() {
    for await (const task of this.remult.repo(Task).query()) {
      task.completed = this.completed
      await task.save()
    }
  }
}
```

Once the `updateCompleted` method is called, all the `controller`'s field values will be sent to the `backend` and it can use them. Once the method completes, all the field values will return to the browser.



Usage example:

```ts
const set = new SetTaskCompletedController()
set.completed = true
await set.updateCompleted()
```
