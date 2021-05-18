import * as vscode from 'vscode'
import * as fs from 'fs';
import * as unzip from 'unzip-stream';
import * as os from 'os';
import * as child_process from 'child_process';
import { HttpClient } from 'typed-rest-client/HttpClient';

// Function for getting the da-podil debugger
export async function getDebugger() {
    let dapodilDebuggerVersion = await vscode.window.showInputBox({'prompt': "Enter in desired dapodil debugger version:"});
    const delay = ms => new Promise(res => setTimeout(res, ms));

    if(vscode.workspace.workspaceFolders !== undefined) {
        let rootPath = vscode.workspace.workspaceFolders[0].uri.path;

        // Code for downloading and setting up da-podil files
        if (!fs.existsSync(`${rootPath}/daffodil-debugger-${dapodilDebuggerVersion}`)) {
            // Get da-podil of version entered using http client
            const client = new HttpClient("clientTest");
            const dapodilUrl = `https://github.com/jw3/example-daffodil-debug/releases/download/v${dapodilDebuggerVersion}/daffodil-debugger-${dapodilDebuggerVersion}.zip`;
            const response = await client.get(dapodilUrl);
            
            if (response.message.statusCode !== 200) {
                const err: Error = new Error(`Unexpected HTTP response: ${response.message.statusCode}`);
                err["httpStatusCode"] = response.message.statusCode;
                throw err;
            }

            // Create zip from rest file
            const filePath = `${rootPath}/daffodil-debugger.zip`;
            const file = fs.createWriteStream(filePath);

            await new Promise((res, rej) => {
                file.on("error", (err) => function () { throw err });
                const stream = response.message.pipe(file);
                stream.on("close", () => {
                    try { res(filePath); } catch (err) { rej(err); }
                });
            });

            // Unzip file and remove zip file
            await new Promise ((res, rej) => { 
                let stream = fs.createReadStream(filePath).pipe(unzip.Extract({ path: `${rootPath}` }));
                stream.on("close", () => {
                    try { res(filePath); } catch (err) { rej(err); }
                });
            });
            fs.unlinkSync(filePath);
        }        

        // Run debugger based on OS
        if (os.platform() === 'win32') {
            vscode.window.showInformationMessage("win32")
        }
        else {
            // Linux/Mac stop debugger if already running and restart it bring up vscode terminal
            child_process.exec("kill -9 $(ps -ef | grep 'daffodil' | grep 'jar' | awk '{ print $2 }') || return 0") // ensure debugger server not running and
            child_process.exec(`chmod +x ${rootPath}/daffodil-debugger-${dapodilDebuggerVersion}/bin/da-podil`)     // make sure da-podil is executable
            let terminal = vscode.window.createTerminal({
                name: "da-podil",
                cwd: `${rootPath}/daffodil-debugger-${dapodilDebuggerVersion}/bin/`,
                hideFromUser: false,
                shellPath: "da-podil",
            });
            terminal.show()
        }

        // Wait for 5000 ms to make sure debugger is running before the extension tries to connect to it
        await delay(5000);
    }
}
