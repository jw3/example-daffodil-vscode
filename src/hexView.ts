/*
 * Copyright 2021 Concurrent Technologies Corporation, Nteligen LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as vscode from 'vscode'
import * as daf from './daffodil'
import * as fs from 'fs'
import * as hexy from 'hexy'
import { ConfigEvent, DaffodilData } from './daffodil'

export class DebuggerHexView {
  context: vscode.ExtensionContext
  dataFile: string = ''
  hexString: string = ''
  bytePos1b: number = -1
  panel: vscode.WebviewPanel | undefined = undefined
  extensionUri: vscode.Uri = vscode.Uri.parse("")

  constructor(context: vscode.ExtensionContext) {
    context.subscriptions.push(
      vscode.debug.onDidTerminateDebugSession(
        this.onTerminatedDebugSession,
        this
      )
    )
    context.subscriptions.push(
      vscode.debug.onDidReceiveDebugSessionCustomEvent(
        this.onDebugSessionCustomEvent,
        this
      )
    )
    context.subscriptions.push(
      vscode.commands.registerCommand('hexview.display', async () => {
        await this.openHexFile()
      })
    )
    this.context = context

    
    if (vscode.workspace.workspaceFolders) {
      this.extensionUri = vscode.workspace.workspaceFolders[0].uri
    }
  }

  // Overriden onTerminatedDebugSession method
  onTerminatedDebugSession(session: vscode.DebugSession) {
    if (session.type === 'dfdl') {
      this.dataFile = ''
      this.bytePos1b = -1
      if (this.panel) {
        this.panel.dispose()
      }
    }
  }

  // Overriden onDebugSessionCustomEvent method
  onDebugSessionCustomEvent(e: vscode.DebugSessionCustomEvent) {
    if (e.session.type === 'dfdl') {
      switch (e.event) {
        case daf.configEvent:
          this.setDataFile(e.body)
          break
        case daf.dataEvent:
          this.onDisplayHex(e.session, e.body)
          break
      }
    }
  }

  // Method for extracting the data file used
  setDataFile(cfg: ConfigEvent) {
    this.dataFile = cfg.launchArgs.dataPath
  }

  // Method to open the hex string via web view
  openHexFile() {
    this.initializeWebview()
    this.updateWebview()
  }

  // Method to see hexFile is opened
  checkIfHexFileOpened() {
    return this.panel ? true : false
  }

  // Method to display the hex of the current data position sent from the debugger
  async onDisplayHex(session: vscode.DebugSession, body: DaffodilData) {
    if (!vscode.workspace.workspaceFolders) {
      return
    }

    this.bytePos1b = body.bytePos1b

    let file = fs.readFileSync(this.dataFile)
    let hex = hexy.hexy(file)
    let hexLines = hex.split('\n')

    // Format hex code to make the file look nicer
    hexLines.forEach((h) => {
      if (h) {
        let splitHex = h.split(':')
        let dataLocations = splitHex[1].split(' ')

        this.hexString += splitHex[0] + ': '
        for (var i = 1; i < dataLocations.length - 2; i++) {
          let middle = Math.floor(dataLocations[i].length / 2)
          this.hexString +=
            dataLocations[i].substr(0, middle).toUpperCase() +
            ' ' +
            dataLocations[i].substr(middle).toUpperCase() +
            ' '
        }
        this.hexString += '\t' + dataLocations[dataLocations.length - 1] + '\n'
      }
    })

    // Only update position if hex web view is opened
    if (this.checkIfHexFileOpened()) {
      this.updateWebview()
    }
  }

  // Method for retrieving the current web view, if one does exist it is created
  getWebView() {
    if(!this.panel) {
      this.panel = vscode.window.createWebviewPanel('hexView', 'Hex View', vscode.ViewColumn.Beside, this.getWebviewOptions(this.extensionUri))
      this.panel.onDidDispose(() => {
        this.panel = undefined
      }, null, this.context.subscriptions)
    }

    return this.panel
  }

  // Method for initial setup of webview
  initializeWebview() {
    let lineNum = Math.floor((this.bytePos1b - 1) / 16)
    let dataPositon = this.bytePos1b - 16 > 0 ? this.bytePos1b - lineNum * 16 : this.bytePos1b
    let panel = this.getWebView()
    panel.webview.html = this.getWebviewContent(this.hexString, lineNum, dataPositon)
  }

  // Method for updating the web view, updates the selection
  updateWebview() {
    let lineNum = Math.floor((this.bytePos1b - 1) / 16)
    let dataPositon = this.bytePos1b - 16 > 0 ? this.bytePos1b - lineNum * 16 : this.bytePos1b
    this.updateSelection(lineNum, dataPositon)
  }

  // Method for creating web view option that allow our custom script to run
  getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
    return {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.parse(this.context.asAbsolutePath("./src/scripts"))]
    }
  }
  
  // Method to set html for the hex view
  getWebviewContent(nonHtmlText, lineNum, dataPositon) {
    const scriptUri = (
      vscode.Uri.parse(this.context.asAbsolutePath("./src/scripts/hexviewHtml.js"))).with({ 'scheme': 'vscode-resource' }
    );
    const arrowIconContent = fs.readFileSync(this.context.asAbsolutePath("./images/arrow.svg"))
		const nonce = this.getNonce();

    return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content=width=device-width, initial-scale=1.0">
      <title>Hex View</title>
    </head>
    <body>
      <p id="hexHtml">""</p>
      <p id="nonHtmlHex" style="display: none;">${nonHtmlText}</p>
      <p id="arrowIcon" style="display: none;">${arrowIconContent}</p>
      <script nonce="${nonce}" src="${scriptUri}"></script>
    </body>
  </html>`
  }

  // Method to get nonce, helps with running custom script
  getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  // Method send message to custom script to update the selection of the web view
  updateSelection(lineNum, dataPositon) {
    let panel = this.getWebView()
		panel.webview.postMessage({ 'args': { 'lineNum': lineNum, 'dataPosition': dataPositon } });
	}
}
