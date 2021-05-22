export type Config = {
  url: string
  onOpenMsg?: any
  heartCheckMsg?: string
  heartCheckTime?: number // 心跳检测间隔时间
  onOpen?: (e: Event) => void
  onError?: (e: Event) => void
  onClose?: (e: CloseEvent) => void
  onMessage?: (msg: any) => void
}

class Socket {
  private websocket: WebSocket | null
  private timeout
  private isConnect: boolean
  private manualClose: boolean
  private pingInterval
  private config: Config

  constructor(config: Config) {
    this.websocket = null
    this.isConnect = false
    this.timeout = null
    this.manualClose = false
    this.config = config || {}
  }

  get() {
    return this.websocket
  }

  initSocket() {
    this.manualClose = false

    if (!this.websocket) {
      return
    }

    this.websocket.onclose = (e) => {
      this.config.onClose && this.config.onClose(e)
      this.isConnect = false
      // 手动关闭后不再尝试重连
      if (!this.manualClose) {
        this.reConnect()
      }
    }

    this.websocket.onerror = e => {
      this.config.onError && this.config.onError(e)
      this.reConnect()
    }

    this.websocket.onopen = (e) => {
      this.config.onOpen && this.config.onOpen(e)
      this.isConnect = true
      if (this.config.hasOwnProperty('onOpenMsg')) {
        this.send(this.config.onOpenMsg || '')
      }
    }

    this.websocket.onmessage = e => {
      this.config.onMessage && this.config.onMessage(JSON.parse(e.data))
    }

    this.heartCheck()
  }

  connect() {
    this.websocket = new WebSocket(this.config.url)
    this.initSocket()
  }

  heartCheck() {
    this.pingInterval = setInterval(() => {
      if (this.websocket?.readyState === 1) {
        this.websocket.send(this.config.heartCheckMsg || 'PING')
      }
    }, this.config.heartCheckTime || 6000)
  }

  send(msg: any) {
    this.websocket?.send(JSON.stringify(msg))
  }

  reConnect() {
    if (this.isConnect === true) {
      return false
    }
    this.isConnect = true
    this.timeout && clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.connect()
      this.isConnect = false
    }, 1000)
  }

  close() {
    this.manualClose = true
    clearInterval(this.pingInterval)
    clearTimeout(this.timeout)
    if (this.websocket) {
      this.websocket.close()
    }
  }
}

export default Socket
