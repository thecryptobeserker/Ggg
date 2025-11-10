module TSOS {
  export class Dispatcher {
    public contextSwitch(newPCB: TSOS.PCB | null): void {
      if (_CurrentPCB) {
        // Save CPU state to current PCB
        _CurrentPCB.pc = _CPU.PC;
        _CurrentPCB.acc = _CPU.Acc;
        _CurrentPCB.xReg = _CPU.Xreg;
        _CurrentPCB.yReg = _CPU.Yreg;
        _CurrentPCB.zFlag = _CPU.Zflag;
        // Only enqueue if not terminated
        if (_CurrentPCB.state !== "Terminated") {
          _CurrentPCB.state = "Ready";
          _CurrentPCB.location = "Ready Queue";
          if (_Scheduler) {
            _CurrentPCB.quantum = _Scheduler.getQuantum();
          }
          _ReadyQueue.enqueue(_CurrentPCB);
        }
        _Kernel.krnTrace(`Context switch: saving PID ${_CurrentPCB.pid}`);
      }

      if (newPCB) {
      // Load new PCB into CPU
      _CurrentPCB = newPCB;
      _CurrentPCB.state = "Running";
      _CurrentPCB.location = "CPU";
      _CPU.PC = newPCB.pc;
      _CPU.Acc = newPCB.acc;
      _CPU.Xreg = newPCB.xReg;
      _CPU.Yreg = newPCB.yReg;
      _CPU.Zflag = newPCB.zFlag;

      // Set CPU base/limit for memory access
      _CPU.baseReg = newPCB.base;
      _CPU.limitReg = newPCB.limit;

      _Kernel.krnTrace(`Dispatcher loading PID ${_CurrentPCB.pid}`);
      _CPU.isExecuting = true;

      Control.updateCPUDisplay();
      Control.updatePCBDisplay();
    }
    Control.updateReadyQueueDisplay();
  }
  }
}
