import { Button, Input, List, Radio, Typography } from 'antd';
import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { cloneDeep } from 'lodash';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';

const { Title, Text } = Typography;

type TFilter = 'all' | 'todo' | 'done';

class Todo {
  id = +new Date();
  text = '';
  completed = false;

  constructor(text: string) {
    this.text = text;
  }
}

class TodoState {
  filter: TFilter = 'all';
  todos: Todo[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  async addTodo(text: string) {
    await new Promise((r) => {
      setTimeout(() => r(1), 1000);
    });
    const todos = cloneDeep(this.todos);
    todos.push(new Todo(text));
    this.todos = todos;
  }

  removeTodo(index: number) {
    const todos = cloneDeep(this.todos);
    todos.splice(index, 1);
    this.todos = todos;
  }

  toggleTodo(index: number, completed: boolean) {
    const todos = cloneDeep(this.todos);
    todos[index].completed = !completed;
    this.todos = todos;
  }

  changeFilter(filter: TFilter) {
    this.filter = filter;
  }
}

const state = new TodoState();

const Filter = observer(() => {
  return (
    <Radio.Group
      value={state.filter}
      style={{ marginTop: 24 }}
      onChange={(e) => state.changeFilter(e.target.value)}
    >
      <Radio value="all">all</Radio>
      <Radio value="todo">todo</Radio>
      <Radio value="done">done</Radio>
    </Radio.Group>
  );
});

const TodoListItem = observer(
  ({ completed, text, index }: Todo & { index: number }) => {
    return (
      <List.Item>
        <Text
          disabled={completed}
          onClick={() => {
            state.toggleTodo(index, completed);
          }}
        >
          {text}
        </Text>
        <Button
          danger
          size="small"
          onClick={() => {
            state.removeTodo(index);
          }}
        >
          删除
        </Button>
      </List.Item>
    );
  },
);

const TodoList: React.FC = observer(() => {
  const filter = state.filter;
  const storeTodos = state.todos;
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
      renderItem={(item, index) => (
        <TodoListItem key={item.id} {...item} index={index} />
      )}
      style={{ marginTop: 8 }}
    />
  );
});

export default () => {
  const [text, setText] = useState('');
  return (
    <PageContainer ghost style={{ width: 480, margin: 'auto' }}>
      <Title level={5}>What do you want to do today?</Title>
      <Input
        value={text}
        placeholder="please input"
        onChange={(e) => setText(e.target.value)}
        onPressEnter={() => {
          state.addTodo(text);
          setText('');
        }}
      />
      <Filter />
      <TodoList />
    </PageContainer>
  );
};
