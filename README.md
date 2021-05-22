## Introduction
websocket 的封装,可以自动进行心跳检测,断线重连等操作

## Install
yarn add @sunrises/websocket

## Usage

```typescript
import Socket from '@sunrises/websocket'

const socket = new Socket({
  url: 'ws:xx',
  onOpenMsg: 'openMsg',
  heartCheckMsg: 'PING',
  onError: e => {
    console.log(E)
  },
  onMessage: msg => {
    console.log(msg)
  }
})

// connect
socket.connect()

// close
socket.close()
```
