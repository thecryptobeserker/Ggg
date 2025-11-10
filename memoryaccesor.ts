module TSOS {
    export class MemoryAccessor {

        constructor() {

        }

        private enforceBounds(address: number): void {
            if (!_CurrentPCB) return;
            const base = _CurrentPCB.base;
            const limit = _CurrentPCB.limit;

            if (address < base || address > limit) {
                throw new Error(
                    `Memory Access Violation: ${address.toString(16)} out of bounds (${base.toString(16)}–${limit.toString(16)})`
                );
            }
        }

        // Read a byte at given address
        public read(address: number): string {
            this.vAddress(address);
            this.enforceBounds(address);
            return _Memory.readDirect(address);
        }
        // Read a byte and return numeric value (0..255)
        public readByte(address: number): number {
            const hex = this.read(address);
            return this.hexToDecimal(hex);
        }

        // Read N bytes starting at given address
        public readBlock(start: number, length: number): string[] {
            this.vAddress(start);
            this.vAddress(start + length - 1);

            let block: string[] = [];
            for (let i = 0; i < length; i++) {
                block.push(this.read(start + i));
            }
            return block;
        }


        // Write a single byte
        public write(address: number, data: string): void {
            this.vAddress(address);
            this.enforceBounds(address);
            this.vData(data);
            _Memory.writeDirect(address, data);
        }

        // Write a single numeric byte (0..255)
        public writeByte(address: number, value: number): void {
            if (!Number.isInteger(value) || value < 0 || value > 0xFF) {
                throw new Error(`MemoryAccessor.writeByte: invalid byte ${value}`);
            }
            const hex = this.decimalToHex(value);
            this.write(address, hex);
        }

        // Write multiple bytes (array of hex strings)
        public wBlock(start: number, dataBlock: string[]): void {
            this.vAddress(start);
            this.vAddress(start + dataBlock.length - 1);

            for (let i = 0; i < dataBlock.length; i++) {
                this.write(start + i, dataBlock[i]);
            }
        }


        // Convert a hex string (like "B7") to number
        public hexToDecimal(hex: string): number {
            return parseInt(hex, 16);
        }

        // Convert number to hex string (like 255 -> "FF")
        public decimalToHex(dec: number): string {
            return dec.toString(16).toUpperCase().padStart(2, "0");
        }


        private vAddress(address: number): void {
            if (address < 0 || address >= _Memory.size) {
                throw new Error(`Invalid memory address: ${address.toString(16)}`);
            }
        }

        private vData(data: string): void {
            if (!/^[0-9A-Fa-f]{1,2}$/.test(data)) {
                throw new Error(`Invalid memory data: ${data}`);
            }
        }
    }
}
// Used logic from my computer org and arch project, similar to memory class
// Overall same logic, but different implementation.
