import { devtools, proxyWithComputed } from 'valtio/utils';

export interface Todo {
  id: number;
  text: string;
  completed?: boolean;
}

type Filter = 'all' | 'todo' | 'done';

export const store = proxyWithComputed<
  { filter: Filter; todos: Todo[] },
  { filteredTodoList: Todo[] }
>(
  {
    filter: 'all',
    todos: [],
  },
  {
    filteredTodoList: (snap) => {
      // ⬅️ 试一试，这里是有完备的数据类型的
      switch (snap.filter) {
        case 'all':
          return Array.from(snap.todos);
        case 'done':
          return Array.from(snap.todos).filter((todo) => todo.completed);
        case 'todo':
          return Array.from(snap.todos).filter((todo) => !todo.completed);
        default:
          throw Error('Error: unSupported filter');
      }
    },
  },
);

devtools(store, { name: 'state name', enabled: true });

export const addTodo = async (text: string) => {
  await new Promise((r) => {
    setTimeout(() => r(1), 1000);
  });
  store.todos.push({
    id: +new Date(),
    text,
    completed: false,
  });
};

export const removeTodo = (index: number) => {
  store.todos.splice(index, 1);
};

export const toggleTodo = (index: number, completed: boolean) => {
  store.todos[index].completed = !completed;
};

export const changeFilter = (filter: Filter) => {
  store.filter = filter;
};
