import { PageContainer } from '@ant-design/pro-components';
import { Button, Input, List, Radio, Typography } from 'antd';
import { cloneDeep } from 'lodash';
import React, { useContext, useState } from 'react';

const { Title, Text } = Typography;

type TFilter = 'all' | 'todo' | 'done';

export interface Todo {
  id: number;
  text: string;
  completed?: boolean;
}

type TTodoContext = {
  store: { filter: TFilter; todos: Todo[] };
  setStore: React.Dispatch<
    React.SetStateAction<{
      filter: TFilter;
      todos: Todo[];
    }>
  >;
};

const TodoContext = React.createContext<TTodoContext>({
  store: { filter: 'all', todos: [] },
  setStore: () => {},
});

const Filter = React.memo(() => {
  const { store, setStore } = useContext(TodoContext);
  return (
    <Radio.Group
      value={store.filter}
      style={{ marginTop: 24 }}
      onChange={(e) => setStore({ ...store, filter: e.target.value })}
    >
      <Radio value="all">all</Radio>
      <Radio value="todo">todo</Radio>
      <Radio value="done">done</Radio>
    </Radio.Group>
  );
});

const TodoListItem = React.memo(
  ({ completed, text, index }: Todo & { index: number }) => {
    const { store, setStore } = useContext(TodoContext);
    // 底层组件也感知到 store 和 setStore 不太优雅
    // 业务逻辑分散在视图组件里
    // 可以使用 useReducer 来解决
    return (
      <List.Item>
        <Text
          disabled={completed}
          onClick={() => {
            const todos = cloneDeep(store.todos);
            todos[index].completed = !completed;
            setStore({ ...store, todos });
          }}
        >
          {text}
        </Text>
        <Button
          danger
          size="small"
          onClick={() => {
            const todos = cloneDeep(store.todos);
            todos.splice(index, 1);
            setStore({ ...store, todos });
          }}
        >
          删除
        </Button>
      </List.Item>
    );
  },
);

const TodoList = React.memo(() => {
  const { store } = useContext(TodoContext);
  let todos = [];

  switch (store.filter) {
    case 'all':
      todos = store.todos;
      break;
    case 'done':
      todos = store.todos.filter((todo) => todo.completed);
      break;
    case 'todo':
      todos = store.todos.filter((todo) => !todo.completed);
      break;
  }

  return (
    <List
      bordered
      dataSource={todos}
      renderItem={(item, index) => (
        <TodoListItem key={item.id} {...item} index={index} />
      )}
      style={{ marginTop: 8 }}
    />
  );
});

export default () => {
  const [text, setText] = useState('');
  const [store, setStore] = useState<{ filter: TFilter; todos: Todo[] }>({
    filter: 'all',
    todos: [],
  });

  return (
    <PageContainer ghost style={{ width: 480, margin: 'auto' }}>
      <TodoContext.Provider value={{ store, setStore }}>
        <Title level={5}>What do you want to do today?</Title>
        <Input
          value={text}
          placeholder="please input"
          onChange={(e) => setText(e.target.value)}
          onPressEnter={async () => {
            await new Promise((r) => {
              setTimeout(() => r(1), 1000);
            });
            const todos = cloneDeep(store.todos);
            todos.push({
              id: +new Date(),
              text,
              completed: false,
            });
            setStore({ ...store, todos });
            setText('');
          }}
        />
        <Filter />
        <TodoList />
      </TodoContext.Provider>
    </PageContainer>
  );
};
