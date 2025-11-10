/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.

    Note: While fun and learning are the primary goals of all enrichment center activities,
          serious injuries may occur when trying to write your own Operating System.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = '>';
        public commandList = [];
        public curses =
            '[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]';
        public apologies = '[sorry]';

        constructor() { }

        public init() {
            var sc: ShellCommand;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(
                this.shellVer,
                'ver',
                '- Displays the current version data.'
            );
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(
                this.shellHelp,
                'help',
                '- This is the help command. Seek help.'
            );
            this.commandList[this.commandList.length] = sc;


            // shutdown
            sc = new ShellCommand(
                this.shellShutdown,
                'shutdown',
                '- Shuts down the virtual OS but leaves the underlying host / hardware simulation running.'
            );
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(
                this.shellCls,
                'cls',
                '- Clears the screen and resets the cursor position.'
            );
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(
                this.shellMan,
                'man',
                '<topic> - Displays the MANual page for <topic>.'
            );
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(
                this.shellTrace,
                'trace',
                '<on | off> - Turns the OS trace on or off.'
            );
            this.commandList[this.commandList.length] = sc;

            // load
            sc = new ShellCommand(
                this.shellLoad,
                'load',
                '<load> - Validates and loads user program input (hex digits) into memory.'
            );
            this.commandList[this.commandList.length] = sc;

            sc = new ShellCommand(
                this.shellRunall,
                'runall',
                ' - Executes all programs at once.'
            );
            this.commandList[this.commandList.length] = sc;
            // kill <id> - kills the specified process id.
            sc = new ShellCommand(
                this.shellKill,
                'kill',
                '<pid> - Kill one pid.'
            );
            this.commandList[this.commandList.length] = sc;

            // clearmem - clears all memory segments
            sc = new ShellCommand(
                this.shellClearmem,
                'clearmem',
                ' - Clears all memory segments.'
            );
            this.commandList[this.commandList.length] = sc;
            // ps  - list the running processes and their IDs
            sc = new ShellCommand(
                this.shellPs,
                'ps',
                ' - Display	the	PID	and	state of all processes.'
            );
            this.commandList[this.commandList.length] = sc;

            // killall  - Kill all process
            sc = new ShellCommand(
                this.shellKillAll,
                'killall',
                ' - Kill all process.'
            );
            this.commandList[this.commandList.length] = sc;

            // q  - Set the round robin quantum
            sc = new ShellCommand(
                this.shellQuantum,
                'q',
                ' <int> - Set the round robin quantum.'
            );
            this.commandList[this.commandList.length] = sc;


            // rot13 <string>
            sc = new ShellCommand(
                this.shellRot13,
                'rot13',
                '<string> - Does rot13 obfuscation on <string>.'
            );
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(
                this.shellPrompt,
                'prompt',
                '<string> - Sets the prompt.'
            );
            this.commandList[this.commandList.length] = sc;

            // date and time
            sc = new ShellCommand(
                this.shellDate,
                'date',
                '- Displays the current date and time.'
            );
            this.commandList[this.commandList.length] = sc;

            // whereami - random location
            sc = new ShellCommand(
                this.shellWhereAmI,
                'whereami',
                '- Displays your current location'
            );
            this.commandList[this.commandList.length] = sc;

            // funfact - random funfact
            sc = new ShellCommand(
                this.shellFunfact,
                'funfact',
                '- Displays a fun fact related to CS'
            );
            this.commandList[this.commandList.length] = sc;

            // joke - random cheesy joke
            sc = new ShellCommand(
                this.shellJoke,
                'joke',
                '- Displays a cheesy CS joke.'
            );
            this.commandList[this.commandList.length] = sc;

            // status <string>
            sc = new ShellCommand(
                this.shellStatus,
                'status',
                '<string> - Sets a custom status message in the taskbar.'
            );
            this.commandList[this.commandList.length] = sc;

            // bsod - triggers blue screen of death
            sc = new ShellCommand(
                this.shellBsod,
                'bsod',
                '- Triggers a Blue Screen of Death (for testing).'
            );
            this.commandList[this.commandList.length] = sc;

            // run <pid> - runs the specificed program
            sc = new ShellCommand(
                this.shellRun,
                'run',
                '<pid> - Runs the specificed program'
            );
            this.commandList[this.commandList.length] = sc;
            
            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace('Shell Command~' + buffer);
            //
            // Parse the input...
            //
            var userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // TypeScript/JavaScript may not support associative arrays in all browsers so we have to iterate over the
            // command list in attempt to find a match.
            // TODO: Is there a better way? Probably. Someone work it out and tell me in class.
            var index: number = 0;
            var found: boolean = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args); // Note that args is always supplied, though it might be empty.
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf('[' + Utils.rot13(cmd) + ']') >= 0) {
                    // Check for curses.
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf('[' + cmd + ']') >= 0) {
                    // Check for apologies.
                    this.execute(this.shellApology);
                } else {
                    // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // Note: args is an optional parameter, ergo the ? which allows TypeScript to understand that.
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args with some über-cool functional programming ...
            fn.call(this, args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer: string): UserCommand {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(' ');

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift(); // Yes, you can do that to an array in JavaScript. See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != '') {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions. Kinda not part of Shell() class exactly, but
        // called from here, so kept here to avoid violating the law of least astonishment.
        //
        public shellInvalidCommand() {
            _StdOut.putText('Invalid Command. ');
            if (_SarcasticMode) {
                _StdOut.putText('Unbelievable. You, [subject name here],');
                _StdOut.advanceLine();
                _StdOut.putText('must be the pride of [subject hometown here].');
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText('Bitch.');
            _SarcasticMode = true;
        }

        public shellApology() {
            if (_SarcasticMode) {
                _StdOut.putText('I think we can put our differences behind us.');
                _StdOut.advanceLine();
                _StdOut.putText('For science . . . You monster.');
                _SarcasticMode = false;
            } else {
                _StdOut.putText('For what?');
            }
        }

        // Although args is unused in some of these functions, it is always provided in the
        // actual parameter list when this function is called, so I feel like we need it.

        public shellVer(args: string[]) {
            _StdOut.putText(APP_NAME + ' version ' + APP_VERSION);
            _StdOut.advanceLine();
            _StdOut.putText('Author: Fitsum Gelaye');
            _StdOut.advanceLine();
            _StdOut.putText(
                'You take the blue pill, the story ends, you wake up in your bed and believe whatever you want to believe.'
            );
            _StdOut.advanceLine();
            _StdOut.putText(
                'You take the red pill, you stay in Wonderland, and I show you how deep the rabbit hole goes.'
            );
        }

        public shellHelp(args: string[]) {
            _StdOut.putText('Commands:');
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText(
                    '  ' +
                    _OsShell.commandList[i].command +
                    ' ' +
                    _OsShell.commandList[i].description
                );
            }
        }

        public shellDate(args: string[]) {
            const now = new Date();
            _StdOut.putText(now.toString());
        }

        public shellWhereAmI(args: string[]) {
            // Let's make it random
            const locations = [
                'Escaping the Matrix',
                'Mount Kilamanjaro',
                'Somewhere between 0XAEFD and 0xDEADBEEF.',
                "In Alan Labouseur's Operating Systems class",
                'Lost in the Dark Web',
                'In hell with Mark Zuckerberg',
            ];
            const loc = locations[Math.floor(Math.random() * locations.length)];
            _StdOut.putText('You are ' + loc);
        }

        public shellFunfact(args: string[]) {
            const facts = [
                'The first “computer bug” was literally a bug.',
                'The first computer mouse was made wooden.',
                'The first programmer was a woman.',
                'There’s a programming language made entirely of whitespace.',
                'Your browser’s private mode isn’t actually private.',
                'There’s a programming language called “Brainfuck.',
            ];
            const fact = facts[Math.floor(Math.random() * facts.length)];
            _StdOut.putText(fact);
        }

        public shellJoke(args: string[]) {
            const jokes = [
                'Why do Java developers wear glasses? Because they don’t C#.',
                'How many programmers does it take to change a light bulb? None. That’s a hardware problem.',
                'What do computers eat for snacks? Chips.',
                'Why did the programmer quit his job? Because he didn’t get arrays.',
                'Why did the developer go broke? Because he used up all his cache.',
                'Why did the database administrator leave his wife? She had one-to-many relationships.',
            ];
            const joke = jokes[Math.floor(Math.random() * jokes.length)];
            _StdOut.putText(joke);
        }

        public shellShutdown(args: string[]) {
            _StdOut.putText('Shutting down...');
            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed. If possible. Not a high priority. (Damn OCD!)
        }

        public shellCls(args: string[]) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args: string[]) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case 'help':
                        _StdOut.putText(
                            'Help displays a list of (hopefully) valid commands.'
                        );
                        break;
                    case 'date':
                        _StdOut.putText('Date displays the current date and time');
                        break;
                    case 'whereami':
                        _StdOut.putText('Whereami displays your current location');
                        break;
                    case 'funfact':
                        _StdOut.putText(
                            'Funfact displays a random fun fact about everything and anything CS.'
                        );
                        break;
                    case 'joke':
                        _StdOut.putText('Joke displays a cheesy/corny CS related joke.');
                        break;
                    case 'shutdown':
                        _StdOut.putText(
                            'shutdown - Shuts down the virtual OS but leaves the underlying host / hardware simulation running.'
                        );
                        break;
                    case 'cls':
                        _StdOut.putText(
                            'cls - Clears the screen and resets the cursor position.'
                        );
                        break;
                    case 'man':
                        _StdOut.putText(
                            'man <topic> - Displays the MANual page for <topic>.'
                        );
                        break;
                    case 'trace':
                        _StdOut.putText('trace <on | off> - Turns the OS trace on or off.');
                        break;
                    case 'rot13':
                        _StdOut.putText(
                            'rot13 <string> - Does rot13 obfuscation on <string>.'
                        );
                        break;
                    case 'status':
                        _StdOut.putText(
                            'status <string> - Sets a custom status message in the taskbar.'
                        );
                        break;
                    case 'bsod':
                        _StdOut.putText('bsod - Triggers a Blue Screen of Death (for testing).');
                        break;
                    case 'load':
                        _StdOut.putText('load - Validates and loads user program input (hex digits) into memory.');
                        break;
                    case 'prompt':
                        _StdOut.putText('prompt <string> - Sets the prompt.');
                        break;
                    case 'run':
                        _StdOut.putText('run <pid> - Runs the specified process in memory.');
                        break;
                    case 'runall':
                        _StdOut.putText('runall - Executes all programs at once.');
                        break;
                    case 'clearmem':
                        _StdOut.putText('clearmem - Clear all memory segments.');
                        break;
                    case 'ps':
                        _StdOut.putText('ps = Display the PID and state of all processes.');
                        break;
                    case 'kill':
                        _StdOut.putText('kill <pid> - Kills a process.');
                        break;
                    case 'killall':
                        _StdOut.putText('killall - Kills all process.');
                        break;
                    case 'q':
                        _StdOut.putText('q <pid> - Set the Round Robin quantum.');
                        break;
                    default:
                        _StdOut.putText('No manual entry for ' + args[0] + '.');
                }
            } else {
                _StdOut.putText('Usage: man <topic>  Please supply a topic.');
            }
        }

        public shellTrace(args: string[]) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case 'on':
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText('Trace is already on, doofus.');
                        } else {
                            _Trace = true;
                            _StdOut.putText('Trace ON');
                        }
                        break;
                    case 'off':
                        _Trace = false;
                        _StdOut.putText('Trace OFF');
                        break;
                    default:
                        _StdOut.putText('Invalid arguement.  Usage: trace <on | off>.');
                }
            } else {
                _StdOut.putText('Usage: trace <on | off>');
            }
        }

        public shellRot13(args: string[]) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(
                    args.join(' ') + " = '" + Utils.rot13(args.join(' ')) + "'"
                );
            } else {
                _StdOut.putText('Usage: rot13 <string>  Please supply a string.');
            }
        }

        public shellBsod(args: string[]) {
            _Kernel.krnTrapError("Manual BSOD test triggered.");
        }

        public shellLoad(args: string[]) {
            // Grab text from the HTML5 text area
            const inputArea: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById("taProgramInput");
            const hcode = inputArea.value.trim();

            if (hcode.length === 0) {
                _StdOut.putText("Error: No program entered.");
                return;
            }

            //  only hex digits and spaces allowed
            const valid = /^[0-9A-Fa-f\s]+$/.test(hcode);

            if (valid) {
                _StdOut.putText("Program validated successfully. Ready to load into memory!");
            } else {
                _StdOut.putText("Error: Program contains invalid characters. Only hex digits (0-9, A-F) and spaces allowed.");
            }
            // Split hex code into individual bytes
            const hexArray = hcode.split(/\s+/);

            try {
                // Ask the MemoryManager to load the program properly
                const pid = _MemoryManager.loadProgram(hexArray);
                const pcb = _MemoryManager.getPCB(pid);

                if (pcb) {
                    _StdOut.putText(`Program loaded into memory.`);
                    _StdOut.advanceLine();
                    _StdOut.putText(`PID: ${pid}, Base: 0x${pcb.base.toString(16).padStart(4, "0")}, Limit: 0x${pcb.limit.toString(16).padStart(4, "0")}`);
                } else {
                    _StdOut.putText("Error: Failed to retrieve PCB after loading program.");
                }
                _PCBList = _MemoryManager.getLoadedPrograms();
                Control.updateMemoryDisplay();
            } catch (err) {
                const message = err instanceof Error ? err.message : `${err}`;
                _StdOut.putText(`Error loading program: ${message}`);
            }
        }
        public shellPrompt(args: string[]) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText('Usage: prompt <string>  Please supply a string.');
            }
        }
        public shellStatus(args: string[]): void {
            if (args.length > 0) {
                const newmessg = args.join(' ');
                const status = document.getElementById('taskbar-status');
                if (status) {
                    status.textContent = newmessg;
                }
                _StdOut.putText('Status updated: ' + newmessg);
            } else {
                _StdOut.putText(
                    'Usage: status <string>  Please supply a status message.'
                );
            }
        }
        public shellRun(args: string[]): void {
            if (args.length === 0) {
                _StdOut.putText("Usage: run <pid>");
                return;
            }

            const pid = parseInt(args[0], 10);
            if (isNaN(pid)) {
                _StdOut.putText("Error: PID must be a number.");
                return;
            }

            const pcb = _MemoryManager.getPCB(pid);
            if (!pcb) {
                _StdOut.putText(`Error: No process found with PID ${pid}.`);
                return;
            }

            if (pcb.state === "Terminated") {
                _StdOut.putText(`Error: Process ${pid} has already terminated.`);
                return;
            }

            if ((_CurrentPCB && _CurrentPCB.pid === pid) || pcb.state === "Running") {
                _StdOut.putText(`Process ${pid} is already running.`);
                return;
            }

            if (this.isPidInReadyQueue(pid)) {
                _StdOut.putText(`Process ${pid} is already scheduled.`);
                return;
            }

            if (!this.enqueueProcess(pcb)) {
                _StdOut.putText(`Unable to schedule process ${pid}.`);
                return;
            }

            _StdOut.putText(`Process ${pid} added to the ready queue.`);
            _StdOut.advanceLine();

            if (!_CPU.isExecuting && _Scheduler) {
                _Scheduler.scheduleNext();
            }
        }



        // clearmem - clear all memory segments
        public shellClearmem(args: string[]): void {
            if ((_CPU && _CPU.isExecuting) || (_ReadyQueue && !_ReadyQueue.isEmpty()) || _CurrentPCB) {
                _StdOut.putText("Cannot clear memory while processes are running.");
                return;
            }

            _Memory.init();            // reset physical mem
            _MemoryManager.reset();    // reset allocation
            _PCBList = [];
            _CurrentPCB = null;
            _ReadyQueue = new Queue();
            Control.updateMemoryDisplay();
            Control.updateReadyQueueDisplay();
            Control.updatePCBDisplay();
            _StdOut.putText("Memory cleared.");
        }
        // runall - run all programs at once
        public shellRunall(args: string[]): void {
            const programs = _MemoryManager.getLoadedPrograms();
            if (programs.length === 0) {
                _StdOut.putText("No programs loaded.");
                return;
            }

            let enqueued = 0;
            for (const pcb of programs) {
                if (pcb.state === "Terminated" || pcb.state === "Running") {
                    continue;
                }

                if (this.isPidInReadyQueue(pcb.pid)) {
                    continue;
                }

                if (this.enqueueProcess(pcb)) {
                    enqueued++;
                }
            }

            if (enqueued === 0) {
                _StdOut.putText("No new runnable programs found.");
                return;
            }

            _StdOut.putText(`Enqueued ${enqueued} program(s).`);
            _StdOut.advanceLine();

            // If CPU idle, have scheduler pick the first job
            if (!_CPU.isExecuting && _Scheduler) {
                _Scheduler.scheduleNext();
            }
        }
        // ps - display the PID and state of all processes 
        public shellPs(args: string[]): void {
            const programs = _MemoryManager.getLoadedPrograms();
            if (programs.length === 0) {
                _StdOut.putText("No active processes.");
                return;
            }

            _StdOut.putText("PID\tState\tLocation");
            _StdOut.advanceLine();
            for (const pcb of programs) {
                _StdOut.putText(`${pcb.pid}\t${pcb.state}\t${pcb.location ?? ""}`);
                _StdOut.advanceLine();
            }
        }
        public shellQuantum(args: string[]): void {
            if (args.length === 0) { _StdOut.putText("Usage: q <int>"); return; }
            const q = parseInt(args[0], 10);
            if (isNaN(q) || q <= 0) { _StdOut.putText("Quantum must be a positive integer."); return; }
            if (!_Scheduler) { _StdOut.putText("Scheduler not initialized."); return; }
            _Scheduler.setQuantum(q);
            _StdOut.putText(`Quantum set to ${_Scheduler.getQuantum()}`);
        }

        public shellKill(args: string[]): void {
            if (args.length === 0) {
                _StdOut.putText("Usage: kill <pid>");
                return;
            }

            const pid = parseInt(args[0], 10);
            if (isNaN(pid)) {
                _StdOut.putText("PID must be numeric.");
                return;
            }

            const pcb = _MemoryManager.getPCB(pid);

            if (!pcb) {
                _StdOut.putText(`No process with PID ${pid}.`);
                return;
            }

            _MemoryManager.markTerminated(pid);

            if (_CurrentPCB && _CurrentPCB.pid === pid) {
                _CPU.isExecuting = false;
                _CurrentPCB = null;
                if (_Scheduler) {
                    _Scheduler.resetCycleCount();
                }
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(CONTEXT_SWITCH_IRQ, []));
            } else if (!_CPU.isExecuting && _ReadyQueue && !_ReadyQueue.isEmpty() && _Scheduler) {
                _Scheduler.scheduleNext();
            }

            _StdOut.putText(`Process ${pid} terminated.`);
            Control.updatePCBDisplay();
            Control.updateReadyQueueDisplay();
        }

        public shellKillAll(args: string[]): void {
            const programs = _MemoryManager.getLoadedPrograms();
            if (programs.length === 0) {
                _StdOut.putText("No active processes.");
                return;
            }

            for (const pcb of programs) {
                if (pcb.state !== "Terminated") {
                    _MemoryManager.markTerminated(pcb.pid);
                }
            }

            _ReadyQueue = new Queue();
            _CPU.isExecuting = false;
            _CurrentPCB = null;

            Control.updatePCBDisplay();
            Control.updateReadyQueueDisplay();
            _StdOut.putText("All processes terminated.");
        }

        private isPidInReadyQueue(pid: number): boolean {
            if (!_ReadyQueue || !_ReadyQueue.q) {
                return false;
            }
            const queue = _ReadyQueue.q as PCB[];
            return queue.some(p => p.pid === pid);
        }

        private enqueueProcess(pcb: PCB): boolean {
            if (!pcb || pcb.state === "Terminated") {
                return false;
            }

            if (!_ReadyQueue) {
                _ReadyQueue = new Queue();
            }

            if (this.isPidInReadyQueue(pcb.pid)) {
                return false;
            }

            pcb.state = "Ready";
            pcb.location = "Ready Queue";
            pcb.quantum = _Scheduler ? _Scheduler.getQuantum() : pcb.quantum;
            _ReadyQueue.enqueue(pcb);
            Control.updateReadyQueueDisplay();
            return true;
        }
}
    // Sources:
    // https://stackoverflow.com/questions/10211145/getting-current-date-and-time-in-javascript
    // https://stackoverflow.com/questions/32598351/date-display-with-javascript
    // Used AI for some optimization


    // Used AI for synchronizing memory display
}
