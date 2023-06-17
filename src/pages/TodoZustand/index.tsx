import { Button, Input, List, Radio, Typography } from 'antd';
import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { cloneDeep } from 'lodash';
import { create } from 'zustand';

const { Title, Text } = Typography;

export interface Todo {
  id: number;
  text: string;
  completed?: boolean;
}

type TFilter = 'all' | 'todo' | 'done';

interface TodoState {
  filter: TFilter;
  todos: Todo[];
}

const useStore = create<
  TodoState & {
    addTodo: (text: string) => void;
    removeTodo: (index: number) => void;
    toggleTodo: (index: number, completed: boolean) => void;
    changeFilter: (filter: TFilter) => void;
  }
>((set) => ({
  filter: 'all',
  todos: [],

  addTodo: async (text) => {
    await new Promise((r) => {
      setTimeout(() => r(1), 1000);
    });
    set((state) => {
      const todos = cloneDeep(state.todos);
      todos.push({
        id: +new Date(),
        text,
        completed: false,
      });
      return {
        ...state,
        todos,
      };
    });
  },
  removeTodo: (index) =>
    set((state) => {
      const todos = cloneDeep(state.todos);
      todos.splice(index, 1);
      return {
        ...state,
        todos,
      };
    }),
  toggleTodo: (index, completed) =>
    set((state) => {
      const todos = cloneDeep(state.todos);
      todos[index].completed = !completed;
      return {
        ...state,
        todos,
      };
    }),
  changeFilter: (filter) => set((state) => ({ ...state, filter })),
}));

const Filter = React.memo(() => {
  const filter = useStore((state) => state.filter);
  const changeFilter = useStore((state) => state.changeFilter);
  return (
    <Radio.Group
      value={filter}
      style={{ marginTop: 24 }}
      onChange={(e) => changeFilter(e.target.value)}
    >
      <Radio value="all">all</Radio>
      <Radio value="todo">todo</Radio>
      <Radio value="done">done</Radio>
    </Radio.Group>
  );
});

const TodoListItem = React.memo(
  ({ completed, text, index }: Todo & { index: number }) => {
    const removeTodo = useStore((state) => state.removeTodo);
    const toggleTodo = useStore((state) => state.toggleTodo);
    return (
      <List.Item>
        <Text
          disabled={completed}
          onClick={() => {
            toggleTodo(index, completed ?? false);
          }}
        >
          {text}
        </Text>
        <Button
          danger
          size="small"
          onClick={() => {
            removeTodo(index);
          }}
        >
          删除
        </Button>
      </List.Item>
    );
  },
);

const TodoList = React.memo(() => {
  const filter = useStore((state) => state.filter);
  const storeTodos = useStore((state) => state.todos);
  let todos = [];

  switch (filter) {
    case 'all':
      todos = storeTodos;
      break;
    case 'done':
      todos = storeTodos.filter((todo) => todo.completed);
      break;
    case 'todo':
      todos = storeTodos.filter((todo) => !todo.completed);
      break;
  }

  return (
    <List
      bordered
      dataSource={todos}
      renderItem={(item: any, index) => (
        <TodoListItem key={item.id} {...item} index={index} />
      )}
      style={{ marginTop: 8 }}
    />
  );
});

export default () => {
  const [text, setText] = useState('');
  const addTodo = useStore((state) => state.addTodo);

  return (
    <PageContainer ghost style={{ width: 480, margin: 'auto' }}>
      <Title level={5}>What do you want to do today?</Title>
      <Input
        value={text}
        placeholder="please input"
        onChange={(e) => setText(e.target.value)}
        onPressEnter={() => {
          addTodo(text);
          setText('');
        }}
      />
      <Filter />
      <TodoList />
    </PageContainer>
  );
};
