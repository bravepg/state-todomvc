import { PageContainer } from '@ant-design/pro-components';
import { Button, Input, List, Radio, Typography } from 'antd';
import { cloneDeep, findIndex } from 'lodash';
import React, { useContext, useReducer, useState } from 'react';

const { Title, Text } = Typography;

type TFilter = 'all' | 'todo' | 'done';

export interface Todo {
  id: number;
  text: string;
  completed?: boolean;
}

type TTodoContext = {
  store: { filter: TFilter; todos: Todo[] };
  dispatch: React.Dispatch<ToDoAction>;
};

const TodoContext = React.createContext<TTodoContext>({
  store: { filter: 'all', todos: [] },
  dispatch: () => {},
});

const Filter = React.memo(() => {
  const { store, dispatch } = useContext(TodoContext);
  return (
    <Radio.Group
      value={store.filter}
      style={{ marginTop: 24 }}
      onChange={(e) =>
        dispatch({ type: 'filter', payload: { filter: e.target.value } })
      }
    >
      <Radio value="all">all</Radio>
      <Radio value="todo">todo</Radio>
      <Radio value="done">done</Radio>
    </Radio.Group>
  );
});

const TodoListItem = React.memo(
  ({ completed, text, index }: Todo & { index: number }) => {
    const { store, dispatch } = useContext(TodoContext);
    // 底层组件也感知到 store 和 setStore 不太优雅
    // 业务逻辑分散在视图组件里
    // 可以使用 useReducer 来解决
    return (
      <List.Item>
        <Text
          disabled={completed}
          onClick={() => {
            dispatch({ type: 'toggle', payload: store.todos[index] });
          }}
        >
          {text}
        </Text>
        <Button
          danger
          size="small"
          onClick={() => {
            dispatch({ type: 'remove', payload: store.todos[index] });
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

type ToDoAction =
  | {
      type: 'add' | 'remove' | 'toggle';
      payload: Todo;
    }
  | { type: 'filter'; payload: { filter: TFilter } };

interface TodoState {
  filter: TFilter;
  todos: Todo[];
}

function todoReducer(state: TodoState, action: ToDoAction) {
  switch (action.type) {
    case 'filter': {
      return { ...state, filter: action.payload.filter };
    }

    case 'add': {
      const newTodos = state.todos.concat(action.payload);

      return { ...state, todos: newTodos };
    }

    case 'remove': {
      const index = findIndex(state.todos, { id: action.payload.id });

      const newTodos = cloneDeep(state.todos);
      newTodos.splice(index, 1);

      return { ...state, todos: newTodos };
    }

    case 'toggle': {
      const newTodos = state.todos.map((item) => {
        if (item.id === action.payload.id) {
          return {
            ...item,
            completed: !item.completed,
          };
        }
        return item;
      });

      return { ...state, todos: newTodos };
    }

    default:
      return state;
  }
}

export default () => {
  const [text, setText] = useState('');
  const [store, dispatch] = useReducer(todoReducer, {
    filter: 'all',
    todos: [],
  });

  return (
    <PageContainer ghost style={{ width: 480, margin: 'auto' }}>
      <TodoContext.Provider value={{ store, dispatch }}>
        <Title level={5}>What do you want to do today?</Title>
        <Input
          value={text}
          placeholder="please input"
          onChange={(e) => setText(e.target.value)}
          onPressEnter={async () => {
            await new Promise((r) => {
              setTimeout(() => r(1), 1000);
            });
            dispatch({
              type: 'add',
              payload: {
                id: +new Date(),
                text,
                completed: false,
              },
            });
            setText('');
          }}
        />
        <Filter />
        <TodoList />
      </TodoContext.Provider>
    </PageContainer>
  );
};
