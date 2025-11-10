module TSOS {
  export class Scheduler {
    private quantum: number = 6;
    private cycleCount: number = 0;
    private dispatcher: Dispatcher;

    constructor(dispatcher: Dispatcher) {
      this.dispatcher = dispatcher;
    }

    // Just selects a process from the ready queue
    public scheduleNext(): void {
      if (_ReadyQueue.isEmpty()) {
        // If the current process is still running and there's nothing else, just reset the quantum
        if (_CurrentPCB && _CurrentPCB.state !== "Terminated" && _CPU.isExecuting) {
          this.resetCycleCount();
          return;
        }

        this.dispatcher.contextSwitch(null);
        this.resetCycleCount();
        _CPU.isExecuting = false;
        _CurrentPCB = null;
        return;
      }

      // Retrieve the next process to execute (FIFO order)
      const nextPCB = _ReadyQueue.dequeue();
      this.dispatcher.contextSwitch(nextPCB);
      this.resetCycleCount();
      if (_CurrentPCB) {
        _CurrentPCB.location = "CPU";
        _Kernel.krnTrace(`Switched to PID ${_CurrentPCB.pid}`);
      }
    }

    public tick(): void {
      if (!_CPU.isExecuting || !_CurrentPCB) return;

      this.cycleCount++;
      _CurrentPCB.turnaroundTime++;
      _CurrentPCB.quantum = Math.max(this.quantum - this.cycleCount, 0);
      this.incrementWaitingTimes();

      if (this.cycleCount >= this.quantum) {
        this.cycleCount = 0;
        // Notify kernel that it’s time for a context switch
        _KernelInterruptQueue.enqueue(
          new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, [])
        );
      }
    }

    public setQuantum(q: number): void {
      this.quantum = Math.max(1, Math.floor(q));
      this.resetCycleCount();
    }

    public getQuantum(): number {
      return this.quantum;
    }

    public resetCycleCount(): void {
      this.cycleCount = 0;
      if (_CurrentPCB) {
        _CurrentPCB.quantum = this.quantum;
      }
    }

    private incrementWaitingTimes(): void {
      if (!_ReadyQueue || !_ReadyQueue.q) {
        return;
      }

      const queue = _ReadyQueue.q as PCB[];
      for (const pcb of queue) {
        pcb.waitTime++;
        pcb.turnaroundTime++;
      }
    }
  }
}
