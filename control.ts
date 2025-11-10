/* ------------
     Control.ts

     Routines for the hardware simulation, NOT for our client OS itself.
     These are static because we are never going to instantiate them, because they represent the hardware.
     In this manner, it's A LITTLE BIT like a hypervisor, in that the Document environment inside a browser
     is the "bare metal" (so to speak) for which we write code that hosts our client OS.
     But that analogy only goes so far, and the lines are blurred, because we are using TypeScript/JavaScript
     in both the host and client environments.

     This (and other host/simulation scripts) is the only place that we should see "web" code, such as
     DOM manipulation and event handling, and so on.  (Index.html is -- obviously -- the only place for markup.)

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

//
// Control Services
//
module TSOS {
  export class Control {
    public static hostInit(): void {
      // This is called from index.html's onLoad event via the onDocumentLoad function pointer.

      // Get a global reference to the canvas.  TODO: Should we move this stuff into a Display Device Driver?
      _Canvas = <HTMLCanvasElement>document.getElementById('display');

      // Get a global reference to the drawing context.
      _DrawingContext = _Canvas.getContext('2d');

      // Enable the added-in canvas text functions (see canvastext.ts for provenance and details).
      CanvasTextFunctions.enable(_DrawingContext); // Text functionality is now built in to the HTML5 canvas. But this is old-school, and fun, so we'll keep it.

      // Clear the log text box.
      // Use the TypeScript cast to HTMLInputElement
      (<HTMLInputElement>document.getElementById('taHostLog')).value = '';

      // Set focus on the start button.
      // Use the TypeScript cast to HTMLInputElement
      (<HTMLInputElement>document.getElementById('btnStartOS')).focus();

      // Check for our testing and enrichment core, which
      // may be referenced here (from index.html) as function Glados().
      if (typeof Glados === 'function') {
        // function Glados() is here, so instantiate Her into
        // the global (and properly capitalized) _GLaDOS variable.
        _GLaDOS = new Glados();
        _GLaDOS.init();
      }
      // Start updating the taskbar clock every second
      setInterval(Control.updateTaskbarTime, 1000);
      Control.updateTaskbarTime();
    }

    public static updateTaskbarTime(): void {
      const timetoday = document.getElementById('taskbar-time');
      if (timetoday) {
        const now = new Date();
        timetoday.textContent = now.toLocaleString();
      }
    }

    public static hostLog(msg: string, source: string = '?'): void {
      // Note the OS CLOCK.
      var clock: number = _OSclock;

      // Note the REAL clock in milliseconds since January 1, 1970.
      var now: number = new Date().getTime();

      // Build the log string.
      var str: string =
        '({ clock:' +
        clock +
        ', source:' +
        source +
        ', msg:' +
        msg +
        ', now:' +
        now +
        ' })' +
        '\n';

      // Update the log console.
      var taLog = <HTMLInputElement>document.getElementById('taHostLog');
      taLog.value = str + taLog.value;

      // TODO in the future: Optionally update a log database or some streaming service.
    }

    //
    // Host Events
    //
    public static hostBtnStartOS_click(btn): void {
      // Disable the (passed-in) start button...
      btn.disabled = true;

      // .. enable the Halt and Reset buttons ...
      (<HTMLButtonElement>document.getElementById('btnHaltOS')).disabled =
        false;
      (<HTMLButtonElement>document.getElementById('btnReset')).disabled = false;

      // .. set focus on the OS console display ...
      document.getElementById('display').focus();

      // ... Create and initialize the CPU (because it's part of the hardware)  ...
      _CPU = new Cpu(); // Note: We could simulate multi-core systems by instantiating more than one instance of the CPU here.
      _CPU.init(); //       There's more to do, like dealing with scheduling and such, but this would be a start. Pretty cool.

      _Memory = new TSOS.Memory();
      _Memory.init();

      _MemoryAccessor = new TSOS.MemoryAccessor();
      _MemoryManager = new TSOS.MemoryManager();

      // ... then set the host clock pulse ...
      _hardwareClockID = setInterval(
        Devices.hostClockPulse,
        CPU_CLOCK_INTERVAL
      );
      // .. and call the OS Kernel Bootstrap routine.
      _Kernel = new Kernel();
      _Kernel.krnBootstrap(); // _GLaDOS.afterStartup() will get called in there, if configured.
    }

    public static hostBtnHaltOS_click(btn): void {
      Control.hostLog('Emergency halt', 'host');
      Control.hostLog('Attempting Kernel shutdown.', 'host');
      // Call the OS shutdown routine.
      _Kernel.krnShutdown();
      // Stop the interval that's simulating our clock pulse.
      clearInterval(_hardwareClockID);
      // TODO: Is there anything else we need to do here?
    }

    public static updateCPUDisplay(): void {
      const cpuElement = document.getElementById("cpuDisplay");
      if (!cpuElement || !_CPU) return;

      cpuElement.innerHTML =
        `PC: ${_CPU.PC.toString(16).padStart(4, '0').toUpperCase()}\n` +
        `Acc: ${_CPU.Acc.toString(16).padStart(2, '0').toUpperCase()} (${_CPU.Acc})\n` +
        `X: ${_CPU.Xreg.toString(16).padStart(2, '0').toUpperCase()}\n` +
        `Y: ${_CPU.Yreg.toString(16).padStart(2, '0').toUpperCase()}\n` +
        `Z: ${_CPU.Zflag}\n` +
        `IR: ${_CPU.instructionReg || '??'}`;
    }

    public static updatePCBDisplay(): void {
      const pcbElement = document.getElementById("pcbDisplay");
      if (!pcbElement) return;

      if (!_CurrentPCB) {
        pcbElement.textContent = "CPU Idle";
        return;
      }

      const segment = _CurrentPCB.segment ?? Math.floor(_CurrentPCB.base / PARTITION_SIZE);

      pcbElement.textContent =
        `PID: ${_CurrentPCB.pid}\n` +
        `State: ${_CurrentPCB.state}\n` +
        `Location: ${_CurrentPCB.location ?? ""}\n` +
        `Segment: ${segment}\n` +
        `Base: 0x${_CurrentPCB.base.toString(16).padStart(4, '0').toUpperCase()}\n` +
        `Limit: 0x${_CurrentPCB.limit.toString(16).padStart(4, '0').toUpperCase()}\n` +
        `PC: ${_CurrentPCB.pc}\n` +
        `Acc: ${_CurrentPCB.acc}\n` +
        `X: ${_CurrentPCB.xReg}\n` +
        `Y: ${_CurrentPCB.yReg}\n` +
        `Z: ${_CurrentPCB.zFlag}\n` +
        `Quantum: ${_CurrentPCB.quantum}\n` +
        `Wait: ${_CurrentPCB.waitTime}\n` +
        `Turnaround: ${_CurrentPCB.turnaroundTime}`;
    }

    public static updateMemoryDisplay(): void {
      const memoryElement = document.getElementById("memoryDisplay");
      if (!memoryElement || !_Memory) return;

      const bytesPerRow = 8;
      const rows: string[] = [];
      for (let addr = 0; addr < MEMORY_SIZE; addr += bytesPerRow) {
        const rowValues: string[] = [];
        for (let offset = 0; offset < bytesPerRow && addr + offset < MEMORY_SIZE; offset++) {
          rowValues.push(_Memory.readDirect(addr + offset).toUpperCase());
        }
        rows.push(`0x${addr.toString(16).padStart(3, '0').toUpperCase()}: ${rowValues.join(' ')}`);
      }
      memoryElement.textContent = rows.join('\n');
    }

    public static updateReadyQueueDisplay(): void {
      const queueElement = document.getElementById("readyQueueDisplay");
      if (!queueElement || !_ReadyQueue || !_ReadyQueue.q) return;

      const queue = _ReadyQueue.q as PCB[];
      if (queue.length === 0) {
        queueElement.textContent = "Ready Queue Empty";
        return;
      }

      let out = "";
      for (const pcb of queue) {
        const segment = pcb.segment ?? Math.floor(pcb.base / PARTITION_SIZE);
        out +=
          `PID: ${pcb.pid}\n` +
          `State: ${pcb.state}\n` +
          `Location: ${pcb.location || ""}\n` +
          `Base: 0x${pcb.base.toString(16).padStart(4, '0').toUpperCase()}\n` +
          `Limit: 0x${pcb.limit.toString(16).padStart(4, '0').toUpperCase()}\n` +
          `Segment: ${segment}\n` +
          `Priority: ${pcb.priority}\n` +
          `Quantum: ${pcb.quantum}\n` +
          `Wait: ${pcb.waitTime}\n` +
          `Turnaround: ${pcb.turnaroundTime}\n` +
          `-------------------------\n`;
      }

      queueElement.textContent = out.trimEnd();
    }



    public static hostBtnReset_click(btn): void {
      // The easiest and most thorough way to do this is to reload (not refresh) the document.
      location.reload();
    }
  }
}
// Used AI to help me synchronize the memory display
// Hall of Fame Projects: LongOS and AquaOS
