import { ViewColumn } from "vscode";

export class AdapterSettings {
    showDisassembly: 'always' | 'auto' | 'never' = 'auto';
    displayFormat: 'auto' | 'hex' | 'decimal' | 'binary' = 'auto';
    dereferencePointers: boolean = true;
    evaluationTimeout: number;
    suppressMissingSourceFiles: boolean;
    consoleMode: 'commands' | 'expressions';
    sourceLanguages: string[];
    terminalPromptClear: string[];
    evaluateForHovers: boolean;
    commandCompletions: boolean;

    constructor(showDisassembly, displayFormat, dereferencePointers: boolean = true, evaluationTimeout: number, suppressMissingSourceFiles: boolean, consoleMode, sourceLanguages: string[], terminalPromptClear: string[], evaluateForHovers: boolean, commandCompletions: boolean) {
        this.showDisassembly = showDisassembly;
        this.displayFormat = displayFormat;
        this.dereferencePointers = dereferencePointers;
        this.evaluationTimeout = evaluationTimeout;
        this.suppressMissingSourceFiles = suppressMissingSourceFiles;
        this.consoleMode = consoleMode;
        this.sourceLanguages = sourceLanguages;
        this.terminalPromptClear = terminalPromptClear;
        this.evaluateForHovers = evaluateForHovers;
        this.commandCompletions = commandCompletions;
    }
};

export interface DisplayHtmlRequest {
    title: string;
    position: ViewColumn;
    html: string;
    reveal: boolean;
}

export class Symbol {
    name: string;
    type: string;
    address: string;

    constructor(name: string, type: string, address: string) {
        this.name = name;
        this.type = type;
        this.address = address;
    }
}

export interface SymbolsRequest {
    continuationToken: object;
}

export interface SymbolsResponse {
    symbols: Symbol[];
    continuationToken: object;
}