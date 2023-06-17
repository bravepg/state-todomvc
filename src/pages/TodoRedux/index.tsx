import { PageContainer } from '@ant-design/pro-components';
import { Button, Input, List, Radio, Typography } from 'antd';
import { cloneDeep, findIndex } from 'lodash';
import React, { useState } from 'react';
import { Provider, connect } from 'react-redux';
import { applyMiddleware, createStore } from 'redux';
import thunk from 'redux-thunk';

const { Title, Text } = Typography;

type TFilter = 'all' | 'todo' | 'done';

export interface Todo {
  id: number;
  text: string;
  completed?: boolean;
}

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

// state 不加默认值会报 ts 异常
function todoReducer(
  state: TodoState = {
    filter: 'all',
    todos: [],
  },
  action: ToDoAction,
) {
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

const store = createStore(todoReducer, applyMiddleware(thunk));

const Filter = React.memo(
  connect((store: TodoState) => ({ filter: store.filter }))((props: any) => {
    return (
      <Radio.Group
        value={props.filter}
        style={{ marginTop: 24 }}
        onChange={(e) =>
          props.dispatch({
            type: 'filter',
            payload: { filter: e.target.value },
          })
        }
      >
        <Radio value="all">all</Radio>
        <Radio value="todo">todo</Radio>
        <Radio value="done">done</Radio>
      </Radio.Group>
    );
  }),
);

const TodoListItem = React.memo(
  connect((store: TodoState) => ({ todos: store.todos }))((props: any) => {
    const { completed, text, index } = props;
    return (
      <List.Item>
        <Text
          disabled={completed}
          onClick={() => {
            props.dispatch({ type: 'toggle', payload: props.todos[index] });
          }}
        >
          {text}
        </Text>
        <Button
          danger
          size="small"
          onClick={() => {
            props.dispatch({ type: 'remove', payload: props.todos[index] });
          }}
        >
          删除
        </Button>
      </List.Item>
    );
  }),
);

const TodoList = React.memo(
  connect((store: TodoState) => ({ filter: store.filter, todos: store.todos }))(
    // redux 的 ts 类型提示算是废了
    (props: any) => {
      let todos = [];

      switch (props.filter) {
        case 'all':
          todos = props.todos;
          break;
        case 'done':
          todos = props.todos.filter((todo: any) => todo.completed);
          break;
        case 'todo':
          todos = props.todos.filter((todo: any) => !todo.completed);
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
    },
  ),
);

export default () => {
  const [text, setText] = useState('');

  return (
    <PageContainer ghost style={{ width: 480, margin: 'auto' }}>
      <Provider store={store}>
        <Title level={5}>What do you want to do today?</Title>
        <Input
          value={text}
          placeholder="please input"
          onChange={(e) => setText(e.target.value)}
          onPressEnter={() => {
            // 使用 redux-thunk 之后，store.dispatch 可以接收函数
            // 但是 ts 语法还是存在问题（由于插件机制）
            // @ts-ignore
            store.dispatch(async () => {
              await new Promise((r) => {
                setTimeout(() => r(1), 1000);
              });
              store.dispatch({
                type: 'add',
                payload: {
                  id: +new Date(),
                  text,
                  completed: false,
                },
              });
            });
            setText('');
          }}
        />
        <Filter />
        <TodoList />
      </Provider>
    </PageContainer>
  );
};
