module TSOS {
    export class PCB {
        public pid: number;
        public pc: number;
        public acc: number;
        public xReg: number;
        public yReg: number;
        public zFlag: number;
        public base: number;
        public limit: number;
        public state: string;
        public priority: number;
        public quantum: number;
        public segment: number;
        public location: string;
        public waitTime: number;
        public turnaroundTime: number;

        constructor(
            pid: number = 0,
            base: number = 0,
            limit: number = 0,
            pc: number = 0,
            acc: number = 0,
            xReg: number = 0,
            yReg: number = 0,
            zFlag: number = 0,
            state: string = "New",
            priority: number = 0,
            quantum: number = 0,
            segment?: number,
            location: string = "Memory",
            waitTime: number = 0,
            turnaroundTime: number = 0,
        ) {
            this.pid = pid;
            this.pc = pc;
            this.acc = acc;
            this.xReg = xReg;
            this.yReg = yReg;
            this.zFlag = zFlag;
            this.base = base;
            this.limit = limit;
            this.state = state;
            this.priority = priority;
            this.quantum = quantum;
            this.segment = segment ?? Math.floor(base / PARTITION_SIZE);
            this.location = location;
            this.waitTime = waitTime;
            this.turnaroundTime = turnaroundTime;
        }
    }
// https://stackoverflow.com/questions/74605767/where-does-pcb-of-a-process-lies-inside-the-main-memory
// https://stackoverflow.com/questions/55077013/process-table-in-operating-system
    
}
