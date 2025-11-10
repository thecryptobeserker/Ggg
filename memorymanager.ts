module TSOS {
    export class MemoryManager {
        private pidCounter: number;
        private partitionSize: number = PARTITION_SIZE;
        private readonly pcbTable: Map<number, PCB>;
        private partitionMap:boolean[];

        constructor(partitionSize: number = PARTITION_SIZE) {
            this.pidCounter = 0;
            this.partitionSize = partitionSize;
            this.pcbTable = new Map<number, PCB>();
            const numPartitions = Math.floor(MEMORY_SIZE / this.partitionSize);
            this.partitionMap = Array(numPartitions).fill(false);
        }

        

        private givePartition(): number {
            for (let i = 0; i < this.partitionMap.length; i++) {
                if (!this.partitionMap[i]) {
                    this.partitionMap[i] = true;
                    return i;
                }
            }
            throw new Error("No partitions available.");
        }
        // Makes sure index is valid before marking it as available.
        private takePartition(index: number): void {
            if (index >= 0 && index < this.partitionMap.length) {
                this.partitionMap[index] = false;
            }
        }

        private releaseResources(pcb: PCB): void {
            const partitionIndex = Math.floor(pcb.base / this.partitionSize);
            this.takePartition(partitionIndex);

            if (_ReadyQueue && _ReadyQueue.q) {
                _ReadyQueue.q = _ReadyQueue.q.filter((p: PCB) => p.pid !== pcb.pid);
            }

            _ResidentList = _ResidentList.filter(p => p.pid !== pcb.pid);
            Control.updateReadyQueueDisplay();
        }


        // Returns the created PID.
        public loadProgram(hexBytes: string[]): number {
            this.cleanupTerminated();

            if (_CPU && _CPU.isExecuting) {
                throw new Error("MemoryManager can't load while the CPU is executing a program.");
            }

            const sanitized = this.sanitizeProgram(hexBytes);
            if (sanitized.length === 0) {
                throw new Error("MemoryManager has no program bytes provided.");
            }
            if (sanitized.length > this.partitionSize) {
                throw new Error(
                    `MemoryManager program size ${sanitized.length} exceeds available memory ${this.partitionSize}.`
                );
            }
            // Gives partition to any new program
            const partitionIndex = this.givePartition();
            const pid = this.pidCounter++;
            const base = partitionIndex * this.partitionSize;
            const limit = base + this.partitionSize - 1;


            if (limit >= _Memory.size) {
                throw new Error("MemoryManager doesn't have enough memory.");
            }

            if (sanitized.length > this.partitionSize) {
                throw new Error(`Program too big (max ${this.partitionSize} bytes).`);
            }

            // Write the prog into its assigned partition
            for (let i = 0; i < sanitized.length; i++) {
                _Memory.writeDirect(base + i, sanitized[i]);
            }

            // Create PCB for program
            const pcb = new PCB(pid, base, limit, 0, 0, 0, 0, 0, "Resident", 0, 0, partitionIndex, "Memory");
            this.pcbTable.set(pid, pcb);
            _ResidentList.push(pcb);
            this.refreshGlobalList();
            return pid;
        }

        public getPCB(pid: number): PCB | undefined {
            return this.pcbTable.get(pid);
        }

        public getLoadedPrograms(): PCB[] {
            return Array.from(this.pcbTable.values());
        }

        public markTerminated(pid: number): void {
            const pcb = this.pcbTable.get(pid);
            if (pcb) {
                pcb.state = "Terminated";
                pcb.location = "Released";
                this.releaseResources(pcb);
            }
            
            this.refreshGlobalList();
        }

        public cleanupTerminated(): void {
            for (const [pid, pcb] of this.pcbTable.entries()) {
                if (pcb.state === "Terminated") {
                    this.releaseResources(pcb);
                }
            }
            this.refreshGlobalList();
        }

        public reset(): void {
            this.pcbTable.clear();
            const numPartitions = Math.floor(MEMORY_SIZE / this.partitionSize);
            this.partitionMap = Array(numPartitions).fill(false);
            _ResidentList = [];
            this.refreshGlobalList();
        }

        private sanitizeProgram(hexBytes: string[]): string[] {
            const cleaned: string[] = [];

            for (const rawByte of hexBytes) {
                const trimmed = rawByte.trim();
                if (trimmed.length === 0) {
                    continue;
                }

                if (!/^[0-9A-Fa-f]{2}$/.test(trimmed)) {
                    throw new Error(`MemoryManager.loadProgram: invalid byte '${trimmed}'. Use two hexadecimal characters per byte.`);
                }

                cleaned.push(trimmed.toUpperCase());
            }

            return cleaned;
        }

        private refreshGlobalList(): void {
            _PCBList = Array.from(this.pcbTable.values());
        }
    }
}
// Lots of the logic is built on my own MMU from computer org and arch 
// Hall of Fame Projects: MarshMan, LuchiOS, and LegOS
