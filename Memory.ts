module TSOS {
    export class Memory {
        private memory: string[];
        private mar: number;  // Address register (where in memory we’re looking)
        private mdr: string;  // Data register (what we’re reading/writing)

        constructor(public size: number = MEMORY_SIZE) {
            this.memory = new Array(this.size).fill("00");
            this.mar = 0x0000;
            this.mdr = "00";
        }

        // Reset everything back to zeroed-out memory
        public init(): void {
            this.memory.fill("00");
            this.mar = 0x0000;
            this.mdr = "00";
        }

        // MAR (address register)
        public getMAR(): number {
            return this.mar;
        }

        public setMAR(address: number): void {
            if (address >= 0 && address < this.size) {
                this.mar = address;
            } else {
                throw new Error(`Invalid MAR value: ${address.toString(16)}`);
            }
        }

        // MDR (data register) 
        public getMDR(): string {
            return this.mdr;
        }

        public setMDR(data: string): void {
            if (/^[0-9A-Fa-f]{1,2}$/.test(data)) {
                this.mdr = data.toUpperCase().padStart(2, "0");
            } else {
                throw new Error(`Invalid MDR value: ${data}`);
            }
        }
        // Normal memory ops (use MAR/MDR) 
        public read(): void {
            if (this.mar >= 0 && this.mar < this.size) {
                this.mdr = this.memory[this.mar];
            } else {
                throw new Error(`Read failed - bad MAR: ${this.mar.toString(16)}`);
            }
        }

        public write(): void {
            if (this.mar >= 0 && this.mar < this.size) {
                this.memory[this.mar] = this.mdr;
            } else {
                throw new Error(`Write failed - bad MAR: ${this.mar.toString(16)}`);
            }
        }

        // Direct access (skip MAR/MDR)
        public readDirect(address: number): string {
            if (address >= 0 && address < this.size) {
                return this.memory[address];
            }
            throw new Error(`Direct read failed - bad address: ${address.toString(16)}`);
        }

        public writeDirect(address: number, data: string): void {
            if (address >= 0 && address < this.size) {
                this.memory[address] = data.toUpperCase().padStart(2, "0");
            } else {
                throw new Error(`Direct write failed - bad address: ${address.toString(16)}`);
            }
        }

        // Debugging helper
        public dump(start: number = 0x0000, end: number = 0x0010): void {
            for (let i = start; i <= end; i++) {
                console.log(`Addr ${i.toString(16).padStart(4, "0")}: ${this.memory[i]}`);
            }
        }
    }
}
// Used my computer org and arch memory structure for most of the logic here.
// Same logic overall, but different implementation 
