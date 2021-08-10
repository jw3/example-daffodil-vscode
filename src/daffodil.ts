export const dataEvent = 'daffodil.data';
export interface DaffodilData {
    bytePos1b: number;
}

export const infosetEvent = 'daffodil.infoset';
export interface InfosetEvent {        
    content: string;
    
    /** Default to returning the full infoset XML, but enable other encodings like diffs in the future. */
    mimeType: 'text/xml' | string;
}

export const configEvent = 'daffodil.config';
export interface ConfigEvent {
    launchArgs: LaunchArgs,
    buildInfo: BuildInfo
}

export interface LaunchArgs {
    schemaPath: string,
    dataPath: string,
    stopOnEntry: boolean,
    infosetOutput: InfosetOutput
}

export interface InfosetOutput {
    type: string
}

export interface BuildInfo {
    version: string,
    daffodilVersion: string,
    scalaVersion: string
}



/*
{
  "launchArgs": {
    "schemaPath": "/Users/arosien/nteligen/example-daffodil-debug/src/main/resources/jpeg.dfdl.xsd",
    "dataPath": "/Users/arosien/nteligen/example-daffodil-debug/src/main/resources/works.jpg",
    "stopOnEntry": true,
    "infosetOutput": {
      "type": "console",
      "bitmap$init$0": true
    }
  },
  "buildInfo": {
    "version": "0.0.10-SNAPSHOT",
    "daffodilVersion": "3.1.0",
    "scalaVersion": "2.12.13"
  },
  "type": "daffodil.config"
}
*/