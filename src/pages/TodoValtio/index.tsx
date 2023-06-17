import { PageContainer } from '@ant-design/pro-components';
import { Button, Input, List, Radio, Typography } from 'antd';
import EventEmitter from 'events';
import React, { useEffect, useState } from 'react';
import { proxy, ref, useSnapshot } from 'valtio';
import {
  Todo,
  addTodo,
  changeFilter,
  removeTodo,
  store,
  toggleTodo,
} from './states/todo';

const { Title, Text } = Typography;

const Filter = React.memo(() => {
  // useSnapshot 会自动更新
  const { filter } = useSnapshot(store);
  // snapshot 不会
  // const { filter } = snapshot(store);
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
  ({ completed, text, index }: Todo & { index: number }) => (
    <List.Item>
      <Text
        disabled={completed}
        onClick={() => toggleTodo(index, completed ?? false)}
      >
        {text}
      </Text>
      <Button danger size="small" onClick={() => removeTodo(index)}>
        删除
      </Button>
    </List.Item>
  ),
);

const TodoList = React.memo(() => {
  const { filteredTodoList } = useSnapshot(store);

  return (
    <List
      bordered
      // @ts-ignore
      dataSource={filteredTodoList}
      renderItem={(item, index) => (
        <TodoListItem key={item.id} {...item} index={index} />
      )}
      style={{ marginTop: 8 }}
    />
  );
});

export const stateSignals = proxy({
  signals: new EventEmitter(),
  domRef: ref({ a: 1 }),
});

export default () => {
  const [text, setText] = useState('');

  // anywhere
  const { signals, domRef } = useSnapshot(stateSignals);
  useEffect(() => {
    stateSignals.signals.on('Notification', () => {
      console.log(111);
    });
    return () => {
      stateSignals.signals.off('Notification', () => {
        console.log(111);
      });
    };
  }, []);

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
      <Button
        style={{ marginTop: 24 }}
        onClick={() => {
          signals.emit('Notification');
          domRef.a = 2;
        }}
      >
        Notification
      </Button>
    </PageContainer>
  );
};
