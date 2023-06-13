# Paging, Sorting and Filtering

The RESTful API created by Remult supports **server-side paging, sorting, and filtering**. Let's use that to limit, sort and filter the list of tasks.

## Limit Number of Fetched Tasks

Since our database may eventually contain a lot of tasks, it make sense to use a **paging strategy** to limit the number of tasks retrieved in a single fetch from the back-end database.

Let's limit the number of fetched tasks to `20`.

In the `ngOnInit` method, pass an `options` argument to the `find` method call and set its `limit` property to 20.

```ts{5}
// src/app/todo/todo.component.ts

ngOnInit() {
  this.taskRepo.find({
    limit: 20
  }).then((items) => (this.tasks = items));
}
```

There aren't enough tasks in the database for this change to have an immediate effect, but it will have one later on when we'll add more tasks.

::: tip
To query subsequent pages, use the [Repository.find()](../../docs/ref_repository.md#find) method's `page` option.
:::

## Sorting By Creation Date

We would like old tasks to appear first in the list, and new tasks to appear last. Let's sort the tasks by their `createdAt` field.

In the `ngOnInit` method, set the `orderBy` property of the `find` method call's `option` argument to an object that contains the fields you want to sort by.
Use "asc" and "desc" to determine the sort order.

```ts{6}
// src/app/todo/todo.component.ts

ngOnInit() {
  this.taskRepo.find({
    limit: 20,
    orderBy: { createdAt:"asc" }
  }).then((items) => (this.tasks = items));
}
```

::: warning Note
By default, `false` is a "lower" value than `true`, and that's why uncompleted tasks are now showing at the top of the task list.
:::

## Server side Filtering

Remult supports sending filter rules to the server to query only the tasks that we need.

Adjust the `ngOnInit` method to fetch only `completed` tasks.

```ts{7}
// src/app/todo/todo.component.ts

ngOnInit() {
  this.taskRepo.find({
    limit: 20,
    orderBy: { createdAt:"asc" },
    where: { completed: true }
  }).then((items) => (this.tasks = items));
}
```

::: warning Note
Because the `completed` field is of type `boolean`, the argument is **compile-time checked to be of the `boolean` type**. Settings the `completed` filter to `undefined` causes it to be ignored by Remult.
:::

Play with different filtering values, and eventually comment it out, since we do need all the tasks

```ts{5}
ngOnInit() {
  this.taskRepo.find({
    limit: 20,
    orderBy: { createdAt:"asc" },
    //where: { completed: true }
  }).then((items) => (this.tasks = items));
}
```

::: tip Learn more
Explore the reference for a [comprehensive list of filtering options](../../docs/entityFilter.md).
:::
